// Shared live leading-indicators panel for the employee-leading and
// early-warning views (Phase 3 / D3). Reads /dashboard/metrics-timeseries and
// renders indicator cards + trend sparklines. Demo build never mounts this.
import { useMemo } from 'react';
import { useMetricsTimeseries } from '../../lib/liveData.js';

const LEVEL = {
  good:  { dot: 'bg-emerald-400', text: 'text-emerald-400', box: 'border-emerald-500/30 bg-emerald-900/10' },
  watch: { dot: 'bg-amber-400',   text: 'text-amber-400',   box: 'border-amber-500/30 bg-amber-900/10' },
  warn:  { dot: 'bg-red-400',     text: 'text-red-400',     box: 'border-red-500/30 bg-red-900/10' },
};

// Minimal dependency-free sparkline.
function Sparkline({ points, color = '#22d3ee', width = 220, height = 40 }) {
  const vals = points.filter((v) => v != null);
  if (vals.length < 2) return <div className="text-[11px] italic text-subtle">Not enough history yet — trend appears as snapshots accrue.</div>;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const rng = max - min || 1;
  const step = width / (points.length - 1);
  const d = points.map((v, i) => {
    if (v == null) return null;
    const x = i * step;
    const y = height - ((v - min) / rng) * (height - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).filter(Boolean).join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" role="img" aria-label="trend">
      <polyline points={d} fill="none" stroke={color} strokeWidth="1.75" />
    </svg>
  );
}

function IndicatorCard({ ind }) {
  const lvl = LEVEL[ind.level] || LEVEL.good;
  return (
    <div className={`rounded-xl border p-4 ${lvl.box}`}>
      <div className="flex items-center gap-2">
        <span className={`inline-block h-2 w-2 rounded-full ${lvl.dot}`} />
        <span className="text-xs uppercase tracking-wider text-muted">{ind.label}</span>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${lvl.text}`}>{ind.value ?? '—'}{ind.unit}</span>
        {ind.delta != null && ind.delta !== 0 && (
          <span className={`text-xs font-semibold ${ind.delta < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {ind.delta > 0 ? '▲' : '▼'} {Math.abs(ind.delta)}
          </span>
        )}
      </div>
      <div className="mt-0.5 text-[11px] text-muted">{ind.detail}</div>
    </div>
  );
}

export default function LeadingIndicators({ title = 'Live Leading Indicators' }) {
  const { data, status } = useMetricsTimeseries(true);

  const { series, indicators, seeded } = useMemo(() => ({
    series: data?.series ?? [],
    indicators: data?.indicators ?? {},
    seeded: data?.seeded ?? false,
  }), [data]);

  if (status === 'loading') {
    return <div className="rounded-xl border border-border bg-panel p-6 text-sm text-muted">Loading your organization's trend data…</div>;
  }
  if (status === 'error') {
    return (
      <div className="rounded-xl border border-border bg-panel p-6">
        <p className="text-sm font-semibold text-red-400">Couldn't load your organization's trend data.</p>
        <p className="mt-1 text-sm text-muted">Refresh and sign in again — if it persists, contact your administrator.</p>
      </div>
    );
  }

  const inds = Object.values(indicators);
  const noData = !series.length || series.every((p) => p.headcount === 0 && p.sentiment == null);
  if (noData) {
    return (
      <div className="rounded-xl border border-border bg-panel p-6">
        <p className="text-sm font-semibold text-amber-400">No trend data yet.</p>
        <p className="mt-1 text-sm text-muted">
          Leading indicators build from weekly snapshots of your organization's assessments and check-ins.
          As employees complete instruments and check-ins, this fills in automatically.
        </p>
      </div>
    );
  }

  const sentiment = series.map((p) => p.sentiment);
  const participation = series.map((p) => p.participation);
  const oasiMean = series.map((p) => p.oasiMean);

  return (
    <section className="rounded-xl border border-border bg-panel p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-white">📈 {title}</h3>
        <span className="rounded-full border border-emerald-500/40 bg-emerald-900/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
          {seeded ? 'live · first snapshot' : `live · ${series.length} snapshots`}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {inds.map((ind) => <IndicatorCard key={ind.label} ind={ind} />)}
      </div>

      {!seeded && (
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            ['Sentiment (0–10)', sentiment, '#22d3ee'],
            ['Participation (%)', participation, '#a78bfa'],
            ['Org OASI mean (1–7)', oasiMean, '#34d399'],
          ].map(([label, pts, color]) => (
            <div key={label}>
              <div className="mb-1 text-xs text-muted">{label}</div>
              <Sparkline points={pts} color={color} />
            </div>
          ))}
        </div>
      )}

      {seeded && (
        <p className="mt-4 text-[11px] italic text-subtle">
          Showing a live baseline. The weekly snapshot job builds trend history from here.
        </p>
      )}
    </section>
  );
}
