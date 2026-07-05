// OASI (org level) — what the organization actually rewards vs what it says it values.
// Ported from legacy OrgOASIDashboard (App.jsx ~5828-6022). View id: org-oasi.
import { useMemo, useState } from 'react';
import DashboardShell from '../components/DashboardShell.jsx';
import { OASIRadarChart } from '../components/OASIRadar.jsx';
import { useOrgOasiBundle } from '../lib/liveData.js';
import {
  ORG_OASI_SCORES,
  OASI_GAP_ANALYSIS,
  OASI_KEY_FINDINGS,
  OASI_INSTRUMENT_DATA,
} from '../data/datasets/oasi-scores.js';

// Static demo scores only ship in the public demo build; a real tenant sees live
// OASI data or an explicit instruction — never fabricated S&P numbers.
const DEMO_BUILD = import.meta.env.VITE_AUTH_DISABLED === 'true';

// Shared empty/loading/error panel for both OASI views when a real tenant has no data.
export function OasiEmptyState({ status, title, icon }) {
  const body = status === 'loading'
    ? <p className="text-sm text-muted">Loading your organization's OASI data…</p>
    : status === 'error'
      ? <>
          <p className="text-sm font-semibold text-red-400">Couldn't load your organization's OASI data.</p>
          <p className="mt-2 text-sm text-muted">Your session may have expired or the backend is unreachable — refresh and sign in again.</p>
        </>
      : <>
          <p className="text-sm font-semibold text-amber-400">No OASI scores synced yet.</p>
          <p className="mt-2 text-sm text-muted">The OASI radar aggregates real employee assessment scores. To populate it:</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-300">
            <li>Open <span className="font-semibold text-white">Assign CLI Instruments</span> and send the OASI instrument to employees.</li>
            <li>They complete it via the emailed magic link.</li>
            <li>Scores sync back automatically and this radar populates.</li>
          </ol>
        </>;
  return (
    <DashboardShell title={title} icon={icon} subtitle="Achieving Styles Inventory — what your organization actually rewards">
      <div className="mx-auto mt-10 max-w-xl rounded-xl border border-border bg-panel p-8">{body}</div>
    </DashboardShell>
  );
}

const OASI_STYLE_KEYS = [
  'intrinsic', 'competitive', 'power', 'personal', 'social',
  'entrusting', 'collaborative', 'contributory', 'vicarious',
];

// Normalise the live /dashboard/org-oasi result into the {style: score} shape the
// views/radar expect. The endpoint returns { status, scale, scores:{...}, recordCount }
// and useOrgOasi() returns that wrapper (j.data ?? j); some callers/tests may also hand
// back the bare scores object. Returns null when there is no usable live data so the
// caller falls back to the static demo scores (keeps unseeded tenants rendering).
export function liveOasiScores(live) {
  if (!live) return null;
  const scores = live.scores ?? live;
  if (!scores || typeof scores !== 'object') return null;
  const total = OASI_STYLE_KEYS.reduce((a, k) => a + (Number(scores[k]) || 0), 0);
  if (total <= 0) return null; // all-zero (empty tenant) → use fallback
  return OASI_STYLE_KEYS.reduce((o, k) => ({ ...o, [k]: Number(scores[k]) || 0 }), {});
}

const CLUSTER_COLORS = { direct: '#eab308', instrumental: '#ef4444', relational: '#3b82f6' };

const STYLE_BARS = [
  { style: 'Competitive', key: 'competitive', set: 'direct' },
  { style: 'Power', key: 'power', set: 'direct' },
  { style: 'Intrinsic', key: 'intrinsic', set: 'direct' },
  { style: 'Personal', key: 'personal', set: 'instrumental' },
  { style: 'Social', key: 'social', set: 'instrumental' },
  { style: 'Entrusting', key: 'entrusting', set: 'instrumental' },
  { style: 'Collaborative', key: 'collaborative', set: 'relational' },
  { style: 'Contributory', key: 'contributory', set: 'relational' },
  { style: 'Vicarious', key: 'vicarious', set: 'relational' },
];

const GAP_TASKS = [
  { label: 'Promotion Criteria Audit', deliverable: 'Audit Report' },
  { label: 'Recognition Program Redesign', deliverable: 'Program Design' },
  { label: 'Manager Training', deliverable: 'Training Curriculum' },
];

const FINDING_TONES = {
  red: { card: 'bg-red-900/20 border-red-500/30', title: 'text-red-400' },
  amber: { card: 'bg-amber-900/20 border-amber-500/30', title: 'text-amber-400' },
  emerald: { card: 'bg-emerald-900/20 border-emerald-500/30', title: 'text-emerald-400' },
};

export default function OrgOASIDashboard() {
  const [activeTab, setActiveTab] = useState('current');
  // Live cli_v5 org-OASI aggregate. Demo build → static demo scores; real tenant →
  // live scores, or an instruction panel (never fabricated demo numbers).
  const bundle = useOrgOasiBundle(!DEMO_BUILD);
  const liveScores = DEMO_BUILD ? ORG_OASI_SCORES : liveOasiScores(bundle.data);
  const scores = liveScores ?? ORG_OASI_SCORES; // shape only; instruction returned below when empty

  const { setMeans, stdDev, min, max, gapRows } = useMemo(() => {
    const vals = Object.values(scores);
    const m = vals.reduce((a, b) => a + b, 0) / 9;
    return {
      mean: m,
      setMeans: [
        { label: 'Direct Set Mean', value: ((scores.intrinsic + scores.competitive + scores.power) / 3).toFixed(2), color: 'text-yellow-400' },
        { label: 'Instrumental Set Mean', value: ((scores.personal + scores.social + scores.entrusting) / 3).toFixed(2), color: 'text-red-400' },
        { label: 'Relational Set Mean', value: ((scores.collaborative + scores.contributory + scores.vicarious) / 3).toFixed(2), color: 'text-blue-400' },
        { label: 'Overall OASI Mean', value: m.toFixed(2), color: 'text-cyan-400' },
      ],
      stdDev: Math.sqrt(vals.reduce((a, v) => a + (v - m) ** 2, 0) / 9).toFixed(2),
      min: Math.min(...vals).toFixed(1),
      max: Math.max(...vals).toFixed(1),
      gapRows: OASI_GAP_ANALYSIS.map((r) => ({ ...r, score: scores[r.key], gap: scores[r.key] - r.expected })),
    };
  }, [scores]);

  // Real tenant with no usable OASI data: instruct, don't fabricate.
  if (!DEMO_BUILD && !liveScores) {
    return <OasiEmptyState status={bundle.status} title="OASI" icon="🏢" />;
  }

  return (
    <DashboardShell
      title="OASI"
      icon="🏢"
      subtitle="Achieving Styles Inventory — what your organization actually rewards"
      tabs={[{ id: 'current', label: 'Current Analysis', icon: '📊' }]}
      activeTab={activeTab}
      onTab={setActiveTab}
    >
      <div className="space-y-6">
        {/* Top 3-column layout: Chart | Gap Panel | Stats */}
        <div className="grid grid-cols-3 items-start gap-4">
          {/* LEFT: tri-color radar */}
          <div className="rounded-xl bg-panel p-4">
            <OASIRadarChart scores={scores} />
          </div>

          {/* MIDDLE: stated values vs rewarded behaviors */}
          <div className="rounded-xl bg-panel p-4">
            <h3 className="mb-3 text-sm font-bold text-amber-400">⚠ Stated Values vs. Rewarded Behaviors</h3>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2"><span className="mt-0.5 text-red-400" aria-hidden>●</span><span>Vicarious (Mentoring) <strong className="text-white">{scores.vicarious}</strong> — critically low vs. "cultivating next generation" goal</span></div>
              <div className="flex items-start gap-2"><span className="mt-0.5 text-amber-400" aria-hidden>●</span><span>Competitive <strong className="text-white">{scores.competitive}</strong> dominates — rewards individual over team</span></div>
              <div className="flex items-start gap-2"><span className="mt-0.5 text-amber-400" aria-hidden>●</span><span>Entrusting <strong className="text-white">{scores.entrusting}</strong> undervalued vs. "empowering people" messaging</span></div>
              <div className="flex items-start gap-2"><span className="mt-0.5 text-blue-400" aria-hidden>●</span><span>Contributory <strong className="text-white">{scores.contributory}</strong> — behind-scenes contributors invisible to rewards</span></div>
            </div>
            <div className="mt-3 border-t border-border pt-3">
              <p className="text-xs italic text-muted">Audit promotion criteria &amp; bonus structures to weight Relational behaviors equally with Direct.</p>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {GAP_TASKS.map((t) => (
                <div key={t.label} className="flex items-center justify-between rounded bg-slate-700/50 px-2 py-1">
                  <span className="text-xs text-slate-300">{t.label}</span>
                  <button className="ml-2 text-xs text-cyan-400 underline hover:text-cyan-300">Create {t.deliverable}</button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: statistical summary */}
          <div className="space-y-3 rounded-xl bg-panel p-4">
            <h3 className="mb-1 text-sm font-bold text-white">📊 Statistical Summary</h3>
            {setMeans.map((row) => (
              <div key={row.label} className="flex items-center justify-between border-b border-slate-700/50 pb-1">
                <span className="text-xs text-muted">{row.label}</span>
                <span className={`${row.color} text-sm font-bold`}>{row.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between border-b border-slate-700/50 pb-1">
              <span className="text-xs text-muted">Score Range</span>
              <span className="font-mono text-xs text-white">{min} – {max}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-700/50 pb-1">
              <span className="text-xs text-muted">Std Deviation</span>
              <span className="font-mono text-xs text-white">{stdDev}</span>
            </div>
            <div className="space-y-1 pt-1">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-subtle">Instrument Data</div>
              {OASI_INSTRUMENT_DATA.map((row) => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-xs text-muted">{row.label}</span>
                  <span className="text-xs text-white">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="pt-1 text-xs italic text-subtle">Scores reflect organizational reward patterns, not individual capabilities.</div>
          </div>
        </div>

        {activeTab === 'current' && (
          <>
            {/* Gap analysis table */}
            <div className="rounded-xl border border-red-500/30 bg-gradient-to-r from-red-900/20 to-panel p-6">
              <h3 className="mb-4 font-semibold text-red-400">📊 CEO Advisory: Stated Values vs. Rewarded Behaviors Gap Analysis</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left text-muted">Stated Priority</th>
                    <th className="px-3 py-2 text-center text-muted">OASI Style</th>
                    <th className="px-3 py-2 text-center text-muted">Score</th>
                    <th className="px-3 py-2 text-center text-muted">Gap</th>
                    <th className="px-3 py-2 text-left text-muted">Action Required</th>
                  </tr>
                </thead>
                <tbody>
                  {gapRows.map((row) => (
                    <tr key={row.style} className="border-b border-slate-700/50">
                      <td className="px-3 py-2 text-white">{row.stated}</td>
                      <td className="px-3 py-2 text-center text-slate-300">{row.style}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={row.score < 3.5 ? 'text-red-400' : row.score < 4.5 ? 'text-amber-400' : 'text-emerald-400'}>{row.score}</span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={row.gap < -1.5 ? 'text-red-400' : row.gap < 0 ? 'text-amber-400' : 'text-emerald-400'}>
                          {row.gap > 0 ? '+' : ''}{row.gap.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-300">
                        {row.gap < -1.5 ? '🔴 Critical - Redesign rewards' : row.gap < 0 ? '🟡 Monitor - Increase recognition' : row.gap > 1.5 ? '⚠️ Overemphasized' : '🟢 Aligned'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Individual achieving style scores */}
            <div className="rounded-xl bg-panel p-5">
              <h3 className="mb-3 text-sm font-semibold text-white">📈 Individual Achieving Style Scores (OASI 1–7 Scale)</h3>
              <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                {STYLE_BARS.map((s) => {
                  const val = scores[s.key];
                  const color = CLUSTER_COLORS[s.set];
                  return (
                    <div key={s.key} className="flex items-center gap-2 py-1">
                      <div className="h-1.5 w-20 shrink-0 rounded bg-slate-700">
                        <div className="h-full rounded" style={{ width: `${(val / 7) * 100}%`, background: color }} />
                      </div>
                      <span className="min-w-[28px] text-xs font-bold" style={{ color }}>{val}</span>
                      <span className="text-xs text-muted">{s.style}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 text-xs italic text-subtle">
                Scores reflect org reward patterns (1–7). Dominant: Competitive Direct ({scores.competitive}), Power Direct ({scores.power}).
              </div>
            </div>

            {/* 7 key findings */}
            <div className="rounded-xl bg-panel p-6">
              <h3 className="mb-4 font-semibold text-white">🎯 7 Key Findings for CEO</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  {OASI_KEY_FINDINGS.slice(0, 4).map((f) => (
                    <div key={f.title} className={`rounded-lg border p-3 ${FINDING_TONES[f.severity].card}`}>
                      <div className={`text-sm font-semibold ${FINDING_TONES[f.severity].title}`}>{f.title}</div>
                      <div className="mt-1 text-xs text-muted">{f.text}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {OASI_KEY_FINDINGS.slice(4).map((f) => (
                    <div key={f.title} className={`rounded-lg border p-3 ${FINDING_TONES[f.severity].card}`}>
                      <div className={`text-sm font-semibold ${FINDING_TONES[f.severity].title}`}>{f.title}</div>
                      <div className="mt-1 text-xs text-muted">{f.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
