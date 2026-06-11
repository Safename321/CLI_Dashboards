// Mentor session Q&A export — builds a styled standalone HTML document from the
// conversation and downloads it (open in browser → Print → Save as PDF).
// Ported from legacy generateConversationPDF; tenant/email now come from auth
// context instead of sessionStorage reads.

const esc = (s = '') => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Render markdown-ish assistant text to HTML.
function renderText(text) {
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h4 style="margin:14px 0 4px;font-size:13px;color:#0e7490;">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 style="margin:16px 0 6px;font-size:15px;color:#1d4ed8;">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 style="margin:18px 0 8px;font-size:17px;color:#0f172a;">$1</h2>')
    .replace(/^[-•] (.+)$/gm, '<li style="margin:4px 0;padding-left:4px;">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, (s) => '<ul style="margin:8px 0;padding-left:20px;">' + s + '</ul>')
    .replace(/\n\n/g, '</p><p style="margin:10px 0;">')
    .replace(/\n/g, '<br>');
}

function reportFooter({ email, tenantName }) {
  const ts = new Date().toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  });
  let html = '';
  html += '<div style="margin-top:48px;padding-top:16px;border-top:1px solid #e2e8f0;';
  html += 'color:#94a3b8;font-size:10px;font-family:Arial,sans-serif;line-height:1.5;display:flex;';
  html += 'justify-content:space-between;flex-wrap:wrap;gap:8px;">';
  html += '<span><strong style="color:#475569;">CLI | Connective Leadership Institute</strong> · The Future</span>';
  html += '<span>Generated <strong style="color:#475569;">' + esc(ts) + '</strong></span>';
  html += '<span>For <strong style="color:#475569;">' + esc(email || 'unknown') + '</strong> · Tenant: ' + esc(tenantName || 'CLI Demo') + '</span>';
  html += '</div>';
  return html;
}

const STYLES =
  'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f1f5f9;color:#1e293b;margin:0;padding:0;}' +
  '.page{max-width:820px;margin:0 auto;padding:0 0 60px;}' +
  '.header{background:linear-gradient(135deg,#0e7490 0%,#1d4ed8 100%);color:white;padding:36px 48px;margin-bottom:0;}' +
  '.header-eyebrow{font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;opacity:0.75;}' +
  '.header-title{font-size:28px;font-weight:800;margin:8px 0 4px;letter-spacing:-0.5px;}' +
  '.header-meta{font-size:12px;opacity:0.7;margin-top:6px;}' +
  '.toc{background:white;border-bottom:3px solid #0e7490;padding:20px 48px;}' +
  '.toc-title{font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#64748b;margin-bottom:10px;}' +
  '.toc-item{display:flex;align-items:baseline;gap:8px;margin:5px 0;font-size:13px;color:#1e293b;}' +
  '.toc-num{font-weight:700;color:#0e7490;font-size:12px;min-width:20px;}' +
  '.qa-block{background:white;margin:16px 48px 0;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,0.08);overflow:hidden;page-break-inside:avoid;}' +
  '.qa-question{background:linear-gradient(90deg,#0e7490,#1d4ed8);padding:14px 20px;display:flex;align-items:flex-start;gap:12px;}' +
  '.q-badge{background:rgba(255,255,255,0.25);color:white;font-size:11px;font-weight:800;padding:2px 8px;border-radius:20px;white-space:nowrap;margin-top:1px;}' +
  '.q-text{color:white;font-size:14px;font-weight:600;line-height:1.5;}' +
  '.qa-answer{padding:20px 24px;font-size:13.5px;line-height:1.75;color:#1e293b;}' +
  '.qa-answer p{margin:8px 0;}.qa-answer ul{margin:8px 0;padding-left:20px;}.qa-answer li{margin:4px 0;}' +
  '.qa-answer strong{color:#0f172a;}.qa-answer h2,.qa-answer h3,.qa-answer h4{color:#0e7490;}' +
  '.summary-bar{background:#f8fafc;border-top:1px solid #e2e8f0;padding:12px 24px;font-size:11px;color:#94a3b8;display:flex;justify-content:space-between;}' +
  '.footer{background:#1e293b;color:#94a3b8;padding:18px 48px;font-size:11px;display:flex;justify-content:space-between;margin-top:32px;}' +
  '@media print{body{background:white;}.header,.qa-question{-webkit-print-color-adjust:exact;print-color-adjust:exact;}.qa-block{box-shadow:none;border:1px solid #e2e8f0;}}';

export function generateSessionReport({ conversation, tabLabel, currentDashboard, email, tenantName }) {
  if (!conversation || conversation.length === 0) return;
  const year = new Date().getFullYear();
  const timestamp = new Date().toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  const qaCount = conversation.filter((m) => m.role === 'user').length;

  let html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
  html += '<title>CLI AI Mentor — ' + esc(timestamp) + '</title>';
  html += '<style>' + STYLES + '</style></head><body><div class="page">';

  // Header
  html += '<div class="header">';
  html += '<div class="header-eyebrow">Connective Leadership Institute · CLI AI Mentor</div>';
  html += '<div class="header-title">Leadership Q&amp;A Session</div>';
  html += '<div class="header-meta">Generated: ' + esc(timestamp) + ' &nbsp;·&nbsp; ' + qaCount + ' question' + (qaCount !== 1 ? 's' : '') + ' &nbsp;·&nbsp; Mode: ' + esc(tabLabel || 'Ask Anything') + ' &nbsp;·&nbsp; Dashboard: ' + esc(currentDashboard || '') + '</div>';
  html += '</div>';

  // Table of contents
  const userQuestions = conversation.filter((m) => m.role === 'user');
  if (userQuestions.length > 1) {
    html += '<div class="toc"><div class="toc-title">Questions in this session</div>';
    userQuestions.forEach((q, i) => {
      html += '<div class="toc-item"><span class="toc-num">Q' + (i + 1) + '</span><span>' + esc(q.content).substring(0, 120) + (q.content.length > 120 ? '…' : '') + '</span></div>';
    });
    html += '</div>';
  }

  // Q&A blocks — pair user + assistant messages
  let qNum = 0;
  for (let i = 0; i < conversation.length; i++) {
    if (conversation[i].role !== 'user') continue;
    qNum += 1;
    const userMsg = conversation[i];
    const assistantMsg = conversation[i + 1];
    html += '<div class="qa-block">';
    html += '<div class="qa-question"><span class="q-badge">Q' + qNum + '</span><span class="q-text">' + esc(userMsg.content) + '</span></div>';
    if (assistantMsg && assistantMsg.role === 'assistant') {
      html += '<div class="qa-answer"><p>' + renderText(assistantMsg.content) + '</p></div>';
      html += '<div class="summary-bar"><span>CLI AI Mentor response</span><span>' + new Date().toLocaleDateString() + '</span></div>';
      i += 1; // skip the assistant message in the outer loop
    }
    html += '</div>';
  }

  html += '</div>'; // .page
  html += '<div class="footer"><span>&copy; ' + year + ' Connective Leadership Institute &mdash; CLI Dashboard</span><span>CLI AI Mentor Session Report</span></div>';
  html += reportFooter({ email, tenantName });
  html += '</body></html>';

  try {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CLI_Mentor_QA_' + new Date().toISOString().slice(0, 10) + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('[sessionReport] download failed:', err);
  }
}
