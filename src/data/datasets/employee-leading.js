// Employee leading-indicator / post-merger integration dataset.
// Extracted from legacy ENHANCED_MERGER_DATA (v1.24L App.jsx). Shared by the
// Employee Leading dashboard and the Post Merger Integration dashboard.

export const EMPLOYEE_LEADING_DATA = {
  executiveSummary: {
    totalValueAtRisk: 14.7,
    flightRisk: 335,
    criticalTalentRisk: 47,
    enpsGap: -26,
    healthScores: [
      { area: 'Retention Intent', score: 4.8, status: 'critical' },
      { area: 'Key Talent Risk', score: 5.2, status: 'critical' },
      { area: 'Manager Quality', score: 5.5, status: 'critical' },
      { area: 'Customer Impact', score: 5.8, status: 'warning' },
      { area: 'Culture Integration', score: 6.1, status: 'warning' },
      { area: 'Career Clarity', score: 6.3, status: 'warning' },
      { area: 'Systems Friction', score: 6.0, status: 'warning' },
      { area: 'Knowledge Transfer', score: 6.4, status: 'warning' },
      { area: 'Innovation Flow', score: 5.9, status: 'warning' },
      { area: 'Brand Perception', score: 5.6, status: 'critical' },
    ],
  },
  retentionRisk: {
    total: 335,
    breakdown: [
      { timeframe: '<6 months', count: 87, percent: 26, severity: 'critical' },
      { timeframe: '6-12 months', count: 142, percent: 42, severity: 'critical' },
      { timeframe: '1-2 years', count: 106, percent: 32, severity: 'high' },
    ],
    byDivision: [
      { division: 'Mobility', total: 89, percent: 26, flightRisk: 35 },
      { division: 'Commodity Insights', total: 128, percent: 37, flightRisk: 28 },
      { division: 'Market Intelligence', total: 68, percent: 20, flightRisk: 24 },
      { division: 'Ratings', total: 34, percent: 10, flightRisk: 18 },
      { division: 'Indices', total: 16, percent: 5, flightRisk: 12 },
    ],
    topReasons: [
      { reason: 'Better opportunities elsewhere', percent: 42 },
      { reason: 'Career path unclear', percent: 38 },
      { reason: 'Culture misalignment', percent: 34 },
      { reason: 'Compensation concerns', percent: 31 },
      { reason: 'Loss of former colleagues', percent: 28 },
    ],
  },
  keyTalent: {
    criticalCount: 47,
    atRiskCount: 23,
    replacementCost: 8.2,
    profiles: [
      { name: 'Legacy System Architects', count: 12, risk: 'high', skillGap: 24, docStatus: 'partial' },
      { name: 'Key Client Relationship Owners', count: 18, risk: 'critical', revenue: 42, docStatus: 'minimal' },
      { name: 'Specialized Analytics Leaders', count: 9, risk: 'medium', dependency: 15, docStatus: 'good' },
      { name: 'Product Domain Experts', count: 8, risk: 'high', knowledge: 'tribal', docStatus: 'partial' },
    ],
    knowledgeTransfer: { complete: 23, inProgress: 38, notStarted: 39 },
  },
  managerQuality: {
    poorManagers: 28,
    affectedEmployees: 685,
    metrics: [
      { metric: 'Understanding of pre-merger role', score: 4.2, target: 7.0 },
      { metric: 'Advocacy for team member', score: 5.1, target: 7.5 },
      { metric: 'Feedback frequency', score: 5.8, target: 8.0 },
      { metric: 'Trust in leadership vision', score: 5.4, target: 7.5 },
    ],
    byOrigin: [
      { origin: 'SPGI Legacy', managerScore: 7.2, teamSatisfaction: 78 },
      { origin: 'Acquired Legacy', managerScore: 6.8, teamSatisfaction: 72 },
      { origin: 'Cross-Origin Pairs', managerScore: 5.1, teamSatisfaction: 58 },
      { origin: 'New Hires Post-Merger', managerScore: 6.4, teamSatisfaction: 65 },
    ],
  },
  customerImpact: {
    revenueAtRisk: 4.2,
    relationshipsDisrupted: 127,
    clientsLost: 18,
    concerns: [
      { concern: 'Relationship owner changed', percent: 48, impact: 'high' },
      { concern: 'Service quality declined', percent: 34, impact: 'medium' },
      { concern: 'Response time slower', percent: 29, impact: 'medium' },
      { concern: 'Knowledge gaps visible', percent: 42, impact: 'high' },
    ],
    bySegment: [
      { segment: 'Enterprise (>$1M)', affected: 23, risk: 2.8 },
      { segment: 'Mid-Market ($250K-$1M)', affected: 67, risk: 1.1 },
      { segment: 'SMB (<$250K)', affected: 37, risk: 0.3 },
    ],
  },
  cultureVoice: {
    ideasUsedScore: 4.8,
    bestPracticesAdopted: 34,
    comfortChallenging: 52,
    innovationDecline: -57,
    segments: [
      { identity: 'Fully Integrated', percent: 34, satisfaction: 8.2 },
      { identity: 'Mostly Integrated', percent: 28, satisfaction: 7.5 },
      { identity: 'Holdover', percent: 24, satisfaction: 6.2 },
      { identity: 'Legacy', percent: 14, satisfaction: 5.8 },
    ],
    collaborationFreq: [
      { frequency: 'Daily', percent: 22 },
      { frequency: 'Weekly', percent: 34 },
      { frequency: 'Monthly', percent: 28 },
      { frequency: 'Rarely', percent: 16 },
    ],
  },
  frictionPoints: {
    hoursLostPerWeek: 8.4,
    productivityCost: 2.3,
    topIssues: [
      { issue: 'Different tools/systems required', percent: 67, category: 'Tech' },
      { issue: 'Duplicative processes', percent: 54, category: 'Process' },
      { issue: 'Unclear decision authority', percent: 48, category: 'Structure' },
      { issue: 'Inconsistent communication', percent: 45, category: 'Culture' },
      { issue: 'Lost institutional knowledge', percent: 42, category: 'Knowledge' },
    ],
    systemsRated: [
      { system: 'Email/Calendar', score: 7.8 },
      { system: 'HR Portal', score: 4.2 },
      { system: 'Project Management', score: 5.1 },
      { system: 'Document Storage', score: 5.8 },
      { system: 'Expense Management', score: 6.4 },
    ],
  },
};

// Shared 7-tab strip (Employee Leading + Post Merger Integration).
export const EMPLOYEE_TABS = [
  { id: 'executive', label: 'Executive Summary', icon: '👔' },
  { id: 'retention', label: 'Retention Risk', icon: '🚨' },
  { id: 'talent', label: 'Key Talent', icon: '⭐' },
  { id: 'managers', label: 'Manager Quality', icon: '👥' },
  { id: 'customers', label: 'Customer Impact', icon: '💰' },
  { id: 'culture', label: 'Culture & Voice', icon: '🎭' },
  { id: 'friction', label: 'Friction Points', icon: '⚙️' },
];

// Headline leading-indicator cards (legacy EmployeeLeadingDashboard metric row).
export const EMPLOYEE_LEADING_METRICS = [
  { label: 'Discretionary Effort', value: 62, unit: '%', benchmark: '75%', trend: -8, status: 'danger' },
  { label: 'Psychological Safety', value: 5.8, unit: '/10', benchmark: '7.2', trend: -12, status: 'danger' },
  { label: 'Internal Mobility', value: 18, unit: '%', benchmark: '22%', trend: 5, status: 'good' },
  { label: 'Manager Effectiveness', value: 6.4, unit: '/10', benchmark: '7.5', trend: -3, status: 'warning' },
];
