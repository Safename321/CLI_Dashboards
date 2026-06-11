// OASI score datasets (ported from legacy App.jsx lines ~123-151, 5834-5842, 6029-6039).
// All scores are on the OASI 1-7 scale.

// Organization OASI Scores (what the org actually values/rewards)
export const ORG_OASI_SCORES = {
  intrinsic: 4.6, competitive: 5.4, power: 5.0,
  personal: 4.0, social: 3.6, entrusting: 3.4,
  collaborative: 3.8, contributory: 3.2, vicarious: 3.0,
};

// Ideal OASI Scores for S&P Global (target state aligned with corporate goals)
export const IDEAL_OASI_SCORES = {
  intrinsic: 4.0, competitive: 3.2, power: 3.0,
  personal: 3.8, social: 4.6, entrusting: 5.0,
  collaborative: 5.2, contributory: 4.8, vicarious: 4.8,
};

// 3-Year quarterly financial projections based on the OASI transformation
export const OASI_FINANCIAL_PROJECTIONS = [
  { quarter: 'Q1 26', revenue: 4.02, costs: 2.05, synergies: 15, opIncome: 1.99, netIncome: 1.30, opMargin: 49.5, oasiAlignment: 59, turnover: 7.4, eNPS: 32 },
  { quarter: 'Q2 26', revenue: 4.08, costs: 2.06, synergies: 28, opIncome: 2.05, netIncome: 1.34, opMargin: 50.2, oasiAlignment: 62, turnover: 7.2, eNPS: 35 },
  { quarter: 'Q3 26', revenue: 4.15, costs: 2.08, synergies: 42, opIncome: 2.11, netIncome: 1.38, opMargin: 50.8, oasiAlignment: 65, turnover: 6.9, eNPS: 38 },
  { quarter: 'Q4 26', revenue: 4.25, costs: 2.10, synergies: 58, opIncome: 2.19, netIncome: 1.43, opMargin: 51.5, oasiAlignment: 68, turnover: 6.6, eNPS: 42 },
  { quarter: 'Q1 27', revenue: 4.35, costs: 2.12, synergies: 75, opIncome: 2.30, netIncome: 1.50, opMargin: 52.9, oasiAlignment: 72, turnover: 6.2, eNPS: 47 },
  { quarter: 'Q2 27', revenue: 4.45, costs: 2.13, synergies: 95, opIncome: 2.41, netIncome: 1.57, opMargin: 54.2, oasiAlignment: 76, turnover: 5.8, eNPS: 52 },
  { quarter: 'Q3 27', revenue: 4.58, costs: 2.15, synergies: 118, opIncome: 2.54, netIncome: 1.66, opMargin: 55.5, oasiAlignment: 80, turnover: 5.4, eNPS: 58 },
  { quarter: 'Q4 27', revenue: 4.72, costs: 2.18, synergies: 142, opIncome: 2.68, netIncome: 1.75, opMargin: 56.8, oasiAlignment: 84, turnover: 5.0, eNPS: 64 },
  { quarter: 'Q1 28', revenue: 4.82, costs: 2.18, synergies: 168, opIncome: 2.81, netIncome: 1.83, opMargin: 58.3, oasiAlignment: 87, turnover: 4.7, eNPS: 68 },
  { quarter: 'Q2 28', revenue: 4.92, costs: 2.20, synergies: 196, opIncome: 2.92, netIncome: 1.90, opMargin: 59.3, oasiAlignment: 89, turnover: 4.5, eNPS: 72 },
  { quarter: 'Q3 28', revenue: 5.02, costs: 2.22, synergies: 225, opIncome: 3.02, netIncome: 1.97, opMargin: 60.2, oasiAlignment: 91, turnover: 4.3, eNPS: 75 },
  { quarter: 'Q4 28', revenue: 5.12, costs: 2.25, synergies: 255, opIncome: 3.12, netIncome: 2.03, opMargin: 60.9, oasiAlignment: 92, turnover: 4.2, eNPS: 78 },
];

// Stated values vs rewarded behaviors — expected score per stated priority
export const OASI_GAP_ANALYSIS = [
  { stated: 'Mentoring & Development', style: 'Vicarious', key: 'vicarious', expected: 4.8 },
  { stated: 'Team Collaboration', style: 'Collaborative', key: 'collaborative', expected: 4.8 },
  { stated: 'Employee Empowerment', style: 'Entrusting', key: 'entrusting', expected: 4.8 },
  { stated: 'Behind-Scenes Support', style: 'Contributory', key: 'contributory', expected: 4.6 },
  { stated: 'Partnership Building', style: 'Social', key: 'social', expected: 4.4 },
  { stated: 'Excellence Standards', style: 'Intrinsic', key: 'intrinsic', expected: 4.2 },
  { stated: 'Results Orientation', style: 'Competitive', key: 'competitive', expected: 3.6 },
];

// 7 key findings for the CEO (severity drives the card color)
const s = ORG_OASI_SCORES;
export const OASI_KEY_FINDINGS = [
  { severity: 'red', title: '1. Mentoring stated but not rewarded', text: `Vicarious (${s.vicarious}) critically low despite coaching investments. Mentors aren't promoted for it.` },
  { severity: 'red', title: '2. Collaboration rhetoric vs competition reality', text: `Competitive (${s.competitive}) dominates while Collaborative (${s.collaborative}) trails. Culture rewards individual wins.` },
  { severity: 'amber', title: '3. Empowerment gap', text: `Entrusting (${s.entrusting}) undervalued. Leaders maintain control (Power: ${s.power}) instead of delegating.` },
  { severity: 'amber', title: '4. Behind-the-scenes contributors overlooked', text: `Contributory (${s.contributory}) low. Helpers who don't seek credit are invisible to rewards.` },
  { severity: 'amber', title: '5. Networking underutilized', text: `Social (${s.social}) below mean despite partnership emphasis. Cross-functional work not valued in promotions.` },
  { severity: 'emerald', title: '6. Excellence focus is healthy ✓', text: `Intrinsic (${s.intrinsic}) aligns with stated excellence standards. Training investments working.` },
  { severity: 'red', title: '7. Power concentration risk', text: `High Power (${s.power}) + Low Entrusting (${s.entrusting}) = micromanagement culture. Explains flat voluntary turnover.` },
];

// Aspirational dashboard — 9 achieving styles gap analysis (set label + priority)
export const OASI_STYLE_COMPARISON = [
  { style: 'Collaborative', key: 'collaborative', set: 'Relational • Joins Forces', priority: 'critical' },
  { style: 'Vicarious', key: 'vicarious', set: 'Relational • Mentors', priority: 'critical' },
  { style: 'Entrusting', key: 'entrusting', set: 'Instrumental • Empowers', priority: 'critical' },
  { style: 'Contributory', key: 'contributory', set: 'Relational • Helps', priority: 'high' },
  { style: 'Social', key: 'social', set: 'Instrumental • Networks', priority: 'medium' },
  { style: 'Intrinsic', key: 'intrinsic', set: 'Direct • Excels', priority: 'aligned' },
  { style: 'Personal', key: 'personal', set: 'Instrumental • Persuades', priority: 'aligned' },
  { style: 'Competitive', key: 'competitive', set: 'Direct • Outperforms', priority: 'reduce' },
  { style: 'Power', key: 'power', set: 'Direct • Takes Charge', priority: 'reduce' },
];

// Instrument-data provenance shown in the OASI statistical summary panel
export const OASI_INSTRUMENT_DATA = [
  { label: 'Participants (N)', value: '847' },
  { label: 'Assessments', value: 'OASI v3.2' },
  { label: 'Collection Period', value: 'Q3–Q4 2025' },
  { label: 'Response Rate', value: '91%' },
  { label: 'Cronbach α', value: '0.87' },
  { label: 'Inter-rater r²', value: '0.74' },
  { label: 'Test-retest r', value: '0.81 (6-mo)' },
];
