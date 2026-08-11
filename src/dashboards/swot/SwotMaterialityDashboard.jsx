// Strategic SWOT — Materiality-Bubble dashboard (view id `swot`).
// Spec: CLI_SWOT_Dashboard_Spec (July 4, 2026). Standalone page; the chart is
// also embeddable in CEO Advisory (§8.2) via SwotBubbleChart directly.
//
// Demo build: renders the §6.1 reference profile. Real tenant: factors are
// computed live from /dashboard/org-oasi through the per-tenant `swotConfig`
// dataset (desired ranges + interdependency model — §7 configurable per
// profile), with CLI defaults when no config is stored.
import { useMemo, useRef, useState } from 'react';
import DashboardShell from '../../components/DashboardShell.jsx';
import { Panel } from '../../components/primitives.jsx';
import SwotBubbleChart from './SwotBubbleChart.jsx';
import SwotAnalysis from './SwotAnalysis.jsx';
import { rankFactors, classifyEvidence, buildExecSummary } from './logic.js';
import { openSwotReport } from './report.js';
import useSwotData from './useSwotData.js';
import { QUADRANT_META, SWOT_COLORS } from '../../data/datasets/swot.js';

function FactorDetail({ factor, onClose }) {
  if (!factor) return null;
  const inferred = classifyEvidence(factor) === 'inferred';
  return (
    <Panel
      title={`${factor.label}`}
      right={<button onClick={onClose} className="text-xs text-muted hover:text-slate-200">✕ Close</button>}
    >
      <div className="space-y-2 text-sm text-slate-200">
        <p>
          <span className="rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
            style={{ borderColor: SWOT_COLORS[factor.quadrant].dark, color: SWOT_COLORS[factor.quadrant].dark }}>
            {QUADRANT_META[factor.quadrant].title}
          </span>
          <span className={`ml-2 text-[11px] font-semibold ${inferred ? 'text-amber-400' : 'text-emerald-400'}`}>
            {inferred ? '◫ Inferred strategic reading' : '● Firm — backed by a measured score'}
          </span>
          {factor.achievingStylesSet && (
            <span className="ml-2 text-[11px] text-muted">({factor.achievingStylesSet} set)</span>
          )}
        </p>
        {factor.asiScore != null && (
          <p className="font-mono text-xs text-slate-300">
            Score {factor.asiScore.toFixed(2)}
            {factor.asiDesiredRange && ` · desired ${factor.asiDesiredRange[0]}–${factor.asiDesiredRange[1]}`}
            {factor.overReliance && ' · ▲ over-reliance'}
          </p>
        )}
        <p className="text-muted">{factor.description}</p>
        <div className="grid grid-cols-4 gap-2 pt-1 text-center">
          {[
            ['Materiality', factor.materiality?.toFixed(1) ?? '—'],
            ['Leverage ×.45', factor.leverage],
            ['Gap ×.35', typeof factor.gapFromDesired === 'number' ? factor.gapFromDesired.toFixed(1) : factor.gapFromDesired],
            ['Irrevers. ×.20', factor.irreversibility],
          ].map(([l, v]) => (
            <div key={l} className="rounded-md border border-border bg-ink px-2 py-1.5">
              <div className="font-mono text-sm text-accent">{v}</div>
              <div className="text-[9px] uppercase tracking-wider text-muted">{l}</div>
            </div>
          ))}
        </div>
        {factor.gates?.length > 0 && (
          <p className="text-[11px] text-muted">Gates: {factor.gates.join(', ')}</p>
        )}
      </div>
    </Panel>
  );
}

export default function SwotMaterialityDashboard() {
  const data = useSwotData();
  const [selected, setSelected] = useState(null);
  const [hover, setHover] = useState(null);       // { factor, x, y }
  const wrapRef = useRef(null);
  const svgWrapRef = useRef(null);

  const ranked = useMemo(
    () => (data.status === 'ready' ? rankFactors(data.factors) : []),
    [data],
  );

  const onFactorHover = (f, e) => {
    if (!f) { setHover(null); return; }
    const rect = wrapRef.current?.getBoundingClientRect();
    setHover({
      factor: f,
      x: (e?.clientX ?? 0) - (rect?.left ?? 0) + 14,
      y: (e?.clientY ?? 0) - (rect?.top ?? 0) + 10,
    });
  };

  const downloadSvg = () => {
    const svg = svgWrapRef.current?.querySelector('svg');
    if (!svg) return;
    const clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('style', 'background:#0b1220');
    const blob = new Blob([clone.outerHTML], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cli-strategic-swot.svg';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildExecSummary(ranked));
    } catch { /* clipboard denied — non-fatal */ }
  };

  let body;
  if (data.status === 'loading') {
    body = <p className="mx-auto mt-10 max-w-xl text-sm text-muted">Loading your organization's profile…</p>;
  } else if (data.status === 'error') {
    body = (
      <div className="mx-auto mt-10 max-w-xl rounded-xl border border-border bg-panel p-8">
        <p className="text-sm font-semibold text-red-400">Couldn't load your organization's assessment data.</p>
        <p className="mt-2 text-sm text-muted">Refresh and sign in again — if it persists, contact your administrator.</p>
      </div>
    );
  } else if (data.status === 'empty') {
    body = (
      <div className="mx-auto mt-10 max-w-xl rounded-xl border border-border bg-panel p-8">
        <p className="text-sm font-semibold text-amber-400">No completed assessments yet.</p>
        <p className="mt-2 text-sm text-muted">
          The Strategic SWOT is computed from your organization's synced OASI/ASI scores. Assign CLI
          instruments to your employees; once results sync, the materiality read appears here.
        </p>
      </div>
    );
  }

  return (
    <DashboardShell
      title="Strategic SWOT"
      icon="💠"
      subtitle="Materiality-Bubble method — size = materiality · color = quadrant + styles set · fill = confidence"
      actions={data.status === 'ready' && (
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${data.isLive ? 'border-emerald-500/50 bg-emerald-900/20 text-emerald-400' : 'border-amber-500/50 bg-amber-900/20 text-amber-400'}`}>
            {data.isLive ? data.meta.subtitle : 'Reference profile — demo build'}
          </span>
          <button onClick={downloadSvg} className="rounded-md border border-border bg-ink px-3 py-1.5 text-xs font-semibold text-slate-100 hover:border-accent">⬇ SVG</button>
          <button onClick={copySummary} className="rounded-md border border-border bg-ink px-3 py-1.5 text-xs font-semibold text-slate-100 hover:border-accent">⧉ Summary</button>
          <button
            onClick={() => openSwotReport({
              factors: data.factors,
              arrows: data.arrows,
              title: data.meta.title,
              subtitle: data.meta.subtitle,
              meta: data.meta,
              recommendations: data.recommendations,
            })}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
          >
            📄 Full report
          </button>
        </div>
      )}
    >
      {body ?? (
        <div ref={wrapRef} className="relative">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div ref={svgWrapRef} className="rounded-xl border border-border bg-panel p-4">
              {/* chart rendered at 70% width (2026-08 request: reduce SWOT chart
                  size 30%); centered, leaving breathing room around it */}
              <div className="mx-auto" style={{ maxWidth: '70%' }}>
                <SwotBubbleChart
                  factors={data.factors}
                  arrows={data.arrows}
                  onFactorClick={setSelected}
                  onFactorHover={onFactorHover}
                  highlightId={selected?.id ?? null}
                  className="w-full"
                />
              </div>
            </div>
            <div className="space-y-4">
              {selected ? (
                <FactorDetail factor={ranked.find((f) => f.id === selected.id) ?? selected} onClose={() => setSelected(null)} />
              ) : (
                <Panel title="📌 The strategic story">
                  <p className="text-sm leading-relaxed text-slate-300">{buildExecSummary(ranked)}</p>
                  <p className="mt-3 text-[11px] italic text-muted">Click a bubble for its materiality breakdown.</p>
                </Panel>
              )}
              <Panel title="🏁 Top factors by materiality">
                <ul className="space-y-1.5">
                  {ranked.slice(0, 6).map((f) => (
                    <li key={f.id}>
                      <button
                        onClick={() => setSelected(f)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs text-slate-200 hover:bg-ink"
                      >
                        <span className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ background: SWOT_COLORS[f.quadrant].dark }} />
                        <span className="flex-1 font-semibold">{f.label}</span>
                        {classifyEvidence(f) === 'inferred' && <span className="text-[9px] text-amber-400">◫</span>}
                        <span className="font-mono text-accent">{f.materiality.toFixed(1)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          </div>

          <div className="mt-6">
            <SwotAnalysis ranked={ranked} recommendations={data.recommendations} />
          </div>

          {hover?.factor && (
            <div
              className="pointer-events-none absolute z-30 max-w-[260px] rounded-lg border border-border bg-panel px-3 py-2 text-xs shadow-xl"
              style={{ left: hover.x, top: hover.y }}
            >
              <div className="font-semibold text-slate-100">{hover.factor.label}</div>
              <div className="mt-0.5 text-muted">
                {QUADRANT_META[hover.factor.quadrant].title}
                {' · '}{classifyEvidence(hover.factor) === 'inferred' ? 'inferred' : 'firm'}
                {hover.factor.asiScore != null && ` · score ${hover.factor.asiScore.toFixed(2)}`}
              </div>
              <div className="mt-0.5 font-mono text-accent">materiality {hover.factor.materiality?.toFixed(1)}</div>
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
