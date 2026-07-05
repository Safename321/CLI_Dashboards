// Mentor alert strip — compressed one-row summary with chip cluster, expanding
// to a detail list with navigate + dismiss actions (legacy v1.24L layout).
import { useState } from 'react';

export default function MentorAlerts({ alerts, onNavigate, onClose, onDismiss }) {
  const [expanded, setExpanded] = useState(false);
  if (!alerts || alerts.length === 0) return null;

  const critical = alerts.filter((a) => a.severity === 'critical');
  const warning = alerts.filter((a) => a.severity === 'warning');
  const hasCritical = critical.length > 0;
  const go = (dashboard) => {
    onNavigate(dashboard);
    onClose();
  };

  return (
    <div className="shrink-0 border-b border-border/80">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-slate-800/30"
        style={{
          background: hasCritical ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
          borderLeft: `2px solid ${hasCritical ? '#ef4444' : '#fbbf24'}`,
        }}
      >
        <span className="text-[12px]">{hasCritical ? '🚨' : '⚠️'}</span>
        <span className="text-[11px] font-semibold" style={{ color: hasCritical ? '#fca5a5' : '#fcd34d' }}>
          {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
        </span>
        <span className="text-[10px] text-slate-400">
          {critical.length} critical · {warning.length} warning
        </span>
        <span className="ml-auto flex flex-wrap items-center gap-1 gap-y-[3px]">
          {alerts.map((alert) => (
            <span
              key={alert.id}
              role="link"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); go(alert.dashboard); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); go(alert.dashboard); } }}
              style={{
                background: alert.severity === 'critical' ? 'rgba(239,68,68,0.18)' : 'rgba(245,158,11,0.15)',
                borderColor: alert.severity === 'critical' ? 'rgba(239,68,68,0.45)' : 'rgba(245,158,11,0.4)',
                color: alert.severity === 'critical' ? '#fca5a5' : '#fcd34d',
              }}
              className="cursor-pointer rounded border px-2 py-0.5 text-[10px] hover:opacity-80"
            >
              <span className="mr-1" style={{ color: alert.severity === 'critical' ? '#f87171' : '#fbbf24' }}>●</span>
              {alert.title.replace(/^(?:🚨|⚠️)\s*/u, '')}
            </span>
          ))}
        </span>
        <span
          className="text-[11px] text-subtle transition-transform"
          style={{ transform: expanded ? 'rotate(0)' : 'rotate(-90deg)' }}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {expanded && (
        <div className="space-y-1 px-3 pb-2 pt-1">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between gap-2 rounded px-2.5 py-1.5 ${
                alert.severity === 'critical'
                  ? 'border border-red-500/30 bg-red-900/20'
                  : 'border border-amber-500/30 bg-amber-900/20'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className={`text-[11px] font-semibold leading-tight ${alert.severity === 'critical' ? 'text-red-300' : 'text-amber-300'}`}>
                    {alert.title}
                  </span>
                  <span className="text-[10px] leading-tight text-slate-400">{alert.description}</span>
                </div>
                <button
                  type="button"
                  onClick={() => go(alert.dashboard)}
                  className={`mt-0.5 text-[10px] font-semibold underline underline-offset-2 ${
                    alert.severity === 'critical' ? 'text-red-400 hover:text-red-200' : 'text-amber-400 hover:text-amber-200'
                  }`}
                >
                  → {alert.action}
                </button>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(alert.id)}
                aria-label={`Dismiss alert: ${alert.title}`}
                className="shrink-0 text-[12px] leading-none text-slate-600 hover:text-slate-400"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
