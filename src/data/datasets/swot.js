// SWOT Materiality-Bubble — reference dataset (spec §6.1) + default per-profile
// config (§7 interdependency model). The reference factors power the public
// demo build AND the acceptance test: Vicarious and Entrusting must be the two
// largest SOLID bubbles (both Weaknesses); Threats render striped.

// §2.2 color ramps (CSS-var values from the spec).
export const SWOT_COLORS = {
  strength:    { light: '#5eead4', dark: '#0d9488' },
  weakness:    { light: '#fbbf24', dark: '#ef4444', relational: '#f97316' },
  opportunity: { light: '#93c5fd', dark: '#4f46e5' },
  threat:      { light: '#fda4af', dark: '#be123c' },
};

export const QUADRANT_META = {
  strength:    { title: 'Strengths',     sub: 'measured, in desired range' },
  weakness:    { title: 'Weaknesses',    sub: 'measured gaps vs desired' },
  opportunity: { title: 'Opportunities', sub: 'strategic readings' },
  threat:      { title: 'Threats',       sub: 'inferred consequences' },
};

// Default per-profile config for live ingestion (§7: configurable per profile,
// stored per tenant as the `swotConfig` dataset; these are the CLI defaults).
// Desired ranges per §6.1. Leverage/irreversibility encode the CLI model's
// view that Relational deficits gate the most downstream capability.
export const DEFAULT_SWOT_CONFIG = {
  styles: {
    Intrinsic:     { set: 'direct',       desired: [5.0, 6.5], leverage: 4, irreversibility: 3 },
    Competitive:   { set: 'direct',       desired: [4.5, 5.5], leverage: 4, irreversibility: 3 },
    Power:         { set: 'direct',       desired: [3.5, 5.0], leverage: 5, irreversibility: 4,
                     gates: ['vicarious_gap'] },
    Personal:      { set: 'instrumental', desired: [4.5, 5.5], leverage: 3, irreversibility: 3 },
    Social:        { set: 'instrumental', desired: [4.5, 5.5], leverage: 4, irreversibility: 4 },
    Entrusting:    { set: 'relational',   desired: [5.0, 6.0], leverage: 8, irreversibility: 6,
                     gates: ['collaborative_gap', 'integration_risk'] },
    Collaborative: { set: 'relational',   desired: [5.0, 6.5], leverage: 6, irreversibility: 5 },
    Contributory:  { set: 'relational',   desired: [5.0, 6.0], leverage: 5, irreversibility: 5 },
    Vicarious:     { set: 'relational',   desired: [5.0, 6.5], leverage: 9, irreversibility: 6,
                     gates: ['entrusting_gap', 'succession_risk'] },
  },
  inferred: [
    { id: 'succession_risk', label: 'Succession risk', quadrant: 'threat',
      leverage: 8, gapFromDesired: 8, irreversibility: 7,
      activatedBy: ['Vicarious'],
      description: 'Thin succession bench — leaders not vested in growing successors (derived from the Vicarious gap).' },
    { id: 'integration_risk', label: 'Post-integration execution risk', quadrant: 'threat',
      leverage: 7, gapFromDesired: 7, irreversibility: 6,
      activatedBy: ['Entrusting', 'Collaborative'],
      description: 'Cross-divisional execution drag — delegation friction bottlenecks integration work (derived from low Relational scores).' },
    { id: 'talent_flight', label: 'Talent flight', quadrant: 'threat',
      leverage: 6, gapFromDesired: 6, irreversibility: 5,
      activatedBy: ['Entrusting', 'Vicarious', 'Collaborative'],
      description: 'Relational-set weakness erodes retention of collaborative builders (inferred).' },
    { id: 'relational_development', label: 'Relational leadership development', quadrant: 'opportunity',
      leverage: 8, gapFromDesired: 6, irreversibility: 3,
      activatedBy: ['Vicarious', 'Entrusting'],
      description: 'Targeted Vicarious + Entrusting development unlocks the gated downstream capacity (inferred opportunity).' },
    { id: 'collaborative_growth', label: 'Collaboration-led growth lanes', quadrant: 'opportunity',
      leverage: 6, gapFromDesired: 5, irreversibility: 3,
      activatedBy: [],
      description: 'Work requiring cross-unit fusion is the growth lane a rebalanced profile can win (inferred).' },
  ],
  arrows: [
    { from: 'vicarious_gap', to: 'entrusting_gap', kind: 'gates',
      label: 'gates' /* low empathic-identification weakens delegation trust */ },
    { from: 'entrusting_gap', to: 'collaborative_gap', kind: 'gates', label: 'gates' },
    { from: 'vicarious_gap', to: 'succession_risk', kind: 'downstream', label: '' },
  ],
};

// §6.1 reference validation dataset — the demo-build profile. Handcrafted (not
// run through ingestion) so the demo narrative fields are rich; sub-scores are
// calibrated so the acceptance test holds by a clear margin.
export const REFERENCE_FACTORS = [
  // ── Strengths (firm, Direct set in range) ─────────────────────────────────
  { id: 'competitive_fit', label: 'Competitive', quadrant: 'strength',
    achievingStylesSet: 'direct', achievingStyle: 'Competitive',
    leverage: 4, gapFromDesired: 1, irreversibility: 3,
    evidenceType: 'firm', asiScore: 5.4, asiDesiredRange: [4.5, 5.5], gates: [],
    description: 'Competitive 5.4 in range 4.5–5.5 — individual-accountability work is well-fueled.' },
  { id: 'power_fit', label: 'Power', quadrant: 'strength',
    achievingStylesSet: 'direct', achievingStyle: 'Power',
    leverage: 5, gapFromDesired: 2, irreversibility: 4,
    evidenceType: 'firm', asiScore: 5.0, asiDesiredRange: [3.5, 5.0],
    gates: ['vicarious_gap'],
    description: 'Power 5.0 at the top of range 3.5–5.0 — decision velocity, but over-reliance substitutes for Relational influence (§7).' },
  { id: 'intrinsic_fit', label: 'Intrinsic', quadrant: 'strength',
    achievingStylesSet: 'direct', achievingStyle: 'Intrinsic',
    leverage: 4, gapFromDesired: 1, irreversibility: 3,
    evidenceType: 'firm', asiScore: 6.2, asiDesiredRange: [5.0, 6.5], gates: [],
    description: 'Intrinsic 6.2 in range 5.0–6.5 — craft pride sustains analytical depth.' },

  // ── Weaknesses (firm, measured gaps) ──────────────────────────────────────
  { id: 'social_gap', label: 'Social', quadrant: 'weakness',
    achievingStylesSet: 'instrumental', achievingStyle: 'Social',
    leverage: 4, gapFromDesired: 2, irreversibility: 4,
    evidenceType: 'firm', asiScore: 4.1, asiDesiredRange: [4.5, 5.5], gates: [],
    description: 'Social 4.1 vs desired 4.5–5.5 (−0.4) — minor networked-influence gap.' },
  { id: 'contributory_gap', label: 'Contributory', quadrant: 'weakness',
    achievingStylesSet: 'relational', achievingStyle: 'Contributory',
    leverage: 5, gapFromDesired: 5, irreversibility: 5,
    evidenceType: 'firm', asiScore: 3.8, asiDesiredRange: [5.0, 6.0], gates: [],
    description: 'Contributory 3.8 vs desired 5.0–6.0 (−1.2) — helping-others-achieve capacity under-used.' },
  { id: 'vicarious_gap', label: 'Vicarious', quadrant: 'weakness',
    achievingStylesSet: 'relational', achievingStyle: 'Vicarious',
    leverage: 9, gapFromDesired: 8, irreversibility: 6,
    evidenceType: 'firm', asiScore: 3.11, asiDesiredRange: [5.0, 6.5],
    gates: ['entrusting_gap', 'succession_risk'],
    description: 'Vicarious 3.11 vs desired 5.0–6.5 (−1.89) — the profile\'s largest measured deficit; gates delegation trust and the succession bench.' },
  { id: 'entrusting_gap', label: 'Entrusting', quadrant: 'weakness',
    achievingStylesSet: 'relational', achievingStyle: 'Entrusting',
    leverage: 8, gapFromDesired: 7, irreversibility: 6,
    evidenceType: 'firm', asiScore: 3.43, asiDesiredRange: [5.0, 6.0],
    gates: ['collaborative_gap', 'integration_risk'],
    description: 'Entrusting 3.43 vs desired 5.0–6.0 (−1.57) — delegation friction caps collaborative capacity (§7).' },
  { id: 'collaborative_gap', label: 'Collaborative', quadrant: 'weakness',
    achievingStylesSet: 'relational', achievingStyle: 'Collaborative',
    leverage: 6, gapFromDesired: 4, irreversibility: 5,
    evidenceType: 'firm', asiScore: 4.2, asiDesiredRange: [5.0, 6.5], gates: [],
    description: 'Collaborative 4.2 vs desired 5.0–6.5 (−0.8) — gated by the Entrusting deficit rather than an independent root.' },

  // ── Opportunities (inferred strategic readings) ───────────────────────────
  { id: 'relational_development', label: 'Relational development', quadrant: 'opportunity',
    achievingStylesSet: 'relational', achievingStyle: null,
    leverage: 8, gapFromDesired: 6, irreversibility: 3,
    evidenceType: 'inferred', asiScore: null, asiDesiredRange: null, gates: [],
    description: 'A targeted Vicarious + Entrusting program unlocks the downstream capacity every gated factor is waiting on.' },
  { id: 'collaborative_growth', label: 'Collaboration-led growth', quadrant: 'opportunity',
    achievingStylesSet: null, achievingStyle: null,
    leverage: 6, gapFromDesired: 5, irreversibility: 3,
    evidenceType: 'inferred', asiScore: null, asiDesiredRange: null, gates: [],
    description: 'Cross-unit fusion work is the growth lane — Collaborative-style work is where the upside concentrates.' },
  { id: 'sustainability_fit', label: 'Contributory fit', quadrant: 'opportunity',
    achievingStylesSet: 'relational', achievingStyle: null,
    leverage: 4, gapFromDesired: 4, irreversibility: 2,
    evidenceType: 'inferred', asiScore: null, asiDesiredRange: null, gates: [],
    description: 'Purpose-linked initiatives are a natural Contributory fit — underutilized capacity today.' },

  // ── Threats (inferred consequences — §3: striped, fueled by the gaps) ─────
  { id: 'succession_risk', label: 'Succession risk', quadrant: 'threat',
    achievingStylesSet: 'relational', achievingStyle: null,
    leverage: 8, gapFromDesired: 8, irreversibility: 7,
    evidenceType: 'inferred', asiScore: null, asiDesiredRange: null, gates: [],
    description: 'Thin bench: the Vicarious gap means few internal candidates for critical roles — a governance risk boards scrutinize.' },
  { id: 'integration_risk', label: 'Post-integration drag', quadrant: 'threat',
    achievingStylesSet: 'relational', achievingStyle: null,
    leverage: 7, gapFromDesired: 7, irreversibility: 6,
    evidenceType: 'inferred', asiScore: null, asiDesiredRange: null, gates: [],
    description: 'Integration mechanics bottleneck on delegation — the Entrusting deficit makes leadership the constraint.' },
  { id: 'talent_flight', label: 'Talent flight', quadrant: 'threat',
    achievingStylesSet: null, achievingStyle: null,
    leverage: 6, gapFromDesired: 6, irreversibility: 5,
    evidenceType: 'inferred', asiScore: null, asiDesiredRange: null, gates: [],
    description: 'Relational-set weakness erodes retention of exactly the collaborative builders the strategy needs.' },
  { id: 'competitive_pressure', label: 'Competitive pressure', quadrant: 'threat',
    achievingStylesSet: null, achievingStyle: null,
    leverage: 5, gapFromDesired: 5, irreversibility: 4,
    evidenceType: 'inferred', asiScore: null, asiDesiredRange: null, gates: [],
    description: 'Rivals investing in the same growth lanes — pressure compounds while internal capacity stays gated.' },
];

// The one-or-two arrows carrying the central causal claim (§4 — keep sparse).
export const REFERENCE_ARROWS = [
  { from: 'vicarious_gap', to: 'entrusting_gap', kind: 'gates', label: 'gates' },
  { from: 'entrusting_gap', to: 'collaborative_gap', kind: 'gates', label: 'gates' },
  { from: 'vicarious_gap', to: 'succession_risk', kind: 'downstream', label: '' },
];

export const REFERENCE_META = {
  title: 'Strategic SWOT — Connective Leadership',
  subtitle: 'Reference profile · Materiality-Bubble method',
  respondents: null,
  instrument: 'ASI',
};

// Recommendations for the demo report, ranked by the materiality they address.
export const REFERENCE_RECOMMENDATIONS = [
  { title: 'Targeted leadership development in the Relational set',
    owner: 'CHRO + CEO sponsorship',
    mechanism: 'Cohort program for senior leaders: Vicarious + Entrusting skill labs',
    measure: 'Relational-set mean +0.4 within 12 months',
    linkage: 'Reduces succession risk; unblocks delegated execution velocity',
    addresses: ['vicarious_gap', 'entrusting_gap'] },
  { title: 'Cross-unit rotation program',
    owner: 'Division leaders',
    mechanism: 'Rotations for high-potentials across units',
    measure: 'Collaborative mean +0.6; cross-unit project completion +20%',
    linkage: 'Builds the cross-pollination collaborative growth lanes need',
    addresses: ['collaborative_gap', 'integration_risk'] },
  { title: 'Succession planning anchored to Vicarious development',
    owner: 'Board talent committee',
    mechanism: 'Tie a share of senior incentives to documented successor readiness scored on Vicarious behaviors',
    measure: 'Two internal candidates per critical role within 18 months',
    linkage: 'Eliminates single-point-of-failure governance risk',
    addresses: ['succession_risk', 'vicarious_gap'] },
];
