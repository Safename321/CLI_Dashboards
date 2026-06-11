// App shell ONLY (§4.1): sidebar + view switch + top-level state. No dashboard
// logic lives here. Data is provided via DataProvider; auth via AuthProvider.
import { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import { DataProvider } from './data/DataContext.jsx';
import { useAuth } from './auth/AuthContext.jsx';
import { renderView } from './dashboards/index.jsx';
import { DEFAULT_VIEW } from './config/nav.js';

export default function App() {
  const { tenant, email, logout, authDisabled } = useAuth();
  const [view, setView] = useState(DEFAULT_VIEW);

  return (
    <DataProvider tenant={tenant}>
      <div className="flex h-screen overflow-hidden bg-ink">
        <Sidebar active={view} onNav={setView} tenant={tenant} email={email} onLogout={logout} authDisabled={authDisabled} />
        <main className="flex-1 overflow-hidden">{renderView(view, { onNavigate: setView })}</main>
      </div>
    </DataProvider>
  );
}
