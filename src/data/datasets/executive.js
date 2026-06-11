// Static panel copy for the Executive cluster (CEO Advisory, Board Directors,
// Investor Relations). Narrative/demo content only — financial figures come
// from spgi-data.json via useData()/useYearData, never duplicated here.

// Operational efficiency KPIs (SaaS-style demo metrics; not part of the SPGI
// financial dataset). Drives the strategy-trigger logic on CEO Advisory.
export const EXEC_KPIS = {
  cashMultiple: 0.8,
  cacPayback: 14,
  churnRate: 4.2,
  salesCycle: 78,
  leadConversion: 3.8,
};

// One entry per Financial Efficiency KPI card. `boardAction` is the compact
// label used on the Board Directors packet tiles.
export const FINANCIAL_KPI_CARDS = [
  { label: 'Cash Multiple', value: 0.8, unit: 'x', threshold: '1.0', thresholdDir: '>', status: 'danger', trigger: 'Cut Costs + Annual Billing', boardAction: '↓ Cut Costs' },
  { label: 'CAC Payback', value: 14, unit: ' mo', threshold: '12', thresholdDir: '<', status: 'warning', trigger: 'Cut Costs + Pause Hiring', boardAction: '↓ Pause Hiring' },
  { label: 'Churn Rate', value: 4.2, unit: '%', threshold: '3', thresholdDir: '<', status: 'danger', trigger: 'All 3 Strategies', boardAction: '↓ Annual Billing' },
  { label: 'Sales Cycle', value: 78, unit: ' days', threshold: '90', thresholdDir: '<', status: 'good', trigger: null, boardAction: '✓ On Track' },
  { label: 'Lead Conversion', value: 3.8, unit: '%', threshold: '5', thresholdDir: '>', status: 'danger', trigger: 'Cut Costs + Pause Hiring', boardAction: '↓ Cut Channels' },
];

export const STRATEGY_CARDS = [
  { key: 'cutCosts', icon: '✂️', label: 'Cut Costs' },
  { key: 'pauseHiring', icon: '⏸️', label: 'Pause Hiring' },
  { key: 'annualBilling', icon: '📅', label: 'Annual Billing' },
];

// "What changed since your last login" feed. `view` is the nav id the link
// jumps to (see src/config/nav.js).
export const CHANGE_FEED = [
  { sev: 'red', icon: '🔺', text: 'Churn breach probability rose from 22% to 34% over the last 24h — driven by Q4 cohort renewal slip', link: 'Early Warning KPIs', view: 'early-warning' },
  { sev: 'red', icon: '⚠️', text: 'Glassdoor rating dropped from 3.9 to 3.7 (last 30 days) — keyword "no growth path" up 4× vs. baseline', link: 'Sentiment Analysis', view: 'sentiment' },
  { sev: 'amber', icon: '📉', text: "Moody's announced AI-ratings product yesterday — competitive risk to Ratings franchise", link: 'External View', view: 'external' },
  { sev: 'green', icon: '✅', text: 'Mobility spin-off behavioral readiness score moved 3.4 → 3.6 after CHRO intervention rolled out', link: 'Culture Change', view: 'culture-change' },
  { sev: 'green', icon: '✅', text: "CLI training program ROI re-projected: +$2.1M vs. last quarter's +$1.8M (calibration updated)", link: 'Scenario Modeling', view: 'scenario-modeling' },
];

// Strategic SWOT quadrants (synthesis from the OASI diagnostic, N = 847).
// Items may carry an `em` lead-in that renders emphasized.
export const SWOT_QUADRANTS = [
  {
    key: 'strengths', title: 'Strengths', tag: 'Direct set', tone: 'emerald',
    items: [
      { text: 'Direct-set alignment (Comp 5.4, Power 5.0) fits Ratings franchise' },
      { text: 'Decision velocity at executive level' },
      { text: 'Brand strength in Ratings, Indices, Commodity Insights' },
      { text: 'Pricing power defended by analytical depth' },
    ],
  },
  {
    key: 'weaknesses', title: 'Weaknesses', tag: 'Relational gap', tone: 'red',
    items: [
      { em: 'Vicarious 3.11', text: ' — thin succession bench' },
      { em: 'Entrusting 3.43', text: ' — delegation friction blocks AI delivery' },
      { text: 'Collaborative gap — silos across divisions' },
      { text: 'Post-IHS Markit integration drag' },
    ],
  },
  {
    key: 'opportunities', title: 'Opportunities', tag: 'Growth lanes', tone: 'blue',
    items: [
      { text: 'Mobility spin-off — clean-slate culture reset' },
      { text: 'AI products needing cross-divisional data fusion' },
      { text: 'Sustainability data — Contributory-style fit' },
      { text: 'Talent reallocation into Private Markets / AI bets' },
    ],
  },
  {
    key: 'threats', title: 'Threats', tag: 'External + execution', tone: 'amber',
    items: [
      { text: "Moody's, MSCI, FactSet, Bloomberg, LSEG — agentic AI race" },
      { text: 'Succession risk from Vicarious gap' },
      { text: 'Talent flight to fintech / AI competitors' },
      { text: 'Mobility spin-off execution risk — CEO bottleneck' },
    ],
  },
];

// Inputs for the full SWOT report generator button.
export const SWOT_REPORT = {
  tactic: {
    title: 'Full SWOT Report',
    deliverable: 'SWOT Report',
    description: '9-style score table, four items per quadrant with business linkage, three targeted recommendations, methodology footer',
  },
  panelTitle: 'Strategic SWOT — derived from OASI',
  evidence: [
    'Strengths: direct-set alignment (Comp 5.4, Power 5.0) fits the Ratings franchise',
    'Weaknesses: Vicarious 3.11 succession bench and Entrusting 3.43 delegation friction',
    'Opportunities: Mobility spin-off culture reset and cross-divisional AI data fusion',
    "Threats: agentic AI race (Moody's, MSCI, FactSet, Bloomberg, LSEG) and CEO-bottleneck execution risk",
  ],
  strategy: 'Behavioral diagnostic translated into strategic position vs. Mobility spin-off, IHS Markit integration, and the AI competitive front (N = 847 · OASI).',
};

// Critical alert panel content on CEO Advisory.
export const CEO_KPI_ALERT = {
  severity: 'critical',
  title: 'Financial KPIs Triggering Strategic Action',
  evidence: [
    'Cash Multiple at 0.8x (below 1.0 threshold) - weak ROI',
    'CAC Payback at 14 months (above 12mo threshold) - high acquisition cost',
    'Churn Rate at 4.2% (above 3% threshold) - customer retention issue',
    'Lead Conversion at 3.8% (below 5% threshold) - funnel inefficiency',
  ],
  strategy: 'Multiple KPIs are triggering cost reduction and billing strategy changes. Recommend prioritizing Cut Costs actions while implementing Annual Billing to improve cash flow.',
  tactics: [
    { title: 'Cost Reduction Analysis', description: 'Identify non-essential spend across marketing/sales', deliverable: 'Cost Analysis Report', canCreate: true },
    { title: 'Annual Billing Migration Plan', description: 'Strategy to shift customers from monthly to annual plans', deliverable: 'Migration Playbook', canCreate: true },
    { title: 'Hiring Freeze Memo', description: 'Draft communication for selective hiring pause', deliverable: 'Internal Memo', canCreate: true },
  ],
};

// Insight-horizon panels (Predictive / Diagnostic). The Outcome column is
// rendered from live dataset financials in the dashboard itself.
export const PREDICTIVE_ROWS = [
  { label: 'Engagement Trajectory', value: '↓ Declining', tone: 'red' },
  { label: 'R&D Pipeline', value: 'Strong', tone: 'emerald' },
  { label: 'Market Position', value: 'At Risk', tone: 'amber' },
];

export const DIAGNOSTIC_ROWS = [
  { label: 'Customer Satisfaction', value: '7.2', change: -5 },
  { label: 'Operational Efficiency', value: '82%', change: 3 },
  { label: 'Team Velocity', value: '94', change: -12 },
];

export const AI_RECOMMENDATIONS = [
  {
    priority: 'critical', title: 'Address Operations Engagement Crisis',
    rationale: 'Operations sentiment dropped 15%. Historical 18-month lag to revenue.',
    actions: ['Skip-level meetings with Ops leads', "Root cause analysis on 'team difficulties'", 'Benchmark compensation'],
    impact: '$2.1M ARR at risk', effort: '4-6 weeks',
  },
  {
    priority: 'high', title: 'Proactive PR Response',
    rationale: '3 negative mentions in 24h. Social sentiment dropped 22%.',
    actions: ['Draft holding statement', 'Brief executive team', 'Schedule internal all-hands'],
    impact: 'Reputation', effort: '24-48 hours',
  },
  {
    priority: 'medium', title: 'Accelerate Customer Success Investment',
    rationale: 'Customer Effort Score trending down while NPS stable.',
    actions: ['Increase CS headcount by 2 FTEs', 'Implement proactive health scoring'],
    impact: '$800K retention', effort: '8-12 weeks',
  },
];

// tone drives the bar color; valueTone the number color (legacy parity).
export const KEY_METRICS = [
  { label: 'OASI Score', value: '0.94', pct: 94, tone: 'emerald', valueTone: 'white' },
  { label: 'Stakeholder Alignment', value: '68%', pct: 68, tone: 'amber', valueTone: 'amber' },
  { label: 'Financial Health', value: '82%', pct: 82, tone: 'emerald', valueTone: 'emerald' },
];

export const ATTENTION_ITEMS = [
  { tone: 'red', text: '2 employees overdue 14+ days' },
  { tone: 'red', text: 'PR crisis escalating' },
  { tone: 'amber', text: 'Board meeting in 5 days' },
];

// ── Board Directors packet ────────────────────────────────────────────────
export const BOARD_PACKET_ALERT = {
  severity: 'info',
  title: 'Q2 Board Presentation Ready for Download',
  evidence: [
    'Q2 Board Meeting scheduled in 5 days (May 22, 2026)',
    '3 critical issues requiring board attention identified',
    'Strategy execution at 78% vs 85% target',
    'All data compiled and formatted for board presentation',
  ],
  strategy: 'A comprehensive board presentation has been pre-generated based on current dashboard data.',
  tactics: [
    { title: 'Review Pre-Generated Presentation', description: 'Download and review the complete board presentation', deliverable: 'Board Report', canCreate: true },
    { title: 'Customize Talking Points', description: 'Add CEO-specific commentary', deliverable: 'Annotated Presentation', canCreate: true },
    { title: 'Prepare Q&A Briefing', description: 'Anticipate board questions', deliverable: 'Q&A Document', canCreate: true },
  ],
  downloadUrl: 'Board_Packet',
  downloadLabel: 'Q2 2026 Board Presentation (9 slides)',
};

export const BOARD_EXEC_SUMMARY = [
  { value: 'C+', tone: 'amber', label: 'Overall Health', note: 'Down from B-' },
  { value: '3', tone: 'red', label: 'Critical Issues', note: 'Requiring attention' },
  { value: '2', tone: 'emerald', label: 'Strategic Wins', note: 'This quarter' },
  { value: '78%', tone: 'cyan', label: 'Strategy Execution', note: 'vs 85% target' },
];

export const BOARD_INITIATIVES = [
  { name: 'Digital Transformation', status: 'on-track', progress: 72, owner: 'CTO', risk: 'low' },
  { name: 'Market Expansion (APAC)', status: 'at-risk', progress: 45, owner: 'CRO', risk: 'high' },
  { name: 'Talent Development Program', status: 'delayed', progress: 38, owner: 'CHRO', risk: 'medium' },
  { name: 'Customer Experience 2.0', status: 'on-track', progress: 85, owner: 'CCO', risk: 'low' },
];

// Risk heat map: each row is a category with cells for Low → Critical.
// tone: green | amber | red | none; bold cells are named hot-spots.
export const RISK_HEATMAP = {
  columns: ['Low', 'Medium', 'High', 'Critical'],
  rows: [
    { category: 'Strategic', cells: [{ text: '1', tone: 'green' }, { text: '2', tone: 'amber' }, { text: 'PR', tone: 'red', bold: true }, { text: '0', tone: 'none' }] },
    { category: 'Operational', cells: [{ text: '3', tone: 'green' }, { text: 'Engage', tone: 'amber', bold: true }, { text: '1', tone: 'none' }, { text: '0', tone: 'none' }] },
    { category: 'Financial', cells: [{ text: '4', tone: 'green' }, { text: 'CAC', tone: 'amber', bold: true }, { text: 'Cash', tone: 'red', bold: true }, { text: '0', tone: 'none' }] },
    { category: 'Compliance', cells: [{ text: '5', tone: 'green' }, { text: '1', tone: 'green' }, { text: '0', tone: 'none' }, { text: '0', tone: 'none' }] },
  ],
};

// ── Investor Relations ────────────────────────────────────────────────────
export const IR_ALERT = {
  severity: 'info',
  title: 'Strong Buy Consensus Despite Recent Price Decline',
  tactics: [
    { title: 'Investor Presentation', description: 'Q4 2025 earnings deck for shareholders', deliverable: 'Investor Deck', canCreate: true },
    { title: 'Guidance Bridge Analysis', description: 'Explain variance to consensus', deliverable: 'Analysis Doc', canCreate: true },
    { title: 'Earnings Call Q&A Prep', description: 'Anticipated analyst questions', deliverable: 'Q&A Guide', canCreate: true },
  ],
  downloadUrl: 'Investor_Update',
  downloadLabel: 'Q4 2025 Investor Presentation',
};

// Not present in the SPGI dataset — static market-context copy.
export const IR_PRICE_52W = '$374 - $541';
export const IR_DIVIDEND_NOTE = '53rd consecutive year of increases';
