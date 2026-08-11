// CEO Advisory — real-time KPI monitoring, behavioral risk signals, and
// strategic recommendations (view id: ceo-advisory).
import { useMemo } from 'react';
import DashboardShell from '../components/DashboardShell.jsx';
import RecommendationPanel from '../components/RecommendationPanel.jsx';
import { TrendBadge, RecommendationCard } from '../components/shared-cards.jsx';
import { FinancialKPICard } from '../components/financial.jsx';
import { useData, useYearData } from '../data/DataContext.jsx';
import SwotBubbleChart from './swot/SwotBubbleChart.jsx';
import useSwotData from './swot/useSwotData.js';
import { useDataset } from '../lib/liveData.js';
import { financialCardsFromKpis } from '../lib/liveKpis.js';

const DEMO_BUILD = import.meta.env.VITE_AUTH_DISABLED === 'true';

// Phase 3 (D8): sections that still run on demo narrative carry an explicit
// tag on real logins until their live sources exist.
const DemoTag = () => (DEMO_BUILD ? null : (
  <span className="rounded-full border border-amber-500/40 bg-amber-900/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-400">
    demo figures
  </span>
));
import {
  EXEC_KPIS,
  FINANCIAL_KPI_CARDS,
  STRATEGY_CARDS,
  CHANGE_FEED,
  SWOT_QUADRANTS,
  CEO_KPI_ALERT,
  PREDICTIVE_ROWS,
  DIAGNOSTIC_ROWS,
  AI_RECOMMENDATIONS,
  KEY_METRICS,
  ATTENTION_ITEMS,
} from '../data/datasets/executive.js';

// Strategy trigger logic based on operational KPIs (behavior spec v1.24L).
function getTriggeredStrategies(kpis) {
  const s = { cutCosts: 0, pauseHiring: 0, annualBilling: 0 };
  if (kpis.cashMultiple < 1.0) { s.cutCosts++; s.annualBilling++; }
  if (kpis.cacPayback > 12) { s.cutCosts++; s.pauseHiring++; s.annualBilling++; }
  if (kpis.churnRate > 3) { s.cutCosts++; s.pauseHiring++; s.annualBilling++; }
  if (kpis.salesCycle > 90) { s.cutCosts++; s.pauseHiring++; s.annualBilling++; }
  if (kpis.leadConversion < 5) { s.cutCosts++; s.pauseHiring++; s.annualBilling++; }
  return s;
}

// The SWOT report button moved to the dedicated Strategic SWOT dashboard (2026-08)
// to remove the duplicate across the top two CEO dashboards.

// "Yesterday → now" window label for the change feed.
function changeWindow() {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const fmt = (d) =>
    `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
  return `${fmt(yesterday)} → ${fmt(now)}`;
}

const SEV_STYLES = {
  red: 'border-red-500/40 bg-red-900/15',
  amber: 'border-amber-500/40 bg-amber-900/15',
  green: 'border-emerald-500/40 bg-emerald-900/15',
};

const QUADRANT_STYLES = {
  emerald: { box: 'bg-emerald-900/20 border-emerald-500/40', head: 'text-emerald-400', tag: 'text-emerald-400/60', em: 'text-emerald-300' },
  red: { box: 'bg-red-900/20 border-red-500/40', head: 'text-red-400', tag: 'text-red-400/60', em: 'text-red-300' },
  blue: { box: 'bg-blue-900/20 border-blue-500/40', head: 'text-blue-300', tag: 'text-blue-300/60', em: 'text-blue-200' },
  amber: { box: 'bg-amber-900/20 border-amber-500/40', head: 'text-amber-300', tag: 'text-amber-300/60', em: 'text-amber-200' },
};

const strategyCardTone = (count) =>
  count >= 3 ? 'bg-red-900/30 border-red-500' : count >= 2 ? 'bg-amber-900/30 border-amber-500' : 'bg-panel border-border';
const strategyCountTone = (count) => (count >= 3 ? 'text-red-400' : count >= 2 ? 'text-amber-400' : 'text-muted');

export default function CEOAdvisoryDashboard({ onNavigate, onMetricClick }) {
  const { data } = useData();
  const latest = useYearData();

  // Live tenant sources (D8): SWOT from org-oasi, financial KPIs from the
  // entered currentKpis dataset. Static demo values remain the fallback and
  // are tagged as such on real logins.
  const swot = useSwotData();
  const storedKpis = useDataset('currentKpis', null);
  const liveCards = DEMO_BUILD ? null : financialCardsFromKpis(storedKpis);
  const kpiCards = liveCards ?? FINANCIAL_KPI_CARDS;

  const strategies = useMemo(
    () => getTriggeredStrategies(liveCards && storedKpis ? storedKpis : EXEC_KPIS),
    [liveCards, storedKpis],
  );
  const triggeredCount = kpiCards.filter((k) => k.trigger).length;

  // Outcome (trailing) column from dataset financials — latest vs prior year.
  const outcome = useMemo(() => {
    const fin = data?.financials || {};
    const years = Object.keys(fin).sort();
    const prior = latest ? fin[years[years.indexOf(String(latest.year)) - 1]] : null;
    return latest
      ? {
          revenue: latest.revenue,
          revenueChange: Math.round(latest.revenueGrowth),
          margin: latest.operatingMargin,
          marginChange: prior ? Math.round(latest.operatingMargin - prior.operatingMargin) : null,
        }
      : null;
  }, [data, latest]);

  // SWOT report generation now lives only on the Strategic SWOT dashboard.

  return (
    <DashboardShell
      title="CEO Advisory"
      icon="🎯"
      alerts={3}
      subtitle="Real-time KPI monitoring, behavioral risk signals, and strategic recommendations"
      actions={
        <div className="text-right">
          <div className="text-xs text-muted">Data as of</div>
          <div className="text-sm font-medium text-white">
            {new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* What changed since last login */}
        <section className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-panel to-ink p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>🔔</span>
              <h2 className="font-semibold text-white">What changed since your last login</h2>
              <span className="ml-2 text-xs text-subtle">{changeWindow()}</span>
              <DemoTag />
            </div>
            <span className="text-xs text-accent">{CHANGE_FEED.length} items</span>
          </div>
          <div className="space-y-2">
            {CHANGE_FEED.map((c, i) => (
              <div key={i} className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${SEV_STYLES[c.sev]}`}>
                <span aria-hidden>{c.icon}</span>
                <span className="flex-1 text-sm text-slate-200">{c.text}</span>
                <button className="text-xs text-accent hover:underline" onClick={() => onNavigate?.(c.view)}>
                  → {c.link}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Strategic SWOT — derived from OASI */}
        <section className="rounded-xl border border-border bg-gradient-to-br from-panel to-ink p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden>🎯</span>
              <div>
                <h2 className="text-lg font-semibold text-white">Strategic SWOT — derived from OASI</h2>
                <p className="text-xs text-muted">
                  {DEMO_BUILD
                    ? 'Behavioral diagnostic translated into strategic position vs. Mobility spin-off, IHS Markit integration, and AI competitive front'
                    : 'Behavioral diagnostic translated into strategic position — materiality-bubble read of your live org profile'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-300">
                {swot.status === 'ready' && swot.isLive ? `N = ${swot.meta.respondents} · OASI (live)` : 'N = 847 · OASI'}
              </span>
              <button
                onClick={() => onNavigate?.('swot')}
                className="rounded-full border border-accent/50 px-3 py-1 text-xs font-semibold text-accent hover:bg-accent/10"
                title="Open the interactive Materiality-Bubble SWOT (size = materiality, fill = confidence)"
              >
                💠 Open full view →
              </button>
            </div>
          </div>

          {/* Materiality-Bubble read (spec §8.2 embedded mode) — demo build
              shows the reference profile; real logins show THEIR live factors
              (legend + caveat baked into the SVG). */}
          {swot.status === 'ready' ? (
            <div className="mb-4 rounded-lg border border-border bg-ink/40 p-3">
              <SwotBubbleChart
                factors={swot.factors}
                arrows={swot.arrows}
                onFactorClick={() => onNavigate?.('swot')}
                className="mx-auto w-full max-w-3xl"
              />
            </div>
          ) : (
            <div className="mb-4 rounded-lg border border-border bg-ink/40 p-6 text-center text-sm text-muted">
              {swot.status === 'loading' ? 'Loading your organization\'s profile…'
                : swot.status === 'empty' ? 'No completed assessments yet — assign CLI instruments to generate the materiality read.'
                : 'Couldn\'t load your organization\'s assessment data.'}
            </div>
          )}

          {DEMO_BUILD && <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {SWOT_QUADRANTS.map((q) => {
              const s = QUADRANT_STYLES[q.tone];
              return (
                <div key={q.key} className={`rounded-lg border p-4 ${s.box}`}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`text-sm font-bold uppercase tracking-wide ${s.head}`}>{q.title}</span>
                    <span className={`text-xs ${s.tag}`}>{q.tag}</span>
                  </div>
                  <ul className="list-disc space-y-1.5 pl-4 text-xs text-slate-200">
                    {q.items.map((item, i) => (
                      <li key={i}>
                        {item.em && <span className={`font-semibold ${s.em}`}>{item.em}</span>}
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>}

          {/* Full-SWOT-report button intentionally removed here — it lives on the
              dedicated Strategic SWOT dashboard to avoid the duplicate (2026-08).
              The materiality chart above deep-links there on click. */}
        </section>

        <RecommendationPanel
          severity={CEO_KPI_ALERT.severity}
          title={DEMO_BUILD ? CEO_KPI_ALERT.title : `${CEO_KPI_ALERT.title} — demo figures`}
          evidence={CEO_KPI_ALERT.evidence}
          strategy={CEO_KPI_ALERT.strategy}
          tactics={CEO_KPI_ALERT.tactics}
          reportData={data}
        />

        {/* Financial Efficiency KPIs */}
        <section className="rounded-xl border border-border bg-gradient-to-r from-panel to-ink p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden>💰</span>
              <h2 className="text-lg font-semibold text-white">Financial Efficiency KPIs</h2>
              {liveCards
                ? <span className="rounded-full border border-emerald-500/40 bg-emerald-900/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">live · currentKpis</span>
                : <DemoTag />}
            </div>
            <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400">
              {triggeredCount} of {kpiCards.length} KPIs Triggered
            </span>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-5">
            {kpiCards.map((k) => (
              <FinancialKPICard key={k.label} {...k} />
            ))}
          </div>

          <div className="rounded-lg bg-ink/50 p-4">
            <div className="mb-3 text-xs uppercase tracking-wider text-muted">Triggered Strategies</div>
            <div className="grid grid-cols-3 gap-4">
              {STRATEGY_CARDS.map((s) => (
                <div key={s.key} className={`rounded-lg border p-3 ${strategyCardTone(strategies[s.key])}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">
                      {s.icon} {s.label}
                    </span>
                    <span className={`text-lg font-bold ${strategyCountTone(strategies[s.key])}`}>{strategies[s.key]}/5</span>
                  </div>
                  <div className="mt-1 text-xs text-muted">KPIs triggered</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Insight horizons: predictive / diagnostic / outcome */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-900/30 to-panel p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-purple-400" aria-hidden>🔮</span>
              <h3 className="text-sm font-semibold uppercase text-purple-400">Predictive (12-24mo)</h3>
              <DemoTag />
            </div>
            <div className="space-y-2">
              {PREDICTIVE_ROWS.map((r) => (
                <div key={r.label} className="flex justify-between">
                  <span className="text-sm text-slate-300">{r.label}</span>
                  <span className={`font-medium ${r.tone === 'red' ? 'text-red-400' : r.tone === 'amber' ? 'text-amber-400' : 'text-emerald-400'}`}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-900/30 to-panel p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-accent" aria-hidden>📊</span>
              <h3 className="text-sm font-semibold uppercase text-accent">Diagnostic (Current)</h3>
              <DemoTag />
            </div>
            <div className="space-y-2">
              {DIAGNOSTIC_ROWS.map((r) => (
                <div key={r.label} className="flex justify-between">
                  <span className="text-sm text-slate-300">{r.label}</span>
                  <span className="font-medium text-white">
                    {r.value} <TrendBadge change={r.change} />
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-600 bg-panel p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-muted" aria-hidden>📉</span>
              <h3 className="text-sm font-semibold uppercase text-muted">Outcome (Trailing)</h3>
            </div>
            <div className="space-y-2">
              <button className="flex w-full justify-between text-left hover:opacity-80" onClick={() => onMetricClick?.('revenue', 'Revenue')}>
                <span className="text-sm text-muted">Revenue (FY{latest?.year})</span>
                <span className="font-medium text-slate-300">
                  ${outcome?.revenue}B {outcome && <TrendBadge change={outcome.revenueChange} />}
                </span>
              </button>
              <button className="flex w-full justify-between text-left hover:opacity-80" onClick={() => onMetricClick?.('operatingMargin', 'Operating Margin')}>
                <span className="text-sm text-muted">Operating Margin</span>
                <span className="font-medium text-slate-300">
                  {outcome?.margin}% {outcome?.marginChange != null && <TrendBadge change={outcome.marginChange} />}
                </span>
              </button>
              <div className="flex justify-between">
                <span className="text-sm text-muted">Stock vs S&P</span>
                <span className="font-medium text-red-400">-14%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations + side metrics */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">🎯 AI-Powered Recommendations <DemoTag /></h2>
            {AI_RECOMMENDATIONS.map((r) => (
              <RecommendationCard key={r.title} {...r} />
            ))}
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-panel p-4">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">📊 Key Metrics <DemoTag /></h3>
              <div className="space-y-3">
                {KEY_METRICS.map((m) => (
                  <div key={m.label}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted">{m.label}</span>
                      <span className={m.valueTone === 'amber' ? 'text-amber-400' : m.valueTone === 'emerald' ? 'text-emerald-400' : 'text-white'}>
                        {m.value}
                      </span>
                    </div>
                    <div className="h-2 rounded bg-slate-700">
                      <div className={`h-full rounded ${m.tone === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${m.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-panel p-4">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">⚡ Attention Required <DemoTag /></h3>
              <div className="space-y-2">
                {ATTENTION_ITEMS.map((a) => (
                  <div
                    key={a.text}
                    className={`flex items-center gap-2 rounded border p-2 ${a.tone === 'red' ? 'border-red-500/30 bg-red-900/30' : 'border-amber-500/30 bg-amber-900/30'}`}
                  >
                    <span className={a.tone === 'red' ? 'text-red-400' : 'text-amber-400'} aria-hidden>●</span>
                    <span className={`text-sm ${a.tone === 'red' ? 'text-red-300' : 'text-amber-300'}`}>{a.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
