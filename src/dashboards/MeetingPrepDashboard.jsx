// Meeting Prep — briefing summaries and talking points generated from current
// dashboard data. Tiny in v1.24L: one advisory panel with a board-packet
// download (HTML report, print-to-PDF — same pattern as the legacy generators).
import DashboardShell from '../components/DashboardShell.jsx';
import AdvisoryPanel from './external/AdvisoryPanel.jsx';

function downloadBoardBrief(yearData) {
  const fin = yearData || {};
  const html =
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>S&P Global Inc (SPGI) - Q2 2026 Board Presentation</title>' +
    '<style>body{font-family:Helvetica,Arial,sans-serif;color:#1e293b;margin:40px;max-width:840px}' +
    'h1{font-size:22px;border-bottom:3px solid #0ea5e9;padding-bottom:8px}h2{font-size:15px;margin-top:24px}' +
    'p,li,td,th{font-size:12px;line-height:1.5}table{border-collapse:collapse;width:100%;margin:10px 0}' +
    'th,td{border:1px solid #cbd5e1;padding:5px 8px;text-align:left}th{background:#f1f5f9}' +
    '.footer{margin-top:36px;color:#64748b;font-size:10px;border-top:1px solid #cbd5e1;padding-top:8px}</style></head><body>' +
    '<h1>S&amp;P Global Inc (SPGI) — Q2 2026 Board Presentation</h1>' +
    '<p>Board meeting: May 22, 2026 · Agenda ready · Materials to finalize</p>' +
    '<h2>Headline Financials' + (fin.year ? ` (FY ${fin.year})` : '') + '</h2>' +
    '<table><tr><th>Metric</th><th>Value</th></tr>' +
    `<tr><td>Revenue</td><td>$${fin.revenue ?? '—'}B (${fin.revenueGrowth ?? '—'}% YoY)</td></tr>` +
    `<tr><td>Net Income</td><td>$${fin.netIncome ?? '—'}B</td></tr>` +
    `<tr><td>EPS</td><td>$${fin.eps ?? '—'} (adj. $${fin.adjustedEps ?? '—'})</td></tr>` +
    `<tr><td>Operating Margin</td><td>${fin.operatingMargin ?? '—'}% (adj. ${fin.adjustedOperatingMargin ?? '—'}%)</td></tr>` +
    '</table>' +
    '<h2>Preparation Checklist</h2>' +
    '<ul><li>Agenda circulated and confirmed</li><li>Finalize board packet materials</li>' +
    '<li>Review open actions from prior meeting</li><li>Pre-read distribution 48h before the meeting</li></ul>' +
    '<div class="footer">Confidential — Prepared by Connective Leadership Institute | CLI Dashboard</div>' +
    '</body></html>';

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'SPGI_Q2_2026_Board_Packet.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function MeetingPrepDashboard({ yearData }) {
  return (
    <DashboardShell
      title="Meeting Prep"
      icon="📅"
      alerts={1}
      subtitle="Briefing summaries and talking points generated from current dashboard data"
    >
      <AdvisoryPanel
        severity="info"
        title="Board Meeting in 5 Days"
        evidence={['May 22, 2026', 'Agenda ready']}
        strategy="Finalize materials."
        tactics={[{ title: 'Download Report', description: 'Board packet', deliverable: 'Report' }]}
        download={{ label: 'Q2 Board Presentation', onDownload: () => downloadBoardBrief(yearData) }}
      />
    </DashboardShell>
  );
}
