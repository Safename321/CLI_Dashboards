// Shared helpers for generated HTML report documents (v1.24L App.jsx 632–656).
// Reports are assembled as standalone HTML strings, downloaded (or opened) via
// a Blob URL; users print to PDF from the browser — same flow as the legacy app.
import { APP_VERSION_LABEL } from '../config/version.js';

export const REPORT_VERSION = `CLI Dashboard ${APP_VERSION_LABEL}`;

// Escape user-supplied text before interpolating into report HTML.
export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Company display label, e.g. "S&P Global Inc. (SPGI)" — generic when no data.
export function companyLabel(data, fallback = 'CLI Demo Company') {
  const c = data?.company;
  if (!c?.name) return fallback;
  return c.ticker ? `${c.name} (${c.ticker})` : c.name;
}

// Provenance strip appended to every generated report. The legacy version read
// email/tenant from sessionStorage globals; here tenant identity comes from the
// dataset passed by the caller (no window/sessionStorage reads).
export function cliReportFooter(data) {
  const tenant = data?.company?.name || 'CLI Demo (white-label)';
  const ts = new Date().toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  });
  return (
    '<div style="margin-top:48px;padding-top:16px;border-top:1px solid #e2e8f0;' +
    'color:#94a3b8;font-size:10px;font-family:Arial,sans-serif;line-height:1.5;display:flex;' +
    'justify-content:space-between;flex-wrap:wrap;gap:8px;">' +
    '<span><strong style="color:#475569;">CLI | Connective Leadership Institute</strong> · The Future</span>' +
    '<span>Generated <strong style="color:#475569;">' + ts + '</strong></span>' +
    '<span>Tenant: <strong style="color:#475569;">' + esc(tenant) + '</strong></span>' +
    '</div>'
  );
}

// Trigger a browser download of an assembled HTML document.
export function downloadHtmlReport(html, fileName) {
  try {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('[reports] download failed:', err);
  }
}

// Open an assembled HTML document in a new tab (print-to-PDF flow).
export function openHtmlReport(html) {
  try {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (err) {
    console.error('[reports] open failed:', err);
  }
}
