// Board & leadership changes analysis (departures vs appointments).
import { BOARD_CHANGES } from '../../data/datasets/investor-behavior.js';

function ChangeList({ heading, changes, tone }) {
  const toneText = tone === 'departure' ? 'text-red-400' : 'text-emerald-400';
  const toneBox = tone === 'departure' ? 'bg-red-900/10 border-red-500/20' : 'bg-emerald-900/10 border-emerald-500/20';
  return (
    <div className={`rounded-lg border p-4 ${toneBox}`}>
      <h4 className={`mb-3 font-semibold ${toneText}`}>{heading}</h4>
      <div className="space-y-2">
        {changes.map((change) => (
          <div key={change.name} className="rounded bg-ink/50 p-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-white">{change.name}</span>
              <span className={`text-xs ${toneText}`}>{change.year}</span>
            </div>
            <div className="text-xs text-muted">{change.role}</div>
            <div className="mt-1 text-xs text-subtle">{change.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GovernanceSection() {
  return (
    <section className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-900/20 to-panel p-6">
      <h3 className="mb-4 font-semibold text-amber-400">🏛️ Board & Leadership Changes Analysis</h3>

      <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-900/20 p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden>⚠️</span>
          <div>
            <h4 className="font-semibold text-amber-400">
              Significant Governance Transition: 4 Board departures + New CEO/CFO in 12 months
            </h4>
            <p className="mt-1 text-sm text-slate-300">
              S&P Global experienced its most significant leadership transition since the 2022 IHS Markit merger. While
              orderly and planned, this level of change introduces execution risk.{' '}
              <strong className="text-accent">OASI Implication:</strong> New leadership team must quickly establish
              Collaborative and Entrusting patterns to maintain organizational momentum. Current Vicarious (4.2) score
              suggests mentoring of successors may have been undervalued.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChangeList
          heading="Departures (2024-2025)"
          changes={BOARD_CHANGES.filter((c) => c.type === 'departure')}
          tone="departure"
        />
        <ChangeList
          heading="Appointments (2024-2025)"
          changes={BOARD_CHANGES.filter((c) => c.type === 'appointment')}
          tone="appointment"
        />
      </div>

      <div className="mt-4 rounded-lg bg-ink/50 p-3">
        <div className="text-sm text-slate-300">
          <strong className="text-accent">Investor Signal:</strong> Board refresh brings diverse expertise (UK trade
          policy, digital assets, fintech) aligned with strategic priorities. However, simultaneous CEO + CFO + Chairman
          changes in 6 months is atypical. Monitor Q1-Q2 2026 execution for signs of coordination challenges.
        </div>
      </div>
    </section>
  );
}
