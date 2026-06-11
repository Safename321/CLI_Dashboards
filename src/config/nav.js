// Sidebar navigation groups (mirrors v1.24L grouping). The view ids match the
// keys in dashboards/index.js. Single source for nav + routing.
export const NAV_GROUPS = [
  {
    title: 'Overview',
    items: [{ id: 'overview', label: 'Overview', icon: '📖' }],
  },
  {
    title: 'Executive',
    items: [
      { id: 'ceo-advisory', label: 'CEO Advisory', icon: '🎯', alerts: 3 },
      { id: 'meeting-prep', label: 'Meeting Prep', icon: '📅', alerts: 1 },
      { id: 'merger', label: 'Post Merger Updates', icon: '🤝' },
      { id: 'board-packet', label: 'Board Directors', icon: '📋' },
      { id: 'investor-relations', label: 'Investor Relations', icon: '💼', alerts: 1 },
    ],
  },
  {
    title: 'Predictive',
    items: [
      { id: 'early-warning', label: 'Early Warning KPIs', icon: '⚡', alerts: 2 },
      { id: 'investor-behavior', label: 'Investor Behavior', icon: '📈' },
      { id: 'scenario-modeling', label: 'Scenario Modeling', icon: '🔮' },
      { id: 'causal-analysis', label: 'Behavioral-Outcome', icon: '🔗' },
    ],
  },
  {
    title: 'External & Customer',
    items: [
      { id: 'external', label: 'External View', icon: '🌐', alerts: 3 },
      { id: 'customer-health', label: 'Customer Health', icon: '❤️' },
      { id: 'merger-integration', label: 'Post Merger Integration', icon: '🔄' },
    ],
  },
  {
    title: 'Behavioral (OASI/ASI)',
    items: [
      { id: 'org-oasi', label: 'OASI', icon: '🏢' },
      { id: 'aspirational-oasi', label: 'Aspirational OASI', icon: '🎯' },
      { id: 'individual-asi', label: 'Assign CLI Instruments', icon: '👤', alerts: 2 },
      { id: 'sentiment', label: 'Sentiment Analysis', icon: '💭' },
      { id: 'employee-leading', label: 'Employee Leading', icon: '👥', alerts: 1 },
      { id: 'culture-change', label: 'Culture Change', icon: '🌱' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { id: 'mgmt-challenges', label: 'Management Challenges', icon: '⚡' },
      { id: 'hiring', label: 'Hiring & On-Boarding', icon: '📝' },
      { id: 'fill-jobs', label: 'Fill Jobs', icon: '🎯' },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'tenant-config', label: 'Tenant Config', icon: '🔌' },
      { id: 'data-provenance', label: 'Data Provenance', icon: '🔍' },
      { id: 'about-cli', label: 'About CLI', icon: 'ℹ️' },
      { id: 'further-reading', label: 'Further Reading', icon: '📚' },
      { id: 'help', label: 'Help & Guide', icon: '📖' },
    ],
  },
];

// Flattened lookup of every nav item by id.
export const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);
export const DEFAULT_VIEW = 'overview';
