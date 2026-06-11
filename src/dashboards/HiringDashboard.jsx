// Hiring & On-Boarding — view id `hiring`.
// Legacy spec: v1.24L App.jsx 8467–8522 (pipeline KPIs, hiring metrics,
// new-hire sentiment journey).
import DashboardShell from '../components/DashboardShell.jsx';
import { MetricCard, Panel } from '../components/primitives.jsx';
import RecommendationPanel from '../components/RecommendationPanel.jsx';
import { FinancialKPICard } from '../components/financial.jsx';
import { StatTile } from './employee-leading/parts.jsx';

const STATUS_ACCENT = { good: '#10b981', warning: '#f59e0b', danger: '#ef4444' };

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

export default function HiringDashboard() {
  return (
    <DashboardShell
      title="Hiring & On-Boarding"
      subtitle="Candidate pipeline, on-boarding effectiveness, and early retention signals"
      icon="📝"
    >
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
    </DashboardShell>
  );
}
