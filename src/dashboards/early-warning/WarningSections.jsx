// Early Warning sections: financial efficiency, working capital (with CCC
// breakdown), people & engagement, and predictive revenue impact.
import { MetricCard } from '../../components/primitives.jsx';
import {
  FINANCIAL_KPIS, WORKING_CAPITAL_KPIS, CASH_CONVERSION,
  PEOPLE_METRICS, REVENUE_IMPACT_SCENARIOS,
} from '../../data/datasets/early-warning.js';

const STATUS_TEXT = { danger: 'text-red-400', warning: 'text-amber-400', good: 'text-emerald-400' };
const STATUS_BG = {
  danger: 'bg-red-900/20 border-red-500/30',
  warning: 'bg-amber-900/20 border-amber-500/30',
  good: 'bg-emerald-900/20 border-emerald-500/30',
};
const STATUS_ICON = { danger: '🔴', warning: '🟡', good: '🟢' };
const STATUS_ACCENT = { danger: '#ef4444', warning: '#f59e0b', good: '#10b981' };

// KPI card with explicit threshold + triggered playbook action.
function FinancialKPICard({ label, value, unit, threshold, thresholdDir, status, trigger }) {
  return (
    <div className={`rounded-xl border p-4 ${STATUS_BG[status]}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-muted">{label}</span>
        <span className="text-lg" aria-hidden>{STATUS_ICON[status]}</span>
      </div>
      <div className={`text-2xl font-bold ${STATUS_TEXT[status]}`}>{value}{unit}</div>
      <div className="mt-1 text-xs text-subtle">Threshold: {thresholdDir} {threshold}{unit}</div>
      {trigger && <div className="mt-2 rounded bg-panel px-2 py-1 text-xs text-slate-300">→ {trigger}</div>}
    </div>
  );
}

export function FinancialWarnings() {
  return (
    <div className="rounded-xl border border-red-500/30 bg-gradient-to-r from-red-900/20 to-panel p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl" aria-hidden>💰</span>
        <h3 className="font-semibold text-red-400">Financial Efficiency Warnings</h3>
        <span className="ml-auto rounded bg-red-500/20 px-2 py-1 text-xs text-red-400">4 of 5 Triggered</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {FINANCIAL_KPIS.map((k) => <FinancialKPICard key={k.label} {...k} />)}
      </div>
    </div>
  );
}

export function WorkingCapitalWarnings() {
  const cc = CASH_CONVERSION;
  return (
    <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-900/20 to-panel p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl" aria-hidden>📦</span>
        <h3 className="font-semibold text-amber-400">Working Capital Warnings</h3>
        <span className="ml-auto rounded bg-amber-500/20 px-2 py-1 text-xs text-amber-400">2 of 3 Triggered</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {WORKING_CAPITAL_KPIS.map((k) => <FinancialKPICard key={k.label} {...k} />)}
        <div className="rounded-xl border border-red-500/30 bg-red-900/20 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-muted">Cash Conversion Cycle</span>
            <span className="text-lg" aria-hidden>🔴</span>
          </div>
          <div className="text-2xl font-bold text-red-400">{cc.total} days</div>
          <div className="mt-1 text-xs text-subtle">DIO + DSO - DPO</div>
          <div className="mt-2 rounded bg-panel px-2 py-1 text-xs text-slate-300">→ Working capital strain</div>
        </div>
      </div>
      {/* CCC breakdown bar */}
      <div className="mt-4 rounded-lg bg-ink/50 p-3">
        <div className="mb-2 text-xs text-muted">Cash Conversion Cycle Breakdown</div>
        <div className="flex items-center gap-2">
          <div className="flex h-6 flex-1 overflow-hidden rounded-lg bg-border">
            {cc.segments.map((s) => (
              <div
                key={s.label}
                className={`flex h-full items-center justify-center text-xs font-medium text-white ${s.className}`}
                style={{ width: `${s.width}%` }}
              >
                {s.label}
              </div>
            ))}
          </div>
          <div className="font-bold text-white">= {cc.total}d</div>
        </div>
      </div>
    </div>
  );
}

export function PeopleWarnings({ onMetricClick }) {
  return (
    <div className="rounded-xl border border-border bg-panel p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl" aria-hidden>👥</span>
        <h3 className="font-semibold text-white">People &amp; Engagement Warnings</h3>
        <span className="ml-auto rounded bg-red-500/20 px-2 py-1 text-xs text-red-400">2 Breached</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PEOPLE_METRICS.map((m) => (
          <MetricCard
            key={m.key}
            label={m.label}
            value={m.value}
            unit={m.unit}
            delta={m.trend}
            deltaLabel="vs prior"
            hint={`Benchmark ${m.benchmark}${m.subtitle ? ` · ${m.subtitle}` : ''}`}
            accent={STATUS_ACCENT[m.status]}
            onClick={onMetricClick ? () => onMetricClick(m.key, m.label) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

const TONE_CLS = {
  red: 'bg-red-900/20 border-red-500/30 text-red-400',
  amber: 'bg-amber-900/20 border-amber-500/30 text-amber-400',
  emerald: 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400',
};

export function RevenueImpactPanel() {
  return (
    <div className="rounded-xl border border-border bg-panel p-6">
      <h3 className="mb-4 font-semibold text-white">📈 Predictive Revenue Impact (18-24 Months)</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {REVENUE_IMPACT_SCENARIOS.map((s) => {
          const tone = TONE_CLS[s.tone];
          return (
            <div key={s.label} className={`rounded-lg border p-4 ${tone.split(' ').slice(0, 2).join(' ')}`}>
              <div className="mb-1 text-sm text-muted">{s.label}</div>
              <div className={`text-2xl font-bold ${tone.split(' ')[2]}`}>{s.value}</div>
              <div className="text-xs text-subtle">{s.note}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
