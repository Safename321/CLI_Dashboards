// Behavioral-Outcome Patterns (view id: causal-analysis, icon 🔗).
// Relationships between behavioral drivers and business outcomes — colored by
// evidence tier. Honest framing: most are correlational, some time-lagged,
// few quasi-experimental; the dashboard makes that distinction visible.
import { useMemo, useState } from 'react';
import DashboardShell from '../../components/DashboardShell.jsx';
import { Panel } from '../../components/primitives.jsx';
import { BEHAVIORAL_RELATIONSHIPS, TIER_META } from '../../data/datasets/causal.js';
import StarRating from './StarRating.jsx';
import RelationshipDetailModal from './RelationshipDetailModal.jsx';
import BehavioralMatrix from './BehavioralMatrix.jsx';
import BehavioralSimulator from './BehavioralSimulator.jsx';

const Disclosure = ({ summary, hint, children }) => (
  <details className="mb-4 overflow-hidden rounded-lg border border-border/60 bg-ink/50">
    <summary className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-xs hover:bg-ink/80">
      <span style={{ color: '#fbbf24' }}>ⓘ</span>
      <span className="text-slate-300">
        <span className="font-semibold">{summary}</span>
        <span className="text-subtle"> &nbsp;{hint}</span>
      </span>
    </summary>
    <div className="border-t border-border/40 px-4 pb-3 pt-1 text-xs leading-relaxed text-muted">{children}</div>
  </details>
);

export default function CausalAnalysisDashboard() {
  const [selected, setSelected] = useState(null);
  const counts = useMemo(
    () => BEHAVIORAL_RELATIONSHIPS.reduce((a, r) => { a[r.tier] = (a[r.tier] || 0) + 1; return a; }, {}),
    [],
  );
  const sorted = useMemo(() => [...BEHAVIORAL_RELATIONSHIPS].sort((a, b) => b.stars - a.stars), []);

  return (
    <DashboardShell
      title="Behavioral-Outcome Patterns"
      icon="🔗"
      subtitle="Relationships between behavioral drivers and business outcomes — colored by evidence tier, sized by effect strength. Click any cell for method, sample, effect size in dollars, and caveats."
    >
      <div className="space-y-6">
        {/* Evidence tier legend */}
        <Panel>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-semibold text-muted">Evidence tiers:</span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1 w-4 rounded" style={{ background: TIER_META['quasi-exp'].color }} />
              <span className="text-emerald-300">Quasi-experimental ★★★★</span>
              <span className="text-subtle">({counts['quasi-exp'] || 0})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1 w-4 rounded" style={{ background: TIER_META['time-lag'].color }} />
              <span className="text-amber-300">Time-lagged ★★★</span>
              <span className="text-subtle">({counts['time-lag'] || 0})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1 w-4 rounded" style={{ background: TIER_META['cross-sect'].color }} />
              <span className="text-red-300">Cross-sectional ★★</span>
              <span className="text-subtle">({counts['cross-sect'] || 0})</span>
            </span>
            <span className="ml-auto text-subtle">Line thickness = |coefficient|</span>
          </div>
        </Panel>

        {/* Pivotable Behavioral × Outcome Matrix */}
        <Panel title="Behavioral × Outcome Matrix" right={<span className="text-xs text-subtle">CLI cross-client panel · pivot axes and color modes to explore</span>}>
          <Disclosure summary="Why is the matrix mostly empty?" hint="(6 of 36 cells filled — click to read)">
            <p className="mb-2">
              <span className="font-semibold text-slate-200">This is intentional, not a bug.</span> CLI has rigorously measured 6 driver→outcome relationships across its cross-client panel.
              The other 30 cells aren't claims we haven't proven — they're <span className="text-slate-200">questions we haven't yet measured</span>.
            </p>
            <p className="mb-2">
              <span className="font-semibold text-slate-200">Why we show empty cells anyway:</span> a behavioral platform that only shows what it's measured looks small.
              A platform that shows the full grid — with honesty about gaps — looks like a research program with room to grow. Every new client deployment fills more cells.
            </p>
            <p>
              <span className="font-semibold text-slate-200">What the sparseness hides:</span> Manager Quality almost certainly affects multiple outcomes (not just Retention), and Psychological Safety
              likely also drives Retention — but we don't yet have data clean enough to publish those relationships at the same evidence tier as the six shown.
              Pivoting the axes (try Color by → Effect size, or swap Rows/Columns) sometimes makes the existing relationships easier to see in context.
            </p>
          </Disclosure>
          <BehavioralMatrix onSelect={setSelected} />
        </Panel>

        {/* What-if Simulator */}
        <Panel title="What-if Simulator" right={<span className="text-xs text-subtle">Move sliders → projected dollar impact updates live</span>}>
          <Disclosure summary="How accurate are these projections?" hint="(read this before quoting numbers to the board)">
            <p className="mb-2">
              <span className="font-semibold text-slate-200">The model is linear.</span> Each slider's impact is computed as <span className="font-mono text-slate-300">elasticity × change</span>.
              In plain terms: going from a "5" to a "6" on Manager Quality is assumed to produce the same dollar impact as going from "7" to "8."
              <span className="text-slate-200"> In reality, behavioral effects usually saturate</span> — the first improvements yield the most, later improvements yield less.
              We use linear because the data does not yet tell us the curvature.
            </p>
            <p className="mb-2">
              <span className="font-semibold text-slate-200">Confidence labels are the safety net.</span> The green band on each slider shows the range we have actual evidence for.
              Inside the green band, the projection is grounded in measured data. Outside it, the confidence label degrades to "slight," "significant,"
              and "no evidence" extrapolation — and the confidence-weighted total scales down accordingly (×1.0 / ×0.65 / ×0.35 / ×0.10).
            </p>
            <p className="mb-2">
              <span className="font-semibold text-slate-200">What this means for the board:</span> use the <span className="font-semibold text-cyan-300">confidence-weighted</span> number,
              not the unweighted one. The unweighted total is what the math says; the weighted total is what we'll defend in a CFO conversation.
              Quote the weighted number, show the disclosure, win the credibility.
            </p>
            <p>
              <span className="font-semibold text-slate-200">What we'd build with more data:</span> non-linear elasticities (saturation curves), interaction effects between drivers,
              and per-client elasticity calibration. Those require 18–24 more months of panel data than we currently have.
            </p>
          </Disclosure>
          <BehavioralSimulator onSelect={setSelected} />
        </Panel>

        {/* Relationship table — same data, scannable form */}
        <Panel title="All Relationships — sorted by evidence tier">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="px-3 py-2 text-left">Relationship</th>
                  <th className="px-3 py-2 text-left">Tier</th>
                  <th className="px-3 py-2 text-center">Confidence</th>
                  <th className="px-3 py-2 text-center">Coef. [95% CI]</th>
                  <th className="px-3 py-2 text-center">n</th>
                  <th className="px-3 py-2 text-left">Effect ($)</th>
                  <th className="px-3 py-2 text-right" aria-hidden />
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => {
                  const meta = TIER_META[r.tier];
                  return (
                    <tr key={r.id} className="cursor-pointer border-b border-border/40 hover:bg-border/30" onClick={() => setSelected(r)}>
                      <td className="px-3 py-2 text-white">{r.from} → {r.to}</td>
                      <td className="px-3 py-2">
                        <span className="rounded px-2 py-0.5 text-xs" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                      </td>
                      <td className="px-3 py-2 text-center"><StarRating n={r.stars} /></td>
                      <td className="px-3 py-2 text-center font-mono text-slate-300">
                        {r.coef >= 0 ? '+' : ''}{r.coef} <span className="text-subtle">[{r.ci[0]}, {r.ci[1]}]</span>
                      </td>
                      <td className="px-3 py-2 text-center text-muted">{r.n}</td>
                      <td className="px-3 py-2 text-emerald-300">{r.effectSize}</td>
                      <td className="px-3 py-2 text-right text-cyan-400">view ↗</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Methodology footer */}
        <div className="rounded-xl border border-border/50 bg-ink/50 p-4 text-xs text-muted">
          <span className="font-semibold text-slate-300">Methodology:</span> Cross-sectional correlations from current SPGI OASI deployment (n=847).
          Time-lagged correlations from CLI cross-client panel data (16–23 quarters depending on relationship).
          Quasi-experimental estimates from difference-in-differences analysis using staggered CLI training rollout dates.
          All effect sizes translated to SPGI business units (revenue, headcount, retention) using current compensation and ARR base.
          Confidence intervals are 95%. We show effect sizes alongside coefficients because <span className="text-slate-300">r-values without business translation invite either over- or under-reaction</span>.
        </div>
      </div>

      <RelationshipDetailModal rel={selected} onClose={() => setSelected(null)} />
    </DashboardShell>
  );
}
