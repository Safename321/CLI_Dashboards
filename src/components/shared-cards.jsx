// Shared presentational cards/badges (v1.24L App.jsx 1674–1765).
// TrendBadge is the legacy percent-change StatusBadge, renamed to avoid
// clashing with primitives.jsx StatusBadge (status-keyword variant).

export function TrendBadge({ change }) {
  const color = change <= -10 ? 'bg-red-500' : change <= -5 ? 'bg-amber-500' : change > 0 ? 'bg-emerald-500' : 'bg-slate-500';
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-semibold text-white ${color}`}>
      {change > 0 ? '+' : ''}
      {change}%
    </span>
  );
}

export function ConfidenceBadge({ level }) {
  const styles = {
    high: 'bg-emerald-500/20 text-emerald-400',
    medium: 'bg-amber-500/20 text-amber-400',
    low: 'bg-red-500/20 text-red-400',
  };
  return <span className={`rounded px-1.5 py-0.5 text-xs ${styles[level] || styles.medium}`}>{level}</span>;
}

// Status-dot metric card used by several dashboards (legacy local MetricCard).
export function StatMetricCard({ label, value, unit, benchmark, trend, status, subtitle }) {
  const statusColors = { good: 'text-emerald-400', warning: 'text-amber-400', danger: 'text-red-400', neutral: 'text-muted' };
  return (
    <div className={`rounded-xl bg-panel p-4 ${status === 'danger' ? 'ring-1 ring-red-500/50' : ''}`}>
      <div className="mb-1 flex items-start justify-between">
        <span className="text-sm text-muted">{label}</span>
        {status && <span className={`text-xs ${statusColors[status]}`}>●</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${statusColors[status] || 'text-white'}`}>{value}</span>
        {unit && <span className="text-sm text-subtle">{unit}</span>}
      </div>
      {(benchmark || trend !== undefined) && (
        <div className="mt-1 flex items-center gap-3 text-xs">
          {benchmark && <span className="text-subtle">Peer: {benchmark}</span>}
          {trend !== undefined && <TrendBadge change={trend} />}
        </div>
      )}
      {subtitle && <div className="mt-1 text-xs text-subtle">{subtitle}</div>}
    </div>
  );
}

export function RecommendationCard({ priority, title, rationale, actions, impact, effort }) {
  const styles = {
    critical: 'border-red-500 bg-red-900/20',
    high: 'border-amber-500 bg-amber-900/20',
    medium: 'border-blue-500 bg-blue-900/20',
  };
  const badges = { critical: 'bg-red-500', high: 'bg-amber-500', medium: 'bg-blue-500' };
  return (
    <div className={`rounded-xl border-l-4 p-4 ${styles[priority] || styles.medium}`}>
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className={`rounded px-2 py-0.5 text-xs font-bold uppercase text-white ${badges[priority] || badges.medium}`}>{priority}</span>
          <h4 className="text-sm font-semibold text-white">{title}</h4>
        </div>
        <div className="text-right text-xs">
          <div className="text-emerald-400">{impact}</div>
          <div className="text-subtle">{effort}</div>
        </div>
      </div>
      <p className="mb-2 text-sm text-slate-300">{rationale}</p>
      <div className="space-y-1">
        {actions.map((a, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="text-cyan-400">→</span>
            <span className="text-slate-300">{a}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const COUNTRY_FLAGS = { US: '🇺🇸', DE: '🇩🇪', ES: '🇪🇸', PL: '🇵🇱', FR: '🇫🇷', UK: '🇬🇧' };

export function EmployeeRow({ name, role, score, daysSince, status, country, trend }) {
  const daysColor = !daysSince
    ? 'text-muted'
    : daysSince <= 3
      ? 'text-emerald-400'
      : daysSince <= 7
        ? 'text-amber-400'
        : daysSince <= 14
          ? 'text-orange-400'
          : 'font-bold text-red-400';
  const scoreColor = score >= 0.95 ? 'text-emerald-400' : score >= 0.9 ? 'text-blue-400' : score >= 0.85 ? 'text-amber-400' : 'text-red-400';
  const statusStyles = {
    completed: 'bg-emerald-500/20 text-emerald-400',
    pending: 'bg-amber-500/20 text-amber-400',
    overdue: 'bg-red-500/20 text-red-400',
  };
  return (
    <div className={`flex items-center px-3 py-2 hover:bg-slate-700/30 ${daysSince > 14 ? 'bg-red-900/10' : ''}`}>
      <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-700 text-xs font-medium text-white">
        {name
          .split(' ')
          .map((n) => n[0])
          .join('')}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="truncate text-sm font-medium text-white">{name}</span>
          {country && <span className="text-sm">{COUNTRY_FLAGS[country]}</span>}
        </div>
        {role && <span className="text-xs text-muted">{role}</span>}
      </div>
      {score !== undefined && <span className={`mr-4 font-mono text-sm ${scoreColor}`}>{score.toFixed(4)}</span>}
      {trend !== undefined && (
        <div className="mr-4">
          <TrendBadge change={trend} />
        </div>
      )}
      {daysSince !== undefined && <span className={`mr-3 w-12 text-right text-xs ${daysColor}`}>{daysSince}d</span>}
      {status && <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusStyles[status]}`}>{status}</span>}
    </div>
  );
}
