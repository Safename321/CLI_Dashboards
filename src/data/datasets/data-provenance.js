// Data Provenance audit content (ported from v1.24L DataProvenanceDashboard
// and the embedded "CLI Data Audit" methodology document — re-authored as
// plain data; the legacy base64 PDF is intentionally NOT carried over).

export const AUDIT_CATEGORIES = [
  { category: 'Financial Performance', realPct: 95, canBeReal: 100, difficulty: 'Easy', icon: '💰' },
  { category: 'M&A Activity', realPct: 100, canBeReal: 100, difficulty: 'Easy', icon: '🤝' },
  { category: 'Analyst Estimates', realPct: 100, canBeReal: 100, difficulty: 'Easy', icon: '📊' },
  { category: 'Operational KPIs', realPct: 20, canBeReal: 60, difficulty: 'Moderate', icon: '⚙️' },
  { category: 'Employee Metrics', realPct: 0, canBeReal: 30, difficulty: 'Hard', icon: '👥' },
  { category: 'Customer Metrics', realPct: 0, canBeReal: 40, difficulty: 'Hard', icon: '🎯' },
  { category: 'Merger Integration', realPct: 0, canBeReal: 80, difficulty: 'Moderate', icon: '🔄' },
];

export const DATA_TIERS = [
  { tier: 'Tier 1: Verified Public', confidence: '100%', sources: 'SEC filings, press releases, earnings calls', refresh: 'Quarterly', color: '#10b981' },
  { tier: 'Tier 2: Inferred/Proxy', confidence: '70%', sources: 'Glassdoor, LinkedIn, news sentiment', refresh: 'Monthly', color: '#f59e0b' },
  { tier: 'Tier 3: Benchmarked', confidence: '50%', sources: 'Industry benchmarks, peer comparisons', refresh: 'Annually', color: '#ef4444' },
];

export const CONFIDENCE_ICONS = [
  { icon: '✓', label: 'Verified (SEC)', color: '#10b981' },
  { icon: '⚡', label: 'Calculated', color: '#3b82f6' },
  { icon: '~', label: 'Proxy/Inferred', color: '#f59e0b' },
  { icon: '?', label: 'Estimated', color: '#8b5cf6' },
  { icon: '⚠️', label: 'Demo/Mock', color: '#ef4444' },
];

export const VERIFIED_SECTIONS = [
  ['Financial Performance', 'Revenue, EPS, margins from SEC 10-K'],
  ['M&A Activity', 'All transactions verified via 8-K filings'],
  ['Analyst Estimates', 'Consensus from Bloomberg/Yahoo Finance'],
  ['Executive Team', 'Press releases confirm all appointments'],
  ['2026 Guidance', 'Direct from Q4 2025 earnings call'],
];

export const MOCK_SECTIONS = [
  ['Employee Surveys', 'All merger integration scores fictional'],
  ['Customer Metrics', 'NPS, CSAT, CES are demonstration values'],
  ['Culture Scores', 'Psychological safety, happiness fictional'],
  ['Hiring Pipeline', 'Open positions, time-to-fill are estimates'],
  ['Individual ASIs/OASI', 'Proprietary assessment data'],
];

export const PROXY_STRATEGIES = [
  { metric: 'Employee Sentiment', detail: 'Glassdoor: 3.8/5 rating, 78% CEO approval' },
  { metric: 'Merger Integration', detail: 'Synergies: $850M achieved vs $680M target (125%)' },
  { metric: 'Operational KPIs', detail: 'DSO/DPO calculable from balance sheet' },
];

export const ROADMAP_PHASES = [
  { phase: 'Phase 1 (Week 1-2)', action: 'SEC + Yahoo Finance', result: '→ 45% real', color: '#10b981' },
  { phase: 'Phase 2 (Week 3-4)', action: 'Glassdoor + LinkedIn', result: '→ 60% real/proxy', color: '#f59e0b' },
  { phase: 'Phase 3 (Month 2)', action: 'Bloomberg/FactSet', result: '→ 70% real/proxy', color: '#3b82f6' },
  { phase: 'Phase 4 (Month 3)', action: 'Confidence Framework', result: '→ Full transparency', color: '#a855f7' },
];

// Rotating labels for the report-download button (legacy REPORT_BUTTON_SAYINGS,
// re-worded for an HTML report — print to PDF in the browser).
export const REPORT_BUTTON_SAYINGS = [
  'Download the audit report',
  'Report, please',
  'Materialize the report',
  'One audit report, coming up',
  'Beam me up a report',
  'Make it a report',
  'Report: engage',
  'Houston, we have a report',
  'A report? Make it so.',
  'Great Scott, generate the report!',
];

// ── Methodology report content (equivalent of the legacy embedded PDF:
//    "CLI Data Audit Report — Real vs Mock Data Analysis") ──────────────────

export const REPORT_VERIFIED_DATA = [
  ['Financials 2022-2025', 'Revenue, EPS, Margins, Net Income', 'SEC 10-K/10-Q'],
  ['Division Performance', '5 divisions with revenue & margins', '10-K Segment Data'],
  ['M&A Transactions', '10 acquisitions, 10 divestitures', 'SEC 8-K, Press Releases'],
  ['Analyst Estimates', '28 analysts, price targets, ratings', 'Bloomberg, Yahoo Finance'],
  ['2026 Guidance', 'Revenue $16.3-16.7B, EPS $19.40-19.65', 'Q4 2025 Earnings Call'],
  ['Executive Team', 'CEO Martina Cheung, CFO Eric Aboaf', 'Press Releases'],
  ['IHS Markit Synergies', '$850M achieved vs $680M target', 'Earnings Disclosure'],
];

export const REPORT_MOCK_DATA = [
  ['Employee Surveys', 'Merger success 52%, Effectiveness 6.4', 'Internal proprietary data'],
  ['Customer Experience', 'NPS 72, CSAT 8.4, CES 4.2', 'Rarely disclosed by B2B'],
  ['Employee Happiness', 'Job/Team/Company happiness scores', 'Internal HR metrics'],
  ['Flight Risk Segments', '573 high-risk, 38% flight risk', 'Requires actual survey'],
  ['Culture Metrics', 'Psychological safety, discretionary effort', 'Survey required'],
  ['Hiring Pipeline', 'Open positions, time to fill', 'Internal HR data'],
];

export const REPORT_PROXY_TABLE = [
  ['Employee Happiness', 'Glassdoor Rating (3.8/5)', 'Rating × 2', '70%'],
  ['Flight Risk', 'Glassdoor Recommend % (71%)', '100 - Recommend%', '60%'],
  ['Leadership Trust', 'Glassdoor CEO Approval (78%)', 'Direct proxy', '75%'],
  ['Merger Success', 'Synergy achievement ($850M vs $680M)', '125% of target', '90%'],
  ['Colleague Retention', 'LinkedIn tenure analysis', 'Sampling', '50%'],
  ['Customer Satisfaction', 'G2/Gartner reviews', 'Aggregated scores', '55%'],
  ['Days Receivable', 'Balance sheet calculation', '(AR/Rev) × 365', '100%'],
  ['Days Payable', 'Balance sheet calculation', '(AP/Rev) × 365', '100%'],
];

export const REPORT_SECTION_ANALYSIS = [
  ['Investor Relations', '90%', '98%', 'SEC automation'],
  ['M&A Activity', '100%', '100%', 'Already complete'],
  ['Post Merger Updates', '0%', '70%', 'Glassdoor + LinkedIn + Synergies'],
  ['Sentiment Analysis', '0%', '60%', 'News API + Glassdoor'],
  ['External View', '20%', '80%', 'News sentiment + market data'],
  ['Culture Change', '0%', '40%', 'Glassdoor reviews'],
  ['Hiring & Coaching', '0%', '40%', 'LinkedIn Jobs API'],
  ['Individual ASIs', '0%', '20%', 'Requires internal data'],
  ['360 Reviews', '0%', '10%', 'Requires internal data'],
];

export const REPORT_ROADMAP = [
  ['1. Public Data', 'Week 1-2', 'SEC EDGAR + Yahoo Finance automation', '45% real'],
  ['2. Proxy Integration', 'Week 3-4', 'Glassdoor + LinkedIn + News sentiment', '60% real'],
  ['3. Paid Sources', 'Month 2', 'Bloomberg/FactSet (if budget)', '70% real'],
  ['4. Confidence Labels', 'Month 3', 'Add ✓/~/? indicators to all metrics', 'Full transparency'],
];

export const REPORT_KEY_FINDINGS = [
  'Financial, M&A, and Analyst sections are highly accurate (95-100% real)',
  'Employee/Culture sections are entirely mock (0% real)',
  'Post Merger Updates can reach ~70% real with Glassdoor + synergy data',
  'Full replacement of mock data would require internal company access',
];

export const REPORT_RECOMMENDATION =
  'Focus on the "Investor Relations" and "M&A" sections for maximum credibility. Label other sections with ' +
  'confidence indicators (✓ Verified, ~ Proxy, ? Estimated, ⚠ Demo) to maintain transparency about data quality.';
