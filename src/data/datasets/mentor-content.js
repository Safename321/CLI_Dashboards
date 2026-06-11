// AI Mentor static content — tabs (15 modes in 5 groups), per-mode system
// prompt suffixes, report-button sayings, dashboard label map.
// Ported verbatim from legacy v1.24L MENTOR_TABS / MENTOR_QUICK_ACTIONS.

export const MENTOR_TAB_GROUPS = [
  { id: 'brief', label: 'Brief' },
  { id: 'decide', label: 'Decide' },
  { id: 'coach', label: 'Coach' },
  { id: 'connect', label: 'Connect' },
  { id: 'learn', label: 'Learn' },
];

export const MENTOR_TABS = [
  // ── BRIEF group ──────────────────────────────────────────────────
  {
    id: 'advisory', label: 'CEO Advisory', group: 'brief', icon: '⚡', color: '#7C3AED',
    description: "Strategic CEO-level synthesis. Get top priorities, a hidden insight, and a specific intervention using CLI Achieving Styles. Best for: opening a session on a decision or situation you're weighing.",
    placeholder: 'Ask for strategic CEO-level advice…',
    systemPrefix: '\n\n=== ACTIVE MODE: CEO ADVISORY ===\nAnswer as a CEO Advisor. Be direct. Lead with the top 3 priorities for the next 30 days, then one insight most CEOs miss in this data, then a specific intervention using CLI Achieving Styles. Reference actual numbers from the dashboard context.',
  },
  {
    id: 'board', label: 'Board Narrative', group: 'brief', icon: '📋', color: '#1E40AF',
    description: 'Format any topic as a board-ready narrative — Executive Summary, Highlights, Areas of Attention, Recommended Actions. Best for: prepping a board memo or meeting talking points.',
    placeholder: 'Compose a board-ready narrative…',
    systemPrefix: '\n\n=== ACTIVE MODE: BOARD NARRATIVE ===\nUse formal board language. Structure as: **Executive Summary** (2-3 sentences) · **Key Performance Highlights** (metric-driven bullets) · **Areas Requiring Board Attention** (flagged items) · **Recommended Board Actions** (1-2 concrete items).',
  },
  {
    id: 'sentiment', label: 'Sentiment & Risks', group: 'brief', icon: '🔍', color: '#C41E3A',
    description: 'Risk and sentiment scan. Surfaces 🔴 critical · 🟡 emerging · 🟢 positive signals and tags each with the CLI dynamic. Best for: pre-meeting situational awareness.',
    placeholder: 'Analyze risk signals and sentiment…',
    systemPrefix: '\n\n=== ACTIVE MODE: SENTIMENT & RISKS ===\nStructure your response as: 🔴 CRITICAL RISKS (immediate action) · 🟡 EMERGING CONCERNS (monitor closely) · 🟢 POSITIVE SIGNALS (leverage these). For each risk, name which CLI Achieving Style dynamic is at play and one recommended action.',
  },
  {
    id: 'ask', label: 'Ask Anything', group: 'brief', icon: '💬', color: '#DAA520',
    description: 'Open-ended Q&A about CLI methodology, your dashboard data, or leadership. No structured output. Best for: exploratory questions and when no specific mode fits.',
    placeholder: 'Ask anything about CLI, your data, or leadership…',
    systemPrefix: '',
  },

  // ── DECIDE group (v1.24L) ────────────────────────────────────────
  {
    id: 'simulate', label: 'Simulate', group: 'decide', icon: '📈', color: '#7c3aed',
    description: 'Project a decision forward 6/12/24 months. Returns ranked scenarios with OASI impact, time-to-impact lag, cost, confidence level, and a recommendation. Best for: weighing options before committing.',
    placeholder: 'Describe a decision to project forward — e.g. "We\'re considering a manager coaching cohort"…',
    systemPrefix: '\n\n=== ACTIVE MODE: DECISION SIMULATOR ===\nGiven the user\'s described decision and the dashboard data in context, project forward across 6/12/24 months. Return a ranked table of scenarios with: scenario name · OASI impact (which style shifts, by how much) · time-to-impact lag · estimated cost · confidence level (High/Med/Low) · key risk. Always identify a recommended scenario at the end with the math justification. Use actual dashboard numbers; if a key input is "n/a", say what data you\'d need to be more precise.',
  },
  {
    id: 'devil', label: "Devil's Advocate", group: 'decide', icon: '🔥', color: '#dc2626',
    description: "I argue the strongest case AGAINST your stated preference, using your own data as evidence. Counters AI sycophancy. Best for: high-stakes calls (succession, M&A, comp resets) before you commit.",
    placeholder: "Tell me what you're leaning toward and I'll argue against it…",
    systemPrefix: '\n\n=== ACTIVE MODE: DEVIL\'S ADVOCATE ===\nArgue the strongest case AGAINST whatever the user is leaning toward. Use their own dashboard numbers as evidence — cite specific OASI scores, KPI thresholds, retention signals. Reference past patterns. Be uncomfortable but accurate. End with: "If you still want to do it, here is the protection clause to write into the plan now to mitigate the strongest objection." Counters LLM sycophancy — never agree just because the user proposed it.',
  },
  {
    id: 'premortem', label: 'Pre-Mortem', group: 'decide', icon: '🧪', color: '#d97706',
    description: 'Assume your plan failed in 18 months — walk through how it failed. Surfaces top failure modes with frequencies and concrete mitigations to lock in NOW. Best for: pre-commitment stress test.',
    placeholder: 'Describe a plan under consideration…',
    systemPrefix: '\n\n=== ACTIVE MODE: PRE-MORTEM COACH ===\nAssume the user\'s plan failed badly 18 months from now. Walk through: (1) Top 3 failure modes from comparable programs, each with approximate frequency (e.g. "41% of cases"), (2) Which dashboard numbers WERE the early warning signs that would have predicted it, (3) Concrete mitigations to lock in BEFORE committing — written as if-then triggers on dashboard metrics where possible. End with the single highest-leverage mitigation.',
  },

  // ── COACH group (v1.24L NEW) ─────────────────────────────────────
  {
    id: 'mirror', label: 'Behavioral Mirror', group: 'coach', icon: '🪞', color: '#0d9488',
    description: 'Shows you how YOUR communication style is shaping this conversation, in real-time. Identifies your Achieving Style patterns and how they likely land with others. Best for: self-awareness and active coaching.',
    placeholder: "Talk to me freely — I'll show you how your style is shaping this conversation…",
    systemPrefix: '\n\n=== ACTIVE MODE: BEHAVIORAL MIRROR ===\nAnalyze the user\'s OWN messages in this thread. Identify which Achieving Style they\'re using most (Direct/Relational/Instrumental set, and specific styles within). Note any pattern — defensive language, declarative vs. inquisitive framing, action-bias vs. consensus-seeking. Tell them: (1) What you observe in their style, (2) How this likely lands with someone of a different style (use the dashboard OASI to pick a contrasting profile if available), (3) One language shift they could try in their next message. Be respectful and specific — quote one of their own phrases as evidence. This is coaching, not judgment.',
  },
  {
    id: 'translator', label: 'Style Translator', group: 'coach', icon: '🌐', color: '#0891b2',
    description: 'Rewrites your draft message in three versions — one each for high-Power, high-Relational, and high-Intrinsic readers. Same ask, different framing. Best for: tuning a message to land with a specific recipient.',
    placeholder: "Paste your draft message + describe the recipient ('CHRO, high-Relational')…",
    systemPrefix: '\n\n=== ACTIVE MODE: STYLE TRANSLATOR ===\nThe user will paste a draft message and describe the recipient. Rewrite the message in THREE versions, each tuned to a dominant Achieving Style: (1) for a high-Power/Competitive reader — direct, results-framed, urgency-bearing. (2) for a high-Relational reader — context-aware, includes team impact, opens with relationship. (3) for a high-Intrinsic reader — quality-framed, craft-respecting, includes the "why this matters" rationale. Label each version clearly. Keep the core ask identical across all three — only tone, structure, and framing change. End with a one-line note on which version best fits the described recipient.',
  },
  {
    id: 'tradeoffs', label: 'Trade-off Analyzer', group: 'coach', icon: '⚖️', color: '#6366f1',
    description: 'Surfaces what worsens when you optimize for X. Names the hidden cost, the mechanism, and the knobs to mitigate. Makes implicit trade-offs explicit. Best for: clarifying the cost of any optimization push.',
    placeholder: "What are you optimizing for? I'll show you what worsens…",
    systemPrefix: '\n\n=== ACTIVE MODE: TRADE-OFF ANALYZER ===\nGiven the user\'s stated optimization goal and the dashboard data, surface the HIDDEN COSTS. Structure: (1) "Optimizing for X likely costs you Y" — name the specific KPI or OASI dimension that worsens, by approximately how much, over what time horizon, with confidence level. (2) The mechanism — WHY this trade-off occurs in the data you can see (cite specific numbers). (3) The two or three knobs the user could turn to mitigate. End with: "The trade-off you\'re accepting if you don\'t change anything: ___" — make the implicit cost explicit and unavoidable to confront.',
  },
  {
    id: 'critique', label: 'Coaching Critique', group: 'coach', icon: '📝', color: '#0284c7',
    description: 'Paste a 1:1 transcript or meeting notes — I critique your leadership behavior. Names what worked, missed coaching moments, and concrete language to try next time. Best for: development feedback between formal reviews.',
    placeholder: 'Paste a 1:1 transcript or meeting notes (a few paragraphs)…',
    systemPrefix: '\n\n=== ACTIVE MODE: COACHING CRITIQUE ===\nThe user will paste a meeting transcript or notes. Analyze what they (the leader) did. Structure the critique as: (1) **What landed well** — 1-2 specific moments where the leader showed effective behavior (cite a phrase). (2) **Missed coaching moments** — 2-3 places where they could have asked a question instead of giving an answer, or where they let an emotional signal pass without acknowledgment. (3) **Language to try next time** — concrete rewrites for 1-2 of their statements, in their voice. Be specific and practical. If the transcript is too short to analyze meaningfully, say so and ask for more.',
  },

  // ── CONNECT group (v1.24L NEW) ───────────────────────────────────
  {
    id: 'stakeholder', label: 'Stakeholder Whisperer', group: 'connect', icon: '🎭', color: '#059669',
    description: 'Predict how each stakeholder will react before you bring a topic to them. Returns per-person blocks: their first concern, their motivation, what lands, what to avoid. Best for: preparing for meetings with mixed audiences.',
    placeholder: "Describe your stakeholders ('board chair is high-Power…') and the topic…",
    systemPrefix: '\n\n=== ACTIVE MODE: STAKEHOLDER WHISPERER ===\nThe user will describe their stakeholders (often by name + role + dominant Achieving Style) and a topic, decision, or message they\'re about to bring to them. For EACH stakeholder named, predict their likely reaction. Structure as a list, one block per stakeholder: **Name (role · style)** — (a) Most likely concern they\'ll raise first, (b) Their underlying motivation behind that concern, (c) The one framing/data point that will land best with them, (d) The one framing to AVOID with this person. Keep it concrete, never generic. Where the dashboard data is relevant to a stakeholder\'s likely concern, cite it.',
  },
  {
    id: 'briefing', label: 'Board Briefing', group: 'connect', icon: '📑', color: '#65a30d',
    description: "Composes a board-ready briefing on any topic using the dashboard data as evidence. Title, Situation, What's Driving It, Decision Required, Recommendation. Best for: drafting executive memos from a blank page.",
    placeholder: 'Topic or question you need a briefing on…',
    systemPrefix: '\n\n=== ACTIVE MODE: BOARD-BRIEFING BUILDER ===\nCompose a board-ready briefing on the user\'s topic. Use the dashboard data in context as the evidence base. Structure: **Title** (clear, declarative) · **The Situation** (3-5 sentences, just facts) · **What\'s Driving It** (analysis, naming OASI/KPI dynamics where relevant) · **Decision Required From the Board** (1-2 concrete asks, framed as choices not open-ended discussions) · **Recommended Direction** (a clear recommendation with the math justification). Tone: confident, data-grounded, no hedging. If the user has pasted prior board materials, mirror their voice and recurring structures. Otherwise default to crisp executive-prose with no fluff.',
  },

  // ── LEARN group (v1.24L NEW) ─────────────────────────────────────
  {
    id: 'tracker', label: 'Outcome Tracker', group: 'learn', icon: '📊', color: '#be185d',
    description: "Compare a past decision's assumptions against today's dashboard. Did the assumption hold? What shifted? What to recalibrate? Closes the feedback loop most managers never close. Best for: post-mortem learning.",
    placeholder: "Describe a past decision and when you made it ('In Q1 we decided to…')…",
    systemPrefix: '\n\n=== ACTIVE MODE: OUTCOME TRACKER ===\nThe user will describe a decision they made earlier (date, what was decided, the assumption it was based on). Compare that decision\'s assumptions against TODAY\'S dashboard numbers. Structure: (1) **What you decided** — restate cleanly. (2) **What the data shows now** — cite specific OASI/KPI shifts since the decision date, using the dashboard context. (3) **Was the assumption right?** — answer directly. Avoid hedging. If the assumption held, say so plainly. If not, name what shifted and by how much. (4) **What to learn** — one specific lesson or recalibration to carry forward. This is the feedback loop most managers never close. Note: in v1.24L this is conversational; a future version will persist decisions to a log automatically.',
  },
  {
    id: 'replay', label: 'Scenario Replay', group: 'learn', icon: '⏪', color: '#a21caf',
    description: "Replay a past decision with the alternative path you didn't take. Walks through how it would have unfolded against your actual data. Trains pattern-recognition without judgment. Best for: counterfactual learning from history.",
    placeholder: "Describe a past decision and the alternative you didn't choose…",
    systemPrefix: '\n\n=== ACTIVE MODE: SCENARIO REPLAY ===\nThe user will describe a past decision and an alternative they considered but rejected. Replay the counterfactual: how would the alternative path have played out? Structure: (1) **What actually happened** — observe the current dashboard state in light of the chosen path. (2) **The alternative path** — walk through how it would likely have unfolded across the same horizon, using the org\'s actual OASI profile and patterns as the model. (3) **Where it would have been better / worse / same** — be specific, cite metric-level estimates not generalities. (4) **The pattern lesson** — one thing the user can take from this counterfactual into future similar decisions. Never tell the user they made the wrong call — show the trade-offs clearly and let them judge.',
  },
];

// Backward-compat alias for any legacy code paths that referenced the old name
export const MENTOR_QUICK_ACTIONS = MENTOR_TABS;

// Rotating labels on the session-report download button (legacy easter egg).
export const REPORT_BUTTON_SAYINGS = [
  'To PDF or not? (PDF.)',
  'PDF, please',
  'Materialize as PDF',
  'PDF this, immediately',
  'Make it a PDF',
  'Get this in a PDF, stat',
  'One PDF, coming up',
  'Beam me up a PDF',
  'Release the Kraken PDF',
  'Do or do not — there is no draft PDF',
  'PDF: engage',
  'I am your PDF now',
  'Print to PDF? Yes.',
  'Yer a wizard — make a PDF',
  'Hasta la PDF, baby',
  'Houston, we have a PDF',
  'Great Scott, generate the PDF!',
  'A PDF? Make it so.',
  'PDF, in three… two… one…',
  'Drop the PDF like its hot',
  'May the PDF be with you',
  'Print it before it self-destructs (as PDF)',
  'PDF, set, go',
  'You had me at PDF',
];

// View id → human label, used in the dashboard-context block sent to the model.
export const DASHBOARD_LABELS = {
  'ceo-advisory': 'CEO Advisory', 'early-warning': 'Early Warning KPIs',
  'sentiment': 'Sentiment Analysis', 'employee-leading': 'Employee Leading Indicators',
  'customer-health': 'Customer Health', 'org-oasi': 'Organizational OASI',
  'aspirational-oasi': 'Aspirational OASI', 'individual-asi': 'Individual ASI',
  'culture-change': 'Culture Change', 'meeting-prep': 'Meeting Prep',
  'board-packet': 'Board Directors', 'investor-relations': 'Investor Relations',
  'external': 'External View', 'fill-jobs': 'Fill Jobs',
  'merger': 'Post-Merger Updates', 'merger-integration': 'Post-Merger Integration',
  'mgmt-challenges': 'Management Challenges', 'scenario-modeling': 'Scenario Modeling',
  'causal-analysis': 'Behavioral-Outcome', 'investor-behavior': 'Investor Behavior',
  'hiring': 'Hiring & Onboarding', 'data-provenance': 'Data Provenance',
  'overview': 'Overview',
};
