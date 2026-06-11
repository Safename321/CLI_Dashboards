// Management Challenges — instrument recommendations, behavioral gap analysis
// table (first two parties), risks/goals boxes and the report options block.
import { STYLES, DOMAINS, DOMAIN_COLORS } from '../shared/StyleRadar.jsx';

const REPORT_SECTIONS = [
  { id: 'summary', label: 'Executive Summary', desc: 'Problem, parties, desired outcome' },
  { id: 'behavioral', label: 'Behavioral Gap Analysis', desc: '9-style comparison' },
  { id: 'instruments', label: 'Instrument Recommendations', desc: 'CLI assessments to deploy' },
  { id: 'risks', label: 'Risk Assessment', desc: 'Non-involved parties & org impact' },
  { id: 'playbook', label: 'Resolution Playbook', desc: 'Step-by-step intervention plan' },
  { id: 'cli', label: 'CLI Perspective', desc: 'Achieving Styles lens on this challenge' },
];

export default function AnalysisSection({ selProb, parties, reportOpts, onReportOpts, onGenerate }) {
  const p1 = parties[0];
  const p2 = parties[1];

  return (
    <div className="mt-6 flex flex-col gap-5">
      {/* Recommended instruments */}
      <div className="rounded-lg border border-border bg-panel p-4">
        <div className="mb-2 text-[13px] font-bold text-white">🎯 Recommended CLI Instruments</div>
        <div className="flex flex-col gap-1.5">
          {selProb.instruments.map((i) => (
            <div key={i.n} className="flex items-center justify-between gap-3 border-b border-border/50 pb-1.5 text-xs">
              <span className="min-w-[110px] font-bold text-brand">{i.n}</span>
              <span className="flex-1 text-muted">{i.w}</span>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${i.l === 'primary' ? 'bg-accent/15 text-accent' : 'bg-blue-500/15 text-sky-300'}`}>
                {i.l}
              </span>
            </div>
          ))}
          {parties.length > 0 && (
            <>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted">Assigned to Parties</div>
              {parties.map((pt) => {
                const match = selProb.instruments.find((x) => x.n === pt.instrument);
                return (
                  <div key={pt.id} className="flex items-center justify-between gap-3 text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-white">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: pt.col }} />
                      {pt.name}
                    </span>
                    <span className="flex-1 text-[10px] text-muted">{match ? match.w : 'Custom instrument'}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${match?.l === 'primary' ? 'bg-accent/15 text-accent' : 'bg-blue-500/15 text-sky-300'}`}>
                      {pt.instrument}
                    </span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Gap table */}
      {parties.length >= 2 && (
        <div className="rounded-lg border border-border bg-panel p-4">
          <div className="mb-2 text-[13px] font-bold text-white">Behavioral Gap Analysis</div>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-ink text-left text-[10px] font-semibold text-sky-300">
                <th className="px-2 py-1.5">Style</th>
                <th className="px-2 py-1.5">Domain</th>
                <th className="px-2 py-1.5 text-right">{p1.name}</th>
                <th className="px-2 py-1.5 text-right">{p2.name}</th>
                <th className="px-2 py-1.5 text-right">Gap</th>
                <th className="px-2 py-1.5">Friction Risk</th>
              </tr>
            </thead>
            <tbody>
              {STYLES.map((s, i) => {
                const v1 = p1.scores[i];
                const v2 = p2.scores[i];
                const gap = Math.abs(v1 - v2);
                return (
                  <tr key={s} className="border-b border-border/50">
                    <td className="px-2 py-1.5 text-slate-200">{s}</td>
                    <td className="px-2 py-1.5 text-[10px]" style={{ color: DOMAIN_COLORS[DOMAINS[i]] }}>{DOMAINS[i]}</td>
                    <td className={`px-2 py-1.5 text-right font-mono ${v1 >= 7 ? 'font-bold text-[#eab308]' : v1 >= 5 ? 'text-[#3b82f6]' : 'text-slate-300'}`}>{v1.toFixed(1)}</td>
                    <td className={`px-2 py-1.5 text-right font-mono ${v2 >= 7 ? 'font-bold text-[#eab308]' : v2 >= 5 ? 'text-[#3b82f6]' : 'text-slate-300'}`}>{v2.toFixed(1)}</td>
                    <td className={`px-2 py-1.5 text-right font-mono font-bold ${gap >= 3 ? 'text-red-400' : 'text-slate-300'}`}>{gap.toFixed(1)}</td>
                    <td className="px-2 py-1.5">
                      {gap >= 3 ? <span className="font-bold text-red-400">High</span> : gap >= 1.5 ? <span className="text-amber-400">Medium</span> : <span className="text-emerald-400">Low</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Risks / Goals */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-red-900/60 bg-red-950/30 p-3.5">
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400">⚠ Risks to Non-Involved Parties</div>
          {selProb.risks.map((r) => (
            <div key={r} className="flex gap-1.5 py-0.5 text-[11px] text-red-200"><span className="text-red-400">·</span>{r}</div>
          ))}
        </div>
        <div className="rounded-lg border border-amber-900/60 bg-amber-950/30 p-3.5">
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">🎯 Organizational Goals Impact</div>
          {selProb.goals.map((g) => (
            <div key={g} className="flex gap-1.5 py-0.5 text-[11px] text-amber-200"><span className="text-amber-400">·</span>{g}</div>
          ))}
        </div>
      </div>

      {/* Report options */}
      <div className="rounded-lg border border-border bg-panel p-4">
        <div className="mb-2.5 text-[13px] font-bold text-white">Generate Resolution Report</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {REPORT_SECTIONS.map((s) => (
            <label key={s.id} className="flex cursor-pointer items-start gap-2 rounded-md border border-border bg-ink px-3 py-2">
              <input
                type="checkbox"
                checked={!!reportOpts[s.id]}
                onChange={(e) => onReportOpts((o) => ({ ...o, [s.id]: e.target.checked }))}
                className="mt-0.5 accent-cyan-400"
              />
              <span className="text-[11px] leading-snug text-muted">
                <strong className="block text-slate-100">{s.label}</strong>
                {s.desc}
              </span>
            </label>
          ))}
        </div>
        <button onClick={onGenerate} className="mt-3 w-full rounded-md bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500">
          📄 Generate Resolution Report — Downloads as HTML
        </button>
      </div>
    </div>
  );
}
