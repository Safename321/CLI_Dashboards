// Generates the downloadable "CLI Data Audit Report" methodology document as
// an HTML Blob (replaces the legacy 12KB embedded base64 PDF — same content,
// print-to-PDF in the browser, like the other CLI report generators).
import {
  AUDIT_CATEGORIES,
  REPORT_VERIFIED_DATA,
  REPORT_MOCK_DATA,
  REPORT_PROXY_TABLE,
  REPORT_SECTION_ANALYSIS,
  REPORT_ROADMAP,
  REPORT_KEY_FINDINGS,
  REPORT_RECOMMENDATION,
} from '../../data/datasets/data-provenance.js';

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const table = (headers, rows) =>
  `<table><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>` +
  rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('') +
  '</table>';

export function downloadAuditReport() {
  const generated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const summaryRows = AUDIT_CATEGORIES.map((c) => [
    c.category,
    `${c.realPct}%`,
    `${100 - c.realPct}%`,
    `${c.canBeReal}%`,
    c.difficulty,
  ]).concat([['OVERALL', '~35%', '~65%', '~70%', 'Mixed']]);

  const html =
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>CLI Data Audit Report</title>' +
    '<style>' +
    'body{font-family:Helvetica,Arial,sans-serif;color:#1e293b;margin:40px;max-width:840px}' +
    'h1{font-size:22px;border-bottom:3px solid #0ea5e9;padding-bottom:8px}' +
    'h2{font-size:15px;margin-top:28px;color:#0f172a}' +
    'p,li{font-size:12px;line-height:1.5}' +
    'table{border-collapse:collapse;width:100%;margin:10px 0;font-size:11px}' +
    'th{background:#f1f5f9;text-align:left}' +
    'th,td{border:1px solid #cbd5e1;padding:5px 8px}' +
    '.meta{color:#64748b;font-size:11px}' +
    '.footer{margin-top:36px;color:#64748b;font-size:10px;border-top:1px solid #cbd5e1;padding-top:8px}' +
    '@media print{body{margin:16px}}' +
    '</style></head><body>' +
    '<h1>CLI Data Audit Report</h1>' +
    '<p class="meta">S&amp;P Global (SPGI) Dashboard: Real vs Mock Data Analysis · Timeframe: 2022&ndash;2026 · ' +
    `Generated: ${esc(generated)}</p>` +
    '<h2>Executive Summary</h2>' +
    table(['Data Category', '% Real', '% Mock', 'Can Be Real', 'Difficulty'], summaryRows) +
    '<h2>Section 1: Verified Real Data</h2>' +
    '<p>The following data in the CLI dashboard is 100% accurate, sourced from SEC filings and public disclosures:</p>' +
    table(['Category', 'Data Points', 'Source'], REPORT_VERIFIED_DATA) +
    '<h2>Section 2: Mock/Demonstration Data</h2>' +
    '<p>The following data is fictional, used for demonstration purposes:</p>' +
    table(['Category', 'Example Metrics', 'Why Mock'], REPORT_MOCK_DATA) +
    '<h2>Section 3: Proxy/Inference Strategies</h2>' +
    '<p>Mock data can be partially replaced using these public proxies:</p>' +
    table(['Mock Metric', 'Proxy Source', 'Method', 'Confidence'], REPORT_PROXY_TABLE) +
    '<h2>Section 4: Dashboard Section Analysis</h2>' +
    table(['Dashboard Section', 'Current % Real', 'Achievable % Real', 'Data Sources Needed'], REPORT_SECTION_ANALYSIS) +
    '<h2>Section 5: Implementation Roadmap</h2>' +
    table(['Phase', 'Timeline', 'Actions', 'Result'], REPORT_ROADMAP) +
    '<h2>Conclusion</h2>' +
    '<p><strong>Current CLI Reality Score: ~25&ndash;35% verified real data</strong></p>' +
    '<p><strong>Key Findings:</strong></p>' +
    `<ul>${REPORT_KEY_FINDINGS.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` +
    `<p><strong>Recommendation:</strong> ${esc(REPORT_RECOMMENDATION)}</p>` +
    '<div class="footer">Confidential — Prepared by Connective Leadership Institute | CLI Dashboard</div>' +
    '</body></html>';

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'CLI_Data_Audit_Report.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
