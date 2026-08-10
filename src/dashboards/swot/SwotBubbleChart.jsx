// SWOT Materiality-Bubble — SVG renderer (spec §2, §4, §5, §9, §10).
// Three channels per factor: AREA = materiality, COLOR = quadrant ramp
// (+ relational sub-ramp), FILL = firm (solid) vs inferred (45° hatch).
// The legend + standing caveat render INSIDE the SVG so every export carries
// them (§5, §10 — never left to verbal delivery).
import { useMemo } from 'react';
import { rankFactors, classifyEvidence } from './logic.js';
import { SWOT_COLORS, QUADRANT_META } from '../../data/datasets/swot.js';

const VB_W = 680;
const VB_H = 620;
const CHART_H = 470;          // quadrant field; legend strip below
const MAX_RADIUS = 56;
const PAD = 10;               // bubble padding inside a quadrant
// axis-label gutters (2026-08 request: label the 2×2 axes). The chart field is
// shifted right/down by these so the Internal/External (rows) and Helpful/Harmful
// (columns) dimension labels sit in the margins and export with the SVG.
const AX_L = 22;
const AX_T = 20;

const QUADRANT_POS = {
  strength:    { x: 0,        y: 0,           w: VB_W / 2, h: CHART_H / 2 },
  weakness:    { x: VB_W / 2, y: 0,           w: VB_W / 2, h: CHART_H / 2 },
  opportunity: { x: 0,        y: CHART_H / 2, w: VB_W / 2, h: CHART_H / 2 },
  threat:      { x: VB_W / 2, y: CHART_H / 2, w: VB_W / 2, h: CHART_H / 2 },
};

// Readable label color for a given fill (relative luminance).
function textColorFor(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) > 0.45 ? '#0f172a' : '#f1f5f9';
}

function lerpColor(hexA, hexB, t) {
  const a = [1, 3, 5].map((i) => parseInt(hexA.slice(i, i + 2), 16));
  const b = [1, 3, 5].map((i) => parseInt(hexB.slice(i, i + 2), 16));
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * Math.max(0, Math.min(1, t))));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

// §2.2 — one ramp per quadrant, interpolated by relative materiality;
// relational-set root causes in Weaknesses use the distinct orange sub-ramp.
function bubbleColor(f, maxM) {
  const ramp = SWOT_COLORS[f.quadrant] ?? SWOT_COLORS.threat;
  const t = 0.35 + 0.65 * (f.materiality / maxM);
  if (f.quadrant === 'weakness' && f.achievingStylesSet === 'relational') {
    return lerpColor(ramp.relational, ramp.dark, t * 0.6);
  }
  return lerpColor(ramp.light, ramp.dark, t);
}

// Deterministic in-quadrant layout: seed slots by materiality rank, then relax
// overlaps (§9 collision avoidance — nudge within the quadrant, never across).
function layoutQuadrant(factors, quad) {
  const { x, y, w, h } = quad;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const seeds = [
    [0, 0], [-0.55, -0.4], [0.55, 0.4], [0.55, -0.45], [-0.55, 0.45],
    [0, -0.62], [0, 0.62], [-0.75, 0], [0.75, 0],
  ];
  const placed = factors.map((f, i) => {
    const [sx, sy] = seeds[i % seeds.length];
    return { ...f, cx: cx + sx * (w / 2 - f.radius - PAD), cy: cy + sy * (h / 2 - f.radius - PAD) };
  });

  for (let iter = 0; iter < 80; iter++) {
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i];
        const b = placed[j];
        const dx = b.cx - a.cx;
        const dy = b.cy - a.cy;
        const dist = Math.hypot(dx, dy) || 0.01;
        const minDist = a.radius + b.radius + 6;
        if (dist < minDist) {
          const push = (minDist - dist) / 2;
          const ux = dx / dist;
          const uy = dy / dist;
          a.cx -= ux * push; a.cy -= uy * push;
          b.cx += ux * push; b.cy += uy * push;
        }
      }
      const f = placed[i];
      f.cx = Math.max(x + f.radius + PAD, Math.min(x + w - f.radius - PAD, f.cx));
      f.cy = Math.max(y + f.radius + PAD + 14, Math.min(y + h - f.radius - PAD, f.cy));
    }
  }
  return placed;
}

// Curved arrow between two bubble edges (§4).
function arrowPath(a, b) {
  const dx = b.cx - a.cx;
  const dy = b.cy - a.cy;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  const sx = a.cx + ux * (a.radius + 3);
  const sy = a.cy + uy * (a.radius + 3);
  const ex = b.cx - ux * (b.radius + 9);
  const ey = b.cy - uy * (b.radius + 9);
  const mx = (sx + ex) / 2 - uy * 22;   // bow the curve perpendicular
  const my = (sy + ey) / 2 + ux * 22;
  return { d: `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`, mx, my };
}

export default function SwotBubbleChart({
  factors,
  arrows = [],
  showArrows = true,
  showLegend = true,
  onFactorClick,
  onFactorHover,
  highlightId = null,
  className = '',
}) {
  const { placed, byId, maxM } = useMemo(() => {
    const ranked = rankFactors(factors, MAX_RADIUS);
    const max = ranked[0]?.materiality ?? 1;
    const out = [];
    for (const quadrant of Object.keys(QUADRANT_POS)) {
      const qf = ranked.filter((f) => f.quadrant === quadrant);
      out.push(...layoutQuadrant(qf, QUADRANT_POS[quadrant]));
    }
    return { placed: out, byId: Object.fromEntries(out.map((f) => [f.id, f])), maxM: max };
  }, [factors]);

  const legendY = CHART_H + 16;

  return (
    <svg
      viewBox={`0 0 ${VB_W + AX_L} ${VB_H + AX_T}`}
      className={className}
      role="img"
      aria-label="Materiality-bubble SWOT chart. Columns: helpful (left) to harmful (right). Rows: internal/measured (top) to external/inferred (bottom)."
    >
      <defs>
        {/* §2.3 — inferred readings hatch (verbatim from the spec) */}
        <pattern id="inferred-hatch" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke="currentColor" strokeWidth="1.4" opacity="0.35" />
        </pattern>
        <marker id="swot-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
        </marker>
      </defs>

      {/* 2×2 axis labels — columns = helpful→harmful, rows = internal→external.
          Drawn in the outer gutters, before the field is translated into place. */}
      <g fill="#8899aa" fontSize="8.5" fontWeight="700" letterSpacing="1.2" style={{ textTransform: 'uppercase' }}>
        <text x={AX_L + VB_W * 0.25} y={13} textAnchor="middle">Helpful</text>
        <text x={AX_L + VB_W * 0.75} y={13} textAnchor="middle">Harmful</text>
        <text transform={`translate(13 ${AX_T + CHART_H * 0.25}) rotate(-90)`} textAnchor="middle">Internal · measured</text>
        <text transform={`translate(13 ${AX_T + CHART_H * 0.75}) rotate(-90)`} textAnchor="middle">External · inferred</text>
      </g>

      <g transform={`translate(${AX_L} ${AX_T})`}>
      {/* quadrant dividers (§9: 0.5px, low opacity) */}
      <line x1={VB_W / 2} y1="0" x2={VB_W / 2} y2={CHART_H} stroke="#64748b" strokeWidth="0.5" opacity="0.4" />
      <line x1="0" y1={CHART_H / 2} x2={VB_W} y2={CHART_H / 2} stroke="#64748b" strokeWidth="0.5" opacity="0.4" />
      <rect x="0.5" y="0.5" width={VB_W - 1} height={CHART_H - 1} fill="none" stroke="#64748b" strokeWidth="0.5" opacity="0.3" />

      {/* quadrant labels */}
      {Object.entries(QUADRANT_POS).map(([q, pos]) => (
        <g key={q}>
          <text x={pos.x + 10} y={pos.y + 16} fontSize="11" fontWeight="700" letterSpacing="1.5"
            fill={SWOT_COLORS[q].dark} style={{ textTransform: 'uppercase' }}>
            {QUADRANT_META[q].title.toUpperCase()}
          </text>
          <text x={pos.x + 10} y={pos.y + 28} fontSize="8" fill="#8899aa">
            {QUADRANT_META[q].sub}
          </text>
        </g>
      ))}

      {/* causal arrows under the bubbles (§4 — sparse, central claims only) */}
      {showArrows && arrows.map((a, i) => {
        const from = byId[a.from];
        const to = byId[a.to];
        if (!from || !to) return null;
        const { d, mx, my } = arrowPath(from, to);
        return (
          <g key={`arr-${i}`}>
            <path d={d} fill="none" stroke="#94a3b8" strokeWidth="1.6"
              strokeDasharray={a.kind === 'downstream' ? '5 4' : 'none'}
              markerEnd="url(#swot-arrow)" opacity="0.85" />
            {a.label && (
              <text x={mx} y={my - 4} fontSize="8.5" fontStyle="italic" fill="#94a3b8" textAnchor="middle">
                {a.label}
              </text>
            )}
          </g>
        );
      })}

      {/* bubbles — drawn large-to-small so small neighbors (and their labels)
          stay visible and clickable on top */}
      {placed.map((f) => {
        const color = bubbleColor(f, maxM);
        const inferred = classifyEvidence(f) === 'inferred';
        const dim = highlightId && highlightId !== f.id;
        const labelInside = f.radius > 30;
        const inkOn = textColorFor(color);
        // keep labels inside the viewBox even for edge-hugging bubbles
        const lx = Math.max(48, Math.min(VB_W - 48, f.cx));
        return (
          <g
            key={f.id}
            opacity={dim ? 0.35 : 1}
            style={{ cursor: onFactorClick ? 'pointer' : 'default' }}
            onClick={() => onFactorClick?.(f)}
            onMouseEnter={(e) => onFactorHover?.(f, e)}
            onMouseLeave={(e) => onFactorHover?.(null, e)}
          >
            <circle cx={f.cx} cy={f.cy} r={f.radius} fill={color}
              fillOpacity={inferred ? 0.5 : 0.85}
              stroke={color} strokeWidth="1.5" />
            {inferred && (
              <circle cx={f.cx} cy={f.cy} r={f.radius} fill="url(#inferred-hatch)"
                stroke="none" color={color} />
            )}
            <text x={labelInside ? lx : f.cx} y={labelInside ? f.cy - 2 : f.cy + f.radius + 11}
              fontSize={labelInside ? 11 : 9.5} fontWeight="700" textAnchor="middle"
              fill={labelInside ? inkOn : '#cbd5e1'}
              paintOrder="stroke" stroke={labelInside && inkOn === '#0f172a' ? 'none' : '#0b1220'} strokeWidth="2.5" strokeLinejoin="round">
              {f.label}
            </text>
            {f.asiScore != null && (
              <text x={labelInside ? lx : f.cx} y={labelInside ? f.cy + 11 : f.cy + f.radius + 21}
                fontSize="8.5" textAnchor="middle"
                fill={labelInside ? inkOn : '#8899aa'} opacity={labelInside ? 0.85 : 1}>
                {f.asiScore.toFixed(2)}{f.overReliance ? ' ▲over' : ''}
              </text>
            )}
          </g>
        );
      })}

      {/* §5 mandatory legend + §10 standing caveat — inside the SVG */}
      {showLegend && (
        <g>
          <line x1="0" y1={CHART_H + 6} x2={VB_W} y2={CHART_H + 6} stroke="#64748b" strokeWidth="0.5" opacity="0.3" />

          {/* row 1: channels */}
          <circle cx={14} cy={legendY + 4} r={7} fill="#64748b" fillOpacity="0.7" />
          <circle cx={30} cy={legendY + 4} r={4} fill="#64748b" fillOpacity="0.7" />
          <text x={42} y={legendY + 7} fontSize="9" fill="#cbd5e1">bubble area = strategic materiality</text>

          <circle cx={218} cy={legendY + 4} r={6} fill="#64748b" fillOpacity="0.85" />
          <text x={230} y={legendY + 7} fontSize="9" fill="#cbd5e1">solid = firm ASI score</text>
          <circle cx={342} cy={legendY + 4} r={6} fill="#64748b" fillOpacity="0.4" color="#94a3b8" />
          <circle cx={342} cy={legendY + 4} r={6} fill="url(#inferred-hatch)" color="#e2e8f0" />
          <text x={354} y={legendY + 7} fontSize="9" fill="#cbd5e1">striped = inferred reading</text>

          <path d={`M 476 ${legendY + 4} h 22`} stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#swot-arrow)" />
          <text x={504} y={legendY + 7} fontSize="9" fill="#cbd5e1">gates / downstream</text>

          {/* row 2: quadrant + relational sub-ramp color key */}
          {[
            ['Strengths', SWOT_COLORS.strength.dark],
            ['Weaknesses', SWOT_COLORS.weakness.dark],
            ['Relational root cause', SWOT_COLORS.weakness.relational],
            ['Opportunities', SWOT_COLORS.opportunity.dark],
            ['Threats', SWOT_COLORS.threat.dark],
          ].map(([label, color], i) => (
            <g key={label}>
              <rect x={10 + i * 134} y={legendY + 18} width="9" height="9" rx="2" fill={color} />
              <text x={23 + i * 134} y={legendY + 26} fontSize="8.5" fill="#cbd5e1">{label}</text>
            </g>
          ))}

          {/* §10 standing caveat */}
          <text x="10" y={legendY + 46} fontSize="8.5" fill="#94a3b8" fontStyle="italic">
            Size encodes materiality (how much the factor moves the strategy) — NOT goodness: a big bubble is
          </text>
          <text x="10" y={legendY + 58} fontSize="8.5" fill="#94a3b8" fontStyle="italic">
            often a bigger problem, and a big striped bubble is a high-stakes hypothesis. Fill encodes confidence
          </text>
          <text x="10" y={legendY + 70} fontSize="8.5" fill="#94a3b8" fontStyle="italic">
            (firm ASI score vs inferred reading) — not consequence.
          </text>
        </g>
      )}
      </g>
    </svg>
  );
}
