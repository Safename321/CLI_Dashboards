// Post Merger Integration — view id `merger-integration`.
// Legacy spec: v1.24L App.jsx 8238–8312. Reuses the employee-leading tab set
// with merger headline stats in the shell header.
import { useState } from 'react';
import DashboardShell from '../components/DashboardShell.jsx';
import { EMPLOYEE_LEADING_DATA, EMPLOYEE_TABS } from '../data/datasets/employee-leading.js';
import { EMPLOYEE_TAB_VIEWS } from './employee-leading/EmployeeLeadingDashboard.jsx';
import { ExecutiveSummaryTab } from './employee-leading/SummaryTabs.jsx';

function HeadlineStat({ value, label, valueClass }) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${valueClass}`}>{value}</div>
      <div className="text-xs text-subtle">{label}</div>
    </div>
  );
}

export default function PostMergerIntegrationDashboard() {
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
          <HeadlineStat
            value={`$${data.executiveSummary.totalValueAtRisk}M`}
            label="Value at Risk"
            valueClass="text-red-400"
          />
          <HeadlineStat
            value={data.executiveSummary.flightRisk}
            label="Flight Risk (Next 12mo)"
            valueClass="text-amber-400"
          />
          <HeadlineStat
            value={data.executiveSummary.criticalTalentRisk}
            label="Critical Talent at Risk"
            valueClass="text-cyan-400"
          />
        </div>
      }
    >
      <ActiveTab data={data} />
    </DashboardShell>
  );
}
