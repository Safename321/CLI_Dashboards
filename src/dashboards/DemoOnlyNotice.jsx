// Shown on a real company login for views whose data is still demonstration-only
// (fabricated S&P Global figures, not wired to a tenant data source). Demo data
// belongs to the public onboarding demo build (VITE_AUTH_DISABLED) — never to a
// signed-in company. Views gate on DEMO_BUILD and render this instead of fake numbers.
import DashboardShell from '../components/DashboardShell.jsx';

export default function DemoOnlyNotice({ title, icon, subtitle }) {
  return (
    <DashboardShell title={title} icon={icon} subtitle={subtitle}>
      <div className="mx-auto mt-10 max-w-xl rounded-xl border border-border bg-panel p-8">
        <p className="text-sm font-semibold text-amber-400">Demonstration view — not connected to your organization.</p>
        <p className="mt-2 text-sm text-muted">
          This dashboard currently illustrates the analysis using demonstration data. It isn't yet wired to your
          organization's live data source, so it's shown only in the public onboarding demo — not on a company login.
        </p>
        <p className="mt-3 text-sm text-muted">
          Views driven by your real assessment data — OASI, Aspirational OASI, Assign CLI Instruments, Fill Jobs and
          Management Challenges — are available and populate from your synced scores.
        </p>
      </div>
    </DashboardShell>
  );
}
