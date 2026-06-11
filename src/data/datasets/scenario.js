// Scenario datasets — Scenario Tester persona presets (legacy App.jsx 3624–3708)
// and Scenario Modeling forward-model config (legacy App.jsx 4489–4547).

// ─── Scenario Tester presets per persona ───────────────────────────────────
// Each preset defines: scenario framing, input levers (with current/min/max),
// and a linear elasticity ($M per unit) used for the projected outcomes.
export const SCENARIO_PRESETS = {
  ceo: {
    label: 'CEO — Strategic move',
    framing: 'Test the behavioral and financial impact of a major strategic decision before committing to it.',
    levers: [
      { id: 'mna',        label: 'M&A activity (deals/yr)',                    current: 1, min: 0, max: 6,   unit: '',   dollarPerUnit: 12,   outcomeLabel: 'integration risk' },
      { id: 'restruct',   label: 'Restructure intensity (1=light, 10=heavy)',  current: 3, min: 1, max: 10,  unit: '',   dollarPerUnit: -3,   outcomeLabel: 'disruption signal' },
      { id: 'hireFreeze', label: 'Hiring freeze (% positions)',                current: 0, min: 0, max: 100, unit: '%',  dollarPerUnit: 0.15, outcomeLabel: 'capability gap' },
      { id: 'cliInvest',  label: 'CLI engagement investment ($M)',             current: 0, min: 0, max: 8,   unit: '$M', dollarPerUnit: 42,   outcomeLabel: 'behavioral readiness' },
    ],
  },
  cfo: {
    label: 'CFO — Budget reallocation',
    framing: 'Test how shifting dollars between L&D, hiring, retention, and behavioral measurement changes ROI and payback.',
    levers: [
      { id: 'ldBudget',     label: 'L&D budget ($M/yr)',         current: 8,  min: 0, max: 25, unit: '$M', dollarPerUnit: 3.2, outcomeLabel: 'capability lift' },
      { id: 'retentionPrg', label: 'Retention programs ($M/yr)', current: 4,  min: 0, max: 15, unit: '$M', dollarPerUnit: 5.8, outcomeLabel: 'attrition reduction' },
      { id: 'hiringSpend',  label: 'Hiring spend ($M/yr)',       current: 12, min: 0, max: 30, unit: '$M', dollarPerUnit: 1.1, outcomeLabel: 'pipeline strength' },
      { id: 'cliInvest',    label: 'CLI engagement ($M/yr)',     current: 0,  min: 0, max: 8,  unit: '$M', dollarPerUnit: 18,  outcomeLabel: 'measurement coverage' },
    ],
  },
  cso: {
    label: 'CSO — Market shift resilience',
    framing: "Test how your organization's behavioral profile holds up under different external scenarios.",
    levers: [
      { id: 'compMove',  label: 'Competitor disruption (1=mild, 10=severe)', current: 4,  min: 1,  max: 10, unit: '',  dollarPerUnit: -8,   outcomeLabel: 'market share exposure' },
      { id: 'recession', label: 'Recession depth (% GDP impact)',            current: 0,  min: -8, max: 4,  unit: '%', dollarPerUnit: 22,   outcomeLabel: 'revenue elasticity' },
      { id: 'regChange', label: 'Regulatory pressure (1=low, 10=high)',      current: 5,  min: 1,  max: 10, unit: '',  dollarPerUnit: -2.5, outcomeLabel: 'compliance burden' },
      { id: 'aiAdopt',   label: 'AI/automation adoption (% workforce)',      current: 20, min: 0,  max: 80, unit: '%', dollarPerUnit: 0.8,  outcomeLabel: 'productivity shift' },
    ],
  },
  chro: {
    label: 'CHRO — Intervention impact',
    framing: 'Test the projected OASI shift, retention, and sentiment from a specific intervention on a specific population.',
    levers: [
      { id: 'population',  label: 'Population covered (% employees)',          current: 15, min: 0, max: 100, unit: '%',  dollarPerUnit: 0.4, outcomeLabel: 'OASI lift coverage' },
      { id: 'cliTraining', label: 'CLI training depth (1=overview, 10=full)',  current: 3,  min: 1, max: 10,  unit: '',   dollarPerUnit: 2.2, outcomeLabel: 'behavior change' },
      { id: 'mgrChanges',  label: 'Manager replacements (% of total mgrs)',    current: 0,  min: 0, max: 40,  unit: '%',  dollarPerUnit: 0.6, outcomeLabel: 'team dynamics' },
      { id: 'duration',    label: 'Intervention duration (months)',            current: 6,  min: 1, max: 24,  unit: 'mo', dollarPerUnit: 1.4, outcomeLabel: 'time-to-effect' },
    ],
  },
  trainer: {
    label: 'Trainer — Curriculum impact',
    framing: 'Test which curriculum produces which behavioral lift, for which audience.',
    levers: [
      { id: 'audSize',  label: 'Cohort size (people)',                              current: 30, min: 5, max: 200, unit: '',   dollarPerUnit: 0.04, outcomeLabel: 'reach' },
      { id: 'duration', label: 'Program duration (weeks)',                          current: 8,  min: 2, max: 24,  unit: 'wk', dollarPerUnit: 0.2,  outcomeLabel: 'depth of learning' },
      { id: 'mode',     label: 'Mode intensity (1=virtual, 10=in-person/cohort)',   current: 5,  min: 1, max: 10,  unit: '',   dollarPerUnit: 0.15, outcomeLabel: 'engagement quality' },
      { id: 'asiUse',   label: 'A-OASI alignment (1=generic, 10=customized)',       current: 4,  min: 1, max: 10,  unit: '',   dollarPerUnit: 0.3,  outcomeLabel: 'relevance score' },
    ],
  },
  hrHiring: {
    label: 'HR Hiring — Selection weighting',
    framing: 'Test how weighting OASI dimensions in hiring criteria changes pipeline composition and projected team profile.',
    levers: [
      { id: 'wtVicarious',     label: 'Weight on Vicarious dimension (0-10)',     current: 3,  min: 0, max: 10,  unit: '', dollarPerUnit: 1.8,   outcomeLabel: 'succession depth' },
      { id: 'wtEntrusting',    label: 'Weight on Entrusting dimension (0-10)',    current: 4,  min: 0, max: 10,  unit: '', dollarPerUnit: 1.2,   outcomeLabel: 'delegation capacity' },
      { id: 'wtCollaborative', label: 'Weight on Collaborative dimension (0-10)', current: 5,  min: 0, max: 10,  unit: '', dollarPerUnit: 1.5,   outcomeLabel: 'team synergy' },
      { id: 'reqVolume',       label: 'Open requisitions',                        current: 25, min: 0, max: 150, unit: '', dollarPerUnit: -0.05, outcomeLabel: 'pipeline pressure' },
    ],
  },
  teamMgr: {
    label: 'Senior / Team Manager — 1:1 conversation impact',
    framing: 'Test how changing a 1:1 conversation pattern affects retention and engagement signal.',
    levers: [
      { id: 'frequency', label: '1:1 frequency (per month)',                     current: 2,  min: 0,  max: 8,   unit: '',    dollarPerUnit: 0.3,  outcomeLabel: 'contact regularity' },
      { id: 'duration',  label: '1:1 duration (minutes)',                        current: 30, min: 10, max: 90,  unit: 'min', dollarPerUnit: 0.08, outcomeLabel: 'depth per session' },
      { id: 'devFocus',  label: 'Development focus weight (1=task, 10=career)',  current: 3,  min: 1,  max: 10,  unit: '',    dollarPerUnit: 0.45, outcomeLabel: 'growth conversations' },
      { id: 'followup',  label: 'Follow-up action completion (%)',               current: 60, min: 0,  max: 100, unit: '%',   dollarPerUnit: 0.12, outcomeLabel: 'commitment delivery' },
    ],
  },
};

export const PERSONA_KEYS = ['ceo', 'cfo', 'cso', 'chro', 'trainer', 'hrHiring', 'teamMgr'];

// Funny "make this a PDF" copy for the Scenario Tester report button.
export const SCENARIO_PDF_SAYINGS = [
  'Forge this scenario as a PDF',
  'Bottle this scenario in a PDF',
  'Print to PDF and pretend it was always the plan',
  'PDF the receipts',
  'Make it official (in PDF)',
  'Ship this scenario as a PDF',
  'Crystallize as PDF',
  'PDF the alternate timeline',
  'Engage scenario PDF',
];

// ─── Scenario Modeling (dashboard) ──────────────────────────────────────────

// Calibration: past predictions vs. actuals — the credibility anchor.
export const CALIBRATION_HISTORY = [
  { quarter: 'Q1 2024', predicted: 3.5,  actual: 2.9,  label: 'AcmeCo Targeted Intervention' },
  { quarter: 'Q3 2024', predicted: -2.1, actual: -2.4, label: 'BetaInc Baseline' },
  { quarter: 'Q4 2024', predicted: 5.2,  actual: 4.7,  label: 'GammaLLC Aggressive' },
  { quarter: 'Q2 2025', predicted: 1.8,  actual: 2.1,  label: 'DeltaCorp Targeted' },
  { quarter: 'Q3 2025', predicted: 4.0,  actual: 3.6,  label: 'EpsilonInc Aggressive' },
  { quarter: 'Q4 2025', predicted: 2.4,  actual: 2.7,  label: 'ZetaCo Targeted' },
];

// Forward model (visible — not hidden). Each input has an estimated elasticity
// from CLI's cross-client panel. Output = sum of contributions.
export const SCENARIO_MODEL = {
  costReduction:  { coef: 0.18, label: 'Cost Reduction (% of OpEx)',          unit: '%',  range: [0, 20],  default: 8,   step: 1 },
  annualBilling:  { coef: 0.09, label: 'Annual Billing Migration (% custs.)', unit: '%',  range: [0, 100], default: 40,  step: 1 },
  hiringPause:    { coef: 0.06, label: 'Hiring Pause (% positions held)',     unit: '%',  range: [0, 60],  default: 25,  step: 1 },
  trainingInvest: { coef: 0.42, label: 'CLI Training Investment ($M)',        unit: '$M', range: [0, 8],   default: 2.5, step: 0.1 },
};
