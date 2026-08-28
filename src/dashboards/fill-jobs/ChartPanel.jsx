// Fill Jobs — left "draw pad" panel: ASSET radar with tolerance band on a
// light pad, CLI wheel legend, overlaid-candidate legend and open positions.
import StyleRadar, { DOMAIN_COLORS, hexRgba } from '../shared/StyleRadar.jsx';
import { assetUrl } from '../../lib/apiBase.js';

const CLUSTERS = [
  { color: DOMAIN_COLORS.Direct, label: 'DIRECT', styles: 'Intrinsic · Compet. · Power' },
  { color: DOMAIN_COLORS.Instrumental, label: 'INSTRUMENTAL', styles: 'Personal · Social · Entrust.' },
  { color: DOMAIN_COLORS.Relational, label: 'RELATIONAL', styles: 'Collab. · Contrib. · Vicarious' },
];

export default function ChartPanel({ asset, overlays, jobs, activeJobId, onActivateJob, onFillPosition }) {
  const band = {
    outer: asset.scores.map((s, i) => Math.min(7, s + asset.bands[i])),
    inner: asset.scores.map((s, i) => Math.max(1, s - asset.bands[i])),
  };
  const datasets = [
    {
      label: 'ASSET-P',
      data: asset.scores,
      color: 'rgba(120,140,160,0.45)',
      strokeWidth: 1.5,
      pointColors: asset.scores.map((_, i) => Object.values(DOMAIN_COLORS)[Math.floor(i / 3)]),
      pointRadius: 4,
    },
    ...overlays.map((c) => ({
      label: c.name,
      data: c.scores,
      color: c.color,
      dash: true,
      fillOpacity: 0.07,
      pointRadius: 3,
    })),
  ];

  return (
    <div className="flex flex-col border-r border-border bg-panel/60 p-5">
      <div className="mb-3 font-serif text-sm italic text-slate-300">Job Description Interpretation</div>

      {/* Light draw-pad */}
      <div className="flex flex-col rounded-lg border border-[#c8d8e8] bg-[#f0f4f8] px-5 py-3 shadow-inner">
        <div className="mb-1 text-center font-serif text-lg font-bold text-[#1a2e42]">ASSET (job) &amp; ASI (person)</div>
        <StyleRadar
          datasets={datasets}
          band={band}
          min={1}
          max={7}
          startAngle={40}
          tickColor="#8899aa"
          className="mx-auto w-full max-w-[380px]"
        />

        {/* CLI wheel + cluster legend */}
        <div className="mt-1.5 flex items-center gap-3 rounded-lg border border-[rgba(100,160,220,0.35)] bg-[rgba(100,160,220,0.18)] px-2.5 py-2">
          <img src={assetUrl('cli-wheel.png')} alt="CLI Achieving Styles wheel" className="h-16 w-16 shrink-0 rounded bg-white object-contain" />
          <div className="flex flex-1 flex-col gap-1.5">
            {CLUSTERS.map((g) => (
              <div key={g.label} className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 shrink-0 rounded-sm" style={{ background: g.color }} />
                <span className="min-w-[90px] text-[11px] font-extrabold tracking-wide" style={{ color: g.color }}>{g.label}</span>
                <span className="text-[10px] text-[#2d4060]">{g.styles}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Overlaid candidate legend */}
        {overlays.length > 0 && (
          <div className="mt-1.5 flex flex-col gap-1">
            {overlays.map((c) => (
              <div key={c.id} className="flex items-center gap-1.5 text-[11px]">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.color, boxShadow: `0 0 0 2px ${hexRgba(c.color, 0.2)}` }} />
                <span className="text-[#2d4060]">{c.name}</span>
                <span className="text-[10px] text-[#4a7fa5]">– {c.loc}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-1.5 border-t border-[#dce8f0] pt-1.5 font-serif text-[13px] leading-snug text-[#4a6a8a]">
          <span className="font-bold text-blue-500">*</span> Band = acceptable range per style. Tighter band ={' '}
          <em>mission-critical</em> — less tolerance for deviation.
        </div>
      </div>

      {/* Overlay count message */}
      {overlays.length > 0 && (
        <div className="mt-2 rounded-md border border-border bg-ink px-3 py-1.5 text-center text-xs text-slate-300">
          Overlaying {overlays.length}: {overlays.map((c) => c.name.split(' ')[0]).join(', ')}
        </div>
      )}

      {/* Open positions */}
      <div className="mt-3 border-t border-border pt-2">
        <div className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-accent">Open Positions</div>
        <div className="flex max-h-36 flex-col gap-1 overflow-y-auto">
          {jobs.length === 0 ? (
            <div className="text-[11px] italic text-muted">No positions yet</div>
          ) : (
            jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => onActivateJob(job.id)}
                className={`w-full rounded-md border px-2.5 py-1.5 text-left transition-colors ${
                  job.id === activeJobId ? 'border-accent bg-ink text-slate-100' : 'border-border text-slate-300 hover:bg-ink'
                }`}
              >
                <div className="truncate text-xs font-medium">{job.title}</div>
                {job.loc && <div className={`text-[10px] ${job.id === activeJobId ? 'text-accent' : 'text-muted'}`}>{job.loc}</div>}
              </button>
            ))
          )}
        </div>
        <button
          onClick={onFillPosition}
          disabled={!activeJobId}
          className="mt-2 w-full rounded-md bg-gradient-to-br from-blue-600 to-cyan-500 px-3 py-2 text-xs font-bold text-white transition-opacity disabled:pointer-events-none disabled:opacity-30"
        >
          ▲ Fill This Position
        </button>
      </div>
    </div>
  );
}
