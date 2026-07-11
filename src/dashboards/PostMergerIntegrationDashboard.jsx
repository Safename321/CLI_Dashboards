// Post Merger Integration — view id `merger-integration`.
// Legacy spec: v1.24L App.jsx 8238-8312 (reuses the employee-leading tab set).
//
// Phase 3 (D4): tenant-real. A real login shows the acquired-vs-legacy cohort
// comparison computed live from /dashboard/cohort-metrics (cohorts set via the
// SuperAdmin cohort editor / PUT /dashboard/cohorts). The demo build keeps the
// rich employee-leading tab set. Depends on D3's metric_snapshots plumbing.
import { useState } from 'react';
import DashboardShell from '../components/DashboardShell.jsx';
import { EMPLOYEE_LEADING_DATA, EMPLOYEE_TABS } from '../data/datasets/employee-leading.js';
import { EMPLOYEE_TAB_VIEWS } from './employee-leading/EmployeeLeadingDashboard.jsx';
import { ExecutiveSummaryTab } from './employee-leading/SummaryTabs.jsx';
import { useCohortMetrics } from '../lib/liveData.js';

const DEMO_BUILD = import.meta.env.VITE_AUTH_DISABLED === 'true';

function HeadlineStat({ value, label, valueClass }) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${valueClass}`}>{value}</div>
      <div className="text-xs text-subtle">{label}</div>
    </div>
  );
}

// ── Live cohort comparison (D4) ──────────────────────────────────────────────

const fmt = (v, suffix = '') => (v == null ? '—' : `${v}${suffix}`);

function CohortColumn({ title, tone, m }) {
  const border = tone === 'acquired' ? 'border-amber-500/40' : tone === 'legacy' ? 'border-cyan-500/40' : 'border-border';
  const head = tone === 'acquired' ? 'text-amber-400' : tone === 'legacy' ? 'text-cyan-400' : 'text-slate-300';
  if (!m) {
    return (
      <div className={`rounded-xl border ${border} bg-panel p-5`}>
        <div className={`mb-2 text-sm font-bold uppercase tracking-wide ${head}`}>{title}</div>
        <p className="text-sm italic text-muted">No employees tagged to this cohort yet.</p>
      </div>
    );
  }
  const hc = Math.max(1, m.headcount || 1);
  const flightPct = Math.round(((m.flightRisk || 0) / hc) * 100);
  const rows = [
    ['Headcount', fmt(m.headcount)],
    ['Participation', fmt(m.participation, '%')],
    ['Sentiment', fmt(m.sentiment, '/10')],
    ['eNPS', fmt(m.enps)],
    ['Flight risk', `${fmt(m.flightRisk)} (${flightPct}%)`],
    ['Org OASI mean', fmt(m.oasiMean, ' /7')],
  ];
  return (
    <div className={`rounded-xl border ${border} bg-panel p-5`}>
      <div className={`mb-3 text-sm font-bold uppercase tracking-wide ${head}`}>{title}</div>
      <dl className="space-y-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between border-b border-border/40 pb-1.5 text-sm last:border-0">
            <dt className="text-muted">{k}</dt>
            <dd className="font-mono text-slate-100">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// The integration-gap read: acquired minus legacy on the key signals.
function IntegrationGap({ acquired, legacy }) {
  if (!acquired || !legacy) return null;
  const gap = (a, b) => (a == null || b == null ? null : Math.round((a - b) * 10) / 10);
  const items = [
    ['Sentiment gap', gap(acquired.sentiment, legacy.sentiment), '/10', true],
    ['Participation gap', gap(acquired.participation, legacy.participation), '%', true],
    ['Flight-risk gap', gap(
      Math.round((acquired.flightRisk / Math.max(1, acquired.headcount)) * 100),
      Math.round((legacy.flightRisk / Math.max(1, legacy.headcount)) * 100),
    ), '%', false], // higher acquired flight risk = worse
  ];
  return (
    <section className="rounded-xl border border-border bg-gradient-to-br from-panel to-ink p-6">
      <h3 className="mb-4 font-semibold text-white">🔄 Integration Gap — acquired vs legacy</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map(([label, g, unit, higherBetter]) => {
          const tone = g == null ? 'text-muted' : (higherBetter ? g >= 0 : g <= 0) ? 'text-emerald-400' : 'text-red-400';
          return (
            <div key={label} className="rounded-lg border border-border bg-ink/40 p-4 text-center">
              <div className={`text-2xl font-bold ${tone}`}>{g == null ? '—' : `${g > 0 ? '+' : ''}${g}${unit}`}</div>
              <div className="mt-1 text-xs text-muted">{label}</div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] italic text-subtle">
        Gap = acquired − legacy. A negative sentiment/participation gap or a positive flight-risk gap flags acquired-talent integration drag.
      </p>
    </section>
  );
}

function LiveIntegration() {
  const { data, status } = useCohortMetrics(true);

  if (status === 'loading') {
    return <div className="rounded-xl border border-border bg-panel p-6 text-sm text-muted">Loading cohort comparison…</div>;
  }
  if (status === 'error') {
    return (
      <div className="rounded-xl border border-border bg-panel p-6">
        <p className="text-sm font-semibold text-red-400">Couldn't load cohort metrics.</p>
        <p className="mt-1 text-sm text-muted">Refresh and sign in again — if it persists, contact your administrator.</p>
      </div>
    );
  }
  if (!data?.tagged) {
    return (
      <div className="mx-auto mt-6 max-w-xl rounded-xl border border-border bg-panel p-8">
        <p className="text-sm font-semibold text-amber-400">No cohorts tagged yet.</p>
        <p className="mt-2 text-sm text-muted">
          Post-merger integration compares <span className="font-semibold text-amber-300">acquired</span> vs
          <span className="font-semibold text-cyan-300"> legacy</span> employees. Tag employees by cohort
          (SuperAdmin console → cohorts, or <code className="text-slate-300">PUT /dashboard/cohorts</code>) and
          the comparison lights up from your live assessment + check-in data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <IntegrationGap acquired={data.acquired} legacy={data.legacy} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CohortColumn title="Acquired" tone="acquired" m={data.acquired} />
        <CohortColumn title="Legacy" tone="legacy" m={data.legacy} />
        <CohortColumn title="Organization-wide" tone="overall" m={data.overall} />
      </div>
      {data.untagged && data.untagged.headcount > 0 && (
        <p className="text-[11px] italic text-subtle">
          {data.untagged.headcount} employee(s) untagged — tag them to include in the cohort split.
        </p>
      )}
      <p className="text-[11px] italic text-subtle">
        Computed live from your organization's synced assessments and check-ins, segmented by cohort.
      </p>
    </div>
  );
}

// ── Demo view (public demo build — unchanged v1.24L port) ────────────────────
function DemoIntegration() {
  const [tab, setTab] = useState('executive');
  const data = EMPLOYEE_LEADING_DATA;
  const ActiveTab = EMPLOYEE_TAB_VIEWS[tab] || ExecutiveSummaryTab;
  return (
    <DashboardShell
      title="Post Merger Integration"
      subtitle="Enhanced CEO Dashboard • 10 Critical Dimensions • Real-time M&A Health"
      icon="🔄"
      tabs={EMPLOYEE_TABS}
      activeTab={tab}
      onTab={setTab}
      actions={
        <div className="flex items-center gap-6">
          <HeadlineStat value={`$${data.executiveSummary.totalValueAtRisk}M`} label="Value at Risk" valueClass="text-red-400" />
          <HeadlineStat value={data.executiveSummary.flightRisk} label="Flight Risk (Next 12mo)" valueClass="text-amber-400" />
          <HeadlineStat value={data.executiveSummary.criticalTalentRisk} label="Critical Talent at Risk" valueClass="text-cyan-400" />
        </div>
      }
    >
      <ActiveTab data={data} />
    </DashboardShell>
  );
}

export default function PostMergerIntegrationDashboard() {
  if (DEMO_BUILD) return <DemoIntegration />;
  return (
    <DashboardShell
      title="Post Merger Integration"
      subtitle="Acquired vs legacy integration health — live from your organization's data"
      icon="🔄"
    >
      <LiveIntegration />
    </DashboardShell>
  );
}
