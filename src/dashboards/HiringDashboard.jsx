// Hiring & On-Boarding — view id `hiring`.
// Phase 2 (client requirement): live tenant hiring pipeline. Jobs are tenant-scoped;
// the applicant pool = ONLY users who applied/expressed interest via the phone app
// (GET /dashboard/hiring). Each applicant carries the client's status field
// ("Applied" vs "Interested"), applied date, and an ASI profile matched against the
// job's ASSET target with the fill-jobs fit logic (calcFit/calcR2 — same numbers).
//
// The public demo build (VITE_AUTH_DISABLED) keeps the legacy demo pipeline view
// (v1.24L App.jsx 8467–8522); a real company login only ever sees live data.
import { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardShell from '../components/DashboardShell.jsx';
import { MetricCard, Panel } from '../components/primitives.jsx';
import RecommendationPanel from '../components/RecommendationPanel.jsx';
import { FinancialKPICard } from '../components/financial.jsx';
import { StatTile } from './employee-leading/parts.jsx';
import StyleRadar, { STYLE_POINT_COLORS } from './shared/StyleRadar.jsx';
import { calcFit, calcR2, fitLabel, bandsForScores, scoreText } from './fill-jobs/logic.js';
import { CANDIDATE_COLORS } from '../data/datasets/fill-jobs.js';
import { dashFetch } from '../lib/auth.js';

const DEMO_BUILD = import.meta.env.VITE_AUTH_DISABLED === 'true';

const STATUS_ACCENT = { good: '#10b981', warning: '#f59e0b', danger: '#ef4444' };

// ── Live tenant view ─────────────────────────────────────────────────────────

const STATUS_BADGE = {
  applied: 'border-emerald-500/50 bg-emerald-900/20 text-emerald-400',
  interested: 'border-amber-500/50 bg-amber-900/20 text-amber-400',
};

const FIT_CLS = {
  best: 'text-emerald-400',
  good: 'text-sky-400',
  fair: 'text-amber-400',
  weak: 'text-red-400',
};

function fmtDate(d) {
  if (!d) return '—';
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? String(d).slice(0, 10) : t.toLocaleDateString();
}

// ── Post a Job (Phase-2b) ────────────────────────────────────────────────────

const EMPTY_FORM = { title: '', dept: '', location: '', salary: '', positions: 1, deadline: '', description: '' };

function PostJobForm({ onCreated, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [deriveAsset, setDeriveAsset] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setBusy(true);
    setError('');
    const payload = {
      ...form,
      title: form.title.trim(),
      positions: Number(form.positions) || 1,
      status: 'ACTIVE',
    };
    // Reuse the fill-jobs interpreter so the posted role has an ASSET target
    // (fit ranking needs one); admins refine later via the fill-jobs tool.
    if (deriveAsset && form.description.trim()) {
      payload.asset = scoreText(form.description);
    }
    try {
      const res = await dashFetch('/dashboard/jobs', { method: 'POST', body: JSON.stringify(payload) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `Failed (${res.status})`);
      onCreated();
    } catch (err) {
      setError(err.message || 'Failed to post the job.');
      setBusy(false);
    }
  };

  const field = 'w-full rounded-md border border-border bg-ink px-3 py-2 text-sm text-slate-100 placeholder:text-subtle focus:border-accent focus:outline-none';

  return (
    <Panel title="📮 Post a Job" right={
      <button onClick={onCancel} className="text-xs text-muted hover:text-slate-200">✕ Cancel</button>
    }>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input className={field} placeholder="Job title *" value={form.title} onChange={set('title')} required />
          <input className={field} placeholder="Department" value={form.dept} onChange={set('dept')} />
          <input className={field} placeholder="Location" value={form.location} onChange={set('location')} />
          <input className={field} placeholder="Salary (e.g. $90k–$110k)" value={form.salary} onChange={set('salary')} />
          <input className={field} type="number" min="1" placeholder="Positions" value={form.positions} onChange={set('positions')} />
          <input className={field} placeholder="Deadline (e.g. 2026-08-31)" value={form.deadline} onChange={set('deadline')} />
        </div>
        <textarea
          className={`${field} min-h-[120px]`}
          placeholder="Job description — responsibilities, requirements, context. Used to derive the ASSET profile."
          value={form.description}
          onChange={set('description')}
        />
        <label className="flex items-center gap-2 text-xs text-muted">
          <input type="checkbox" checked={deriveAsset} onChange={(e) => setDeriveAsset(e.target.checked)} />
          Derive the ASSET achieving-styles target from the description (CLI fill-jobs methodology)
        </label>
        {error && <p className="text-xs font-semibold text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {busy ? 'Posting…' : 'Post job'}
        </button>
      </form>
    </Panel>
  );
}

function JobCard({ job, onChanged }) {
  const hasTarget = job.asset?.some((v) => v > 0);
  const bands = useMemo(() => (hasTarget ? bandsForScores(job.asset) : null), [job.asset, hasTarget]);
  const [showRadar, setShowRadar] = useState(false);

  // Rank applicants by fit when both sides have profiles (fit ascending = best first).
  const ranked = useMemo(() => {
    const annotated = (job.applicants ?? []).map((a, i) => {
      const scorable = hasTarget && Array.isArray(a.scores);
      return {
        ...a,
        color: CANDIDATE_COLORS[i % CANDIDATE_COLORS.length],
        fit: scorable ? calcFit(a.scores, { scores: job.asset, bands }) : null,
        r2: scorable ? calcR2(a.scores, job.asset) : null,
      };
    });
    annotated.sort((x, y) => (x.fit ?? Infinity) - (y.fit ?? Infinity));
    return annotated;
  }, [job.applicants, job.asset, bands, hasTarget]);

  const applied = ranked.filter((a) => a.status === 'applied').length;
  const interested = ranked.length - applied;
  const overlayable = ranked.filter((a) => Array.isArray(a.scores));

  return (
    <Panel
      title={`💼 ${job.title}`}
      right={
        <div className="flex items-center gap-2 text-[11px] text-muted">
          {[job.dept, job.location, job.positions ? `${job.positions} position${job.positions > 1 ? 's' : ''}` : null, job.deadline ? `Deadline ${job.deadline}` : null]
            .filter(Boolean)
            .map((m) => <span key={m}>{m}</span>)}
          <JobActions job={job} onChanged={onChanged} />
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-emerald-500/50 bg-emerald-900/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
          {applied} Applied
        </span>
        <span className="rounded-full border border-amber-500/50 bg-amber-900/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-400">
          {interested} Interested
        </span>
        {hasTarget && overlayable.length > 0 && (
          <button
            onClick={() => setShowRadar((s) => !s)}
            className="ml-auto rounded-md border border-border bg-ink px-3 py-1 text-[11px] font-semibold text-slate-100 hover:border-accent"
          >
            {showRadar ? 'Hide' : 'Show'} ASI radar
          </button>
        )}
      </div>

      {ranked.length === 0 ? (
        <p className="py-4 text-sm italic text-muted">
          No applicants yet — employees apply to this role from the mobile app.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted">
                <th className="py-2 pr-4">Applicant</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Fit</th>
                <th className="py-2 pr-4">Profile match</th>
                <th className="py-2 pr-4">Applied</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((a) => {
                const fl = a.fit != null ? fitLabel(a.fit) : null;
                return (
                  <tr key={a.userId} className="border-b border-border/50">
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full" style={{ background: a.color }} />
                        <div>
                          <div className="font-semibold text-slate-100">{a.name}</div>
                          <div className="text-[11px] text-muted">{a.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${STATUS_BADGE[a.status] ?? 'border-border text-muted'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className={`py-2 pr-4 font-semibold ${fl ? FIT_CLS[fl.cls] : 'text-muted'}`}>
                      {fl ? fl.t : 'No ASI profile'}
                    </td>
                    <td className="py-2 pr-4 font-mono text-slate-200">
                      {a.r2 != null ? `${Math.round(parseFloat(a.r2) * 100)}%` : '—'}
                    </td>
                    <td className="py-2 pr-4 text-muted">{fmtDate(a.appliedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showRadar && hasTarget && (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
          <StyleRadar
            datasets={[
              { label: 'ASSET target', data: job.asset, color: '#64a0dc', fillOpacity: 0.12, pointColors: STYLE_POINT_COLORS },
              ...overlayable.slice(0, 6).map((a) => ({ label: a.name, data: a.scores, color: a.color, dash: true })),
            ]}
            band={{ outer: job.asset.map((v, i) => v + bands[i]), inner: job.asset.map((v, i) => v - bands[i]) }}
            className="w-full max-w-[320px]"
          />
          <div className="text-xs text-muted">
            <p className="mb-2 font-semibold text-slate-200">ASSET target vs applicant ASI profiles (raw 1–7)</p>
            <ul className="space-y-1">
              {overlayable.slice(0, 6).map((a) => (
                <li key={a.userId} className="flex items-center gap-2">
                  <span className="inline-block h-2 w-4 rounded-sm" style={{ background: a.color }} />
                  {a.name}
                </li>
              ))}
            </ul>
            {overlayable.length > 6 && <p className="mt-2 italic">Showing the 6 best-fit profiles.</p>}
          </div>
        </div>
      )}
    </Panel>
  );
}

function JobActions({ job, onChanged }) {
  const [busy, setBusy] = useState(false);
  // Legacy jobs.status enum: ACTIVE / EXPIRED / DRAFT (no CLOSED value).
  const closed = job.status?.toUpperCase() !== 'ACTIVE';

  const call = async (method, path, body) => {
    setBusy(true);
    try {
      const res = await dashFetch(path, { method, ...(body ? { body: JSON.stringify(body) } : {}) });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      onChanged();
    } catch {
      setBusy(false);
    }
  };

  const btn = 'rounded-md border border-border bg-ink px-2.5 py-1 text-[10px] font-semibold text-slate-200 hover:border-accent disabled:opacity-40';

  return (
    <span className="ml-2 flex items-center gap-1.5">
      <button
        disabled={busy}
        className={btn}
        onClick={() => call('PATCH', `/dashboard/jobs/${job.id}`, { status: closed ? 'ACTIVE' : 'EXPIRED' })}
      >
        {closed ? 'Reopen' : 'Close'}
      </button>
      <button
        disabled={busy}
        className={`${btn} hover:border-red-500 hover:text-red-400`}
        onClick={() => {
          if (window.confirm(`Delete "${job.title}" and its ${job.applicants?.length ?? 0} application(s)? This cannot be undone.`)) {
            call('DELETE', `/dashboard/jobs/${job.id}`);
          }
        }}
      >
        Delete
      </button>
    </span>
  );
}

function LiveHiring() {
  // Manual fetch (not the cached live-data hooks) so posting/closing/deleting
  // a job can refresh the pipeline immediately.
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await dashFetch('/dashboard/hiring');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const refresh = useCallback(() => { setShowForm(false); load(); }, [load]);

  const jobs = data?.jobs ?? [];

  const totals = useMemo(() => {
    const apps = jobs.flatMap((j) => j.applicants ?? []);
    return {
      jobs: jobs.length,
      applicants: apps.length,
      applied: apps.filter((a) => a.status === 'applied').length,
      interested: apps.filter((a) => a.status === 'interested').length,
    };
  }, [jobs]);

  let body;
  if (status === 'loading') {
    body = <p className="text-sm text-muted">Loading your hiring pipeline…</p>;
  } else if (status === 'error') {
    body = (
      <>
        <p className="text-sm font-semibold text-red-400">Couldn't load your hiring pipeline.</p>
        <p className="mt-2 text-sm text-muted">
          Your session may have expired or the backend is unreachable. Refresh the page and sign in again —
          if it persists, contact your administrator.
        </p>
      </>
    );
  }

  if (body) {
    return <div className="mx-auto mt-10 max-w-xl rounded-xl border border-border bg-panel p-8">{body}</div>;
  }

  if (jobs.length === 0) {
    return (
      <div className="mx-auto mt-10 max-w-2xl space-y-4">
        {showForm ? (
          <PostJobForm onCreated={refresh} onCancel={() => setShowForm(false)} />
        ) : (
          <div className="rounded-xl border border-border bg-panel p-8">
            <p className="text-sm font-semibold text-amber-400">No open positions yet.</p>
            <p className="mt-2 text-sm text-muted">
              Post your first position below — employees then apply or express interest from the CLI
              mobile app, and applicants are matched to the role's ASSET profile automatically.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
            >
              + Post a Job
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="grid flex-1 grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile value={totals.jobs} label="Open positions" tone="slate" center />
          <StatTile value={totals.applicants} label="App applicants" tone="slate" center />
          <StatTile value={totals.applied} label="Applied" tone="emerald" center />
          <StatTile value={totals.interested} label="Interested" tone="amber" center />
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
        >
          {showForm ? '✕ Cancel' : '+ Post a Job'}
        </button>
      </div>
      {showForm && <PostJobForm onCreated={refresh} onCancel={() => setShowForm(false)} />}
      {jobs.map((j) => <JobCard key={j.id} job={j} onChanged={load} />)}
      <p className="text-[11px] italic text-subtle">
        Applicant pool = employees who applied via the CLI mobile app. Fit compares each applicant's
        ASI profile to the role's ASSET target (CLI fill-jobs methodology).
      </p>
    </div>
  );
}

// ── Legacy demo view (public demo build only) ────────────────────────────────

const HIRING_METRICS = [
  { label: 'Time to Hire', value: 32, unit: ' days', benchmark: '28', trend: 8, status: 'warning' },
  { label: 'Offer Accept Rate', value: 78, unit: '%', benchmark: '82%', trend: -5, status: 'warning' },
  { label: '90-Day Retention', value: 91, unit: '%', benchmark: '88%', trend: 4, status: 'good' },
  { label: 'Time to Productivity', value: 32, unit: ' days', benchmark: '28', trend: -8, status: 'warning' },
];

const SENTIMENT_JOURNEY = [
  { value: '8.2', label: 'Day 30', tone: 'emerald' },
  { value: '7.4', label: 'Day 60', tone: 'amber' },
  { value: '6.8', label: 'Day 90', tone: 'red' },
];

function DemoHiring() {
  return (
    <div className="space-y-6">
      <RecommendationPanel
        severity="warning"
        title="Sales Pipeline Health Affecting Hiring Decisions"
        evidence={[
          'Sales Cycle at 78 days (below 90-day threshold - healthy)',
          'Lead Conversion at 3.8% (below 5% threshold - poor)',
          'CAC Payback at 14 months (above 12mo threshold)',
          'New hire sentiment drops from 8.2 to 6.8 by day 90',
        ]}
        strategy="Low lead conversion suggests inefficient funnel. Pause sales hiring until conversion improves. Focus on onboarding enhancement to reduce 90-day sentiment drop."
        tactics={[
          { title: 'Sales Funnel Analysis', description: 'Identify conversion bottlenecks', deliverable: 'Funnel Report', canCreate: true },
          { title: 'Onboarding Redesign', description: 'Improve 30-60 day experience', deliverable: 'Onboarding Program', canCreate: true },
        ]}
      />

      <Panel title="📊 Sales Pipeline Health (Hiring Indicators)">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FinancialKPICard label="Sales Cycle" value={78} unit=" days" threshold="90" thresholdDir="<" status="good" trigger={null} />
          <FinancialKPICard label="Lead Conversion" value={3.8} unit="%" threshold="5" thresholdDir=">" status="danger" trigger="Pause Sales Hiring" />
          <FinancialKPICard label="CAC Payback" value={14} unit=" mo" threshold="12" thresholdDir="<" status="warning" trigger="Evaluate Sales ROI" />
          <StatTile value="2.4x" label="Pipeline Coverage" sub="Target: 3.0x" tone="slate" />
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {HIRING_METRICS.map((m) => (
          <MetricCard
            key={m.label}
            label={m.label}
            value={m.value}
            unit={m.unit}
            delta={m.trend}
            hint={`Benchmark: ${m.benchmark}`}
            accent={STATUS_ACCENT[m.status]}
          />
        ))}
      </div>

      <Panel title="📉 New Hire Sentiment Journey">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SENTIMENT_JOURNEY.map((s) => (
            <StatTile key={s.label} value={s.value} label={s.label} tone={s.tone} center />
          ))}
          <StatTile value="-17%" label="Drop Rate" sub="30d to 90d" tone="red" />
        </div>
      </Panel>
    </div>
  );
}

export default function HiringDashboard() {
  return (
    <DashboardShell
      title="Hiring & On-Boarding"
      subtitle={DEMO_BUILD
        ? 'Candidate pipeline, on-boarding effectiveness, and early retention signals'
        : 'Live hiring pipeline — applicants from the CLI mobile app, matched to each role'}
      icon="📝"
    >
      {DEMO_BUILD ? <DemoHiring /> : <LiveHiring />}
    </DashboardShell>
  );
}
