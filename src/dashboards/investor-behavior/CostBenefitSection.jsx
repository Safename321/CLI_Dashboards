// "Is high stock price worth the investment?" cost-benefit panel.
import { COST_BENEFIT } from '../../data/datasets/investor-behavior.js';

function LedgerColumn({ heading, items, total, totalLabel, tone }) {
  const toneText = tone === 'benefit' ? 'text-emerald-400' : 'text-red-400';
  const toneBox = tone === 'benefit' ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-red-900/10 border-red-500/20';
  return (
    <div className={`rounded-lg border p-4 ${toneBox}`}>
      <h4 className={`mb-3 font-semibold ${toneText}`}>{heading}</h4>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.title} className="rounded bg-ink/50 p-3">
            <div className="font-medium text-white">{item.title}</div>
            <div className="text-sm text-muted">{item.detail}</div>
            <div className={`mt-1 text-sm ${toneText}`}>{item.value}</div>
          </div>
        ))}
        <div className="mt-3 border-t border-border pt-3">
          <div className="flex items-center justify-between">
            <span className={`font-semibold ${toneText}`}>{totalLabel}</span>
            <span className={`text-xl font-bold ${toneText}`}>{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CostBenefitSection() {
  const { benefits, benefitsTotal, costs, costsTotal, verdict } = COST_BENEFIT;
  return (
    <section className="rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-900/20 to-panel p-6">
      <h3 className="mb-4 font-semibold text-emerald-400">⚖️ Is High Stock Price Worth the Investment?</h3>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LedgerColumn
          heading="Benefits of Stock Recovery to $550+"
          items={benefits}
          total={benefitsTotal}
          totalLabel="Total Quantifiable Benefits"
          tone="benefit"
        />
        <LedgerColumn
          heading="Investment Required"
          items={costs}
          total={costsTotal}
          totalLabel="Total Investment + Risk"
          tone="cost"
        />
      </div>

      <div className="mt-6 rounded-lg border border-cyan-500/30 bg-gradient-to-r from-cyan-900/20 to-purple-900/20 p-5">
        <div className="flex items-start gap-3">
          <span className="text-3xl" aria-hidden>💡</span>
          <div>
            <h4 className="text-lg font-semibold text-accent">{verdict.headline}</h4>
            <div className="mt-2 space-y-2 text-sm leading-relaxed text-slate-300">
              <p>
                <strong className="text-emerald-400">ROI Ratio:</strong> {verdict.roi.replace('ROI Ratio: ', '')}
              </p>
              <p>
                <strong className="text-accent">Critical Success Factor:</strong>{' '}
                {verdict.criticalFactor.replace('Critical Success Factor: ', '')}
              </p>
              <p>
                <strong className="text-purple-400">Recommendation:</strong>{' '}
                {verdict.recommendation.replace('Recommendation: ', '')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
