// /api/workday — HRIS integration endpoint (WorkDay/ design docs, first
// increment). FAILS CLOSED: every route requires a valid session JWT
// (middleware/auth.js); tenant scoping comes from the session, never from the
// caller. Until real Workday credentials + the Phase-2 API client exist, data
// is served from the Phase-1 store: uploaded workers CSV, or clearly-labelled
// staged data (source:'staged') — never silently mocked as if real.
import express, { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { parseWorkersCsv } from '../lib/workersCsv.js';
import { ingestWorkers, getWorkers, getIngestStatus, getHrisSummary } from '../lib/workdayStore.js';

const router = Router();
router.use(requireAuth);

function tenantOf(req) {
  return req.session?.tenant || 'default';
}

// Real-mode gate: the SPA's WorkdayConnector forwards customer Workday creds
// (?tenant= + x-customer-token) when configured. The Phase-2 API client doesn't
// exist yet, so we acknowledge — not silently ignore — them.
function liveGate(req) {
  const requested = !!(req.query.tenant || req.headers['x-customer-token']);
  return {
    live: false,
    liveRequested: requested,
    ...(requested && {
      liveReason: 'Workday API client is Phase 2 — customer credentials acknowledged but not used; serving staged/CSV data.',
    }),
  };
}

// GET /api/workday → HRIS summary in the CLI connector shape.
router.get('/', (req, res) => {
  const tenant = tenantOf(req);
  res.json({ ...getHrisSummary(tenant, { employerName: tenant }), meta: liveGate(req) });
});

// GET /api/workday/workers → normalized worker directory (CSV or staged).
router.get('/workers', (req, res) => {
  const tenant = tenantOf(req);
  const { source, workers, ingestedAt, note } = getWorkers(tenant);
  res.json({ source, count: workers.length, workers, ingestedAt: ingestedAt || null, ...(note && { note }), meta: liveGate(req) });
});

// GET /api/workday/status → ingestion state for the admin/status view.
router.get('/status', (req, res) => {
  res.json(getIngestStatus(tenantOf(req)));
});

// POST /api/workday/workers/csv — Phase-1 authenticated upload (stands in for
// the docs' SFTP pickup). Body: raw text/csv, or JSON { csv: "..." }.
const csvBody = express.text({ type: ['text/csv', 'text/plain', 'application/csv'], limit: '10mb' });
router.post('/workers/csv', csvBody, (req, res) => {
  const csv = typeof req.body === 'string' ? req.body : req.body?.csv;
  if (typeof csv !== 'string' || csv.trim() === '') {
    return res.status(400).json({ error: 'CSV body required — send text/csv, or JSON { csv: "..." }' });
  }

  const { ok, workers, errors } = parseWorkersCsv(csv);
  if (!ok) {
    return res.status(422).json({ error: 'CSV rejected — no valid worker rows', rowErrors: errors });
  }

  const tenant = tenantOf(req);
  const fileName = typeof req.query.filename === 'string' ? req.query.filename.slice(0, 200) : null;
  const { inserted, updated, total } = ingestWorkers(tenant, workers, { fileName });
  console.log(`[workday] ${tenant}: CSV ingest ok — ${inserted} inserted, ${updated} updated, ${errors.length} row errors`);
  res.json({ ok: true, source: 'csv', inserted, updated, total, rowErrors: errors });
});

export default router;
