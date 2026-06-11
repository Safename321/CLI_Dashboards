// View id → dashboard component registry. Ported dashboards are real; the rest
// mount via Placeholder so routing + the §6 smoke test work end-to-end now.
import Placeholder from './Placeholder.jsx';
import OverviewDashboard from './OverviewDashboard.jsx';
import { NAV_ITEMS } from '../config/nav.js';

// Real, ported dashboards register here as they're built.
const PORTED = {
  overview: OverviewDashboard,
};

const labelFor = (id) => NAV_ITEMS.find((n) => n.id === id)?.label || id;
const iconFor = (id) => NAV_ITEMS.find((n) => n.id === id)?.icon;

export function renderView(view, props = {}) {
  const Comp = PORTED[view];
  if (Comp) return <Comp {...props} />;
  return <Placeholder view={view} label={labelFor(view)} icon={iconFor(view)} />;
}

export const PORTED_VIEWS = Object.keys(PORTED);
