// Management Challenges — left column: the Peace Pad radar (collapsible),
// org-instrument overlay buttons and the active-challenges session list.
import { useState } from 'react';
import StyleRadar, { DOMAIN_COLORS, hexRgba } from '../shared/StyleRadar.jsx';
import { INSTR_SCORES, INSTR_COLS, PROBLEMS } from '../../data/datasets/mgmt-challenges.js';

const CLUSTERS = [
  { color: DOMAIN_COLORS.Direct, label: 'DIRECT', styles: 'Intrinsic · Compet. · Power' },
  { color: DOMAIN_COLORS.Instrumental, label: 'INSTRUMENTAL', styles: 'Personal · Social · Entrust.' },
  { color: DOMAIN_COLORS.Relational, label: 'RELATIONAL', styles: 'Collab. · Contrib. · Vicarious' },
];

function Section({ title, desc, open, onToggle, children, headClass = '' }) {
  return (
    <div className="border-t border-border pt-2 first:border-t-0 first:pt-0">
      <button onClick={onToggle} className="flex w-full items-start justify-between gap-2 text-left" aria-expanded={open}>
        <div>
          <div className={`text-xs font-bold text-slate-100 ${headClass}`}>{title}</div>
          {desc && <div className="mt-0.5 text-[10px] text-muted">{desc}</div>}
        </div>
        <span className={`text-muted transition-transform ${open ? '' : '-rotate-90'}`} aria-hidden>▾</span>
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

export default function PeacePadPanel({ selProb, selSub, fields, parties, overlaid, instrOverlays, onToggleInstr, activeChallenges, onSelectChallenge }) {
  const [open, setOpen] = useState({ peace: true, overlay: true, active: true });
  const toggle = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  const datasets = [
    ...[...instrOverlays].map((k) => ({
      label: k,
      data: INSTR_SCORES[k],
      color: INSTR_COLS[k] || '#22d3ee',
      dash: true,
      fillOpacity: 0.05,
      strokeWidth: 2,
    })),
    ...parties.filter((p) => overlaid.has(p.id)).map((p) => ({
      label: `${p.name} (${p.instrument})`,
      data: p.scores,
      color: p.col,
      fillOpacity: 0.08,
      strokeWidth: 2,
      pointColors: Object.values(DOMAIN_COLORS).flatMap((c) => [c, c, c]),
      pointRadius: 4,
    })),
  ];

  // Problem articulation box content
  const probLines = [];
  if (selProb) {
    if (fields.desc) probLines.push(fields.desc.substring(0, 70) + (fields.desc.length > 70 ? '…' : ''));
    if (fields.outcome) probLines.push('Goal: ' + fields.outcome.split(' — ')[0]);
    if (fields.timeframe) probLines.push('Timeline: ' + fields.timeframe.split(' — ')[0]);
    if (parties.length) probLines.push('Parties: ' + parties.map((x) => x.name).join(', ').substring(0, 50));
  }

  return (
    <div className="flex flex-col gap-3 border-r border-border bg-panel/60 p-5">
      <Section
        title="The Peace Pad"
        desc="Behavioral style comparison — overlay parties to surface the gap"
        open={open.peace}
        onToggle={() => toggle('peace')}
        headClass="text-sm font-extrabold uppercase tracking-wide"
      >
        <div className="rounded-lg border border-border bg-ink p-3 shadow-inner">
          <div className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-slate-200">OASI (org) &amp; ASI (individual)</div>

          {selProb && (
            <div className="mb-2 rounded-r-md border-l-[3px] bg-panel px-3 py-2" style={{ borderLeftColor: selProb.color }}>
              <div className="text-[11px] font-bold" style={{ color: selProb.color }}>
                {selProb.name}{selSub ? ' — ' + selSub.text : ''}
              </div>
              <div className="mt-0.5 text-[10px] text-slate-300">{probLines.join(' · ') || 'Add context on the right →'}</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {selProb.instruments.map((ins) => (
                  <span
                    key={ins.n}
                    className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                    style={{
                      background: ins.l === 'primary' ? 'rgba(34,211,238,.15)' : 'rgba(59,130,246,.12)',
                      color: ins.l === 'primary' ? '#22d3ee' : '#93c5fd',
                      border: `1px solid ${ins.l === 'primary' ? 'rgba(34,211,238,.3)' : 'rgba(59,130,246,.25)'}`,
                    }}
                  >
                    {ins.n}{ins.l === 'primary' ? ' ★' : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          <StyleRadar datasets={datasets} min={1} max={7} startAngle={20} className="mx-auto w-full max-w-[340px]" />

          {/* Cluster legend */}
          <div className="mt-2 flex flex-col gap-1">
            {CLUSTERS.map((g) => (
              <div key={g.label} className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: g.color }} />
                <span className="min-w-[86px] text-[10px] font-extrabold tracking-wide" style={{ color: g.color }}>{g.label}</span>
                <span className="text-[9px] text-subtle">{g.styles}</span>
              </div>
            ))}
          </div>

          {/* Overlay legend */}
          {(instrOverlays.size > 0 || parties.some((p) => overlaid.has(p.id))) && (
            <div className="mt-2 flex flex-col gap-1 border-t border-border pt-2">
              {[...instrOverlays].map((k) => (
                <div key={k} className="flex items-center gap-1.5 text-[10px]">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: INSTR_COLS[k] }} />
                  <span className="font-mono text-[9px] font-bold" style={{ color: INSTR_COLS[k] }}>{k}</span>
                  <span className="text-[8px] text-subtle">Org overlay</span>
                </div>
              ))}
              {parties.filter((p) => overlaid.has(p.id)).map((p) => (
                <div key={p.id} className="flex items-center gap-1.5 text-[10px]">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.col, boxShadow: `0 0 0 2px ${hexRgba(p.col, 0.2)}` }} />
                  <span className="text-muted">{p.name}</span>
                  <span className="text-[9px] text-subtle">· {p.instrument}{p.role ? ' · ' + p.role : ''}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-2 border-t border-border pt-2 text-[10px] leading-snug text-subtle">
            * Gap = behavioral distance between parties. Larger gap = higher friction risk. Overlap = natural alignment.
          </div>
        </div>
      </Section>

      <Section
        title="Overlay on Peace Pad"
        desc="Project organizational instruments (OASI · A-OASI · ASI 360° · ASSET-T) onto the Peace Pad radar"
        open={open.overlay}
        onToggle={() => toggle('overlay')}
      >
        <div className="mb-1.5 text-[10px] text-muted">Organizational (select instrument):</div>
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(INSTR_SCORES).map((k) => (
            <button
              key={k}
              onClick={() => onToggleInstr(k)}
              aria-pressed={instrOverlays.has(k)}
              className={`rounded-md border px-2.5 py-1 font-mono text-[10px] font-bold transition-colors ${
                instrOverlays.has(k) ? 'bg-ink' : 'border-border text-muted hover:text-slate-200'
              }`}
              style={instrOverlays.has(k) ? { borderColor: INSTR_COLS[k], color: INSTR_COLS[k] } : undefined}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="mt-1.5 text-[9px] italic text-subtle">ASI / A-ASI — assigned on the right side per party</div>
      </Section>

      <Section
        title="Active Challenges"
        desc="Challenges currently loaded in this session — click any item to re-select it"
        open={open.active}
        onToggle={() => toggle('active')}
      >
        <div className="flex max-h-32 flex-col gap-1 overflow-y-auto">
          {activeChallenges.length === 0 ? (
            <div className="text-[10px] italic text-muted">No challenges defined yet</div>
          ) : (
            activeChallenges.map((id) => {
              const p = PROBLEMS.find((x) => x.id === id);
              if (!p) return null;
              return (
                <button
                  key={id}
                  onClick={() => onSelectChallenge(id)}
                  className={`flex w-full items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors ${
                    selProb?.id === id ? 'border-accent bg-ink text-slate-100' : 'border-border text-slate-300 hover:bg-ink'
                  }`}
                >
                  <span aria-hidden>{p.icon}</span>
                  <span className="truncate">{p.name}</span>
                </button>
              );
            })
          )}
        </div>
      </Section>
    </div>
  );
}
