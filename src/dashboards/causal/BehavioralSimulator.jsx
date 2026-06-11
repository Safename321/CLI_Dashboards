// What-if Simulator with confidence decay outside the measured range.
// Sliders per driver; projected outcomes update live. Confidence labels
// degrade when a slider leaves the range we have evidence for.
import { useMemo, useState } from 'react';
import { BEHAVIORAL_RELATIONSHIPS, DRIVER_PROFILES, TIER_META } from '../../data/datasets/causal.js';

const DRIVER_NAMES = Object.keys(DRIVER_PROFILES);
const baselineValues = () => {
  const v = {};
  DRIVER_NAMES.forEach((d) => { v[d] = DRIVER_PROFILES[d].current; });
  return v;
};

export default function BehavioralSimulator({ onSelect }) {
  const [values, setValues] = useState(baselineValues);

  // For each relationship: (a) projected outcome change vs baseline,
  // (b) projected dollar impact, (c) confidence label with decay out of range.
  const projections = useMemo(() => BEHAVIORAL_RELATIONSHIPS.map((rel) => {
    const profile = DRIVER_PROFILES[rel.from];
    if (!profile) return null;
    const newVal = values[rel.from];
    const delta = newVal - profile.current;
    const outcomeDelta = delta * rel.outcomePerUnit;
    const dollarDelta = delta * rel.perUnitDollar;

    let confLabel; let confColor;
    const inRange = newVal >= profile.measuredMin && newVal <= profile.measuredMax;
    if (inRange) {
      confLabel = rel.stars >= 4 ? 'High' : rel.stars >= 3 ? 'Medium' : 'Low';
      confColor = TIER_META[rel.tier].color;
    } else {
      const outside = newVal < profile.measuredMin ? profile.measuredMin - newVal : newVal - profile.measuredMax;
      const range = profile.measuredMax - profile.measuredMin;
      const sigmas = outside / (range / 4); // rough proxy for std deviations
      if (sigmas < 1) { confLabel = 'Medium (slight extrapolation)'; confColor = '#f59e0b'; }
      else if (sigmas < 2) { confLabel = 'Low (significant extrapolation)'; confColor = '#fb7185'; }
      else { confLabel = 'Extrapolated (no evidence)'; confColor = '#94a3b8'; }
    }
    return { rel, delta, outcomeDelta, dollarDelta, confLabel, confColor, inRange };
  }).filter(Boolean), [values]);

  const totalDollar = projections.reduce((a, p) => a + p.dollarDelta, 0);
  // Confidence-weighted total: shrink low-confidence dollar projections.
  const weightedDollar = projections.reduce((a, p) => {
    const weight = p.confLabel.startsWith('High') ? 1.0
      : p.confLabel.startsWith('Medium') ? 0.65
      : p.confLabel.startsWith('Low') ? 0.35
      : 0.1;
    return a + p.dollarDelta * weight;
  }, 0);

  return (
    <div>
      <div className="mb-3 flex items-center justify-end">
        <button
          onClick={() => setValues(baselineValues())}
          className="rounded border border-slate-600 px-3 py-1 text-xs text-slate-300 hover:bg-slate-700"
        >
          Reset to current values
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Sliders */}
        <div className="space-y-3">
          {DRIVER_NAMES.map((d) => {
            const p = DRIVER_PROFILES[d];
            const v = values[d];
            const inRange = v >= p.measuredMin && v <= p.measuredMax;
            const trackPct = (val) => ((val - p.sliderMin) / (p.sliderMax - p.sliderMin)) * 100;
            return (
              <div key={d}>
                <div className="mb-1 flex items-baseline justify-between">
                  <label className="text-xs font-semibold text-slate-300">{d}</label>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-xs ${inRange ? 'text-emerald-300' : 'text-amber-300'}`}>
                      {inRange ? '✓ in measured range' : '⚠ extrapolating'}
                    </span>
                    <span className="font-mono text-sm text-white">{v.toFixed(1)}{p.unit}</span>
                  </div>
                </div>
                {/* Visual track showing the measured range + current value */}
                <div className="relative mb-0.5 h-1.5 rounded-full bg-panel">
                  <div
                    className="absolute inset-y-0 rounded-full"
                    style={{
                      left: `${trackPct(p.measuredMin)}%`,
                      width: `${trackPct(p.measuredMax) - trackPct(p.measuredMin)}%`,
                      background: 'rgba(16,185,129,0.3)',
                    }}
                  />
                  <div
                    className="absolute -inset-y-0.5 w-0.5 bg-accent"
                    style={{ left: `${trackPct(p.current)}%` }}
                    title="Current value"
                  />
                </div>
                <input
                  type="range"
                  aria-label={d}
                  min={p.sliderMin} max={p.sliderMax} step={0.1} value={v}
                  onChange={(e) => setValues({ ...values, [d]: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-slate-600">
                  <span>{p.sliderMin}</span>
                  <span>measured: {p.measuredMin}–{p.measuredMax}</span>
                  <span>{p.sliderMax}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Projected outcomes */}
        <div className="space-y-2">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Projected outcomes vs baseline</div>
          {projections.map((p, i) => {
            const positive = p.rel.id === 'r6'
              ? p.outcomeDelta <= 0 // attrition: lower is better
              : p.outcomeDelta >= 0;
            return (
              <button
                key={i}
                onClick={() => onSelect(p.rel)}
                className="block w-full cursor-pointer rounded border border-border bg-ink/60 p-3 text-left hover:border-slate-500"
                title="Click for methodology"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-slate-300">{p.rel.to}</div>
                    <div className="text-[10px] text-subtle">driven by {p.rel.from}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-bold" style={{ color: positive ? '#34d399' : '#fb7185' }}>
                      {p.outcomeDelta >= 0 ? '+' : ''}{p.outcomeDelta.toFixed(2)} {p.rel.outcomeUnit}
                    </div>
                    <div className="font-mono text-xs" style={{ color: p.dollarDelta >= 0 ? '#34d399' : '#fb7185' }}>
                      {p.dollarDelta >= 0 ? '+' : ''}${Math.abs(p.dollarDelta).toFixed(1)}M/yr
                    </div>
                  </div>
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-[10px]">
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: p.confColor }} />
                  <span style={{ color: p.confColor }}>Confidence: {p.confLabel}</span>
                </div>
              </button>
            );
          })}

          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3">
            <div className="rounded border border-border bg-ink p-2.5">
              <div className="text-[10px] uppercase tracking-wider text-subtle">Unweighted total</div>
              <div className="font-mono text-lg font-bold" style={{ color: totalDollar >= 0 ? '#34d399' : '#fb7185' }}>
                {totalDollar >= 0 ? '+' : ''}${Math.abs(totalDollar).toFixed(1)}M/yr
              </div>
            </div>
            <div className="rounded border border-cyan-500/40 bg-ink p-2.5">
              <div className="text-[10px] uppercase tracking-wider text-cyan-300">Confidence-weighted</div>
              <div className="font-mono text-lg font-bold" style={{ color: weightedDollar >= 0 ? '#34d399' : '#fb7185' }}>
                {weightedDollar >= 0 ? '+' : ''}${Math.abs(weightedDollar).toFixed(1)}M/yr
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-[11px] leading-relaxed text-subtle">
        <span className="font-semibold text-slate-300">How this works:</span> Each slider's impact is computed using the elasticity from the corresponding relationship in the matrix above.
        Inside the measured range (green band) the confidence label matches the relationship's evidence tier. Outside the range, confidence degrades — first to "slight extrapolation," then "significant extrapolation," then "no evidence."
        Confidence-weighted total shrinks low-confidence dollar projections to reflect lower trust.
      </div>
    </div>
  );
}
