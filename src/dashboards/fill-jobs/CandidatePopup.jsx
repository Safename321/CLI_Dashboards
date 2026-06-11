// Fill Jobs — candidate selector drawer: per-style tolerance filters, full
// pool table, Done commits the checked set as finalists for the dashboard.
import { useState, useMemo } from 'react';
import { STYLES, STYLE_ABBR, STYLE_POINT_COLORS } from '../shared/StyleRadar.jsx';
import { fitLabel, cellLevel } from './logic.js';

const FIT_LIGHT = {
  best: { bg: '#fef3c7', tx: '#92400e' },
  good: { bg: '#d1fae5', tx: '#065f46' },
  fair: { bg: '#e0f2fe', tx: '#0c4a6e' },
  weak: { bg: '#fee2e2', tx: '#7f1d1d' },
};
const CELL = { high: '#4a8c2a', mid: '#e67e22', base: '#64748b' };
const ABBR_COLORS = ['#639922', '#639922', '#639922', '#BA7517', '#BA7517', '#BA7517', '#7fb3d3', '#7fb3d3', '#7fb3d3'];

export default function CandidatePopup({ asset, candidates, checked, onChecked, colorMap, onDone }) {
  // tolerance per style; null = filter off (legacy {active,tol})
  const [tols, setTols] = useState(() => Array(9).fill(''));

  const visible = useMemo(
    () =>
      candidates.filter((c) =>
        tols.every((t, i) => {
          const v = parseFloat(t);
          return !(v > 0) || Math.abs(c.scores[i] - asset.scores[i]) <= v;
        }),
      ),
    [candidates, tols, asset],
  );
  const anyFilter = tols.some((t) => parseFloat(t) > 0);

  const toggle = (id) => {
    const next = new Set(checked);
    next.has(id) ? next.delete(id) : next.add(id);
    onChecked(next);
  };
  const selectAllVisible = () => onChecked(new Set([...checked, ...visible.map((c) => c.id)]));

  return (
    <div className="fixed inset-y-0 right-0 z-40 flex w-[840px] max-w-[98vw] flex-col border-l-2 border-border bg-panel shadow-2xl">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
        <div>
          <div className="font-serif text-lg font-bold text-white">Candidate Pool</div>
          <div className="mt-0.5 text-[11px] text-muted">Set tolerance filters · check candidates · Done commits finalists to dashboard</div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="rounded-full bg-ink px-3 py-1 text-xs text-accent">{checked.size} selected</span>
          <button onClick={onDone} className="rounded-md border border-accent bg-ink px-4 py-1.5 text-[13px] font-semibold text-slate-100 hover:bg-ink/60">
            Done ✓
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-6 py-2">
        {anyFilter && (
          <span className="flex-1 text-[11px] text-slate-300">
            Filtering by {tols.map((t, i) => (parseFloat(t) > 0 ? STYLES[i] : null)).filter(Boolean).join(', ')} — {visible.length} of{' '}
            {candidates.length} match
          </span>
        )}
        <button onClick={selectAllVisible} className="rounded border border-border bg-ink px-3 py-1 text-[11px] text-sky-300">Select all visible</button>
        <button onClick={() => onChecked(new Set())} className="rounded border border-border px-3 py-1 text-[11px] text-slate-300">Clear all</button>
        <button onClick={() => setTols(Array(9).fill(''))} className="rounded border border-border px-3 py-1 text-[11px] text-muted">Reset filters</button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <table className="w-full table-fixed border-collapse text-[11px]">
          <thead>
            {/* tolerance filter row */}
            <tr className="bg-ink">
              <td style={{ width: 28 }} /><td style={{ width: 150 }} /><td style={{ width: 60 }} />
              {STYLES.map((name, i) => (
                <td key={name} style={{ width: 40 }} className="px-0.5 py-1 text-center align-middle">
                  <input
                    type="number"
                    value={tols[i]}
                    min="0.5"
                    max="5"
                    step="0.5"
                    placeholder="—"
                    aria-label={`${name} tolerance filter`}
                    title="Max distance from ASSET score (blank = no filter)"
                    onChange={(e) => setTols((prev) => prev.map((t, j) => (j === i ? e.target.value : t)))}
                    className="w-[38px] border-0 border-b-2 bg-transparent px-0.5 py-0.5 text-center font-mono text-[11px] font-extrabold outline-none"
                    style={{
                      borderBottomColor: parseFloat(tols[i]) > 0 ? STYLE_POINT_COLORS[i] : '#1e2d3d',
                      color: parseFloat(tols[i]) > 0 ? STYLE_POINT_COLORS[i] : '#3a4a5a',
                    }}
                  />
                </td>
              ))}
              <td style={{ width: 38 }} />
            </tr>
            <tr>
              <th className="bg-ink" />
              <th className="bg-ink px-1 py-2 text-left font-semibold text-sky-300">Candidate</th>
              <th className="bg-ink px-1 py-2 text-center font-semibold text-sky-300">Fit</th>
              {STYLE_ABBR.map((a, i) => (
                <th key={a} className="bg-ink px-1 py-2 text-right font-semibold" style={{ color: ABBR_COLORS[i] }}>{a}</th>
              ))}
              <th className="bg-ink px-1 py-2 text-right font-semibold text-sky-300">Mean</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={13} className="p-5 text-center italic text-subtle">No candidates match filters.</td></tr>
            )}
            {visible.map((c) => {
              const fl = fitLabel(c.fit);
              const isChk = checked.has(c.id);
              const col = colorMap[c.id];
              const fc = FIT_LIGHT[fl.cls];
              return (
                <tr
                  key={c.id}
                  onClick={() => toggle(c.id)}
                  className="cursor-pointer border-b border-[#0f1a2b]"
                  style={{
                    background: c.isBest ? 'rgba(255,251,230,.07)' : isChk ? 'rgba(22,51,82,.5)' : 'transparent',
                    borderLeft: c.isBest ? '3px solid #f0d060' : isChk ? `3px solid ${col}` : '3px solid transparent',
                  }}
                >
                  <td className="px-1 py-1.5 text-center">
                    <input
                      type="checkbox"
                      checked={isChk}
                      onChange={() => toggle(c.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${c.name}`}
                      className="h-3.5 w-3.5 cursor-pointer accent-[#4a7fa5]"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-1.5" style={{ fontWeight: c.isBest ? 600 : 400, color: isChk ? col : '#cbd5e1' }}>
                      {isChk ? <span className="inline-block h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: col }} /> : <span className="w-[7px]" />}
                      {c.name}{c.isBest ? ' ★' : ''}
                    </div>
                    <div className="text-[10px] text-slate-600">{c.loc}</div>
                  </td>
                  <td className="px-1 py-1.5 text-center">
                    <span className="inline-block rounded-lg px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase" style={{ background: fc.bg, color: fc.tx }}>
                      {fl.t}
                    </span>
                  </td>
                  {c.scores.map((v, si) => {
                    const lvl = cellLevel(v, si, asset);
                    return (
                      <td key={si} className="px-1 py-1.5 text-right font-mono" style={{ color: CELL[lvl], fontWeight: lvl === 'high' ? 600 : 400 }}>
                        {v.toFixed(1)}
                      </td>
                    );
                  })}
                  <td className="px-1 py-1.5 text-right font-mono text-slate-500">{c.mean}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-2">
        <div className="text-[11px] text-slate-500">
          {anyFilter ? `${visible.length} of ${candidates.length} candidates` : `${candidates.length} candidates in pool`}
        </div>
        <div className="text-[10px] text-slate-600">
          INT=Intrinsic · COM=Competitive · PWR=Power · PRS=Personal · SOC=Social · ENT=Entrusting · COL=Collaborative · CTR=Contributory · VIC=Vicarious
        </div>
      </div>
    </div>
  );
}
