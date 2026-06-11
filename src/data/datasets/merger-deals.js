// S&P Global M&A deals 2018-2025 — ported verbatim from v1.24L App.jsx (lines 7162-7471).
// Sources: SEC 8-K filings, SPGI press releases, earnings reports.
export const SPGI_MA_DEALS = [
  {
    id: 1,
    company: 'IHS Markit',
    type: 'Acquisition',
    announced: 'Nov 2020',
    closed: 'Feb 2022',
    value: '$44B',
    valueFull: 44000,
    description: 'Largest all-stock deal of 2020. Data analytics, commodity insights, and financial services integration.',
    rationale: 'Create diversified data powerhouse with 76% recurring revenue. Complementary assets in commodities, transportation, and financial data.',
    synergies: { cost: '$480M', revenue: '$350M', timeline: 'Year 2-5' },
    performance: {
      revenueImpact: '+35%',
      marginImpact: '+200bps',
      integrationStatus: 'Complete',
      synergiesRealized: '95%',
      employeeRetention: '78%'
    },
    keyMetrics: {
      preRevenue: '$4.3B (INFO)',
      postContribution: '$5.2B annually',
      costSynergies: '$456M realized',
      headcount: '~15,000 added'
    },
    rating: 'A',
    ratingColor: 'emerald',
    verdict: 'Highly successful integration. Exceeded synergy targets. Strong strategic fit.'
  },
  {
    id: 2,
    company: 'Kensho Technologies',
    type: 'Acquisition',
    announced: 'Mar 2018',
    closed: 'Apr 2018',
    value: '$550M',
    valueFull: 550,
    description: 'AI and machine learning analytics platform. Largest AI deal in history at announcement.',
    rationale: 'Build in-house AI capabilities for data products. Natural language processing and machine learning expertise.',
    synergies: { cost: 'N/A', revenue: 'Product enhancement', timeline: 'Ongoing' },
    performance: {
      revenueImpact: 'Embedded',
      marginImpact: 'Cost center',
      integrationStatus: 'Independent',
      synergiesRealized: 'N/A',
      employeeRetention: '82%'
    },
    keyMetrics: {
      preRevenue: 'Pre-revenue',
      postContribution: 'AI Hub for SPGI',
      costSynergies: 'Strategic investment',
      headcount: '~200'
    },
    rating: 'A-',
    ratingColor: 'emerald',
    verdict: 'Strategic success. Now core AI engine. Won Best AI Provider 2023.'
  },
  {
    id: 3,
    company: 'Visible Alpha',
    type: 'Acquisition',
    announced: 'Feb 2024',
    closed: 'May 2024',
    value: '>$500M',
    valueFull: 500,
    description: 'Consensus estimates and sell-side analyst models provider. Backed by major investment banks.',
    rationale: 'Enhance Capital IQ Pro with granular analyst data. Deep industry segment consensus data.',
    synergies: { cost: 'Minimal', revenue: 'Product premium', timeline: 'Year 1-2' },
    performance: {
      revenueImpact: 'In progress',
      marginImpact: 'TBD',
      integrationStatus: 'Integrating',
      synergiesRealized: 'Early stage',
      employeeRetention: '95%'
    },
    keyMetrics: {
      preRevenue: 'Not disclosed',
      postContribution: 'CapIQ Pro add-on',
      costSynergies: 'TBD',
      headcount: '~100'
    },
    rating: 'B+',
    ratingColor: 'cyan',
    verdict: 'Early stage. Strong product fit. March 2025 platform integration launched.'
  },
  {
    id: 4,
    company: 'Panjiva',
    type: 'Acquisition',
    announced: 'Feb 2018',
    closed: 'Q1 2018',
    value: 'Undisclosed',
    valueFull: 100,
    description: 'Global supply chain data and analytics platform. Machine learning for trade flow analysis.',
    rationale: 'Enhance Market Intelligence with supply chain visibility covering 95% of global trade flows.',
    synergies: { cost: 'Minimal', revenue: 'Data enhancement', timeline: 'Year 1' },
    performance: {
      revenueImpact: 'Embedded',
      marginImpact: 'Positive',
      integrationStatus: 'Complete',
      synergiesRealized: '100%',
      employeeRetention: '75%'
    },
    keyMetrics: {
      preRevenue: 'Not disclosed',
      postContribution: 'Supply chain module',
      costSynergies: 'Realized',
      headcount: '~50'
    },
    rating: 'B+',
    ratingColor: 'cyan',
    verdict: 'Successful integration into Market Intelligence division.'
  },
  {
    id: 5,
    company: 'Xpansiv (Investment)',
    type: 'Strategic Investment',
    announced: '2021',
    closed: '2021',
    value: '$712M (valuation)',
    valueFull: 712,
    description: 'Environmental commodities marketplace. Carbon offsets and renewable energy certificates.',
    rationale: 'ESG and sustainability data play. Commodity market expansion into carbon trading.',
    synergies: { cost: 'N/A', revenue: 'Strategic', timeline: 'Long-term' },
    performance: {
      revenueImpact: 'Indirect',
      marginImpact: 'N/A',
      integrationStatus: 'Investment',
      synergiesRealized: 'N/A',
      employeeRetention: 'N/A'
    },
    keyMetrics: {
      preRevenue: 'Pre-profit',
      postContribution: 'Carbon market access',
      costSynergies: 'N/A',
      headcount: 'Investment only'
    },
    rating: 'B',
    ratingColor: 'amber',
    verdict: 'Strategic ESG positioning. Market still developing.'
  },
  {
    id: 6,
    company: 'Digital Asset (Investment)',
    type: 'Strategic Investment',
    announced: '2021',
    closed: '2021',
    value: '$452M (valuation)',
    valueFull: 452,
    description: 'Blockchain platform for financial services. Smart contract infrastructure.',
    rationale: 'Blockchain technology partnership. Future-proofing financial infrastructure.',
    synergies: { cost: 'N/A', revenue: 'Strategic', timeline: 'Long-term' },
    performance: {
      revenueImpact: 'Minimal',
      marginImpact: 'N/A',
      integrationStatus: 'Investment',
      synergiesRealized: 'N/A',
      employeeRetention: 'N/A'
    },
    keyMetrics: {
      preRevenue: 'Not disclosed',
      postContribution: 'Tech partnership',
      costSynergies: 'N/A',
      headcount: 'Investment only'
    },
    rating: 'C+',
    ratingColor: 'amber',
    verdict: 'Blockchain market underperformed expectations. Long-term bet.'
  },
  {
    id: 7,
    company: 'Lukka (Investment)',
    type: 'Strategic Investment',
    announced: '2021',
    closed: '2021',
    value: '$209M (valuation)',
    valueFull: 209,
    description: 'Enterprise crypto data and analytics. Digital asset management and accounting.',
    rationale: 'Cryptocurrency data capabilities. Enterprise blockchain analytics.',
    synergies: { cost: 'N/A', revenue: 'Data partnership', timeline: 'Medium-term' },
    performance: {
      revenueImpact: 'Limited',
      marginImpact: 'N/A',
      integrationStatus: 'Investment',
      synergiesRealized: 'Partial',
      employeeRetention: 'N/A'
    },
    keyMetrics: {
      preRevenue: 'Not disclosed',
      postContribution: 'Crypto data feed',
      costSynergies: 'N/A',
      headcount: 'Investment only'
    },
    rating: 'C+',
    ratingColor: 'amber',
    verdict: 'Crypto winter impacted thesis. Data partnership ongoing.'
  },
  {
    id: 8,
    company: 'Measurabl (Investment)',
    type: 'Strategic Investment',
    announced: '2022',
    closed: '2022',
    value: '$180M (valuation)',
    valueFull: 180,
    description: 'ESG and sustainability data for real estate. Building performance tracking.',
    rationale: 'ESG data expansion into real estate sector. Sustainability reporting tools.',
    synergies: { cost: 'N/A', revenue: 'ESG products', timeline: 'Medium-term' },
    performance: {
      revenueImpact: 'Growing',
      marginImpact: 'N/A',
      integrationStatus: 'Partnership',
      synergiesRealized: 'Developing',
      employeeRetention: 'N/A'
    },
    keyMetrics: {
      preRevenue: 'Not disclosed',
      postContribution: 'Real estate ESG',
      costSynergies: 'N/A',
      headcount: 'Investment only'
    },
    rating: 'B',
    ratingColor: 'cyan',
    verdict: 'Strong ESG tailwind. Real estate sustainability growing.'
  },
  {
    id: 9,
    company: 'Quantifind',
    type: 'Strategic Investment',
    announced: '2021',
    closed: '2021',
    value: '$114M (valuation)',
    valueFull: 114,
    description: 'AI platform for financial crime risk management. Anti-money laundering and fraud detection.',
    rationale: 'Enhance compliance and risk capabilities. AI-driven financial crime detection for enterprise clients.',
    synergies: { cost: 'N/A', revenue: 'Risk products', timeline: 'Medium-term' },
    performance: {
      revenueImpact: 'Niche',
      marginImpact: 'N/A',
      integrationStatus: 'Investment',
      synergiesRealized: 'Partial',
      employeeRetention: 'N/A'
    },
    keyMetrics: {
      preRevenue: 'Not disclosed',
      postContribution: 'Risk analytics',
      costSynergies: 'N/A',
      headcount: 'Investment only'
    },
    rating: 'B-',
    ratingColor: 'cyan',
    verdict: 'Targeted fintech play. Growing AML/fraud market.'
  },
  {
    id: 10,
    company: 'Tealbook',
    type: 'Strategic Investment',
    announced: '2021',
    closed: '2021',
    value: '$78M (valuation)',
    valueFull: 78,
    description: 'Supplier data platform for procurement. Data cleansing and enrichment for enterprise supply chains.',
    rationale: 'Supply chain data enhancement. Procurement intelligence and supplier discovery.',
    synergies: { cost: 'N/A', revenue: 'Data enrichment', timeline: 'Medium-term' },
    performance: {
      revenueImpact: 'Growing',
      marginImpact: 'N/A',
      integrationStatus: 'Partnership',
      synergiesRealized: 'Developing',
      employeeRetention: 'N/A'
    },
    keyMetrics: {
      preRevenue: 'Not disclosed',
      postContribution: 'Procurement data',
      costSynergies: 'N/A',
      headcount: 'Investment only'
    },
    rating: 'B',
    ratingColor: 'cyan',
    verdict: 'Solid procurement play. Supply chain visibility expansion.'
  },
  {
    id: 11,
    company: 'Doconomy',
    type: 'Strategic Investment',
    announced: '2021',
    closed: '2021',
    value: '$72.8M (valuation)',
    valueFull: 72.8,
    description: 'Banking tools integrating behavioral science and climate impact data. Carbon footprint tracking.',
    rationale: 'ESG consumer engagement. Climate impact measurement for financial institutions.',
    synergies: { cost: 'N/A', revenue: 'ESG tools', timeline: 'Long-term' },
    performance: {
      revenueImpact: 'Limited',
      marginImpact: 'N/A',
      integrationStatus: 'Investment',
      synergiesRealized: 'Early',
      employeeRetention: 'N/A'
    },
    keyMetrics: {
      preRevenue: 'Not disclosed',
      postContribution: 'Climate banking tools',
      costSynergies: 'N/A',
      headcount: 'Investment only'
    },
    rating: 'C+',
    ratingColor: 'amber',
    verdict: 'ESG consumer thesis still developing. Limited enterprise traction.'
  }
];
