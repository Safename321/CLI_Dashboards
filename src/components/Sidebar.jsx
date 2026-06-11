// Left navigation. Tenant-branded header, grouped nav, account/logout footer.
import { NAV_GROUPS } from '../config/nav.js';
import { APP_VERSION_LABEL } from '../config/version.js';

const DATA_YEARS = [2022, 2023, 2024, 2025];

export default function Sidebar({ active, onNav, tenant, email, onLogout, authDisabled, selectedYear, onYearChange }) {
  return (
    <nav className="flex h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-panel">
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-black" style={{ color: tenant?.accentColor || '#E00000' }}>
            {tenant?.companyName || 'CLI Demo'}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] text-muted">{tenant?.sidebarSubtitle || 'behavioral intelligence'}</p>
        {onYearChange && (
          <label className="mt-2 flex items-center gap-2 text-[11px] text-muted">
            Data year:
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="rounded border border-border bg-ink px-2 py-0.5 text-xs text-white focus:border-accent focus:outline-none"
            >
              {DATA_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="flex-1 px-2 py-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-3">
            <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-subtle">{group.title}</div>
            {group.items.map((item) => (
              <button
                key={item.id}
                onClick={() => onNav(item.id)}
                aria-current={active === item.id ? 'page' : undefined}
                className={`mb-0.5 flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                  active === item.id ? 'bg-accent/15 text-white' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span aria-hidden>{item.icon}</span>
                  {item.label}
                </span>
                {item.alerts ? <span className="rounded-full bg-red-500/20 px-1.5 text-[10px] text-red-400">{item.alerts}</span> : null}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="border-t border-border px-4 py-3 text-xs text-muted">
        {!authDisabled && email && (
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="truncate" title={email}>{email}</span>
            <button onClick={onLogout} className="text-accent hover:underline">Sign out</button>
          </div>
        )}
        <span className="text-subtle">{APP_VERSION_LABEL}</span>
      </div>
    </nav>
  );
}
