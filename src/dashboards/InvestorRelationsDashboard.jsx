// Investor Relations — SPGI financial performance, analyst coverage, guidance,
// divisions, M&A, and media sentiment (view id: investor-relations).
import { useMemo } from 'react';
import DashboardShell from '../components/DashboardShell.jsx';
import DemoDataBanner from '../components/DemoDataBanner.jsx';
import RecommendationPanel from '../components/RecommendationPanel.jsx';
import { FinancialTrendChart, AnalystRatingsPanel, MnAActivityPanel } from '../components/financial.jsx';
import { useData, useYearData } from '../data/DataContext.jsx';
import { IR_ALERT, IR_PRICE_52W, IR_DIVIDEND_NOTE } from '../data/datasets/executive.js';

// Sign-aware formatting helpers for YoY deltas.
const signed = (v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}`;
const pctChange = (curr, prev) => (curr != null && prev ? `${signed((curr / prev - 1) * 100)}%` : null);
const ppChange = (curr, prev) => (curr != null && prev != null ? `${signed(curr - prev)} pp` : null);

export default function InvestorRelationsDashboard({ yearData, onMetricClick }) {
  const { data } = useData();
  const latest = useYearData();
  const current = yearData || latest;

  const guidance = data?.guidance2026 || { revenueRange: { low: 0, high: 0 }, epsRange: { low: 0, high: 0 }, consensusEps: 0, dividendPerShare: 0 };
  const analysts = data?.analystEstimates || { consensusRating: 'N/A', strongBuy: 0, buy: 0, hold: 0, sell: 0, priceTargetMean: 0, currentPrice: 0, upside: 0 };
  const sentiment = data?.sentiment || {};

  // Prior fiscal year for YoY comparisons.
  const prior = useMemo(() => {
    const fin = data?.financials || {};
    const years = Object.keys(fin).sort();
    return current ? fin[years[years.indexOf(String(current.year)) - 1]] : null;
  }, [data, current]);

  const perfTiles = useMemo(() => {
    if (!current) return [];
    return [
      { key: 'revenue', label: 'Revenue', value: `$${current.revenue}B`, delta: `+${current.revenueGrowth}% YoY` },
      { key: 'netIncome', label: 'Net Income', value: `$${current.netIncome}B`, delta: `${pctChange(current.netIncome, prior?.netIncome) ?? '—'} YoY` },
      { key: 'adjustedEps', label: 'Adjusted EPS', value: `$${current.adjustedEps}`, delta: `${pctChange(current.adjustedEps, prior?.adjustedEps) ?? '—'} YoY` },
      { key: 'adjustedOperatingMargin', label: 'Adj. Op Margin', value: `${current.adjustedOperatingMargin}%`, delta: ppChange(current.adjustedOperatingMargin, prior?.adjustedOperatingMargin) ?? '—' },
      { key: 'netMargin', label: 'Net Margin', value: `${current.netMargin}%`, delta: ppChange(current.netMargin, prior?.netMargin) ?? '—' },
    ];
  }, [current, prior]);

  const alertEvidence = [
    `Analyst consensus: ${analysts.consensusRating} (${analysts.strongBuy} Strong Buy, ${analysts.buy} Buy)`,
    `Average price target: $${analysts.priceTargetMean} (${analysts.upside}% upside from $${analysts.currentPrice})`,
    `FY${current?.year || '2025'} Revenue: $${current?.revenue}B (+${current?.revenueGrowth}% YoY)`,
    `FY${current?.year || '2025'} Adjusted EPS: $${current?.adjustedEps} (${pctChange(current?.adjustedEps, prior?.adjustedEps) ?? '—'} YoY)`,
  ];
  const alertStrategy =
    `Stock declined 15.7% post-earnings despite solid results. 2026 guidance of $${guidance.epsRange?.low}-$${guidance.epsRange?.high} EPS came in below ` +
    `consensus $${guidance.consensusEps}. Strong institutional conviction with ${analysts.strongBuy} Strong Buy ratings suggests buying opportunity.`;

  const revGuidanceGrowth =
    current?.revenue && guidance.revenueRange?.low
      ? `${signed((guidance.revenueRange.low / current.revenue - 1) * 100)}% to ${signed((guidance.revenueRange.high / current.revenue - 1) * 100)}% YoY`
      : null;

  return (
    <DashboardShell
      title="Investor Relations"
      icon="💼"
      alerts={1}
      subtitle="S&P Global Inc. (NYSE: SPGI) • Financial Performance & Analyst Coverage"
      actions={
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-muted">Current Price</div>
            <div className="text-2xl font-bold text-amber-400">${analysts.currentPrice}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted">52W Range</div>
            <div className="font-medium text-white">{IR_PRICE_52W}</div>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <DemoDataBanner />

        <RecommendationPanel
          severity={IR_ALERT.severity}
          title={IR_ALERT.title}
          evidence={alertEvidence}
          strategy={alertStrategy}
          tactics={IR_ALERT.tactics}
          downloadUrl={IR_ALERT.downloadUrl}
          downloadLabel={IR_ALERT.downloadLabel}
          reportData={data}
        />

        <AnalystRatingsPanel data={analysts} />

        {/* Financial performance vs prior year */}
        <section className="rounded-xl border border-border bg-panel p-6">
          <h3 className="mb-4 font-semibold text-white">📊 FY{current?.year || ''} Financial Performance vs Prior Year</h3>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {perfTiles.map((t) => (
              <button
                key={t.key}
                onClick={() => onMetricClick?.(t.key, t.label)}
                className="rounded-lg border border-emerald-500/30 bg-emerald-900/20 p-4 text-center transition-colors hover:border-emerald-400/60"
              >
                <div className="text-2xl font-bold text-emerald-400">{t.value}</div>
                <div className="text-sm text-muted">{t.label}</div>
                <div className="mt-1 text-xs text-emerald-400">{t.delta}</div>
              </button>
            ))}
          </div>
        </section>

        {/* 2026 guidance vs consensus */}
        <section className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-900/20 to-panel p-6">
          <h3 className="mb-4 font-semibold text-amber-400">📈 FY2026 Guidance vs Consensus</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <div className="mb-2 text-sm text-muted">Revenue Guidance</div>
              <div className="text-2xl font-bold text-white">
                ${guidance.revenueRange?.low || 0}B - ${guidance.revenueRange?.high || 0}B
              </div>
              {revGuidanceGrowth && <div className="mt-1 text-xs text-subtle">{revGuidanceGrowth}</div>}
            </div>
            <div>
              <div className="mb-2 text-sm text-muted">EPS Guidance</div>
              <div className="text-2xl font-bold text-white">
                ${guidance.epsRange?.low || 0} - ${guidance.epsRange?.high || 0}
              </div>
              <div className="mt-1 text-xs text-amber-400">Consensus: ${guidance.consensusEps} (slight miss)</div>
            </div>
            <div>
              <div className="mb-2 text-sm text-muted">Dividend</div>
              <div className="text-2xl font-bold text-white">${guidance.dividendPerShare}/qtr</div>
              <div className="mt-1 text-xs text-emerald-400">{IR_DIVIDEND_NOTE}</div>
            </div>
          </div>
        </section>

        {/* Division performance */}
        <section className="rounded-xl border border-border bg-panel p-6">
          <h3 className="mb-4 font-semibold text-white">🏢 Division Performance (Operating Margins)</h3>
          <div className="space-y-3">
            {(data?.divisions || []).map((div) => (
              <div key={div.name} className="flex items-center gap-4">
                <div className="w-40 text-slate-300">{div.name}</div>
                <div className="flex h-6 flex-1 overflow-hidden rounded-lg bg-slate-700">
                  <div className="flex h-full items-center justify-end bg-cyan-600 px-2" style={{ width: `${(div.operatingMargin / 70) * 100}%` }}>
                    <span className="text-xs font-medium text-white">{div.operatingMargin}%</span>
                  </div>
                </div>
                <div className="w-20 text-right">
                  <span className="text-xs text-subtle">Adj: </span>
                  <span className="text-sm font-medium text-emerald-400">{div.adjustedMargin}%</span>
                </div>
                {div.status && <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">{div.status}</span>}
              </div>
            ))}
          </div>
        </section>

        <MnAActivityPanel acquisitions={data?.acquisitions || []} divestitures={data?.divestitures || []} />

        <FinancialTrendChart data={data?.financials || {}} title="📈 Revenue & Net Income Trend (2022-2025)" />

        {/* Media sentiment */}
        <section className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-purple-400">📰 Media Sentiment Analysis (Last 20 Articles)</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Overall:</span>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-bold text-emerald-400">{sentiment.overallSentiment || 'N/A'}</span>
            </div>
          </div>
          <div className="mb-4 grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-emerald-900/20 p-3 text-center">
              <div className="text-2xl font-bold text-emerald-400">{sentiment.positive || 0}</div>
              <div className="text-sm text-muted">Positive</div>
            </div>
            <div className="rounded-lg bg-slate-700/50 p-3 text-center">
              <div className="text-2xl font-bold text-slate-300">{sentiment.neutral || 0}</div>
              <div className="text-sm text-muted">Neutral</div>
            </div>
            <div className="rounded-lg bg-red-900/20 p-3 text-center">
              <div className="text-2xl font-bold text-red-400">{sentiment.negative || 0}</div>
              <div className="text-sm text-muted">Negative</div>
            </div>
          </div>
          <div className="text-sm text-muted">
            <span className="font-medium text-white">Key Themes: </span>
            {(sentiment.keyThemes || []).join(' • ')}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
