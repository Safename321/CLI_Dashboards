// Culture Change dashboard datasets (ported from v1.24L App.jsx §CultureChangeDashboard).

// Target culture dimension values (percent scale).
export const TARGET_CULTURE_DIMENSIONS = {
  growthMindset: 70,
  psychSafety: 70,
  discretionaryEffort: 75,
  innovationReadiness: 75,
  teamCollaboration: 85,
};

// Culture dimension → OASI achieving-style correlation mapping (static rationale).
export const STYLE_MAPPINGS = [
  {
    dimension: 'Growth Mindset', dimKey: 'growthMindset',
    styles: ['Intrinsic', 'Vicarious', 'Contributory'],
    rationale: 'Growth mindset drives internal excellence standards (Intrinsic), mentoring others (Vicarious), and willingness to help (Contributory)',
  },
  {
    dimension: 'Psychological Safety', dimKey: 'psychSafety',
    styles: ['Entrusting', 'Collaborative', 'Vicarious'],
    rationale: 'High safety enables delegation (Entrusting), shared accountability (Collaborative), and coaching without fear (Vicarious). Inversely reduces Power and Competitive emphasis.',
  },
  {
    dimension: 'Discretionary Effort', dimKey: 'discretionaryEffort',
    styles: ['Intrinsic', 'Contributory', 'Personal'],
    rationale: 'Extra effort stems from internal drive (Intrinsic), helping beyond role (Contributory), and personal investment (Personal)',
  },
  {
    dimension: 'Innovation Readiness', dimKey: 'innovationReadiness',
    styles: ['Intrinsic', 'Entrusting', 'Social'],
    rationale: 'Innovation requires excellence standards (Intrinsic), freedom to experiment (Entrusting), and networking for ideas (Social). Inversely reduces Power control.',
  },
  {
    dimension: 'Team Collaboration', dimKey: 'teamCollaboration',
    styles: ['Collaborative', 'Contributory', 'Social'],
    rationale: 'Teamwork directly maps to Collaborative style, supported by helping (Contributory) and networking (Social). Inversely reduces Competitive individualism.',
  },
];

// 3-year culture trend summary cards.
export const CULTURE_TRENDS = [
  { delta: '-10%', label: 'Growth Mindset', range: '62% → 56%' },
  { delta: '-15%', label: 'Psych Safety', range: '6.8 → 5.8' },
  { delta: '+72%', label: 'Realignment Requests', range: '8.5% → 14.6%' },
  { delta: '+95%', label: 'Flight Risk', range: '4.2% → 8.2%' },
];

// OASI radar axis order, grouped by cluster (cluster colors per design tokens:
// direct=#eab308, instrumental=#ef4444, relational=#3b82f6).
export const OASI_STYLE_ORDER = [
  { key: 'intrinsic', label: 'Intrinsic', cluster: 'direct' },
  { key: 'competitive', label: 'Competitive', cluster: 'direct' },
  { key: 'power', label: 'Power', cluster: 'direct' },
  { key: 'entrusting', label: 'Entrusting', cluster: 'instrumental' },
  { key: 'social', label: 'Social', cluster: 'instrumental' },
  { key: 'personal', label: 'Personal', cluster: 'instrumental' },
  { key: 'collaborative', label: 'Collaborative', cluster: 'relational' },
  { key: 'contributory', label: 'Contributory', cluster: 'relational' },
  { key: 'vicarious', label: 'Vicarious', cluster: 'relational' },
];

// Critical recommendation panel content.
export const CULTURE_RECOMMENDATION = {
  severity: 'warning',
  title: 'Culture Transformation Needed - Gap Between Stated and Actual',
  strategy:
    'Culture change requires addressing the gap between team-level satisfaction and company-level dissatisfaction. Focus on transparent leadership communication and role clarity workshops.',
  tactics: [
    { title: 'Culture Audit', description: 'Survey comparing stated vs actual values', deliverable: 'Audit Report', canCreate: true },
    { title: 'Leadership Alignment Workshop', description: 'Ensure consistent messaging from leaders', deliverable: 'Workshop Materials', canCreate: true },
    { title: 'Role Clarity Program', description: 'Address realignment requests proactively', deliverable: 'Program Design', canCreate: true },
    { title: 'Conflict Resolution Playbook', description: 'Resolve friction across age, experience, opinion, work style & personality', deliverable: 'Conflict Resolution Playbook', canCreate: true },
  ],
};

// Fallback KPI values (legacy DEFAULT_YEAR_DATA subset).
export const CULTURE_KPI_DEFAULTS = {
  improveWork: 60, improveTeam: 25, teamCooperation: 12, psychSafety: 6.5,
  discretionaryEffort: 70, realignment: 10, teamHappiness: 7.2, companyHappiness: 6.5,
  flightRisk: 5, withholding: 1.2,
};
