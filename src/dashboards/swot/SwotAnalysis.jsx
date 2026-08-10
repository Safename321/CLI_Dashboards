// Strategic SWOT — on-page written analysis (the ~2–3 page reading requested
// 2026-08). Renders buildSwotAnalysis(): vector-by-vector breakdown, the most
// effective strategies for this competitive position (TOWS), best practices,
// managerial advice, and an expected-results timeline for every recommendation.
import { useMemo } from 'react';
import { Panel } from '../../components/primitives.jsx';
import { buildSwotAnalysis } from './analysis.js';
import { STANDING_CAVEAT } from './logic.js';
import { QUADRANT_META, SWOT_COLORS } from '../../data/datasets/swot.js';

const QUAD_ORDER = ['strength', 'weakness', 'opportunity', 'threat'];

function HorizonPill({ horizon }) {
  const tone = horizon.band === 'Structural'
    ? 'border-rose-500/40 bg-rose-900/20 text-rose-300'
    : horizon.band === 'Developmental'
      ? 'border-amber-500/40 bg-amber-900/20 text-amber-300'
      : 'border-emerald-500/40 bg-emerald-900/20 text-emerald-300';
  return (
    <span className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold ${tone}`}>
      {horizon.band} · {horizon.eta}
    </span>
  );
}

function VectorItem({ entry }) {
  const { factor: f, gapTxt, implication, bestPractice, horizon, inferred } = entry;
  const color = SWOT_COLORS[f.quadrant].dark;
  return (
    <div className="rounded-lg border border-border bg-ink/60 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        <span className="font-semibold text-slate-100">{f.label}</span>
        {inferred && <span className="text-[10px] font-semibold text-amber-400">◫ inferred</span>}
        <span className="font-mono text-[11px] text-muted">{gapTxt}</span>
        <span className="ml-auto flex items-center gap-2">
          <span className="font-mono text-xs text-accent">materiality {f.materiality.toFixed(1)}</span>
          <HorizonPill horizon={horizon} />
        </span>
      </div>
      <dl className="mt-2 space-y-1.5 text-[13px] leading-relaxed">
        <div>
          <dt className="inline font-semibold text-slate-300">What it means. </dt>
          <dd className="inline text-slate-300">{implication}</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-slate-300">Best practice. </dt>
          <dd className="inline text-slate-300">{bestPractice}</dd>
        </div>
        <div className="text-[11px] italic text-muted">
          Expect results in {horizon.eta} — {horizon.note}.
        </div>
      </dl>
    </div>
  );
}

export default function SwotAnalysis({ ranked, recommendations = [] }) {
  const a = useMemo(() => buildSwotAnalysis(ranked, recommendations), [ranked, recommendations]);
  if (!ranked?.length) return null;

  return (
    <section className="space-y-4">
      <Panel
        title="📑 Strategic analysis"
        subtitle="A full reading of the profile: every vector, the strategies that fit this position, and how long each move takes to pay off"
      >
        <p className="text-[13px] leading-relaxed text-slate-300">
          This analysis is generated live from your {ranked.length}-factor profile — {a.counts.strength} strength{a.counts.strength === 1 ? '' : 's'},
          {' '}{a.counts.weakness} weakness{a.counts.weakness === 1 ? '' : 'es'}, {a.counts.opportunity} opportunit{a.counts.opportunity === 1 ? 'y' : 'ies'} and
          {' '}{a.counts.threat} threat{a.counts.threat === 1 ? '' : 's'} — not a template. Read it top-down: the biggest bubbles carry the most strategic weight,
          and the timelines tell you when to expect movement so structural work isn't judged on a tactical clock.
        </p>
        <p className="mt-2 rounded-md border border-amber-500/30 bg-amber-900/10 px-3 py-2 text-[11px] italic text-amber-200/80">
          {STANDING_CAVEAT}
        </p>
      </Panel>

      {/* 1 — vector-by-vector breakdown, grouped by quadrant */}
      <Panel title="① Every vector, in detail">
        <div className="grid gap-4 md:grid-cols-2">
          {QUAD_ORDER.map((q) => (
            a.vectors[q].length > 0 && (
              <div key={q} className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: SWOT_COLORS[q].dark }}>
                  {QUADRANT_META[q].title}
                  <span className="ml-1.5 font-normal text-muted">· {QUADRANT_META[q].sub}</span>
                </h4>
                {a.vectors[q].map((entry) => (
                  <VectorItem key={entry.factor.id} entry={entry} />
                ))}
              </div>
            )
          ))}
        </div>
      </Panel>

      {/* 2 — most effective strategies from this position (TOWS) */}
      <Panel
        title="② Most effective strategies from this position"
        subtitle="Each pairs live factors from two quadrants — the classic TOWS plays, ordered by what to do first"
      >
        <div className="grid gap-3 md:grid-cols-2">
          {a.tows.map((s) => (
            <div key={s.key} className="rounded-lg border border-border bg-ink/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-100">{s.label}</span>
                <span className="whitespace-nowrap rounded-full border border-border bg-panel px-2 py-0.5 text-[10px] font-semibold text-muted">
                  {s.urgency}
                </span>
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-300">{s.play}</p>
              <p className="mt-1.5 text-[11px] font-mono text-accent">Horizon: {s.horizon}</p>
            </div>
          ))}
        </div>
      </Panel>

      {/* 3 — best practices + 4 — managerial advice */}
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="③ Best practices">
          <ul className="space-y-2 text-[13px] leading-relaxed text-slate-300">
            {a.bestPractices.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="④ Managerial strategy & sequencing">
          <ul className="space-y-2 text-[13px] leading-relaxed text-slate-300">
            {a.managerial.map((m, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* 5 — recommendation timelines */}
      {a.recommendations.length > 0 && (
        <Panel
          title="⑤ Recommendations & expected timelines"
          subtitle="Each action, what it addresses, and how long until you should see results"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted">
                  <th className="py-2 pr-3 font-semibold">Action</th>
                  <th className="py-2 pr-3 font-semibold">Owner</th>
                  <th className="py-2 pr-3 font-semibold">Addresses</th>
                  <th className="py-2 pr-3 font-semibold">Expected results</th>
                </tr>
              </thead>
              <tbody>
                {a.recommendations.map((r, i) => (
                  <tr key={i} className="border-b border-border/60 align-top">
                    <td className="py-2 pr-3">
                      <div className="font-semibold text-slate-200">{r.title}</div>
                      {r.mechanism && <div className="mt-0.5 text-[11px] text-muted">{r.mechanism}</div>}
                    </td>
                    <td className="py-2 pr-3 text-slate-300">{r.owner ?? '—'}</td>
                    <td className="py-2 pr-3 text-slate-300">{r.addressedLabels.join(', ') || '—'}</td>
                    <td className="py-2 pr-3">
                      <HorizonPill horizon={r.horizon} />
                      {r.measure && <div className="mt-1 text-[11px] text-muted">{r.measure}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </section>
  );
}
