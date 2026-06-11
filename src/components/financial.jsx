// Shared financial display components for the Executive cluster dashboards
// (CEO Advisory, Board Directors, Investor Relations). charts.jsx has no Area
// wrapper, so the area chart composes recharts directly here.
import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const TOOLTIP_STYLE = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: 8,
  color: '#f1f5f9',
};

// Area chart of revenue + net income across the financials years object
// ({ '2022': { revenue, netIncome, eps, operatingMargin }, ... }).
export function FinancialTrendChart({ data, title, height = 200 }) {
  const chartData = useMemo(
    () =>
      Object.entries(data || {}).map(([year, v]) => ({
        year,
        revenue: v.revenue,
        netIncome: v.netIncome,
        eps: v.eps,
        margin: v.operatingMargin,
      })),
    [data],
  );

  return (
    <div className="rounded-xl border border-border bg-panel p-4">
      <h4 className="mb-3 font-semibold text-white">{title}</h4>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis dataKey="year" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Area type="monotone" dataKey="revenue" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} name="Revenue ($B)" />
          <Area type="monotone" dataKey="netIncome" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Net Income ($B)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Analyst consensus summary (data = analystEstimates object from the dataset).
export function AnalystRatingsPanel({ data }) {
  const d = data || {};
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-900/20 to-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-semibold text-emerald-400">Analyst Consensus</h4>
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-bold text-emerald-400">{d.consensusRating}</span>
      </div>
      <div className="mb-3 grid grid-cols-4 gap-2">
        <div className="rounded bg-emerald-900/30 p-2 text-center">
          <div className="font-bold text-emerald-400">{d.strongBuy}</div>
          <div className="text-xs text-muted">Strong Buy</div>
        </div>
        <div className="rounded bg-emerald-900/20 p-2 text-center">
          <div className="font-bold text-emerald-300">{d.buy}</div>
          <div className="text-xs text-muted">Buy</div>
        </div>
        <div className="rounded bg-slate-700/50 p-2 text-center">
          <div className="font-bold text-slate-300">{d.hold}</div>
          <div className="text-xs text-muted">Hold</div>
        </div>
        <div className="rounded bg-red-900/20 p-2 text-center">
          <div className="font-bold text-red-400">{d.sell}</div>
          <div className="text-xs text-muted">Sell</div>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-muted">Price Target:</span> <span className="font-bold text-white">${d.priceTargetMean}</span>
        </div>
        <div>
          <span className="text-muted">Current:</span> <span className="font-bold text-amber-400">${d.currentPrice}</span>
        </div>
        <div>
          <span className="font-bold text-emerald-400">+{d.upside}% upside</span>
        </div>
      </div>
    </div>
  );
}

// Side-by-side acquisitions / divestitures (last 10 years, top 4 each).
export function MnAActivityPanel({ acquisitions = [], divestitures = [] }) {
  return (
    <div className="rounded-xl border border-border bg-panel p-4">
      <h4 className="mb-3 font-semibold text-white">📈 M&A Activity (Last 10 Years)</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="mb-2 text-sm font-semibold text-accent">Recent Acquisitions</div>
          <div className="space-y-2">
            {acquisitions.slice(0, 4).map((a, i) => (
              <div key={i} className="flex items-center justify-between rounded bg-slate-700/50 p-2 text-sm">
                <div>
                  <span className="text-white">{a.target}</span>
                  <span className="ml-2 text-muted">({a.year})</span>
                </div>
                {a.value && <span className="text-accent">${a.value}B</span>}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold text-amber-400">Recent Divestitures</div>
          <div className="space-y-2">
            {divestitures.slice(0, 4).map((d, i) => (
              <div key={i} className="flex items-center justify-between rounded bg-slate-700/50 p-2 text-sm">
                <div>
                  <span className="text-white">{d.asset}</span>
                  <span className="ml-2 text-muted">({d.year})</span>
                </div>
                {d.value && <span className="text-amber-400">${d.value}B</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Financial-efficiency KPI card with threshold + triggered strategy footer.
export function FinancialKPICard({ label, value, unit, threshold, thresholdDir, status, trigger }) {
  const statusColor = status === 'danger' ? 'text-red-400' : status === 'warning' ? 'text-amber-400' : 'text-emerald-400';
  const bgColor =
    status === 'danger'
      ? 'bg-red-900/20 border-red-500/30'
      : status === 'warning'
        ? 'bg-amber-900/20 border-amber-500/30'
        : 'bg-emerald-900/20 border-emerald-500/30';
  const icon = status === 'danger' ? '🔴' : status === 'warning' ? '🟡' : '🟢';
  return (
    <div className={`rounded-xl border p-4 ${bgColor}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-muted">{label}</span>
        <span className="text-lg" aria-hidden>
          {icon}
        </span>
      </div>
      <div className={`text-2xl font-bold ${statusColor}`}>
        {value}
        {unit}
      </div>
      <div className="mt-1 text-xs text-subtle">
        Threshold: {thresholdDir} {threshold}
        {unit}
      </div>
      {trigger && <div className="mt-2 rounded bg-ink px-2 py-1 text-xs text-slate-300">→ {trigger}</div>}
    </div>
  );
}
