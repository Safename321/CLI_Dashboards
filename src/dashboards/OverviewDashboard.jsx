// Overview — tenant-aware landing summary with headline metrics + nav cards.
import DashboardShell from '../components/DashboardShell.jsx';
import { MetricCard, Panel, StatusBadge } from '../components/primitives.jsx';
import { useData, useYearData } from '../data/DataContext.jsx';

const QUICK_LINKS = [
  { id: 'ceo-advisory', label: 'CEO Advisory', icon: '🎯' },
  { id: 'early-warning', label: 'Early Warning KPIs', icon: '⚡' },
  { id: 'employee-leading', label: 'Employee Leading', icon: '👥' },
  { id: 'org-oasi', label: 'OASI', icon: '🏢' },
];

export default function OverviewDashboard({ onNavigate }) {
  const { tenant, data, status } = useData();
  const latest = useYearData();

  if (tenant?.emptyState) {
    return (
      <DashboardShell title="Overview" icon="📖" subtitle={`${tenant.companyName} · ${tenant.sidebarSubtitle}`}>
        <Panel title="Empty-state demo" right={<StatusBadge status="mock">no live data</StatusBadge>}>
          <p className="text-sm text-muted">
            This tenant is configured as an empty-state demo. Connect data sources in Tenant Config to populate dashboards.
          </p>
        </Panel>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Overview"
      icon="📖"
      subtitle={`${tenant?.companyName || 'CLI Demo'} · behavioral intelligence`}
    >
      {status === 'loading' && <p className="text-sm text-muted">Loading dataset…</p>}

      {latest && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Revenue" value={latest.revenue} unit="B" delta={latest.revenueGrowth} deltaLabel="YoY %" />
          <MetricCard label="Net income" value={latest.netIncome} unit="B" />
          <MetricCard label="EPS" value={latest.eps} />
          <MetricCard label="Operating margin" value={latest.operatingMargin} unit="%" />
        </div>
      )}

      <Panel className="mt-6" title="Jump to a dashboard">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_LINKS.map((l) => (
            <MetricCard key={l.id} label={l.icon} value={l.label} onClick={() => onNavigate?.(l.id)} />
          ))}
        </div>
      </Panel>

      {data?._meta && (
        <p className="mt-4 text-xs text-subtle">
          Data as of {data._meta.lastUpdated} · sources: {Object.keys(data._meta.sources || {}).join(', ')}
        </p>
      )}
    </DashboardShell>
  );
}
