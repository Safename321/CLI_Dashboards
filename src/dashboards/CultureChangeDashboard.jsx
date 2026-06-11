// Culture Change — cultural transformation tracking from CLI app behavioral
// signals, with culture-dimension → OASI derivation (view id: culture-change).
import { useMemo } from 'react';
import DashboardShell from '../components/DashboardShell.jsx';
import DemoDataBanner from '../components/DemoDataBanner.jsx';
import RecommendationPanel from '../components/RecommendationPanel.jsx';
import { BulletChart } from '../components/primitives.jsx';
import { RadarChart } from '../components/charts.jsx';
import { useData } from '../data/DataContext.jsx';
import {
  TARGET_CULTURE_DIMENSIONS,
  STYLE_MAPPINGS,
  CULTURE_TRENDS,
  OASI_STYLE_ORDER,
  CULTURE_RECOMMENDATION,
  CULTURE_KPI_DEFAULTS,
} from '../data/datasets/culture-change.js';

// OASI cluster colors (design tokens — keep exact).
const CLUSTER_COLORS = { direct: '#eab308', instrumental: '#ef4444', relational: '#3b82f6' };

// Derive OASI achieving-style scores (1–7) from culture dimensions (0–100%).
// Ported verbatim from the v1.24L correlation model.
function deriveOASIFromCulture(c) {
  const scale = (val) => +Math.min(7, Math.max(1, (val / 10) * 0.7 + 0.7)).toFixed(1);
  return {
    // Relational set — strongly correlated with collaboration and safety
    collaborative: scale(c.teamCollaboration * 0.5 + c.psychSafety * 0.3 + c.discretionaryEffort * 0.2),
    contributory: scale(c.discretionaryEffort * 0.4 + c.teamCollaboration * 0.3 + c.growthMindset * 0.3),
    vicarious: scale(c.growthMindset * 0.4 + c.psychSafety * 0.35 + c.teamCollaboration * 0.25),
    // Instrumental set — empowerment, networking, influence
    entrusting: scale(c.psychSafety * 0.45 + c.innovationReadiness * 0.35 + c.teamCollaboration * 0.2),
    social: scale(c.teamCollaboration * 0.4 + c.innovationReadiness * 0.35 + c.growthMindset * 0.25),
    personal: scale(c.growthMindset * 0.35 + c.discretionaryEffort * 0.35 + c.innovationReadiness * 0.3),
    // Direct set — Power/Competitive inversely correlated with safety/collaboration
    intrinsic: scale(c.growthMindset * 0.45 + c.discretionaryEffort * 0.35 + c.innovationReadiness * 0.2),
    competitive: scale(100 - c.psychSafety * 0.4 + (100 - c.teamCollaboration * 0.3) + c.discretionaryEffort * 0.3) * 0.8,
    power: scale(100 - c.psychSafety * 0.5 + (100 - c.teamCollaboration * 0.25) + (100 - c.innovationReadiness * 0.25)) * 0.75,
  };
}

const clusterMean = (oasi, keys) => keys.reduce((sum, k) => sum + oasi[k], 0) / keys.length;
const signed = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}`;

function OASILegendPanel({ title, oasi, tone }) {
  const text = tone === 'current' ? 'text-red-400' : 'text-emerald-400';
  const dot = tone === 'current' ? 'bg-red-500' : 'bg-emerald-500';
  const mean = (Object.values(oasi).reduce((a, b) => a + b, 0) / 9).toFixed(2);
  return (
    <div className="rounded-lg bg-ink/50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-3 w-3 rounded-full ${dot}`} aria-hidden />
        <span className={`text-sm font-semibold ${text}`}>{title}</span>
      </div>
      <div className="mb-3 text-center">
        <div className={`text-3xl font-bold ${text}`}>{mean}</div>
        <div className="text-xs text-subtle">Mean Score</div>
      </div>
      <div className="space-y-1.5">
        {Object.entries(oasi)
          .sort((a, b) => b[1] - a[1])
          .map(([style, score]) => (
            <div key={style} className="flex items-center justify-between text-xs">
              <span className="capitalize text-muted">{style}</span>
              <span className={`font-medium ${text}`}>{score.toFixed(1)}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

export default function CultureChangeDashboard({ yearData, selectedYear }) {
  const { data } = useData();

  // Merge defaults ← yearly KPIs ← orchestrator-provided yearData.
  const yd = useMemo(() => {
    const kpiYears = Object.keys(data?.yearlyKPIs || {}).filter((k) => /^\d{4}$/.test(k)).sort();
    const key = kpiYears.includes(String(selectedYear)) ? String(selectedYear) : kpiYears[kpiYears.length - 1];
    return { ...CULTURE_KPI_DEFAULTS, ...(data?.yearlyKPIs?.[key] || {}), ...(yearData || {}) };
  }, [data, selectedYear, yearData]);

  const derived = useMemo(() => {
    // Culture dimensions from CLI app sentiment signals.
    const current = {
      growthMindset: yd.improveWork, // % wanting to improve their work
      psychSafety: yd.psychSafety * 10, // to percentage
      discretionaryEffort: yd.discretionaryEffort,
      innovationReadiness: yd.discretionaryEffort,
      teamCollaboration: 100 - yd.teamCooperation, // inverse of cooperation issues
    };
    const currentOASI = deriveOASIFromCulture(current);
    const targetOASI = deriveOASIFromCulture(TARGET_CULTURE_DIMENSIONS);
    const radarData = OASI_STYLE_ORDER.map((s) => ({
      axis: s.label,
      current: currentOASI[s.key],
      target: targetOASI[s.key],
    }));
    const shifts = [
      { label: 'Relational', cluster: 'relational', keys: ['collaborative', 'contributory', 'vicarious'] },
      { label: 'Instrumental', cluster: 'instrumental', keys: ['entrusting', 'social', 'personal'] },
      { label: 'Direct', cluster: 'direct', keys: ['intrinsic', 'competitive', 'power'] },
    ].map((c) => ({ ...c, delta: clusterMean(targetOASI, c.keys) - clusterMean(currentOASI, c.keys) }));
    return { current, currentOASI, targetOASI, radarData, shifts };
  }, [yd]);

  const { current, currentOASI, targetOASI, radarData, shifts } = derived;
  const healthScore = ((current.growthMindset + current.psychSafety + current.innovationReadiness) / 3).toFixed(0);

  return (
    <DashboardShell
      title="Culture Change"
      icon="🌱"
      subtitle="Tracking cultural transformation using CLI app behavioral signals"
    >
      <div className="space-y-6">
        <DemoDataBanner />
        <RecommendationPanel
          severity={CULTURE_RECOMMENDATION.severity}
          title={CULTURE_RECOMMENDATION.title}
          evidence={[
            `Growth mindset at ${current.growthMindset}% (declining from 62% in 2022)`,
            `Realignment requests at ${yd.realignment}% - employees seeking role clarity`,
            `Company happiness at ${yd.companyHappiness}/10 while team happiness at ${yd.teamHappiness}/10`,
            `Discretionary effort at ${yd.discretionaryEffort}% - below 65% engagement threshold`,
          ]}
          strategy={CULTURE_RECOMMENDATION.strategy}
          tactics={CULTURE_RECOMMENDATION.tactics}
        />

        {/* Culture health overview */}
        <section className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden>🌱</span>
              <h3 className="font-semibold text-purple-400">Culture Health Score</h3>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-purple-400">{healthScore}%</div>
              <div className="text-xs text-muted">Composite Score</div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-ink/50 p-4">
              <div className="text-sm text-muted">Growth Mindset</div>
              <div className={`text-2xl font-bold ${current.growthMindset > 60 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {current.growthMindset}%
              </div>
              <div className="mt-1 text-xs text-subtle">From "Improve My Work" intent</div>
            </div>
            <div className="rounded-lg bg-ink/50 p-4">
              <div className="text-sm text-muted">Psychological Safety</div>
              <div className={`text-2xl font-bold ${yd.psychSafety >= 6 ? 'text-emerald-400' : 'text-red-400'}`}>
                {yd.psychSafety}/10
              </div>
              <div className="mt-1 text-xs text-subtle">Threshold: 6.0</div>
            </div>
            <div className="rounded-lg bg-ink/50 p-4">
              <div className="text-sm text-muted">Discretionary Effort</div>
              <div className={`text-2xl font-bold ${yd.discretionaryEffort >= 65 ? 'text-emerald-400' : 'text-red-400'}`}>
                {yd.discretionaryEffort}%
              </div>
              <div className="mt-1 text-xs text-subtle">Threshold: 65%</div>
            </div>
          </div>
        </section>

        {/* Culture dimensions vs targets */}
        <section className="rounded-xl border border-border bg-panel p-6">
          <h3 className="mb-4 font-semibold text-white">📊 Culture Dimensions (Current vs Target)</h3>
          <div className="space-y-4">
            {STYLE_MAPPINGS.map((m) => (
              <BulletChart
                key={m.dimKey}
                label={m.dimension}
                value={+current[m.dimKey].toFixed(0)}
                target={TARGET_CULTURE_DIMENSIONS[m.dimKey]}
                max={100}
                unit="%"
              />
            ))}
          </div>
        </section>

        {/* Culture → OASI correlation mapping */}
        <section className="rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-900/20 to-panel p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-2xl" aria-hidden>🔗</span>
            <h3 className="text-lg font-semibold text-indigo-400">Culture Dimensions → OASI Correlation Analysis</h3>
          </div>
          <p className="mb-6 text-sm text-slate-300">
            The 5 Culture Dimensions correlate to specific CLI Achieving Styles. By measuring culture, we can predict the
            organizational OASI profile—and by changing culture, we can shift which behaviors the organization rewards.
          </p>
          <div className="overflow-x-auto rounded-lg bg-ink/50 p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left text-muted">Culture Dimension</th>
                  <th className="px-3 py-2 text-center text-red-400">Current</th>
                  <th className="px-3 py-2 text-center text-emerald-400">Target</th>
                  <th className="px-3 py-2 text-left text-cyan-400">Correlated Achieving Styles</th>
                  <th className="px-3 py-2 text-left text-muted">Rationale</th>
                </tr>
              </thead>
              <tbody>
                {STYLE_MAPPINGS.map((m) => {
                  const cur = current[m.dimKey];
                  const target = TARGET_CULTURE_DIMENSIONS[m.dimKey];
                  return (
                    <tr key={m.dimKey} className="border-b border-border/50">
                      <td className="px-3 py-3 font-medium text-white">{m.dimension}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={cur >= target * 0.85 ? 'text-emerald-400' : 'text-red-400'}>{cur.toFixed(0)}%</span>
                      </td>
                      <td className="px-3 py-3 text-center text-emerald-400">{target}%</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {m.styles.map((style) => (
                            <span key={style} className="rounded bg-cyan-900/30 px-2 py-0.5 text-xs text-cyan-400">
                              {style}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="max-w-xs px-3 py-3 text-xs text-muted">{m.rationale}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Culture-derived OASI profiles (overlay radar) */}
        <section className="rounded-xl border border-border bg-panel p-6">
          <h3 className="mb-2 font-semibold text-white">🎯 Culture-Derived OASI Profiles</h3>
          <p className="mb-6 text-sm text-muted">
            These OASI profiles are mathematically derived from the Culture Dimension scores, showing how organizational
            culture translates to rewarded behaviors.
          </p>

          <div className="mb-6 rounded-lg border border-indigo-500/30 bg-indigo-900/20 p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden>💡</span>
              <div>
                <h4 className="mb-2 font-semibold text-indigo-400">Key Insight: Culture as OASI Lever</h4>
                <p className="text-sm leading-relaxed text-slate-300">
                  Achieving the target Culture Dimensions would shift the organization's OASI profile toward more balanced
                  Connective Leadership. The data shows that improving{' '}
                  <strong className="text-emerald-400">Psychological Safety</strong> from {current.psychSafety.toFixed(0)}%
                  to {TARGET_CULTURE_DIMENSIONS.psychSafety}% would elevate Entrusting (
                  {signed(targetOASI.entrusting - currentOASI.entrusting)}) and Vicarious (
                  {signed(targetOASI.vicarious - currentOASI.vicarious)}) while reducing Power (
                  {(targetOASI.power - currentOASI.power).toFixed(1)}) concentration—directly addressing the "say-do gap"
                  identified in the Organization OASI dashboard. Culture change initiatives should prioritize psychological
                  safety as the highest-leverage intervention.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-ink p-6">
            <h4 className="mb-4 text-center font-semibold text-purple-400">
              Culture-Derived OASI Overlay: Current vs Target
            </h4>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <OASILegendPanel title="Current Culture OASI" oasi={currentOASI} tone="current" />

              <div className="flex flex-col items-center">
                <div className="w-full">
                  <RadarChart
                    data={radarData}
                    angleKey="axis"
                    series={[
                      { key: 'current', name: 'Current', color: '#ef4444' },
                      { key: 'target', name: 'Target', color: '#10b981' },
                    ]}
                    height={320}
                  />
                </div>
                <div className="mt-4 grid w-full grid-cols-3 gap-3">
                  {shifts.map((s) => (
                    <div key={s.label} className="rounded-lg bg-ink/50 p-2 text-center">
                      <div className="text-xs text-muted">{s.label}</div>
                      <div className="text-sm font-bold" style={{ color: CLUSTER_COLORS[s.cluster] }}>
                        {signed(s.delta)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <OASILegendPanel title="Target Culture OASI" oasi={targetOASI} tone="target" />
            </div>
          </div>
        </section>

        {/* Intent signals as culture indicators */}
        <section className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-900/20 to-panel p-6">
          <h3 className="mb-4 font-semibold text-cyan-400">🎯 Intent Signals as Culture Indicators</h3>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h4 className="mb-3 font-semibold text-emerald-400">✅ Positive Culture Signals</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-900/20 p-3">
                  <span className="text-slate-300">"Improve My Work" selections</span>
                  <span className="font-bold text-emerald-400">{yd.improveWork}%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-900/20 p-3">
                  <span className="text-slate-300">"Improve Teamwork" selections</span>
                  <span className="font-bold text-emerald-400">{yd.improveTeam}%</span>
                </div>
                <div className="rounded-lg bg-slate-700/50 p-3">
                  <div className="text-sm text-muted">Combined growth-oriented signals</div>
                  <div className="text-lg font-bold text-white">{(yd.improveWork + yd.improveTeam).toFixed(1)}% of workforce</div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-red-400">⚠️ Culture Warning Signals</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-900/20 p-3">
                  <span className="text-slate-300">"Need Realignment" selections</span>
                  <span className="font-bold text-amber-400">{yd.realignment}%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-900/20 p-3">
                  <span className="text-slate-300">"Might Leave" selections</span>
                  <span className="font-bold text-red-400">{yd.flightRisk}%</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-900/20 p-3">
                  <span className="text-slate-300">"Withholding Work" selections</span>
                  <span className="font-bold text-red-400">{yd.withholding}%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3-year culture trends */}
        <section className="rounded-xl border border-border bg-panel p-6">
          <h3 className="mb-4 font-semibold text-white">📈 Culture Trend Analysis (3-Year)</h3>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {CULTURE_TRENDS.map((t) => (
              <div key={t.label} className="rounded-lg border border-red-500/30 bg-red-900/20 p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{t.delta}</div>
                <div className="text-sm text-muted">{t.label}</div>
                <div className="text-xs text-subtle">{t.range}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
