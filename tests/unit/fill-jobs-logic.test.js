// Audit ALG-10 / ALG-04 / ALG-05 — guard rails around the legacy hiring maths.
// D1 kept the legacy numbers, so the first thing pinned here is that valid input still
// produces them; everything else is about input the maths was never written for.
import { describe, it, expect } from 'vitest';
import {
  calcFit, calcR2, fitLabel, rankCandidates, byFit, scoreText,
  keywordEvidence, MIN_KEYWORD_EVIDENCE, buildInterpretation, bandsForScores,
} from '../../src/dashboards/fill-jobs/logic.js';

const target = [7, 6, 5, 4, 3, 2, 3, 4, 5];
const asset = { scores: target, bands: bandsForScores(target) };

// The legacy formula written out independently, to compare against.
function legacyFit(c, a) {
  let w = 0; let d = 0;
  a.scores.forEach((t, i) => {
    const wi = 1 / a.bands[i];
    const di = Math.abs(c[i] - t);
    d += (di + (di > a.bands[i] ? (di - a.bands[i]) * 2 : 0)) * wi;
    w += wi;
  });
  return d / w;
}

describe('valid input keeps the legacy numbers (D1)', () => {
  it('fit and r² are unchanged', () => {
    const cand = [6, 6, 5, 5, 3, 2, 4, 4, 6];
    expect(calcFit(cand, asset)).toBeCloseTo(legacyFit(cand, asset), 12);
    expect(calcR2(cand, target)).toMatch(/^\d\.\d\d$/);
  });

  it('ranking order is unchanged', () => {
    const pool = [
      { id: 'far', scores: [1, 1, 9, 9, 9, 9, 9, 1, 1] },
      { id: 'near', scores: [7, 6, 5, 4, 3, 2, 3, 4, 5] },
      { id: 'mid', scores: [6, 5, 5, 4, 4, 3, 3, 4, 5] },
    ];
    expect(rankCandidates(pool, asset).map((c) => c.id)).toEqual(['near', 'mid', 'far']);
  });
});

describe('ALG-10: input the maths cannot score', () => {
  it('a missing or non-numeric score gives no fit instead of NaN', () => {
    expect(calcFit([7, 6, 5, 4, 3, 2, 3, 4], asset)).toBeNull();
    expect(calcFit([7, 6, 5, 4, 3, 2, 3, 4, null], asset)).toBeNull();
    expect(calcR2([7, 6, 5, 4, 3, 2, 3, 4, '5'], target)).toBeNull();
  });

  it('a zero band gives no fit instead of a 1/0 weight', () => {
    expect(calcFit(target, { scores: target, bands: [0, 1, 1, 1, 1, 1, 1, 1, 1] })).toBeNull();
  });

  it('an unscorable candidate is labelled, ranked last, and never best', () => {
    const ranked = rankCandidates([
      { id: 'broken', scores: [] },
      { id: 'ok', scores: target },
    ], asset);
    expect(ranked.map((c) => c.id)).toEqual(['ok', 'broken']);
    expect(ranked[0].isBest).toBe(true);
    expect(ranked[1].mean).toBeNull();
    expect(fitLabel(ranked[1].fit)).toEqual({ t: 'Score unavailable', cls: 'na' });
  });

  it('two unscorable candidates compare equal rather than NaN', () => {
    expect(byFit({ fit: null }, { fit: null })).toBe(0);
  });

  it('when nothing is scorable, nobody is best', () => {
    expect(rankCandidates([{ id: 'a', scores: [] }], asset)[0].isBest).toBe(false);
  });
});

describe('ALG-04: the evidence behind a derived profile', () => {
  it('lists what the legacy matcher matched, including its known blind spots', () => {
    const hits = keywordEvidence('We are known for steady work, and we are not aggressive.');
    const words = hits.map((h) => h.word);
    expect(words).toContain('own');          // inside "known"
    expect(words).toContain('aggressive');   // despite "not"
  });

  it('agrees with scoreText: no matches means the flat legacy profile', () => {
    expect(keywordEvidence('Lorem ipsum dolor sit amet.')).toEqual([]);
    expect(new Set(scoreText('Lorem ipsum dolor sit amet.')).size).toBe(1);
  });

  it('capitalised keywords never match, exactly as in scoreText', () => {
    expect(keywordEvidence('CFA and MBA preferred').map((h) => h.word)).not.toContain('CFA');
  });

  it('the evidence bar is at least three matches', () => {
    expect(MIN_KEYWORD_EVIDENCE).toBe(3);
  });
});

describe('ALG-05: no unsupported prediction', () => {
  it('the interpretation does not claim to predict attrition', () => {
    const text = buildInterpretation('Analyst', target, bandsForScores(target)).join(' ');
    expect(text).not.toMatch(/most predictive/i);
    expect(text).toMatch(/not as a prediction/i);
  });
});
