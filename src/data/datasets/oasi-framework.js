// OASI framework reference content used by the OASI explainer report
// (v1.24L App.jsx 1016–1140). Strings may contain inline HTML — they are
// rendered into a generated standalone HTML document, not React JSX.

export const OASI_STYLE_SETS = [
  {
    id: 'direct',
    heading: '🟡 Direct Set — Achievement Through Personal Action',
    headingColor: '#a16207',
    blurb: 'The Direct set emphasizes self-reliant achievement. Organizations scoring high here act quickly, rely on internal standards, and compete to win.',
    styles: [
      { name: 'Intrinsic', behavior: 'Sets internal standards of excellence; driven by mastery and personal pride in performance', signal: 'High quality bar; perfectionist culture; strong craft orientation' },
      { name: 'Competitive', behavior: 'Measures success against others; motivated by winning market share, rankings, and benchmarks', signal: 'Market-obsessed; data-driven comparisons; leaderboard culture' },
      { name: 'Power', behavior: 'Achieves by directing others; uses authority, position, and decisive action to move results', signal: 'Command-and-control structure; clear hierarchy; rapid decision-making at top' },
    ],
  },
  {
    id: 'instrumental',
    heading: '🔴 Instrumental Set — Achievement Through Others as Instruments',
    headingColor: '#b91c1c',
    blurb: 'The Instrumental set involves achieving goals by strategically working through and leveraging other people — as mentors, collaborators, or empowered agents.',
    styles: [
      { name: 'Personal', behavior: 'Builds one-on-one relationships to accomplish goals; relies on personal networks and trusted advisors', signal: 'Relationship-driven culture; mentorship programs; high individual loyalty' },
      { name: 'Social', behavior: 'Uses group membership, coalition-building, and social identity to achieve organizational aims', signal: 'ERGs, community partnerships, team-based identity; strong social presence' },
      { name: 'Entrusting', behavior: 'Delegates fully and trusts others to perform; empowers individuals with autonomy and ownership', signal: 'Flat delegation structure; high autonomy; decentralized authority' },
    ],
  },
  {
    id: 'relational',
    heading: '🔵 Relational Set — Achievement Through Connection and Giving',
    headingColor: '#1d4ed8',
    blurb: 'The Relational set centers on achieving through genuine contribution to others and the collective whole — not personal gain, but shared advancement.',
    styles: [
      { name: 'Collaborative', behavior: 'Achieves by working alongside others as equal partners; values joint effort and co-creation', signal: 'Cross-functional teams; shared accountability; consensus-seeking culture' },
      { name: 'Contributory', behavior: 'Achieves by serving the goals of others; sees success in terms of how much it helps others succeed', signal: 'Service-oriented culture; support functions valued; internal customer mindset' },
      { name: 'Vicarious', behavior: 'Achieves by enabling and celebrating others&apos; success; derives satisfaction from others&apos; accomplishments', signal: 'Coaching culture; strong talent development; leadership pride in team wins' },
    ],
  },
];

export const OASI_MEASUREMENT_LEVELS = [
  { level: 'Aspirational', instrument: 'ASI / A-ASI', measures: 'How an individual <em>wants</em> to achieve — ideal behavior', use: 'Leadership development, career planning' },
  { level: 'Organizational', instrument: 'OASI / A-OASI', measures: 'How an <em>organization</em> achieves — collective behavioral pattern', use: 'Culture diagnosis, M&A integration, team alignment' },
  { level: 'Situational', instrument: 'Built into OASI / ASI', measures: 'Behavior under specific real-world conditions or stressors', use: 'Crisis leadership, change management' },
  { level: '360°', instrument: 'ASI 360°', measures: 'How others perceive an individual&apos;s achieving behavior', use: 'Feedback-based development, blind spot identification' },
];

export const OASI_SCORE_RANGES = [
  { range: '5.5 – 7.0', interpretation: 'Primary style — dominant behavioral orientation', implication: 'Strong organizational identity in this style; may over-rely in complex situations' },
  { range: '3.5 – 5.4', interpretation: 'Secondary style — consistent but not dominant', implication: 'Available resource; can be deployed intentionally when needed' },
  { range: '1.0 – 3.4', interpretation: 'Underdeveloped or avoided style', implication: 'Potential blind spot; may represent a gap when situations demand this approach' },
];

export const OASI_FRAMEWORK_COMPARISON = [
  { framework: 'CLI Achieving Styles', measures: 'HOW you achieve (behavior)', levels: 'ASI, A-ASI, OASI, A-OASI, 360°', changeable: 'Yes', orgLevel: 'Yes', unique: true },
  { framework: 'DiSC', measures: 'Behavioral style (4 dimensions)', levels: 'Individual only', changeable: 'Partially', orgLevel: 'No', unique: false },
  { framework: 'MBTI', measures: 'Cognitive preference type (16 types)', levels: 'Individual only', changeable: 'No — fixed type', orgLevel: 'No', unique: false },
  { framework: 'StrengthsFinder', measures: 'Talent themes (34 themes)', levels: 'Individual only', changeable: 'No — innate strengths', orgLevel: 'No', unique: false },
  { framework: 'Birkman', measures: 'Personality + 5 orientations', levels: 'Individual only', changeable: 'No — personality-based', orgLevel: 'No', unique: false },
];

export const OASI_PMI_APPLICATIONS = [
  '<strong>1. Culture Gap Diagnosis:</strong> By measuring the Current Culture OASI profile of both legacy organizations and comparing them to the Target Culture profile, CLI can quantify precisely where behavioral alignment gaps exist — not just in abstract values, but in observable day-to-day achieving behaviors.',
  '<strong>2. Leadership Selection:</strong> Using the FillJobs instrument, CLI identifies which individual Achieving Styles profiles best match the behavioral demands of critical integration roles. A high-Power, low-Collaborative leader may thrive in a turnaround but underperform in a collaborative integration environment.',
  '<strong>3. Integration Roadmap:</strong> The OASI delta between current and target culture informs where to invest in leadership development, where structural changes are needed (e.g., moving from Power-dominant to Entrusting-dominant to enable scale), and which integration milestones are at cultural risk.',
];
