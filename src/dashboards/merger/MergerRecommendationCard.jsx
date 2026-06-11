// Expandable recommendation card for acquired-talent optimization actions.
// Ported from v1.24L App.jsx MergerRecommendationCard (lines 7096-7159).
import { useState } from 'react';
import { generateReport } from '../../reports/index.js';

const PRIORITY_STYLES = {
  critical: { bg: 'bg-red-900/20', border: 'border-red-500/50', badge: 'bg-red-500' },
  high: { bg: 'bg-amber-900/20', border: 'border-amber-500/50', badge: 'bg-amber-500' },
  medium: { bg: 'bg-cyan-900/20', border: 'border-cyan-500/50', badge: 'bg-cyan-500' },
};

export default function MergerRecommendationCard({ recommendation, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [downloading, setDownloading] = useState(false);
  const rec = recommendation;
  const style = PRIORITY_STYLES[rec.priority] || PRIORITY_STYLES.medium;

  const handleDownload = (e) => {
    e.stopPropagation();
    setDownloading(true);
    setTimeout(() => {
      try {
        // Shared report generator (legacy used a bespoke CEO talking-points HTML doc).
        generateReport(
          {
            title: rec.title,
            deliverable: `CEO Talking Points: ${rec.title}`,
            description: rec.description,
            priority: rec.priority,
            tactics: rec.tactics,
            expectedImpact: rec.expectedImpact,
          },
          'Post Merger Updates',
          rec.evidence,
          rec.metric,
          [],
          ''
        );
      } catch (err) {
        console.error('[MergerRecommendationCard] talking points report failed:', err);
      }
      setDownloading(false);
    }, 500);
  };

  return (
    <div className={`${style.bg} border ${style.border} overflow-hidden rounded-lg`}>
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between p-4 text-left"
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className={`rounded px-2 py-0.5 text-xs font-bold text-white ${style.badge}`}>{rec.priority.toUpperCase()}</span>
          <span className="font-semibold text-white">{rec.title}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-3 text-xs">
            <span className="text-emerald-400">+{rec.expectedImpact.happiness} happiness</span>
            <span className="text-cyan-400">+{rec.expectedImpact.effectiveness} effectiveness</span>
            <span className="text-purple-400">+{rec.expectedImpact.retention}% retention</span>
          </div>
          <span aria-hidden className={`text-xl transition-transform ${expanded ? 'rotate-180' : ''}`}>⌄</span>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-border/50 px-4 pb-4 pt-4">
          <div className="mb-3 flex items-start justify-between">
            <p className="flex-1 text-sm text-slate-300">{rec.description}</p>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className={`ml-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                downloading
                  ? 'bg-slate-600 text-slate-400'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
              }`}
            >
              {downloading ? '⏳ Generating...' : '📄 Talking Pts'}
            </button>
          </div>
          <div className="mb-3 text-sm font-medium text-accent">📊 {rec.metric}</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="mb-2 text-xs uppercase text-muted">Evidence</div>
              {rec.evidence.map((e, i) => (
                <div key={i} className="mb-1 text-sm text-slate-300">• {e}</div>
              ))}
            </div>
            <div>
              <div className="mb-2 text-xs uppercase text-muted">Action Plan</div>
              {rec.tactics.map((t, i) => (
                <div key={i} className="mb-1 flex items-center justify-between rounded bg-slate-800/50 p-2 text-sm">
                  <span className="text-white">{t.action}</span>
                  <span className="text-xs text-cyan-400">{t.timeline}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
