// Board Directors — printable board packet: exec summary, initiative status,
// risk heat map, financial-efficiency triggers (view id: board-packet).
import { Fragment } from 'react';
import DashboardShell from '../components/DashboardShell.jsx';
import RecommendationPanel from '../components/RecommendationPanel.jsx';
import { generateBoardPacketPDF, REPORT_BUTTON_SAYINGS } from '../reports/index.js';
import { useData } from '../data/DataContext.jsx';
import {
  BOARD_PACKET_ALERT,
  BOARD_EXEC_SUMMARY,
  BOARD_INITIATIVES,
  RISK_HEATMAP,
  FINANCIAL_KPI_CARDS,
} from '../data/datasets/executive.js';

const reportSaying = () => {
  const list = Array.isArray(REPORT_BUTTON_SAYINGS) && REPORT_BUTTON_SAYINGS.length ? REPORT_BUTTON_SAYINGS : ['Generate Report'];
  return list[Math.floor(Date.now() / 1000) % list.length];
};

const SUMMARY_TONES = { amber: 'text-amber-400', red: 'text-red-400', emerald: 'text-emerald-400', cyan: 'text-accent' };
const STATUS_BADGES = {
  'on-track': 'bg-emerald-500/20 text-emerald-400',
  'at-risk': 'bg-amber-500/20 text-amber-400',
  delayed: 'bg-red-500/20 text-red-400',
};
const STATUS_BARS = { 'on-track': 'bg-emerald-500', 'at-risk': 'bg-amber-500', delayed: 'bg-red-500' };
const RISK_TONES = { low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-red-400' };
const HEAT_CELL_TONES = { green: 'bg-emerald-900/30', amber: 'bg-amber-900/30', red: 'bg-red-900/30', none: 'bg-slate-700/30' };
const HEAT_TEXT_TONES = { amber: 'text-amber-400', red: 'text-red-400' };
const TILE_TONES = {
  danger: { box: 'bg-red-900/20 border-red-500/30', text: 'text-red-400' },
  warning: { box: 'bg-amber-900/20 border-amber-500/30', text: 'text-amber-400' },
  good: { box: 'bg-emerald-900/20 border-emerald-500/30', text: 'text-emerald-400' },
};

export default function BoardPacketDashboard() {
  const { data } = useData();
  const triggeredCount = FINANCIAL_KPI_CARDS.filter((k) => k.trigger).length;

  const onDownload = () => {
    try {
      generateBoardPacketPDF(data);
    } catch (err) {
      console.error('[BoardPacketDashboard] board packet PDF generation failed:', err);
    }
  };

  return (
    <DashboardShell
      title="Board Directors"
      icon="📋"
      subtitle="Board pack · Presentations · Director briefings — Q4 2025 Board Meeting • S&P Global (SPGI)"
      actions={
        <div className="flex gap-2">
          <button onClick={onDownload} className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600">
            📥 {reportSaying()}
          </button>
          <button className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500" title="PPT export coming soon">
            📊 Export PPT
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <RecommendationPanel
          severity={BOARD_PACKET_ALERT.severity}
          title={BOARD_PACKET_ALERT.title}
          evidence={BOARD_PACKET_ALERT.evidence}
          strategy={BOARD_PACKET_ALERT.strategy}
          tactics={BOARD_PACKET_ALERT.tactics}
          downloadUrl={BOARD_PACKET_ALERT.downloadUrl}
          downloadLabel={BOARD_PACKET_ALERT.downloadLabel}
          reportData={data}
        />

        {/* Executive Summary */}
        <section className="rounded-xl border border-border bg-panel p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Executive Summary</h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {BOARD_EXEC_SUMMARY.map((s) => (
              <div key={s.label} className="text-center">
                <div className={`text-4xl font-bold ${SUMMARY_TONES[s.tone]}`}>{s.value}</div>
                <div className="mt-1 text-sm text-muted">{s.label}</div>
                <div className="text-xs text-subtle">{s.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Strategic Initiatives Status */}
        <section className="rounded-xl border border-border bg-panel p-6">
          <h3 className="mb-4 font-semibold text-white">Strategic Initiatives Status</h3>
          <div className="space-y-4">
            {BOARD_INITIATIVES.map((item) => (
              <div key={item.name} className="flex items-center gap-4 border-b border-border/50 py-3 last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{item.name}</span>
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGES[item.status]}`}>{item.status}</span>
                  </div>
                  <div className="text-sm text-subtle">Owner: {item.owner}</div>
                </div>
                <div className="w-48">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted">Progress</span>
                    <span className="text-white">{item.progress}%</span>
                  </div>
                  <div className="h-2 rounded bg-slate-700">
                    <div className={`h-full rounded ${STATUS_BARS[item.status]}`} style={{ width: `${item.progress}%` }} />
                  </div>
                </div>
                <div className={`text-sm ${RISK_TONES[item.risk]}`}>{item.risk} risk</div>
              </div>
            ))}
          </div>
        </section>

        {/* Risk Heat Map */}
        <section className="rounded-xl border border-border bg-panel p-6">
          <h3 className="mb-4 font-semibold text-white">Risk Heat Map</h3>
          <div className="grid grid-cols-5 gap-2">
            <div />
            {RISK_HEATMAP.columns.map((c) => (
              <div key={c} className="text-center text-xs text-muted">
                {c}
              </div>
            ))}
            {RISK_HEATMAP.rows.map((row) => (
              <Fragment key={row.category}>
                <div className="pr-2 text-right text-xs text-muted">{row.category}</div>
                {row.cells.map((cell, i) => (
                  <div
                    key={i}
                    className={`rounded p-2 text-center text-xs ${HEAT_CELL_TONES[cell.tone]} ${cell.bold ? `font-bold ${HEAT_TEXT_TONES[cell.tone] || ''}` : ''}`}
                  >
                    {cell.text}
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </section>

        {/* Financial Efficiency KPIs (Strategy Triggers) */}
        <section className="rounded-xl border border-border bg-panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-white">💰 Financial Efficiency KPIs (Strategy Triggers)</h3>
            <span className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-400">
              {triggeredCount} of {FINANCIAL_KPI_CARDS.length} Triggered
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {FINANCIAL_KPI_CARDS.map((k) => {
              const tone = TILE_TONES[k.status] || TILE_TONES.good;
              return (
                <div key={k.label} className={`rounded-lg border p-3 text-center ${tone.box}`}>
                  <div className={`text-xl font-bold ${tone.text}`}>
                    {k.value}
                    {k.unit}
                  </div>
                  <div className="text-xs text-muted">{k.label}</div>
                  <div className={`mt-1 text-xs ${tone.text}`}>{k.boardAction}</div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
