// Investor Behavior — shareholder composition, governance changes, product
// execution risk, and capital requirements analysis (view id: investor-behavior).
import DashboardShell from '../../components/DashboardShell.jsx';
import DemoDataBanner from '../../components/DemoDataBanner.jsx';
import RecommendationPanel from '../../components/RecommendationPanel.jsx';
import { StatMetricCard } from '../../components/shared-cards.jsx';
import { INVESTOR_BEHAVIOR_RECOMMENDATION, QUICK_METRICS, MARKET_METRICS } from '../../data/datasets/investor-behavior.js';
import CostBenefitSection from './CostBenefitSection.jsx';
import ShareholdersSection from './ShareholdersSection.jsx';
import GovernanceSection from './GovernanceSection.jsx';
import ProductsSection from './ProductsSection.jsx';
import CapitalSection from './CapitalSection.jsx';
import LiveInvestorBehavior from './LiveInvestorBehavior.jsx';

const DEMO_BUILD = import.meta.env.VITE_AUTH_DISABLED === 'true';

export default function InvestorBehaviorDashboard() {
  // Phase 3 (D5): real logins get the live view — tenant ticker/CIK through
  // the authed /data proxy + entered shareholders dataset. Demo build keeps
  // the narrative S&P sections below.
  if (!DEMO_BUILD) {
    return (
      <DashboardShell
        title="Investor Behavior"
        icon="📈"
        subtitle="Market signals for your organization — quotes, filings, and shareholder composition"
      >
        <LiveInvestorBehavior />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Investor Behavior"
      icon="📈"
      subtitle="Leading indicators of organizational stress — catch problems before they compound"
    >
      <div className="space-y-6">
        <DemoDataBanner />
        <RecommendationPanel {...INVESTOR_BEHAVIOR_RECOMMENDATION} />

        <div>
          <h2 className="text-2xl font-bold text-white">Investor Behavior Analytics</h2>
          <p className="mt-1 text-muted">
            Shareholder composition, governance changes, product execution risk, and capital requirements analysis
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {QUICK_METRICS.map((m) => (
            <StatMetricCard key={m.label} {...m} />
          ))}
        </div>

        <CostBenefitSection />
        <ShareholdersSection />
        <GovernanceSection />
        <ProductsSection />
        <CapitalSection />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {MARKET_METRICS.map((m) => (
            <StatMetricCard key={m.label} {...m} />
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
