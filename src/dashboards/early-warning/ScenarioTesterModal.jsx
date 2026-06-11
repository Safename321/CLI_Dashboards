// Scenario Tester — persona-based what-if levers with $-impact projections and
// a downloadable report. Opened from the Early Warning dashboard header.
import { useState } from 'react';
import { useData } from '../../data/DataContext.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { SCENARIO_PRESETS, PERSONA_KEYS, SCENARIO_PDF_SAYINGS } from '../../data/datasets/scenario.js';
import { buildScenarioReportHtml, openHtmlReport } from './scenarioReport.js';

const initValues = (key) => {
  const v = {};
  SCENARIO_PRESETS[key].levers.forEach((l) => { v[l.id] = l.current; });
  return v;
};

export default function ScenarioTesterModal({ open, onClose }) {
  const { tenant } = useData();
  const { email } = useAuth();
  const [activePersona, setActivePersona] = useState('ceo');
  const [allValues, setAllValues] = useState(() => {
    const out = {};
    PERSONA_KEYS.forEach((k) => { out[k] = initValues(k); });
    return out;
  });

  if (!open) return null;

  const preset = SCENARIO_PRESETS[activePersona];
  const values = allValues[activePersona];

  const setLeverValue = (leverId, val) => {
    setAllValues({ ...allValues, [activePersona]: { ...values, [leverId]: val } });
  };
  const resetPersona = () => {
    setAllValues({ ...allValues, [activePersona]: initValues(activePersona) });
  };

  // Projected outcomes: linear elasticity per lever.
  const projections = preset.levers.map((l) => {
    const delta = values[l.id] - l.current;
    return { lever: l, delta, dollarDelta: delta * l.dollarPerUnit };
  });
  const totalDollar = projections.reduce((a, p) => a + p.dollarDelta, 0);

  const generateScenarioReport = () => {
    try {
      const html = buildScenarioReportHtml({
        preset, values, projections, totalDollar,
        tenantName: tenant?.companyName, email,
      });
      openHtmlReport(html);
    } catch (err) {
      console.error('[ScenarioTesterModal] report generation failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 p-5" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-[900px] overflow-y-auto rounded-xl border border-border bg-ink p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[22px]" aria-hidden>🔮</span>
              <h2 className="text-xl font-bold text-white">Scenario Tester</h2>
            </div>
            <p className="mt-1 text-sm text-muted">{preset.framing}</p>
          </div>
          <button onClick={onClose} aria-label="Close scenario tester" className="text-2xl leading-none text-muted hover:text-white">×</button>
        </div>

        {/* Persona switcher */}
        <div className="mb-5 flex items-center gap-2">
          <span className="text-xs text-subtle">View as:</span>
          <select
            value={activePersona}
            onChange={(e) => setActivePersona(e.target.value)}
            className="flex-1 rounded border border-border bg-panel px-3 py-1.5 text-sm text-white"
            aria-label="Persona"
          >
            {PERSONA_KEYS.map((k) => (
              <option key={k} value={k}>{SCENARIO_PRESETS[k].label}</option>
            ))}
          </select>
          <button onClick={resetPersona} className="rounded border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700">
            Reset
          </button>
        </div>

        {/* Two-column body */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Sliders */}
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Inputs</div>
            <div className="space-y-4">
              {preset.levers.map((l) => {
                const v = values[l.id];
                const currentPct = ((l.current - l.min) / (l.max - l.min)) * 100;
                return (
                  <div key={l.id}>
                    <div className="mb-1 flex items-baseline justify-between">
                      <label className="text-xs text-slate-300">{l.label}</label>
                      <span className="font-mono text-sm text-white">{v}{l.unit}</span>
                    </div>
                    {/* Track with baseline marker */}
                    <div className="relative mb-1 h-1 rounded-sm bg-panel">
                      <div
                        className="absolute h-2.5 w-0.5 bg-accent"
                        style={{ left: `${currentPct}%`, top: -3 }}
                        title="Baseline"
                      />
                    </div>
                    <input
                      type="range"
                      aria-label={l.label}
                      min={l.min} max={l.max}
                      step={l.unit === '%' || l.unit === '' || l.unit === '$M' ? 1 : 0.1}
                      value={v}
                      onChange={(e) => setLeverValue(l.id, parseFloat(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>{l.min}{l.unit}</span>
                      <span className="text-cyan-500">baseline: {l.current}{l.unit}</span>
                      <span>{l.max}{l.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Outputs */}
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Projected outcomes</div>
            <div className="space-y-2">
              {projections.map((p, i) => {
                const positive = p.dollarDelta >= 0;
                return (
                  <div key={i} className="rounded border border-border bg-panel/60 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-slate-300">{p.lever.outcomeLabel}</div>
                        <div className="text-[10px] text-subtle">from {p.lever.label}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-bold" style={{ color: positive ? '#34d399' : '#fb7185' }}>
                          {positive ? '+' : ''}${Math.abs(p.dollarDelta).toFixed(1)}M/yr
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Total */}
            <div className="mt-4 rounded-lg border border-cyan-500/40 bg-ink p-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300">Total projected impact</div>
              <div className="mt-1 font-mono text-2xl font-bold" style={{ color: totalDollar >= 0 ? '#34d399' : '#fb7185' }}>
                {totalDollar >= 0 ? '+' : ''}${Math.abs(totalDollar).toFixed(1)}M/yr
              </div>
            </div>
          </div>
        </div>

        {/* Caveat banner */}
        <div className="mt-5 rounded border border-amber-500/30 bg-amber-900/15 p-3 text-xs leading-relaxed text-amber-200/90">
          <span className="font-semibold text-amber-200">Directional, not predictive.</span> The Scenario Tester uses linear elasticity coefficients calibrated from CLI's cross-client panel.
          Real behavioral effects saturate at extremes. Use this to <em>compare</em> scenarios against each other, not to predict absolute dollar values to the cent.
          For board-grade conviction, also consult the confidence-weighted projections in the Behavioral-Outcome dashboard's What-if Simulator.
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-between">
          <button onClick={onClose} className="rounded border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
            Close
          </button>
          <button onClick={generateScenarioReport} className="rounded bg-cyan-600 px-5 py-2 text-sm font-semibold text-white hover:bg-cyan-500">
            📄 {SCENARIO_PDF_SAYINGS[Math.floor(Date.now() / 1000) % SCENARIO_PDF_SAYINGS.length]}
          </button>
        </div>
      </div>
    </div>
  );
}
