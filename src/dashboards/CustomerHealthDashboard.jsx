// Customer Health — view id `customer-health`.
// Legacy spec: v1.24L App.jsx 4747–4787 (NPS/CSAT, financial KPIs, churn prediction).
import DashboardShell from '../components/DashboardShell.jsx';
import { MetricCard, Panel } from '../components/primitives.jsx';
import RecommendationPanel from '../components/RecommendationPanel.jsx';
import { FinancialKPICard } from '../components/financial.jsx';
import { StatTile } from './employee-leading/parts.jsx';

const STATUS_ACCENT = { good: '#10b981', warning: '#f59e0b', danger: '#ef4444' };

const HEALTH_METRICS = [
  { label: 'NPS', value: 42, benchmark: '48', trend: -6, status: 'warning' },
  { label: 'Customer Effort', value: 4.2, unit: '/7', benchmark: '5.5', trend: -8, status: 'danger', subtitle: 'Below 4.5 = churn risk' },
  { label: 'CSAT', value: 7.2, unit: '/10', benchmark: '8.1', trend: -5, status: 'warning' },
  { label: 'Second-Order Referrals', value: 23, unit: '%', benchmark: '30%', trend: 12, status: 'good' },
];

const CHURN_PREDICTION = [
  { value: '$2.8M', label: 'ARR at risk (90d)', tone: 'red' },
  { value: '47', label: 'Accounts flagged', tone: 'amber' },
  { value: '$1.9M', label: 'Saveable with action', tone: 'emerald' },
  { value: '68%', label: 'Save probability', tone: 'cyan' },
];

export default function CustomerHealthDashboard() {
  return (
    <DashboardShell
      title="Customer Health"
      subtitle="NPS, satisfaction, relationship scores, and competitive perception tracking"
      icon="❤️"
    >
      <div className="space-y-6">
        <RecommendationPanel
          severity="critical"
          title="Multiple Customer KPIs Triggering Action"
          evidence={[
            'Churn Rate at 4.2% (above 3% threshold)',
            'CAC Payback at 14 months (high acquisition cost)',
            'Lead Conversion at 3.8% (below 5% threshold)',
            'CES at 4.2/7 - below 4.5 threshold',
          ]}
          strategy="High churn and poor lead conversion suggest product-market fit or experience issues. Recommend shifting to annual billing to lock in customers and reduce churn while improving CAC recovery."
          tactics={[
            { title: 'Churn Analysis', description: 'Deep-dive on churned customer patterns', deliverable: 'Churn Report', canCreate: true },
            { title: 'Annual Billing Incentive Program', description: 'Design discounts for annual commitment', deliverable: 'Pricing Strategy', canCreate: true },
          ]}
        />

        <Panel title="💰 Customer Financial KPIs">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FinancialKPICard label="CAC Payback" value={14} unit=" mo" threshold="12" thresholdDir="<" status="warning" trigger="Cut Marketing Spend" />
            <FinancialKPICard label="Churn Rate" value={4.2} unit="%" threshold="3" thresholdDir="<" status="danger" trigger="Annual Billing" />
            <FinancialKPICard label="Lead Conversion" value={3.8} unit="%" threshold="5" thresholdDir=">" status="danger" trigger="Cut Weak Channels" />
            <StatTile value="$12,400" label="Customer LTV" sub="LTV:CAC Ratio: 2.8x" tone="emerald" />
          </div>
        </Panel>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HEALTH_METRICS.map((m) => (
            <MetricCard
              key={m.label}
              label={m.label}
              value={m.value}
              unit={m.unit}
              delta={m.trend}
              hint={m.subtitle ? `Benchmark: ${m.benchmark} · ${m.subtitle}` : `Benchmark: ${m.benchmark}`}
              accent={STATUS_ACCENT[m.status]}
            />
          ))}
        </div>

        <Panel title="🔮 Churn Prediction & Revenue Impact">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CHURN_PREDICTION.map((s) => (
              <StatTile key={s.label} value={s.value} label={s.label} tone={s.tone} center />
            ))}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
