// Login screen — posts credentials to /api/auth/login. No crypto.subtle, no
// client-side hashing, no embedded credential material (§3.1, §3.2). Works
// identically over http/https on localhost or any public origin.
import { useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { APP_VERSION_LABEL } from '../config/version.js';
import { CLILogo } from '../components/CLILogo.jsx';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Incorrect email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink p-5">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[420px] rounded-xl border border-border bg-panel p-8 shadow-2xl"
      >
        <div className="mb-1 flex items-center gap-3">
          <CLILogo size={48} />
          <span className="text-3xl font-black text-brand">The Future</span>
        </div>
        <p className="mb-6 text-[13px] text-muted">
          Connective Leadership Dashboards · Behavioral intelligence platform
        </p>

        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">Email</span>
          <input
            type="email"
            autoFocus
            autoComplete="username"
            placeholder="admin@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-slate-600 bg-ink px-2.5 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>

        <label className="mb-2 block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">Password</span>
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-slate-600 bg-ink px-2.5 py-2 text-sm text-white outline-none focus:border-accent"
          />
        </label>

        <label className="mb-4 flex cursor-pointer select-none items-center gap-1.5">
          <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} className="accent-accent" />
          <span className="text-xs text-muted">Show password</span>
        </label>

        {error && (
          <div className="mb-3 rounded border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-400" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full rounded-md py-2.5 text-sm font-semibold text-white transition-colors disabled:bg-slate-600 disabled:cursor-default bg-cyan-700 hover:bg-accent"
        >
          {loading ? 'Checking…' : 'Sign in'}
        </button>

        <p className="mb-0 mt-5 text-center text-[11px] text-subtle">
          {APP_VERSION_LABEL} · For authorized prospects only
        </p>
      </form>
    </div>
  );
}
