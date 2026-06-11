// CLI Advisory recommendation panel (compact port of legacy RecommendationPanel):
// severity-coloured header, collapsible evidence/strategy/tactics, optional
// document download. Used by ExternalDashboard and MeetingPrepDashboard.
import { useState } from 'react';

const SEVERITIES = {
  critical: { accent: '#64748b', text: 'text-accent', bg: 'bg-gradient-to-r from-slate-800 to-slate-900' },
  warning: { accent: '#eab308', text: 'text-yellow-400', bg: 'bg-yellow-900/30' },
  info: { accent: '#3b82f6', text: 'text-blue-400', bg: 'bg-blue-900/30' },
};

export default function AdvisoryPanel({ severity, title, evidence = [], strategy, tactics = [], download }) {
  const [expanded, setExpanded] = useState(true);
  const [selectedTactic, setSelectedTactic] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState(null); // null | downloading | complete
  const c = SEVERITIES[severity] || SEVERITIES.info;

  const handleDownload = () => {
    setDownloadStatus('downloading');
    try {
      download.onDownload();
      setDownloadStatus('complete');
    } catch (err) {
      console.error('[AdvisoryPanel] download generation failed:', err);
      setDownloadStatus(null);
      return;
    }
    setTimeout(() => setDownloadStatus(null), 2000);
  };

  return (
    <section className={`${c.bg} overflow-hidden rounded-r-xl border-l-4`} style={{ borderLeftColor: c.accent }}>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/5"
        aria-expanded={expanded}
      >
        <div>
          <h3 className={`font-bold ${c.text}`}>{title}</h3>
          <p className="text-sm text-muted">CLI Advisory Recommendation</p>
        </div>
        <span aria-hidden className="text-muted transition-transform" style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}>
          v
        </span>
      </button>

      {expanded && (
        <div className="space-y-4 px-4 pb-4">
          {download && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-900/30 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-emerald-400">{download.label || 'Pre-Generated Presentation Ready'}</div>
                  <div className="text-xs text-muted">Downloads as HTML — Print to PDF in browser</div>
                </div>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloadStatus === 'downloading'}
                  className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                    downloadStatus === 'complete' ? 'bg-emerald-500' : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  {downloadStatus === 'downloading' ? 'Generating...' : downloadStatus === 'complete' ? 'Downloaded!' : '📄 Download'}
                </button>
              </div>
            </div>
          )}

          {evidence.length > 0 && (
            <div className="rounded-lg bg-ink/60 p-3">
              <div className="mb-2 text-xs uppercase tracking-wider text-muted">Key Evidence</div>
              <ul className="space-y-1">
                {evidence.map((e) => (
                  <li key={e} className="flex items-start gap-2 text-sm">
                    <span className={c.text}>-</span>
                    <span className="text-slate-300">{e}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {strategy && (
            <div className="rounded-lg bg-ink/60 p-3">
              <div className="mb-2 text-xs uppercase tracking-wider text-muted">Recommended Strategy</div>
              <p className="text-sm text-white">{strategy}</p>
            </div>
          )}

          {tactics.length > 0 && (
            <div>
              <div className="mb-2 text-xs uppercase tracking-wider text-muted">Actionable Tactics</div>
              <div className="space-y-2">
                {tactics.map((t, i) => (
                  <button
                    key={t.title}
                    type="button"
                    onClick={() => setSelectedTactic(selectedTactic === i ? null : i)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selectedTactic === i ? 'border-accent bg-cyan-900/30' : 'border-border bg-panel hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-white">
                        <span className="mr-2 font-bold text-accent">{i + 1}.</span>
                        {t.title}
                      </span>
                      <span className="rounded border border-border px-2 py-0.5 text-[11px] text-muted">{t.deliverable}</span>
                    </div>
                    {selectedTactic === i && <p className="mt-2 text-xs text-muted">{t.description}</p>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
