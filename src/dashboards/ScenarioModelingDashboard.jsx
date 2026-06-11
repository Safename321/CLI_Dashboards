// Scenario Modeling (view id: scenario-modeling, icon 🔮).
// Forward 24-month revenue impact under configurable strategy inputs — with
// uncertainty fan, sensitivity tornado, capital allocation lens, and a
// calibration track record. Formulas ported exactly from legacy v1.24L.
import { useMemo, useState } from 'react';
import {
  ResponsiveContainer, ComposedChart, Area, Line,
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import DashboardShell from '../components/DashboardShell.jsx';
import { Panel } from '../components/primitives.jsx';
import { SCENARIO_MODEL, CALIBRATION_HISTORY } from '../data/datasets/scenario.js';

const TOOLTIP_STYLE = { background: '#0f172a', border: '1px solid #334155' };

export default function ScenarioModelingDashboard() {
  // Configurable inputs — sliders (defaults from the model config).
  const [costReductionPct, setCostReductionPct] = useState(SCENARIO_MODEL.costReduction.default);
  const [annualBillingPct, setAnnualBillingPct] = useState(SCENARIO_MODEL.annualBilling.default);
  const [hiringPausePct, setHiringPausePct] = useState(SCENARIO_MODEL.hiringPause.default);
  const [trainingInvestM, setTrainingInvestM] = useState(SCENARIO_MODEL.trainingInvest.default);

  // Point estimate of $M revenue impact, 24-month projection.
  const point = (
    costReductionPct * SCENARIO_MODEL.costReduction.coef
    + annualBillingPct * SCENARIO_MODEL.annualBilling.coef
    + hiringPausePct * SCENARIO_MODEL.hiringPause.coef
    + trainingInvestM * SCENARIO_MODEL.trainingInvest.coef
  );

  // Fan chart: 10/50/90 percentile bands over 8 quarters.
  // Input-uncertainty + ramp-in (smaller at first, full by Q6).
  const fanData = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    const ramp = Math.min(1, (i + 1) / 6);
    const p50 = point * ramp;
    const sd = Math.abs(p50) * 0.28 + 0.4; // wider uncertainty for larger effects
    return {
      q: `Q${i + 1}`,
      p10: +(p50 - 1.28 * sd).toFixed(2),
      p50: +p50.toFixed(2),
      p90: +(p50 + 1.28 * sd).toFixed(2),
    };
  }), [point]);

  // Sensitivity tornado — which input swings the outcome most?
  const tornado = useMemo(() => Object.values(SCENARIO_MODEL).map((m) => {
    const lo = m.range[0] * m.coef;
    const hi = m.range[1] * m.coef;
    return {
      name: m.label.replace(/\(.*?\)/, '').trim(),
      swing: +(hi - lo).toFixed(2),
      lo: +lo.toFixed(2),
      hi: +hi.toFixed(2),
    };
  }).sort((a, b) => b.swing - a.swing), []);

  // Capital allocation lens — fund vs defer.
  const capitalLens = [
    { item: 'CLI Training Program', cost: trainingInvestM, roi: trainingInvestM * SCENARIO_MODEL.trainingInvest.coef, verdict: 'fund' },
    { item: 'Annual Billing Migration', cost: 1.2, roi: annualBillingPct * SCENARIO_MODEL.annualBilling.coef, verdict: 'fund' },
    { item: 'Sales Headcount +12', cost: 4.8, roi: -hiringPausePct * SCENARIO_MODEL.hiringPause.coef, verdict: 'defer' },
    { item: 'Office Expansion', cost: 6.5, roi: -costReductionPct * SCENARIO_MODEL.costReduction.coef, verdict: 'defer' },
  ];

  // Calibration metric (mean absolute % error over the six prior predictions).
  const calibErr = (CALIBRATION_HISTORY.reduce((a, c) => a + Math.abs((c.actual - c.predicted) / c.predicted), 0)
    / CALIBRATION_HISTORY.length) * 100;

  const sliders = [
    { val: costReductionPct, set: setCostReductionPct, m: SCENARIO_MODEL.costReduction, key: 'costReduction' },
    { val: annualBillingPct, set: setAnnualBillingPct, m: SCENARIO_MODEL.annualBilling, key: 'annualBilling' },
    { val: hiringPausePct, set: setHiringPausePct, m: SCENARIO_MODEL.hiringPause, key: 'hiringPause' },
    { val: trainingInvestM, set: setTrainingInvestM, m: SCENARIO_MODEL.trainingInvest, key: 'trainingInvest' },
  ];

  return (
    <DashboardShell
      title="Scenario Modeling"
      icon="🔮"
      subtitle="Forward 24-month revenue impact under configurable strategy inputs — with uncertainty bands, sensitivity, and a track record."
    >
      <div className="space-y-6">
        {/* Calibration history — THE credibility anchor */}
        <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/20 to-ink p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>🎯</span>
              <h3 className="font-semibold text-white">Model Calibration — last 6 predictions</h3>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-300">±{calibErr.toFixed(0)}%</div>
              <div className="text-xs text-subtle">mean prediction error</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-subtle">
                  <th className="px-2 py-1.5 text-left">Quarter</th>
                  <th className="px-2 py-1.5 text-left">Client / Scenario</th>
                  <th className="px-2 py-1.5 text-right">Predicted</th>
                  <th className="px-2 py-1.5 text-right">Actual</th>
                  <th className="px-2 py-1.5 text-right">Error</th>
                </tr>
              </thead>
              <tbody>
                {CALIBRATION_HISTORY.map((c, i) => {
                  const err = ((c.actual - c.predicted) / c.predicted) * 100;
                  return (
                    <tr key={i} className="border-b border-panel">
                      <td className="px-2 py-1.5 text-muted">{c.quarter}</td>
                      <td className="px-2 py-1.5 text-slate-300">{c.label}</td>
                      <td className="px-2 py-1.5 text-right font-mono text-slate-300">{c.predicted >= 0 ? '+' : ''}${c.predicted}M</td>
                      <td className="px-2 py-1.5 text-right font-mono text-white">{c.actual >= 0 ? '+' : ''}${c.actual}M</td>
                      <td className={`px-2 py-1.5 text-right font-mono ${Math.abs(err) < 15 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {err >= 0 ? '+' : ''}{err.toFixed(0)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-xs text-subtle">
            Forecasts are within ±{calibErr.toFixed(0)}% of actual on average over six prior client deployments. Calibration improves trust more than any methodology disclaimer.
          </div>
        </div>

        {/* Configurable inputs */}
        <Panel title="Adjust scenario inputs ↴">
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            {sliders.map(({ val, set, m, key }) => (
              <div key={key}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <label className="text-xs text-slate-300">{m.label}</label>
                  <span className="font-mono text-sm text-white">{val}{m.unit}</span>
                </div>
                <input
                  type="range"
                  aria-label={m.label}
                  min={m.range[0]} max={m.range[1]} step={m.step}
                  value={val}
                  onChange={(e) => set(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <div className="mt-0.5 flex justify-between text-xs text-slate-600">
                  <span>{m.range[0]}{m.unit}</span>
                  <span>elasticity {m.coef}</span>
                  <span>{m.range[1]}{m.unit}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded border border-border bg-ink p-3">
              <div className="text-xs text-subtle">Expected ($M, 24-mo)</div>
              <div className="text-xl font-bold text-white">{point >= 0 ? '+' : ''}${point.toFixed(1)}M</div>
            </div>
            <div className="rounded border border-border bg-ink p-3">
              <div className="text-xs text-subtle">10th–90th band</div>
              <div className="font-mono text-sm text-slate-300">${fanData[7].p10}M ↔ ${fanData[7].p90}M</div>
            </div>
            <div className="rounded border border-border bg-ink p-3">
              <div className="text-xs text-subtle">Confidence (P&gt;0)</div>
              <div className="text-xl font-bold text-emerald-300">
                {point > 0 ? Math.min(95, 50 + Math.abs(point) * 8).toFixed(0) : Math.max(5, 50 - Math.abs(point) * 8).toFixed(0)}%
              </div>
            </div>
          </div>
        </Panel>

        {/* Fan chart */}
        <Panel title="Forecast fan — 10th, 50th, 90th percentile ($M)" subtitle="Quarterly projection. Width = uncertainty. Ramp-in to full effect by Q6.">
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={fanData}>
              <defs>
                <linearGradient id="fanFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="q" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area dataKey="p90" stroke="none" fill="url(#fanFill)" />
              <Area dataKey="p10" stroke="none" fill="#0f172a" />
              <Line type="monotone" dataKey="p50" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Panel>

        {/* Sensitivity tornado */}
        <Panel
          title="Sensitivity — which input swings the outcome most?"
          subtitle="Bars show the range of impact ($M) as each input moves across its full range. Focus uncertainty-reduction effort on the top bar."
        >
          <ResponsiveContainer width="100%" height={180}>
            <ReBarChart data={tornado} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis type="category" dataKey="name" stroke="#94a3b8" width={180} fontSize={11} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="swing" fill="#f59e0b" />
            </ReBarChart>
          </ResponsiveContainer>
        </Panel>

        {/* Capital allocation lens */}
        <Panel title="Capital allocation lens — fund vs. defer">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-subtle">
                  <th className="px-3 py-2 text-left">Initiative</th>
                  <th className="px-3 py-2 text-right">Cost ($M)</th>
                  <th className="px-3 py-2 text-right">Expected ROI ($M)</th>
                  <th className="px-3 py-2 text-right">Net</th>
                  <th className="px-3 py-2 text-center">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {capitalLens.map((c, i) => {
                  const net = c.roi - c.cost;
                  return (
                    <tr key={i} className="border-b border-border/40">
                      <td className="px-3 py-2 text-white">{c.item}</td>
                      <td className="px-3 py-2 text-right font-mono text-slate-300">${c.cost.toFixed(1)}M</td>
                      <td className="px-3 py-2 text-right font-mono" style={{ color: c.roi >= 0 ? '#34d399' : '#fb7185' }}>
                        {c.roi >= 0 ? '+' : ''}${c.roi.toFixed(1)}M
                      </td>
                      <td className="px-3 py-2 text-right font-mono" style={{ color: net >= 0 ? '#34d399' : '#fb7185' }}>
                        {net >= 0 ? '+' : ''}${net.toFixed(1)}M
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={c.verdict === 'fund'
                          ? 'rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300'
                          : 'rounded bg-border px-2 py-0.5 text-xs font-semibold text-muted'}
                        >
                          {c.verdict.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Methodology disclosure */}
        <details className="rounded-xl border border-border/50 bg-ink/50 p-4">
          <summary className="cursor-pointer text-xs font-semibold text-slate-300">📐 Show model assumptions, formulas, and limitations</summary>
          <div className="mt-3 space-y-2 text-xs leading-relaxed text-muted">
            <p><span className="font-semibold text-slate-300">Formula:</span> Revenue Impact ($M) = Σ (input × elasticity). Elasticities estimated from CLI cross-client panel (24 deployments, 2019–2025).</p>
            <p><span className="font-semibold text-slate-300">Uncertainty:</span> 10th/90th percentile bands assume input-elasticity standard deviation of 28% (panel average). Ramp-in modeled linearly to full effect at Q6.</p>
            <p><span className="font-semibold text-slate-300">Assumptions:</span> SPGI ARR base $14.2B, current churn 4.2%, current OpEx $7.1B. Elasticities assumed stable within typical S&amp;P-segment client size range (±2σ).</p>
            <p><span className="font-semibold text-slate-300">Limitations:</span> Model is reduced-form. Does not capture: (1) competitive response, (2) macro shocks, (3) interaction effects between inputs at extreme values. Calibration error (±{calibErr.toFixed(0)}%) reflects these in aggregate.</p>
            <p><span className="font-semibold text-slate-300">Method tier:</span> Quasi-experimental for trainingInvest (DiD on staggered rollouts), time-lagged correlation for other three. See Behavioral-Outcome Patterns for per-relationship detail.</p>
          </div>
        </details>
      </div>
    </DashboardShell>
  );
}
