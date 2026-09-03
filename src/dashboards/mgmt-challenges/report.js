// Management Challenges — resolution report generator. Builds a printable
// standalone HTML document at runtime and downloads it (legacy generateReport;
// the HTML is generated from state, never embedded/base64).
import { STYLES, DOMAINS } from '../shared/StyleRadar.jsx';
import { mean } from './PartiesSection.jsx';

const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const initials = (name) => name.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase();

const REPORT_CSS =
  '*{box-sizing:border-box;margin:0;padding:0}body{font-family:Georgia,serif;color:#1a2e42;background:#fff;padding:48px 56px;max-width:860px;margin:0 auto}' +
  '.hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px}' +
  '.org{font-family:Arial,sans-serif;font-weight:700;font-size:18px;color:#c00}' +
  'hr{border:none;border-top:2px solid #c00;margin-bottom:28px}' +
  'h1{font-size:26px;font-weight:700;margin-bottom:6px}h2{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#c00;margin:22px 0 9px}' +
  '.ab{background:#f0f6fc;border-left:3px solid #3b82f6;padding:7px 12px;margin-bottom:5px;border-radius:0 5px 5px 0;display:flex;justify-content:space-between;font-size:12px}' +
  '.ab span:first-child{color:#555}.ab span:last-child{font-weight:600;color:#1a2e42;text-align:right;max-width:60%}' +
  'table{width:100%;border-collapse:collapse;margin-bottom:14px}th{padding:7px 8px;background:#1a2e42;color:rgba(255,255,255,.8);font-size:10px;text-align:left;font-family:Arial,sans-serif}' +
  'td{padding:7px 8px;border-bottom:1px solid #eee;font-size:12px}' +
  '.rg{display:grid;grid-template-columns:1fr 1fr;gap:14px}' +
  '.rb{background:#fff5f5;border-left:3px solid #ef4444;padding:11px 14px;border-radius:0 6px 6px 0}' +
  '.gb{background:#fffbeb;border-left:3px solid #eab308;padding:11px 14px;border-radius:0 6px 6px 0}' +
  '.bt{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:7px}' +
  '.rb .bt{color:#c0392b}.gb .bt{color:#92400e}' +
  '.li{font-size:12px;margin-bottom:3px;display:flex;gap:5px}p{font-size:12px;line-height:1.7;margin-bottom:9px}' +
  '.footer{margin-top:36px;padding-top:10px;border-top:1px solid #ddd;display:flex;justify-content:space-between;font-size:9px;color:#aaa}';

export function buildReportHtml({ prob, sub, fields, parties, opts }) {
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const desc = fields.desc || 'Not provided';
  const out = fields.outcome || 'Not specified';
  const tf = fields.timeframe || 'Not specified';
  const og = fields.orgGoals || 'Not specified';
  const notes = fields.notes || '';

  let html =
    `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>CLI — ${esc(prob.name)}</title><style>${REPORT_CSS}</style></head><body>` +
    '<div class="hdr"><div><div class="org">Connective Leadership Institute</div><div style="font-size:10px;color:#888;">CLI MANAGEMENT CHALLENGE REPORT</div></div>' +
    `<div style="text-align:right;font-size:10px;color:#888;">Prepared: ${now}<br/>Management Challenges v2.0<br/>Confidential</div></div>` +
    `<hr/><h1>${esc(prob.name)}</h1>` +
    `<p style="color:#555;font-size:12px;">Variant: ${esc(sub ? sub.text : 'General')} &nbsp;&middot;&nbsp; CLI Instrument: ${esc(prob.instrument)}</p>`;

  if (opts.summary) {
    html +=
      '<h2>Challenge Summary</h2>' +
      `<div class="ab"><span>Problem Description</span><span>${esc(desc)}</span></div>` +
      `<div class="ab"><span>Desired Outcome</span><span>${esc(out)}</span></div>` +
      `<div class="ab"><span>Timeframe</span><span>${esc(tf)}</span></div>` +
      `<div class="ab"><span>Organizational Goals at Stake</span><span>${esc(og)}</span></div>` +
      '<h2>Involved Parties</h2>' +
      parties.map((p) =>
        '<div style="display:flex;gap:9px;padding:7px 11px;background:#f8f9fa;border:1px solid #e8e8e8;border-radius:5px;margin-bottom:5px;align-items:center;">' +
        `<div style="width:30px;height:30px;border-radius:50%;background:${p.col};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;flex-shrink:0;">${esc(initials(p.name))}</div>` +
        `<div><div style="font-weight:600;font-size:12px;">${esc(p.name)}${p.role ? ' — ' + esc(p.role) : ''}</div>` +
        `<div style="font-size:10px;color:#555;">Instrument: <strong>${esc(p.instrument)}</strong> · Mean Score: ${mean(p.scores)}</div></div></div>`,
      ).join('');
  }

  if (opts.behavioral && parties.length < 2) {
    html +=
      '<h2>Behavioral Gap Analysis</h2>' +
      '<p style="color:#777;font-style:italic;">Requires at least two involved parties — add a second party (or team) to compare all 9 Achieving Styles and surface friction risks.</p>';
  }
  if (opts.behavioral && parties.length >= 2) {
    const [p1, p2] = parties;
    html +=
      `<h2>Behavioral Gap Analysis — ${esc(p1.name)} vs. ${esc(p2.name)}</h2>` +
      `<table><thead><tr><th>Style</th><th>Domain</th><th>${esc(p1.name)}</th><th>${esc(p2.name)}</th><th>Gap</th><th>Friction Risk</th></tr></thead><tbody>`;
    STYLES.forEach((s, i) => {
      const v1 = p1.scores[i];
      const v2 = p2.scores[i];
      const gap = Math.abs(v1 - v2);
      html +=
        `<tr><td>${s}</td><td>${DOMAINS[i]}</td>` +
        `<td style="font-weight:600;color:${v1 >= 7 ? '#c0392b' : v1 >= 5 ? '#2980b9' : '#555'};">${v1.toFixed(1)}</td>` +
        `<td style="font-weight:600;color:${v2 >= 7 ? '#c0392b' : v2 >= 5 ? '#2980b9' : '#555'};">${v2.toFixed(1)}</td>` +
        `<td style="font-weight:700;color:${gap >= 3 ? '#c0392b' : gap >= 1.5 ? '#d97706' : '#059669'};">${gap.toFixed(1)}</td>` +
        `<td>${gap >= 3 ? 'HIGH' : gap >= 1.5 ? 'Medium' : 'Low'}</td></tr>`;
    });
    html += '</tbody></table>';
  }

  if (opts.instruments) {
    html += '<h2>Recommended CLI Instruments</h2>';
    prob.instruments.forEach((i) => {
      html +=
        '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #eee;font-size:12px;">' +
        `<strong>${esc(i.n)}</strong><span style="color:#555;max-width:70%;">${esc(i.w)}</span>` +
        `<span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:10px;background:${i.l === 'primary' ? '#e0f4ff' : '#eff6ff'};color:${i.l === 'primary' ? '#0369a1' : '#3b82f6'};">${i.l.toUpperCase()}</span></div>`;
    });
  }

  if (opts.risks) {
    html +=
      '<h2>Risk & Organizational Goals Assessment</h2>' +
      '<div class="rg"><div class="rb"><div class="bt">Risks to Non-Involved Parties</div>' +
      prob.risks.map((r) => `<div class="li"><span>&bull;</span>${esc(r)}</div>`).join('') +
      '</div><div class="gb"><div class="bt">Organizational Goals at Risk</div>' +
      prob.goals.map((g) => `<div class="li"><span>&bull;</span>${esc(g)}</div>`).join('') +
      '</div></div>';
  }

  if (opts.playbook) {
    html +=
      '<h2>Resolution Playbook</h2>' +
      '<p><strong>Phase 1 (Week 1-2):</strong> Administer recommended CLI instruments to all parties. Establish psychological safety contract before sharing results.</p>' +
      '<p><strong>Phase 2 (Week 2-3):</strong> Individual debrief sessions with a certified CLI practitioner before joint session.</p>' +
      '<p><strong>Phase 3 (Week 3-4):</strong> Joint behavioral gap debrief. Use the Peace Pad overlay to show style distances objectively.</p>' +
      '<p><strong>Phase 4 (Month 2):</strong> Co-create working agreements based on style awareness. Define flex behaviors each party commits to.</p>' +
      '<p><strong>Phase 5 (Month 3+):</strong> Progress check-in. Re-administer to measure behavioral shift under stress.</p>';
  }

  if (opts.cli) {
    html +=
      '<h2>A Connective Leadership Perspective</h2>' +
      '<p style="background:#fef9ec;border-left:3px solid #DAA520;padding:9px 13px;border-radius:0 5px 5px 0;color:#78350f;">' +
      '<strong>Note:</strong> No Achieving Style is better than any other. The CLI framework measures <em>how</em> people achieve — external, observable behavior that is situational and changeable. ' +
      'The gap on the Peace Pad is not a judgment; it is information. The highest-performing teams are not those where everyone has the same style. ' +
      "They are the ones where people understand each other's styles well enough to flex toward each other when it matters.</p>";
  }

  if (notes) {
    html += `<h2>Additional Context & Notes</h2><p style="background:#f0f9f4;border-left:3px solid #059669;padding:9px 13px;border-radius:0 5px 5px 0;">${esc(notes)}</p>`;
  }

  html +=
    `<div class="footer"><span>Connective Leadership Institute — Management Challenges v2.0</span><span>Generated ${now} · Confidential</span><span>connectiveleadership.com</span></div>` +
    '</body></html>';
  return html;
}

export function generateReport(args) {
  try {
    const html = buildReportHtml(args);
    const a = document.createElement('a');
    a.href = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
    a.download = 'CLI_Management_Challenge_Report.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error('[MgmtChallenges] report generation failed:', err);
  }
}
