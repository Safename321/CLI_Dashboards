// Data-provenance banner shown above dashboards (v1.24L App.jsx 503–542).
// Tenant comes from DataContext (no window.__CLI_TENANT__ global).
import { useData } from '../data/DataContext.jsx';

export default function DemoDataBanner() {
  const { tenant } = useData();

  // Empty-state tenants (e.g. Zoetis pre-pipeline-integration) get a distinct banner.
  if (tenant?.emptyState) {
    return (
      <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-900/20 px-4 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-amber-300">🧪 {tenant.companyName} tenant — awaiting data</span>
          </div>
          <div className="text-[11px] text-amber-200/80">
            CLI Flutter app pipeline → database → dashboard · no measurements recorded yet
          </div>
        </div>
      </div>
    );
  }

  // Default banner for live/demo tenants.
  return (
    <div className="mb-4 rounded-lg border border-cyan-500/40 bg-cyan-900/20 px-4 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-cyan-300">📊 Data sources{tenant ? ' · ' + tenant.companyName : ''}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-emerald-300">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-400" />
            Real — SEC EDGAR (financials)
          </span>
          <span className="text-amber-300">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-400" />
            Demo — OASI scores, sentiment, headcount
          </span>
        </div>
      </div>
    </div>
  );
}
