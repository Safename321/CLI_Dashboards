// Advisory-report prose: competitor benchmarks, situation analyses and the
// three implementation options per topic (v1.24L App.jsx 1164–1298).
// Playbooks are template functions over a ctx object:
//   { a0, a1, a2, strategy, compLabel, compMargin, revenueGrowth, prevRevenueGrowth }
// They return generated-document HTML fragments (not app UI).

export const COMPETITOR_BENCHMARKS = {
  'Moodys & Verisk Analytics':    { opMargin: 38, adjMargin: 44, revenueGrowth: 9.2,  label: 'MCO / VRSK' },
  'Bloomberg & Refinitiv (LSEG)': { opMargin: 29, adjMargin: 36, revenueGrowth: 7.8,  label: 'LSEG / Bloomberg' },
  'FactSet & MSCI':               { opMargin: 35, adjMargin: 42, revenueGrowth: 11.4, label: 'FactSet / MSCI' },
  'Moodys Analytics':             { opMargin: 38, adjMargin: 44, revenueGrowth: 9.2,  label: "Moody's (MCO)" },
  'Bloomberg Terminal':           { opMargin: 29, adjMargin: 36, revenueGrowth: 7.8,  label: 'Bloomberg' },
  'FactSet / Refinitiv':          { opMargin: 35, adjMargin: 42, revenueGrowth: 11.4, label: 'FactSet/Refinitiv' },
  'No direct competitor':         null,
};

export const ADVISORY_PLAYBOOKS = [
  {
    keywords: ['cost', 'reduction', 'spend'],
    situation: (ctx) => 'The focus area -- ' + (ctx.a0 || 'operating costs') + ' -- is a reasonable starting point. When revenue growth decelerates (from ' + ctx.prevRevenueGrowth + '% to ' + ctx.revenueGrowth + '%), the temptation is to compensate through cost cutting. That works short-term and destroys value long-term if the cuts land in the wrong places. The organizations that cut well are ruthlessly clear about what drives margin and what is just legacy spend nobody has questioned in years.',
    options: (ctx) =>
      '<h3>Option A -- Zero-Based Budgeting Review (High rigor, 60-90 days)</h3>' +
      '<p>Reset every cost line to zero and require owners to justify it from scratch. This is uncomfortable but surfaces spending that has survived purely on inertia. Best suited for vendor contracts, software subscriptions, and overhead. Not recommended for headcount or customer-facing functions without a separate people strategy in place first.</p>' +
      '<h3>Option B -- Benchmark-Driven Targeting (Faster, 30 days)</h3>' +
      '<p>Use ' + ctx.compLabel + ' margin data (' + ctx.compMargin + '%) as your target ceiling and work backwards to identify which cost lines need to move. This is faster and easier to communicate to leadership, but risks cutting to a benchmark that does not reflect your actual business model. Use it to prioritize investigation -- not to set final targets.</p>' +
      '<h3>Option C -- Selective Efficiency Program (Least disruption)</h3>' +
      '<p>Identify the 3-5 highest-cost categories and run a focused efficiency review on each. Avoid a company-wide initiative -- those generate anxiety disproportionate to the savings. A focused program signals discipline without signaling crisis. This is usually the right starting point unless you are under pressure to show a specific number by a specific date.</p>',
  },
  {
    keywords: ['churn', 'retention'],
    situation: (ctx) => 'Churn in the ' + (ctx.a0 || 'at-risk customers') + ' segment is a solvable problem -- but only if the diagnosis is right. The most common mistake at this stage is launching a retention program before the root cause is confirmed. If customers are leaving because of product gaps, a discount will slow the bleed for one renewal cycle and then they leave anyway. If they are leaving because ' + (ctx.a2 || 'a competitor') + ' is offering a better price, product investment will not help. Get the diagnosis right first -- then act.',
    options: () =>
      '<h3>Option A -- Rapid Exit Interview Program (Diagnostic, Week 1-2)</h3>' +
      '<p>Call every churned customer in the last 90 days. Not an email survey -- a phone call from someone senior enough that the customer feels heard. The goal is not to win them back yet. It is to understand the real reason they left, which is almost always different from what they wrote in the cancellation form. Do at least 15 calls before drawing conclusions.</p>' +
      '<h3>Option B -- At-Risk Scoring Model (Systematic, 30 days)</h3>' +
      '<p>Build a scoring model using usage data, support ticket volume, NPS scores, and contract renewal dates to identify accounts showing early warning signs. Even a basic spreadsheet model will outperform gut instinct. The goal is to intervene 90 days before renewal -- not 30.</p>' +
      '<h3>Option C -- Tiered Retention Playbook (Scalable, 45 days)</h3>' +
      '<p>Create three distinct playbooks based on account value: high-touch executive QBR for top 20%, mid-touch CSM check-in for mid-tier, and automated health scoring for SMB. Most programs fail because they apply the same approach to every account -- high-value accounts end up under-served while low-value accounts are over-served.</p>',
  },
  {
    keywords: ['hiring', 'onboard'],
    situation: () => 'Hiring and onboarding problems usually present as one thing and turn out to be another. Slow time-to-hire is rarely a sourcing problem -- it is almost always a decision-making problem: too many interviewers, unclear criteria, or managers holding out for a perfect candidate that does not exist. Onboarding failure is rarely a content problem -- it is almost always a connection problem. New hires decide within 90 days whether they will give full discretionary effort. That decision is made on how they are treated, not what they are taught.',
    options: (ctx) =>
      '<h3>Option A -- Decision Acceleration (For slow hiring)</h3>' +
      '<p>Cap every interview loop at 4 people. Require a hiring decision within 48 hours of the final interview. Assign one person as the decision-maker -- not a committee. These three changes typically cut time-to-offer by 40%. The objection will be that you might make a bad hire -- the data shows longer processes do not produce better hires, they produce more anxious candidates who take competing offers.</p>' +
      '<h3>Option B -- 90-Day Onboarding Redesign (For onboarding failure)</h3>' +
      '<p>Restructure the first 90 days around three goals: role clarity by day 30, relationship depth by day 60, first meaningful contribution by day 90. Remove anything not connected to these goals. Add a peer buddy program -- one assigned connection outside the direct team. Measure retention at 6 months as your primary success metric, not module completion rates.</p>' +
      '<h3>Option C -- Compensation Benchmarking Review (If offer competitiveness is the issue)</h3>' +
      '<p>Your talent positioning: ' + (ctx.a2 || 'unknown vs market') + '. If you are losing candidates at the offer stage or losing new hires within the first year, commission a market analysis for your top 10 most-hired roles. A 10% pay increase across those roles almost always costs less than a 30% annual turnover rate in those same roles.</p>',
  },
  {
    keywords: ['integrat', 'merger'],
    situation: () => 'Integration is where strategy meets human behavior -- and human behavior almost always wins. The cultural and organizational friction points surface within the first 60 days: who has power, whose processes get adopted, who feels like a second-class citizen. These are not soft issues. They directly determine whether the financial thesis of the deal is ever realized.',
    options: () =>
      '<h3>Option A -- Culture Mapping Sprint (First 30 days)</h3>' +
      '<p>Before any process integration, run a structured culture mapping exercise with both leadership teams. Identify the 5-8 values or operating norms that are genuinely non-negotiable for each side, and the 5-8 that are negotiable. The list of non-negotiables is almost always shorter than people think -- and the overlap is almost always larger. Start with the overlap and build from there.</p>' +
      '<h3>Option B -- Systems Integration Roadmap (30-90 days)</h3>' +
      '<p>Scope every system that needs to be consolidated, migrated, or decommissioned. Assign a technical lead and a business lead to each workstream. Do not try to integrate everything at once -- prioritize by customer impact first, then operational efficiency, then internal preference. Build a risk register from day one.</p>' +
      '<h3>Option C -- Communication Architecture (Ongoing)</h3>' +
      '<p>Design a deliberate cadence of communication for the combined organization: weekly all-hands updates for the first 90 days, bi-weekly manager briefs, a direct channel for questions that get answered within 48 hours. The number one complaint in every integration is that people did not know what was happening. Over-communicate until the culture stabilizes, then normalize.</p>',
  },
];

export const DEFAULT_PLAYBOOK = {
  situation: (ctx) => 'The strategy outlined -- ' + ctx.strategy.substring(0, 150) + (ctx.strategy.length > 150 ? '...' : '') + ' -- is directionally sound. The gap between a good strategy and a good outcome is almost always execution. The organizations that consistently close that gap are the ones that spend as much time on implementation design as they do on strategy design.',
  options: () =>
    '<h3>Option A -- Fast-Start Sprint (30 days)</h3>' +
    '<p>Identify the single most impactful action and execute it fully before moving on. This builds momentum, demonstrates seriousness to the organization, and gives you real data to calibrate the rest of the plan. Narrow the front and go deep before going broad.</p>' +
    '<h3>Option B -- Parallel Workstreams (60-90 days)</h3>' +
    '<p>If you have the leadership bandwidth, run two or three workstreams simultaneously with clear owners, weekly check-ins, and explicit dependencies mapped. Invest in a weekly 30-minute integration meeting with a standing agenda and no slides. The most common failure mode is workstream leads who optimize for their own track at the expense of the overall initiative.</p>' +
    '<h3>Option C -- Phased Rollout (90-180 days)</h3>' +
    '<p>Design in three phases: pilot one team or region, learn with an explicit debrief and adjustment, then scale with the improved version. Any initiative that skips the pilot and goes straight to full rollout is betting the design is right the first time. It usually is not. Build the learning loop in from the start.</p>',
};
