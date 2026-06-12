// Per-tenant worker store for the Phase-1 Workday bridge. In-memory until the
// Phase-0 Postgres work lands (WorkDay/04-staging-plan.md) — uploads survive
// for the life of the server process, then must be re-uploaded. Upserts key on
// the immutable Workday ID (WID), per the identity strategy in
// WorkDay/02-data-model-mapping.md.
//
// Until real Workday credentials exist, reads fall back to STAGED data that is
// explicitly labelled source:'staged' — never silently mocked as if real.

const tenants = new Map(); // tenantId -> { workers: Map<wid, worker>, lastIngestAt, fileName }

// Staged sample roster: lets the SPA exercise the full endpoint shape before a
// CSV is uploaded or a Workday tenant is connected. WIDs are unmistakably fake.
const STAGED_WORKERS = [
  { workdayId: 'STAGED-0001', employeeId: 'E1001', legalName: 'Avery Stone', email: 'avery.stone@example.com', organization: 'Corporate', positionTitle: 'VP, People Analytics', status: 'active', hireDate: '2019-04-15' },
  { workdayId: 'STAGED-0002', employeeId: 'E1002', legalName: 'Jordan Mills', email: 'jordan.mills@example.com', organization: 'Corporate', positionTitle: 'Director, Talent', status: 'active', hireDate: '2021-09-01', managerWorkdayId: 'STAGED-0001' },
  { workdayId: 'STAGED-0003', employeeId: 'E1003', legalName: 'Riley Chen', email: 'riley.chen@example.com', organization: 'Engineering', positionTitle: 'Staff Engineer', status: 'active', hireDate: '2020-02-10', managerWorkdayId: 'STAGED-0001' },
  { workdayId: 'STAGED-0004', employeeId: 'E1004', legalName: 'Sam Okafor', email: 'sam.okafor@example.com', organization: 'Engineering', positionTitle: 'Engineering Manager', status: 'on_leave', hireDate: '2018-11-05', managerWorkdayId: 'STAGED-0001' },
  { workdayId: 'STAGED-0005', employeeId: 'E1005', legalName: 'Drew Haines', email: 'drew.haines@example.com', organization: 'Sales', positionTitle: 'Account Executive', status: 'terminated', hireDate: '2022-06-20', terminationDate: '2026-01-31' },
];

const STAGED_NOTE =
  'STAGED DATA — no Workday credentials configured and no workers CSV uploaded. ' +
  'Upload a CSV via POST /api/workday/workers/csv (Phase 1) or connect a Workday tenant (Phase 2).';

function getTenant(tenantId) {
  return tenants.get(tenantId || 'default') || null;
}

// Upsert parsed workers for a tenant. Returns { inserted, updated, total }.
export function ingestWorkers(tenantId, workers, { fileName = null } = {}) {
  const id = tenantId || 'default';
  const t = tenants.get(id) || { workers: new Map(), lastIngestAt: null, fileName: null };
  const stamp = new Date().toISOString();
  let inserted = 0;
  let updated = 0;
  for (const w of workers) {
    if (t.workers.has(w.workdayId)) updated++;
    else inserted++;
    t.workers.set(w.workdayId, { ...w, lastSyncedAt: stamp });
  }
  t.lastIngestAt = stamp;
  t.fileName = fileName;
  tenants.set(id, t);
  return { inserted, updated, total: t.workers.size };
}

// Worker directory: uploaded CSV rows when present, staged roster otherwise.
export function getWorkers(tenantId) {
  const t = getTenant(tenantId);
  if (t && t.workers.size > 0) {
    return { source: 'csv', workers: Array.from(t.workers.values()), ingestedAt: t.lastIngestAt };
  }
  return { source: 'staged', workers: STAGED_WORKERS, note: STAGED_NOTE };
}

// Ingestion state for the admin/status view.
export function getIngestStatus(tenantId) {
  const t = getTenant(tenantId);
  return {
    source: t && t.workers.size > 0 ? 'csv' : 'staged',
    workerCount: t ? t.workers.size : 0,
    lastIngestAt: t ? t.lastIngestAt : null,
    fileName: t ? t.fileName : null,
    live: false, // flips in Phase 2 when a real Workday client exists
  };
}

function yearsBetween(fromIso, toMs) {
  const from = Date.parse(fromIso);
  if (Number.isNaN(from)) return null;
  return (toMs - from) / (365.25 * 24 * 3600 * 1000);
}

// HRIS summary in the CLI connector shape (mirrors MockHRISConnector's fields).
// CSV-derived fields are computed from the uploaded roster; fields a workers
// CSV cannot supply (openReqs, timeToFillDays, ...) stay null with a note —
// honest gaps beat fabricated numbers.
export function getHrisSummary(tenantId, { employerName = null } = {}) {
  const { source, workers } = getWorkers(tenantId);
  const now = Date.now();
  const yearAgo = now - 365 * 24 * 3600 * 1000;

  const active = workers.filter((w) => w.status === 'active' || w.status === 'on_leave');
  const terminated12mo = workers.filter(
    (w) => w.terminationDate && !Number.isNaN(Date.parse(w.terminationDate)) && Date.parse(w.terminationDate) >= yearAgo,
  );
  const tenures = active
    .map((w) => (w.hireDate ? yearsBetween(w.hireDate, now) : null))
    .filter((y) => y !== null && y >= 0);

  return {
    source,
    employer: employerName || tenantId || 'default',
    headcount: active.length,
    turnover12mo: active.length > 0 ? +(terminated12mo.length / active.length).toFixed(3) : null,
    avgTenureYears: tenures.length > 0 ? +(tenures.reduce((a, b) => a + b, 0) / tenures.length).toFixed(1) : null,
    statusBreakdown: workers.reduce((acc, w) => {
      acc[w.status] = (acc[w.status] || 0) + 1;
      return acc;
    }, {}),
    // Not derivable from a workers CSV — populated by the Phase-2 API sync.
    headcountYoY: null,
    voluntaryTurnover12mo: null,
    involuntaryTurnover12mo: null,
    openReqs: null,
    timeToFillDays: null,
    note:
      source === 'staged'
        ? STAGED_NOTE
        : 'Derived from uploaded workers CSV (Phase 1). Null fields require the Phase-2 Workday API sync.',
  };
}

// Test hook — clears all tenants.
export function __resetWorkdayStore() {
  tenants.clear();
}
