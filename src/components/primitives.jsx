// Shared UI primitives (§4.2) — built once, reused across all dashboards.
// Tailwind + design tokens (§4.7); real <button>/<a>, aria labels (§4.8).

const trendColor = (dir) => (dir > 0 ? 'text-emerald-400' : dir < 0 ? 'text-red-400' : 'text-muted');
const trendArrow = (dir) => (dir > 0 ? '▲' : dir < 0 ? '▼' : '–');

export function MetricCard({ label, value, unit, delta, deltaLabel, hint, onClick, accent }) {
  const dir = typeof delta === 'number' ? Math.sign(delta) : 0;
  const clickable = typeof onClick === 'function';
  const Tag = clickable ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={`flex w-full flex-col items-start rounded-lg border border-border bg-panel p-4 text-left ${
        clickable ? 'cursor-pointer transition-colors hover:border-accent' : ''
      }`}
      style={accent ? { borderTopColor: accent, borderTopWidth: 2 } : undefined}
    >
      <span className="text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
      <span className="mt-1 text-2xl font-semibold text-white">
        {value}
        {unit ? <span className="ml-0.5 text-base text-muted">{unit}</span> : null}
      </span>
      {typeof delta === 'number' && (
        <span className={`mt-1 text-xs ${trendColor(dir)}`}>
          {trendArrow(dir)} {Math.abs(delta)}
          {deltaLabel ? ` ${deltaLabel}` : ''}
        </span>
      )}
      {hint && <span className="mt-1 text-[11px] text-subtle">{hint}</span>}
    </Tag>
  );
}

export function StatusBadge({ status, children }) {
  const map = {
    green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    yellow: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    red: 'bg-red-500/15 text-red-400 border-red-500/30',
    info: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    mock: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  };
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium ${map[status] || map.info}`}>
      {children}
    </span>
  );
}

export function Panel({ title, subtitle, right, children, className = '' }) {
  return (
    <section className={`rounded-lg border border-border bg-panel p-5 ${className}`}>
      {(title || right) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-100">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}

// Horizontal bullet/progress bar for a value within [min,max].
export function BulletChart({ value, min = 0, max = 100, target, label, unit }) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const targetPct = target != null ? Math.max(0, Math.min(100, ((target - min) / (max - min)) * 100)) : null;
  return (
    <div className="w-full">
      {label && (
        <div className="mb-1 flex justify-between text-xs">
          <span className="text-muted">{label}</span>
          <span className="text-slate-200">
            {value}
            {unit}
          </span>
        </div>
      )}
      <div className="relative h-2.5 w-full rounded-full bg-ink">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
        {targetPct != null && <div className="absolute top-[-2px] h-[14px] w-0.5 bg-white" style={{ left: `${targetPct}%` }} />}
      </div>
    </div>
  );
}

export function DataTable({ columns, rows, getKey }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
            {columns.map((c) => (
              <th key={c.key} className="py-2 pr-4 font-medium">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={getKey ? getKey(row, i) : i} className="border-b border-border/50">
              {columns.map((c) => (
                <td key={c.key} className="py-2 pr-4 text-slate-200">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-border" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={`-mb-px border-b-2 px-3 py-2 text-sm transition-colors ${
            active === t.id ? 'border-accent text-white' : 'border-transparent text-muted hover:text-slate-200'
          }`}
        >
          {t.icon ? `${t.icon} ` : ''}
          {t.label}
        </button>
      ))}
    </div>
  );
}
