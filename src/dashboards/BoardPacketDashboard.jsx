// Board Directors — printable board packet (view id: board-packet).
//
// Phase 3 (D1): tenant-real. The demo build keeps the static S&P packet; a
// real login composes the packet from what already exists — org-oasi (scores +
// participation), the roster (headcount), the entered per-tenant datasets
// (currentKpis financials), and the SWOT materiality read for the leadership
// summary. Printable via a live board-packet report (browser print → PDF).
import { Fragment, useMemo } from 'react';
import DashboardShell from '../components/DashboardShell.jsx';
import RecommendationPanel from '../components/RecommendationPanel.jsx';
import { generateBoardPacketPDF, REPORT_BUTTON_SAYINGS } from '../reports/index.js';
import { useData } from '../data/DataContext.jsx';
import { useDataset, useOrgOasiBundle, useRoster } from '../lib/liveData.js';
import { financialCardsFromKpis } from '../lib/liveKpis.js';
import { buildSwotFactors, rankFactors, buildExecSummary } from './swot/logic.js';
import { DEFAULT_SWOT_CONFIG } from '../data/datasets/swot.js';
import { getUser } from '../lib/auth.js';
import {
  BOARD_PACKET_ALERT,
  BOARD_EXEC_SUMMARY,
  BOARD_INITIATIVES,
  RISK_HEATMAP,
  FINANCIAL_KPI_CARDS,
} from '../data/datasets/executive.js';

const DEMO_BUILD = import.meta.env.VITE_AUTH_DISABLED === 'true';

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

const STYLE_LABELS = {
  intrinsic: 'Intrinsic', competitive: 'Competitive', power: 'Power',
  personal: 'Personal', social: 'Social', entrusting: 'Entrusting',
  collaborative: 'Collaborative', contributory: 'Contributory', vicarious: 'Vicarious',
};

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Printable live board packet (browser print → PDF), composed from the same
// live values the page shows — never the demo narrative.
function openLiveBoardPacket({ company, tiles, scores, summary, cards }) {
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  let html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Board Packet · ' + esc(company) + '</title><style>';
  html += 'body{font-family:Arial,sans-serif;padding:40px;max-width:940px;margin:0 auto;color:#1e293b;line-height:1.55}';
  html += '.header{text-align:center;border-bottom:3px solid #1a365d;padding-bottom:18px;margin-bottom:22px}';
  html += 'h1{color:#1a365d;font-size:25px;margin:0 0 6px}h2{color:#2E5090;border-bottom:2px solid #2E5090;padding-bottom:6px;margin-top:30px;font-size:17px}';
  html += '.tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0}';
  html += '.tile{border:1px solid #cbd5e1;border-radius:8px;padding:12px;text-align:center}';
  html += '.tile b{font-size:22px;color:#1a365d;display:block}';
  html += 'table{width:100%;border-collapse:collapse;margin:12px 0;font-size:13px}th{background:#1a365d;color:#fff;text-align:left;padding:7px 10px}td{padding:7px 10px;border-bottom:1px solid #e2e8f0}';
  html += '.exec{background:#1a365d;color:#fff;padding:16px 20px;border-radius:8px;margin:16px 0;font-size:13px}';
  html += '.footer{margin-top:32px;padding-top:12px;border-top:1px solid #cbd5e1;font-size:11px;color:#64748b;display:flex;justify-content:space-between}';
  html += '</style></head><body>';
  html += '<div class="header"><h1>Board Packet — ' + esc(company) + '</h1><div style="color:#64748b;font-size:13px">Live organizational read · CLI Connective Leadership Institute · ' + now + '</div></div>';
  html += '<div class="tiles">' + tiles.map((t) => '<div class="tile"><b>' + esc(t.value) + '</b>' + esc(t.label) + '</div>').join('') + '</div>';
  html += '<div class="exec"><b>Leadership read.</b> ' + esc(summary) + '</div>';
  if (scores) {
    html += '<h2>Organizational Achieving Styles (OASI, raw 1–7)</h2><table><thead><tr><th>Style</th><th>Score</th></tr></thead><tbody>';
    html += Object.entries(STYLE_LABELS).map(([k, label]) => '<tr><td>' + label + '</td><td>' + (scores[k] != null ? Number(scores[k]).toFixed(2) : '—') + '</td></tr>').join('');
    html += '</tbody></table>';
  }
  if (cards?.length) {
    html += '<h2>Financial Efficiency KPIs</h2><table><thead><tr><th>KPI</th><th>Value</th><th>Threshold</th><th>Board action</th></tr></thead><tbody>';
    html += cards.map((c) => '<tr><td>' + esc(c.label) + '</td><td>' + esc(String(c.value) + c.unit) + '</td><td>' + esc(c.thresholdDir + ' ' + c.threshold) + '</td><td>' + esc(c.boardAction) + '</td></tr>').join('');
    html += '</tbody></table>';
  }
  html += '<div class="footer"><span>&copy; ' + new Date().getFullYear() + ' Connective Leadership Institute — CLI Dashboards v2</span><span>Confidential</span></div>';
  html += '</body></html>';
  window.open(URL.createObjectURL(new Blob([html], { type: 'text/html' })), '_blank');
}

// ── Live tenant packet ────────────────────────────────────────────────────────
function LiveBoardPacket() {
  const oasi = useOrgOasiBundle(true);
  const roster = useRoster([]);
  const kpis = useDataset('currentKpis', null);
  const swotConfig = useDataset('swotConfig', null);

  const scores = oasi.data?.scores;
  const recordCount = oasi.data?.recordCount ?? 0;

  const { tiles, summary, ranked } = useMemo(() => {
    const headcount = roster?.length ?? 0;
    const participation = headcount > 0 ? Math.min(100, Math.round((recordCount / headcount) * 100)) : null;
    const numeric = scores ? Object.keys(STYLE_LABELS).map((k) => Number(scores[k])).filter((v) => !Number.isNaN(v)) : [];
    const mean = numeric.length ? (numeric.reduce((a, b) => a + b, 0) / numeric.length) : null;

    const tiles = [
      { value: String(headcount), label: 'Employees on roster', tone: 'cyan' },
      { value: String(recordCount), label: 'Assessments completed', tone: recordCount ? 'emerald' : 'amber' },
      { value: participation != null ? `${participation}%` : '—', label: 'Participation', tone: participation >= 60 ? 'emerald' : 'amber' },
      { value: mean != null ? mean.toFixed(2) : '—', label: 'Org OASI mean (1–7)', tone: 'cyan' },
    ];

    let summary = 'No completed assessments yet — assign CLI instruments to generate the behavioral read.';
    let ranked = [];
    if (scores && recordCount) {
      const named = {};
      for (const [k, label] of Object.entries(STYLE_LABELS)) {
        if (scores[k] != null) named[label] = Number(scores[k]);
      }
      const cfg = swotConfig && typeof swotConfig === 'object' && Object.keys(swotConfig).length
        ? { styles: { ...DEFAULT_SWOT_CONFIG.styles, ...(swotConfig.styles || {}) },
            inferred: swotConfig.inferred ?? DEFAULT_SWOT_CONFIG.inferred,
            arrows: swotConfig.arrows ?? DEFAULT_SWOT_CONFIG.arrows }
        : DEFAULT_SWOT_CONFIG;
      ranked = rankFactors(buildSwotFactors(named, cfg));
      summary = buildExecSummary(ranked);
    }
    return { tiles, summary, ranked };
  }, [scores, recordCount, roster, swotConfig]);

  const cards = financialCardsFromKpis(kpis);

  if (oasi.status === 'loading') {
    return <p className="mx-auto mt-10 max-w-xl text-sm text-muted">Assembling your board packet…</p>;
  }

  return (
    <div className="space-y-6">
      {/* Executive summary tiles */}
      <section className="rounded-xl border border-border bg-panel p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Executive Summary</h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {tiles.map((s) => (
            <div key={s.label} className="text-center">
              <div className={`text-4xl font-bold ${SUMMARY_TONES[s.tone] ?? 'text-accent'}`}>{s.value}</div>
              <div className="mt-1 text-sm text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Leadership read (SWOT materiality summary) */}
      <section className="rounded-xl border border-border bg-panel p-6">
        <h3 className="mb-3 font-semibold text-white">🧭 Leadership Read — from your organization's OASI</h3>
        <p className="text-sm leading-relaxed text-slate-300">{summary}</p>
        {ranked.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-9">
            {Object.entries(STYLE_LABELS).map(([k, label]) => {
              const v = scores?.[k] != null ? Number(scores[k]) : null;
              return (
                <div key={k} className="rounded-md border border-border bg-ink px-2 py-2 text-center">
                  <div className="font-mono text-sm text-accent">{v != null ? v.toFixed(1) : '—'}</div>
                  <div className="text-[9px] uppercase tracking-wider text-muted">{label}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Financial Efficiency KPIs from the entered dataset */}
      <section className="rounded-xl border border-border bg-panel p-6">
        <h3 className="mb-4 font-semibold text-white">💰 Financial Efficiency KPIs</h3>
        {cards ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {cards.map((k) => {
              const tone = TILE_TONES[k.status] || TILE_TONES.good;
              return (
                <div key={k.label} className={`rounded-lg border p-3 text-center ${tone.box}`}>
                  <div className={`text-xl font-bold ${tone.text}`}>{k.value}{k.unit}</div>
                  <div className="text-xs text-muted">{k.label}</div>
                  <div className={`mt-1 text-xs ${tone.text}`}>{k.boardAction}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm italic text-muted">
            No financial KPIs entered — store them in the <span className="font-semibold text-slate-200">currentKpis</span> dataset
            (cashMultiple, cacPayback, churnRate, salesCycle, leadConversion) via the console editor.
          </p>
        )}
      </section>

      <p className="text-[11px] italic text-subtle">
        Composed live from your organization's synced assessments, roster and entered datasets — no demo figures.
      </p>
    </div>
  );
}

// ── Demo packet (public demo build — unchanged v1.24L port) ──────────────────
function DemoBoardPacket({ data }) {
  const triggeredCount = FINANCIAL_KPI_CARDS.filter((k) => k.trigger).length;
  return (
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
            <div key={c} className="text-center text-xs text-muted">{c}</div>
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
                <div className={`text-xl font-bold ${tone.text}`}>{k.value}{k.unit}</div>
                <div className="text-xs text-muted">{k.label}</div>
                <div className={`mt-1 text-xs ${tone.text}`}>{k.boardAction}</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default function BoardPacketDashboard() {
  const { data } = useData();
  // Live sources are only fetched on real logins (hook enabled flag).
  const oasi = useOrgOasiBundle(!DEMO_BUILD);
  const roster = useRoster([]);
  const kpis = useDataset('currentKpis', null);
  const company = getUser()?.company?.name ?? getUser()?.company ?? 'Your organization';

  const onDownload = () => {
    try {
      if (DEMO_BUILD) {
        generateBoardPacketPDF(data);
        return;
      }
      const scores = oasi.data?.scores;
      const recordCount = oasi.data?.recordCount ?? 0;
      const headcount = roster?.length ?? 0;
      const numeric = scores ? Object.keys(STYLE_LABELS).map((k) => Number(scores[k])).filter((v) => !Number.isNaN(v)) : [];
      const mean = numeric.length ? (numeric.reduce((a, b) => a + b, 0) / numeric.length) : null;
      let summary = 'No completed assessments yet.';
      if (scores && recordCount) {
        const named = {};
        for (const [k, label] of Object.entries(STYLE_LABELS)) {
          if (scores[k] != null) named[label] = Number(scores[k]);
        }
        summary = buildExecSummary(rankFactors(buildSwotFactors(named, DEFAULT_SWOT_CONFIG)));
      }
      openLiveBoardPacket({
        company,
        tiles: [
          { value: String(headcount), label: 'Employees on roster' },
          { value: String(recordCount), label: 'Assessments completed' },
          { value: headcount ? `${Math.min(100, Math.round((recordCount / headcount) * 100))}%` : '—', label: 'Participation' },
          { value: mean != null ? mean.toFixed(2) : '—', label: 'Org OASI mean (1–7)' },
        ],
        scores,
        summary,
        cards: financialCardsFromKpis(kpis),
      });
    } catch (err) {
      console.error('[BoardPacketDashboard] packet generation failed:', err);
    }
  };

  return (
    <DashboardShell
      title="Board Directors"
      icon="📋"
      subtitle={DEMO_BUILD
        ? 'Board pack · Presentations · Director briefings — Q4 2025 Board Meeting • S&P Global (SPGI)'
        : `Board pack · Director briefings — composed live for ${company}`}
      actions={
        <div className="flex gap-2">
          <button onClick={onDownload} className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600">
            📥 {reportSaying()}
          </button>
          {DEMO_BUILD && (
            <button className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500" title="PPT export coming soon">
              📊 Export PPT
            </button>
          )}
        </div>
      }
    >
      {DEMO_BUILD ? <DemoBoardPacket data={data} /> : <LiveBoardPacket />}
    </DashboardShell>
  );
}
