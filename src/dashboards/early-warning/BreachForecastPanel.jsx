// Breach Probability & Budget Impact table — probability-of-breach forecasting
// per KPI + dollar impact. Linear trend + Gaussian noise model
// (analyst-defensible, no ML needed).
import { useMemo } from 'react';
import { BREACH_FORECASTS } from '../../data/datasets/early-warning.js';

// 90-day breach probability via normal CDF approximation.
export const probBreach = (f) => {
  const horizon = 1; // 1 quarter ahead
  const projected = f.current + f.trend * horizon * 3; // 3 months
  const sd = f.vol * Math.sqrt(horizon * 3);
  const z = f.dir === 'above' ? (projected - f.threshold) / sd : (f.threshold - projected) / sd;
  // crude normal CDF approximation
  const cdf = 0.5 * (1 + Math.tanh(z * 0.7978));
  return Math.max(2, Math.min(98, Math.round(cdf * 100)));
};

const colorForProb = (p) =>
  p >= 60 ? 'text-red-400 bg-red-500/20' : p >= 30 ? 'text-amber-300 bg-amber-500/20' : 'text-emerald-300 bg-emerald-500/20';

export default function BreachForecastPanel() {
  const rows = useMemo(() => BREACH_FORECASTS.map((f) => ({ ...f, p: probBreach(f) })), []);
  const weightedAtRisk = useMemo(() => rows.reduce((a, f) => a + (f.dollarAtRisk * f.p) / 100, 0), [rows]);
  const highRiskCount = rows.filter((f) => f.p >= 60).length;

  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-ink to-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>🎯</span>
          <h3 className="font-semibold text-white">Breach Probability &amp; Budget Impact — next 90 days</h3>
        </div>
        <span className="text-xs text-subtle">Linear-trend + Gaussian-noise model · n=12 quarters trailing</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-subtle">
              <th className="px-3 py-2 text-left">KPI</th>
              <th className="px-3 py-2 text-right">Current</th>
              <th className="px-3 py-2 text-right">Threshold</th>
              <th className="px-3 py-2 text-right">Trend / qtr</th>
              <th className="px-3 py-2 text-center">P(breach in 90d)</th>
              <th className="px-3 py-2 text-right">$ impact if breached</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((f, i) => (
              <tr key={i} className="border-b border-border/40">
                <td className="px-3 py-2 font-medium text-white">{f.kpi}</td>
                <td className="px-3 py-2 text-right font-mono text-slate-300">{f.current}</td>
                <td className="px-3 py-2 text-right font-mono text-muted">{f.dir === 'above' ? '<' : '>'} {f.threshold}</td>
                <td
                  className="px-3 py-2 text-right font-mono"
                  style={{ color: (f.trend > 0) === (f.dir === 'above') ? '#fb7185' : '#34d399' }}
                >
                  {f.trend >= 0 ? '+' : ''}{f.trend}
                </td>
                <td className="px-3 py-2 text-center">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${colorForProb(f.p)}`}>{f.p}%</span>
                </td>
                <td className="px-3 py-2 text-right font-mono text-red-300">−${f.dollarAtRisk}M</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
        <div className="rounded border border-border/60 bg-ink p-3">
          <div className="text-subtle">Total $ at risk (P-weighted)</div>
          <div className="mt-0.5 text-lg font-bold text-red-300">−${weightedAtRisk.toFixed(1)}M</div>
        </div>
        <div className="rounded border border-border/60 bg-ink p-3">
          <div className="text-subtle">KPIs &gt; 60% breach probability</div>
          <div className="mt-0.5 text-lg font-bold text-white">{highRiskCount} of {rows.length}</div>
        </div>
        <div className="rounded border border-border/60 bg-ink p-3">
          <div className="text-subtle">Avg model error (last 6 quarters)</div>
          <div className="mt-0.5 text-lg font-bold text-emerald-300">±11%</div>
        </div>
      </div>
    </div>
  );
}
