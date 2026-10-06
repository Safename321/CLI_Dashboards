// Rollout (cohort) helpers for the Assign screen — cli-backend R3.3.
// Pure functions so the rules are unit-tested without rendering.

// Above this many people the Assign screen sends ONE cohort request instead of one batch.
// Matches the backend's child size (config assignments.cohort_chunk = 100): legacy creates
// each batch's stubs in one 30 s transaction, and 500 (the single-batch maximum) has never
// been timed. At or below it the single batch answers straight away, with no queue wait.
export const COHORT_THRESHOLD = 100;

export const needsCohort = (people) => people > COHORT_THRESHOLD;

const SENT = ['forwarded', 'emailing', 'emailed', 'emailed_partial'];
const BROKEN = ['failed', 'unknown'];
const ACTIVE = ['queued', 'sending'];

const sumOf = (counts, keys) => keys.reduce((n, k) => n + (counts?.[k] ?? 0), 0);

const LABELS = {
  queued: 'Queued — waiting for the sender',
  sending: 'Sending',
  sent: 'Sent',
  partly_failed: 'Partly failed',
  cancelled: 'Cancelled',
};

// describeCohort — the panel's view of GET /assignment-cohorts/{id}'s `cohort` object.
// `stalled`: the panel has seen no progress for a few minutes while something is mid-send.
export function describeCohort(cohort, { stalled = false } = {}) {
  const counts = cohort?.chunks || {};
  const total = cohort?.totalPeople ?? 0;
  const sentPeople = cohort?.peopleSent ?? 0;
  const status = cohort?.status || 'queued';
  const chunksTotal = Object.values(counts).reduce((n, v) => n + v, 0);
  const broken = sumOf(counts, BROKEN);
  const waiting = sumOf(counts, ['queued']);
  const inFlight = sumOf(counts, ['pending']);
  return {
    status,
    label: LABELS[status] || status,
    tone: status === 'sent' ? 'ok' : status === 'partly_failed' ? 'bad' : status === 'cancelled' ? 'muted' : 'busy',
    active: ACTIVE.includes(status),
    percent: total > 0 ? Math.min(100, Math.round((sentPeople / total) * 100)) : 0,
    sentPeople,
    total,
    chunksTotal,
    chunksSent: sumOf(counts, SENT),
    chunksBroken: broken,
    chunksWaiting: waiting,
    chunksInFlight: inFlight,
    // Resume retries failed/unknown children, and any stuck mid-send (the server only
    // retakes one pending for over 2 minutes). A cancelled rollout cannot be resumed.
    canResume: status !== 'cancelled' && (broken > 0 || (stalled && inFlight > 0)),
    // Cancel only stops children still queued; sent ones cannot be recalled.
    canCancel: ACTIVE.includes(status) && waiting > 0,
  };
}

// The last rollout per tenant survives a reload so its progress stays visible.
const storeKey = (tenant) => `cli_assign_cohort__${tenant}`;

export function rememberCohort(tenant, id) {
  try { sessionStorage.setItem(storeKey(tenant), String(id)); } catch { /* storage unavailable */ }
}

export function recallCohort(tenant) {
  try {
    const v = Number(sessionStorage.getItem(storeKey(tenant)));
    return Number.isInteger(v) && v > 0 ? v : null;
  } catch { return null; }
}

export function forgetCohort(tenant) {
  try { sessionStorage.removeItem(storeKey(tenant)); } catch { /* storage unavailable */ }
}
