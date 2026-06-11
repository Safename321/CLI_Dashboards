// Sentiment Analysis — internal/external sentiment across employees, customers,
// and media (view id: sentiment). Uses yearData KPIs + the dataset `sentiment` key.
import { useMemo } from 'react';
import DashboardShell from '../components/DashboardShell.jsx';
import DemoDataBanner from '../components/DemoDataBanner.jsx';
import RecommendationPanel from '../components/RecommendationPanel.jsx';
import { TrendBadge } from '../components/shared-cards.jsx';
import { useData } from '../data/DataContext.jsx';
import {
  EXTERNAL_SOURCES,
  DEPARTMENT_SENTIMENT,
  DIFFICULTY_ITEMS,
  SENTIMENT_KPI_DEFAULTS,
} from '../data/datasets/sentiment.js';

const deltaTone = { down: 'text-red-400', watch: 'text-amber-400', up: 'text-emerald-400' };

const trendBadgeTone = {
  crisis: ['bg-red-500/20 text-red-400', '🔴 Crisis'],
  watch: ['bg-amber-500/20 text-amber-400', '🟡 Watch'],
  declining: ['bg-amber-500/20 text-amber-400', '🟡 Declining'],
  improving: ['bg-emerald-500/20 text-emerald-400', '🟢 Improving'],
  stable: ['bg-emerald-500/20 text-emerald-400', '🟢 Stable'],
};

function MetricTile({ label, value, valueClass, change, note, onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={`rounded-lg bg-ink/50 p-4 text-left ${onClick ? 'cursor-pointer transition-colors hover:bg-slate-700/50' : ''}`}
    >
      <div className="text-sm text-muted">{label}</div>
      <div className={`text-2xl font-bold ${valueClass}`}>{value}</div>
      {typeof change === 'number' && <TrendBadge change={change} />}
      {note && <div className="mt-1 text-xs text-amber-400">{note}</div>}
    </Tag>
  );
}

export default function SentimentDashboard({ yearData, selectedYear, onMetricClick }) {
  const { data } = useData();

  // Merge defaults ← yearly KPIs ← orchestrator-provided yearData.
  const yd = useMemo(() => {
    const kpiYears = Object.keys(data?.yearlyKPIs || {}).filter((k) => /^\d{4}$/.test(k)).sort();
    const key = kpiYears.includes(String(selectedYear)) ? String(selectedYear) : kpiYears[kpiYears.length - 1];
    return { ...SENTIMENT_KPI_DEFAULTS, ...(data?.yearlyKPIs?.[key] || {}), ...(yearData || {}) };
  }, [data, selectedYear, yearData]);

  const mediaSentiment = data?.sentiment;
  const happinessComposite = ((yd.jobHappiness + yd.teamHappiness + yd.companyHappiness + yd.lifeHappiness) / 4).toFixed(1);

  return (
    <DashboardShell
      title="Sentiment Analysis"
      icon="💭"
      subtitle="Internal and external sentiment trends across employees, customers, and media"
    >
      <div className="space-y-6">
        {/* External data sources — calibrates internal OASI against public signal */}
        <section className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-panel to-ink p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>🌐</span>
              <h3 className="font-semibold text-white">External Data Sources — calibration against public signal</h3>
            </div>
            <span className="text-xs text-cyan-300">3 sources connected</span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {EXTERNAL_SOURCES.map((s) => (
              <div key={s.name} className="rounded-lg border border-border bg-ink/60 p-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">
                    {s.icon} {s.name}
                  </span>
                  <span className={`font-mono text-xs ${deltaTone[s.deltaTone] || 'text-muted'}`}>{s.delta}</span>
                </div>
                <div className="mb-1 text-2xl font-bold text-white">{s.metric}</div>
                <div className="mb-2 text-xs text-muted">{s.detail}</div>
                <div className="border-t border-border pt-2 text-xs text-cyan-300">
                  ↻ Confirms internal: <span className="text-slate-300">{s.confirms}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-subtle">
            External sources used to <span className="text-slate-300">calibrate, not replace</span>, the OASI behavioral
            diagnostic. Convergence between internal OASI gaps and external sentiment is a credibility multiplier for the
            recommendations below.
          </div>
        </section>

        {/* Media & market sentiment from the tenant dataset `sentiment` key */}
        {mediaSentiment && (
          <section className="rounded-xl border border-border bg-panel p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-white">📰 Media & Market Sentiment</h3>
              <span className="text-xs text-muted">source: tenant dataset · sentiment</span>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-ink/50 p-4">
                <div className="text-sm text-muted">Overall</div>
                <div className="text-xl font-bold text-accent">{mediaSentiment.overallSentiment}</div>
              </div>
              <div className="rounded-lg bg-ink/50 p-4">
                <div className="text-sm text-muted">Sentiment Score</div>
                <div className="text-2xl font-bold text-white">{mediaSentiment.sentimentScore}<span className="text-base text-muted">/100</span></div>
              </div>
              <div className="rounded-lg bg-ink/50 p-4">
                <div className="text-sm text-muted">Coverage Mix</div>
                <div className="text-sm font-semibold">
                  <span className="text-emerald-400">{mediaSentiment.positive} pos</span>
                  <span className="text-muted"> · {mediaSentiment.neutral} neu · </span>
                  <span className="text-red-400">{mediaSentiment.negative} neg</span>
                </div>
              </div>
              <div className="rounded-lg bg-ink/50 p-4">
                <div className="text-sm text-muted">Key Themes</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {(mediaSentiment.keyThemes || []).map((t) => (
                    <span key={t} className="rounded bg-cyan-900/30 px-2 py-0.5 text-xs text-cyan-400">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <DemoDataBanner />
        <RecommendationPanel
          severity="critical"
          title="Company Happiness Crisis - Multiple Stakeholder Concerns"
          evidence={[
            `Company Happiness at ${yd.companyHappiness}/10 (critical threshold: 5.0)`,
            `Flight Risk at ${yd.flightRisk}% - employees signaling "might leave"`,
            `Withholding Work at ${yd.withholding}% - active disengagement`,
            'Customer satisfaction with competitors rising (+8%)',
          ]}
          strategy="Low company happiness combined with rising flight risk requires immediate CEO intervention. Focus on transparent communication about company direction and addressing team difficulties."
          tactics={[
            { title: 'CEO Listening Tour', description: 'Direct conversations with each department', deliverable: 'Tour Schedule', canCreate: true },
            { title: 'All-Hands Town Hall', description: 'Address concerns transparently', deliverable: 'Presentation', canCreate: true },
            { title: 'Stay Interview Campaign', description: 'Proactive retention conversations', deliverable: 'Interview Guide', canCreate: true },
          ]}
        />

        {/* Happiness index — App Page 1 */}
        <section className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden>😊</span>
              <h3 className="font-semibold text-purple-400">Employee Happiness Index (App Page 1)</h3>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-400">{happinessComposite}</div>
              <div className="text-xs text-muted">Composite Score</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricTile
              label="Job Happiness"
              value={yd.jobHappiness}
              valueClass={yd.jobHappiness < 6 ? 'text-red-400' : 'text-amber-400'}
              change={-5}
              onClick={() => onMetricClick?.('jobHappiness', 'Job Happiness')}
            />
            <MetricTile
              label="Team Happiness"
              value={yd.teamHappiness}
              valueClass="text-emerald-400"
              change={3}
              onClick={() => onMetricClick?.('teamHappiness', 'Team Happiness')}
            />
            <MetricTile
              label="Company Happiness"
              value={yd.companyHappiness}
              valueClass="text-red-400"
              change={-15}
              onClick={() => onMetricClick?.('companyHappiness', 'Company Happiness')}
            />
            <MetricTile
              label="Life Happiness"
              value={yd.lifeHappiness}
              valueClass="text-amber-400"
              change={0}
              onClick={() => onMetricClick?.('lifeHappiness', 'Life Happiness')}
            />
          </div>
        </section>

        {/* Self check-in intent signals — App Page 2 */}
        <section className="rounded-xl border border-red-500/30 bg-gradient-to-r from-red-900/20 to-panel p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-2xl" aria-hidden>⚠️</span>
            <h3 className="font-semibold text-red-400">Self Check-In Intent Signals (App Page 2)</h3>
            <span className="ml-auto rounded bg-red-500/20 px-2 py-1 text-xs text-red-400">Critical Signals Detected</span>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-900/20 p-4 text-center">
              <div className="text-2xl font-bold text-emerald-400">{yd.improveWork}%</div>
              <div className="text-sm text-muted">Improve My Work</div>
              <div className="mt-1 text-xs text-emerald-400">🟢 Growth mindset</div>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-900/20 p-4 text-center">
              <div className="text-2xl font-bold text-amber-400">{yd.improveTeam}%</div>
              <div className="text-sm text-muted">Improve Teamwork</div>
              <div className="mt-1 text-xs text-amber-400">🟡 Team friction</div>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-900/20 p-4 text-center">
              <div className="text-2xl font-bold text-amber-400">{yd.realignment}%</div>
              <div className="text-sm text-muted">Need Realignment</div>
              <div className="mt-1 text-xs text-amber-400">🟠 90-day window</div>
            </div>
            <button
              onClick={() => onMetricClick?.('flightRisk', 'Flight Risk %')}
              className="cursor-pointer rounded-lg border border-red-500/30 bg-red-900/20 p-4 text-center transition-colors hover:bg-red-900/30"
            >
              <div className="text-2xl font-bold text-red-400">{yd.flightRisk}%</div>
              <div className="text-sm text-muted">Might Leave</div>
              <div className="mt-1 text-xs text-red-400">🔴 Flight risk</div>
            </button>
            <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{yd.withholding}%</div>
              <div className="text-sm text-muted">Withholding Work</div>
              <div className="mt-1 text-xs text-red-400">🔴 Disengaged</div>
            </div>
          </div>
          <div className="mt-4 rounded-lg bg-ink/50 p-3">
            <div className="text-sm text-muted">
              💰 Estimated Attrition Cost at Risk: <span className="font-bold text-red-400">$4.2M</span> (23 employees ×
              $182K avg replacement cost)
            </div>
          </div>
        </section>

        {/* Customer sentiment — App Page 3 */}
        <section className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-900/20 to-panel p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-2xl" aria-hidden>❤️</span>
            <h3 className="font-semibold text-cyan-400">Customer Sentiment - Employee Observed (App Page 3)</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <MetricTile
              label="Happy with Product"
              value={yd.customerProduct}
              valueClass={yd.customerProduct < 7 ? 'text-amber-400' : 'text-emerald-400'}
              change={-3}
            />
            <MetricTile label="Happy with Team" value={yd.customerTeam} valueClass="text-emerald-400" change={2} />
            <MetricTile label="Happy with Company" value={yd.customerCompany} valueClass="text-amber-400" change={0} />
            <div className="rounded-lg border border-amber-500/50 bg-ink/50 p-4">
              <div className="text-sm text-muted">Happy with Competitors</div>
              <div className="text-2xl font-bold text-amber-400">{yd.customerCompetitor}</div>
              <TrendBadge change={8} />
              <div className="mt-1 text-xs text-amber-400">⚠️ Rising threat</div>
            </div>
            <MetricTile label="Continuing Relationship" value={yd.customerRelationship} valueClass="text-amber-400" change={-5} />
          </div>
        </section>

        {/* Reported difficulties — App Page 4 */}
        <section className="rounded-xl border border-border bg-panel p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-2xl" aria-hidden>🚩</span>
            <h3 className="font-semibold text-white">Reported Difficulties (App Page 4)</h3>
          </div>
          <div className="space-y-3">
            {DIFFICULTY_ITEMS.map((d) => {
              const pct = yd[d.key];
              return (
                <div key={d.key} className="flex items-center gap-4">
                  <div className="w-32 text-sm text-slate-300">{d.label}</div>
                  <div className="h-6 flex-1 overflow-hidden rounded-lg bg-slate-700">
                    <div
                      className={`flex h-full items-center px-2 text-xs font-medium text-white ${
                        pct > 30 ? 'bg-red-500' : pct > 20 ? 'bg-amber-500' : 'bg-slate-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    >
                      {pct}%
                    </div>
                  </div>
                  <div className="w-16 text-sm text-muted">({d.count})</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Department heat map */}
        <section className="rounded-xl border border-border bg-panel p-6">
          <h3 className="mb-4 font-semibold text-white">🗺️ Sentiment by Department</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left text-muted">Department</th>
                  <th className="px-3 py-2 text-center text-muted">Happiness</th>
                  <th className="px-3 py-2 text-center text-muted">Flight Risk</th>
                  <th className="px-3 py-2 text-center text-muted">Issues</th>
                  <th className="px-3 py-2 text-center text-muted">Trend</th>
                </tr>
              </thead>
              <tbody>
                {DEPARTMENT_SENTIMENT.map((row) => {
                  const [trendClass, trendLabel] = trendBadgeTone[row.trend] || trendBadgeTone.stable;
                  return (
                    <tr key={row.dept} className="border-b border-border/50">
                      <td className="px-3 py-2 text-white">{row.dept}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={row.happy < 5 ? 'text-red-400' : row.happy < 6.5 ? 'text-amber-400' : 'text-emerald-400'}>
                          {row.happy}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={row.flight > 10 ? 'text-red-400' : row.flight > 5 ? 'text-amber-400' : 'text-emerald-400'}>
                          {row.flight}%
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center text-slate-300">{row.issues}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`rounded px-2 py-0.5 text-xs ${trendClass}`}>{trendLabel}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
