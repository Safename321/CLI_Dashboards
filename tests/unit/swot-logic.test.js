// SWOT Materiality-Bubble — logic tests incl. the spec §6.1 acceptance test.
import { describe, it, expect } from 'vitest';
import {
  computeMateriality, computeRadius, classifyEvidence,
  gapPoints, gapTo10, buildSwotFactors, rankFactors, buildExecSummary,
  STANDING_CAVEAT,
} from '../../src/dashboards/swot/logic.js';
import {
  REFERENCE_FACTORS, DEFAULT_SWOT_CONFIG,
} from '../../src/data/datasets/swot.js';

describe('computeMateriality (§2.1)', () => {
  it('applies the 0.45 / 0.35 / 0.20 weights', () => {
    expect(computeMateriality({ leverage: 9, gapFromDesired: 8, irreversibility: 6 }))
      .toBeCloseTo(9 * 0.45 + 8 * 0.35 + 6 * 0.20, 10);
  });
  it('is 0 for an all-zero factor', () => {
    expect(computeMateriality({ leverage: 0, gapFromDesired: 0, irreversibility: 0 })).toBe(0);
  });
});

describe('computeRadius (§2.1 — area ∝ materiality)', () => {
  it('scales by sqrt so AREA is proportional', () => {
    const r1 = computeRadius(2, 8, 60);
    const r2 = computeRadius(8, 8, 60);
    // 4× materiality → 2× radius → 4× area
    expect(r2 / r1).toBeCloseTo(2, 10);
    expect(r2).toBe(60);
  });
  it('returns 0 when max is missing', () => {
    expect(computeRadius(5, 0, 60)).toBe(0);
  });
});

describe('gap helpers', () => {
  it('measures under- and over-range distance', () => {
    expect(gapPoints(3.11, [5.0, 6.5])).toBeCloseTo(-1.89, 10);
    expect(gapPoints(7.2, [5.0, 6.5])).toBeCloseTo(0.7, 10);   // over-reliance is a liability
    expect(gapPoints(5.4, [4.5, 5.5])).toBe(0);
  });
  it('maps 2.5 raw points to a saturated 10', () => {
    expect(gapTo10(-2.5)).toBe(10);
    expect(gapTo10(-1.25)).toBeCloseTo(5, 10);
    expect(gapTo10(5)).toBe(10);
  });
});

describe('classifyEvidence (§2.3)', () => {
  it('firm when an ASI score backs it, inferred otherwise', () => {
    expect(classifyEvidence({ asiScore: 3.11 })).toBe('firm');
    expect(classifyEvidence({ asiScore: null })).toBe('inferred');
    expect(classifyEvidence({ evidenceType: 'inferred', asiScore: 3.11 })).toBe('inferred');
  });
});

// ── §6.1 acceptance test — reference dataset ─────────────────────────────────
describe('ACCEPTANCE §6.1 — reference profile', () => {
  const ranked = rankFactors(REFERENCE_FACTORS);

  it('the two largest SOLID bubbles are Vicarious and Entrusting, both Weaknesses', () => {
    const firm = ranked.filter((f) => classifyEvidence(f) === 'firm');
    expect(firm[0].achievingStyle).toBe('Vicarious');
    expect(firm[1].achievingStyle).toBe('Entrusting');
    expect(firm[0].quadrant).toBe('weakness');
    expect(firm[1].quadrant).toBe('weakness');
  });

  it('every Threat renders striped (inferred)', () => {
    const threats = ranked.filter((f) => f.quadrant === 'threat');
    expect(threats.length).toBeGreaterThan(0);
    threats.forEach((t) => expect(classifyEvidence(t)).toBe('inferred'));
  });

  it('radii encode area-proportional materiality (largest factor = max radius)', () => {
    expect(ranked[0].radius).toBeCloseTo(64, 5);
    ranked.forEach((f) => expect(f.radius).toBeGreaterThan(0));
  });

  it('exec summary names the firm deficits and the inferred threats', () => {
    const s = buildExecSummary(ranked);
    expect(s).toMatch(/Vicarious 3\.11/);
    expect(s).toMatch(/Entrusting 3\.43/);
    expect(s).toMatch(/inferred/i);
  });
});

// ── ingestion — §6.1 scores through the DEFAULT config ───────────────────────
describe('buildSwotFactors ingestion (§11)', () => {
  const scores = {
    Competitive: 5.4, Power: 5.0, Intrinsic: 6.2,
    Personal: 4.8, Social: 4.1,
    Contributory: 3.8, Vicarious: 3.11, Entrusting: 3.43, Collaborative: 4.2,
  };
  const factors = buildSwotFactors(scores, DEFAULT_SWOT_CONFIG);
  const ranked = rankFactors(factors);

  it('classifies per the §6.1 table', () => {
    const q = Object.fromEntries(factors.map((f) => [f.label, f.quadrant]));
    expect(q.Competitive).toBe('strength');
    expect(q.Power).toBe('strength');
    expect(q.Intrinsic).toBe('strength');
    expect(q.Personal).toBeUndefined();          // neutral — omitted
    expect(q.Social).toBe('weakness');           // minor
    expect(q.Contributory).toBe('weakness');
    expect(q.Vicarious).toBe('weakness');
    expect(q.Entrusting).toBe('weakness');
    expect(q.Collaborative).toBe('weakness');
  });

  it('acceptance holds on ingested data too: Vicarious + Entrusting top the firm ranking', () => {
    const firm = ranked.filter((f) => classifyEvidence(f) === 'firm');
    expect([firm[0].label, firm[1].label]).toEqual(['Vicarious', 'Entrusting']);
  });

  it('activates inferred threats only when their measured roots are weak', () => {
    const ids = factors.map((f) => f.id);
    expect(ids).toContain('succession_risk');    // Vicarious is weak
    expect(ids).toContain('integration_risk');   // Entrusting is weak

    const healthy = buildSwotFactors(
      { ...scores, Vicarious: 5.5, Entrusting: 5.5, Collaborative: 5.5, Contributory: 5.5, Social: 5.0 },
      DEFAULT_SWOT_CONFIG,
    );
    const healthyIds = healthy.map((f) => f.id);
    expect(healthyIds).not.toContain('succession_risk');
    expect(healthyIds).not.toContain('integration_risk');
  });

  it('treats over-reliance as a weakness, not a strength', () => {
    const over = buildSwotFactors({ ...scores, Power: 6.8 }, DEFAULT_SWOT_CONFIG);
    const power = over.find((f) => f.label === 'Power');
    expect(power.quadrant).toBe('weakness');
    expect(power.overReliance).toBe(true);
  });

  it('every ingested style factor is firm with its score attached', () => {
    factors.filter((f) => f.achievingStyle).forEach((f) => {
      expect(f.evidenceType).toBe('firm');
      expect(f.asiScore).not.toBeNull();
    });
  });
});

describe('standing caveat (§10)', () => {
  it('states both size≠goodness and fill=confidence', () => {
    expect(STANDING_CAVEAT).toMatch(/NOT goodness/);
    expect(STANDING_CAVEAT).toMatch(/confidence/);
  });
});
