// Connector-domain display metadata for Tenant Config (ported from v1.24L
// TenantConfigDashboard). Kept as data so the dashboard stays presentational.

export const DOMAIN_LABELS = {
  financial: 'Financial Data',
  macro: 'Macro Economic Context',
  markets: 'Stock Markets',
  news: 'News & Media Mentions',
  'social-sentiment': 'Social Media Sentiment',
  'owned-social': 'Owned Social Pages (FB/IG)',
  innovation: 'Innovation & R&D Signals',
  culture: 'Culture & Reviews',
  hris: 'HRIS & Employee Signals',
  'employee-signal': 'Employee Signals (HR systems)',
  'customer-health': 'Customer Health',
  'cli-instrument': 'CLI Instrument Results',
};

export const DOMAIN_DESCRIPTIONS = {
  financial: 'SEC EDGAR (free), Alpha Vantage, internal ERP. Free public data covers most public-company use cases.',
  macro: 'FRED (St. Louis Fed, free), BLS JOLTS (free). Macro indicators that give context to org-level KPIs.',
  markets: 'Alpha Vantage (free 25/day, $50/mo for 75/min). Stock prices, technical indicators.',
  news: 'GDELT 2.0 (free, no key, 15-min refresh + tone scoring), Google News RSS (free), NewsAPI ($449/mo commercial). Powers the news-driven PR crisis alert.',
  'social-sentiment': 'X, LinkedIn, Facebook, Instagram, TikTok. Most useful via a listening platform (Brand24 $149+/mo, Brandwatch enterprise). Mock data is fine for demos.',
  'owned-social': 'Meta Graph API (free with OAuth) for customer-owned FB/IG pages. Different from social-sentiment — this reads pages the customer administers, not public mentions.',
  innovation: 'USPTO PatentsView (free, no key). Patent filings as R&D/innovation signal.',
  culture: 'Glassdoor Partner API, Indeed, Comparably. Per-customer pricing, requires Glassdoor partner agreement.',
  hris: 'Workday, BambooHR, Rippling, Lattice. Customer-side OAuth. Pass-through billing.',
  'employee-signal': 'Survey tools, engagement platforms.',
  'customer-health': 'Salesforce, Gainsight, Zendesk. Customer-side OAuth. Pass-through billing.',
  'cli-instrument': 'Uploaded OASI/ASI/ASSET-P results from the customer.',
};

// Display ordering — shared-public connectors first, per-customer last.
export const DOMAIN_ORDER = [
  'financial', 'macro', 'markets', 'news', 'innovation',
  'social-sentiment', 'owned-social',
  'culture', 'hris', 'employee-signal', 'customer-health',
  'cli-instrument',
];
