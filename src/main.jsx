// Single entrypoint (§3.4). Auth gates the app; when auth is disabled the
// server reports it and AuthProvider renders straight through (public demo).
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import LoginScreen from './auth/LoginScreen.jsx';
import './index.css';

function Gate() {
  const { status } = useAuth();
  if (status === 'checking') {
    return (
      <div className="flex h-screen items-center justify-center bg-ink text-muted">Loading…</div>
    );
  }
  if (status === 'authed') return <App />;
  return <LoginScreen />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Gate />
    </AuthProvider>
  </React.StrictMode>
);
