// Standard dashboard frame: title/subtitle/alert header + optional tab strip.
// Every dashboard renders inside this so headers never get re-implemented.
import { Tabs } from './primitives.jsx';

export default function DashboardShell({ title, subtitle, icon, alerts, actions, tabs, activeTab, onTab, children }) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-start justify-between gap-4 border-b border-border bg-panel/60 px-6 py-4">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-semibold text-white">
            {icon && <span aria-hidden>{icon}</span>}
            {title}
            {alerts > 0 && (
              <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">{alerts} alert{alerts > 1 ? 's' : ''}</span>
            )}
          </h1>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </header>

      {tabs && tabs.length > 0 && (
        <div className="px-6 pt-3">
          <Tabs tabs={tabs} active={activeTab} onChange={onTab} />
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">{children}</div>
    </div>
  );
}
