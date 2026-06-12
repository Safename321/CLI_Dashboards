import express, { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getAdapter } from '../lib/adapters/index.js';
import { runImport, importWorkers } from '../lib/importEngine.js';
import { CsvAdapter } from '../lib/adapters/csv.js';

const router = Router();
router.use(requireAuth);

function tenantOf(req) { return req.session?.tenant || 'default'; }

const csvBody = express.text({ type: ['text/csv', 'text/plain', 'application/csv'], limit: '10mb' });
router.post('/csv', csvBody, async (req, res) => {
  const csv = typeof req.body === 'string' ? req.body : req.body?.csv;
  if (typeof csv !== 'string' || csv.trim() === '') return res.status(400).json({ error: 'CSV body required' });
  try {
    const adapter = new CsvAdapter({ csvText: csv });
    const workers = await adapter.fetchWorkers();
    const fileName = typeof req.query.filename === 'string' ? req.query.filename.slice(0, 200) : null;
    const result = await importWorkers(tenantOf(req), workers, { fileName, provider: 'csv' });
    res.json({ ok: true, source: 'csv', ...result });
  } catch (err) { res.status(422).json({ error: err.message }); }
});

router.post('/test', express.json(), async (req, res) => {
  const { provider, credentials } = req.body;
  if (!provider || !credentials) return res.status(400).json({ error: 'Required: { provider, credentials }' });
  try {
    const adapter = getAdapter(provider, credentials);
    res.json(await adapter.testConnection());
  } catch (err) { res.json({ ok: false, error: err.message }); }
});

router.post('/run', express.json(), async (req, res) => {
  const { provider, credentials } = req.body;
  if (!provider || !credentials) return res.status(400).json({ error: 'Required: { provider, credentials }' });
  try {
    const adapter = getAdapter(provider, credentials);
    const test = await adapter.testConnection();
    if (!test.ok) return res.status(401).json({ error: `Connection failed: ${test.error}` });
    const result = await runImport(adapter, tenantOf(req));
    console.log(`[import] ${tenantOf(req)}: ${provider} import — ${result.workers.inserted} inserted, ${result.workers.updated} updated`);
    res.json({ ok: true, ...result });
  } catch (err) { console.error('[import] error:', err.message); res.status(500).json({ error: err.message }); }
});

router.get('/providers', (req, res) => {
  res.json({ providers: [
    { id: 'csv', name: 'CSV Upload', description: 'Upload workers CSV from any HRIS', requiresCredentials: false },
    { id: 'workday', name: 'Workday', description: 'Import via Workday Web Services API', requiresCredentials: true, fields: ['tenantUrl', 'username', 'password'] },
    { id: 'sap', name: 'SAP SuccessFactors', description: 'Import via OData v2 API', requiresCredentials: true, fields: ['apiUrl', 'companyId', 'username', 'password'] },
    { id: 'adp', name: 'ADP', description: 'Import via ADP REST API (requires client cert)', requiresCredentials: true, fields: ['clientId', 'clientSecret', 'cert', 'key'] },
  ]});
});

export default router;
