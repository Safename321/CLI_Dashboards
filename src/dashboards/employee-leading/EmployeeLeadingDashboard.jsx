// Employee Leading Indicators — view id `employee-leading`.
// Legacy spec: v1.24L App.jsx 4730–4745 (headline metrics + attrition alert)
// plus the 7-tab deep-dive set (7886–8235) surfaced as DashboardShell tabs.
import { useState } from 'react';
import DashboardShell from '../../components/DashboardShell.jsx';
import { MetricCard } from '../../components/primitives.jsx';
import RecommendationPanel from '../../components/RecommendationPanel.jsx';
import {
  EMPLOYEE_LEADING_DATA,
  EMPLOYEE_TABS,
  EMPLOYEE_LEADING_METRICS,
} from '../../data/datasets/employee-leading.js';
import { ExecutiveSummaryTab, RetentionRiskTab, KeyTalentTab } from './SummaryTabs.jsx';
import { ManagerQualityTab, CustomerImpactTab } from './ImpactTabs.jsx';
import { CultureVoiceTab, FrictionPointsTab } from './CultureTabs.jsx';
import LeadingIndicators from '../shared/LeadingIndicators.jsx';

const DEMO_BUILD = import.meta.env.VITE_AUTH_DISABLED === 'true';
const DemoTag = () => (DEMO_BUILD ? null : (
  <span className="ml-2 rounded-full border border-amber-500/40 bg-amber-900/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-400">demo figures</span>
));

// status → accent border color (per legacy MetricCard status prop)
const STATUS_ACCENT = { good: '#10b981', warning: '#f59e0b', danger: '#ef4444' };

export const EMPLOYEE_TAB_VIEWS = {
  executive: ExecutiveSummaryTab,
  retention: RetentionRiskTab,
  talent: KeyTalentTab,
  managers: ManagerQualityTab,
  customers: CustomerImpactTab,
  culture: CultureVoiceTab,
  friction: FrictionPointsTab,
};

export default function EmployeeLeadingDashboard() {
  const [tab, setTab] = useState('executive');
  const ActiveTab = EMPLOYEE_TAB_VIEWS[tab] || ExecutiveSummaryTab;

  return (
    <DashboardShell
      title="Employee Leading"
      subtitle="Discretionary effort, flight risk, and psychological safety trends"
      icon="👥"
      alerts={1}
      tabs={EMPLOYEE_TABS}
      activeTab={tab}
      onTab={setTab}
    >
      <div className="space-y-6">
        {/* Live tenant leading indicators (D3) — real login only. */}
        {!DEMO_BUILD && <LeadingIndicators title="Live Leading Indicators" />}

        <RecommendationPanel
          severity="critical"
          title={DEMO_BUILD ? 'Attrition Risk: 23 Employees' : 'Attrition Risk (demo figures)'}
          evidence={['$4.2M replacement cost', '68% in Operations']}
          strategy="Implement targeted retention program."
          tactics={[
            { title: 'Stay Interviews', description: '1:1 conversations', deliverable: 'Interview Guide', canCreate: true },
          ]}
        />

        {!DEMO_BUILD && (
          <div className="flex items-center text-xs text-muted">Benchmark tiles and deep-dive tabs below use illustrative figures<DemoTag /></div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EMPLOYEE_LEADING_METRICS.map((m) => (
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

        <ActiveTab data={EMPLOYEE_LEADING_DATA} />
      </div>
    </DashboardShell>
  );
}
