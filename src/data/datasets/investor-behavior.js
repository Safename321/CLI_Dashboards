// Investor Behavior dashboard datasets (ported from v1.24L App.jsx §InvestorBehaviorDashboard).
// Static analyst/13F-style content — data file per conventions (no JSX literals).

// Top 10 institutional shareholders — 3-year comparison.
export const SHAREHOLDERS_BY_YEAR = {
  2024: [
    { rank: 1, name: 'Vanguard Group Inc.', shares: 28.4, pctOwned: 9.2, change: '+0.3%' },
    { rank: 2, name: 'BlackRock Inc.', shares: 24.1, pctOwned: 7.8, change: '+0.1%' },
    { rank: 3, name: 'State Street Corp.', shares: 14.8, pctOwned: 4.8, change: '-0.2%' },
    { rank: 4, name: 'Capital Research Global', shares: 12.2, pctOwned: 3.9, change: '+0.5%' },
    { rank: 5, name: 'T. Rowe Price Associates', shares: 9.8, pctOwned: 3.2, change: '+0.4%' },
    { rank: 6, name: 'Fidelity Management', shares: 8.5, pctOwned: 2.7, change: '-0.1%' },
    { rank: 7, name: 'Wellington Management', shares: 7.2, pctOwned: 2.3, change: '+0.2%' },
    { rank: 8, name: 'Geode Capital Management', shares: 5.8, pctOwned: 1.9, change: '+0.1%' },
    { rank: 9, name: 'Northern Trust Corp.', shares: 4.9, pctOwned: 1.6, change: '0.0%' },
    { rank: 10, name: 'Bank of America Corp.', shares: 4.2, pctOwned: 1.4, change: '+0.3%' },
  ],
  2023: [
    { rank: 1, name: 'Vanguard Group Inc.', shares: 27.5, pctOwned: 8.9, change: '+0.4%' },
    { rank: 2, name: 'BlackRock Inc.', shares: 23.8, pctOwned: 7.7, change: '+0.2%' },
    { rank: 3, name: 'State Street Corp.', shares: 15.2, pctOwned: 4.9, change: '+0.1%' },
    { rank: 4, name: 'Capital Research Global', shares: 11.5, pctOwned: 3.7, change: '+0.6%' },
    { rank: 5, name: 'T. Rowe Price Associates', shares: 9.2, pctOwned: 3.0, change: '+0.3%' },
    { rank: 6, name: 'Fidelity Management', shares: 8.8, pctOwned: 2.8, change: '+0.2%' },
    { rank: 7, name: 'Wellington Management', shares: 6.9, pctOwned: 2.2, change: '+0.1%' },
    { rank: 8, name: 'Geode Capital Management', shares: 5.6, pctOwned: 1.8, change: '+0.2%' },
    { rank: 9, name: 'Northern Trust Corp.', shares: 4.9, pctOwned: 1.6, change: '+0.1%' },
    { rank: 10, name: 'Bank of America Corp.', shares: 3.8, pctOwned: 1.2, change: '+0.4%' },
  ],
  2022: [
    { rank: 1, name: 'Vanguard Group Inc.', shares: 26.8, pctOwned: 8.5, change: '+0.5%' },
    { rank: 2, name: 'BlackRock Inc.', shares: 23.2, pctOwned: 7.5, change: '+0.3%' },
    { rank: 3, name: 'State Street Corp.', shares: 14.9, pctOwned: 4.8, change: '+0.2%' },
    { rank: 4, name: 'Capital Research Global', shares: 10.8, pctOwned: 3.5, change: '+0.4%' },
    { rank: 5, name: 'T. Rowe Price Associates', shares: 8.7, pctOwned: 2.8, change: '+0.2%' },
    { rank: 6, name: 'Fidelity Management', shares: 8.4, pctOwned: 2.7, change: '+0.1%' },
    { rank: 7, name: 'Wellington Management', shares: 6.7, pctOwned: 2.1, change: '+0.3%' },
    { rank: 8, name: 'Geode Capital Management', shares: 5.3, pctOwned: 1.7, change: '+0.1%' },
    { rank: 9, name: 'Northern Trust Corp.', shares: 4.7, pctOwned: 1.5, change: '+0.2%' },
    { rank: 10, name: 'Bank of America Corp.', shares: 3.4, pctOwned: 1.1, change: '+0.2%' },
  ],
};

// Board & leadership changes 2024–2025.
export const BOARD_CHANGES = [
  { year: 2025, type: 'departure', name: 'Richard E. Thornburgh', role: 'Chairman', note: 'Retired after 14 years, served as Chairman since Oct 2020' },
  { year: 2025, type: 'departure', name: 'Douglas L. Peterson', role: 'Director/Former CEO', note: 'Retired May 2025, special advisor through Dec 2025' },
  { year: 2025, type: 'departure', name: 'Gay Huey Evans', role: 'Director', note: 'Retired, did not stand for reelection' },
  { year: 2025, type: 'departure', name: 'Robert P. Kelly', role: 'Director', note: 'Retired, did not stand for reelection' },
  { year: 2025, type: 'appointment', name: 'Ian P. Livingston', role: 'Chairman', note: 'Lord Livingston of Parkhead, former BT Group CEO, UK Trade Minister' },
  { year: 2024, type: 'appointment', name: 'Martina L. Cheung', role: 'CEO & Director', note: 'Promoted from President of S&P Global Ratings, effective Nov 1, 2024' },
  { year: 2025, type: 'appointment', name: 'Eric Aboaf', role: 'CFO', note: 'Former CFO of State Street Corp, effective Feb 2025' },
  { year: 2025, type: 'appointment', name: 'Catherine Clay', role: 'CEO of S&P DJI', note: 'Former EVP of Cboe Global Markets, effective Nov 2025' },
];

// New products / initiatives with OASI execution assessment.
export const NEW_PRODUCTS = [
  {
    name: 'S&P 500 3AI Sector Rotator Index', launched: 'Oct 2025', category: 'AI Index',
    description: 'First AI-enhanced index using machine learning for sector allocation',
    oasiRequired: ['Intrinsic', 'Collaborative', 'Entrusting'], oasiGap: 'critical', executionRisk: 'High',
    personnelNeeds: 'Requires AI/ML specialists, quant researchers, and cross-functional collaboration between Kensho and S&P DJI teams',
    hiringNeeded: true,
  },
  {
    name: 'AI-Ready Metadata on Marketplace', launched: 'Jul 2025', category: 'AI Data',
    description: 'Machine-readable metadata for AI-first data consumption',
    oasiRequired: ['Intrinsic', 'Social', 'Entrusting'], oasiGap: 'moderate', executionRisk: 'Medium',
    personnelNeeds: 'Data engineers, ontology specialists, API developers',
    hiringNeeded: true,
  },
  {
    name: 'Document Intelligence 2.0 / ChatIQ', launched: 'Q3 2025', category: 'GenAI',
    description: 'GenAI-powered document analysis and natural language querying',
    oasiRequired: ['Intrinsic', 'Collaborative', 'Vicarious'], oasiGap: 'critical', executionRisk: 'High',
    personnelNeeds: 'NLP engineers, prompt engineers, product managers with AI experience',
    hiringNeeded: true,
  },
  {
    name: 'With Intelligence Acquisition', launched: 'Oct 2025', category: 'M&A Integration',
    description: '$1.8B acquisition of markets data and analytics firm',
    oasiRequired: ['Collaborative', 'Vicarious', 'Entrusting'], oasiGap: 'critical', executionRisk: 'Very High',
    personnelNeeds: 'Integration managers, change management specialists, cultural liaisons',
    hiringNeeded: true,
  },
  {
    name: 'TeraHelix Acquisition', launched: 'Jun 2025', category: 'FinTech',
    description: 'Data modeling for credit analysis and risk assessment',
    oasiRequired: ['Intrinsic', 'Social', 'Contributory'], oasiGap: 'moderate', executionRisk: 'Medium',
    personnelNeeds: 'Credit analysts, risk modeling experts, integration specialists',
    hiringNeeded: false,
  },
  {
    name: 'Mobility Division Spin-off', launched: 'Mid-2026 (planned)', category: 'Corporate Restructure',
    description: 'Tax-free spin-off of global mobility unit into standalone company',
    oasiRequired: ['Entrusting', 'Personal', 'Power'], oasiGap: 'low', executionRisk: 'Medium',
    personnelNeeds: 'Separation management office, HR transition specialists',
    hiringNeeded: false,
  },
];

// Stock price history with milestone events.
export const STOCK_PRICE_HISTORY = [
  { period: 'Feb 2023', price: 352.45, event: 'Post-IHS Markit integration' },
  { period: 'Aug 2023', price: 398.20, event: 'Ratings revenue surge' },
  { period: 'Feb 2024', price: 461.45, event: 'Start of 2024' },
  { period: 'Oct 2024', price: 533.29, event: '52-week high' },
  { period: 'Feb 2025', price: 543.77, event: 'CEO transition complete' },
  { period: 'Aug 2025', price: 579.05, event: 'All-time high' },
  { period: 'Feb 2026', price: 409.54, event: 'Current (SaaS selloff impact)' },
];

// Capital requirements analysis for stock recovery.
export const CAPITAL_ANALYSIS = {
  currentPrice: 409.54,
  targetPrice: 550.0,
  priceGap: 34.3, // percent
  marketCap: 122.37, // $B
  requiredInvestments: [
    { category: 'AI/ML Talent Acquisition', amount: 85, timeline: '12-18 months', roi: '2.5x' },
    { category: 'Integration (With Intelligence)', amount: 120, timeline: '24 months', roi: '1.8x' },
    { category: 'Leadership Development (OASI)', amount: 25, timeline: '18-24 months', roi: '4.2x' },
    { category: 'Product Innovation', amount: 200, timeline: '12-24 months', roi: '2.1x' },
    { category: 'Cultural Transformation', amount: 45, timeline: '24-36 months', roi: '3.8x' },
  ],
  hrEfforts: [
    { initiative: 'Hire 500+ AI/Tech specialists', cost: 125, impact: 'Critical for product roadmap' },
    { initiative: 'OASI-aligned leadership training', cost: 15, impact: 'Addresses say-do gap' },
    { initiative: 'Acquisition integration teams', cost: 30, impact: 'Reduces M&A failure risk' },
    { initiative: 'Mentoring program expansion', cost: 8, impact: 'Raises Vicarious from 4.2→6.5' },
    { initiative: 'Cross-functional rotations', cost: 12, impact: 'Builds Collaborative culture' },
  ],
};

// Cost-benefit analysis of restoring a high stock price.
export const COST_BENEFIT = {
  benefits: [
    { title: 'M&A Currency', detail: 'Higher stock = cheaper acquisitions. $550 price adds ~$43B to market cap for stock-based deals.', value: 'Value: $2-4B in M&A savings over 3 years' },
    { title: 'Employee Retention', detail: 'Stock-based comp more valuable. Reduces flight risk from 8.2% to estimated 5.5%.', value: 'Value: $85M annually in reduced turnover' },
    { title: 'Lower Cost of Capital', detail: 'Better credit terms, lower equity dilution for growth investments.', value: 'Value: $150M over 5 years' },
    { title: 'Talent Acquisition', detail: 'Top AI talent prefers companies with strong stock performance.', value: 'Value: Quality premium hard to quantify' },
  ],
  benefitsTotal: '$2.8-4.5B',
  costs: [
    { title: 'Capital Investment', detail: 'AI talent, product innovation, M&A integration, cultural transformation.', value: 'Cost: $475M over 24 months' },
    { title: 'HR Programs', detail: 'Hiring, training, mentoring programs, OASI transformation initiatives.', value: 'Cost: $190M over 24 months' },
    { title: 'Management Bandwidth', detail: 'New leadership team focused on integration, transformation vs. BAU.', value: 'Cost: Opportunity cost, execution risk' },
    { title: 'Transition Risk', detail: "42% of AI projects fail pre-production (per S&P's own research). Cultural change takes 24-36 months.", value: 'Cost: 15-25% execution discount' },
  ],
  costsTotal: '$665-830M',
  verdict: {
    headline: 'CLI Assessment: Investment IS Worth It',
    roi: 'ROI Ratio: 3.4-6.8x return on cultural and HR investments ($2.8-4.5B benefits vs $665-830M costs)',
    criticalFactor:
      'Critical Success Factor: The investment is worthwhile only if OASI transformation accompanies capital deployment. Without raising Collaborative (5.5→7.0), Vicarious (4.2→6.5), and Entrusting (4.8→7.0), the AI products and M&A integrations will underperform, negating the capital investment.',
    recommendation:
      'Recommendation: Prioritize the $25M Leadership Development (OASI) investment and $45M Cultural Transformation as prerequisites to the larger $430M AI/Product investments. The OASI work has the highest ROI (4.2x) and de-risks all other initiatives.',
  },
};

// Critical recommendation panel content.
export const INVESTOR_BEHAVIOR_RECOMMENDATION = {
  severity: 'critical',
  title: 'Stock Price Recovery Requires Cultural & Personnel Investment',
  evidence: [
    'SPGI down 24.7% YoY ($543.77 → $409.54) despite strong fundamentals',
    'Major leadership turnover: New CEO, CFO, Chairman, S&P DJI CEO in 12 months',
    'AI product execution requires Collaborative and Entrusting styles currently at 5.5 and 4.8',
    'With Intelligence $1.8B acquisition integration risk elevated by low Vicarious (4.2)',
  ],
  strategy:
    'Stock recovery depends on demonstrating AI execution capability and successful M&A integration. Both require elevating Relational OASI styles through targeted hiring, training, and cultural change.',
  tactics: [
    { title: 'AI Talent Strategy', description: 'Hire with OASI-aligned profiles', deliverable: 'Hiring Framework', canCreate: true },
    { title: 'Integration Playbook', description: 'With Intelligence cultural alignment', deliverable: 'Integration Guide', canCreate: true },
    { title: 'Investor Communication', description: 'HR investment narrative', deliverable: 'IR Presentation', canCreate: true },
  ],
};

// Headline + market metric rows (legacy status-dot MetricCards).
export const QUICK_METRICS = [
  { label: 'Current Price', value: '$409.54', benchmark: 'ATH: $579', trend: -29.3, status: 'danger' },
  { label: 'YoY Change', value: '-24.7%', benchmark: '+10%', trend: -35, status: 'danger' },
  { label: 'Inst. Ownership', value: '89.2%', benchmark: '85%', trend: 2, status: 'good' },
  { label: 'Top 10 Turnover', value: '0%', benchmark: '<10%', trend: 0, status: 'good' },
  { label: 'Board Changes', value: '4', benchmark: '0-1', trend: 300, status: 'warning' },
];

export const MARKET_METRICS = [
  { label: '13-F Net Flow', value: '-$42M', benchmark: '+$15M', trend: -180, status: 'danger' },
  { label: 'Short Interest', value: 2.3, unit: '%', benchmark: '1.5%', trend: 28, status: 'warning' },
  { label: 'Analyst Rating', value: 'Strong Buy', trend: 0, status: 'good' },
  { label: 'Price Target', value: '$571.53', benchmark: '+39.5%', trend: 39, status: 'good' },
];
