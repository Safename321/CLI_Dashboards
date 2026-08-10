// SWOT strategic analysis generator — turns the ranked factor set into a
// structured, bullet-ready reading: a per-vector breakdown, the most effective
// strategies for the current competitive position (TOWS), best practices,
// general managerial advice, and an expected-results timeline on every move.
// Pure function (like buildExecSummary) so the on-page analysis and any export
// share one source — build once, reuse (§4.2).
import { classifyEvidence } from './logic.js';

// Expected time-to-result band for a factor. Structural / relational change
// compounds slowly; tactical fixes land in weeks. Derived from the same inputs
// the chart uses (irreversibility + gap), so the timeline tracks the bubbles
// rather than being guessed independently.
export function horizonFor(factor) {
  const irr = Number(factor.irreversibility ?? 5);
  const gap = Math.abs(Number(factor.gapFromDesired ?? 5));
  const relational = factor.achievingStylesSet === 'relational';
  const score = irr * 0.6 + gap * 0.4 + (relational ? 1 : 0);
  if (score >= 7)   return { band: 'Structural',    eta: '2–4 quarters (6–12 months)', note: 'compounds slowly — protect the runway' };
  if (score >= 4.5) return { band: 'Developmental',  eta: '1–2 quarters (3–6 months)',  note: 'visible movement within two review cycles' };
  return { band: 'Tactical', eta: '4–8 weeks', note: 'fast feedback — use it as an early win' };
}

// Quadrant-aware reading for a single factor: what it means and the best-practice
// play, phrased from the factor's own data (set, gap, over-reliance, evidence).
function readVector(f) {
  const inferred = classifyEvidence(f) === 'inferred';
  const set = f.achievingStylesSet;
  const gapTxt = f.asiScore != null && f.asiDesiredRange
    ? `measured ${f.asiScore.toFixed(2)} vs desired ${f.asiDesiredRange[0]}–${f.asiDesiredRange[1]}`
    : 'inferred reading — no direct score';

  let implication;
  let bestPractice;
  switch (f.quadrant) {
    case 'strength':
      implication = `A firm asset in the ${set || 'measured'} set. The failure mode with strengths is over-trust — deploy it as the vehicle for fixing the weaknesses it can reach, don't just admire it.`;
      bestPractice = `Codify what produces ${f.label} so it's repeatable (playbook, mentoring, a hiring signal), then point it at the hardest adjacent gap.`;
      break;
    case 'weakness':
      if (f.overReliance) {
        implication = `Over-reliance: ${f.label} sits ABOVE its desired band and crowds out the balancing styles, so more of it makes the imbalance worse.`;
        bestPractice = `Dial it back, don't amplify — rebalance incentives and decision rights toward the complementary styles rather than rewarding more ${f.label}.`;
      } else {
        implication = `A measured deficit and, at this materiality, a root cause: several inferred threats trace back to it. Fix the root and the symptoms lose their fuel.`;
        bestPractice = set === 'relational'
          ? `Relational gaps close through reps, not memos — paired delegation, structured skip-levels, and successor shadowing that force the ${f.label} behaviour.`
          : `Targeted skill labs plus explicit expectation-setting on ${f.label}; measure the behaviour, not the intention.`;
      }
      break;
    case 'opportunity':
      implication = `Inferred upside that opens once the enabling weakness moves. Sequence it AFTER the root fix — chasing it early spends effort against a closed gate.`;
      bestPractice = `Pre-position now: name an owner and define the win, so you can move the moment the gate clears.`;
      break;
    case 'threat':
    default:
      implication = `An inferred consequence of the measured gaps, not an independent event — it de-escalates when the root weakness is addressed.`;
      bestPractice = `Track one leading indicator and pre-empt; don't over-invest in the symptom while its root is still open.`;
      break;
  }
  return { inferred, gapTxt, implication, bestPractice, horizon: horizonFor(f) };
}

// The four TOWS plays — the actual "most effective strategies from this
// competitive position", built by pairing the live top factors of each quadrant.
function towsStrategies(ranked) {
  const pick = (q) => ranked.filter((f) => f.quadrant === q);
  const S = pick('strength');
  const W = pick('weakness');
  const O = pick('opportunity');
  const T = pick('threat');
  const names = (a, n = 2) => a.slice(0, n).map((f) => f.label).join(' + ') || '—';
  const out = [];

  if (W.length && T.length) out.push({
    key: 'WT', label: 'Mitigate — Weakness × Threat', urgency: 'Most urgent · defend',
    play: `${names(W)} is fuelling ${names(T)}. This is the danger quadrant: closing the measured gap defuses the threat at its source. Do this before chasing any upside.`,
    horizon: '2–4 quarters',
  });
  if (S.length && O.length) out.push({
    key: 'SO', label: 'Leverage — Strength → Opportunity', urgency: 'Highest ROI · grow',
    play: `Point ${names(S)} at ${names(O)}: your firmest assets are the cheapest way to capture the inferred upside — lowest risk, so fund it first among the growth moves.`,
    horizon: '1–2 quarters',
  });
  if (W.length && O.length) out.push({
    key: 'WO', label: 'Build — Weakness → Opportunity', urgency: 'Fix-to-unlock',
    play: `${names(O)} is gated behind ${names(W)}. Treat the weakness fix as the enabling investment for the opportunity, not a separate line item.`,
    horizon: '2–3 quarters',
  });
  if (S.length && T.length) out.push({
    key: 'ST', label: 'Defend — Strength → Threat', urgency: 'Hold the line',
    play: `Use ${names(S)} as the near-term shield against ${names(T)} while the root fix matures — buys time without new investment.`,
    horizon: '4–8 weeks',
  });
  return out;
}

function bestPractices(ranked) {
  const topWeak = ranked.find((f) => f.quadrant === 'weakness');
  const relationalWeak = ranked.some((f) => f.quadrant === 'weakness' && f.achievingStylesSet === 'relational');
  const bp = [
    `Fix measured roots before inferred symptoms. Solid bubbles are real; striped ones are hypotheses that dissolve when the root is fixed — spend on the solids first${topWeak ? `, starting with ${topWeak.label}` : ''}.`,
    'Sequence by materiality, not by noise. Work the biggest bubbles top-down; a small striped bubble is rarely worth a program.',
    'Pair every intervention with a leading measure. Name the behaviour you expect to change and the metric that proves it, before you launch.',
    'Protect strengths from over-trust. The most common failure is amplifying what already works while the balancing style starves.',
  ];
  if (relationalWeak) bp.push('Relational gaps need reps, not slides. Delegation, skip-levels, and successor shadowing move Vicarious / Entrusting / Collaborative; classroom training alone does not.');
  return bp;
}

function managerialAdvice(ranked) {
  const weakSets = [...new Set(ranked.filter((f) => f.quadrant === 'weakness').map((f) => f.achievingStylesSet).filter(Boolean))];
  const adv = [
    'Run the portfolio as a sequence, not a list: one root fix, one enabling opportunity, one defensive hold at a time — over-parallelising dilutes the relational work that needs sustained attention.',
    'Assign a single accountable owner per top-materiality factor; diffuse ownership is why measured gaps survive across review cycles.',
    'Review on the cadence the horizon implies — tactical items weekly, developmental monthly, structural quarterly. Judging structural change on a monthly cadence produces false negatives and premature pivots.',
  ];
  if (weakSets.length) adv.push(`Your live gaps concentrate in the ${weakSets.join(' and ')} set${weakSets.length > 1 ? 's' : ''} — weight manager selection, incentives, and development spend there rather than spreading evenly across all nine styles.`);
  adv.push('Expect a J-curve: relational and structural moves often dip before they rise as delegation is learned. Pre-commit to the timeline so the board reads the dip as investment, not failure.');
  return adv;
}

/**
 * buildSwotAnalysis(ranked, recommendations) → structured analysis object.
 * `ranked` is the output of rankFactors (materiality desc). Everything is
 * derived from the live factors, so the analysis is tenant-real, not canned.
 */
export function buildSwotAnalysis(ranked = [], recommendations = []) {
  const byQuad = (q) => ranked.filter((f) => f.quadrant === q).map((f) => ({ factor: f, ...readVector(f) }));
  const vectors = {
    strength: byQuad('strength'),
    weakness: byQuad('weakness'),
    opportunity: byQuad('opportunity'),
    threat: byQuad('threat'),
  };

  const byId = Object.fromEntries(ranked.map((f) => [f.id, f]));
  const recs = recommendations.map((r) => {
    const addressed = (r.addresses ?? []).map((id) => byId[id]).filter(Boolean);
    const worst = [...addressed].sort((a, b) => (b.irreversibility ?? 0) - (a.irreversibility ?? 0))[0];
    return {
      ...r,
      addressedLabels: addressed.map((f) => f.label),
      horizon: worst ? horizonFor(worst) : { band: 'Developmental', eta: '1–2 quarters (3–6 months)', note: '' },
    };
  });

  return {
    vectors,
    tows: towsStrategies(ranked),
    bestPractices: bestPractices(ranked),
    managerial: managerialAdvice(ranked),
    recommendations: recs,
    counts: {
      strength: vectors.strength.length,
      weakness: vectors.weakness.length,
      opportunity: vectors.opportunity.length,
      threat: vectors.threat.length,
    },
  };
}
