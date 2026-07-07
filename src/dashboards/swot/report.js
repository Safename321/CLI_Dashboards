// SWOT full report — HTML, CLI-branded, printable to PDF (spec §8.1).
// Ported from v1.20/v1.22 generateSWOTFullReport (App.jsx:808) and
// parameterized: exec summary + rankings are generated from the factors
// instead of a hardcoded narrative. Opens in a new tab (print → save as PDF).
import { rankFactors, classifyEvidence, buildExecSummary, STANDING_CAVEAT } from './logic.js';
import { QUADRANT_META } from '../../data/datasets/swot.js';

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const QUAD_CLS = { strength: 's', weakness: 'w', opportunity: 'o', threat: 't' };

export function buildSwotReportHtml({ factors, title, subtitle, meta = {}, recommendations = [] }) {
  const ranked = rankFactors(factors);
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const year = new Date().getFullYear();

  let html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + esc(title) + ' · CLI</title>';
  html += '<style>';
  html += 'body{font-family:Arial,sans-serif;padding:40px;max-width:980px;margin:0 auto;color:#1e293b;line-height:1.55}';
  html += '.header{text-align:center;border-bottom:3px solid #1a365d;padding-bottom:20px;margin-bottom:24px}';
  html += 'h1{color:#1a365d;font-size:26px;margin:0 0 6px 0}';
  html += '.sub{color:#64748b;font-size:13px}';
  html += 'h2{color:#2E5090;border-bottom:2px solid #2E5090;padding-bottom:6px;margin-top:32px;font-size:18px}';
  html += '.meta{background:#f1f5f9;padding:12px 18px;border-radius:8px;display:flex;justify-content:space-between;font-size:12px;color:#475569;margin-bottom:18px}';
  html += 'table{width:100%;border-collapse:collapse;margin:12px 0;font-size:13px}';
  html += 'th{background:#1a365d;color:#fff;text-align:left;padding:8px 10px;font-weight:600}';
  html += 'td{padding:8px 10px;border-bottom:1px solid #e2e8f0;vertical-align:top}';
  html += '.swot{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:14px 0 22px}';
  html += '.quad{padding:14px 16px;border-radius:8px;border:1px solid;page-break-inside:avoid}';
  html += '.q-s{background:#ecfdf5;border-color:#0d9488}.q-w{background:#fef2f2;border-color:#ef4444}';
  html += '.q-o{background:#eff6ff;border-color:#4f46e5}.q-t{background:#fff1f2;border-color:#be123c}';
  html += '.qh{font-weight:700;font-size:14px;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px}';
  html += '.qh-s{color:#0d9488}.qh-w{color:#b91c1c}.qh-o{color:#4338ca}.qh-t{color:#be123c}';
  html += '.quad ul{margin:6px 0 0;padding-left:18px;font-size:12.5px}.quad li{margin-bottom:6px}';
  html += '.m{display:inline-block;background:#1a365d;color:#fff;border-radius:10px;padding:0 7px;font-size:10.5px;font-weight:700;margin-left:4px}';
  html += '.inf{color:#64748b;font-style:italic;font-size:11px}';
  html += '.red{color:#b91c1c;font-weight:600}.amber{color:#b45309;font-weight:600}.green{color:#047857;font-weight:600}';
  html += '.rec{background:#f8fafc;border-left:4px solid #1a365d;padding:12px 16px;border-radius:6px;margin:10px 0;page-break-inside:avoid}';
  html += '.rec h4{margin:0 0 6px 0;color:#1a365d;font-size:14px}.rec p{margin:3px 0;font-size:12.5px}';
  html += '.exec{background:#1a365d;color:#fff;padding:18px 22px;border-radius:8px;margin:18px 0;font-size:13px;line-height:1.6}';
  html += '.caveat{background:#fffbeb;border:1px solid #f59e0b;border-radius:8px;padding:12px 16px;font-size:12px;color:#78350f;margin:18px 0}';
  html += '.footer{margin-top:36px;padding-top:14px;border-top:1px solid #cbd5e1;font-size:11px;color:#64748b;display:flex;justify-content:space-between}';
  html += '@media print{.swot{break-inside:avoid}}';
  html += '</style></head><body>';

  html += '<div class="header"><h1>' + esc(title) + '</h1><div class="sub">' + esc(subtitle)
        + ' · Materiality-Bubble SWOT · CLI Connective Leadership Institute</div></div>';

  const metaBits = [
    meta.subject ? '<span><b>Subject:</b> ' + esc(meta.subject) + '</span>' : '',
    meta.respondents ? '<span><b>N:</b> ' + esc(meta.respondents) + '</span>' : '',
    '<span><b>Instrument:</b> ' + esc(meta.instrument ?? 'ASI') + '</span>',
    '<span><b>Generated:</b> ' + now + '</span>',
  ].filter(Boolean).join('');
  html += '<div class="meta">' + metaBits + '</div>';

  html += '<div class="exec"><b>Executive summary.</b> ' + esc(buildExecSummary(ranked)) + '</div>';

  // Score table — firm factors only (they carry real ASI scores).
  const firm = ranked.filter((f) => classifyEvidence(f) === 'firm' && f.asiScore != null);
  if (firm.length) {
    html += '<h2>Measured Scores</h2>';
    html += '<table><thead><tr><th>Set</th><th>Style</th><th>Score</th><th>Desired</th><th>Gap</th><th>Materiality</th></tr></thead><tbody>';
    firm.forEach((f) => {
      const [lo, hi] = f.asiDesiredRange ?? [null, null];
      const gap = lo == null ? 0 : (f.asiScore < lo ? f.asiScore - lo : f.asiScore > hi ? f.asiScore - hi : 0);
      const cls = Math.abs(gap) >= 1.5 ? 'red' : Math.abs(gap) >= 0.75 ? 'amber' : 'green';
      html += '<tr><td>' + esc(f.achievingStylesSet ?? '—') + '</td><td>' + esc(f.label) + '</td>'
            + '<td>' + f.asiScore.toFixed(2) + '</td>'
            + '<td>' + (lo != null ? lo + '–' + hi : '—') + '</td>'
            + '<td class="' + cls + '">' + (gap > 0 ? '+' : '') + gap.toFixed(2) + (f.overReliance ? ' (over-reliance)' : '') + '</td>'
            + '<td>' + f.materiality.toFixed(1) + '</td></tr>';
    });
    html += '</tbody></table>';
  }

  // 2×2 matrix — items ranked by materiality inside each quadrant.
  html += '<h2>SWOT Matrix <span style="font-size:12px;color:#64748b;font-weight:400">(ranked by materiality; ◫ = inferred reading)</span></h2>';
  html += '<div class="swot">';
  for (const q of ['strength', 'weakness', 'opportunity', 'threat']) {
    const cls = QUAD_CLS[q];
    html += '<div class="quad q-' + cls + '"><div class="qh qh-' + cls + '">' + esc(QUADRANT_META[q].title) + '</div><ul>';
    ranked.filter((f) => f.quadrant === q).forEach((f) => {
      const inferred = classifyEvidence(f) === 'inferred';
      html += '<li><b>' + esc(f.label) + '</b><span class="m">' + f.materiality.toFixed(1) + '</span>'
            + (inferred ? ' <span class="inf">◫ inferred</span>' : '')
            + (f.description ? '<br>' + esc(f.description) : '') + '</li>';
    });
    html += '</ul></div>';
  }
  html += '</div>';

  // Causal chain narrative — from the gates graph.
  const gated = ranked.filter((f) => f.gates?.length);
  if (gated.length) {
    const byId = Object.fromEntries(ranked.map((f) => [f.id, f]));
    html += '<h2>Causal Chain</h2><ul style="font-size:13px">';
    gated.forEach((f) => {
      f.gates.forEach((gid) => {
        const t = byId[gid];
        if (t) {
          html += '<li><b>' + esc(f.label) + '</b> gates <b>' + esc(t.label) + '</b>'
                + (t.quadrant === 'threat' ? ' — an inferred consequence that loses its fuel when the measured root is fixed' : '') + '</li>';
        }
      });
    });
    html += '</ul>';
  }

  // Recommendations ranked by the materiality they address.
  if (recommendations.length) {
    const byId = Object.fromEntries(ranked.map((f) => [f.id, f]));
    const scored = recommendations.map((r) => ({
      ...r,
      _m: (r.addresses ?? []).reduce((s, id) => s + (byId[id]?.materiality ?? 0), 0),
    })).sort((a, b) => b._m - a._m);
    html += '<h2>Strategic Recommendations</h2>';
    scored.forEach((r, i) => {
      html += '<div class="rec"><h4>' + (i + 1) + '. ' + esc(r.title) + '</h4><p>'
            + (r.owner ? '<b>Owner:</b> ' + esc(r.owner) + ' · ' : '')
            + (r.mechanism ? '<b>Mechanism:</b> ' + esc(r.mechanism) + ' · ' : '')
            + (r.measure ? '<b>Measure:</b> ' + esc(r.measure) + ' · ' : '')
            + (r.linkage ? '<b>Business linkage:</b> ' + esc(r.linkage) : '') + '</p></div>';
    });
  }

  // §10 standing caveat — ships with every output.
  html += '<div class="caveat"><b>Reading this analysis.</b> ' + esc(STANDING_CAVEAT) + '</div>';

  html += '<h2>Methodology</h2>';
  html += '<p style="font-size:12.5px;color:#475569">Each factor carries three independent channels: '
        + 'bubble area encodes strategic materiality (leverage ×0.45 + gap-from-desired ×0.35 + '
        + 'irreversibility ×0.20, each 0–10); color encodes the SWOT quadrant and achieving-styles set; '
        + 'fill encodes evidence (solid = a direct ASI score, striped = an inferred strategic reading). '
        + 'Desired ranges derive from CLI connective-leader profile analysis. Method per the CLI '
        + 'Materiality-Bubble SWOT specification (July 2026).</p>';

  html += '<div class="footer"><span>&copy; ' + year + ' Connective Leadership Institute — CLI Dashboards v2</span>'
        + '<span>Confidential · connectiveleadership.com</span></div>';
  html += '</body></html>';
  return html;
}

export function openSwotReport(opts) {
  const html = buildSwotReportHtml(opts);
  const blob = new Blob([html], { type: 'text/html' });
  window.open(URL.createObjectURL(blob), '_blank');
}
