// Early Warning KPIs — static thresholds + forecast inputs.
// Ported from legacy App.jsx (v1.24L) lines 3367–3545. Data only; model math
// lives in src/dashboards/early-warning/.

// Probability-of-breach forecasting inputs per KPI (linear trend + Gaussian noise).
export const BREACH_FORECASTS = [
  { kpi: 'Cash Multiple',   current: 0.8, threshold: 1.0, dir: 'below', trend: -0.04, vol: 0.06, dollarAtRisk: 18 },
  { kpi: 'CAC Payback',     current: 14,  threshold: 12,  dir: 'above', trend: +0.3,  vol: 0.8,  dollarAtRisk: 6 },
  { kpi: 'Churn Rate',      current: 4.2, threshold: 5.0, dir: 'above', trend: +0.15, vol: 0.18, dollarAtRisk: 14 },
  { kpi: 'Lead Conversion', current: 3.8, threshold: 5.0, dir: 'below', trend: -0.05, vol: 0.12, dollarAtRisk: 9 },
  { kpi: 'DIO (days)',      current: 72,  threshold: 60,  dir: 'above', trend: +1.2,  vol: 2.4,  dollarAtRisk: 4 },
  { kpi: 'DSO (days)',      current: 52,  threshold: 45,  dir: 'above', trend: +0.6,  vol: 1.8,  dollarAtRisk: 3 },
];

// Financial efficiency warning cards (4 of 5 triggered).
export const FINANCIAL_KPIS = [
  { label: 'Cash Multiple',   value: 0.8, unit: 'x',      threshold: '1.0', thresholdDir: '>', status: 'danger',  trigger: 'Cut Costs' },
  { label: 'CAC Payback',     value: 14,  unit: ' mo',    threshold: '12',  thresholdDir: '<', status: 'warning', trigger: 'Pause Hiring' },
  { label: 'Churn Rate',      value: 4.2, unit: '%',      threshold: '3',   thresholdDir: '<', status: 'danger',  trigger: 'Annual Billing' },
  { label: 'Sales Cycle',     value: 78,  unit: ' days',  threshold: '90',  thresholdDir: '<', status: 'good',    trigger: null },
  { label: 'Lead Conversion', value: 3.8, unit: '%',      threshold: '5',   thresholdDir: '>', status: 'danger',  trigger: 'Cut Channels' },
];

// Working capital warning cards (2 of 3 triggered).
export const WORKING_CAPITAL_KPIS = [
  { label: 'Days Inventory (DIO)',   value: 72, unit: ' days', threshold: '60', thresholdDir: '<', status: 'danger',  trigger: 'Reduce Purchasing' },
  { label: 'Days Receivables (DSO)', value: 52, unit: ' days', threshold: '45', thresholdDir: '<', status: 'warning', trigger: 'Accelerate Collections' },
  { label: 'Days Payables (DPO)',    value: 37, unit: ' days', threshold: '30', thresholdDir: '>', status: 'good',    trigger: null },
];

// Cash Conversion Cycle = DIO + DSO − DPO, with the breakdown bar widths.
export const CASH_CONVERSION = {
  dio: 72,
  dso: 52,
  dpo: 37,
  total: 87,
  segments: [
    { label: 'DIO: 72d',  width: 42, className: 'bg-red-500/60' },
    { label: 'DSO: 52d',  width: 30, className: 'bg-amber-500/60' },
    { label: '-DPO: 37d', width: 28, className: 'bg-emerald-500/60' },
  ],
};

// People & engagement metric cards (2 breached).
export const PEOPLE_METRICS = [
  { key: 'discretionaryEffort',  label: 'Discretionary Effort',  value: 62,  unit: '%',   benchmark: '75%',  trend: -8,  status: 'danger', subtitle: 'Below 65% threshold' },
  { key: 'psychologicalSafety',  label: 'Psychological Safety',  value: 5.8, unit: '/10', benchmark: '7.2',  trend: -12, status: 'danger', subtitle: 'Below 6.0 threshold' },
  { key: 'internalMobility',     label: 'Internal Mobility',     value: 18,  unit: '%',   benchmark: '22%',  trend: 5,   status: 'good' },
  { key: 'regrettableAttrition', label: 'Regrettable Attrition', value: 8.2, unit: '%',   benchmark: '10%',  trend: -3,  status: 'good' },
];

// Predictive revenue impact scenarios (18–24 months).
export const REVENUE_IMPACT_SCENARIOS = [
  { label: 'If No Action Taken',        value: '-$8.2M', note: 'Projected revenue impact', tone: 'red' },
  { label: 'With Partial Intervention', value: '-$3.1M', note: 'Reduced impact scenario',  tone: 'amber' },
  { label: 'With Full Intervention',    value: '+$2.9M', note: 'Optimistic scenario',      tone: 'emerald' },
];

// CLI Advisory recommendation panel content.
export const EW_RECOMMENDATION = {
  severity: 'critical',
  title: '6 Early Warning Indicators Breaching Thresholds',
  evidence: [
    'Cash Multiple at 0.8x - below 1.0 (weak ROI)',
    'CAC Payback at 14 months - above 12mo threshold',
    'Churn Rate at 4.2% - above 3% threshold',
    'Lead Conversion at 3.8% - below 5% threshold',
    'Days Inventory at 72 days - above 60 day threshold',
    'Days Receivables at 52 days - above 45 day threshold',
  ],
  strategy:
    'Multiple financial efficiency and working capital KPIs are signaling need for immediate action. ' +
    'High DIO suggests demand weakness or overproduction; high DSO indicates collection issues. ' +
    'Combined CCC of 87 days is straining working capital.',
  tactics: [
    { title: 'Inventory Reduction Plan', description: 'Identify slow-moving SKUs and reduce purchasing', deliverable: 'Inventory Analysis', canCreate: true },
    { title: 'Collections Campaign', description: 'Accelerate AR collections and tighten payment terms', deliverable: 'Collections Playbook', canCreate: true },
    { title: 'Annual Billing Migration', description: 'Shift customers to prepaid annual plans', deliverable: 'Migration Plan', canCreate: true },
  ],
};

// Methodology footnote shown at the bottom of the dashboard.
export const EW_METHODOLOGY =
  'Breach probabilities use a linear-trend + Gaussian-noise forecast over the trailing 12 quarters of each KPI. ' +
  '90-day horizon. Volatility estimated as residual standard deviation around the trend. ' +
  'Dollar impact tied to SPGI ARR base and current cost structure. ' +
  'Calibration: model error has averaged ±11% across the last six quarters of out-of-sample testing.';
