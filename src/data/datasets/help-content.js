// Help & Guide content — part 1: nav structure + Overview/Management pages.
// Ported from v1.24L HelpDashboard PAGES (App.jsx 1769–2349). Part 2 (Executive,
// Predictive, Stakeholders, Operations) lives in help-content-exec.js.
//
// Page shape: { title, sub, sections: [{ heading, body?, features?, table? }] }
//   body     — paragraph string or array of paragraph strings
//   features — [[name, description], ...] rendered as a highlighted list
//   table    — { heads: [...], rows: [[...], ...] }

export const HELP_NAV = [
  { title: '📖 Overview', items: [{ id: 'overview', label: 'Overview', icon: '📖' }] },
  { title: '⚙️ Management', items: [
    { id: 'oasi', label: 'OASI', icon: '🏢' },
    { id: 'aspirational-oasi', label: 'Aspirational OASI', icon: '🎯' },
    { id: 'individual-asi', label: 'Assign CLI Instruments', icon: '👤' },
    { id: 'fill-jobs', label: 'Fill Jobs', icon: '🎯' },
    { id: 'mgmt-challenges', label: 'Management Challenges', icon: '⚡' },
    { id: 'hiring', label: 'Hiring & On-Boarding', icon: '📝' },
    { id: 'merger-integration', label: 'Post Merger Integration', icon: '🔄' },
    { id: 'merger', label: 'Post Merger Updates', icon: '🤝' },
    { id: 'culture-change', label: 'Culture Change', icon: '🌱' },
    { id: 'external', label: 'External View', icon: '🌐' },
    { id: 'sentiment', label: 'Sentiment Analysis', icon: '💭' },
  ] },
  { title: '👔 Executive', items: [
    { id: 'ceo-advisory', label: 'CEO Advisory', icon: '🎯' },
    { id: 'board-packet', label: 'Board Directors', icon: '📋' },
    { id: 'investor-relations', label: 'Investor Relations', icon: '💼' },
  ] },
  { title: '🔮 Predictive', items: [{ id: 'early-warning', label: 'Early Warning KPIs', icon: '⚡' }] },
  { title: '👥 Stakeholders', items: [
    { id: 'employee-leading', label: 'Employee Leading', icon: '👥' },
    { id: 'customer-health', label: 'Customer Health', icon: '❤️' },
    { id: 'investor-behavior', label: 'Investor Behavior', icon: '📈' },
  ] },
  { title: '⚙️ Operations', items: [
    { id: 'data-provenance', label: 'Data Provenance', icon: '🔍' },
    { id: 'meeting-prep', label: 'Meeting Prep', icon: '📅' },
  ] },
  { title: '📚 Reference', items: [{ id: 'further-reading', label: 'Further Reading', icon: '📚' }] },
];

export const HELP_PAGES_CORE = {
  overview: {
    title: 'CLI Dashboards — Overview & Guide',
    sub: 'Connective Leadership Institute · S&P Global (SPGI) · v1.24L',
    sections: [
      { heading: 'About This Help System', body: "This guide provides help documentation for every dashboard in the CLI Dashboard suite. Select a dashboard from the left column to view its purpose, key features, CLI instruments used, and how to interpret its outputs. All dashboards are grounded in the Connective Leadership Institute's Achieving Styles™ framework." },
      { heading: 'The Achieving Styles™ Framework',
        body: 'The Connective Leadership Model identifies nine behavioral strategies — called Achieving Styles — that leaders use to accomplish their goals. Unlike personality assessments, Achieving Styles measure how people behave externally and situationally. No style is better than any other; effective leaders flex across all nine depending on context.',
        table: { heads: ['Domain', 'Style', 'Core Orientation'], rows: [
          ['DIRECT', 'Intrinsic', 'Accomplishes tasks through personal mastery and internal standards of excellence'],
          ['DIRECT', 'Competitive', 'Structures tasks as competitions, outperforms others, thrives on winning'],
          ['DIRECT', 'Power', 'Mobilizes resources, organizes people, delegates toward goals'],
          ['INSTRUMENTAL', 'Personal', 'Achieves through one-on-one connection, storytelling, personal influence'],
          ['INSTRUMENTAL', 'Social', 'Builds networks, relationships, and coalitions to achieve'],
          ['INSTRUMENTAL', 'Entrusting', 'Achieves by delegating trust, empowering others to lead'],
          ['RELATIONAL', 'Collaborative', 'Co-creates through shared ownership and team synergy'],
          ['RELATIONAL', 'Contributory', 'Achieves by serving others, servant leadership, giving credit'],
          ['RELATIONAL', 'Vicarious', 'Gets satisfaction from mentoring and watching others succeed'],
        ] } },
      { heading: 'CLI Instruments',
        body: 'The CLI suite includes seven instruments, each measuring Achieving Styles at a different level of analysis.',
        table: { heads: ['Instrument', 'Measures', 'Best Used For'], rows: [
          ['ASI', 'Individual achieving style (natural)', 'Individual development, conflict, hiring'],
          ['A-ASI', 'Individual adapted/stress style', 'Coaching, blind spots, pressure behavior'],
          ['OASI', 'Organizational rewarded behaviors', 'Culture, M&A integration, alignment'],
          ['A-OASI', 'Aspirational organizational style', 'Culture change, strategy transformation'],
          ['ASI 360°', 'Multi-rater view of individual', 'Leadership development, feedback'],
          ['ASSET-T', 'Team collective profile', 'Team composition, post-merger integration'],
          ['ASSET-P', 'Role behavioral requirements', 'Hiring, job fit, succession planning'],
        ] } },
      { heading: 'CLI vs. Competitors',
        body: 'CLI is the only framework that measures behavior at Aspirational, Organizational, Situational, and 360° levels — measuring HOW you achieve (external behavior, changeable) rather than personality (internal, fixed).',
        table: { heads: ['Framework', 'What It Measures', 'Levels', 'Changeable?'], rows: [
          ['CLI Achieving Styles', 'External behavioral strategies', 'Individual, Org, Aspirational, 360°', 'Yes — situational'],
          ['DiSC', '4 behavioral dimensions', 'Individual only', 'Somewhat'],
          ['MBTI', '16 cognitive personality types', 'Individual only', 'No — trait-based'],
          ['StrengthsFinder', '34 talent themes', 'Individual only', 'No — strengths-based'],
          ['Birkman', 'Personality + 5 orientations', 'Individual only', 'No — personality-based'],
        ] } },
    ],
  },

  oasi: {
    title: 'Organizational OASI Dashboard',
    sub: 'What does your organization actually reward?',
    sections: [
      { heading: 'Purpose', body: 'The OASI (Organizational Achieving Styles Inventory) Dashboard reveals the behavioral styles an organization implicitly rewards — what actually gets people promoted, recognized, and succeeded. This is often different from the culture the organization claims to have.' },
      { heading: 'Key Features', features: [
        ['OASI Radar Chart', "Displays the 9 Achieving Styles as a color-coded radar — yellow for Direct, red for Instrumental, blue for Relational — so you can instantly see the organization's dominant behavioral domain."],
        ['Style Score Table', "Lists each style's numeric score (1–7 scale) alongside set means for Direct, Instrumental, and Relational domains, giving a precise complement to the visual radar."],
        ['Explain the OASI ↗', 'Opens the Connective Leadership Institute website for deeper reading on the OASI instrument and its scoring methodology.'],
      ] },
      { heading: 'What the Graph Shows', body: 'The radar chart displays scores across all 9 Achieving Styles as experienced at the organizational level. High scores in Direct styles (Intrinsic, Competitive, Power) indicate a culture that rewards individual high performance and control. High Relational scores (Collaborative, Contributory, Vicarious) indicate a culture that rewards team contribution and mentorship. Instrumental scores (Personal, Social, Entrusting) reflect how much relationship-building and trust-delegation are rewarded.' },
      { heading: 'How to Read It', body: "Look for the dominant domain — the set of styles with the highest cluster of scores. This is your culture's center of gravity. Compare it against where your strategy requires people to behave. A misalignment between the OASI profile and strategic requirements is one of the most common causes of strategy execution failure." },
      { heading: 'Key Interpretations', table: { heads: ['OASI Pattern', 'Culture Signal', 'Risk'], rows: [
        ['High Direct (INT/COM/PWR)', 'Competitive, high-performance, hero culture', 'Burnout, poor collaboration, talent attrition'],
        ['High Relational (COL/CTR/VIC)', 'Team-oriented, servant leadership culture', 'Slow decisions, low accountability'],
        ['High Instrumental (PRS/SOC/ENT)', 'Relationship-driven, networked culture', 'Politics, favoritism, unclear accountability'],
        ['Balanced across all 9', 'Connective leadership culture', 'Ideal — but rare and requires active investment'],
      ] } },
      { heading: 'Linked Instruments', body: "Use OASI in combination with A-OASI (what the org rewards under pressure) to reveal the gap between stated and actual culture. Compare with ASI data to identify individuals who are misaligned with the org's rewarded styles — these are your retention risks." },
    ],
  },

  'aspirational-oasi': {
    title: 'Aspirational OASI Dashboard',
    sub: 'Where does your culture need to go?',
    sections: [
      { heading: 'Purpose', body: 'The Aspirational OASI dashboard overlays the current OASI profile (what the organization rewards today) against the ideal OASI profile (what leadership wants the organization to reward in the future). The gap between the two is the culture change agenda.' },
      { heading: 'Key Features', features: [
        ['Dual Radar Overlay', 'Overlays the current OASI profile (solid line) against the Aspirational OASI target (dashed line) so the gap is immediately visible across all 9 styles.'],
        ['Gap Indicators', 'Highlights which styles show the largest delta between current and aspirational, prioritizing where culture change investment is most needed.'],
        ['Style Comparison Table', 'Shows current score, ideal score, and the gap for each of the 9 styles, enabling precise tracking of culture change progress over time.'],
      ] },
      { heading: 'Reading the Two Profiles', body: 'The solid line represents the current OASI — the behavioral reality on the ground. The dashed line represents the Aspirational OASI — the target culture. Styles where the gap is largest represent the areas where the most culture change investment is required.' },
      { heading: 'What the Gaps Mean', table: { heads: ['Gap Direction', 'Meaning', 'Action'], rows: [
        ['Current > Ideal on Direct styles', 'Too competitive/individualistic vs. target', 'Introduce collaborative incentives, shared goals'],
        ['Ideal > Current on Relational styles', 'Needs more teamwork/mentoring culture', 'Redesign recognition and promotion criteria'],
        ['Current > Ideal on Instrumental', 'Too politically driven vs. target', 'Clarify meritocracy, reduce favoritism'],
      ] } },
      { heading: 'Culture Change Roadmap', body: 'The Aspirational OASI is not a personality change — it is a behavioral change in what the organization chooses to reward. Changes to promotion criteria, recognition programs, manager training, and performance metrics can systematically shift the OASI profile toward the aspirational target over 12–24 months.' },
      { heading: 'Connection to Strategy', body: 'Every strategic shift requires a corresponding culture shift. A company moving from organic growth to M&A integration needs to shift from high Direct (individual execution) toward high Relational (integration, collaboration, trust). The Aspirational OASI makes this requirement explicit and measurable.' },
    ],
  },

  'individual-asi': {
    title: 'Assign CLI Instruments Dashboard',
    sub: 'Match the right instrument to the right person',
    sections: [
      { heading: 'Purpose', body: 'This dashboard is the starting point for any CLI engagement with SPGI personnel. It allows practitioners to assign the appropriate CLI instrument to each individual or team based on the leadership challenge at hand. The correct instrument selection determines the quality of the insight generated.' },
      { heading: 'Key Features', features: [
        ['Instrument Selector', 'Dropdown for each person to assign the correct CLI instrument (ASI, A-ASI, OASI, ASI 360°, ASSET-T, ASSET-P) based on the challenge at hand.'],
        ['Commit Button', 'Locks in the instrument assignments and sends them to the relevant dashboard for overlay and analysis.'],
        ['Person / Team Tabs', 'Switches between individual-level instruments (ASI, A-ASI) and group-level instruments (ASSET-T, OASI) to match the unit of analysis.'],
      ] },
      { heading: 'Instrument Selection Guide', table: { heads: ['Situation', 'Recommended Instrument', 'Why'], rows: [
        ['Developing an individual leader', 'ASI + A-ASI + ASI 360°', 'Full behavioral profile with stress response and external perception'],
        ['Hiring for a specific role', 'ASSET-P + ASI', 'Define role requirements then match candidate profile'],
        ['Post-merger team integration', 'OASI (both orgs) + ASSET-T', 'Compare cultural reward systems and team profile'],
        ['Culture change initiative', 'OASI + A-OASI', 'Map current vs. aspirational behavioral culture'],
        ['Interpersonal conflict resolution', 'ASI (both parties)', 'Reveal behavioral style differences driving friction'],
        ['Succession planning', 'ASI + ASSET-P (target role)', 'Assess candidate against role behavioral requirements'],
        ['Team effectiveness', 'ASSET-T + OASI', 'Compare team profile against what org rewards'],
      ] } },
      { heading: 'The ASI vs. A-ASI Distinction', body: "The ASI captures an individual's natural achieving style — how they behave when conditions allow choice. The A-ASI captures the adapted style — how they behave under pressure, stress, or constraint. The gap between ASI and A-ASI reveals a leader's blind spots: the styles they over-rely on when stressed, often to the detriment of their effectiveness." },
      { heading: 'Administering Instruments', body: 'All CLI instruments are self-report questionnaires typically completed online in 15–25 minutes. Results should be debriefed by a CLI-certified practitioner. Scores should never be shared without a proper debrief session — raw scores without context can be misinterpreted and can damage trust.' },
    ],
  },

  'fill-jobs': {
    title: 'Fill Jobs Dashboard',
    sub: 'Behavioral fit analysis for open roles',
    sections: [
      { heading: 'Purpose', body: "The Fill Jobs dashboard uses the ASSET-P instrument to define the behavioral style profile a role actually requires, then compares candidates' ASI profiles against that target using the Peace Pad radar overlay. The result is an objective, behavior-based fit analysis that predicts time-to-productivity and retention risk." },
      { heading: 'Key Features', features: [
        ['⚡ Add Job', 'Opens the job description input panel where you paste or type the role description — the system interprets it and generates an ASSET-P target profile automatically.'],
        ['⚡ Interpret & Add', 'Sends the job description to the CLI AI interpreter, which reads the role requirements and assigns ASSET-P scores across all 9 Achieving Styles.'],
        ['▲ Fill This Position', 'Opens the Candidate Pool popup for the selected job, displaying all candidates ranked by fit score against the ASSET-P profile.'],
        ['+ Add Candidate', "Adds a new candidate to the pool manually, entering their ASI scores for comparison against the role's ASSET-P target."],
        ['Overlay Checkboxes', "Each candidate row has a checkbox to overlay that individual's ASI profile onto the Peace Pad radar, enabling visual side-by-side comparison with the blue band."],
        ['Fit Score & r²', 'Two numeric scores per candidate: Fit Score rates overall behavioral alignment (higher = better fit); r² measures profile shape similarity regardless of score level.'],
      ] },
      { heading: 'The Blue Band', body: "The blue shaded band on the Peace Pad represents the acceptable range of behavioral fit for each of the 9 Achieving Styles. Scores inside the band indicate the candidate's natural style aligns with what the role requires. Scores outside the band — either too high or too low — signal a potential friction point that should be explored in the interview process." },
      { heading: 'Band Tolerance by Job Type', table: { heads: ['Job Type', 'Direct (INT/COM/PWR)', 'Instrumental (PRS/SOC/ENT)', 'Relational (COL/CTR/VIC)'], rows: [
        ['Sales', 'Loose (1.8) — less critical', 'Tight (0.6) — mission critical', 'Tight (0.6) — relationships matter'],
        ['Technical', 'Tight (0.6) — must have', 'Medium (1.2)', 'Loose (1.8) — less critical'],
        ['Leadership', 'Tight (0.6) — must have', 'Tight (0.6) — must have', 'Medium (1.2)'],
      ] } },
      { heading: 'Fit Score Interpretation', table: { heads: ['Fit Level', 'Score Range', 'Interpretation'], rows: [
        ['Best Fit', 'Mean ≥ 7.0', 'Natural style closely matches role requirements across all 9 dimensions'],
        ['Good Fit', 'Mean 5.5–6.9', 'Strong alignment with minor coaching needed on 1–2 styles'],
        ['Fair Fit', 'Mean 4.0–5.4', 'Moderate fit — candidate can succeed with active development support'],
        ['Weak Fit', 'Mean < 4.0', 'Significant style mismatch — high attrition and performance risk'],
      ] } },
      { heading: 'r² Score', body: "The r² (Pearson correlation squared) measures how closely the shape of the candidate's ASI profile matches the shape of the ASSET-P profile. A high r² (≥0.85) means the candidate's behavioral priorities mirror the role's requirements — even if individual scores differ. A low r² means the candidate and role have fundamentally different behavioral orientations." },
      { heading: 'Important Rules', body: 'All scores are on a 1–7 scale (average of 5 questions per style). Valid score decimals are .0, .2, .4, .6, .8 only. No score can exceed 7.0. The band outer edge is also capped at 7.0. A score of 7.0 on any style means the respondent answered 7 on all 5 questions for that style — which should be treated as a flag for follow-up in debrief.' },
    ],
  },

  'mgmt-challenges': {
    title: 'Management Challenges Dashboard',
    sub: 'Diagnose and resolve behavioral root causes',
    sections: [
      { heading: 'Purpose', body: "The Management Challenges dashboard applies CLI instruments to the 9 most common organizational management problems. For each challenge, it identifies which instruments to use, overlays the involved parties' behavioral profiles on the Peace Pad, surfaces the style gaps driving the problem, and generates a structured resolution report." },
      { heading: 'Key Features', features: [
        ['Problem Type Selector', 'Left-side list of the 9 management challenge types — clicking one loads the relevant instrument recommendations, FAQ content, and report template for that challenge.'],
        ['👥 Involved Parties', 'Opens the party management panel where you name each person or team involved in the challenge and assign their CLI instrument.'],
        ['▲ Overlay on Peace Pad', "Plots the selected party's instrument scores onto the Peace Pad radar for visual comparison with all other overlaid profiles."],
        ['📄 Generate Report', 'Generates a formatted HTML resolution report including executive summary, behavioral gap analysis, instrument recommendations, risk assessment, and resolution playbook — downloads automatically.'],
        ['💾 Save Challenge', 'Saves the current party configuration and overlay state so the session can be resumed or shared.'],
        ['Clear All', 'Removes all party overlays from the Peace Pad, resetting the visualization to blank for a fresh analysis.'],
      ] },
      { heading: 'The Peace Pad', body: "The Peace Pad is the central visualization tool — a white radar chart where multiple parties' behavioral profiles are overlaid simultaneously. The distance between profiles reveals the behavioral gap driving the conflict or challenge. Larger gaps mean higher friction risk. Overlap areas represent natural alignment that can be built upon." },
      { heading: 'The 9 Challenge Types', table: { heads: ['Challenge', 'Primary Instrument', 'Core Comparison'], rows: [
        ['Conflict Resolution', 'ASI vs. ASI', 'Individual behavioral style differences'],
        ['Hiring & Onboarding', 'ASSET-P vs. ASI', 'Role requirements vs. candidate profile'],
        ['Post-Merger Integration', 'OASI vs. OASI', "Two organizations' rewarded behavioral cultures"],
        ['Culture Change', 'OASI vs. A-OASI', 'Current culture vs. aspirational target'],
        ['Leadership Development', 'ASI vs. ASSET-P', "Leader's style vs. role's requirements"],
        ['Performance Management', 'ASSET-P vs. ASI', "Role standard vs. individual's behavior"],
        ['Change Management', 'OASI vs. Ideal OASI', 'Current rewards vs. what change requires'],
        ['Strategic Alignment', 'OASI vs. OASI (dept)', 'Cross-department behavioral culture gaps'],
        ['Talent Retention', 'ASI vs. OASI', "Individual's style vs. what org rewards"],
      ] } },
      { heading: 'Org vs. Individual Overlays', body: 'Organizational instruments (OASI, A-OASI, ASSET-T) are overlaid using the buttons below the Peace Pad as dashed reference lines. Individual instruments (ASI, A-ASI) are assigned per party on the right panel and overlaid using the checkbox in the candidate pool table. This separation keeps the visualization clean and interpretable.' },
      { heading: 'Report Generation', body: 'The resolution report includes: Executive Summary, Behavioral Gap Analysis table (all 9 styles), Instrument Recommendations with rationale, Risk Assessment for non-involved parties, optional Resolution Playbook with phased intervention plan, and a CLI Leadership Perspective framing the challenge in Achieving Styles terms.' },
    ],
  },

  hiring: {
    title: 'Hiring & On-Boarding Dashboard',
    sub: 'Talent acquisition and onboarding pipeline',
    sections: [
      { heading: 'Purpose', body: 'The Hiring & On-Boarding dashboard tracks the full talent acquisition pipeline for SPGI — from open requisitions through offer acceptance and 90-day onboarding outcomes. It surfaces bottlenecks, time-to-hire trends, offer acceptance rates, and early attrition signals, allowing HR leadership to intervene before talent is lost.' },
      { heading: 'Key Features', features: [
        ['Pipeline Stage Filters', 'Filter candidates by stage (Applied, Screening, Interview, Offer, Hired) to focus on the active bottleneck in the funnel.'],
        ['CLI Fit Score Column', 'Displays the ASSET-P vs. ASI fit score for candidates who have completed CLI assessment, flagging those with weak fit for review before offer.'],
        ['90-Day Attrition Tracker', 'Highlights recent hires who have exited within 90 days, with their CLI fit score at hire, to build a calibration dataset over time.'],
        ['Role Filter', 'Filters the pipeline by open requisition so hiring managers can focus on their specific roles without seeing the full SPGI pipeline.'],
      ] },
      { heading: 'CLI Connection', body: 'CLI instruments are embedded in the hiring process via the Fill Jobs dashboard. The Hiring & On-Boarding dashboard tracks whether ASSET-P assessments were completed for each open role and whether ASI assessments were administered to final-round candidates. Positions filled without CLI data are flagged as higher attrition risk.' },
      { heading: 'Key Metrics', table: { heads: ['Metric', 'What It Signals'], rows: [
        ['Time to Fill', 'Pipeline efficiency — high numbers signal sourcing or process problems'],
        ['Offer Acceptance Rate', 'Employer brand and compensation competitiveness'],
        ['90-Day Attrition', 'Onboarding failure, role-style mismatch, or manager relationship breakdown'],
        ['CLI Fit Score at Hire', 'Predicted vs. actual performance — tracks whether fit scores predict outcomes'],
        ['Manager NPS at 90 Days', "Whether the new hire's manager is supporting integration effectively"],
      ] } },
      { heading: 'Onboarding Best Practices via CLI', body: "The most effective onboarding programs share the new hire's ASI results with their manager before day one — not to label the person, but to help the manager adapt their communication and expectation-setting style to match how the new hire naturally achieves. A Power-style manager onboarding an Entrusting-style hire needs to consciously delegate more and control less to avoid early disengagement." },
    ],
  },

  'merger-integration': {
    title: 'Post Merger Integration Dashboard',
    sub: 'Behavioral integration analytics — IHS Markit',
    sections: [
      { heading: 'Purpose', body: "The Post Merger Integration dashboard tracks the progress of SPGI's integration with IHS Markit across behavioral, operational, and financial dimensions. It surfaces where legacy cultural differences are creating friction, where integration milestones are at risk, and where leadership intervention is needed." },
      { heading: 'Key Features', features: [
        ['Phase Timeline', 'Visual timeline of the four integration phases (Discovery, Design, Integration, Optimization) with milestone completion status and next actions.'],
        ['OASI Gap Heatmap', 'Color-coded grid showing the behavioral gap between legacy SPGI and IHS Markit OASI profiles across all 9 styles — red = high friction zone.'],
        ['Bridge-Builder Identifier', 'Flags individuals whose ASI profiles span both legacy OASI profiles, marking them as integration champions for cross-functional assignment.'],
        ['Department-Level Filter', 'Drills into integration progress and OASI gap data for specific business units, revealing where friction is concentrated.'],
      ] },
      { heading: 'The CLI Insight', body: 'Most M&A integrations are measured on financial synergies and operational milestones. CLI adds the behavioral layer: if two organizations have fundamentally different OASI profiles — different behavioral reward systems — the financial and operational integration will underperform because people are being asked to work in ways that contradict what their cultures have trained them to value.' },
      { heading: 'OASI vs. OASI Analysis', body: 'The core CLI tool for M&A is overlaying the OASI profiles of both legacy organizations on the Peace Pad. Styles with large gaps (3+ points) are the friction zones — where behaviors that were rewarded in one culture are not valued or even actively penalized in the other. These are the integration failure points to prioritize.' },
      { heading: 'Integration Phases and CLI', table: { heads: ['Phase', 'Timeline', 'CLI Focus'], rows: [
        ['Discovery', 'Days 1–30', 'Administer OASI to both legacy orgs. Map behavioral gap profile.'],
        ['Design', 'Months 1–3', 'Use gap analysis to design integration structure, reporting lines, and communication protocols'],
        ['Integration', 'Months 3–12', 'Track ASSET-T profiles of newly combined teams. Identify bridge-builders.'],
        ['Optimization', 'Month 12+', 'Re-administer OASI to measure cultural convergence. Adjust interventions.'],
      ] } },
      { heading: 'Bridge-Builders', body: 'In every merger, there are individuals whose ASI profiles bridge the two organizational cultures — people who naturally use styles rewarded by both legacy OASIs. These are your integration champions. Identify them early using CLI data and give them cross-functional roles, regardless of seniority.' },
    ],
  },

  merger: {
    title: 'Post Merger Updates Dashboard',
    sub: 'Real-time integration progress and risk tracking',
    sections: [
      { heading: 'Purpose', body: 'The Post Merger Updates dashboard provides a rolling view of integration progress against the milestones defined in the integration plan. It tracks financial synergy realization, headcount integration, systems consolidation, and — critically — cultural alignment indicators derived from CLI behavioral data.' },
      { heading: 'Key Features', features: [
        ['Milestone Status Tracker', 'Displays each integration milestone as On Track, At Risk, or Delayed with the responsible owner and last update timestamp.'],
        ['Cultural Convergence Gauge', "Shows how much the combined organization's OASI profile has converged toward the target integrated culture since the merger close date."],
        ['Attrition Split View', 'Segments attrition data by legacy organization (SPGI vs. IHS Markit) to detect if one side is losing disproportionately more talent.'],
        ['Synergy Realization Tracker', 'Tracks financial synergy targets against actuals, with CLI behavioral risk flags where culture gaps are threatening synergy delivery.'],
      ] },
      { heading: 'Cultural Alignment Indicators', body: 'Standard integration dashboards track cost savings and org chart consolidation. This dashboard adds CLI-derived behavioral metrics: OASI convergence rate (are the two cultures moving toward a shared profile?), cross-legacy team effectiveness scores, and retention rates segmented by legacy organization to detect if one side is losing disproportionately more talent.' },
      { heading: 'Risk Signals', table: { heads: ['Signal', 'CLI Interpretation', 'Action'], rows: [
        ['High attrition from acquired org', "Acquired culture's OASI styles not rewarded in combined org", 'Adjust promotion and recognition criteria to honor both profiles'],
        ['Cross-team project failures', 'OASI gap too large for natural collaboration', 'Assign bridge-builder leaders to cross-legacy teams'],
        ['Leadership friction', 'Executive OASI profiles fundamentally misaligned', 'Administer ASI 360° to leadership team, facilitate joint debrief'],
        ['Client relationship disruption', 'Key client-facing individuals leaving due to culture mismatch', 'Priority retention program using ASI vs. OASI analysis'],
      ] } },
    ],
  },

  'culture-change': {
    title: 'Culture Change Dashboard',
    sub: 'Tracking behavioral culture transformation',
    sections: [
      { heading: 'Purpose', body: "The Culture Change dashboard tracks SPGI's progress in shifting its organizational culture from its current behavioral state (OASI) toward its aspirational target (A-OASI). Culture change is not an event — it is a multi-year behavioral reprogramming of what the organization rewards, recognizes, and promotes." },
      { heading: 'Key Features', features: [
        ['OASI Trend Chart', 'Time-series chart showing how each of the 9 OASI style scores has moved over successive measurement periods — the core evidence of culture change progress.'],
        ['Lever Effectiveness Tracker', 'Tracks which culture change levers (promotion criteria, recognition, manager training) are showing measurable impact on OASI movement.'],
        ['Resistance Alert', 'Flags measurement periods where OASI movement has stalled or reversed, signaling a cultural resistance event requiring leadership intervention.'],
        ['Dimension Detail View', "Drills into any single Achieving Style to see which departments are leading vs. lagging on that style's cultural shift."],
      ] },
      { heading: 'Why Culture Change Fails', body: 'Culture change initiatives fail when leaders change the stated values but not the actual reward system. If the OASI profile stays the same — if the same behaviors still get people promoted — then the culture has not changed, regardless of what the values posters on the wall say. This dashboard tracks the OASI, not the stated values.' },
      { heading: 'The Culture Change Levers', table: { heads: ['Lever', 'CLI Instrument', 'How It Shifts the OASI'], rows: [
        ['Promotion criteria', 'OASI + A-OASI', 'Promote people whose ASI matches aspirational OASI target'],
        ['Recognition programs', 'ASSET-T', 'Recognize team behaviors that reflect aspirational styles'],
        ['Manager training', 'ASI + A-ASI', 'Train managers to use styles that model the aspirational culture'],
        ['Hiring criteria', 'ASSET-P', 'Define new roles with ASSET-P profiles that match aspirational OASI'],
        ['Performance reviews', 'ASI 360°', 'Include aspirational style behaviors in performance evaluation'],
      ] } },
      { heading: 'Measurement Cadence', body: 'Re-administer the OASI every 6–12 months to track convergence toward the A-OASI target. Expect resistance at months 3 and 9 as the organization tests whether the new cultural signals are real or performative. Consistency of leadership behavior during these tests determines whether the change takes hold.' },
    ],
  },

  external: {
    title: 'External View Dashboard',
    sub: "How SPGI's culture appears to the outside world",
    sections: [
      { heading: 'Purpose', body: "The External View dashboard aggregates signals from outside the organization — analyst commentary, media sentiment, Glassdoor reviews, LinkedIn talent flow, and customer satisfaction data — to construct an external perception of SPGI's leadership culture and organizational health." },
      { heading: 'Key Features', features: [
        ['Source Toggle', 'Switches between external data sources (Glassdoor, Media, LinkedIn, Analyst reports) to isolate the signal most relevant to the current question.'],
        ['Sentiment Timeline', 'Plots external sentiment scores over time with annotations marking major organizational events (earnings, leadership changes, M&A announcements).'],
        ['OASI Correlation View', 'Overlays external sentiment trends against OASI profile changes to test whether culture shifts are visible to the outside world.'],
        ['Alert Threshold', 'Sets a minimum negative sentiment score that triggers an advisory alert to the CEO dashboard.'],
      ] },
      { heading: 'CLI Connection', body: "External perceptions of a company's culture are a lagging indicator of its OASI profile. Organizations with high Direct-style OASIs (Competitive, Power) tend to generate external narratives around performance culture, high standards, and results — but also burnout, high turnover, and aggressive management. Organizations with high Relational OASIs tend to generate narratives around collaboration and inclusion — but sometimes also around slow decision-making." },
      { heading: 'Key External Signals', table: { heads: ['Signal Source', 'What It Reveals', 'CLI Interpretation'], rows: [
        ['Glassdoor Reviews', 'Employee experience of actual culture', 'Reveals gaps between OASI and employee-facing reality'],
        ['Analyst Reports', 'Leadership credibility', 'High Direct OASI often correlates with strong analyst confidence'],
        ['Media Sentiment', 'Brand culture perception', 'Negative sentiment often trails major OASI misalignment events'],
        ['LinkedIn Talent Flow', 'Attraction vs. attrition by style type', 'Which Achieving Styles are flowing in vs. out'],
        ['Customer NPS', 'External relationship quality', 'High Instrumental OASI correlates with stronger customer relationships'],
      ] } },
    ],
  },

  sentiment: {
    title: 'Sentiment Analysis Dashboard',
    sub: 'Internal and external sentiment trends',
    sections: [
      { heading: 'Purpose', body: 'The Sentiment Analysis dashboard tracks internal employee sentiment and external stakeholder sentiment across time, segmented by business unit, seniority level, and geography. It provides early warning signals of cultural deterioration before they manifest in attrition or performance data.' },
      { heading: 'Key Features', features: [
        ['Segment Filter', 'Filters sentiment data by business unit, seniority level, or geography to isolate where disengagement is concentrated.'],
        ['Dimension Breakdown', 'Expands each sentiment dimension (Psychological Safety, Growth Mindset, etc.) into its component survey questions for root cause analysis.'],
        ['CLI Style Overlay', 'Maps each sentiment dimension to its corresponding Achieving Style(s) so low scores can be interpreted through the CLI behavioral lens.'],
        ['Trend Alert', 'Highlights any dimension showing a decline of 10%+ in 90 days and automatically surfaces it on the Early Warning KPIs dashboard.'],
      ] },
      { heading: 'CLI Connection', body: "Sentiment data is the leading indicator that a culture's OASI is misaligned with its people's needs. When employees whose natural ASI profiles include high Relational styles (Collaborative, Contributory, Vicarious) report low engagement, it typically signals that the OASI rewards Direct or Instrumental styles at the expense of Relational contribution. Sentiment analysis, read through a CLI lens, becomes a diagnostic tool rather than just an engagement score." },
      { heading: 'Sentiment Dimensions and CLI', table: { heads: ['Sentiment Dimension', 'CLI Style Connection', 'What Low Scores Signal'], rows: [
        ['Psychological Safety', 'Collaborative + Contributory', 'OASI over-rewards Competitive/Power at expense of team safety'],
        ['Growth Mindset', 'Intrinsic + Personal', 'Not enough autonomy or personal development opportunity'],
        ['Team Collaboration', 'Collaborative + Entrusting', 'OASI rewards individual contribution over team outcomes'],
        ['Manager Relationship', 'Personal + Vicarious', 'Managers not using Instrumental/Relational styles enough'],
        ['Discretionary Effort', 'Intrinsic + Contributory', 'People not connected to purpose — low Contributory rewards'],
      ] } },
    ],
  },
};
