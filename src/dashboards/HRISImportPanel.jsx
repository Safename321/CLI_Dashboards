// HRISImportPanel — SuperAdmin UI for Workday/SAP/ADP/CSV import, wired to the Laravel
// /api/super/companies/{companyId}/hris/* endpoints (Track A inbound import).
//
// Replaces the v2 repo's HRISImportPanel.jsx (which talked to the Express proxy). Drop into
// src/dashboards/ of the integrated dashboard.
//
// AUTH WIRING: needs the dashboard's authenticated fetch. Pass `api` (e.g. dashFetch from
// lib/auth.js — JWT + X-Impersonate-Company) so this file stays auth-agnostic.
//
// SCOPE: works for BOTH roles via `basePath`:
//   • SuperAdmin (per company):  <HRISImportPanel api={dashFetch} companyId={id} />
//        → basePath defaults to `/super/companies/${companyId}/hris`
//   • Company admin (own company): <HRISImportPanel api={dashFetch} basePath="/dashboard/hris" />
//        → no companyId needed; the server resolves the company from the JWT.

import React, { useEffect, useState, useCallback } from 'react';

const PROVIDERS = [
  { id: 'workday', name: 'Workday',
    config: ['tenant', 'host', 'wws_version'],
    creds:  ['username', 'password'] },
  { id: 'sap', name: 'SAP SuccessFactors',
    config: ['api_url', 'company_id', 'client_id', 'token_url', 'identity_key_field'],
    creds:  ['private_key_pem', 'saml_user', 'api_key'] },
  { id: 'adp', name: 'ADP',
    config: ['base_url', 'product'],
    creds:  ['client_id', 'client_secret', 'client_cert_pem', 'client_key_pem'] },
];

export default function HRISImportPanel({ companyId, api, basePath }) {
  // Super → /super/companies/{id}/hris ; admin self-serve → /dashboard/hris (company from JWT).
  const base = basePath || `/super/companies/${companyId}/hris`;
  const call = useCallback(async (path, opts = {}) => {
    const res = await api(`${base}/${path}`, opts);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
    return body;
  }, [api, base]);

  const [status, setStatus] = useState(null);
  const [provider, setProvider] = useState('workday');
  const [config, setConfig] = useState({});
  const [creds, setCreds] = useState({});
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);

  const spec = PROVIDERS.find(p => p.id === provider);

  const refresh = useCallback(() => {
    call('status').then(setStatus).catch(e => setMsg({ type: 'error', text: e.message }));
  }, [call]);

  useEffect(() => { refresh(); }, [refresh]);

  const run = async (label, fn) => {
    setBusy(label); setMsg(null);
    try { setMsg({ type: 'ok', text: await fn() }); refresh(); }
    catch (e) { setMsg({ type: 'error', text: e.message }); }
    finally { setBusy(''); }
  };

  const saveConnection = () => run('save', async () => {
    await call('connection', { method: 'POST', body: JSON.stringify({ provider, config, credentials: creds }) });
    return `${spec.name} connection saved.`;
  });

  const testConnection = () => run('test', async () => {
    const r = await call('test', { method: 'POST', body: JSON.stringify({ provider }) });
    return r.ok ? `✓ ${spec.name} connection OK.` : `✗ ${r.error || 'failed'}`;
  });

  const startImport = () => run('import', async () => {
    const r = await call('import', { method: 'POST', body: JSON.stringify({ provider }) });
    return r.message || 'Import queued.';
  });

  const uploadCsv = (file, sendEmail) => run('csv', async () => {
    const fd = new FormData();
    fd.append('file', file);
    if (sendEmail) fd.append('sendEmail', '1');
    // multipart — do not set JSON content-type; let the browser set the boundary.
    const res = await api(`${base}/import-csv`, { method: 'POST', body: fd });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
    return `CSV: ${body.created} created, ${body.skipped} skipped, ${body.failed} failed`
      + (body.warnings?.length ? ` (${body.warnings.length} warnings)` : '');
  });

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-semibold">HRIS Import</h2>
        <p className="text-sm text-gray-500">Import workers from Workday, SAP SuccessFactors, ADP, or a CSV export. Inbound only — existing users are never overwritten.</p>
      </header>

      {msg && (
        <div className={`rounded p-3 text-sm ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {msg.text}
        </div>
      )}

      {/* Existing connections + last import */}
      <section className="rounded border p-4">
        <h3 className="font-medium mb-2">Connections</h3>
        {!status?.connections?.length && <p className="text-sm text-gray-400">None configured yet.</p>}
        <ul className="space-y-1 text-sm">
          {status?.connections?.map(c => (
            <li key={c.provider} className="flex justify-between">
              <span className="font-mono">{c.provider}</span>
              <span className="text-gray-500">
                {c.status}
                {c.lastImport && ` · last: ${c.lastImport.created}✓/${c.lastImport.skipped}–/${c.lastImport.failed}✗`}
                {c.lastImportAt && ` · ${new Date(c.lastImportAt).toLocaleString()}`}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* API connection editor */}
      <section className="rounded border p-4 space-y-3">
        <div className="flex gap-2">
          {PROVIDERS.map(p => (
            <button key={p.id} onClick={() => { setProvider(p.id); setConfig({}); setCreds({}); }}
              className={`px-3 py-1 rounded text-sm ${provider === p.id ? 'bg-red-600 text-white' : 'bg-gray-100'}`}>
              {p.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Config</p>
            {spec.config.map(f => (
              <input key={f} placeholder={f} value={config[f] || ''}
                onChange={e => setConfig({ ...config, [f]: e.target.value })}
                className="w-full mb-1 border rounded px-2 py-1 text-sm" />
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Credentials (encrypted at rest)</p>
            {spec.creds.map(f => (
              <textarea key={f} placeholder={f} value={creds[f] || ''}
                onChange={e => setCreds({ ...creds, [f]: e.target.value })}
                rows={f.includes('pem') ? 3 : 1}
                className="w-full mb-1 border rounded px-2 py-1 text-sm font-mono" />
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button disabled={!!busy} onClick={saveConnection} className="px-3 py-1 rounded bg-gray-800 text-white text-sm disabled:opacity-50">
            {busy === 'save' ? 'Saving…' : 'Save connection'}
          </button>
          <button disabled={!!busy} onClick={testConnection} className="px-3 py-1 rounded bg-gray-100 text-sm disabled:opacity-50">
            {busy === 'test' ? 'Testing…' : 'Test'}
          </button>
          <button disabled={!!busy} onClick={startImport} className="px-3 py-1 rounded bg-red-600 text-white text-sm disabled:opacity-50">
            {busy === 'import' ? 'Queuing…' : 'Import now'}
          </button>
        </div>
      </section>

      {/* CSV upload */}
      <section className="rounded border p-4 space-y-2">
        <h3 className="font-medium">CSV import</h3>
        <p className="text-xs text-gray-500">Workday/BambooHR/generic export. Recognized columns: email, first/last name, employee id, title, department, manager id, status, hire date.</p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" id="csvSendEmail" /> email a welcome message with temp passwords
        </label>
        <input type="file" accept=".csv,text/csv" disabled={!!busy}
          onChange={e => e.target.files[0] && uploadCsv(e.target.files[0], document.getElementById('csvSendEmail')?.checked)}
          className="text-sm" />
        {busy === 'csv' && <span className="text-sm text-gray-500">Importing…</span>}
      </section>
    </div>
  );
}
