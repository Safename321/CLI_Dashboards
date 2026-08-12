// External View — brand perception, competitive landscape, external stakeholder
// sentiment. News/markets/macro panels are connector-backed via useRegistry()
// (mock connectors by default); legacy demo values render until live signals exist.
import { useMemo } from 'react';
import DashboardShell from '../components/DashboardShell.jsx';
import { MetricCard, Panel, StatusBadge } from '../components/primitives.jsx';
import { useData } from '../data/DataContext.jsx';
import { useRegistry } from '../connectors/RegistryContext.jsx';
import RecommendationPanel from '../components/RecommendationPanel.jsx';
import {
  CRISIS_RECOMMENDATION,
  DEMO_CRISIS,
  MEDIA_METRICS,
  MEDIA_LISTS,
  STAKEHOLDER_COMMS,
} from '../data/datasets/external-view.js';

const STATUS_ACCENT = { good: '#10b981', warning: '#f59e0b', danger: '#ef4444' };
const TONE = {
  negative: { box: 'border-red-500/30 bg-red-900/20', text: 'text-red-400' },
  caution: { box: 'border-amber-500/30 bg-amber-900/20', text: 'text-amber-400' },
  positive: { box: 'border-emerald-500/30 bg-emerald-900/20', text: 'text-emerald-400' },
};

const ChangeBadge = ({ change }) => (
  <span className={`text-xs ${change > 0 ? 'text-emerald-400' : change < 0 ? 'text-red-400' : 'text-muted'}`}>
    {change > 0 ? '▲' : change < 0 ? '▼' : '–'} {Math.abs(change)}%
  </span>
);

export default function ExternalDashboard({ yearData, selectedYear }) {
  const { data } = useData();
  const { registry, lastRun } = useRegistry();

  // Legacy yearData carried customer-perception KPIs; here they live in yearlyKPIs.
  const kpi = useMemo(() => {
    const year = String(selectedYear || yearData?.year || '');
    return data?.yearlyKPIs?.[year] || {};
  }, [data, selectedYear, yearData]);

  // Connector-backed signals (recomputed after each runAll; payloads may also
  // be restored from the connector cache on first mount).
  const news = useMemo(() => registry.getLatestForDomain('news'), [registry, lastRun]);
  const markets = useMemo(() => registry.getLatestForDomain('markets'), [registry, lastRun]);
  const macro = useMemo(() => registry.getLatestForDomain('macro'), [registry, lastRun]);
  const prCrisis = useMemo(() => registry.derivePrCrisis(), [registry, lastRun]);

  // Live crisis numbers when the news connector reports one; demo values otherwise.
  const crisis = prCrisis.active
    ? { ...DEMO_CRISIS, negativeMentions: prCrisis.recentNegativeCount, sentimentChange: -22 }
    : DEMO_CRISIS;

  const mediaMetrics = useMemo(() => {
    if (!news) return MEDIA_METRICS;
    return MEDIA_METRICS.map((m) => {
      if (m.label === 'Media Mentions (7d)' && news.volume != null) return { ...m, value: news.volume };
      if (m.label === 'Social Sentiment' && news.sentimentScore != null) return { ...m, value: Math.round(news.sentimentScore * 10) };
      return m;
    });
  }, [news]);

  return (
    <DashboardShell
      title="External View"
      icon="🌐"
      alerts={3}
      subtitle="Brand perception, competitive landscape, and external stakeholder sentiment"
    >
      <div className="space-y-6">
        <RecommendationPanel
          severity={CRISIS_RECOMMENDATION.severity}
          title={CRISIS_RECOMMENDATION.title}
          evidence={[
            `${crisis.negativeMentions} negative media mentions in 24h - sentiment dropped ${Math.abs(crisis.sentimentChange)}%`,
            `Customer happiness with competitors rising to ${kpi.customerCompetitor}/10 (+8%)`,
            `Customer relationship continuation score declining to ${kpi.customerRelationship}/10`,
            `External NPS at ${kpi.nps} (down from 48 in 2022)`,
          ]}
          strategy={CRISIS_RECOMMENDATION.strategy}
          tactics={CRISIS_RECOMMENDATION.tactics}
        />

        {/* PR Crisis Alert — driven by the news connector's crisis derivation */}
        <section className="rounded-xl border border-red-500 bg-red-900/30 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span aria-hidden className="text-3xl">🚨</span>
              <div>
                <div className="text-lg font-bold text-red-400">Active PR Crisis Detected</div>
                <div className="text-slate-300">
                  {crisis.negativeMentions} negative mentions in 24h • Sentiment dropped {Math.abs(crisis.sentimentChange)}%
                </div>
                <div className="mt-0.5 text-xs text-muted">
                  Signal source: {prCrisis.active ? prCrisis.source : `demo (news connector: ${prCrisis.reason})`}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { value: crisis.negativeMentions, label: 'Negative Mentions', cls: 'bg-red-900/40 text-red-400' },
              { value: `${crisis.sentimentChange}%`, label: 'Sentiment Change', cls: 'bg-red-900/40 text-red-400' },
              { value: crisis.reach, label: 'Reach/Impressions', cls: 'bg-amber-900/40 text-amber-400' },
              { value: crisis.responseWindow, label: 'Response Window', cls: 'bg-slate-700/50 text-white' },
            ].map((s) => (
              <div key={s.label} className={`rounded-lg p-3 text-center ${s.cls.split(' ')[0]}`}>
                <div className={`text-xl font-bold ${s.cls.split(' ')[1]}`}>{s.value}</div>
                <div className="text-sm text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Customer Perception (Employee-Observed via CLI App) */}
        <section className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-900/20 to-panel p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-semibold text-accent">
              <span aria-hidden className="text-2xl">👁️</span> Customer Perception (Employee-Observed via CLI App)
            </h3>
            <StatusBadge status="yellow">Competitive Threat Rising</StatusBadge>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {[
              { label: 'Product Satisfaction', value: kpi.customerProduct, change: -3, color: 'text-amber-400' },
              { label: 'Service Team', value: kpi.customerTeam, change: 2, color: 'text-emerald-400' },
              { label: 'Company Overall', value: kpi.customerCompany, change: 0, color: 'text-amber-400' },
              { label: 'Competitor Satisfaction', value: kpi.customerCompetitor, change: 8, color: 'text-amber-400', threat: true },
              { label: 'Continue Relationship', value: kpi.customerRelationship, change: -5, color: 'text-amber-400' },
            ].map((c) => (
              <div key={c.label} className={`rounded-lg p-4 ${c.threat ? 'border border-amber-500 bg-amber-900/30' : 'bg-ink/50'}`}>
                <div className="text-sm text-muted">{c.label}</div>
                <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
                <ChangeBadge change={c.change} />
                {c.threat && <div className="mt-1 text-xs text-amber-400">⚠️ Rising threat</div>}
              </div>
            ))}
          </div>
        </section>

        {/* Competitive Landscape */}
        <Panel title="📊 Competitive Position Analysis">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h4 className="mb-3 text-sm text-muted">Customer Loyalty Risk</h4>
              <div className="space-y-3">
                {[
                  { name: 'Our Company', value: kpi.customerCompany, bar: 'bg-cyan-500', text: 'text-accent' },
                  { name: 'Competitors', value: kpi.customerCompetitor, bar: 'bg-amber-500', text: 'text-amber-400' },
                ].map((r) => (
                  <div key={r.name} className="flex items-center gap-4">
                    <span className="w-24 text-white">{r.name}</span>
                    <div className="h-4 flex-1 rounded bg-slate-700">
                      <div className={`h-full rounded ${r.bar}`} style={{ width: `${((r.value || 0) / 10) * 100}%` }} />
                    </div>
                    <span className={`font-bold ${r.text}`}>{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-900/20 p-3">
                <div className="font-semibold text-amber-400">⚠️ Gap Closing</div>
                <div className="text-sm text-muted">Competitor satisfaction up 29% YoY while ours declined 10%</div>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-sm text-muted">External Metrics</h4>
              <div className="space-y-3">
                {[
                  { label: 'Net Promoter Score (NPS)', value: kpi.nps, cls: kpi.nps < 45 ? 'text-amber-400' : 'text-emerald-400' },
                  { label: 'Customer Effort Score (CES)', value: `${kpi.ces}/7`, cls: kpi.ces < 4.5 ? 'text-red-400' : 'text-amber-400' },
                  { label: 'CSAT Score', value: `${kpi.csat}/10`, cls: kpi.csat < 7.5 ? 'text-amber-400' : 'text-emerald-400' },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between rounded-lg bg-slate-700/50 p-3">
                    <span className="text-slate-300">{m.label}</span>
                    <span className={`font-bold ${m.cls}`}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>

        {/* Media & Social Monitoring — news connector domain */}
        <Panel
          title="📰 Media & Social Monitoring"
          right={news ? <StatusBadge status={news.source === 'mock' ? 'mock' : 'info'}>{news.source === 'mock' ? 'mock connector' : news.source}</StatusBadge> : null}
        >
          <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {mediaMetrics.map((m) => (
              <MetricCard
                key={m.label}
                label={m.label}
                value={m.value}
                unit={m.unit}
                delta={m.trend}
                hint={`benchmark ${m.benchmark}`}
                accent={STATUS_ACCENT[m.status]}
              />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {MEDIA_LISTS.map((l) => (
              <div key={l.title} className={`rounded-lg border p-4 ${TONE[l.tone].box}`}>
                <div className={`mb-2 font-semibold ${TONE[l.tone].text}`}>{l.title}</div>
                <ul className="space-y-1 text-sm text-muted">
                  {l.items.map((it) => (
                    <li key={it}>• {it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {news?.topHeadlines?.length > 0 && (
            <div className="mt-4 rounded-lg border border-border bg-ink/50 p-4">
              <div className="mb-2 text-sm font-semibold text-slate-200">Latest headlines (news connector)</div>
              <ul className="space-y-1 text-sm text-muted">
                {news.topHeadlines.map((h) => (
                  <li key={h.title}>
                    • {h.title} <span className="text-subtle">— {h.source}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>

        {/* Market & Macro Context — markets + macro connector domains */}
        <Panel
          title="📈 Market & Macro Context"
          subtitle="Stock and macro indicators from the markets/macro connectors"
          right={markets || macro ? <StatusBadge status="mock">{markets?.source === 'mock' || macro?.source === 'mock' ? 'mock connectors' : 'live'}</StatusBadge> : null}
        >
          {!markets && !macro ? (
            <p className="text-sm text-muted">
              No connector data yet — run connectors from Tenant Config (🔌) to populate market and macro context.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {markets && (
                <>
                  <MetricCard label={`${markets.ticker} price`} value={markets.price} delta={markets.changePercent} deltaLabel="% today" hint={`as of ${markets.asOf}`} />
                  <MetricCard label="52-week range" value={`${markets.week52Low}–${markets.week52High}`} hint={`volume ${Number(markets.volume).toLocaleString()}`} />
                </>
              )}
              {macro?.series &&
                Object.entries(macro.series).map(([id, s]) => (
                  <MetricCard key={id} label={s.label} value={s.value} hint={`as of ${s.asOf}`} />
                ))}
            </div>
          )}
        </Panel>

        {/* Stakeholder Communication Status */}
        <Panel title="📬 External Stakeholder Communication Status">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STAKEHOLDER_COMMS.map((s) => (
              <div key={s.label} className={`rounded-lg border p-4 text-center ${TONE[s.tone].box}`}>
                <div aria-hidden className="mb-2 text-3xl">{s.icon}</div>
                <div className={`font-bold ${TONE[s.tone].text}`}>{s.status}</div>
                <div className="text-sm text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
