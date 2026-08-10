// Fill Jobs — right panel: position style requirements (ranked score chips),
// channel tolerance key and the candidate pool table with fit/r² ranking.
import { useMemo, useState } from 'react';
import { STYLES, STYLE_ABBR, STYLES_FULL } from '../shared/StyleRadar.jsx';
import { BAND_KEY } from '../../data/datasets/fill-jobs.js';
import { fitLabel, cellLevel } from './logic.js';

const FIT_BADGE = {
  best: 'bg-green-400/15 text-green-400',
  good: 'bg-cyan-400/15 text-cyan-300',
  fair: 'bg-blue-500/20 text-sky-300',
  weak: 'bg-red-500/15 text-red-400',
};
const CELL_COLOR = { high: '#4ade80', mid: '#3b82f6', base: '#cbd5e1' };

// Sortable candidate-pool columns. `dir` is the direction the FIRST click sorts
// (fit ascends — lower is a better match; scores/r²/mean descend — higher first).
// `get` pulls the sort key from a candidate row.
const POOL_COLUMNS = [
  { key: 'name', label: 'Candidate', align: 'left', dir: 'asc', type: 'str', get: (c) => (c.name || '').toLowerCase() },
  { key: 'fit', label: 'FIT', align: 'center', dir: 'asc', type: 'num', get: (c) => c.fit },
  { key: 'r2', label: 'r²', align: 'center', dir: 'desc', type: 'num', title: 'R-squared: candidate vs job profile', get: (c) => parseFloat(c.r2) || 0 },
  ...STYLE_ABBR.map((a, i) => ({ key: `s${i}`, label: a, align: 'right', dir: 'desc', type: 'num', title: STYLES_FULL[i], get: (c) => c.scores?.[i] ?? 0 })),
  { key: 'mean', label: 'Mean', align: 'right', dir: 'desc', type: 'num', get: (c) => parseFloat(c.mean) || 0 },
];
const ALIGN_CLS = { left: 'text-left', center: 'text-center', right: 'text-right' };
const JUSTIFY_CLS = { left: 'justify-start', center: 'justify-center', right: 'justify-end' };

// Ranked score chips — also reused by the job display area in JobIntake.
export function ScoresGrid({ scores }) {
  const ranked = scores.map((s, i) => ({ s, i })).sort((a, b) => b.s - a.s);
  const rankBorder = ['border-l-[3px] border-l-[#eab308]', 'border-l-[3px] border-l-[#ef4444]', 'border-l-[3px] border-l-[#3b82f6]'];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {ranked.map(({ s, i }, ri) => (
        <div
          key={STYLES[i]}
          className={`flex items-center justify-between rounded-lg border border-border bg-ink px-2.5 py-2 shadow-inner ${rankBorder[ri] || ''}`}
        >
          <span className="text-xs font-medium text-slate-300">{STYLES[i]}</span>
          <span className={`font-mono text-[13px] ${s >= 7.5 ? 'text-[#eab308]' : s >= 6 ? 'text-[#3b82f6]' : 'text-slate-200'}`}>
            {s.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RightPanel({ asset, pool, dashChecked, onToggle, colorMap }) {
  const bestId = pool.reduce((acc, c) => (acc === null || c.fit < acc.fit ? c : acc), null)?.id;

  // Click a column header to sort by it; click again to flip direction.
  // Default (sort.key === null) keeps the incoming fit ranking.
  const [sort, setSort] = useState({ key: null, dir: 'asc' });
  const onSort = (key, defDir) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: defDir }));

  const rows = useMemo(() => {
    if (!sort.key) return pool;
    const col = POOL_COLUMNS.find((c) => c.key === sort.key);
    if (!col) return pool;
    const out = [...pool].sort((a, b) => {
      const av = col.get(a);
      const bv = col.get(b);
      const cmp = col.type === 'str' ? String(av).localeCompare(String(bv)) : av - bv;
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return out;
  }, [pool, sort]);

  return (
    <div className="overflow-y-auto bg-ink p-6">
      <h2 className="mb-2 text-2xl font-bold uppercase tracking-wide text-white">Position style requirements</h2>
      <ScoresGrid scores={asset.scores} />

      {/* Channel tolerance key */}
      <div className="mb-5 mt-5 rounded-lg border border-border bg-panel px-4 py-3">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-accent">Channel tolerance key</div>
        {BAND_KEY.map((b) => (
          <div key={b.range} className="mb-1 flex items-center gap-2.5 text-xs">
            <span className="min-w-[72px] font-mono text-[11px] font-semibold" style={{ color: b.color }}>{b.range}</span>
            <span className="text-muted">{b.desc}</span>
          </div>
        ))}
      </div>

      <h3 className="text-sm font-bold uppercase tracking-wide text-white">Candidate Pool</h3>
      <p className="mb-3 text-xs text-muted">
        Check a candidate to overlay their ASI profile · Best-fit highlighted · Use popup to select finalists first
      </p>
      <div className="mb-3 rounded-md border border-border bg-panel px-3 py-2 text-xs text-slate-300">
        ✓ Click a row or checkbox to overlay · Use <strong>+ Add Candidate</strong> above to select finalists from the full pool
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-panel text-left text-[11px] font-semibold text-sky-300">
              <th className="w-8 px-2 py-2" aria-label="Overlay" />
              {POOL_COLUMNS.map((col) => {
                const active = sort.key === col.key;
                return (
                  <th
                    key={col.key}
                    className={`px-2 py-2 ${ALIGN_CLS[col.align]}`}
                    title={col.title}
                    aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    <button
                      type="button"
                      onClick={() => onSort(col.key, col.dir)}
                      className={`flex w-full items-center gap-1 ${JUSTIFY_CLS[col.align]} hover:text-white ${active ? 'text-white' : ''}`}
                    >
                      <span>{col.label}</span>
                      <span className="text-[9px] opacity-70" aria-hidden="true">{active ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}</span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const fl = fitLabel(c.fit);
              const isChk = dashChecked.has(c.id);
              const isBest = c.id === bestId;
              return (
                <tr
                  key={c.id}
                  onClick={() => onToggle(c.id)}
                  className={`cursor-pointer border-b border-border transition-colors hover:bg-panel ${
                    isBest ? 'border-l-[3px] border-l-green-400 bg-green-400/5' : isChk ? 'bg-blue-500/10' : ''
                  }`}
                >
                  <td className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={isChk}
                      onChange={() => onToggle(c.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Overlay ${c.name}`}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1.5 font-semibold text-white">
                      {isChk && <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: colorMap[c.id] }} />}
                      {c.name}{isBest ? ' ★' : ''}
                    </div>
                    <div className="text-[11px] text-muted">{c.loc}</div>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${FIT_BADGE[fl.cls]}`}>{fl.t}</span>
                  </td>
                  <td
                    className="px-2 py-2 text-center font-mono font-bold"
                    style={{ color: parseFloat(c.r2) >= 0.85 ? '#4ade80' : parseFloat(c.r2) >= 0.65 ? '#93c5fd' : '#7fb3d3' }}
                  >
                    {c.r2}
                  </td>
                  {c.scores.map((v, si) => (
                    <td
                      key={si}
                      className={`px-2 py-2 text-right font-mono ${cellLevel(v, si, asset) === 'high' ? 'font-bold' : ''}`}
                      style={{ color: CELL_COLOR[cellLevel(v, si, asset)] }}
                    >
                      {v.toFixed(1)}
                    </td>
                  ))}
                  <td className="px-2 py-2 text-right font-mono text-slate-300">{c.mean}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-2.5 text-[11px] text-muted">
        INT=Intrinsic · COM=Competitive · PWR=Power · PRS=Personal · SOC=Social · ENT=Entrusting · COL=Collaborative · CTR=Contributory · VIC=Vicarious
      </div>
    </div>
  );
}
