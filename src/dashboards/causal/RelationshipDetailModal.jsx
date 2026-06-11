// Detail modal for one behavioral→outcome relationship: method, sample,
// effect size in business units, and caveats.
import { TIER_META } from '../../data/datasets/causal.js';
import StarRating from './StarRating.jsx';

export default function RelationshipDetailModal({ rel, onClose }) {
  if (!rel) return null;
  const meta = TIER_META[rel.tier];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-xl border border-border bg-ink p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between">
          <div>
            <div className="text-lg font-bold text-white">{rel.from} → {rel.to}</div>
            <div className="mt-1 flex items-center gap-3">
              <span className="rounded px-2 py-0.5 text-xs font-semibold" style={{ background: meta.bg, color: meta.color }}>
                {meta.label}
              </span>
              <StarRating n={rel.stars} />
              <span className="text-xs text-subtle">Confidence tier</span>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close relationship detail" className="text-xl leading-none text-muted hover:text-white">×</button>
        </div>

        <div className="mb-4 mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded bg-panel/60 p-3">
            <div className="mb-1 text-subtle">Coefficient</div>
            <div className="font-mono text-white">
              {rel.coef >= 0 ? '+' : ''}{rel.coef} <span className="text-subtle">[CI {rel.ci[0]}, {rel.ci[1]}]</span>
            </div>
          </div>
          <div className="rounded bg-panel/60 p-3">
            <div className="mb-1 text-subtle">Sample</div>
            <div className="font-mono text-white">n = {rel.n}</div>
          </div>
          <div className="rounded bg-panel/60 p-3">
            <div className="mb-1 text-subtle">Window</div>
            <div className="text-white">{rel.window}</div>
          </div>
          <div className="rounded bg-panel/60 p-3">
            <div className="mb-1 text-subtle">Method</div>
            <div className="text-white">{rel.method}</div>
          </div>
        </div>

        <div className="mb-3 rounded border border-emerald-500/30 bg-emerald-900/20 p-3">
          <div className="mb-1 text-xs font-semibold text-emerald-300">Effect size (business units)</div>
          <div className="text-sm text-white">{rel.effectSize}</div>
        </div>
        <div className="rounded border border-amber-500/25 bg-amber-900/15 p-3">
          <div className="mb-1 text-xs font-semibold text-amber-300">Caveats</div>
          <div className="text-sm text-slate-300">{rel.caveat}</div>
        </div>
      </div>
    </div>
  );
}
