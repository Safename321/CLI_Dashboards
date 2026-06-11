// Small presentational pieces shared by the employee-leading tab set (and
// reused by Customer Health / Hiring for their stat tiles).

const TONES = {
  red: { box: 'bg-red-900/20 border-red-500/30', text: 'text-red-400' },
  amber: { box: 'bg-amber-900/20 border-amber-500/30', text: 'text-amber-400' },
  blue: { box: 'bg-blue-900/20 border-blue-500/30', text: 'text-blue-400' },
  emerald: { box: 'bg-emerald-900/20 border-emerald-500/30', text: 'text-emerald-400' },
  cyan: { box: 'bg-cyan-900/20 border-cyan-500/30', text: 'text-cyan-400' },
  slate: { box: 'bg-panel border-border', text: 'text-amber-400' },
};

// Big-number tile with tinted background (legacy "bg-*-900/20" stat boxes).
export function StatTile({ value, label, sub, tone = 'blue', center = false }) {
  const t = TONES[tone] || TONES.blue;
  return (
    <div className={`rounded-lg border p-4 ${t.box} ${center ? 'text-center' : ''}`}>
      <div className={`text-2xl font-bold ${t.text}`}>{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
      {sub && <div className="mt-1 text-xs text-subtle">{sub}</div>}
    </div>
  );
}

// Thin horizontal progress bar; pass a literal Tailwind bg-* class for color.
export function Bar({ pct, color = 'bg-red-500' }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-ink">
      <div className={`h-full ${color}`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  );
}

// Legacy score→color rules (thresholds vary per chart, so they are params).
export const scoreBarColor = (score, good, ok) =>
  score >= good ? 'bg-emerald-500' : score >= ok ? 'bg-amber-500' : 'bg-red-500';
