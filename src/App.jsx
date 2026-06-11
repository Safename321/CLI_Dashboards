// App shell ONLY (§4.1): sidebar + view switch + top-level state. No dashboard
// logic lives here. Data via DataProvider, auth via AuthProvider, connector
// registry via RegistryProvider; metric drill + AI mentor mounted here.
import { useCallback, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import TrendChartModal from './components/TrendChartModal.jsx';
import { DataProvider, useYearData } from './data/DataContext.jsx';
import { RegistryProvider } from './connectors/RegistryContext.jsx';
import { useAuth } from './auth/AuthContext.jsx';
import AIMentor from './mentor/AIMentor.jsx';
import { renderView } from './dashboards/index.jsx';
import { DEFAULT_VIEW } from './config/nav.js';

function AppInner() {
  const [view, setView] = useState(DEFAULT_VIEW);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [trendMetric, setTrendMetric] = useState(null); // { metric, label }
  const [mentorOpen, setMentorOpen] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [preSelection, setPreSelection] = useState(null);
  const yearData = useYearData(selectedYear);

  const onMetricClick = useCallback((metric, label) => setTrendMetric({ metric, label }), []);
  // Deep-link from mentor: navigate to a view with an optional pre-selection payload.
  const onDeepLink = useCallback((viewId, payload = null) => {
    setPreSelection(payload);
    setView(viewId);
    setMentorOpen(false);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-ink">
      <SidebarSlot view={view} setView={setView} selectedYear={selectedYear} setSelectedYear={setSelectedYear} />
      <main className="relative flex-1 overflow-hidden">
        {renderView(view, { onNavigate: setView, yearData, selectedYear, onMetricClick, preSelection })}

        <button
          onClick={() => setMentorOpen(true)}
          aria-label="Open AI mentor"
          className="absolute bottom-5 right-5 z-40 rounded-full border border-accent/50 bg-panel px-4 py-3 text-sm font-semibold text-accent shadow-lg transition-colors hover:bg-accent/10"
        >
          💬 CLI Mentor
        </button>
      </main>

      {trendMetric && (
        <TrendChartModal metric={trendMetric.metric} label={trendMetric.label} onClose={() => setTrendMetric(null)} />
      )}
      <AIMentor
        isOpen={mentorOpen}
        onClose={() => setMentorOpen(false)}
        currentDashboard={view}
        yearData={yearData}
        selectedYear={selectedYear}
        onNavigate={(v) => onDeepLink(v)}
        onDeepLink={onDeepLink}
        conversation={conversation}
        setConversation={setConversation}
      />
    </div>
  );
}

// Sidebar needs auth context for the account footer; kept out of AppInner so
// the year selector re-render stays local.
function SidebarSlot({ view, setView, selectedYear, setSelectedYear }) {
  const { tenant, email, logout, authDisabled } = useAuth();
  return (
    <Sidebar
      active={view}
      onNav={setView}
      tenant={tenant}
      email={email}
      onLogout={logout}
      authDisabled={authDisabled}
      selectedYear={selectedYear}
      onYearChange={setSelectedYear}
    />
  );
}

export default function App() {
  const { tenant } = useAuth();
  return (
    <DataProvider tenant={tenant}>
      <RegistryProvider tenant={tenant}>
        <AppInner />
      </RegistryProvider>
    </DataProvider>
  );
}
