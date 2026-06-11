// Further Reading — searchable CLI reference library (414 titles).
// Ported from v1.24L renderFurtherReading (App.jsx 2349–2502). The table
// itself is shared with the Help & Guide dashboard via help/ReferenceLibrary.
import DashboardShell from '../components/DashboardShell.jsx';
import ReferenceLibrary from './help/ReferenceLibrary.jsx';

export default function FurtherReadingDashboard() {
  return (
    <DashboardShell
      title="Further Reading"
      icon="📚"
      subtitle="CLI Reference Library · v1.24L"
    >
      <div className="h-full min-h-0">
        <ReferenceLibrary />
      </div>
    </DashboardShell>
  );
}
