// External View static demo content (ported from v1.24L ExternalDashboard).
// Connector payloads override these demo values when available.

export const CRISIS_RECOMMENDATION = {
  severity: 'critical',
  title: 'External Perception Crisis - Multiple Warning Signs',
  // evidence is built at render time from yearData (needs live KPI values)
  strategy:
    'Execute immediate crisis response for PR while addressing underlying customer experience issues. ' +
    'Rising competitor satisfaction indicates potential market share risk.',
  tactics: [
    { title: 'Crisis Response Statement', description: 'Draft holding statement for media', deliverable: 'Press Statement' },
    { title: 'Competitive Analysis', description: 'Understand why customers prefer competitors', deliverable: 'Analysis Report' },
    { title: 'Customer Win-Back Campaign', description: 'Targeted outreach to at-risk accounts', deliverable: 'Campaign Plan' },
  ],
};

// Demo PR-crisis stats — used until a news connector reports a live crisis.
export const DEMO_CRISIS = {
  negativeMentions: 3,
  sentimentChange: -22, // %
  reach: '847K',
  responseWindow: '24h',
};

export const MEDIA_METRICS = [
  { label: 'Media Mentions (7d)', value: 47, benchmark: '52', trend: -10, status: 'warning' },
  { label: 'Social Sentiment', value: 62, unit: '%', benchmark: '75%', trend: -22, status: 'danger' },
  { label: 'Share of Voice', value: 18, unit: '%', benchmark: '22%', trend: -4, status: 'warning' },
  { label: 'Brand Favorability', value: 58, unit: '%', benchmark: '68%', trend: -8, status: 'warning' },
];

export const MEDIA_LISTS = [
  {
    tone: 'negative',
    title: '🔴 Recent Negative Coverage',
    items: ['TechBlog: "Customer complaints rising"', 'Industry Weekly: "Market share concerns"', 'Social: 3 viral complaint threads'],
  },
  {
    tone: 'caution',
    title: '🟡 Competitor Activity',
    items: ['Competitor A: New product launch', 'Competitor B: Price reduction', 'Competitor C: Customer win PR'],
  },
  {
    tone: 'positive',
    title: '🟢 Positive Opportunities',
    items: ['Industry award nomination pending', 'Customer success story available', 'Thought leadership article ready'],
  },
];

export const STAKEHOLDER_COMMS = [
  { icon: '🎤', status: 'URGENT', label: 'Press Statement Needed', tone: 'negative' },
  { icon: '📧', status: 'PENDING', label: 'Investor Update Due', tone: 'caution' },
  { icon: '🤝', status: 'ON TRACK', label: 'Partner Newsletter', tone: 'positive' },
  { icon: '📰', status: 'SCHEDULED', label: 'Earnings Call', tone: 'positive' },
];
