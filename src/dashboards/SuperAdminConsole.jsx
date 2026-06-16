// SuperAdminConsole — Tier 3 tenant-management UI, ported from v1.24d
// (solution/dashboard/src/SuperAdminConsole.jsx) and rewired to the v2 integration bridge.
//
// AUTH WIRING (v2):
//   • All API calls go through dashFetch() from ../lib/auth.js (JWT + X-Impersonate-Company,
//     401→refresh) instead of the source's hand-rolled api(path, token, opts).
//   • Impersonation uses useAuth().impersonateCompany(companyId, companyName) instead of the
//     source's onImpersonate prop — this sets X-Impersonate-Company for every subsequent dashFetch
//     and swaps v2's presentation tenant to the impersonated company.
//
// Surfaces (all carried over from the source, plus a new HRIS tab):
//   • Tenants — create/suspend/activate companies, usage, impersonate, and per-company expanders:
//       - Admins:      create (legacy-leader picker / auto-provision), reset password, revoke/reactivate, update
//       - Mobile users: list / create (tenant-stamped) / bulk import
//       - HRIS Import: NEW — renders <HRISImportPanel companyId api={dashFetch} />
//       - Data:        per-company analytics datasets list + JSON editor (PUT dataset)
//   • Audit — paginated tenant_audit_log events.
//
// Render this as dashboard view 'super' when useAuth().role === 'super'.

import { useState, useEffect, useCallback, Fragment } from 'react';
import { dashFetch } from '../lib/auth.js';
import { useAuth } from '../auth/AuthContext.jsx';
import HRISImportPanel from './HRISImportPanel.jsx';

// Thin wrapper over the v2 bridge so call-sites read like the source's api(path, opts).
// dashFetch already attaches the JWT + impersonation header and handles 401→refresh.
async function api(path, opts = {}) {
  const res = await dashFetch(path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export default function SuperAdminConsole() {
  const [view, setView] = useState('tenants'); // 'tenants' | 'audit'
  const { impersonateCompany } = useAuth();

  const onImpersonate = useCallback(
    (companyId, companyName) => impersonateCompany(companyId, companyName),
    [impersonateCompany],
  );

  return (
    <div className="p-6 text-slate-200">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">SuperAdmin</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage companies, admins, seats, datasets, and impersonation. All mutations are audit-logged.
          </p>
        </div>
        <div className="flex gap-2">
          <TabButton active={view === 'tenants'} onClick={() => setView('tenants')}>Tenants</TabButton>
          <TabButton active={view === 'audit'} onClick={() => setView('audit')}>Audit log</TabButton>
        </div>
      </div>

      {view === 'tenants' ? <TenantsView onImpersonate={onImpersonate} /> : <AuditView />}
    </div>
  );
}

// ─── Tenants ─────────────────────────────────────────────────────────────────
function TenantsView({ onImpersonate }) {
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState({}); // companyId -> usage
  const [expanded, setExpanded] = useState(null); // `${companyId}:admins` | `:employees` | `:hris` | `:data`
  const [form, setForm] = useState({ name: '', slug: '', plan: 'trial' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { companies } = await api('/super/companies');
      setCompanies(companies);
      setError('');
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const createCompany = async (e) => {
    e.preventDefault();
    try {
      await api('/super/companies', { method: 'POST', body: JSON.stringify(form) });
      setForm({ name: '', slug: '', plan: 'trial' });
      load();
    } catch (e) { setError(e.message); }
  };

  const setStatus = async (id, status) => {
    try { await api(`/super/companies/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); load(); }
    catch (e) { setError(e.message); }
  };

  const loadUsage = async (id) => {
    try { const { usage } = await api(`/super/companies/${id}/usage`); setUsage((u) => ({ ...u, [id]: usage })); }
    catch (e) { setError(e.message); }
  };

  const badgeClass = (status) => ({
    active: 'text-green-500',
    suspended: 'text-amber-500',
    cancelled: 'text-red-500',
  }[status] || 'text-slate-400');

  const toggle = (key) => setExpanded((cur) => (cur === key ? null : key));

  return (
    <>
      {error && <ErrorBox>{error}</ErrorBox>}

      {/* Create company */}
      <form onSubmit={createCompany} className="my-4 flex flex-wrap items-end gap-2">
        <Field label="Name"><input className={INP} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
        <Field label="Slug"><input className={INP} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="acme-co" required /></Field>
        <Field label="Plan">
          <select className={INP} value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
            <option value="trial">trial</option><option value="standard">standard</option><option value="enterprise">enterprise</option>
          </select>
        </Field>
        <button type="submit" className={BTN}>+ Create company</button>
      </form>

      {loading ? <div className="text-slate-500">Loading…</div> : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-400">
              <th className={TH}>Company</th><th className={TH}>Plan</th><th className={TH}>Status</th>
              <th className={TH}>Admins</th><th className={TH}>Employees</th><th className={TH}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <Fragment key={c.id}>
                <tr className="border-b border-slate-800">
                  <td className={TD}><strong className="text-white">{c.name}</strong><div className="text-slate-500">{c.slug}</div></td>
                  <td className={TD}>{c.plan}</td>
                  <td className={TD}><span className={`font-semibold ${badgeClass(c.status)}`}>{c.status}</span></td>
                  <td className={TD}>{c.admins_count} / {c.max_admins}</td>
                  <td className={TD}>{c.employees_count} / {c.max_employees}</td>
                  <td className={TD}>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <button className={LINK} onClick={() => toggle(`${c.id}:admins`)}>
                        {expanded === `${c.id}:admins` ? '▾ Admins' : '▸ Admins'}
                      </button>
                      <button className={LINK} onClick={() => toggle(`${c.id}:employees`)}>
                        {expanded === `${c.id}:employees` ? '▾ Mobile users' : '▸ Mobile users'}
                      </button>
                      <button className={LINK} onClick={() => toggle(`${c.id}:hris`)}>
                        {expanded === `${c.id}:hris` ? '▾ HRIS Import' : '▸ HRIS Import'}
                      </button>
                      <button className={LINK} onClick={() => toggle(`${c.id}:data`)}>
                        {expanded === `${c.id}:data` ? '▾ Data' : '▸ Data'}
                      </button>
                      <button className={LINK} onClick={() => onImpersonate && onImpersonate(c.id, c.name)}>Impersonate</button>
                      {c.status === 'active'
                        ? <button className={LINK} onClick={() => setStatus(c.id, 'suspended')}>Suspend</button>
                        : <button className={LINK} onClick={() => setStatus(c.id, 'active')}>Activate</button>}
                      <button className={LINK} onClick={() => loadUsage(c.id)}>Usage</button>
                    </div>
                    {usage[c.id] && (
                      <div className="mt-1 text-xs text-slate-400">
                        {usage[c.id].batches_this_month} batches/mo · {usage[c.id].instruments_completed} completed
                      </div>
                    )}
                  </td>
                </tr>
                {expanded === `${c.id}:admins` && (
                  <tr><td colSpan={6} className="bg-slate-950 p-0"><AdminPanel company={c} onChanged={load} /></td></tr>
                )}
                {expanded === `${c.id}:employees` && (
                  <tr><td colSpan={6} className="bg-slate-950 p-0"><EmployeePanel company={c} onChanged={load} /></td></tr>
                )}
                {expanded === `${c.id}:hris` && (
                  <tr><td colSpan={6} className="bg-slate-950 p-0">
                    <div className="px-5 py-4"><HRISImportPanel companyId={c.id} api={dashFetch} /></div>
                  </td></tr>
                )}
                {expanded === `${c.id}:data` && (
                  <tr><td colSpan={6} className="bg-slate-950 p-0"><DataPanel company={c} /></td></tr>
                )}
              </Fragment>
            ))}
            {!companies.length && <tr><td className={TD} colSpan={6}><span className="text-slate-500">No companies yet.</span></td></tr>}
          </tbody>
        </table>
      )}
    </>
  );
}

// ─── Per-company admin management ────────────────────────────────────────────
function AdminPanel({ company, onChanged }) {
  const [admins, setAdmins] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [leaderWarn, setLeaderWarn] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ legacy_admin_id: '', name: '', email: '', password: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { admins } = await api(`/super/companies/${company.id}/admins`);
      setAdmins(admins);
      setError('');
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, [company.id]);

  useEffect(() => { load(); }, [load]);

  const openCreate = async () => {
    setCreating(true);
    setForm({ legacy_admin_id: '', name: '', email: '', password: '' });
    try {
      const res = await api('/super/unassigned-legacy-admins');
      setLeaders(res.admins || []);
      setLeaderWarn(res.warning || '');
    } catch (e) { setError(e.message); }
  };

  // Picking a legacy leader prefills name/email (still editable).
  const pickLeader = (id) => {
    const l = leaders.find((x) => String(x.legacy_admin_id) === String(id));
    setForm((f) => ({
      ...f,
      legacy_admin_id: id,
      name: l ? `${l.firstName} ${l.lastName}`.trim() : f.name,
      email: l ? (l.email || f.email) : f.email,
    }));
  };

  const createAdmin = async (e) => {
    e.preventDefault();
    try {
      // Omit legacy_admin_id → backend auto-provisions a NEW dedicated, marked legacy
      // leader for this company. Supply it only to bind an existing one.
      const payload = { name: form.name, email: form.email, password: form.password };
      if (form.legacy_admin_id) payload.legacy_admin_id = Number(form.legacy_admin_id);
      await api(`/super/companies/${company.id}/admins`, { method: 'POST', body: JSON.stringify(payload) });
      setCreating(false);
      await load();
      onChanged && onChanged(); // refresh company counts
    } catch (e) { setError(e.message); }
  };

  const resetPassword = async (a) => {
    const pw = window.prompt(`New password for ${a.email} (min 10 chars):`);
    if (!pw) return;
    try { await api(`/super/admins/${a.id}/reset-password`, { method: 'POST', body: JSON.stringify({ password: pw }) }); }
    catch (e) { setError(e.message); }
  };

  const setActive = async (a, active) => {
    try {
      if (active) await api(`/super/admins/${a.id}`, { method: 'PATCH', body: JSON.stringify({ is_active: true }) });
      else await api(`/super/admins/${a.id}`, { method: 'DELETE' });
      await load();
      onChanged && onChanged();
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="px-5 py-4">
      <div className="mb-2 flex items-center justify-between">
        <strong className="text-sm text-slate-300">Admins — {company.name}</strong>
        {!creating && <button className={BTN_SM} onClick={openCreate}>+ Add admin</button>}
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}

      {creating && (
        <form onSubmit={createAdmin} className="mb-3 rounded-lg border border-slate-800 bg-slate-900 p-3">
          {leaderWarn && <WarnBox>{leaderWarn}</WarnBox>}
          <div className="flex flex-wrap items-end gap-2">
            <Field label="Legacy leader">
              <select className={`${INP} min-w-[300px]`} value={form.legacy_admin_id} onChange={(e) => pickLeader(e.target.value)}>
                <option value="">➕ Create a new dedicated leader (recommended)</option>
                {leaders.map((l) => (
                  <option key={l.legacy_admin_id} value={l.legacy_admin_id}>
                    bind existing: {l.firstName} {l.lastName}{l.companyName ? ` — ${l.companyName}` : ''} ({l.email}) #{l.legacy_admin_id}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Name"><input className={INP} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
            <Field label="Email"><input className={INP} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></Field>
            <Field label="Temp password (≥10)"><input className={INP} type="text" minLength={10} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></Field>
            <button type="submit" className={BTN}>Create</button>
            <button type="button" className={BTN_GHOST} onClick={() => setCreating(false)}>Cancel</button>
          </div>
          <div className="mt-1.5 text-xs text-slate-500">
            Leave the leader as “Create a new dedicated leader” to auto-provision an isolated, marked
            legacy account for this company (no manual SQL). Pick an existing one only to re-bind.
            {!leaders.length && !leaderWarn && ' (No existing dashboard-managed leaders yet.)'}
          </div>
        </form>
      )}

      {loading ? <div className="text-xs text-slate-500">Loading admins…</div> : (
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="text-left text-slate-500">
              <th className={TH_SM}>Name</th><th className={TH_SM}>Email</th><th className={TH_SM}>Role</th>
              <th className={TH_SM}>Legacy ID</th><th className={TH_SM}>State</th><th className={TH_SM}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className={`border-t border-slate-800 ${a.is_active ? '' : 'opacity-50'}`}>
                <td className={TD_SM}>{a.name || '—'}</td>
                <td className={TD_SM}>{a.email}</td>
                <td className={TD_SM}>{a.role}</td>
                <td className={TD_SM}>{a.legacy_admin_id ?? '—'}</td>
                <td className={TD_SM}>{a.is_active ? <span className="text-green-500">active</span> : <span className="text-slate-400">revoked</span>}</td>
                <td className={TD_SM}>
                  <button className={LINK} onClick={() => resetPassword(a)}>Reset pw</button>
                  {a.is_active
                    ? <button className={LINK} onClick={() => setActive(a, false)}>Revoke</button>
                    : <button className={LINK} onClick={() => setActive(a, true)}>Reactivate</button>}
                </td>
              </tr>
            ))}
            {!admins.length && <tr><td className={TD_SM} colSpan={6}><span className="text-slate-500">No admins yet.</span></td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Per-company mobile users ────────────────────────────────────────────────
// Creates tenant-stamped mobile users — the console replacement for the legacy
// import-employees sync. The backend returns a one-time temp password (when not
// emailed) to hand to the user.
function EmployeePanel({ company, onChanged }) {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [lastCreated, setLastCreated] = useState(null);
  const [form, setForm] = useState({ firstname: '', lastname: '', email: '', designation: '' });
  const [importing, setImporting] = useState(false);
  const [importText, setImportText] = useState('');
  const [importSendEmail, setImportSendEmail] = useState(true);
  const [importBusy, setImportBusy] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { employees } = await api(`/super/companies/${company.id}/employees`);
      setEmployees(employees);
      setError('');
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, [company.id]);

  useEffect(() => { load(); }, [load]);

  const createEmployee = async (e) => {
    e.preventDefault();
    try {
      const res = await api(`/super/companies/${company.id}/employees`, {
        method: 'POST',
        body: JSON.stringify({
          firstname: form.firstname,
          lastname: form.lastname,
          email: form.email,
          designation: form.designation || undefined,
        }),
      });
      setLastCreated({ email: form.email, tempPassword: res.tempPassword, questionnairesLinked: res.questionnairesLinked });
      setForm({ firstname: '', lastname: '', email: '', designation: '' });
      setCreating(false);
      await load();
      onChanged && onChanged();
    } catch (e) { setError(e.message); }
  };

  // Bulk import — one employee per line: firstname, lastname, email[, designation[, department]]
  const parseImportLines = (text) =>
    text.split('\n').map((l) => l.trim()).filter(Boolean).map((line) => {
      const [firstname = '', lastname = '', email = '', designation = '', department = ''] =
        line.split(',').map((p) => p.trim());
      return {
        firstname, lastname, email,
        designation: designation || undefined,
        department: department || undefined,
      };
    });

  const runImport = async (e) => {
    e.preventDefault();
    const rows = parseImportLines(importText);
    if (!rows.length) { setError('Nothing to import — paste one employee per line.'); return; }
    const bad = rows.findIndex((r) => !r.firstname || !r.lastname || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r.email));
    if (bad !== -1) { setError(`Line ${bad + 1} is invalid — expected: firstname, lastname, email[, designation[, department]]`); return; }
    setImportBusy(true);
    try {
      const res = await api(`/super/companies/${company.id}/employees/import`, {
        method: 'POST',
        body: JSON.stringify({ employees: rows, sendEmail: importSendEmail }),
      });
      setImportResult(res);
      setImportText('');
      setError('');
      await load();
      onChanged && onChanged();
    } catch (e2) { setError(e2.message); }
    setImportBusy(false);
  };

  return (
    <div className="px-5 py-4">
      <div className="mb-2 flex items-center justify-between">
        <strong className="text-sm text-slate-300">Mobile users — {company.name}</strong>
        <div className="flex gap-1.5">
          {!creating && !importing && <button className={BTN_SM} onClick={() => { setCreating(true); setLastCreated(null); setImportResult(null); }}>+ Add user</button>}
          {!creating && !importing && <button className={BTN_SM} onClick={() => { setImporting(true); setLastCreated(null); setImportResult(null); }}>⇪ Import employees</button>}
        </div>
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}

      {lastCreated && lastCreated.tempPassword && (
        <WarnBox>
          Created <strong>{lastCreated.email}</strong> — temp password: <code className="select-all">{lastCreated.tempPassword}</code>
          {' '}(shown once — share it with the user now)
          {lastCreated.questionnairesLinked > 0 && <> · linked {lastCreated.questionnairesLinked} existing questionnaire(s)</>}
        </WarnBox>
      )}

      {creating && (
        <form onSubmit={createEmployee} className="mb-3 rounded-lg border border-slate-800 bg-slate-900 p-3">
          <div className="flex flex-wrap items-end gap-2">
            <Field label="First name"><input className={INP} value={form.firstname} onChange={(e) => setForm({ ...form, firstname: e.target.value })} required /></Field>
            <Field label="Last name"><input className={INP} value={form.lastname} onChange={(e) => setForm({ ...form, lastname: e.target.value })} required /></Field>
            <Field label="Email"><input className={INP} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></Field>
            <Field label="Designation (optional)"><input className={INP} value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></Field>
            <button type="submit" className={BTN}>Create</button>
            <button type="button" className={BTN_GHOST} onClick={() => setCreating(false)}>Cancel</button>
          </div>
          <div className="mt-1.5 text-xs text-slate-500">
            A temp password is generated and shown once. The user signs in with it in the mobile app.
          </div>
        </form>
      )}

      {importing && (
        <form onSubmit={runImport} className="mb-3 rounded-lg border border-slate-800 bg-slate-900 p-3">
          <div className="mb-1.5 text-xs text-slate-300">
            Bulk import — one employee per line: <code>firstname, lastname, email[, designation[, department]]</code>
          </div>
          <textarea
            className={`${INP} min-h-[110px] w-full resize-y font-mono`}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={'Jane, Doe, jane.doe@acme.com, Engineer\nJohn, Smith, john.smith@acme.com'}
            required
          />
          <div className="mt-2 flex items-center gap-2.5">
            <label className="flex items-center gap-1.5 text-xs text-slate-400">
              <input type="checkbox" checked={importSendEmail} onChange={(e) => setImportSendEmail(e.target.checked)} />
              Email each user their temp password
            </label>
            <button type="submit" className={BTN} disabled={importBusy}>{importBusy ? 'Importing…' : `Import${importText.trim() ? ` (${parseImportLines(importText).length})` : ''}`}</button>
            <button type="button" className={BTN_GHOST} onClick={() => { setImporting(false); setImportText(''); }}>Cancel</button>
          </div>
          <div className="mt-1.5 text-xs text-slate-500">
            Each user is created under this company (tenant-stamped) and can sign in to the mobile app.
            Existing emails are skipped. When emailing is off, temp passwords are shown once below.
          </div>
        </form>
      )}

      {importResult && (
        <div className="mb-3 rounded-lg border border-slate-800 bg-slate-900 p-3">
          <div className="mb-1.5 text-xs text-slate-300">
            Import done — <span className="text-green-400">{importResult.created} created</span>,{' '}
            <span className="text-amber-300">{importResult.skipped} skipped</span>,{' '}
            <span className="text-red-400">{importResult.failed} failed</span>
            <button className={`${LINK} ml-2.5`} onClick={() => setImportResult(null)}>dismiss</button>
          </div>
          <table className="w-full border-collapse text-xs">
            <tbody>
              {(importResult.details || []).map((d, i) => (
                <tr key={i} className="border-t border-slate-800">
                  <td className={TD_SM}>{d.email}</td>
                  <td className={TD_SM}>
                    {d.status === 'created' && <span className="text-green-400">created</span>}
                    {d.status === 'skipped' && <span className="text-amber-300">skipped — {d.reason}</span>}
                    {d.status === 'failed' && <span className="text-red-400">failed — {d.reason}</span>}
                  </td>
                  <td className={TD_SM}>
                    {d.tempPassword
                      ? <>temp pw: <code className="select-all">{d.tempPassword}</code></>
                      : (d.status === 'created' ? 'password emailed' : '')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading ? <div className="text-xs text-slate-500">Loading users…</div> : (
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="text-left text-slate-500">
              <th className={TH_SM}>Name</th><th className={TH_SM}>Email</th>
              <th className={TH_SM}>Owner (legacy admin)</th><th className={TH_SM}>Created</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((u) => (
              <tr key={u.id} className="border-t border-slate-800">
                <td className={TD_SM}>{`${u.firstname || ''} ${u.lastname || ''}`.trim() || '—'}</td>
                <td className={TD_SM}>{u.email}</td>
                <td className={TD_SM}>#{u.admin_id}</td>
                <td className={TD_SM}>{u.created_at ? String(u.created_at).slice(0, 10) : '—'}</td>
              </tr>
            ))}
            {!employees.length && <tr><td className={TD_SM} colSpan={4}><span className="text-slate-500">No mobile users yet.</span></td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Per-company analytics datasets ──────────────────────────────────────────
// Edits company_dashboard_datasets — the JSON behind each formerly-hardcoded panel.
const LIST_KEYS = ['projections', 'asiDatabase', 'maDeals', 'mergerRecommendations'];

function DataPanel({ company }) {
  const [allKeys, setAllKeys] = useState([]);
  const [stored, setStored] = useState({});
  const [sel, setSel] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fillEditor = useCallback((key, storedMap) => {
    const row = storedMap[key];
    if (row && row.data !== undefined && row.data !== null) {
      setText(JSON.stringify(row.data, null, 2));
    } else {
      setText(LIST_KEYS.includes(key) ? '[]' : '{}'); // empty template for unset key
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { allKeys, stored } = await api(`/super/companies/${company.id}/datasets`);
      setAllKeys(allKeys || []);
      setStored(stored || {});
      const first = sel || (allKeys && allKeys[0]) || '';
      setSel(first);
      fillEditor(first, stored || {});
      setError('');
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, [company.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const pickKey = (key) => {
    setSel(key); setOkMsg(''); setError('');
    fillEditor(key, stored);
  };

  const save = async () => {
    setOkMsg(''); setError('');
    let payload;
    try { payload = JSON.parse(text); }
    catch (e) { setError(`Invalid JSON: ${e.message}`); return; }
    const wantList = LIST_KEYS.includes(sel);
    if (Array.isArray(payload) !== wantList) {
      setError(`Dataset '${sel}' expects a JSON ${wantList ? 'array []' : 'object {}'}.`);
      return;
    }
    setSaving(true);
    try {
      const res = await api(`/super/companies/${company.id}/dataset/${sel}`, {
        method: 'PUT', body: JSON.stringify({ payload }),
      });
      setOkMsg(`Saved ${sel} (${res.bytes} bytes). The company's ${sel} panel now shows this data.`);
      setStored((s) => ({ ...s, [sel]: { data: payload, bytes: res.bytes, updated_at: 'just now' } }));
    } catch (e) { setError(e.message); }
    setSaving(false);
  };

  const meta = stored[sel];
  return (
    <div className="px-5 py-4">
      <div className="mb-2 flex items-center justify-between">
        <strong className="text-sm text-slate-300">Analytics data — {company.name}</strong>
        {meta
          ? <span className="text-xs text-slate-500">{sel}: {meta.bytes} bytes · updated {String(meta.updated_at).slice(0, 19).replace('T', ' ')}</span>
          : <span className="text-xs text-slate-500">{sel}: not set (panel shows empty state)</span>}
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}
      {okMsg && <OkBox>{okMsg}</OkBox>}

      {loading ? <div className="text-xs text-slate-500">Loading datasets…</div> : (
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
          <div className="mb-2 flex flex-wrap items-end gap-2">
            <Field label="Dataset">
              <select className={`${INP} min-w-[220px]`} value={sel} onChange={(e) => pickKey(e.target.value)}>
                {allKeys.map((k) => (
                  <option key={k} value={k}>{k}{stored[k] ? '  ✓' : '  —'}{LIST_KEYS.includes(k) ? '  [array]' : '  {object}'}</option>
                ))}
              </select>
            </Field>
            <button type="button" className={BTN} onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save dataset'}</button>
            <button type="button" className={BTN_GHOST} onClick={() => fillEditor(sel, stored)}>Reset</button>
          </div>
          <textarea
            className={`${INP} min-h-[260px] w-full resize-y font-mono text-xs`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
          />
          <div className="mt-1.5 text-xs text-slate-500">
            Edit the JSON for this company's <code>{sel}</code> panel. ✓ = already set. Saving writes only
            this company's row (tenant-scoped, audit-logged). Leave as <code>{LIST_KEYS.includes(sel) ? '[]' : '{}'}</code> to clear it.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Audit log ───────────────────────────────────────────────────────────────
function AuditView() {
  const [events, setEvents] = useState([]);
  const [meta, setMeta] = useState({ total: 0, limit: 100, offset: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (offset = 0) => {
    setLoading(true);
    try {
      const res = await api(`/super/audit?limit=100&offset=${offset}`);
      setEvents(res.events || []);
      setMeta({ total: res.total ?? 0, limit: res.limit ?? 100, offset: res.offset ?? 0 });
      setError('');
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { load(0); }, [load]);

  const { total, limit, offset } = meta;
  return (
    <>
      {error && <ErrorBox>{error}</ErrorBox>}
      <div className="my-3 text-xs text-slate-400">
        {total} event(s) · showing {events.length ? offset + 1 : 0}–{offset + events.length}
      </div>
      {loading ? <div className="text-slate-500">Loading…</div> : (
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-400">
              <th className={TH}>When</th><th className={TH}>Actor</th><th className={TH}>Action</th>
              <th className={TH}>Company</th><th className={TH}>Target user</th><th className={TH}>IP</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b border-slate-800">
                <td className={TD}>{e.created_at}</td>
                <td className={TD}>#{e.actor_user_id} <span className="text-slate-500">({e.actor_role})</span></td>
                <td className={TD}><span className="text-sky-400">{e.action}</span></td>
                <td className={TD}>{e.target_company_id ?? '—'}</td>
                <td className={TD}>{e.target_user_id ?? '—'}</td>
                <td className={TD}>{e.ip ?? '—'}</td>
              </tr>
            ))}
            {!events.length && <tr><td className={TD} colSpan={6}><span className="text-slate-500">No events.</span></td></tr>}
          </tbody>
        </table>
      )}
      <div className="mt-3 flex gap-2">
        <button className={BTN_GHOST} disabled={offset === 0} onClick={() => load(Math.max(0, offset - limit))}>← Newer</button>
        <button className={BTN_GHOST} disabled={offset + limit >= total} onClick={() => load(offset + limit)}>Older →</button>
      </div>
    </>
  );
}

// ─── shared UI bits / Tailwind class tokens ──────────────────────────────────
const INP = 'rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-sm text-white';
const BTN = 'rounded-md bg-cyan-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50';
const BTN_SM = 'rounded-md bg-cyan-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50';
const BTN_GHOST = 'rounded-md border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-50';
const LINK = 'text-sm text-sky-400 hover:text-sky-300 disabled:opacity-40';
const TH = 'px-1.5 py-2 font-semibold';
const TD = 'px-1.5 py-2.5 align-top';
const TH_SM = 'px-1.5 py-1.5 font-semibold';
const TD_SM = 'px-1.5 py-1.5 align-top text-slate-300';

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={active
        ? 'rounded-md bg-cyan-600 px-3.5 py-1.5 text-sm font-semibold text-white'
        : 'rounded-md border border-slate-700 px-3.5 py-1.5 text-sm text-slate-400 hover:bg-slate-800'}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return <label className="flex flex-col gap-0.5 text-xs text-slate-400">{label}{children}</label>;
}

function ErrorBox({ children }) {
  return <div className="my-3 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300">{children}</div>;
}

function WarnBox({ children }) {
  return <div className="my-3 rounded-md bg-amber-500/10 px-3 py-2 text-sm text-amber-300">{children}</div>;
}

function OkBox({ children }) {
  return <div className="my-3 rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-300">{children}</div>;
}
