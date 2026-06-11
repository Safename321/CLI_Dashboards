// Data Provenance — real-vs-mock audit of every dashboard data category, plus
// live connector provenance (state, freshness, errors) via useRegistry().
// The legacy embedded-PDF download is replaced by a generated HTML report.
import { useMemo, useState } from 'react';
import DashboardShell from '../components/DashboardShell.jsx';
import { Panel, StatusBadge, DataTable } from '../components/primitives.jsx';
import { useRegistry } from '../connectors/RegistryContext.jsx';
import { downloadAuditReport } from './data-provenance/auditReport.js';
import {
  AUDIT_CATEGORIES,
  DATA_TIERS,
  CONFIDENCE_ICONS,
  VERIFIED_SECTIONS,
  MOCK_SECTIONS,
  PROXY_STRATEGIES,
  ROADMAP_PHASES,
  REPORT_BUTTON_SAYINGS,
} from '../data/datasets/data-provenance.js';

const SUMMARY_CARDS = [
  { value: '~35%', label: 'Current Reality Score', sub: 'Verified real data', cls: 'border-red-500/30 bg-red-500/15 text-red-400' },
  { value: '~60%', label: 'Achievable (Public)', sub: 'With free sources', cls: 'border-amber-500/30 bg-amber-500/15 text-amber-400' },
  { value: '~70%', label: 'Achievable (Paid)', sub: 'With premium sources', cls: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400' },
  { value: '7', label: 'Categories Audited', sub: 'Across all dashboards', cls: 'border-blue-500/30 bg-blue-500/15 text-blue-400' },
];

const realPctColor = (pct) => (pct >= 90 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444');
const difficultyCls = (d) =>
  d === 'Easy' ? 'bg-emerald-900/50 text-emerald-300' : d === 'Moderate' ? 'bg-amber-900/50 text-amber-300' : 'bg-red-900/50 text-red-300';

function fetchedLabel(c) {
  if (c.lastSuccessAt) return `Last fetch: ${new Date(c.lastSuccessAt).toLocaleString()}${c.isStale ? ' (stale)' : ''}`;
  if (c.lastFetchAt) return `Attempted: ${new Date(c.lastFetchAt).toLocaleString()} (no success yet)`;
  return 'Never fetched';
}

export default function DataProvenanceDashboard() {
  const { registry, errors, lastRun, running, runAll } = useRegistry();
  // Snapshot connector state; refreshed after every runAll.
  const connectors = useMemo(() => registry.list(), [registry, lastRun, running]);
  // Pick a report-button saying once per mount (legacy rotated by wall clock).
  const [saying] = useState(() => REPORT_BUTTON_SAYINGS[Math.floor(Date.now() / 1000) % REPORT_BUTTON_SAYINGS.length]);

  const categoryColumns = [
    { key: 'category', header: 'Category', render: (c) => <span className="text-white"><span aria-hidden className="mr-2">{c.icon}</span>{c.category}</span> },
    { key: 'realPct', header: 'Current Real %', render: (c) => <span style={{ color: realPctColor(c.realPct) }}>{c.realPct}%</span> },
    { key: 'canBeReal', header: 'Can Be Real %', render: (c) => `${c.canBeReal}%` },
    { key: 'difficulty', header: 'Difficulty', render: (c) => <span className={`rounded px-2 py-0.5 text-xs ${difficultyCls(c.difficulty)}`}>{c.difficulty}</span> },
    {
      key: 'visual',
      header: 'Visual',
      render: (c) => (
        <span className="flex gap-1">
          <span className="h-2 rounded bg-emerald-500" style={{ width: c.realPct }} title="Current Real" />
          <span className="h-2 rounded bg-amber-500" style={{ width: c.canBeReal - c.realPct }} title="Potential" />
        </span>
      ),
    },
  ];

  return (
    <DashboardShell
      title="Data Provenance"
      icon="🔍"
      subtitle="Real vs mock data audit across all dashboards — S&P Global (SPGI)"
      actions={
        <button
          type="button"
          onClick={downloadAuditReport}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
          <span aria-hidden>📄</span>
          <span>{saying}</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Executive summary */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {SUMMARY_CARDS.map((c) => (
            <div key={c.label} className={`rounded-lg border p-4 ${c.cls.split(' ').slice(0, 2).join(' ')}`}>
              <div className={`text-3xl font-bold ${c.cls.split(' ')[2]}`}>{c.value}</div>
              <div className="text-sm text-muted">{c.label}</div>
              <div className="mt-1 text-xs text-subtle">{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Live connector provenance */}
        <Panel
          title="Connector Provenance"
          subtitle="Live state of every registered data connector for this tenant"
          right={
            <button
              type="button"
              onClick={runAll}
              disabled={running}
              className="rounded bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 disabled:bg-slate-700"
            >
              {running ? '⟳ Running…' : '⚡ Refresh all'}
            </button>
          }
        >
          <div className="space-y-2">
            {connectors.map((c) => (
              <div key={c.key} className="flex flex-wrap items-center gap-3 rounded border border-border/60 bg-ink/40 px-3 py-2">
                <StatusBadge status={c.isMock ? 'mock' : 'green'}>{c.isMock ? 'MOCK' : 'REAL'}</StatusBadge>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white">
                    {c.label} <span className="text-xs text-subtle">({c.domain})</span>
                  </div>
                  <div className="text-xs text-muted">
                    {fetchedLabel(c)}
                    {c.lastError && <span className="ml-2 text-red-400">· error: {c.lastError}</span>}
                  </div>
                </div>
                <StatusBadge status={c.enabled ? (c.lastError ? 'red' : 'info') : 'yellow'}>
                  {c.enabled ? (c.lastError ? 'error' : 'enabled') : 'disabled'}
                </StatusBadge>
              </div>
            ))}
          </div>
          {errors.length > 0 && (
            <div className="mt-3 rounded-lg border border-red-500/30 bg-red-900/20 p-3">
              <div className="mb-1 text-sm font-semibold text-red-400">Last run errors ({errors.length})</div>
              <ul className="space-y-0.5 text-xs text-muted">
                {errors.map((e) => (
                  <li key={e.key}>• <span className="text-slate-300">{e.key}</span>: {e.error}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-3 text-xs text-subtle">
            {lastRun
              ? `Last run: ${new Date(lastRun.startedAt).toLocaleString()} · ${Object.keys(lastRun.results).length} completed · ${lastRun.errors.length} error${lastRun.errors.length === 1 ? '' : 's'}`
              : 'Not run this session — cached payloads (if any) restored from local storage.'}
          </p>
        </Panel>

        {/* Data category breakdown */}
        <Panel title="Data Category Analysis">
          <DataTable columns={categoryColumns} rows={AUDIT_CATEGORIES} getKey={(r) => r.category} />
        </Panel>

        {/* Three-tier data model */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {DATA_TIERS.map((t) => (
            <div key={t.tier} className="rounded-lg bg-panel p-4" style={{ borderLeft: `4px solid ${t.color}` }}>
              <div className="mb-2 font-semibold text-white">{t.tier}</div>
              <div className="mb-2 text-2xl font-bold" style={{ color: t.color }}>{t.confidence}</div>
              <div className="mb-1 text-xs text-muted"><span className="text-subtle">Sources:</span> {t.sources}</div>
              <div className="text-xs text-muted"><span className="text-subtle">Refresh:</span> {t.refresh}</div>
            </div>
          ))}
        </div>

        {/* Confidence indicator legend */}
        <Panel title="Confidence Indicator Legend">
          <div className="flex flex-wrap gap-4">
            {CONFIDENCE_ICONS.map((it) => (
              <div key={it.label} className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-1.5">
                <span className="text-lg" style={{ color: it.color }}>{it.icon}</span>
                <span className="text-sm text-slate-300">{it.label}</span>
              </div>
            ))}
          </div>
        </Panel>

        {/* Key findings */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
            <h3 className="mb-3 font-semibold text-emerald-400">✅ Fully Verified Sections</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              {VERIFIED_SECTIONS.map(([k, v]) => (
                <li key={k}>• <strong>{k}:</strong> {v}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <h3 className="mb-3 font-semibold text-red-400">⚠️ Mock/Demo Data Sections</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              {MOCK_SECTIONS.map(([k, v]) => (
                <li key={k}>• <strong>{k}:</strong> {v}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Proxy strategies */}
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
          <h3 className="mb-3 font-semibold text-blue-400">📊 Available Proxy Strategies</h3>
          <div className="grid grid-cols-1 gap-4 text-sm lg:grid-cols-3">
            {PROXY_STRATEGIES.map((p) => (
              <div key={p.metric}>
                <div className="mb-1 font-medium text-slate-300">{p.metric}</div>
                <div className="text-muted">{p.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Implementation roadmap */}
        <Panel title="Implementation Roadmap">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {ROADMAP_PHASES.map((p) => (
              <div key={p.phase} className="rounded-lg bg-black/20 p-3">
                <div className="mb-1 text-xs text-subtle">{p.phase}</div>
                <div className="text-sm font-medium text-white">{p.action}</div>
                <div className="mt-1 text-sm" style={{ color: p.color }}>{p.result}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
