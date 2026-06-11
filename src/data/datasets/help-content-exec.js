// Help & Guide content — part 2: Executive, Predictive, Stakeholders, and
// Operations pages. Same shape as help-content.js (see header there).
// Ported from v1.24L HelpDashboard PAGES (App.jsx 1769–2349).

export const HELP_PAGES_EXEC = {
  'ceo-advisory': {
    title: 'CEO Advisory Dashboard',
    sub: 'Strategic intelligence for executive leadership',
    sections: [
      { heading: 'Purpose', body: 'The CEO Advisory dashboard synthesizes the highest-priority signals from across all dashboards into an executive briefing format. It surfaces the decisions that require CEO-level attention, the risks that are approaching threshold, and the opportunities that are time-sensitive.' },
      { heading: 'Key Features', features: [
        ['Priority Queue', 'Ranked list of the top issues requiring CEO attention, ordered by urgency and impact, drawn from signals across all dashboards.'],
        ['Drill-Down Links', "Each priority item links directly to the source dashboard — clicking 'Culture Risk' opens the Culture Change dashboard filtered to the relevant data."],
        ['Briefing Generator', "Produces a one-page executive briefing on any priority item, formatted for the CEO's preferred communication style based on their ASI profile."],
        ['Alert Threshold Settings', 'Configures which metrics trigger a CEO-level advisory notification, and at what threshold, so the queue stays focused on what matters most.'],
      ] },
      { heading: 'CLI at the CEO Level', body: "The CEO's own ASI profile is the most consequential behavioral data point in the organization. What the CEO naturally rewards — their natural Achieving Style — becomes the de facto OASI over time, as the organization learns to mirror what the leader values. A CEO with high Power and Competitive styles will, over 3–5 years, shape an organization whose OASI reflects those same styles. Understanding the CEO's ASI is therefore a strategic imperative." },
      { heading: 'Advisory Priorities', table: { heads: ['Advisory Area', 'CLI Lens', 'Key Question'], rows: [
        ['Talent Strategy', 'ASI + ASSET-P', 'Are we hiring people whose styles match where we need to go?'],
        ['Culture Health', 'OASI vs. A-OASI', 'Is the culture moving toward our strategic requirements?'],
        ['M&A Readiness', 'OASI (SPGI) vs. target org OASI', 'Can we integrate this culture without destroying value?'],
        ['Leadership Pipeline', 'ASI 360° + ASSET-P', 'Do our successors have the styles the next era requires?'],
        ['Change Readiness', 'OASI vs. change-required OASI', 'Does our culture have the behavioral capacity to execute this strategy?'],
      ] } },
    ],
  },

  'board-packet': {
    title: 'Board Directors Dashboard',
    sub: 'Board-level governance and strategic oversight',
    sections: [
      { heading: 'Purpose', body: 'The Board Directors dashboard provides the governance and strategic oversight materials prepared for the SPGI Board of Directors. It includes the quarterly board pack, strategic performance summaries, risk registers, and the CLI behavioral intelligence relevant to board-level decisions.' },
      { heading: 'Key Features', features: [
        ['Q4 Board Pack Download', 'Downloads the complete board presentation as a formatted document ready for distribution to board members before the meeting.'],
        ['CLI Risk Summary', 'Extracts the behavioral risk metrics most relevant to board governance — culture gap score, succession readiness, M&A integration probability.'],
        ['Financial Performance Section', 'Displays Q4 financial highlights (revenue, EPS, margins) against targets and prior year for board context.'],
        ['Strategic Initiative Status', 'Tracks progress on board-approved strategic initiatives with RAG (Red/Amber/Green) status and CLI behavioral risk flags.'],
      ] },
      { heading: 'CLI at the Board Level', body: 'Boards increasingly recognize that culture is a governance issue — not just an HR issue. The Board Directors dashboard translates CLI OASI data into language boards understand: risk, talent pipeline depth, succession readiness, and M&A integration probability. The OASI gap between current and aspirational culture is framed as strategic execution risk.' },
      { heading: 'Board-Relevant CLI Metrics', table: { heads: ['Board Priority', 'CLI Metric', 'What It Answers'], rows: [
        ['CEO Succession', 'ASI 360° of successors vs. ASSET-P of CEO role future state', 'Are successors behaviorally ready for the demands ahead?'],
        ['Culture Risk', 'OASI vs. A-OASI gap score', 'How far is the culture from where strategy needs it to be?'],
        ['M&A Integration', 'OASI convergence rate', 'Is the acquired culture integrating or resisting?'],
        ['Talent Risk', 'ASI vs. OASI alignment for top 50 leaders', 'How many critical leaders are at risk of cultural mismatch attrition?'],
        ['ESG / Inclusion', 'Diversity of ASI profiles in leadership', 'Are diverse achieving styles represented at the top?'],
      ] } },
    ],
  },

  'investor-relations': {
    title: 'Investor Relations Dashboard',
    sub: 'Financial performance and investor intelligence',
    sections: [
      { heading: 'Purpose', body: "The Investor Relations dashboard provides the financial performance data, analyst estimates, and investor sentiment intelligence that supports SPGI's engagement with its institutional and retail shareholders. It tracks consensus ratings, earnings estimates, and the narrative around SPGI's strategic positioning." },
      { heading: 'Key Features', features: [
        ['Year Selector', 'Switches the financial data view between fiscal years (2020–2026) to support trend analysis and earnings narrative preparation.'],
        ['Analyst Estimates Table', 'Displays consensus estimates from all covering analysts alongside SPGI actuals, with beat/miss indicators for each metric.'],
        ['Consensus Rating Breakdown', 'Shows the distribution of analyst ratings (Strong Buy, Buy, Hold, Sell) with total analyst count and changes since last quarter.'],
        ['Guidance View', "Displays SPGI's official revenue and EPS guidance ranges for the current year alongside analyst consensus for comparison."],
      ] },
      { heading: 'CLI Connection to IR', body: 'Investor confidence in management is ultimately confidence in leadership behavior. Analysts who follow SPGI are implicitly assessing whether the leadership team has the behavioral styles to execute the strategy. A CEO and executive team with high Direct styles (Competitive, Power) tend to generate strong analyst confidence in execution — but may generate concern about culture and retention. CLI data provides the behavioral context behind the numbers.' },
      { heading: 'Investor Narrative and Culture', body: "When SPGI's OASI shifts — as it does post-merger or during major strategic pivots — the investor narrative shifts too. Communicating culture change to investors requires translating OASI movement into business outcomes: faster decision-making, stronger client relationships, lower attrition costs, and improved innovation rates." },
    ],
  },

  'early-warning': {
    title: 'Early Warning KPIs Dashboard',
    sub: 'Leading indicators of organizational stress',
    sections: [
      { heading: 'Purpose', body: 'The Early Warning KPIs dashboard monitors leading behavioral and operational indicators that signal organizational stress before it manifests in financial performance. It catches problems when they are still correctable — not after they have become crises.' },
      { heading: 'Key Features', features: [
        ['Threshold Configurator', 'Sets the trigger level for each early warning metric — when a metric crosses its threshold, it escalates to the CEO Advisory dashboard automatically.'],
        ['Leading vs. Lagging Toggle', 'Separates metrics into leading indicators (behavioral, sentiment-based, predictive) and lagging indicators (financial, operational, historical).'],
        ['Time-to-Impact Estimate', 'For each active warning, estimates how many months until the behavioral signal manifests in financial performance if left unaddressed.'],
        ['CLI Diagnostic Link', 'Links each warning directly to the relevant CLI instrument — a talent attrition warning links to ASI vs. OASI alignment data for the at-risk population.'],
      ] },
      { heading: 'Why Behavioral Early Warning?', body: 'Financial metrics are lagging indicators — by the time revenue or margin deteriorate, the organizational problems that caused them are months or years old. Behavioral data — OASI shifts, ASI-OASI misalignment, sentiment scores, attrition rates by achieving style — are leading indicators. This dashboard prioritizes the signals that predict financial outcomes 6–18 months before they appear on the P&L.' },
      { heading: 'Key Early Warning Signals', table: { heads: ['Signal', 'Threshold', 'CLI Interpretation'], rows: [
        ['Top talent attrition rate', '> 8% annually', 'OASI reward system not matching high-performer ASI profiles'],
        ['OASI-ASI misalignment score', '> 2.5 gap average', 'Culture is systematically under-rewarding key behavioral styles'],
        ['Sentiment score decline', '> 10% drop in 90 days', 'Cultural friction event — identify triggering OASI change'],
        ['New hire 90-day attrition', '> 15%', 'ASSET-P not being used or fit scores being ignored at hire'],
        ['Cross-team project failure rate', '> 30%', 'OASI gap between departments too large for collaboration'],
      ] } },
    ],
  },

  'employee-leading': {
    title: 'Employee Leading Indicators Dashboard',
    sub: 'Workforce behavioral health and engagement',
    sections: [
      { heading: 'Purpose', body: "The Employee Leading Indicators dashboard tracks the behavioral health of SPGI's workforce — the leading indicators of engagement, productivity, and retention that precede changes in financial performance. It monitors achieving style alignment, manager effectiveness, and team cohesion at scale." },
      { heading: 'Key Features', features: [
        ['Department Drill-Down', "Filters all workforce behavioral metrics to a specific department or business unit, enabling managers to see their team's data in isolation."],
        ['Style Diversity Index', 'Displays the spread of Achieving Styles across any team or department — higher diversity predicts greater innovation capacity.'],
        ['Flight Risk Filter', 'Highlights individuals whose ASI-OASI misalignment score exceeds the warning threshold, ranking them by estimated flight risk.'],
        ['Manager Effectiveness Score', "Rates each manager's behavioral adaptability — their ability to flex their style to meet the needs of their diverse team members."],
      ] },
      { heading: 'CLI Workforce Analytics', body: "When aggregated across a large workforce, ASI and OASI data reveal patterns that individual assessments cannot: which departments have the most ASI-OASI misalignment, which managers' teams show the highest style diversity (a positive signal for innovation), and which organizational units have the highest concentration of at-risk individuals whose styles are not being rewarded." },
      { heading: 'Key Employee Behavioral Metrics', table: { heads: ['Metric', 'CLI Source', 'What It Predicts'], rows: [
        ['ASI-OASI Alignment Score', 'ASI vs. OASI', 'Retention probability — lower alignment = higher flight risk'],
        ['Style Diversity Index', 'ASSET-T', 'Team innovation capacity — higher diversity = more creative solutions'],
        ['Manager Style Flex Score', 'A-ASI', "Manager's ability to adapt style to team needs"],
        ['Discretionary Effort Score', 'Intrinsic + Contributory ASI', 'Predicts above-and-beyond performance'],
        ['Collaboration Effectiveness', 'Collaborative + Entrusting ASI', 'Predicts cross-functional project success'],
      ] } },
    ],
  },

  'customer-health': {
    title: 'Customer Health Dashboard',
    sub: 'Client relationship quality and retention risk',
    sections: [
      { heading: 'Purpose', body: "The Customer Health dashboard tracks the behavioral health of SPGI's client relationships — satisfaction scores, retention risk indicators, expansion signals, and the relationship quality metrics that predict whether a client will renew, expand, or churn." },
      { heading: 'Key Features', features: [
        ['Account Filter', 'Filters the customer health view to a specific SPGI client account, displaying relationship depth scores and renewal risk indicators for that account.'],
        ['Renewal Risk Ranking', 'Ranks all accounts by renewal risk score, surfacing those most likely to churn so account teams can prioritize intervention.'],
        ['CLI Style Match Score', "Shows the behavioral style compatibility score between the SPGI account team's ASI profiles and the client stakeholder's known achieving style preferences."],
        ['NPS Trend', 'Displays Net Promoter Score over time for each account segment, with annotations marking relationship milestones and CLI engagement touchpoints.'],
      ] },
      { heading: 'CLI Connection to Customer Health', body: "Client relationships are human relationships. The Achieving Styles of the SPGI account team and the client's key stakeholders determine whether the relationship thrives or stagnates. A highly Competitive SPGI account manager paired with an Entrusting client stakeholder will create friction — the client will feel pressured rather than supported. CLI data on the account team's ASI profiles is a predictive tool for client relationship quality." },
      { heading: 'Customer Health Dimensions', table: { heads: ['Dimension', 'CLI Connection', 'Risk Signal'], rows: [
        ['Relationship depth', 'Personal + Social ASI of account team', 'Low Instrumental scores = transactional relationships at risk'],
        ['Problem resolution speed', 'Power + Entrusting ASI', 'Low scores = slow escalation, client frustration'],
        ['Innovation partnership', 'Collaborative + Intrinsic ASI', 'Low scores = client not co-creating, commoditization risk'],
        ['Executive sponsor engagement', 'Vicarious + Personal ASI', 'Low scores = sponsor not invested in client success'],
      ] } },
    ],
  },

  'investor-behavior': {
    title: 'Investor Behavior Dashboard',
    sub: 'Institutional shareholder analytics',
    sections: [
      { heading: 'Purpose', body: "The Investor Behavior dashboard tracks the behavior of SPGI's institutional shareholder base — ownership changes, voting patterns, activist investor signals, and the sentiment of the top 25 institutional holders. It provides the intelligence needed to proactively manage investor relationships." },
      { heading: 'Key Features', features: [
        ['Shareholder Table', 'Displays the top 25 institutional shareholders with current ownership percentage, 3-year ownership trend, and estimated achieving style orientation.'],
        ['Ownership Change Alerts', 'Flags any shareholder who has changed their position by more than 0.5% in the last quarter, with direction (building vs. reducing).'],
        ['Activist Radar', 'Monitors known activist investor activity in SPGI stock and related positions, with CLI-based assessment of likely engagement strategy.'],
        ['Voting Pattern Tracker', 'Tracks how key institutional holders have voted on SPGI proxy proposals, revealing alignment with management on governance issues.'],
      ] },
      { heading: 'CLI Connection', body: 'Investor behavior is itself driven by achieving styles. Activist investors typically have high Competitive and Power ASI profiles — they achieve through competitive pressure and organizational control. Understanding the achieving style of key investors helps management teams anticipate their concerns, frame their narrative appropriately, and engage in ways that resonate with how those investors achieve their goals.' },
      { heading: 'Investor Relationship Strategy by Style', table: { heads: ['Investor Achieving Style', 'What They Value', 'Engagement Strategy'], rows: [
        ['High Competitive', 'Returns vs. peers, market share, rankings', 'Lead with competitive positioning and relative performance'],
        ['High Power', 'Board control, capital allocation, governance', 'Focus on governance structure and capital discipline'],
        ['High Intrinsic', 'Management excellence, operational quality', 'Emphasize operational KPIs and management team depth'],
        ['High Vicarious', 'Management team development, succession', 'Highlight leadership pipeline and talent strategy'],
      ] } },
    ],
  },

  'data-provenance': {
    title: 'Data Provenance Dashboard',
    sub: 'Data sources, quality, and reliability tracking',
    sections: [
      { heading: 'Purpose', body: "The Data Provenance dashboard documents the sources, quality levels, and reliability of all data used across the CLI Dashboard suite. It provides transparency about which data is real (sourced from SPGI's actual systems), which is estimated (modeled from industry benchmarks), and which is illustrative (placeholder data for demonstration)." },
      { heading: 'Key Features', features: [
        ['Data Quality Filter', 'Filters the data inventory by quality level (Real, Estimated, Illustrative) so users know which numbers to cite with confidence and which to treat as directional.'],
        ['Source Documentation', 'Expands any data category to show its exact source, collection date, and methodology — critical for board presentations and investor communications.'],
        ['CLI Data Replacement Guide', 'Steps through which illustrative CLI data fields need to be replaced with actual instrument results, and provides the CLI contact to initiate an engagement.'],
        ['Last Updated Timestamps', "Shows when each data source was last refreshed, with alerts for any source that hasn't been updated within its expected refresh window."],
      ] },
      { heading: 'Data Categories', table: { heads: ['Category', 'Data Quality', 'Source'], rows: [
        ['Financial Performance', 'Real — high confidence', 'SPGI public filings, earnings releases'],
        ['M&A Activity', 'Real — high confidence', 'Public announcements, regulatory filings'],
        ['Analyst Estimates', 'Real — high confidence', 'Bloomberg, FactSet consensus'],
        ['CLI Behavioral Data', 'Illustrative — demo only', 'Generated for demonstration — replace with actual CLI instrument results'],
        ['Employee Sentiment', 'Illustrative — demo only', "Replace with actual survey data from SPGI's HR systems"],
        ['Operational KPIs', 'Partially estimated', 'Modeled from public disclosures — supplement with internal data'],
      ] } },
      { heading: 'Replacing Demo Data with Real Data', body: 'All CLI behavioral data shown in the dashboard (OASI scores, ASI profiles, ASSET-P values) is illustrative — generated to demonstrate the framework. To activate the dashboard with real data, administer the appropriate CLI instruments through the Connective Leadership Institute and replace the demo scores with actual instrument results. Contact CLI at connectiveleadership.com to begin an engagement.' },
    ],
  },

  'meeting-prep': {
    title: 'Meeting Prep Dashboard',
    sub: 'AI-powered briefing generation',
    sections: [
      { heading: 'Purpose', body: 'The Meeting Prep dashboard generates AI-powered briefing documents for executive meetings with SPGI stakeholders — board members, investors, clients, and internal leadership. It combines the financial and operational context from the dashboard suite with CLI behavioral intelligence about the meeting participants.' },
      { heading: 'Key Features', features: [
        ['Participant Selector', 'Adds each meeting participant by name and role, with an option to link their ASI profile if available, enabling style-tailored briefing generation.'],
        ['Meeting Type Selector', 'Selects the meeting context (Board, Investor, Client, Internal Leadership) which determines the briefing template and tone used by the AI.'],
        ['Generate Briefing', 'Triggers the AI to produce a complete pre-meeting briefing — context summary, key messages, style-tailored talking points, anticipated objections, and recommended close.'],
        ['Style Adaptation Panel', 'When ASI data is available for participants, displays style-specific communication tips — what to lead with, what to emphasize, and what to avoid for each person in the room.'],
        ['Export to PDF', 'Downloads the generated briefing as a PDF formatted for printing or sharing with the executive ahead of the meeting.'],
      ] },
      { heading: 'CLI-Powered Meeting Intelligence', body: 'When ASI data is available for meeting participants, the Meeting Prep dashboard can tailor the briefing to the achieving style of the key decision-maker. A meeting with a high Power-style board member requires a different opening — lead with resource implications and organizational control points. A meeting with a high Collaborative executive requires emphasizing shared ownership and team input.' },
      { heading: 'Tailoring by Achieving Style', table: { heads: ['Participant Style', 'Open With', 'Emphasize', 'Avoid'], rows: [
        ['Intrinsic', 'The quality problem we need to solve', 'Excellence standards, data depth', 'Group decisions without their input'],
        ['Competitive', 'Where we rank vs. competitors', 'Market position, win/loss data', 'Collaborative processes they see as slow'],
        ['Power', 'The resource and control implications', 'Org structure, delegation, authority', 'Open-ended discussions without clear decisions'],
        ['Personal', 'A story or relationship context', 'One-on-one trust, personal stakes', 'Data-heavy presentations without human context'],
        ['Social', 'Who else is involved and aligned', 'Coalition, stakeholder map', 'Going it alone — they need buy-in visible'],
        ['Entrusting', 'Who you are empowering to lead', 'Team autonomy, distributed ownership', 'Micromanagement or over-specifying'],
        ['Collaborative', 'The shared problem and collective stake', 'Joint ownership, co-creation', 'Top-down decisions without input'],
        ['Contributory', 'How this serves others / the mission', 'Purpose, community benefit, giving back', 'Pure financial framing with no human dimension'],
        ['Vicarious', 'The talent and team behind this', 'People development, mentoring, legacy', 'Strategy without a people/succession story'],
      ] } },
    ],
  },
};
