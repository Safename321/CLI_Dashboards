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
import MgmtChallengesDashboard from './mgmt-challenges/MgmtChallengesDashboard.jsx';
import { NAV_ITEMS } from '../config/nav.js';

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
  'mgmt-challenges': MgmtChallengesDashboard,
  'about-cli': AboutCLIDashboard,
  help: HelpDashboard,
  'further-reading': FurtherReadingDashboard,
};

const labelFor = (id) => NAV_ITEMS.find((n) => n.id === id)?.label || id;
const iconFor = (id) => NAV_ITEMS.find((n) => n.id === id)?.icon;

export function renderView(view, props = {}) {
  const Comp = PORTED[view];
  if (Comp) return <Comp {...props} />;
  return <Placeholder view={view} label={labelFor(view)} icon={iconFor(view)} />;
}

export const PORTED_VIEWS = Object.keys(PORTED);
