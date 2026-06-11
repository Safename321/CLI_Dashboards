// CLI Advisory recommendation panel (local to Early Warning): collapsible
// evidence/strategy/tactics block. Tactic deliverables hand off to the shared
// report generator (legacy signature: tactic, panelTitle, evidence, strategy,
// answers, specificProblem).
import { useState } from 'react';
import { generateReport, REPORT_BUTTON_SAYINGS } from '../../reports/index.js';

export default function RecommendationPanel({ title, evidence, strategy, tactics }) {
  const [expanded, setExpanded] = useState(true);
  const [selectedTactic, setSelectedTactic] = useState(null);
  const [generating, setGenerating] = useState(false);

  const createDeliverable = (tactic) => {
    setGenerating(true);
    setTimeout(() => {
      try {
        generateReport(tactic, title, evidence, strategy, [], '');
      } catch (err) {
        console.error('[RecommendationPanel] report generation failed:', err);
      }
      setGenerating(false);
    }, 300);
  };

  return (
    <div className="mb-6 overflow-hidden rounded-r-xl border-l-4 bg-gradient-to-r from-slate-800 to-slate-900" style={{ borderLeftColor: '#64748b' }}>
      <button
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/5"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div>
          <h3 className="font-bold text-cyan-400">{title}</h3>
          <p className="text-sm text-muted">CLI Advisory Recommendation</p>
        </div>
        <span className="text-muted transition-transform" style={{ transform: expanded ? 'rotate(180deg)' : 'none' }} aria-hidden>v</span>
      </button>

      {expanded && (
        <div className="space-y-4 px-4 pb-4">
          {/* Evidence */}
          <div className="rounded-lg bg-ink/50 p-3">
            <div className="mb-2 text-xs uppercase tracking-wider text-muted">Key Evidence</div>
            <ul className="space-y-1">
              {evidence.map((e, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-cyan-400" aria-hidden>-</span>
                  <span className="text-slate-300">{e}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Strategy */}
          <div className="rounded-lg bg-ink/50 p-3">
            <div className="mb-2 text-xs uppercase tracking-wider text-muted">Recommended Strategy</div>
            <p className="text-sm text-white">{strategy}</p>
          </div>

          {/* Tactics */}
          <div>
            <div className="mb-2 text-xs uppercase tracking-wider text-muted">Actionable Tactics</div>
            <div className="space-y-2">
              {tactics.map((tactic, i) => (
                <div key={i}>
                  <button
                    onClick={() => setSelectedTactic(selectedTactic === i ? null : i)}
                    className={`w-full rounded-lg border p-3 text-left transition-all ${
                      selectedTactic === i ? 'border-cyan-500 bg-cyan-900/30' : 'border-border bg-panel hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-cyan-400">{i + 1}.</span>
                        <span className="text-sm font-medium text-white">{tactic.title}</span>
                      </div>
                      <span className="text-xs text-subtle">{selectedTactic === i ? 'hide' : 'details'}</span>
                    </div>
                  </button>
                  {selectedTactic === i && (
                    <div className="mt-1 rounded-lg border border-border/60 bg-ink/60 p-3 text-sm">
                      <p className="text-slate-300">{tactic.description}</p>
                      {tactic.canCreate && (
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-xs text-subtle">Deliverable: {tactic.deliverable}</span>
                          <button
                            onClick={() => createDeliverable(tactic)}
                            disabled={generating}
                            className="rounded bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-500 disabled:opacity-60"
                          >
                            {generating
                              ? 'Generating...'
                              : REPORT_BUTTON_SAYINGS[Math.floor(Date.now() / 1000) % REPORT_BUTTON_SAYINGS.length]}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
