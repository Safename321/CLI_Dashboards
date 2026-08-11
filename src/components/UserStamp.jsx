// Header identity + live timestamp — top-right of every dashboard (via
// DashboardShell). Shows the signed-in user's real name, company, and
// geographical location (the browser's IANA timezone, e.g. "Asia/Dhaka"),
// with a local timestamp that ticks every second. No permission prompt and no
// network call — the timezone is read from Intl.
import { useEffect, useState } from 'react';
import { getUser } from '../lib/auth.js';

const TIMEZONE = (() => {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; }
  catch { return ''; }
})();

// "Asia/Dhaka" -> "Dhaka" for a compact label; the full zone stays as a tooltip.
const LOCATION = TIMEZONE ? TIMEZONE.split('/').pop().replace(/_/g, ' ') : '';

export default function UserStamp() {
  const user = getUser();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const name = user?.name || null;
  const company = (typeof user?.company === 'string' ? user.company : user?.company?.name) || null;
  const meta = [company, LOCATION].filter(Boolean).join(' · ');
  const stamp = now.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'medium' });

  return (
    <div className="text-right leading-tight" title={TIMEZONE || undefined}>
      {name && <div className="text-xs font-semibold text-slate-200">{name}</div>}
      {meta && <div className="text-[11px] text-muted">{meta}</div>}
      <div className="font-mono text-[11px] tabular-nums text-muted">{stamp}</div>
    </div>
  );
}
