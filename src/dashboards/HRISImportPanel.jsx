import { useState, useRef } from 'react';
import { apiUrl } from '../lib/apiBase.js';

/* -- provider catalogue ------------------------------------------------- */
const PROVIDERS = [
  {
    id: 'csv',
    name: 'CSV Upload',
    description: 'Upload a workers CSV exported from any HRIS',
    fields: [],
  },
  {
    id: 'workday',
    name: 'Workday',
    description: 'Import via Workday Web Services API',
    fields: [
      { key: 'tenantUrl', label: 'Tenant URL' },
      { key: 'username', label: 'ISU Username' },
      { key: 'password', label: 'ISU Password', type: 'password' },
    ],
  },
  {
    id: 'sap',
    name: 'SAP SuccessFactors',
    description: 'Import via OData v2 API',
    fields: [
      { key: 'apiUrl', label: 'API URL' },
      { key: 'companyId', label: 'Company ID' },
      { key: 'username', label: 'Username' },
      { key: 'password', label: 'Password', type: 'password' },
    ],
  },
  {
    id: 'adp',
    name: 'ADP',
    description: 'Import via ADP REST API (requires client certificate)',
    fields: [
      { key: 'clientId', label: 'Client ID' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password' },
      { key: 'cert', label: 'Certificate (PEM)', multiline: true },
      { key: 'key', label: 'Private Key (PEM)', multiline: true },
    ],
  },
];

/* -- status badge ------------------------------------------------------- */
function StatusBadge({ status }) {
  const map = {
    idle: { label: 'Idle', cls: 'bg-white/10 text-muted' },
    testing: { label: 'Testing\u2026', cls: 'bg-yellow-500/20 text-yellow-300 animate-pulse' },
    connected: { label: 'Connected', cls: 'bg-emerald-500/20 text-emerald-400' },
    importing: { label: 'Importing\u2026', cls: 'bg-cyan-500/20 text-cyan-300 animate-pulse' },
    success: { label: 'Success', cls: 'bg-emerald-500/20 text-emerald-400' },
    error: { label: 'Error', cls: 'bg-red-500/20 text-red-400' },
  };
  const { label, cls } = map[status] || map.idle;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-medium ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

/* -- main panel --------------------------------------------------------- */
export default function HRISImportPanel() {
  const [provider, setProvider] = useState('csv');
  const [creds, setCreds] = useState({});
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);
  const dropRef = useRef(null);

  const activeProvider = PROVIDERS.find((p) => p.id === provider);

  const updateCred = (key, value) =>
    setCreds((prev) => ({ ...prev, [key]: value }));

  const reset = () => {
    setStatus('idle');
    setResult(null);
    setError(null);
  };

  /* -- CSV upload ------------------------------------------------------- */
  const handleCsvUpload = async (file) => {
    if (!file) return;
    reset();
    setStatus('importing');
    try {
      const text = await file.text();
      const res = await fetch(apiUrl('/api/import/csv'), {
        method: 'POST',
        headers: { 'Content-Type': 'text/csv' },
        body: text,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Import failed');
      setResult(json);
      setStatus('success');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) handleCsvUpload(file);
  };

  /* -- API provider actions --------------------------------------------- */
  const testConnection = async () => {
    reset();
    setStatus('testing');
    try {
      const res = await fetch(apiUrl('/api/import/test'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, ...creds }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Connection test failed');
      setStatus('connected');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  const importNow = async () => {
    setResult(null);
    setError(null);
    setStatus('importing');
    try {
      const res = await fetch(apiUrl('/api/import/run'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, ...creds }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Import failed');
      setResult(json);
      setStatus('success');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  /* -- render ----------------------------------------------------------- */
  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">HRIS Import</h2>
          <p className="text-sm text-muted">
            Pull worker data from your Human Resources Information System
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* provider picker */}
      <div className="flex flex-wrap gap-2">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => { setProvider(p.id); reset(); setCreds({}); }}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              provider === p.id
                ? 'border-cyan-500 bg-cyan-600 text-white'
                : 'border-border bg-ink/60 text-muted hover:text-white'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted">{activeProvider?.description}</p>

      {/* CSV drag-and-drop zone */}
      {provider === 'csv' && (
        <div
          ref={dropRef}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-ink/60 p-10 text-center transition hover:border-cyan-500"
        >
          <svg className="h-10 w-10 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" />
          </svg>
          <p className="text-sm text-muted">
            Drag &amp; drop a <span className="font-semibold text-white">.csv</span> file here, or
          </p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition"
          >
            Browse Files
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => handleCsvUpload(e.target.files?.[0])}
          />
        </div>
      )}

      {/* Credential form for API providers */}
      {provider !== 'csv' && (
        <div className="space-y-4 rounded-xl border border-border bg-ink/60 p-6">
          {activeProvider?.fields.map((f) => (
            <label key={f.key} className="block space-y-1">
              <span className="text-sm font-medium text-muted">{f.label || f.key}</span>
              {f.multiline ? (
                <textarea
                  rows={4}
                  value={creds[f.key] || ''}
                  onChange={(e) => updateCred(f.key, e.target.value)}
                  className="block w-full rounded-lg border border-border bg-black/30 px-3 py-2 text-sm text-white placeholder-muted focus:border-cyan-500 focus:outline-none"
                  placeholder={f.label || f.key}
                />
              ) : (
                <input
                  type={f.type || 'text'}
                  value={creds[f.key] || ''}
                  onChange={(e) => updateCred(f.key, e.target.value)}
                  className="block w-full rounded-lg border border-border bg-black/30 px-3 py-2 text-sm text-white placeholder-muted focus:border-cyan-500 focus:outline-none"
                  placeholder={f.label || f.key}
                />
              )}
            </label>
          ))}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={testConnection}
              disabled={status === 'testing'}
              className="rounded-lg border border-border bg-ink/60 px-4 py-2 text-sm font-medium text-muted hover:text-white transition disabled:opacity-50"
            >
              {status === 'testing' ? 'Testing\u2026' : 'Test Connection'}
            </button>
            <button
              type="button"
              onClick={importNow}
              disabled={status === 'importing'}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500 transition disabled:opacity-50"
            >
              {status === 'importing' ? 'Importing\u2026' : 'Import Now'}
            </button>
          </div>
        </div>
      )}

      {/* success result */}
      {status === 'success' && result && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <h3 className="text-sm font-semibold text-emerald-400">Import Complete</h3>
          <div className="mt-2 flex gap-6 text-sm">
            <span className="text-emerald-300">
              <span className="font-mono font-bold">{result.inserted ?? 0}</span> inserted
            </span>
            <span className="text-emerald-300">
              <span className="font-mono font-bold">{result.updated ?? 0}</span> updated
            </span>
            <span className="text-emerald-300">
              <span className="font-mono font-bold">{result.total ?? 0}</span> total
            </span>
          </div>
        </div>
      )}

      {/* error */}
      {status === 'error' && error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <h3 className="text-sm font-semibold text-red-400">Import Error</h3>
          <p className="mt-1 text-sm text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
}
