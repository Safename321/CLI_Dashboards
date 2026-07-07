// Sidebar navigation — role-based sections matching v1.24L (CEO, CFO, CSO,
// CHRO, Trainer, HR Hiring, Senior / Team Manager, Utility). Each section has a
// descriptor and is independently collapsible in the Sidebar. View ids match the
// keys in dashboards/index.jsx. Single source for nav + routing.
export const NAV_SECTIONS = [
  {
    title: 'CEO',
    descriptor: 'Top-level synthesis',
    items: [
      { id: 'ceo-advisory', label: 'CEO Advisory', icon: '🎯', alerts: 3 },
      { id: 'swot', label: 'Strategic SWOT', icon: '💠' },
      { id: 'meeting-prep', label: 'Meeting Prep', icon: '📅', alerts: 1 },
      { id: 'merger', label: 'Post Merger Updates', icon: '🤝' },
      { id: 'board-packet', label: 'Board Directors', icon: '📋' },
      { id: 'investor-relations', label: 'Investor Relations', icon: '💼', alerts: 1 },
    ],
  },
  {
    title: 'CFO',
    descriptor: 'Financial command',
    items: [
      { id: 'early-warning', label: 'Early Warning KPIs', icon: '⚡', alerts: 2 },
      { id: 'investor-behavior', label: 'Investor Behavior', icon: '📈' },
      { id: 'scenario-modeling', label: 'Scenario Modeling', icon: '🔮' },
    ],
  },
  {
    title: 'CSO',
    descriptor: 'Outside-in & options',
    items: [
      { id: 'external', label: 'External View', icon: '🌐', alerts: 3 },
      { id: 'customer-health', label: 'Customer Health', icon: '❤️' },
      { id: 'causal-analysis', label: 'Behavioral-Outcome', icon: '🔗' },
      { id: 'merger-integration', label: 'Post Merger Integration', icon: '🔄' },
    ],
  },
  {
    title: 'CHRO - Chief of HR',
    descriptor: 'People & culture',
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
    title: 'Trainer',
    descriptor: 'Learning & development',
    items: [
      { id: 'mgmt-challenges', label: 'Management Challenges', icon: '⚡' },
      { id: 'hiring', label: 'Hiring & On-Boarding', icon: '📝' },
    ],
  },
  {
    title: 'HR Hiring',
    descriptor: 'Talent acquisition',
    items: [
      { id: 'fill-jobs', label: 'Fill Jobs', icon: '🎯' },
    ],
  },
  {
    title: 'Senior / Team Manager',
    descriptor: 'Daily operations',
    items: [
      { id: 'sentiment', label: 'Team Sentiment', icon: '💭' },
      { id: 'employee-leading', label: 'Team Leading Indicators', icon: '👥' },
      { id: 'meeting-prep', label: 'Meeting Prep (1:1s)', icon: '📅' },
    ],
  },
  {
    title: 'Utility',
    descriptor: 'Reference & help',
    items: [
      { id: 'tenant-config', label: 'Tenant Config', icon: '🔌' },
      { id: 'data-provenance', label: 'Data Provenance', icon: '🔍' },
      { id: 'about-cli', label: 'About CLI', icon: 'ℹ️' },
      { id: 'further-reading', label: 'Further Reading', icon: '📚' },
      { id: 'help', label: 'Help & Guide', icon: '📖' },
    ],
  },
  {
    // Role-gated section: items carry a `roles` whitelist; the Sidebar hides any
    // item whose roles don't include the current user's role (useAuth().role).
    // Items without a `roles` field stay visible to everyone (default behavior).
    title: 'Administration',
    descriptor: 'Tenant & onboarding',
    items: [
      { id: 'hris', label: 'HRIS / Onboarding', icon: '🧑‍💼', roles: ['admin', 'super'] },
      { id: 'super', label: 'SuperAdmin Console', icon: '🛡️', roles: ['super'] },
    ],
  },
];

// Views reachable but not shown as their own sidebar button (matches v1.24L):
// overview is the landing/home, reached via the header logo. Kept here so
// labelFor/iconFor resolve its title.
const UNLISTED_VIEWS = [
  { id: 'overview', label: 'Overview', icon: '📖' },
];

// Flattened lookup of every view by id (first occurrence wins — the canonical
// label, e.g. 'sentiment' resolves to 'Sentiment Analysis', not 'Team Sentiment').
export const NAV_ITEMS = [...NAV_SECTIONS.flatMap((s) => s.items), ...UNLISTED_VIEWS];
export const DEFAULT_VIEW = 'ceo-advisory';
