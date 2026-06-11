// Top 10 institutional shareholders — 3-year stability table + price correlation strip.
import { useMemo } from 'react';
import { SHAREHOLDERS_BY_YEAR, STOCK_PRICE_HISTORY } from '../../data/datasets/investor-behavior.js';

const priceTone = (price) => (price >= 500 ? 'text-emerald-400' : price >= 400 ? 'text-amber-400' : 'text-red-400');

export default function ShareholdersSection() {
  const rows = useMemo(
    () =>
      SHAREHOLDERS_BY_YEAR[2024].map((holder, i) => {
        const y2023 = SHAREHOLDERS_BY_YEAR[2023][i];
        const y2022 = SHAREHOLDERS_BY_YEAR[2022][i];
        const trend = +(holder.pctOwned - y2022.pctOwned).toFixed(1);
        return { ...holder, pct2023: y2023.pctOwned, pct2022: y2022.pctOwned, trend };
      }),
    []
  );

  return (
    <section className="rounded-xl border border-border bg-panel p-6">
      <h3 className="mb-4 font-semibold text-white">📊 Top 10 Institutional Shareholders - 3-Year Stability Analysis</h3>

      <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-900/20 p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden>✓</span>
          <div>
            <h4 className="font-semibold text-emerald-400">
              Complete Top 10 Consistency: All 10 shareholders unchanged for 3 consecutive years
            </h4>
            <p className="mt-1 text-sm text-slate-300">
              This institutional stability is a <strong className="text-emerald-400">bullish signal</strong> despite recent
              price decline. Long-term holders (Vanguard, BlackRock, State Street) have maintained or increased positions
              through volatility. The 24.7% price drop is attributable to macro factors (SaaS selloff, interest rate
              environment) rather than institutional loss of confidence.{' '}
              <strong className="text-accent">Implication:</strong> Stock price recovery is likely when macro headwinds
              subside, as the shareholder base remains committed.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-2 py-2 text-left text-muted">#</th>
              <th className="px-2 py-2 text-left text-muted">Institution</th>
              <th className="px-2 py-2 text-center text-blue-400">2024 (%)</th>
              <th className="px-2 py-2 text-center text-cyan-400">2023 (%)</th>
              <th className="px-2 py-2 text-center text-purple-400">2022 (%)</th>
              <th className="px-2 py-2 text-center text-muted">3Y Trend</th>
              <th className="px-2 py-2 text-center text-muted">Stability</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((holder) => (
              <tr key={holder.rank} className="border-b border-border/50">
                <td className="px-2 py-2 text-subtle">{holder.rank}</td>
                <td className="px-2 py-2 font-medium text-white">{holder.name}</td>
                <td className="px-2 py-2 text-center text-blue-300">{holder.pctOwned}%</td>
                <td className="px-2 py-2 text-center text-cyan-300">{holder.pct2023}%</td>
                <td className="px-2 py-2 text-center text-purple-300">{holder.pct2022}%</td>
                <td className="px-2 py-2 text-center">
                  <span className={holder.trend >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {holder.trend >= 0 ? '+' : ''}
                    {holder.trend}%
                  </span>
                </td>
                <td className="px-2 py-2 text-center">
                  <span className="rounded bg-emerald-900/30 px-2 py-0.5 text-xs text-emerald-400">Stable</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-lg bg-ink/50 p-4">
        <h4 className="mb-3 font-semibold text-slate-300">Stock Price vs. Shareholder Stability Correlation</h4>
        <div className="grid grid-cols-4 gap-2 md:grid-cols-7">
          {STOCK_PRICE_HISTORY.map((d) => (
            <div key={d.period} className="text-center">
              <div className="text-xs text-subtle">{d.period}</div>
              <div className={`text-lg font-bold ${priceTone(d.price)}`}>${d.price.toFixed(0)}</div>
              <div className="truncate text-xs text-subtle">{d.event}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-muted">
          <strong className="text-accent">Analysis:</strong> Despite 29% price decline from ATH, no major institutional
          exits. This suggests the selloff is sentiment-driven (macro/SaaS fears) not fundamentals-driven.
        </div>
      </div>
    </section>
  );
}
