// Pivotable Behavioral × Outcome matrix. User can swap which dimension is
// rows vs columns, and what the cell colors mean. Click a cell for detail.
import { useState } from 'react';
import {
  BEHAVIORAL_RELATIONSHIPS, TIER_META, DRIVER_NAMES, OUTCOME_NAMES,
} from '../../data/datasets/causal.js';
import StarRating from './StarRating.jsx';

// Effect-size / sample-size / direction color mappers for the color-by modes.
const effectColor = (coef) => {
  const a = Math.abs(coef);
  if (a >= 0.55) return { color: '#10b981', bg: 'rgba(16,185,129,0.18)', label: 'Strong' };
  if (a >= 0.40) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'Moderate' };
  return { color: '#94a3b8', bg: 'rgba(148,163,184,0.10)', label: 'Weak' };
};
const sizeColor = (n) => {
  if (n >= 500) return { color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', label: 'Large n' };
  if (n >= 20) return { color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', label: 'Medium n' };
  return { color: '#94a3b8', bg: 'rgba(148,163,184,0.10)', label: 'Small n' };
};
const dirColor = (coef) => (coef >= 0
  ? { color: '#10b981', bg: 'rgba(16,185,129,0.15)', label: '+' }
  : { color: '#f87171', bg: 'rgba(248,113,113,0.15)', label: '−' });

const SELECT_CLS = 'rounded border border-border bg-ink px-2 py-1 text-white';

export default function BehavioralMatrix({ onSelect }) {
  const [rowAxis, setRowAxis] = useState('drivers');
  const [colAxis, setColAxis] = useState('outcomes');
  const [colorBy, setColorBy] = useState('tier');

  const axisLabels = (axis) => (axis === 'drivers' ? DRIVER_NAMES : OUTCOME_NAMES);
  const rowLabels = axisLabels(rowAxis);
  const colLabels = axisLabels(colAxis);

  // Look up the relationship for a given (row, col) under the current pivot.
  const cellFor = (rowLabel, colLabel) => BEHAVIORAL_RELATIONSHIPS.find((r) => {
    if (rowAxis === 'drivers' && colAxis === 'outcomes') return r.from === rowLabel && r.to === colLabel;
    if (rowAxis === 'outcomes' && colAxis === 'drivers') return r.to === rowLabel && r.from === colLabel;
    if (rowAxis === colAxis && rowAxis === 'drivers') return r.from === rowLabel && r.from === colLabel;
    if (rowAxis === colAxis && rowAxis === 'outcomes') return r.to === rowLabel && r.to === colLabel;
    return false;
  });

  const getCellMeta = (rel) => {
    if (!rel) return null;
    if (colorBy === 'effect') return effectColor(rel.coef);
    if (colorBy === 'size') return sizeColor(rel.n);
    if (colorBy === 'dir') return dirColor(rel.coef);
    return TIER_META[rel.tier];
  };

  return (
    <div>
      {/* Pivot controls */}
      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
        <label className="flex items-center gap-1.5">
          <span className="text-subtle">Rows:</span>
          <select value={rowAxis} onChange={(e) => setRowAxis(e.target.value)} className={SELECT_CLS}>
            <option value="drivers">Drivers (behavioral)</option>
            <option value="outcomes">Outcomes (business)</option>
          </select>
        </label>
        <label className="flex items-center gap-1.5">
          <span className="text-subtle">Columns:</span>
          <select value={colAxis} onChange={(e) => setColAxis(e.target.value)} className={SELECT_CLS}>
            <option value="outcomes">Outcomes (business)</option>
            <option value="drivers">Drivers (behavioral)</option>
          </select>
        </label>
        <label className="flex items-center gap-1.5">
          <span className="text-subtle">Color by:</span>
          <select value={colorBy} onChange={(e) => setColorBy(e.target.value)} className={SELECT_CLS}>
            <option value="tier">Evidence tier</option>
            <option value="effect">Effect size</option>
            <option value="dir">Direction (+/−)</option>
            <option value="size">Sample size</option>
          </select>
        </label>
        <span className="ml-auto text-subtle">
          {BEHAVIORAL_RELATIONSHIPS.length} of {rowLabels.length * colLabels.length} cells measured
        </span>
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full border-separate" style={{ borderSpacing: '3px' }}>
          <thead>
            <tr>
              <th className="pb-1 pr-2 text-left text-xs font-semibold text-subtle" style={{ minWidth: 150 }} />
              {colLabels.map((c, i) => (
                <th key={`h${i}`} className="px-1 pb-1 align-bottom text-xs font-semibold text-slate-300" style={{ minWidth: 110, maxWidth: 130 }}>
                  <div className="leading-tight">{c}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowLabels.map((rLabel, ri) => (
              <tr key={`r${ri}`}>
                <td className="pr-2 align-middle text-xs font-semibold leading-tight text-slate-300">{rLabel}</td>
                {colLabels.map((cLabel, ci) => {
                  const rel = cellFor(rLabel, cLabel);
                  if (!rel) {
                    return (
                      <td
                        key={`c${ci}`}
                        style={{
                          background: 'repeating-linear-gradient(45deg, rgba(71,85,105,0.08), rgba(71,85,105,0.08) 4px, transparent 4px, transparent 8px)',
                          border: '1px solid rgba(71,85,105,0.2)',
                          borderRadius: 6,
                          height: 90,
                          textAlign: 'center',
                          color: '#475569',
                          fontSize: 18,
                        }}
                      >—</td>
                    );
                  }
                  const meta = getCellMeta(rel);
                  return (
                    <td
                      key={`c${ci}`}
                      onClick={() => onSelect(rel)}
                      title={`${rel.from} → ${rel.to} · click for detail`}
                      className="cursor-pointer align-top transition-transform hover:scale-[1.02]"
                      style={{
                        background: meta.bg,
                        border: `1px solid ${meta.color}66`,
                        borderRadius: 6,
                        padding: '6px 8px',
                      }}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span style={{ color: meta.color, fontSize: 11, fontWeight: 700 }}>{meta.label || ''}</span>
                        <StarRating n={rel.stars} />
                      </div>
                      <div className="font-mono text-[13px] font-bold text-white">
                        {rel.coef >= 0 ? '+' : ''}{rel.coef}
                      </div>
                      <div className="font-mono text-[9px] text-muted">[{rel.ci[0]}, {rel.ci[1]}]</div>
                      <div className="mt-0.5 text-[9px] text-slate-300">n={rel.n}</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-xs text-subtle">
        Click any cell for methodology, sample, effect size in dollars, and caveats. Empty cells = unmeasured (open research questions).
      </div>
    </div>
  );
}
