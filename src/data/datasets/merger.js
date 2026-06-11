// Post Merger Updates datasets — ported verbatim from v1.24L App.jsx (lines 6809-7029).
// Acquired-employee survey feedback (Feb 2026 pulse).
export const MERGER_FEEDBACK_DATA = {
  metadata: {
    surveyDate: "2026-02-01",
    totalRespondents: 2847,
    acquiredEmployees: 1523,
    responseRate: 78.4,
    sourceMergers: [
      { name: "IHS Markit", year: 2022, employeesAcquired: 15000, currentRetained: 12450 },
      { name: "With Intelligence", year: 2025, employeesAcquired: 320, currentRetained: 298 },
      { name: "Kensho", year: 2020, employeesAcquired: 180, currentRetained: 142 }
    ]
  },
  mergerSuccess: { yes: 52, no: 23, uncertain: 25 },
  identity: { fullyIntegrated: 34, mostlyIntegrated: 28, holdover: 24, legacy: 14 },
  effectiveness: { score: 6.4, benchmark: 7.5, barriers: [
    { barrier: "Different systems/tools", percent: 67 },
    { barrier: "Unclear reporting structure", percent: 54 },
    { barrier: "Lost institutional knowledge", percent: 48 },
    { barrier: "Cultural differences", percent: 45 },
    { barrier: "New processes unclear", percent: 42 }
  ]},
  happiness: { happierBefore: 42, same: 31, happierNow: 27 },
  colleagueRetention: { average: 52, distribution: [
    { range: "0-20%", percent: 18, happiness: 4.8 },
    { range: "21-40%", percent: 22, happiness: 5.6 },
    { range: "41-60%", percent: 28, happiness: 6.4 },
    { range: "61-80%", percent: 20, happiness: 7.2 },
    { range: "81-100%", percent: 12, happiness: 7.9 }
  ]},
  atRiskSegments: [
    { segment: "High performers with >50% colleague loss", count: 142, flightRisk: 38, priority: "critical" },
    { segment: "Self-identified 'legacy' employees", count: 213, flightRisk: 35, priority: "critical" },
    { segment: "Effectiveness score <5 + tenure >2yr", count: 187, flightRisk: 32, priority: "high" },
    { segment: "Happier before + holdover identity", count: 298, flightRisk: 28, priority: "high" },
    { segment: "Commodity Insights acquired staff", count: 342, flightRisk: 26, priority: "medium" }
  ]
};

// Recommendations for acquired talent optimization.
export const MERGER_RECOMMENDATIONS = [
  {
    id: 1, priority: "critical",
    title: "Launch 'Integration Buddy' Program",
    description: "Pair acquired employees with legacy SPGI mentors to accelerate cultural integration.",
    metric: "Target: Move 50% of 'holdover' employees to 'integrated' within 6 months",
    evidence: ["38% identify as holdover/legacy", "Holdover retention 72% vs 94% integrated", "r=0.72 colleague-happiness correlation"],
    tactics: [
      { action: "Match based on role and interests", owner: "HR", timeline: "30 days" },
      { action: "90-day buddy program with milestones", owner: "HR", timeline: "45 days" },
      { action: "Monthly integration cohort events", owner: "Culture Team", timeline: "Ongoing" }
    ],
    expectedImpact: { happiness: 0.8, effectiveness: 0.6, retention: 12 }
  },
  {
    id: 2, priority: "critical",
    title: "Systems & Tools Unification Sprint",
    description: "67% cite different systems/tools as top barrier. Accelerate technology harmonization.",
    metric: "Target: Reduce 'systems barrier' complaints by 50% in Q2",
    evidence: ["Systems is #1 barrier (67%)", "Effectiveness 6.4 vs 7.5 benchmark", "Mobility most affected (5.8 score)"],
    tactics: [
      { action: "Unified SSO within 60 days", owner: "IT", timeline: "60 days" },
      { action: "Cross-platform training bootcamps", owner: "L&D", timeline: "90 days" },
      { action: "Sunset legacy systems", owner: "IT", timeline: "6 months" }
    ],
    expectedImpact: { happiness: 0.5, effectiveness: 1.2, retention: 8 }
  },
  {
    id: 3, priority: "high",
    title: "High-Performer Retention Task Force",
    description: "142 high performers with significant colleague loss at 38% flight risk.",
    metric: "Target: Reduce flight risk in this cohort to <15%",
    evidence: ["142 high performers at 38% risk", "Colleague loss predicts departure (r=0.81)", "Severe loss = 34% flight risk"],
    tactics: [
      { action: "1:1 stay interviews with all 142", owner: "HRBP", timeline: "21 days" },
      { action: "Targeted retention packages", owner: "Compensation", timeline: "45 days" },
      { action: "Executive sponsor assignment", owner: "Leadership", timeline: "14 days" }
    ],
    expectedImpact: { happiness: 1.0, effectiveness: 0.4, retention: 20 }
  },
  {
    id: 4, priority: "high",
    title: "Career Clarity Campaign",
    description: "54% report unclear reporting structures. Publish clear org charts and career paths.",
    metric: "Target: Reduce 'unclear structure' complaints to <25%",
    evidence: ["54% unclear on reporting", "Research/Finance lowest integration", "Correlates with holdover identity"],
    tactics: [
      { action: "Visual org charts published", owner: "HR", timeline: "30 days" },
      { action: "Career path workshops by division", owner: "L&D", timeline: "60 days" },
      { action: "Manager training on acquired talent", owner: "L&D", timeline: "45 days" }
    ],
    expectedImpact: { happiness: 0.6, effectiveness: 0.8, retention: 6 }
  }
];

// Enhanced merger data for the Post Merger Integration dashboard (10 critical dimensions).
export const ENHANCED_MERGER_DATA = {
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
      { area: 'Brand Perception', score: 5.6, status: 'critical' }
    ]
  },
  retentionRisk: {
    total: 335,
    breakdown: [
      { timeframe: '<6 months', count: 87, percent: 26, severity: 'critical' },
      { timeframe: '6-12 months', count: 142, percent: 42, severity: 'critical' },
      { timeframe: '1-2 years', count: 106, percent: 32, severity: 'high' }
    ],
    byDivision: [
      { division: 'Mobility', total: 89, percent: 26, flightRisk: 35 },
      { division: 'Commodity Insights', total: 128, percent: 37, flightRisk: 28 },
      { division: 'Market Intelligence', total: 68, percent: 20, flightRisk: 24 },
      { division: 'Ratings', total: 34, percent: 10, flightRisk: 18 },
      { division: 'Indices', total: 16, percent: 5, flightRisk: 12 }
    ],
    topReasons: [
      { reason: 'Better opportunities elsewhere', percent: 42 },
      { reason: 'Career path unclear', percent: 38 },
      { reason: 'Culture misalignment', percent: 34 },
      { reason: 'Compensation concerns', percent: 31 },
      { reason: 'Loss of former colleagues', percent: 28 }
    ]
  },
  keyTalent: {
    criticalCount: 47,
    atRiskCount: 23,
    replacementCost: 8.2,
    profiles: [
      { name: 'Legacy System Architects', count: 12, risk: 'high', skillGap: 24, docStatus: 'partial' },
      { name: 'Key Client Relationship Owners', count: 18, risk: 'critical', revenue: 42, docStatus: 'minimal' },
      { name: 'Specialized Analytics Leaders', count: 9, risk: 'medium', dependency: 15, docStatus: 'good' },
      { name: 'Product Domain Experts', count: 8, risk: 'high', knowledge: 'tribal', docStatus: 'partial' }
    ],
    knowledgeTransfer: {
      complete: 23,
      inProgress: 38,
      notStarted: 39
    }
  },
  managerQuality: {
    poorManagers: 28,
    affectedEmployees: 685,
    metrics: [
      { metric: 'Understanding of pre-merger role', score: 4.2, target: 7.0 },
      { metric: 'Advocacy for team member', score: 5.1, target: 7.5 },
      { metric: 'Feedback frequency', score: 5.8, target: 8.0 },
      { metric: 'Trust in leadership vision', score: 5.4, target: 7.5 }
    ],
    byOrigin: [
      { origin: 'SPGI Legacy', managerScore: 7.2, teamSatisfaction: 78 },
      { origin: 'Acquired Legacy', managerScore: 6.8, teamSatisfaction: 72 },
      { origin: 'Cross-Origin Pairs', managerScore: 5.1, teamSatisfaction: 58 },
      { origin: 'New Hires Post-Merger', managerScore: 6.4, teamSatisfaction: 65 }
    ]
  },
  customerImpact: {
    revenueAtRisk: 4.2,
    relationshipsDisrupted: 127,
    clientsLost: 18,
    concerns: [
      { concern: 'Relationship owner changed', percent: 48, impact: 'high' },
      { concern: 'Service quality declined', percent: 34, impact: 'medium' },
      { concern: 'Response time slower', percent: 29, impact: 'medium' },
      { concern: 'Knowledge gaps visible', percent: 42, impact: 'high' }
    ],
    bySegment: [
      { segment: 'Enterprise (>$1M)', affected: 23, risk: 2.8 },
      { segment: 'Mid-Market ($250K-$1M)', affected: 67, risk: 1.1 },
      { segment: 'SMB (<$250K)', affected: 37, risk: 0.3 }
    ]
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
      { identity: 'Legacy', percent: 14, satisfaction: 5.8 }
    ],
    collaborationFreq: [
      { frequency: 'Daily', percent: 22 },
      { frequency: 'Weekly', percent: 34 },
      { frequency: 'Monthly', percent: 28 },
      { frequency: 'Rarely', percent: 16 }
    ]
  },
  frictionPoints: {
    hoursLostPerWeek: 8.4,
    productivityCost: 2.3,
    topIssues: [
      { issue: 'Different tools/systems required', percent: 67, category: 'Tech' },
      { issue: 'Duplicative processes', percent: 54, category: 'Process' },
      { issue: 'Unclear decision authority', percent: 48, category: 'Structure' },
      { issue: 'Inconsistent communication', percent: 45, category: 'Culture' },
      { issue: 'Lost institutional knowledge', percent: 42, category: 'Knowledge' }
    ],
    systemsRated: [
      { system: 'Email/Calendar', score: 7.8 },
      { system: 'HR Portal', score: 4.2 },
      { system: 'Project Management', score: 5.1 },
      { system: 'Document Storage', score: 5.8 },
      { system: 'Expense Management', score: 6.4 }
    ]
  }
};
