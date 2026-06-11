// Two-page CLI Advisory Report generator (v1.24L App.jsx 1143–1418).
// All financial figures come from the optional `data` argument (the
// spgi-data.json object); when absent the report degrades to the same
// SPGI-flavored fallback figures the legacy spec used.
import { COMPETITOR_BENCHMARKS, ADVISORY_PLAYBOOKS, DEFAULT_PLAYBOOK } from '../data/datasets/report-advisory-copy.js';
import { STYLE_LENSES, DEFAULT_STYLE_LENS } from '../data/datasets/report-style-lenses.js';
import { getReportQuestions } from './questions.js';
import { cliReportFooter, downloadHtmlReport, esc, REPORT_VERSION } from './shared.js';

const ADVISORY_CSS =
  'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#fff;color:#1e293b;margin:0;padding:0;font-size:13px;}' +
  '.page{max-width:800px;margin:0 auto;padding:48px 56px;min-height:1020px;box-sizing:border-box;position:relative;}' +
  '.page-break{page-break-before:always;border-top:2px solid #e2e8f0;margin-top:0;padding-top:0;}' +
  '.header{display:flex;justify-content:space-between;align-items:flex-end;padding-bottom:16px;border-bottom:3px solid #C41E3A;margin-bottom:28px;}' +
  '.logo-cli{font-size:18px;font-weight:800;color:#C41E3A;letter-spacing:-0.5px;line-height:1;}' +
  '.logo-sub{font-size:10px;color:#64748b;margin-top:3px;letter-spacing:0.5px;text-transform:uppercase;}' +
  '.doc-meta{text-align:right;font-size:10px;color:#64748b;line-height:1.7;}' +
  'h1{font-size:22px;font-weight:800;color:#0f172a;margin:0 0 6px;}' +
  'h2{font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1.2px;margin:22px 0 8px;padding-bottom:5px;border-bottom:1px solid #f1f5f9;}' +
  'h3{font-size:13px;font-weight:700;color:#0f172a;margin:14px 0 5px;}' +
  '.subtitle{font-size:13px;color:#64748b;margin-bottom:24px;}' +
  'p{font-size:13px;line-height:1.75;color:#334155;margin:0 0 10px;}' +
  '.evidence-item{display:flex;gap:10px;padding:6px 12px;margin-bottom:4px;background:#f8fafc;border-left:3px solid #C41E3A;border-radius:0 4px 4px 0;font-size:12px;color:#334155;}' +
  '.answer-block{background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;padding:8px 14px;margin-bottom:5px;display:flex;gap:12px;align-items:baseline;}' +
  '.answer-q{font-size:11px;color:#0369a1;font-weight:600;min-width:180px;flex-shrink:0;}' +
  '.answer-a{font-size:13px;color:#1e293b;font-weight:600;}' +
  '.fin-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px 16px;margin-bottom:10px;}' +
  '.fin-box p{color:#475569;margin:0;font-size:13px;line-height:1.7;}' +
  '.cli-box{background:#fef9ec;border:1px solid #DAA520;border-radius:6px;padding:14px 18px;margin-bottom:10px;}' +
  '.cli-box-label{font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;}' +
  '.cli-box p{color:#78350f;margin:0 0 8px;font-size:13px;}' +
  '.problem-box{background:#fdf4ff;border:1px solid #d946ef;border-radius:6px;padding:12px 16px;margin-bottom:10px;}' +
  '.problem-label{font-size:10px;font-weight:700;color:#86198f;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;}' +
  '.problem-box p{color:#4a044e;margin:0;font-size:13px;}' +
  'table{width:100%;border-collapse:collapse;margin-top:8px;font-size:12px;}' +
  'th{background:#1e293b;color:#f8fafc;padding:8px 12px;text-align:left;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;}' +
  'td{padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#334155;vertical-align:top;}' +
  'tr:nth-child(even) td{background:#f8fafc;}' +
  '.hi{color:#dc2626;font-weight:700;} .me{color:#d97706;font-weight:700;} .lo{color:#2563eb;font-weight:700;}' +
  '.footer{position:absolute;bottom:28px;left:56px;right:56px;display:flex;justify-content:space-between;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:8px;}' +
  '@media print{.page{padding:32px 40px;}.page-break{page-break-before:always;}}';

// First playbook/lens whose keywords hit the lowercased tactic key wins.
const matchByKeywords = (entries, key, fallback) =>
  entries.find((e) => e.keywords.some((k) => key.includes(k))) || fallback;

// Legacy fuzzy match: answers contain apostrophes, benchmark keys do not.
function resolveCompetitor(answer) {
  const compKey = (answer || '').replace(/'/g, '');
  for (const ck of Object.keys(COMPETITOR_BENCHMARKS)) {
    if (answer.indexOf(ck.replace(/'/g, '')) !== -1 || ck.indexOf(compKey) !== -1) {
      return COMPETITOR_BENCHMARKS[ck];
    }
  }
  return null;
}

function buildFinancialContext(key, fin, ctx) {
  const { compData, compLabel, compMargin } = ctx;
  const marginGap = Math.abs(fin.opMargin - compMargin).toFixed(1);
  const marginStatus = fin.opMargin > compMargin ? 'above' : 'below';

  if (key.includes('cost') || key.includes('reduction') || key.includes('spend')) {
    let out = 'Current operating margin is ' + fin.opMargin + '% (adjusted: ' + fin.adjMargin + '%), compared to approximately ' + compMargin + '% for ' + compLabel + '. That is a ' + marginGap + ' percentage point gap -- meaning the organization is operating ' + marginStatus + ' competitors on margin efficiency. ';
    out += fin.opMargin > compMargin
      ? 'This is a position of strength. Cost reduction targets should be calibrated carefully to avoid eroding the operating advantages that produced this premium. Cuts that damage product quality, customer experience, or key talent will show up in revenue 12-18 months later.'
      : 'There is genuine room to close the gap -- but first determine whether it is structural (cost base too high) or operational (costs are appropriate but revenue is underperforming). The interventions are completely different.';
    return out;
  }
  let out = 'Current financials: Revenue $' + fin.revenue + 'B (+' + fin.revenueGrowth + '% YoY, down from +' + fin.prevRevenueGrowth + '% the prior year), operating margin ' + fin.opMargin + '% (adjusted ' + fin.adjMargin + '%), net margin ' + fin.netMargin + '%. ';
  if (compData) {
    out += 'Against ' + compLabel + ' (est. ' + compData.opMargin + '% operating margin, ' + compData.revenueGrowth + '% revenue growth): the organization holds a ' + (fin.opMargin > compData.opMargin ? marginGap + ' pp margin premium' : marginGap + ' pp margin deficit') + '. ';
  }
  out += 'Revenue growth deceleration from ' + fin.prevRevenueGrowth + '% to ' + fin.revenueGrowth + '% will put pressure on any initiative requiring new investment. Resourcing decisions in this environment need a clear ROI story.';
  return out;
}

export function generateReport(tactic, panelTitle, evidence, strategy, answers = [], specificProblem = '', data = null) {
  const deliverable = tactic.deliverable || tactic.title;
  const questions = getReportQuestions(tactic.title, tactic.deliverable);
  const fileName = deliverable.replace(/[^a-zA-Z0-9]/g, '_') + '_CLI_Report.html';
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const year = new Date().getFullYear();
  const key = (tactic.title + ' ' + deliverable).toLowerCase();
  const [a0 = '', a1 = '', a2 = ''] = answers;

  // Financial context from the dataset, with SPGI fallbacks when not loaded.
  const finYr = data?.financials?.['2025'] || {};
  const fin24 = data?.financials?.['2024'] || {};
  const fin = {
    opMargin: finYr.operatingMargin ?? 32.1,
    adjMargin: finYr.adjustedOperatingMargin ?? 38.5,
    revenue: finYr.revenue ?? 15.9,
    revenueGrowth: finYr.revenueGrowth ?? 7.4,
    netMargin: finYr.netMargin ?? 21.3,
    prevRevenueGrowth: fin24.revenueGrowth ?? 9.1,
  };

  const compData = resolveCompetitor(a2);
  const compLabel = compData ? compData.label : 'industry peers';
  const compMargin = compData ? compData.opMargin : 36;

  const lensEntry = matchByKeywords(STYLE_LENSES, key, DEFAULT_STYLE_LENS);
  const playbook = matchByKeywords(ADVISORY_PLAYBOOKS, key, DEFAULT_PLAYBOOK);
  const playbookCtx = { a0, a1, a2, strategy, compLabel, compMargin, revenueGrowth: fin.revenueGrowth, prevRevenueGrowth: fin.prevRevenueGrowth };

  const financialContext = buildFinancialContext(key, fin, { compData, compLabel, compMargin });
  const situationAnalysis = playbook.situation(playbookCtx);
  const implementationOptions = playbook.options(playbookCtx);

  let html = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>';
  html += '<title>' + esc(deliverable) + ' | CLI Advisory Report</title>';
  html += '<style>' + ADVISORY_CSS + '</style></head><body>';

  // PAGE 1
  html += '<div class="page">';
  html += '<div class="header"><div><div class="logo-cli">Connective Leadership Institute</div><div class="logo-sub">CLI Advisory Report</div></div>';
  html += '<div class="doc-meta">Prepared: ' + now + '<br/>' + esc(deliverable) + '<br/>Confidential</div></div>';
  html += '<h1>' + esc(deliverable) + '</h1>';
  html += '<div class="subtitle">Advisory panel: ' + esc(panelTitle) + '</div>';

  html += '<h2>Your Inputs</h2>';
  questions.forEach((q, qi) => {
    if (answers[qi]) {
      html += '<div class="answer-block"><span class="answer-q">' + q.question + '</span><span class="answer-a">' + esc(answers[qi]) + '</span></div>';
    }
  });
  if (specificProblem && specificProblem.trim()) {
    html += '<div class="problem-box"><div class="problem-label">Specific problem you raised</div><p>' + esc(specificProblem) + '</p></div>';
  }

  html += '<h2>Key Evidence</h2>';
  for (const item of evidence) {
    html += '<div class="evidence-item"><span style="color:#C41E3A;flex-shrink:0;">*</span><span>' + esc(item) + '</span></div>';
  }

  html += '<h2>Financial Context</h2>';
  html += '<div class="fin-box"><p>' + financialContext + '</p></div>';

  html += '<h2>What Is Actually Going On</h2>';
  html += '<p>' + situationAnalysis + '</p>';

  html += '<h2>A Connective Leadership Perspective</h2>';
  html += '<p style="background:#fef9ec;border-left:3px solid #DAA520;padding:10px 14px;border-radius:0 6px 6px 0;color:#78350f;font-size:13px;line-height:1.7;">' + lensEntry.sidebar + '</p>';

  html += '<div class="footer"><span>&copy; ' + year + ' Connective Leadership Institute -- ' + REPORT_VERSION + '</span><span>Page 1 of 2</span></div>';
  html += '</div>';

  // PAGE 2
  html += '<div class="page page-break">';
  html += '<div class="header"><div><div class="logo-cli">Connective Leadership Institute</div><div class="logo-sub">CLI Advisory Report -- continued</div></div>';
  html += '<div class="doc-meta">' + esc(deliverable) + '<br/>' + now + '</div></div>';

  html += '<h2>Recommended Strategy</h2>';
  html += '<p>' + esc(strategy) + '</p>';

  html += '<h2>How to Implement -- Three Options</h2>';
  html += implementationOptions;

  if (specificProblem && specificProblem.trim()) {
    html += '<h2>Your Specific Problem -- Addressed</h2>';
    html += '<p>You raised: <strong>' + esc(specificProblem) + '</strong></p>';
    html += '<p>The framing of the problem almost always determines the quality of the solution. If it is framed as a people problem, solutions will all be HR interventions. If framed as a system problem, solutions will be process and structure. In most cases both are partially right. Start with data -- what does the evidence actually show, separate from what people believe? Build solutions on evidence, not narrative.</p>';
  }

  html += '<h2>Leadership Lens -- CLI Achieving Styles</h2>';
  html += '<div class="cli-box"><div class="cli-box-label">Relevant style cluster: ' + lensEntry.lens + '</div>';
  html += '<p>' + lensEntry.note + '</p>';
  html += '<p style="font-style:italic;">' + lensEntry.action + '</p></div>';

  html += '<h2>Priority Actions</h2>';
  html += '<table><thead><tr><th>Priority</th><th>Action</th><th>Owner</th><th>When</th></tr></thead><tbody>';
  html += '<tr><td class="hi">HIGH</td><td>Confirm root cause with data before committing to a solution path</td><td>Exec sponsor</td><td>Week 1</td></tr>';
  html += '<tr><td class="hi">HIGH</td><td>Select one implementation option and assign a single owner</td><td>Decision-maker</td><td>Week 1</td></tr>';
  html += '<tr><td class="me">MED</td><td>Brief the 2-3 key stakeholders -- align before any public announcement</td><td>Initiative lead</td><td>Week 2</td></tr>';
  html += '<tr><td class="me">MED</td><td>Define the success metric and baseline it now</td><td>Analytics / Finance</td><td>Week 2</td></tr>';
  html += '<tr><td class="lo">LOW</td><td>Schedule 30-day and 60-day progress reviews</td><td>Initiative lead</td><td>Week 3</td></tr>';
  html += '</tbody></table>';

  html += '<p style="font-size:11px;color:#94a3b8;margin-top:18px;">This report was generated by ' + REPORT_VERSION + ". Financial comparisons use publicly available data and are approximate. The Connective Leadership Institute's Achieving Styles model is a proprietary framework. For a full Achieving Styles assessment of your leadership team -- individual or group -- contact the Connective Leadership Institute at connectiveleadership.com.</p>";

  html += '<div class="footer"><span>&copy; ' + year + ' Connective Leadership Institute -- ' + REPORT_VERSION + '</span><span>Page 2 of 2</span></div>';
  html += cliReportFooter(data);
  html += '</div></body></html>';

  downloadHtmlReport(html, fileName);
}
