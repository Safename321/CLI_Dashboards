// Pre-generated executive packets (v1.24L App.jsx 658–801).
// NOTE: as in the legacy spec, the packet bodies are illustrative demo figures
// (KPI triggers, segment tables, outlook) hard-coded in the document — they do
// not come from the tenant dataset. The optional `data` argument (spgi-data.json
// shape) supplies only the company identity for headers/titles; without data
// the packets degrade to a generic company label.
import { cliReportFooter, companyLabel, downloadHtmlReport, REPORT_VERSION } from './shared.js';

const PACKET_CSS_BASE =
  'body{font-family:Arial,sans-serif;padding:40px;max-width:900px;margin:0 auto}' +
  '.header{text-align:center;border-bottom:3px solid #1a365d;padding-bottom:20px;margin-bottom:30px}' +
  'h1{color:#1a365d;font-size:28px}h2{color:#2E5090;border-bottom:2px solid #2E5090;padding-bottom:10px;margin-top:40px}' +
  'table{width:100%;border-collapse:collapse;margin:20px 0}th,td{padding:12px;text-align:left;border-bottom:1px solid #e2e8f0}' +
  'th{background:#f1f5f9}' +
  '.footer{text-align:center;color:#999;font-size:10px;margin-top:40px;padding-top:20px;border-top:1px solid #e2e8f0}';

export function generateBoardPacketPDF(data) {
  const company = companyLabel(data);
  let html = '<!DOCTYPE html><html><head><title>' + company + ' - Q4 2025 Board Packet</title>';
  html += '<style>' + PACKET_CSS_BASE;
  html += '.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin:20px 0}';
  html += '.grid5{display:grid;grid-template-columns:repeat(5,1fr);gap:15px;margin:20px 0}';
  html += '.item{text-align:center;padding:20px;background:#f8fafc;border-radius:8px}';
  html += '.kpi{text-align:center;padding:15px;border-radius:8px;border:2px solid}';
  html += '.kpi-danger{background:#fef2f2;border-color:#dc2626}.kpi-warning{background:#fffbeb;border-color:#d97706}.kpi-good{background:#f0fdf4;border-color:#16a34a}';
  html += '.big{font-size:36px;font-weight:bold}.med{font-size:24px;font-weight:bold}';
  html += '.amber{color:#d97706}.red{color:#dc2626}.green{color:#16a34a}.cyan{color:#0891b2}';
  html += '</style></head><body>';
  html += '<div class="header"><div style="font-size:24px;font-weight:bold;color:#1a365d">CLI | Connective Leadership Institute</div>';
  html += '<h1>' + company + ' - Q4 2025 Board Packet</h1>';
  html += '<div style="color:#666">Board Meeting: May 22, 2026</div></div>';
  html += '<h2>Executive Summary</h2>';
  html += '<div class="grid">';
  html += '<div class="item"><div class="big amber">C+</div><div>Overall Health</div></div>';
  html += '<div class="item"><div class="big red">3</div><div>Critical Issues</div></div>';
  html += '<div class="item"><div class="big green">2</div><div>Strategic Wins</div></div>';
  html += '<div class="item"><div class="big cyan">78%</div><div>Strategy Execution</div></div>';
  html += '</div>';
  html += '<h2>Financial Efficiency KPIs (Strategy Triggers)</h2>';
  html += '<p style="color:#dc2626;font-weight:bold">⚠️ 4 of 5 KPIs are triggering strategic action</p>';
  html += '<div class="grid5">';
  html += '<div class="kpi kpi-danger"><div class="med red">0.8x</div><div>Cash Multiple</div><div style="color:#dc2626;font-size:11px">→ Cut Costs</div></div>';
  html += '<div class="kpi kpi-warning"><div class="med amber">14 mo</div><div>CAC Payback</div><div style="color:#d97706;font-size:11px">→ Pause Hiring</div></div>';
  html += '<div class="kpi kpi-danger"><div class="med red">4.2%</div><div>Churn Rate</div><div style="color:#dc2626;font-size:11px">→ Annual Billing</div></div>';
  html += '<div class="kpi kpi-good"><div class="med green">78 days</div><div>Sales Cycle</div><div style="color:#16a34a;font-size:11px">✓ On Track</div></div>';
  html += '<div class="kpi kpi-danger"><div class="med red">3.8%</div><div>Lead Conversion</div><div style="color:#dc2626;font-size:11px">→ Cut Channels</div></div>';
  html += '</div>';
  html += '<h2>Strategic Initiatives Status</h2>';
  html += '<table><tr><th>Initiative</th><th>Owner</th><th>Status</th><th>Progress</th><th>Risk</th></tr>';
  html += '<tr><td>Digital Transformation</td><td>CTO</td><td style="color:#16a34a">on-track</td><td>72%</td><td style="color:#16a34a">Low</td></tr>';
  html += '<tr><td>Market Expansion (APAC)</td><td>CRO</td><td style="color:#d97706">at-risk</td><td>45%</td><td style="color:#dc2626">High</td></tr>';
  html += '<tr><td>Talent Development</td><td>CHRO</td><td style="color:#dc2626">delayed</td><td>38%</td><td style="color:#d97706">Medium</td></tr>';
  html += '<tr><td>Customer Experience 2.0</td><td>CCO</td><td style="color:#16a34a">on-track</td><td>85%</td><td style="color:#16a34a">Low</td></tr>';
  html += '</table>';
  html += '<h2>Risk Heat Map</h2>';
  html += '<table><tr><th></th><th>Low</th><th>Medium</th><th>High</th><th>Critical</th></tr>';
  html += '<tr><td><b>Strategic</b></td><td style="background:#dcfce7">1</td><td style="background:#fef3c7">2</td><td style="background:#fee2e2;color:#dc2626;font-weight:bold">PR</td><td style="background:#f1f5f9">0</td></tr>';
  html += '<tr><td><b>Operational</b></td><td style="background:#dcfce7">3</td><td style="background:#fef3c7;color:#d97706;font-weight:bold">Engage</td><td style="background:#f1f5f9">1</td><td style="background:#f1f5f9">0</td></tr>';
  html += '<tr><td><b>Financial</b></td><td style="background:#dcfce7">4</td><td style="background:#fef3c7;color:#d97706;font-weight:bold">CAC</td><td style="background:#fee2e2;color:#dc2626;font-weight:bold">Cash</td><td style="background:#f1f5f9">0</td></tr>';
  html += '<tr><td><b>Compliance</b></td><td style="background:#dcfce7">5</td><td style="background:#dcfce7">1</td><td style="background:#f1f5f9">0</td><td style="background:#f1f5f9">0</td></tr>';
  html += '</table>';
  html += '<h2>Recommended Actions</h2>';
  html += '<table><tr><th>Priority</th><th>Action</th><th>Impact</th><th>Timeline</th></tr>';
  html += '<tr><td style="color:#dc2626;font-weight:bold">CRITICAL</td><td>Cut Costs - Reduce non-essential marketing/sales spend</td><td>Improve Cash Multiple</td><td>Immediate</td></tr>';
  html += '<tr><td style="color:#dc2626;font-weight:bold">CRITICAL</td><td>Shift to Annual Billing - Reduce churn, improve CAC recovery</td><td>+$2.1M cash flow</td><td>Q1 2021</td></tr>';
  html += '<tr><td style="color:#d97706;font-weight:bold">HIGH</td><td>Pause Sales Hiring - Until lead conversion improves</td><td>Reduce burn rate</td><td>Immediate</td></tr>';
  html += '<tr><td style="color:#d97706;font-weight:bold">HIGH</td><td>Address Operations Engagement Crisis</td><td>$2.1M ARR at risk</td><td>4-6 weeks</td></tr>';
  html += '</table>';
  html += '<h2>Board Actions Requested</h2>';
  html += '<ol><li>Approve cost reduction plan targeting $1.2M savings</li>';
  html += '<li>Approve annual billing incentive program (15% discount for annual commitment)</li>';
  html += '<li>Approve selective hiring freeze for sales roles</li>';
  html += '<li>Review and approve PR response strategy</li>';
  html += '<li>Approve Operations intervention budget ($450K)</li></ol>';
  html += '<div class="footer">Confidential - Prepared by Connective Leadership Institute | ' + REPORT_VERSION + '</div>';
  html += cliReportFooter(data);
  html += '</body></html>';

  downloadHtmlReport(html, 'SP_Inc_Q2_2026_Board_Packet.html');
}

export function generateInvestorPDF(data) {
  const c = data?.company;
  const company = c?.name ? c.name + (c.ticker ? ' (' + (c.exchange ? c.exchange + ': ' : '') + c.ticker + ')' : '') : 'CLI Demo Company';
  let html = '<!DOCTYPE html><html><head><title>' + companyLabel(data) + ' - Q4 2025 Investor Update</title>';
  html += '<style>' + PACKET_CSS_BASE;
  html += '.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin:20px 0}';
  html += '.metric{padding:20px;border-radius:8px;text-align:center}';
  html += '.beat{background:#dcfce7;border:1px solid #16a34a}.miss{background:#fee2e2;border:1px solid #dc2626}';
  html += '.big{font-size:24px;font-weight:bold}.green{color:#16a34a}.red{color:#dc2626}';
  html += '.highlight{background:#f0f9ff;border:1px solid #0891b2;border-radius:8px;padding:20px;margin:20px 0}';
  html += '</style></head><body>';
  html += '<div class="header"><div style="font-size:24px;font-weight:bold;color:#1a365d">' + company + '</div>';
  html += '<h1>Q1 2026 Investor Update</h1>';
  html += '<div style="color:#666">Fiscal Year 2025 Results and 2026 Outlook</div></div>';
  html += '<h2>Investment Highlights</h2>';
  html += '<ul><li><b>Revenue beat guidance by 3.6%</b> - Strong market demand</li>';
  html += '<li><b>Cloud revenue grew 42% YoY</b> - Now 24% of total revenue</li>';
  html += '<li><b>8th consecutive dividend increase</b> - Commitment to returns</li>';
  html += '<li><b>$480M returned to shareholders</b> - Dividends and buybacks</li></ul>';
  html += '<h2>Financial Performance vs Guidance</h2>';
  html += '<div class="grid">';
  html += '<div class="metric beat"><div class="big">$17.4B</div><div>Revenue</div><div class="green">+3.6%</div></div>';
  html += '<div class="metric miss"><div class="big">$4.05</div><div>EPS</div><div class="red">-3.6%</div></div>';
  html += '<div class="metric miss"><div class="big">22.2%</div><div>Gross Margin</div><div class="red">-7.5%</div></div>';
  html += '<div class="metric beat"><div class="big">$1.95B</div><div>OpEx</div><div class="green">+7.1% efficiency</div></div>';
  html += '</div>';
  html += '<h2>Revenue by Segment</h2>';
  html += '<table><tr><th>Segment</th><th>FY2025</th><th>YoY Growth</th><th>% of Total</th></tr>';
  html += '<tr><td>Enterprise Platform</td><td>$7.8B</td><td>+5%</td><td>45%</td></tr>';
  html += '<tr><td>Cloud Services</td><td>$4.2B</td><td style="color:#16a34a;font-weight:bold">+42%</td><td>24%</td></tr>';
  html += '<tr><td>Professional Services</td><td>$3.5B</td><td>+8%</td><td>20%</td></tr>';
  html += '<tr><td>Legacy Products</td><td>$1.9B</td><td style="color:#dc2626">-12%</td><td>11%</td></tr>';
  html += '</table>';
  html += '<h2>2021 Outlook</h2>';
  html += '<div class="highlight"><table>';
  html += '<tr><th>Metric</th><th>FY2021 Guidance</th><th>Growth</th></tr>';
  html += '<tr><td>Revenue</td><td>$18.5B - $19.0B</td><td>+6% to +9%</td></tr>';
  html += '<tr><td>EPS</td><td>$4.40 - $4.60</td><td>+9% to +14%</td></tr>';
  html += '<tr><td>Cloud Revenue</td><td>$5.5B - $6.0B</td><td>+31% to +43%</td></tr>';
  html += '</table></div>';
  html += '<h2>Investment Thesis</h2>';
  html += '<ol><li><b>Market Leader:</b> #1 in Enterprise Platform and Analytics</li>';
  html += '<li><b>Cloud Transformation:</b> 42% YoY growth</li>';
  html += '<li><b>Recurring Revenue:</b> 78% from subscriptions</li>';
  html += '<li><b>Strong Cash:</b> $2.1B operating cash flow</li>';
  html += '<li><b>Shareholder Returns:</b> Consistent dividend growth</li></ol>';
  html += '<div class="footer">Investor Relations: ir@sp-inc.com | NYSE: SP | ' + REPORT_VERSION + '</div>';
  html += cliReportFooter(data);
  html += '</body></html>';

  downloadHtmlReport(html, 'SP_Inc_Q1_2026_Investor_Update.html');
}
