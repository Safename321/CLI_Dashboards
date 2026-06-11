// Scenario Tester report — builds a printable HTML report (user prints to PDF
// from the browser). Ported from legacy generateScenarioPDF + cliReportFooter;
// tenant/email are passed in instead of read from sessionStorage.

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const STYLES = [
  'body{font-family:Arial,sans-serif;padding:40px;max-width:900px;margin:0 auto;color:#1A1A1A}',
  '.header{border-bottom:3px solid #1B2A4A;padding-bottom:20px;margin-bottom:30px}',
  '.brand{color:#E00000;font-family:"Arial Black",Arial,sans-serif;font-weight:bold;font-size:32px;letter-spacing:-1px}',
  '.subtitle{color:#666;font-size:13px;margin-top:4px}',
  'h1{color:#1B2A4A;font-size:24px;margin:0 0 6px 0}',
  'h2{color:#006B77;font-size:16px;border-bottom:1px solid #daa520;padding-bottom:6px;margin-top:30px}',
  '.framing{background:#FDF6E3;border-left:4px solid #B8922A;padding:14px;margin:16px 0;font-size:13px;line-height:1.55}',
  'table{width:100%;border-collapse:collapse;margin:14px 0;font-size:12px}',
  'th{background:#1B2A4A;color:white;text-align:left;padding:9px 10px;font-weight:600}',
  'td{padding:9px 10px;border-bottom:1px solid #e2e8f0}',
  '.num{font-family:monospace;font-weight:600}',
  '.pos{color:#1B4332}.neg{color:#8B1818}',
  '.total{background:#E8F5E9;border:1px solid #1B4332;padding:14px;margin:14px 0;border-radius:6px}',
  '.total-label{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#1B4332;margin-bottom:4px}',
  '.total-value{font-size:28px;font-weight:bold;font-family:monospace}',
  '.caveat{background:#FDEEEE;border-left:4px solid #8B1818;padding:12px;margin:14px 0;font-size:11px;line-height:1.5}',
].join('');

// Uniform footer carried by every generated report: timestamp, user, tenant.
function reportFooter({ email, tenantName }) {
  const ts = new Date().toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  });
  return '<div style="margin-top:48px;padding-top:16px;border-top:1px solid #e2e8f0;'
    + 'color:#94a3b8;font-size:10px;font-family:Arial,sans-serif;line-height:1.5;display:flex;'
    + 'justify-content:space-between;flex-wrap:wrap;gap:8px;">'
    + '<span><strong style="color:#475569;">CLI | Connective Leadership Institute</strong> · The Future</span>'
    + `<span>Generated <strong style="color:#475569;">${esc(ts)}</strong></span>`
    + `<span>For <strong style="color:#475569;">${esc(email || 'unknown')}</strong> · Tenant: ${esc(tenantName || 'CLI Demo')}</span>`
    + '</div>';
}

// preset: { label, framing, levers }; values: { [leverId]: number };
// projections: [{ lever, delta, dollarDelta }]
export function buildScenarioReportHtml({ preset, values, projections, totalDollar, tenantName, email }) {
  let html = `<!DOCTYPE html><html><head><title>CLI Scenario Report — ${esc(preset.label)}</title>`;
  html += `<style>${STYLES}</style></head><body>`;
  html += '<div class="header"><span class="brand">The Future</span><div class="subtitle">CLI · Connective Leadership Institute · Behavioral Intelligence Platform</div></div>';
  html += `<h1>Scenario Report — ${esc(preset.label)}</h1>`;
  html += `<div style="color:#666;font-size:12px">${esc(tenantName || 'CLI Demo')} · generated for ${esc(email || 'unknown')}</div>`;
  html += `<div class="framing"><strong>Scenario:</strong> ${esc(preset.framing)}</div>`;

  html += '<h2>Inputs you tested</h2>';
  html += '<table><tr><th>Lever</th><th>Baseline</th><th>Tested value</th><th>Change</th></tr>';
  preset.levers.forEach((l) => {
    const v = values[l.id];
    const delta = v - l.current;
    const sign = delta >= 0 ? '+' : '';
    const cls = delta >= 0 ? 'pos' : 'neg';
    html += `<tr><td>${esc(l.label)}</td><td class="num">${l.current}${esc(l.unit)}</td>`
      + `<td class="num"><strong>${v}${esc(l.unit)}</strong></td>`
      + `<td class="num ${cls}">${sign}${delta.toFixed(2)}${esc(l.unit)}</td></tr>`;
  });
  html += '</table>';

  html += '<h2>Projected outcomes vs baseline</h2>';
  html += '<table><tr><th>Outcome</th><th>Driver lever</th><th>Projected impact ($M/yr)</th></tr>';
  projections.forEach((p) => {
    const cls = p.dollarDelta >= 0 ? 'pos' : 'neg';
    const sign = p.dollarDelta >= 0 ? '+' : '';
    html += `<tr><td>${esc(p.lever.outcomeLabel)}</td><td>${esc(p.lever.label)}</td>`
      + `<td class="num ${cls}">${sign}$${p.dollarDelta.toFixed(1)}M</td></tr>`;
  });
  html += '</table>';

  const totalCls = totalDollar >= 0 ? 'pos' : 'neg';
  const totalSign = totalDollar >= 0 ? '+' : '';
  html += `<div class="total"><div class="total-label">Total projected impact ($M/yr)</div>`
    + `<div class="total-value ${totalCls}">${totalSign}$${totalDollar.toFixed(1)}M</div></div>`;
  html += '<div class="caveat"><strong>Caveats:</strong> Projections use linear elasticity coefficients calibrated from the CLI cross-client panel. '
    + 'The Scenario Tester is a directional planning tool, not a guaranteed forecast. Behavioral effects often saturate at extremes — '
    + 'going from a 5 to a 6 typically produces a larger marginal effect than going from 9 to 10. '
    + "For board-grade conviction, the confidence-weighted projections in the Behavioral-Outcome dashboard's What-if Simulator are the more defensible numbers.</div>";
  html += reportFooter({ email, tenantName });
  html += '</body></html>';
  return html;
}

// Opens the report in a new tab (user can then print to PDF).
export function openHtmlReport(html) {
  try {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (err) {
    console.error('[scenarioReport] failed to open report window:', err);
  }
}
