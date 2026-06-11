// Temporary placeholder for dashboards not yet ported. Every placeholder still
// mounts cleanly (so the §6 smoke test passes) and states what it will become.
import DashboardShell from '../components/DashboardShell.jsx';
import { Panel, StatusBadge } from '../components/primitives.jsx';

export default function Placeholder({ view, label, icon, note }) {
  return (
    <DashboardShell title={label || view} icon={icon} subtitle="Parity port in progress">
      <Panel title="Coming up in this rebuild" right={<StatusBadge status="info">scaffolded</StatusBadge>}>
        <p className="text-sm text-muted">
          The <code className="text-slate-200">{view}</code> dashboard is wired into routing and mounts cleanly. Its
          full v1.24L parity content is being ported in a dedicated commit.
        </p>
        {note && <p className="mt-2 text-sm text-slate-300">{note}</p>}
      </Panel>
    </DashboardShell>
  );
}
