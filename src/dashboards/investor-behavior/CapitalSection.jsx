// Capital & HR investment required for stock recovery.
import { useMemo } from 'react';
import { CAPITAL_ANALYSIS } from '../../data/datasets/investor-behavior.js';

export default function CapitalSection() {
  const { currentPrice, targetPrice, priceGap, requiredInvestments, hrEfforts } = CAPITAL_ANALYSIS;
  const totals = useMemo(
    () => ({
      capital: requiredInvestments.reduce((sum, inv) => sum + inv.amount, 0),
      hr: hrEfforts.reduce((sum, hr) => sum + hr.cost, 0),
    }),
    [requiredInvestments, hrEfforts]
  );

  return (
    <section className="rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-900/20 to-panel p-6">
      <h3 className="mb-4 font-semibold text-blue-400">💰 Capital & HR Investment Required for Stock Recovery</h3>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-ink/50 p-4 text-center">
          <div className="text-sm text-muted">Current Price</div>
          <div className="text-3xl font-bold text-red-400">${currentPrice}</div>
        </div>
        <div className="rounded-lg bg-ink/50 p-4 text-center">
          <div className="text-sm text-muted">Target Price</div>
          <div className="text-3xl font-bold text-emerald-400">${targetPrice}</div>
        </div>
        <div className="rounded-lg bg-ink/50 p-4 text-center">
          <div className="text-sm text-muted">Required Appreciation</div>
          <div className="text-3xl font-bold text-amber-400">+{priceGap}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-ink/50 p-4">
          <h4 className="mb-3 font-semibold text-white">Required Capital Investments ($M)</h4>
          <div className="space-y-2">
            {requiredInvestments.map((inv) => (
              <div key={inv.category} className="flex items-center justify-between rounded bg-panel/60 p-2">
                <div>
                  <div className="text-sm text-white">{inv.category}</div>
                  <div className="text-xs text-subtle">{inv.timeline}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-400">${inv.amount}M</div>
                  <div className="text-xs text-emerald-400">ROI: {inv.roi}</div>
                </div>
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <span className="font-semibold text-slate-300">Total Investment</span>
              <span className="text-lg font-bold text-blue-400">${totals.capital}M</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-ink/50 p-4">
          <h4 className="mb-3 font-semibold text-white">HR Initiatives & Costs ($M)</h4>
          <div className="space-y-2">
            {hrEfforts.map((hr) => (
              <div key={hr.initiative} className="flex items-center justify-between rounded bg-panel/60 p-2">
                <div>
                  <div className="text-sm text-white">{hr.initiative}</div>
                  <div className="text-xs text-subtle">{hr.impact}</div>
                </div>
                <div className="font-bold text-purple-400">${hr.cost}M</div>
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <span className="font-semibold text-slate-300">Total HR Investment</span>
              <span className="text-lg font-bold text-purple-400">${totals.hr}M</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
