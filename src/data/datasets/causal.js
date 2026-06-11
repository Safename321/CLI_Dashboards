// Behavioral-Outcome Patterns (causal analysis) — static evidence dataset.
// Ported from legacy App.jsx (v1.24L) lines 3553–3619 + tierMeta (3943).
// Honest framing: most relationships are correlational, some time-lagged,
// few quasi-experimental. The dashboard makes this distinction visible.

export const BEHAVIORAL_RELATIONSHIPS = [
  {
    id: 'r1', from: 'Manager Quality', to: '90-Day Retention',
    tier: 'quasi-exp', stars: 4,
    coef: 0.61, ci: [0.42, 0.78], n: 23, window: '23 quarters, 2019–2025',
    method: 'Difference-in-Differences (staggered CLI training rollout)',
    effectSize: '+1pt Manager Quality → +4.2% retention → ~$11M/yr at SPGI base',
    perUnitDollar: 11,           // $M per +1 driver unit
    outcomeUnit: 'pp retention', // unit label for outcome change
    outcomePerUnit: 4.2,         // outcome change per +1 driver unit
    caveat: 'Selection effects controlled via DiD; assumes parallel trends pre-treatment.',
  },
  {
    id: 'r2', from: 'Psychological Safety', to: 'Innovation Output',
    tier: 'time-lag', stars: 3,
    coef: 0.61, ci: [0.40, 0.77], n: 23, window: 'lag-2 quarters',
    method: 'Time-lagged correlation (cause precedes effect)',
    effectSize: '+1pt PS → +18% patent filings 6 months later (cross-client avg)',
    perUnitDollar: 6,
    outcomeUnit: '% patent filings',
    outcomePerUnit: 18,
    caveat: 'Time precedence established; unmeasured confounds (e.g., R&D budget) not fully ruled out.',
  },
  {
    id: 'r3', from: 'Vicarious (OASI)', to: 'Successor Readiness',
    tier: 'time-lag', stars: 3,
    coef: 0.54, ci: [0.31, 0.72], n: 18, window: 'lag-4 quarters',
    method: 'Time-lagged panel correlation',
    effectSize: '+0.5 Vicarious → 1.8 ready successors per critical role',
    perUnitDollar: 4,
    outcomeUnit: 'ready successors',
    outcomePerUnit: 3.6, // per +1 unit (1.8 per 0.5 unit)
    caveat: 'Vicarious is the strongest predictor we have; not yet quasi-experimentally confirmed.',
  },
  {
    id: 'r4', from: 'Entrusting (OASI)', to: 'Cross-Div Project Velocity',
    tier: 'cross-sect', stars: 2,
    coef: 0.47, ci: [0.18, 0.69], n: 847, window: 'Cross-sectional, Q4 2025',
    method: 'Cross-sectional correlation (Pearson)',
    effectSize: '+0.5 Entrusting → +12% project completion (correlational only)',
    perUnitDollar: 3,
    outcomeUnit: '% project completion',
    outcomePerUnit: 24,
    caveat: 'No time precedence; high-velocity teams may simply attract Entrusting-style leaders.',
  },
  {
    id: 'r5', from: 'Collaborative (OASI)', to: 'Revenue Retention',
    tier: 'time-lag', stars: 3,
    coef: 0.43, ci: [0.21, 0.62], n: 16, window: 'lag-3 quarters',
    method: 'Time-lagged correlation (CLI cross-client panel)',
    effectSize: '+1pt Collaborative → +1.8% NRR over 18mo → ~$98M ARR retained',
    perUnitDollar: 98,
    outcomeUnit: 'pp NRR',
    outcomePerUnit: 1.8,
    caveat: 'Cross-client average; SPGI-specific elasticity may differ.',
  },
  {
    id: 'r6', from: 'Sentiment Score', to: 'Regrettable Attrition',
    tier: 'cross-sect', stars: 2,
    coef: -0.39, ci: [-0.58, -0.16], n: 847, window: 'Cross-sectional, Q4 2025',
    method: 'Cross-sectional correlation',
    effectSize: '-1pt sentiment → +2.3% attrition (correlational only)',
    perUnitDollar: -14, // negative: improving sentiment reduces attrition cost
    outcomeUnit: 'pp attrition',
    outcomePerUnit: -2.3,
    caveat: 'Direction of causality unclear; departing employees may report lower sentiment as exit rationale.',
  },
];

// Driver current values + measured range for the what-if simulator.
// "current" is the SPGI baseline; "measured" is the range we have evidence for.
export const DRIVER_PROFILES = {
  'Manager Quality':      { current: 6.2, measuredMin: 4.5, measuredMax: 7.8, sliderMin: 3.0, sliderMax: 9.0, unit: '/10' },
  'Psychological Safety': { current: 5.8, measuredMin: 4.0, measuredMax: 7.5, sliderMin: 3.0, sliderMax: 9.0, unit: '/10' },
  'Vicarious (OASI)':     { current: 4.2, measuredMin: 3.0, measuredMax: 6.5, sliderMin: 2.0, sliderMax: 8.0, unit: '/10' },
  'Entrusting (OASI)':    { current: 5.5, measuredMin: 4.0, measuredMax: 7.2, sliderMin: 3.0, sliderMax: 9.0, unit: '/10' },
  'Collaborative (OASI)': { current: 5.0, measuredMin: 3.5, measuredMax: 7.0, sliderMin: 2.5, sliderMax: 8.5, unit: '/10' },
  'Sentiment Score':      { current: 6.1, measuredMin: 4.5, measuredMax: 7.8, sliderMin: 3.0, sliderMax: 9.0, unit: '/10' },
};

// Evidence tier display metadata.
export const TIER_META = {
  'quasi-exp':  { color: '#10b981', bg: 'rgba(16,185,129,0.15)', label: 'Quasi-experimental' },
  'time-lag':   { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'Time-lagged' },
  'cross-sect': { color: '#ef4444', bg: 'rgba(239,68,68,0.15)',  label: 'Cross-sectional' },
};

// Axis label sets for the pivotable matrix.
export const DRIVER_NAMES = [
  'Manager Quality', 'Psychological Safety', 'Vicarious (OASI)',
  'Entrusting (OASI)', 'Collaborative (OASI)', 'Sentiment Score',
];
export const OUTCOME_NAMES = [
  '90-Day Retention', 'Innovation Output', 'Successor Readiness',
  'Cross-Div Project Velocity', 'Revenue Retention', 'Regrettable Attrition',
];
