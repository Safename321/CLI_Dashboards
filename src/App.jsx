// App shell ONLY (§4.1): sidebar + view switch + top-level state. No dashboard
// logic lives here. Data via DataProvider, auth via AuthProvider, connector
// registry via RegistryProvider; metric drill + AI mentor mounted here.
import { useCallback, useEffect, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import TrendChartModal from './components/TrendChartModal.jsx';
import { DataProvider, useYearData } from './data/DataContext.jsx';
import { RegistryProvider, useRegistry } from './connectors/RegistryContext.jsx';
import { useAuth } from './auth/AuthContext.jsx';
import AIMentor from './mentor/AIMentor.jsx';
import ScenarioTesterModal from './dashboards/early-warning/ScenarioTesterModal.jsx';
import { CLILogo } from './components/CLILogo.jsx';
import { renderView } from './dashboards/index.jsx';
import { DEFAULT_VIEW } from './config/nav.js';

function AppInner() {
  const [view, setView] = useState(DEFAULT_VIEW);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [trendMetric, setTrendMetric] = useState(null); // { metric, label }
  const [mentorOpen, setMentorOpen] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [preSelection, setPreSelection] = useState(null);
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const yearData = useYearData(selectedYear);

  // Global Scenario Tester: the sidebar button dispatches this event (v1.24L
  // parity), so the modal opens from any view.
  useEffect(() => {
    const open = () => setScenarioOpen(true);
    window.addEventListener('cli:open-scenario-tester', open);
    return () => window.removeEventListener('cli:open-scenario-tester', open);
  }, []);

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
          className="absolute bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-accent/50 bg-panel py-2.5 pl-2.5 pr-4 text-sm font-semibold text-accent shadow-lg transition-colors hover:bg-accent/10"
        >
          <span className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-white">
            <CLILogo size={22} />
          </span>
          CLI Mentor
        </button>
      </main>

      {trendMetric && (
        <TrendChartModal metric={trendMetric.metric} label={trendMetric.label} onClose={() => setTrendMetric(null)} />
      )}
      <ScenarioTesterModal open={scenarioOpen} onClose={() => setScenarioOpen(false)} />
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
  const { runAll, running } = useRegistry();
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
      onUpdate={runAll}
      updating={running}
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
