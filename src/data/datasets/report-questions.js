// Report question bank + button sayings (ported from v1.24L App.jsx 806–912).
// Each bank entry is matched IN ORDER against the lowercased
// "<tactic title> <deliverable>" key via substring includes — order matters
// (e.g. "hiring" must match before the 'ir' keyword of the investor entry).

export const REPORT_QUESTION_BANK = [
  {
    keywords: ['cost', 'reduction', 'spend'],
    questions: [
      { question: 'Which cost area is the primary target?', choices: ['Headcount & compensation (salaries, benefits)', 'Vendor & software contracts (SaaS, services)', 'Marketing & paid acquisition spend', 'Operations, facilities & overhead'] },
      { question: 'What headcount reduction are you targeting?', choices: ['1-3% -- trim waste, minimal disruption', '3-5% -- meaningful cut, some restructuring', '5-10% -- significant program, real workforce impact', '10%+ -- major restructuring or transformation'] },
      { question: 'Who are your closest competitors for benchmarking?', choices: ["Moody's & Verisk Analytics", 'Bloomberg & Refinitiv (LSEG)', 'FactSet & MSCI', 'No direct competitor -- internal benchmark only'] },
    ],
  },
  {
    keywords: ['churn', 'retention', 'attrition'],
    questions: [
      { question: 'What is your current annual churn rate?', choices: ['Under 5% -- low but want to improve', '5-10% -- industry average, needs attention', '10-20% -- elevated, hurting growth', 'Over 20% -- critical, retention crisis'] },
      { question: 'When do most customers churn?', choices: ['Within first 90 days -- onboarding failure', 'At first renewal -- value not proven', 'After 1-2 years -- competitive switch', 'No clear pattern -- spread across lifecycle'] },
      { question: 'Who are customers switching to?', choices: ["Moody's Analytics", 'Bloomberg Terminal', 'FactSet / Refinitiv', 'Multiple competitors -- no dominant alternative'] },
    ],
  },
  {
    keywords: ['hiring', 'onboard', 'recruit'],
    questions: [
      { question: 'What is your current average time-to-hire?', choices: ['Under 3 weeks -- fast, but quality may suffer', '3-6 weeks -- acceptable, some friction', '6-12 weeks -- slow, losing candidates to competitors', 'Over 12 weeks -- broken process, needs full overhaul'] },
      { question: 'What is your 12-month new hire retention rate?', choices: ['Over 90% -- strong onboarding', '75-90% -- acceptable but improvable', '60-75% -- significant early attrition risk', 'Under 60% -- onboarding is clearly failing'] },
      { question: 'How does your comp package compare to market?', choices: ['10%+ above market -- strong attractor', 'Roughly at market -- competitive but not a differentiator', '5-10% below market -- losing offers at final stage', '10%+ below market -- serious talent pipeline risk'] },
    ],
  },
  {
    keywords: ['billing', 'annual', 'pricing'],
    questions: [
      { question: 'What annual plan discount are you willing to offer?', choices: ['5-10% -- minimal, value-led pitch', '10-15% -- standard industry offer', '15-20% -- aggressive, high conversion expected', '20%+ -- deep discount, protect margin carefully'] },
      { question: 'What % of your revenue is currently on monthly plans?', choices: ['Under 20% -- mostly annual already', '20-40% -- meaningful conversion opportunity', '40-60% -- majority still monthly', 'Over 60% -- revenue highly exposed to monthly churn'] },
      { question: 'Who owns the annual conversion campaign?', choices: ['Sales -- direct outreach to each account', 'Customer success -- relationship-led conversion', 'Marketing -- automated email or in-app campaign', 'No clear owner yet -- needs assignment first'] },
    ],
  },
  {
    keywords: ['inventory', 'supply', 'sku'],
    questions: [
      { question: 'What are your current inventory days on hand?', choices: ['Under 30 days -- lean, at risk of stockouts', '30-60 days -- healthy range', '60-90 days -- elevated, cash tied up', 'Over 90 days -- excess inventory is the problem'] },
      { question: 'What % of SKUs drive 80% of your revenue?', choices: ['Top 10% of SKUs -- highly concentrated', 'Top 20-30% of SKUs -- moderately concentrated', 'Top 40-50% -- fairly distributed', 'No clear data -- need to baseline first'] },
      { question: 'What is your target reduction in inventory days?', choices: ['Reduce by 10-15 days -- modest improvement', 'Reduce by 15-30 days -- meaningful program', 'Reduce by 30+ days -- major supply chain overhaul', 'Not sure -- need to set baseline first'] },
    ],
  },
  {
    keywords: ['integration', 'merger', 'acquisition'],
    questions: [
      { question: 'How far into the integration are you?', choices: ['Day 0-30 -- just closed, still in planning', 'Month 1-3 -- early execution underway', 'Month 3-6 -- mid-integration, issues surfacing', 'Month 6+ -- running behind schedule or stalled'] },
      { question: 'What is the combined headcount?', choices: ['Under 500 people', '500-2,000 people', '2,000-10,000 people', 'Over 10,000 people'] },
      { question: 'What does 90-day success look like?', choices: ['No key talent lost from either side', 'Core systems mapped and migration started', 'Zero customer disruption or churn spike', 'Leadership team unified and operating together'] },
    ],
  },
  {
    keywords: ['investor', 'ir', 'board', 'presentation'],
    questions: [
      { question: 'What is the core message of this presentation?', choices: ['We are on track -- execution confidence', 'We have a risk -- here is the mitigation plan', 'New strategic opportunity or pivot', 'Request for capital, approval, or additional resources'] },
      { question: 'How would you describe the audience right now?', choices: ['Fully supportive -- maintain confidence', 'Cautiously supportive -- address open concerns', 'Skeptical -- need to win them over with data', 'Mixed -- board factions with different priorities'] },
      { question: 'How much time do you have to present?', choices: ['Under 15 minutes -- headline only, tight', '15-30 minutes -- standard board slot', '30-60 minutes -- full presentation with Q&A', '60+ minutes -- deep-dive working session'] },
    ],
  },
  {
    keywords: ['training', 'curriculum', 'development'],
    questions: [
      { question: 'How many people are in the target learner group?', choices: ['Under 25 -- intimate cohort possible', '25-100 -- workshop scale', '100-500 -- structured program needed', 'Over 500 -- enterprise L&D infrastructure required'] },
      { question: 'What is your per-person training budget?', choices: ['Under $500 -- self-paced or internal only', '$500-$2,000 -- facilitated workshop range', '$2,000-$5,000 -- coaching or cohort program', 'Over $5,000 -- high-investment executive development'] },
      { question: 'What is your target behavior change timeline?', choices: ['30 days -- urgent, simple habit shift', '60-90 days -- moderate skill or process change', '6 months -- deep skill or mindset development', '12+ months -- culture or leadership transformation'] },
    ],
  },
  {
    keywords: ['culture', 'engagement', 'survey'],
    questions: [
      { question: 'What is your current employee engagement score?', choices: ['Over 75% favorable -- strong, want to sustain it', '60-75% favorable -- average, room to improve', '45-60% favorable -- below average, needs real action', 'Under 45% favorable -- critical, urgent intervention'] },
      { question: 'What is your voluntary turnover rate?', choices: ['Under 8% annually -- healthy retention', '8-15% annually -- manageable but watch closely', '15-25% annually -- elevated, costing revenue and culture', 'Over 25% annually -- retention crisis, bleeding talent'] },
      { question: 'How quickly do you need to show measurable improvement?', choices: ['30 days -- leadership demanding results now', '90 days -- show progress this quarter', '6 months -- sustained improvement program', '12+ months -- long-term culture transformation'] },
    ],
  },
  {
    keywords: ['conflict', 'co-worker', 'coworker', 'interpersonal', 'resolution'],
    questions: [
      { question: 'What is the primary driver of conflict?', choices: ['Age & generational differences in work style', 'Experience gaps — senior vs. junior friction', 'Opinion & values clashes on direction or priorities', 'Personality or communication style mismatches'] },
      { question: 'How widespread is the conflict?', choices: ['Two individuals -- targeted mediation needed', 'A team or unit -- facilitated intervention', 'Cross-department -- structural or process issue', 'Organization-wide -- culture and leadership issue'] },
      { question: 'What outcome does leadership want?', choices: ['Formal resolution -- documented, HR-involved', 'Behavioral change -- coaching and accountability', 'Team reset -- new norms and working agreements', 'Leadership model shift -- longer-term culture work'] },
    ],
  },
];

export const DEFAULT_REPORT_QUESTIONS = [
  { question: 'What is the scale of this initiative?', choices: ['Single team or department', 'Multiple departments or a business unit', 'Company-wide rollout', 'Cross-company or external-facing'] },
  { question: 'What is your timeline to first measurable results?', choices: ['30 days -- need quick wins now', '60-90 days -- standard execution cycle', '6 months -- structured strategic program', '12+ months -- transformation initiative'] },
  { question: 'What is the budget range for this initiative?', choices: ['Under $100K -- lean execution', '$100K-$500K -- meaningful investment', '$500K-$2M -- significant program', 'Over $2M -- major strategic investment'] },
];

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
