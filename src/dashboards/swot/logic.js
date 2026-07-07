// SWOT Materiality-Bubble — scoring, classification and ingestion logic.
// Spec: CLI_SWOT_Dashboard_Spec (July 4, 2026) §2.1, §6, §7, §11.
// Pure functions — unit-tested against the §6.1 reference acceptance test.

// §2.1 — materiality is a weighted composite of three 0–10 sub-factors.
export const MATERIALITY_WEIGHTS = { leverage: 0.45, gapFromDesired: 0.35, irreversibility: 0.20 };

export function computeMateriality({ leverage, gapFromDesired, irreversibility }) {
  return (leverage * MATERIALITY_WEIGHTS.leverage)
       + (gapFromDesired * MATERIALITY_WEIGHTS.gapFromDesired)
       + (irreversibility * MATERIALITY_WEIGHTS.irreversibility);
}

// Area (not radius) proportional to materiality.
export function computeRadius(materiality, maxMateriality, maxRadius) {
  if (!maxMateriality || materiality <= 0) return 0;
  return maxRadius * Math.sqrt(materiality / maxMateriality);
}

// §2.3 — solid = a real ASI score backs the factor; stripe = inferred reading.
export function classifyEvidence(factor) {
  if (factor.evidenceType) return factor.evidenceType;
  return factor.asiScore != null ? 'firm' : 'inferred';
}

// Distance outside the desired range, in raw score points. Over-reliance
// (above the range) is a liability just like under-use (§2.1).
export function gapPoints(score, [lo, hi]) {
  if (score < lo) return score - lo;   // negative = under
  if (score > hi) return score - hi;   // positive = over
  return 0;
}

// Map a raw-point gap onto the spec's 0–10 gapFromDesired scale.
// Calibration: 2.5 score-points outside the desired range saturates at 10
// (the reference profile's worst gap, Vicarious −1.89, lands at ~7.6).
export function gapTo10(points) {
  return Math.min(10, (Math.abs(points) / 2.5) * 10);
}

/**
 * Ingestion (§11): raw style scores + a per-profile config → SwotFactor[].
 *
 * scores: { Vicarious: 3.11, Entrusting: 3.43, ... }  (raw 1–7/1–10 space)
 * config: {
 *   styles: { Vicarious: { set, desired:[lo,hi], leverage, irreversibility,
 *                          gates?:[], strengthWhenInRange?, description? }, ... },
 *   inferred: [ { id, label, quadrant, leverage, gapFromDesired, irreversibility,
 *                 gates?:[], activatedBy?:[styleIds], description? }, ... ],
 *   arrows: [ { from, to, kind:'gates'|'downstream', label } ],
 * }
 *
 * Classification rules (validated by §6.1):
 *   |gap| ≤ 0.25 pts → in range: strength when strengthWhenInRange (default:
 *     Direct-set styles), otherwise neutral (omitted from the chart).
 *   out of range (either direction) → weakness, sized by the gap.
 * Inferred items join when activatedBy is empty or any listed style ended up
 * a weakness (the threats lose their fuel when the measured root is fixed, §3).
 */
export function buildSwotFactors(scores, config) {
  const factors = [];
  const weakStyleIds = new Set();

  for (const [style, cfg] of Object.entries(config.styles || {})) {
    const score = scores?.[style];
    if (score == null || !cfg?.desired) continue;

    const pts = gapPoints(score, cfg.desired);
    const id = `${style.toLowerCase()}_${pts === 0 ? 'fit' : 'gap'}`;
    const inRange = Math.abs(pts) <= 0.25;

    let quadrant = null;
    if (!inRange) {
      quadrant = 'weakness';
    } else if (cfg.strengthWhenInRange ?? cfg.set === 'direct') {
      quadrant = 'strength';
    }
    if (!quadrant) continue; // neutral — not drawn

    if (quadrant === 'weakness') weakStyleIds.add(style);

    factors.push({
      id,
      label: style,
      quadrant,
      achievingStylesSet: cfg.set ?? null,
      achievingStyle: style,
      leverage: cfg.leverage ?? 5,
      gapFromDesired: quadrant === 'weakness' ? gapTo10(pts) : Math.max(0.5, gapTo10(pts)),
      irreversibility: cfg.irreversibility ?? 5,
      evidenceType: 'firm',
      asiScore: score,
      asiDesiredRange: cfg.desired,
      gates: cfg.gates ?? [],
      overReliance: pts > 0.25,
      description: cfg.description
        ?? `${style} ${score.toFixed(2)} vs desired ${cfg.desired[0]}–${cfg.desired[1]}`
           + (pts !== 0 ? ` (${pts > 0 ? 'over-reliance +' : ''}${pts.toFixed(2)})` : ' (in range)'),
    });
  }

  for (const inf of config.inferred || []) {
    const active = !inf.activatedBy?.length
      || inf.activatedBy.some((s) => weakStyleIds.has(s));
    if (!active) continue;
    factors.push({
      achievingStylesSet: null,
      gates: [],
      ...inf,
      evidenceType: 'inferred',
      asiScore: null,
      asiDesiredRange: null,
    });
  }

  return factors;
}

// Annotate factors with materiality and normalized radius; sort desc so the
// biggest story leads everywhere (chart z-order, report ranking, summaries).
export function rankFactors(factors, maxRadius = 64) {
  const withM = factors.map((f) => ({ ...f, materiality: computeMateriality(f) }));
  const maxM = Math.max(...withM.map((f) => f.materiality), 0.001);
  withM.sort((a, b) => b.materiality - a.materiality);
  return withM.map((f) => ({ ...f, radius: computeRadius(f.materiality, maxM, maxRadius) }));
}

// One-paragraph executive summary from the highest-materiality items (§8.1).
export function buildExecSummary(rankedFactors) {
  const firmWeak = rankedFactors.filter((f) => f.quadrant === 'weakness' && classifyEvidence(f) === 'firm');
  const inferredThreats = rankedFactors.filter((f) => f.quadrant === 'threat' && classifyEvidence(f) === 'inferred');
  const strengths = rankedFactors.filter((f) => f.quadrant === 'strength');

  const parts = [];
  if (strengths.length) {
    parts.push(`The profile's measured strengths are ${strengths.slice(0, 3).map((f) => f.label).join(', ')}.`);
  }
  if (firmWeak.length) {
    const top = firmWeak.slice(0, 2)
      .map((f) => `${f.label}${f.asiScore != null ? ` ${f.asiScore.toFixed(2)}` : ''}`);
    parts.push(`The firm findings are the ${top.join(' and ')} deficits — the highest-materiality measured factors in this read.`);
  }
  if (inferredThreats.length) {
    parts.push(`Nearly every threat (${inferredThreats.slice(0, 3).map((f) => f.label).join('; ')}) is an inferred consequence of those measured gaps: fix the measured root and the inferred risks lose their fuel.`);
  }
  return parts.join(' ');
}

// §10 — the standing caveat that must ship with every output.
export const STANDING_CAVEAT =
  'Reading this chart: bubble SIZE encodes strategic materiality (how much the factor moves the '
  + 'strategy) — NOT goodness. In an ASI read, a big bubble often means a bigger problem or '
  + 'imbalance. FILL encodes confidence: solid = a firm ASI score, striped = an inferred reading '
  + '(a high-stakes hypothesis when large) — not consequence.';
