// Customer Health — view id `customer-health`.
// Legacy spec: v1.24L App.jsx 4747-4787 (NPS/CSAT, financial KPIs, churn prediction).
//
// Phase 3 (D6): the demo build keeps the CRM-style customer-success view (NPS/
// CSAT/ARR-at-risk — that needs a real CRM connector). A real login instead
// shows the EMPLOYEE-PERCEIVED customer signal computed live from the app's
// check-in Section-8 fields (GET /dashboard/customer-health). This is the
// frontline read on customers — a leading indicator, NOT customer-reported
// data — and is labeled as such throughout.
import DashboardShell from '../components/DashboardShell.jsx';
import { MetricCard, Panel } from '../components/primitives.jsx';
import RecommendationPanel from '../components/RecommendationPanel.jsx';
import { FinancialKPICard } from '../components/financial.jsx';
import { StatTile } from './employee-leading/parts.jsx';
import { useCustomerHealth } from '../lib/liveData.js';

const DEMO_BUILD = import.meta.env.VITE_AUTH_DISABLED === 'true';
const STATUS_ACCENT = { good: '#10b981', warning: '#f59e0b', danger: '#ef4444' };

// ── Live employee-perceived view (D6) ────────────────────────────────────────

// Each metric: label + how to read it. Scores are 0-10 (rescaled from the 0-5
// check-in scale server-side). Tone by band: >=7 good, >=5 warn, else danger.
const METRIC_DEFS = [
  { key: 'productHappiness', label: 'Product happiness', hint: "Employees' read on how happy customers are with the product" },
  { key: 'customerSupportQuality', label: 'Support quality', hint: 'Perceived quality of customer support' },
  { key: 'customerValuePerception', label: 'Value perception', hint: 'Whether customers are seen as getting their money’s worth' },
  { key: 'continuingRelationshipHappiness', label: 'Relationship continuity', hint: 'Perceived strength of the ongoing customer relationship (retention proxy)' },
  { key: 'customerResponseTime', label: 'Responsiveness', hint: 'Perceived speed of response to customers' },
  { key: 'productQuality', label: 'Product quality', hint: 'Frontline read on product quality' },
];

const toneFor = (v) => (v == null ? 'slate' : v >= 7 ? 'emerald' : v >= 5 ? 'amber' : 'red');
const accentFor = (v) => (v == null ? '#64748b' : v >= 7 ? STATUS_ACCENT.good : v >= 5 ? STATUS_ACCENT.warning : STATUS_ACCENT.danger);

function LiveCustomerHealth() {
  const { data, status } = useCustomerHealth(true);
  const responses = data?.responses ?? 0;
  const metrics = data?.metrics ?? {};
  const gap = data?.competitiveGap;

  if (status === 'loading') {
    return <div className="rounded-xl border border-border bg-panel p-6 text-sm text-muted">Loading customer signal…</div>;
  }
  if (status === 'error') {
    return (
      <div className="rounded-xl border border-border bg-panel p-6">
        <p className="text-sm font-semibold text-red-400">Couldn't load the customer signal.</p>
        <p className="mt-1 text-sm text-muted">Refresh and sign in again — if it persists, contact your administrator.</p>
      </div>
    );
  }
  if (!responses) {
    return (
      <div className="mx-auto mt-10 max-w-xl rounded-xl border border-border bg-panel p-8">
        <p className="text-sm font-semibold text-amber-400">No customer signal yet.</p>
        <p className="mt-2 text-sm text-muted">
          This view reads your employees' perception of customer health from their mobile check-ins
          (product happiness, support quality, value, competitive standing). Once employees submit
          check-ins, the signal appears here automatically.
        </p>
      </div>
    );
  }

  const present = METRIC_DEFS.filter((d) => metrics[d.key] != null);

  return (
    <div className="space-y-6">
      {/* Framing banner — this is a proxy, say so clearly */}
      <div className="rounded-xl border border-cyan-500/30 bg-cyan-900/10 p-4">
        <div className="flex items-start gap-3">
          <span aria-hidden className="text-2xl">🛰️</span>
          <div>
            <h3 className="text-sm font-semibold text-cyan-300">Employee-perceived customer signal</h3>
            <p className="mt-1 text-sm text-slate-300">
              A frontline leading indicator from <span className="font-semibold text-white">{responses}</span> mobile
              check-in{responses === 1 ? '' : 's'} — how your <em>employees</em> read customer health.
              This is not customer-reported data (NPS/CSAT) or CRM churn; connect a CRM to add those.
            </p>
          </div>
        </div>
      </div>

      {/* Competitive standing */}
      <Panel title="🏁 Competitive standing (perceived)">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile
            value={metrics.productHappiness != null ? metrics.productHappiness.toFixed(1) : '—'}
            label="Our product happiness" sub="/10" tone={toneFor(metrics.productHappiness)} center
          />
          <StatTile
            value={metrics.competitorProductsHappiness != null ? metrics.competitorProductsHappiness.toFixed(1) : '—'}
            label="Competitor products" sub="/10 (perceived)" tone="slate" center
          />
          <StatTile
            value={gap != null ? `${gap > 0 ? '+' : ''}${gap.toFixed(1)}` : '—'}
            label="Competitive gap" sub={gap == null ? '' : gap >= 0 ? 'ahead' : 'behind'}
            tone={gap == null ? 'slate' : gap >= 0 ? 'emerald' : 'red'} center
          />
        </div>
      </Panel>

      {/* Signal metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {present.map((d) => (
          <MetricCard
            key={d.key}
            label={d.label}
            value={metrics[d.key].toFixed(1)}
            unit="/10"
            hint={d.hint}
            accent={accentFor(metrics[d.key])}
          />
        ))}
      </div>

      <p className="text-[11px] italic text-subtle">
        Scores are your employees' mean perception (0–10) from mobile check-ins, tenant-scoped.
        Bands: ≥7 healthy · 5–7 watch · &lt;5 at-risk. Add a CRM connector for customer-reported NPS/CSAT and account churn.
      </p>
    </div>
  );
}

// ── Demo CRM-style view (public demo build — unchanged v1.24L port) ───────────

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

function DemoCustomerHealth() {
  return (
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
  );
}

export default function CustomerHealthDashboard() {
  return (
    <DashboardShell
      title="Customer Health"
      icon="❤️"
      subtitle={DEMO_BUILD
        ? 'NPS, satisfaction, relationship scores, and competitive perception tracking'
        : 'Employee-perceived customer signal from mobile check-ins — a frontline leading indicator'}
    >
      {DEMO_BUILD ? <DemoCustomerHealth /> : <LiveCustomerHealth />}
    </DashboardShell>
  );
}
