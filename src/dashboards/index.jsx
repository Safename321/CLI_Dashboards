// View id → dashboard component registry. Single source for routing; ids match
// src/config/nav.js. Any unregistered id mounts Placeholder (visible, not silent).
import Placeholder from './Placeholder.jsx';
import OverviewDashboard from './OverviewDashboard.jsx';
import CEOAdvisoryDashboard from './CEOAdvisoryDashboard.jsx';
import BoardPacketDashboard from './BoardPacketDashboard.jsx';
import InvestorRelationsDashboard from './InvestorRelationsDashboard.jsx';
import EarlyWarningDashboard from './early-warning/EarlyWarningDashboard.jsx';
import CausalAnalysisDashboard from './causal/CausalAnalysisDashboard.jsx';
import ScenarioModelingDashboard from './ScenarioModelingDashboard.jsx';
import EmployeeLeadingDashboard from './employee-leading/EmployeeLeadingDashboard.jsx';
import CustomerHealthDashboard from './CustomerHealthDashboard.jsx';
import PostMergerIntegrationDashboard from './PostMergerIntegrationDashboard.jsx';
import HiringDashboard from './HiringDashboard.jsx';
import InvestorBehaviorDashboard from './investor-behavior/index.jsx';
import SentimentDashboard from './SentimentDashboard.jsx';
import CultureChangeDashboard from './CultureChangeDashboard.jsx';
import IndividualASIDashboard from './individual-asi/IndividualASIDashboard.jsx';
import OrgOASIDashboard from './OrgOASIDashboard.jsx';
import AspirationalOASIDashboard from './AspirationalOASIDashboard.jsx';
import MergerDashboard from './merger/MergerDashboard.jsx';
import ExternalDashboard from './ExternalDashboard.jsx';
import DataProvenanceDashboard from './DataProvenanceDashboard.jsx';
import MeetingPrepDashboard from './MeetingPrepDashboard.jsx';
import TenantConfigDashboard from './TenantConfigDashboard.jsx';
import AboutCLIDashboard from './AboutCLIDashboard.jsx';
import HelpDashboard from './help/HelpDashboard.jsx';
import FurtherReadingDashboard from './FurtherReadingDashboard.jsx';
import FillJobsDashboard from './fill-jobs/FillJobsDashboard.jsx';
import SwotMaterialityDashboard from './swot/SwotMaterialityDashboard.jsx';
import MgmtChallengesDashboard from './mgmt-challenges/MgmtChallengesDashboard.jsx';
import SuperAdminConsole from './SuperAdminConsole.jsx';
import HRISImportPanel from './HRISImportPanel.jsx';
import DemoOnlyNotice from './DemoOnlyNotice.jsx';
import { dashFetch, getUser } from '../lib/auth.js';
import { NAV_ITEMS } from '../config/nav.js';

// Views that must never render for a role that lacks them. The Sidebar already
// hides these, but renderView is reachable directly (mentor deep-links, tampered
// state) so we re-check here — defense-in-depth; the server still enforces authz.
const ROLE_GATED = { super: ['super'], hris: ['admin', 'super'] };

// Views whose data is still demonstration-only (fabricated S&P figures, no live
// source). Demo data belongs to the public onboarding demo build only — on a real
// company login these render a DemoOnlyNotice instead. Gating here (not inside each
// component) keeps the hook-bearing component from mounting at all, so it avoids the
// conditional-hooks pitfall. [title, icon] per view id.
const DEMO_BUILD = import.meta.env.VITE_AUTH_DISABLED === 'true';
const DEMO_ONLY = {
  'customer-health': ['Customer Health', '❤️'],
  'scenario-modeling': ['Scenario Modeling', '🔮'],
};

const PORTED = {
  overview: OverviewDashboard,
  'ceo-advisory': CEOAdvisoryDashboard,
  'board-packet': BoardPacketDashboard,
  'investor-relations': InvestorRelationsDashboard,
  'early-warning': EarlyWarningDashboard,
  'causal-analysis': CausalAnalysisDashboard,
  'scenario-modeling': ScenarioModelingDashboard,
  'employee-leading': EmployeeLeadingDashboard,
  'customer-health': CustomerHealthDashboard,
  'merger-integration': PostMergerIntegrationDashboard,
  hiring: HiringDashboard,
  'investor-behavior': InvestorBehaviorDashboard,
  sentiment: SentimentDashboard,
  'culture-change': CultureChangeDashboard,
  'individual-asi': IndividualASIDashboard,
  'org-oasi': OrgOASIDashboard,
  'aspirational-oasi': AspirationalOASIDashboard,
  merger: MergerDashboard,
  external: ExternalDashboard,
  'data-provenance': DataProvenanceDashboard,
  'meeting-prep': MeetingPrepDashboard,
  'tenant-config': TenantConfigDashboard,
  'fill-jobs': FillJobsDashboard,
  swot: SwotMaterialityDashboard,
  'mgmt-challenges': MgmtChallengesDashboard,
  'about-cli': AboutCLIDashboard,
  help: HelpDashboard,
  'further-reading': FurtherReadingDashboard,
  super: SuperAdminConsole,
};

const labelFor = (id) => NAV_ITEMS.find((n) => n.id === id)?.label || id;
const iconFor = (id) => NAV_ITEMS.find((n) => n.id === id)?.icon;

export function renderView(view, props = {}) {
  // Role gate (defense-in-depth): block super/hris for roles that lack them.
  const allow = ROLE_GATED[view];
  if (allow && !allow.includes(getUser()?.role)) {
    return <Placeholder view={view} label="Not authorized" icon="🔒" />;
  }
  // Demo-only views: on a real company login, show the notice instead of demo data.
  if (!DEMO_BUILD && DEMO_ONLY[view]) {
    const [title, icon] = DEMO_ONLY[view];
    return <DemoOnlyNotice title={title} icon={icon} />;
  }
  // HRIS onboarding panel (admin-visible) is wired directly to the Laravel
  // dashboard endpoint via dashFetch; it doesn't take the generic dashboard props.
  if (view === 'hris') {
    return <HRISImportPanel api={dashFetch} basePath="/dashboard/hris" />;
  }
  const Comp = PORTED[view];
  if (Comp) return <Comp {...props} />;
  return <Placeholder view={view} label={labelFor(view)} icon={iconFor(view)} />;
}

export const PORTED_VIEWS = Object.keys(PORTED);
