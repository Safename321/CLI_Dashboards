// "Understanding the OASI" framework reference report (v1.24L App.jsx 1016–1140).
// Opens in a new tab as a standalone HTML document (print to PDF in browser).
// `data` is the optional tenant dataset, used only for footer provenance.
import {
  OASI_STYLE_SETS,
  OASI_MEASUREMENT_LEVELS,
  OASI_SCORE_RANGES,
  OASI_FRAMEWORK_COMPARISON,
  OASI_PMI_APPLICATIONS,
} from '../data/datasets/oasi-framework.js';
import { cliReportFooter, openHtmlReport, REPORT_VERSION } from './shared.js';

const EXPLAINER_CSS =
  'body{font-family:Arial,sans-serif;padding:40px;max-width:940px;margin:0 auto;color:#1e293b}' +
  '.header{text-align:center;border-bottom:3px solid #1a365d;padding-bottom:20px;margin-bottom:30px}' +
  'h1{color:#1a365d;font-size:26px;margin-bottom:4px}' +
  'h2{color:#2E5090;border-bottom:2px solid #2E5090;padding-bottom:8px;margin-top:36px;font-size:18px}' +
  'h3{color:#334155;font-size:15px;margin-top:20px;margin-bottom:6px}' +
  'p{line-height:1.7;margin:8px 0;font-size:14px}' +
  'table{width:100%;border-collapse:collapse;margin:16px 0;font-size:13px}' +
  'th,td{padding:10px 12px;text-align:left;border-bottom:1px solid #e2e8f0}' +
  'th{background:#1a365d;color:#fff;font-weight:600}' +
  'tr:nth-child(even){background:#f8fafc}' +
  '.set-block{border-left:4px solid;padding:12px 16px;margin:12px 0;border-radius:0 6px 6px 0}' +
  // OASI cluster colors: direct=yellow, instrumental=red, relational=blue
  '.direct{border-color:#eab308;background:#fefce8}' +
  '.instrumental{border-color:#ef4444;background:#fef2f2}' +
  '.relational{border-color:#3b82f6;background:#eff6ff}' +
  '.callout{background:#f1f5f9;border-left:4px solid #2E5090;padding:12px 16px;border-radius:0 6px 6px 0;margin:14px 0;font-size:13px}' +
  '.footer{text-align:center;color:#94a3b8;font-size:10px;margin-top:48px;padding-top:16px;border-top:1px solid #e2e8f0}' +
  '.diff-badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;margin-left:6px}' +
  '.unique{background:#dcfce7;color:#15803d}';

export function generateOASIExplainerReport(data) {
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  let html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Understanding the OASI — CLI</title>';
  html += '<style>' + EXPLAINER_CSS + '</style></head><body>';

  // Header
  html += '<div class="header">';
  html += '<div style="font-size:20px;font-weight:bold;color:#1a365d">CLI | Connective Leadership Institute</div>';
  html += '<h1>Understanding the OASI</h1>';
  html += '<div style="color:#64748b;font-size:14px">Organizational Achieving Styles Inventory — Framework Reference</div>';
  html += '<div style="color:#94a3b8;font-size:12px;margin-top:4px">Generated ' + now + ' · ' + REPORT_VERSION + '</div>';
  html += '</div>';

  // What is the OASI
  html += '<h2>What Is the OASI?</h2>';
  html += '<p>The <strong>Organizational Achieving Styles Inventory (OASI)</strong> is one of seven CLI behavioral measurement instruments. It measures how an <em>organization as a whole</em> achieves its goals — not individual personality, but the collective behavioral patterns that define how the organization gets things done.</p>';
  html += '<p>Developed by Jean Lipman-Blumen at the Drucker School of Management, the OASI extends the foundational <strong>Achieving Styles</strong> framework from individuals to organizational systems. It captures both the <strong>Aspirational</strong> level (how the organization wants to achieve) and the <strong>Situational</strong> level (how it actually achieves under real conditions).</p>';
  html += '<div class="callout"><strong>Key CLI Differentiator:</strong> CLI is the only leadership framework that measures achievement behavior — HOW you achieve — not personality or fixed traits. Achieving Styles are observable, context-sensitive behaviors that can be developed and changed. This makes OASI uniquely actionable for organizational development.</div>';

  // The 9 Achieving Styles
  html += '<h2>The Nine Achieving Styles</h2>';
  html += '<p>All nine styles are grouped into three sets, each representing a fundamentally different orientation toward achievement. No style is inherently superior — effectiveness depends on context, challenge type, and team composition.</p>';
  for (const set of OASI_STYLE_SETS) {
    html += '<div class="set-block ' + set.id + '">';
    html += '<h3 style="color:' + set.headingColor + ';margin-top:0">' + set.heading + '</h3>';
    html += '<p>' + set.blurb + '</p>';
    html += '<table><tr><th>Style</th><th>Core Behavior</th><th>Organizational Signal</th></tr>';
    for (const s of set.styles) {
      html += '<tr><td><strong>' + s.name + '</strong></td><td>' + s.behavior + '</td><td>' + s.signal + '</td></tr>';
    }
    html += '</table></div>';
  }

  // The Four Measurement Levels
  html += '<h2>The Four Levels of CLI Measurement</h2>';
  html += '<p>CLI is the only framework that measures achieving behavior across four distinct levels, enabling a comprehensive view of alignment and gap between aspiration and reality.</p>';
  html += '<table><tr><th>Level</th><th>Instrument</th><th>What It Measures</th><th>Key Use</th></tr>';
  for (const l of OASI_MEASUREMENT_LEVELS) {
    html += '<tr><td><strong>' + l.level + '</strong></td><td>' + l.instrument + '</td><td>' + l.measures + '</td><td>' + l.use + '</td></tr>';
  }
  html += '</table>';
  html += '<div class="callout"><strong>This Dashboard Uses OASI:</strong> The scores displayed reflect how the organization achieves — both the current state and the target culture. The gap between Current and Target drives the integration strategy and the recommended leadership moves shown throughout the CLI Dashboards suite.</div>';

  // How to Read Scores
  html += '<h2>How to Read OASI Scores</h2>';
  html += '<p>OASI scores are derived from a validated survey instrument. Each style is scored on a <strong>1–7 scale</strong> (average of 5 questions per style). Higher scores indicate greater use of that style; lower scores indicate less reliance on it. Balance across styles is often as important as any individual score.</p>';
  html += '<table><tr><th>Score Range</th><th>Interpretation</th><th>Implication</th></tr>';
  for (const r of OASI_SCORE_RANGES) {
    html += '<tr><td>' + r.range + '</td><td>' + r.interpretation + '</td><td>' + r.implication + '</td></tr>';
  }
  html += '</table>';
  html += '<p>Valid OASI scores use only <strong>.0, .2, .4, .6, .8</strong> decimal increments (because each style averages 5 questions scored 1–7). No score can exceed 7.0.</p>';

  // CLI vs competitors
  html += '<h2>Why OASI — Not DiSC, MBTI, or StrengthsFinder?</h2>';
  html += '<table><tr><th>Framework</th><th>Measures</th><th>Levels</th><th>Changeable?</th><th>Org-Level?</th></tr>';
  for (const f of OASI_FRAMEWORK_COMPARISON) {
    const cell = (v) => (f.unique ? '<span class="diff-badge unique">' + v + '</span>' : v);
    const name = f.unique ? '<strong>' + f.framework + '</strong>' : f.framework;
    html += '<tr><td>' + name + '</td><td>' + f.measures + '</td><td>' + f.levels + '</td><td>' + cell(f.changeable) + '</td><td>' + cell(f.orgLevel) + '</td></tr>';
  }
  html += '</table>';
  html += '<p>The OASI is uniquely positioned for organizational integration work because it measures behavioral patterns — not fixed personality. Organizations can shift their achieving style profile through deliberate leadership development, structural changes, and targeted hiring.</p>';

  // Application to post-merger integration
  html += '<h2>Application: OASI in Post-Merger Integration</h2>';
  html += '<p>In the S&amp;P Global / IHS Markit integration context, the OASI serves three critical functions:</p>';
  for (const p of OASI_PMI_APPLICATIONS) html += '<p>' + p + '</p>';
  html += '<div class="callout"><em>"The Connective Leadership model holds that in an era of increasing interdependence, leaders must draw on all nine Achieving Styles — not just their preferred few — to mobilize diverse stakeholders toward shared goals."</em><br><br>— Jill Robinson, <em>Leadership Development: Beginning the Journey</em> (2025); drawing on Lipman-Blumen, <em>The Connective Edge</em> (1996)</div>';

  // Footer
  html += '<div class="footer">';
  html += '<p>This report was generated by ' + REPORT_VERSION + ". The Connective Leadership Institute's Achieving Styles framework is a proprietary methodology developed by Jean Lipman-Blumen.</p>";
  html += '<p>For OASI administration, benchmarking, or organizational assessments, contact CLI at <strong>connectiveleadership.com</strong></p>';
  html += '</div>';
  html += cliReportFooter(data);
  html += '</body></html>';

  openHtmlReport(html);
}
