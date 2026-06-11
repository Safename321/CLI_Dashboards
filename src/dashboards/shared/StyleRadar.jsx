// Shared 9-axis Achieving Styles radar (SVG, no chart lib) used by the
// Fill Jobs and Management Challenges tools. Replaces the legacy Chart.js
// radar + custom "bandFill" canvas plugin with a dependency-free SVG render:
// - per-axis point labels colored by OASI cluster (direct/instrumental/relational)
// - optional tolerance band (outer/inner dashed rings, even-odd shaded area)
// - any number of overlay datasets (solid/dashed, custom colors, per-point colors)

export const STYLES = ['Intrinsic', 'Compet.', 'Power', 'Personal', 'Social', 'Entrust.', 'Collab.', 'Contrib.', 'Vicarious'];
export const STYLES_FULL = ['Intrinsic', 'Competitive', 'Power', 'Personal', 'Social', 'Entrusting', 'Collaborative', 'Contributory', 'Vicarious'];
export const STYLE_ABBR = ['INT', 'COM', 'PWR', 'PRS', 'SOC', 'ENT', 'COL', 'CTR', 'VIC'];
export const DOMAINS = ['Direct', 'Direct', 'Direct', 'Instrumental', 'Instrumental', 'Instrumental', 'Relational', 'Relational', 'Relational'];
// OASI cluster colors — keep exact (conventions §design tokens)
export const DOMAIN_COLORS = { Direct: '#eab308', Instrumental: '#ef4444', Relational: '#3b82f6' };
export const STYLE_POINT_COLORS = STYLES.map((_, i) => DOMAIN_COLORS[DOMAINS[i]]);

export function hexRgba(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

const N = 9;

/**
 * datasets: [{ label, data:[9], color, dash?, fillOpacity?, pointColors?:[9], pointRadius? }]
 * band: { outer:[9], inner:[9] } | null — dashed tolerance rings with shaded area between
 * startAngle: degrees clockwise from 12 o'clock for axis 0 (matches Chart.js startAngle)
 */
export default function StyleRadar({
  datasets = [],
  band = null,
  min = 1,
  max = 7,
  startAngle = 0,
  gridColor = 'rgba(100,130,160,0.2)',
  tickColor = '#8899aa',
  labelColors = STYLE_POINT_COLORS,
  bandFill = 'rgba(100,160,220,0.13)',
  bandStroke = 'rgba(100,160,220,0.35)',
  className = '',
}) {
  const vb = 320;
  const cx = vb / 2;
  const cy = vb / 2;
  const R = 116; // leaves room for the point labels
  const range = max - min || 1;

  const angle = (i) => ((startAngle + (360 / N) * i - 90) * Math.PI) / 180;
  const pt = (i, v) => {
    const r = (Math.max(min, Math.min(max, v)) - min) / range * R;
    return [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r];
  };
  const ringPath = (vals) =>
    vals.map((v, i) => pt(i, v).map((n) => n.toFixed(2)).join(',')).join(' ');

  const ticks = [];
  for (let t = min; t <= max; t += 1) ticks.push(t);

  return (
    <svg viewBox={`0 0 ${vb} ${vb}`} className={className} role="img" aria-label="Achieving Styles radar chart">
      {/* grid rings */}
      {ticks.map((t) => (
        <polygon key={`g${t}`} points={ringPath(Array(N).fill(t))} fill="none" stroke={gridColor} strokeWidth="1" />
      ))}
      {/* angle lines */}
      {STYLES.map((_, i) => {
        const [x, y] = pt(i, max);
        return <line key={`a${i}`} x1={cx} y1={cy} x2={x} y2={y} stroke={gridColor} strokeWidth="1" />;
      })}
      {/* tick labels along the vertical axis */}
      {ticks.map((t) => (
        <text key={`t${t}`} x={cx + 4} y={cy - ((t - min) / range) * R - 2} fontSize="8" fill={tickColor}>
          {t}
        </text>
      ))}

      {/* tolerance band (legacy bandFill plugin): outer + inner rings, even-odd shaded */}
      {band && (
        <g>
          <path
            d={`M ${ringPath(band.outer).replace(/ /g, ' L ')} Z M ${ringPath(band.inner).replace(/ /g, ' L ')} Z`}
            fill={bandFill}
            fillRule="evenodd"
          />
          <polygon points={ringPath(band.outer)} fill="none" stroke={bandStroke} strokeWidth="1.5" strokeDasharray="4 3" />
          <polygon points={ringPath(band.inner)} fill="none" stroke={bandStroke} strokeWidth="1.5" strokeDasharray="4 3" />
        </g>
      )}

      {/* datasets */}
      {datasets.map((d, di) => (
        <g key={d.label || di}>
          <polygon
            points={ringPath(d.data)}
            fill={d.fillOpacity ? hexRgba(d.color, d.fillOpacity) : 'none'}
            stroke={d.color}
            strokeWidth={d.strokeWidth ?? 1.8}
            strokeDasharray={d.dash ? '5 3' : undefined}
          />
          {d.data.map((v, i) => {
            const [x, y] = pt(i, v);
            return (
              <circle key={i} cx={x} cy={y} r={d.pointRadius ?? 3} fill={d.pointColors ? d.pointColors[i] : d.color}>
                <title>{`${d.label || ''}${d.label ? ': ' : ''}${STYLES[i]} ${Number(v).toFixed(1)}`}</title>
              </circle>
            );
          })}
        </g>
      ))}

      {/* point labels, cluster-colored */}
      {STYLES.map((s, i) => {
        const [x, y] = pt(i, max + range * 0.16);
        return (
          <text key={s} x={x} y={y} fontSize="10.5" fontWeight="700" fill={labelColors[i]} textAnchor="middle" dominantBaseline="central">
            {s}
          </text>
        );
      })}
    </svg>
  );
}
