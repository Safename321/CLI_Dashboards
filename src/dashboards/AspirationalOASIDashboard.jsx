// Aspirational OASI — desired vs current culture profile and the 3-year
// transformation projection. Ported from legacy AspirationalOASIDashboard
// (App.jsx ~6025-6233). View id: aspirational-oasi.
import { useMemo } from 'react';
import DashboardShell from '../components/DashboardShell.jsx';
import DemoDataBanner from '../components/DemoDataBanner.jsx';
import { OASIOverlayRadarChart } from '../components/OASIRadar.jsx';
import { useData } from '../data/DataContext.jsx';
import {
  ORG_OASI_SCORES,
  IDEAL_OASI_SCORES,
  OASI_FINANCIAL_PROJECTIONS,
  OASI_STYLE_COMPARISON,
} from '../data/datasets/oasi-scores.js';

const PRIORITY_BADGE = {
  critical: '🔴 Critical',
  high: '🟠 High',
  medium: '🟡 Medium',
  reduce: '🔴 Reduce',
  aligned: '🟢 Aligned',
};

const SUMMARY_CARDS = [
  { label: '2028 Projected Revenue', value: '$19.8B', valueClass: 'text-blue-400', note: '+29% from 2025', noteClass: 'text-emerald-400' },
  { label: '2028 Projected Net Income', value: '$6.2B', valueClass: 'text-emerald-400', note: '+39% from 2025', noteClass: 'text-emerald-400' },
  { label: 'Cumulative OASI Synergies', value: '$1.4B', valueClass: 'text-purple-400', note: 'Culture transformation value', noteClass: 'text-purple-300' },
  { label: '2028 Operating Margin', value: '54.2%', valueClass: 'text-amber-400', note: '+3.8pp from 2025', noteClass: 'text-emerald-400' },
];

// Projection table rows: which field, formatting, and row styling
const PROJECTION_ROWS = [
  { label: 'Revenue ($B)', field: 'revenue', fmt: (v) => v.toFixed(2), labelClass: 'text-blue-400 font-medium', cellClass: 'text-slate-300' },
  { label: 'Operating Costs ($B)', field: 'costs', fmt: (v) => v.toFixed(2), labelClass: 'text-slate-300', cellClass: 'text-slate-400' },
  { label: 'OASI Synergies ($M)', field: 'synergies', fmt: (v) => v, labelClass: 'text-yellow-400 font-bold text-[15px]', cellClass: 'text-yellow-300 font-bold text-[15px]', rowClass: 'bg-yellow-900/20' },
  { label: 'Operating Income ($B)', field: 'opIncome', fmt: (v) => v.toFixed(2), labelClass: 'text-slate-300', cellClass: 'text-slate-300' },
  { label: 'Net Income ($B)', field: 'netIncome', fmt: (v) => v.toFixed(2), labelClass: 'text-emerald-400 font-medium', cellClass: 'text-emerald-300' },
  { label: 'Operating Margin (%)', field: 'opMargin', fmt: (v) => v.toFixed(1), labelClass: 'text-amber-400', cellClass: 'text-amber-300' },
  { label: 'OASI Alignment (%)', field: 'oasiAlignment', fmt: (v) => v, labelClass: 'text-emerald-400 font-medium', cellClass: 'text-emerald-300', rowClass: 'bg-emerald-900/10' },
  { label: 'Voluntary Turnover (%)', field: 'turnover', fmt: (v) => v.toFixed(1), labelClass: 'text-slate-300', cellClass: 'text-slate-400' },
  { label: 'eNPS Score', field: 'eNPS', fmt: (v) => v, labelClass: 'text-cyan-400', cellClass: 'text-cyan-300' },
];

const STATE_CARDS = [
  { tone: 'border-red-500/30 bg-red-900/20', tag: 'text-red-400', tagText: 'Current State', title: 'Direct-Dominant Culture', titleClass: 'text-red-300', text: 'Competitive (7.8) and Power (7.2) overshadow collaboration. Talent hoards; leaders micromanage.' },
  { tone: 'border-amber-500/30 bg-amber-900/20', tag: 'text-amber-400', tagText: 'Transformation Path', title: 'Behavioral Rebalancing', titleClass: 'text-amber-300', text: 'Revise promotion criteria, bonus structures, recognition to reward mentoring, delegation, team wins.' },
  { tone: 'border-emerald-500/30 bg-emerald-900/20', tag: 'text-emerald-400', tagText: 'Target State (2028)', title: 'Balanced Connective Leadership', titleClass: 'text-emerald-300', text: 'Relational (7.1 avg) and Instrumental (6.4 avg) elevated; Direct (5.8 avg) moderated.' },
];

export default function AspirationalOASIDashboard() {
  const { tenant } = useData();
  const scores = ORG_OASI_SCORES;
  const idealScores = IDEAL_OASI_SCORES;

  const styleComparison = useMemo(
    () =>
      OASI_STYLE_COMPARISON.map((s) => ({
        ...s,
        current: scores[s.key],
        ideal: idealScores[s.key],
        gap: idealScores[s.key] - scores[s.key],
      })),
    [scores, idealScores]
  );

  return (
    <DashboardShell
      title="Aspirational OASI"
      icon="🎯"
      subtitle="Desired vs. current organizational culture — the change target for leadership"
    >
      <div className="space-y-6">
        <DemoDataBanner />

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Aspirational OASI Dashboard</h2>
            <p className="mt-1 text-muted">Target Achieving Styles profile aligned with S&amp;P Global's stated corporate goals</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted">Current → Target Alignment</div>
            <div className="text-3xl font-bold text-amber-400">57% → 92%</div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4">
          {SUMMARY_CARDS.map((c) => (
            <div key={c.label} className="rounded-xl bg-panel p-5 text-center">
              <div className="mb-2 text-xs uppercase tracking-wide text-muted">{c.label}</div>
              <div className={`text-3xl font-bold ${c.valueClass}`}>{c.value}</div>
              <div className={`mt-1 text-sm ${c.noteClass}`}>{c.note}</div>
            </div>
          ))}
        </div>

        {/* Overlay radar + gap analysis table */}
        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-xl bg-panel p-6">
            <h3 className="mb-4 text-center font-semibold text-white">OASI Profile: Current vs Ideal</h3>
            <OASIOverlayRadarChart currentScores={scores} idealScores={idealScores} size={320} />
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-28 text-sm text-muted">Alignment Score</span>
                <div className="h-2 flex-1 rounded bg-slate-700"><div className="h-full rounded bg-gradient-to-r from-red-500 to-amber-500" style={{ width: '57%' }} /></div>
                <span className="w-12 text-right text-sm font-semibold text-amber-400">57%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-28 text-sm text-muted">Target (2028)</span>
                <div className="h-2 flex-1 rounded bg-slate-700"><div className="h-full rounded bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: '92%' }} /></div>
                <span className="w-12 text-right text-sm font-semibold text-emerald-400">92%</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-panel p-6">
            <h3 className="mb-4 font-semibold text-white">9 Achieving Styles Gap Analysis</h3>
            <div className="max-h-80 overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 text-left text-xs text-muted">Style</th>
                    <th className="py-2 text-center text-xs text-red-400">Current</th>
                    <th className="py-2 text-center text-xs text-emerald-400">Ideal</th>
                    <th className="py-2 text-center text-xs text-muted">Gap</th>
                    <th className="py-2 text-center text-xs text-muted">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {styleComparison.map((s) => (
                    <tr key={s.key} className="border-b border-slate-700/50">
                      <td className="py-2"><div className="text-sm text-white">{s.style}</div><div className="text-xs text-subtle">{s.set}</div></td>
                      <td className="text-center font-semibold text-red-400">{s.current}</td>
                      <td className="text-center font-semibold text-emerald-400">{s.ideal}</td>
                      <td className="text-center font-semibold">
                        <span className={s.gap > 0 ? 'text-emerald-400' : s.gap < 0 ? 'text-red-400' : 'text-muted'}>{s.gap > 0 ? '+' : ''}{s.gap.toFixed(1)}</span>
                      </td>
                      <td className="text-center text-xs">{PRIORITY_BADGE[s.priority]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3-year quarterly projection */}
        <div className="rounded-xl bg-panel p-6">
          <h3 className="mb-4 font-semibold text-white">📈 3-Year Financial Projection: OASI Transformation Impact (Q1 2026 – Q4 2028)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-2 py-2 text-left text-muted">Metric</th>
                  {['2026', '2027', '2028'].map((y) => (
                    <th key={y} colSpan="4" className="bg-blue-900/20 py-2 text-center text-blue-400">{y}</th>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <th className="px-2 py-1 text-left text-subtle" />
                  {OASI_FINANCIAL_PROJECTIONS.map((p) => (
                    <th key={p.quarter} className="px-1 py-1 text-center text-subtle">{p.quarter.split(' ')[0]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PROJECTION_ROWS.map((row) => (
                  <tr key={row.field} className={`border-b border-slate-700/50 last:border-0 ${row.rowClass || ''}`}>
                    <td className={`px-2 py-2 ${row.labelClass}`}>{row.label}</td>
                    {OASI_FINANCIAL_PROJECTIONS.map((p) => (
                      <td key={p.quarter} className={`px-1 py-2 text-center ${row.cellClass}`}>{row.fmt(p[row.field])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* OASI as leading indicator */}
        <div className="rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-2xl" aria-hidden>💡</span>
            <h3 className="text-lg font-semibold text-blue-400">OASI as a Leading Indicator of Organizational Effectiveness</h3>
          </div>
          <div className="mb-5 rounded-lg bg-ink/50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-lg" aria-hidden>📌</span>
              <h4 className="font-semibold text-white">Executive Summary</h4>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              The Organization Achieving Styles Inventory (OASI) serves as a powerful leading indicator because it measures the behavioral
              patterns that an organization actually rewards and reinforces, rather than what it merely espouses—and behavior precedes
              results by 6-18 months in complex organizations. When S&amp;P Global aligns its reward systems to elevate Collaborative,
              Vicarious, and Entrusting
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {STATE_CARDS.map((c) => (
              <div key={c.tagText} className={`rounded-lg border p-4 ${c.tone}`}>
                <div className={`mb-2 text-xs uppercase tracking-wide ${c.tag}`}>{c.tagText}</div>
                <div className={`text-sm font-semibold ${c.titleClass}`}>{c.title}</div>
                <div className="mt-1 text-xs text-muted">{c.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
