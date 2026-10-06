// cli-backend R3.3 — the Assign screen's rollout (cohort) rules.
import { describe, it, expect } from 'vitest';

const store = new Map();
globalThis.sessionStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const {
  COHORT_THRESHOLD, needsCohort, describeCohort, rememberCohort, recallCohort, forgetCohort,
} = await import('../../src/dashboards/individual-asi/cohortProgress.js');

describe('needsCohort', () => {
  it('sends up to the child size as one batch and anything larger as a cohort', () => {
    expect(needsCohort(1)).toBe(false);
    expect(needsCohort(COHORT_THRESHOLD)).toBe(false);
    expect(needsCohort(COHORT_THRESHOLD + 1)).toBe(true);
    expect(needsCohort(2500)).toBe(true);
  });
});

describe('describeCohort', () => {
  it('counts people sent and batches by state', () => {
    const v = describeCohort({
      status: 'sending', totalPeople: 650, peopleSent: 300,
      chunks: { emailed: 2, forwarded: 1, pending: 1, queued: 3 },
    });
    expect(v.percent).toBe(46);
    expect(v.chunksTotal).toBe(7);
    expect(v.chunksSent).toBe(3);
    expect(v.chunksInFlight).toBe(1);
    expect(v.chunksWaiting).toBe(3);
    expect(v.active).toBe(true);
    expect(v.canCancel).toBe(true);
    expect(v.canResume).toBe(false);   // healthy and moving: nothing to resume
  });

  it('offers Resume for failed or unconfirmed batches, not Cancel once nothing is queued', () => {
    const v = describeCohort({
      status: 'partly_failed', totalPeople: 650, peopleSent: 550,
      chunks: { emailed: 5, failed: 1, unknown: 1 },
    });
    expect(v.tone).toBe('bad');
    expect(v.chunksBroken).toBe(2);
    expect(v.canResume).toBe(true);
    expect(v.canCancel).toBe(false);
    expect(v.active).toBe(false);
  });

  it('offers Resume for a batch stuck mid-send only once the panel has seen it stall', () => {
    const cohort = { status: 'sending', totalPeople: 200, peopleSent: 100, chunks: { emailed: 1, pending: 1 } };
    expect(describeCohort(cohort).canResume).toBe(false);
    expect(describeCohort(cohort, { stalled: true }).canResume).toBe(true);
  });

  it('never resumes or cancels a cancelled rollout', () => {
    const v = describeCohort({ status: 'cancelled', totalPeople: 300, peopleSent: 100, chunks: { emailed: 1, cancelled: 1, failed: 1 } });
    expect(v.canResume).toBe(false);
    expect(v.canCancel).toBe(false);
    expect(v.active).toBe(false);
  });

  it('a fresh cohort the worker has not touched yet reads as queued', () => {
    const v = describeCohort({ status: 'queued', totalPeople: 250, peopleSent: 0, chunks: { queued: 3 } });
    expect(v.label).toMatch(/Queued/);
    expect(v.percent).toBe(0);
    expect(v.canCancel).toBe(true);
  });
});

describe('remembered rollout', () => {
  it('is kept per tenant and can be forgotten', () => {
    rememberCohort('3', 41);
    rememberCohort('5', 42);
    expect(recallCohort('3')).toBe(41);
    expect(recallCohort('5')).toBe(42);
    forgetCohort('3');
    expect(recallCohort('3')).toBe(null);
    expect(recallCohort('8')).toBe(null);
  });
});
