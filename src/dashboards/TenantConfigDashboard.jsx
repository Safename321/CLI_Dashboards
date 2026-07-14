// Tenant Config — per-domain connector enable/disable, freshness/error state,
// and "run all connectors" through the registry orchestrator (useRegistry()
// replaces the legacy registry/onUpdateAll props).
import { useMemo, useState } from 'react';
import DashboardShell from '../components/DashboardShell.jsx';
import { useRegistry } from '../connectors/RegistryContext.jsx';
import { DOMAIN_LABELS, DOMAIN_DESCRIPTIONS, DOMAIN_ORDER } from '../data/datasets/connector-domains.js';

function freshness(oldestSuccess) {
  if (!oldestSuccess) return 'never';
  const ageMin = Math.round((Date.now() - new Date(oldestSuccess).getTime()) / 60000);
  if (ageMin < 1) return 'just now';
  if (ageMin < 60) return `${ageMin} min ago`;
  if (ageMin < 24 * 60) return `${Math.round(ageMin / 60)} hr ago`;
  return `${Math.round(ageMin / 60 / 24)} days ago`;
}

export default function TenantConfigDashboard() {
  const { registry, lastRun, running, runAll } = useRegistry();
  const [tick, setTick] = useState(0); // re-render after enable/disable toggles

  const connectors = useMemo(() => registry.list(), [registry, lastRun, running, tick]);
  const byDomain = useMemo(() => {
    const out = {};
    connectors.forEach((c) => (out[c.domain] ||= []).push(c));
    return out;
  }, [connectors]);
  const orderedDomains = DOMAIN_ORDER.filter((d) => byDomain[d]).concat(
    Object.keys(byDomain).filter((d) => !DOMAIN_ORDER.includes(d))
  );

  const enabledCount = connectors.filter((c) => c.enabled).length;

  const toggleEnabled = (key) => {
    const c = registry.get(key);
    if (c) {
      c.enabled = !c.enabled;
      setTick((t) => t + 1);
    }
  };

  return (
    <DashboardShell
      title="Tenant Configuration"
      icon="🔌"
      subtitle='Configure data connectors per domain. The "Update Data" button calls every enabled connector in parallel and merges results into the dashboard.'
    >
      <div className="space-y-6">
        {/* HRIS employee import lives in its own admin view (Administration →
            HRIS / Onboarding), wired with the authed fetch — not duplicated here. */}
        <div className="rounded-lg border border-border/50 bg-ink/40 p-3 text-xs text-muted">
          Looking to import employees from Workday / SAP / ADP / CSV? Admins: open{' '}
          <span className="font-semibold text-slate-300">Administration → HRIS / Onboarding</span> in the sidebar.
        </div>
        {/* Run-all summary */}
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-panel/60 p-4">
          <div>
            <div className="text-sm font-semibold text-white">
              {enabledCount} connector{enabledCount === 1 ? '' : 's'} enabled
              <span className="font-normal text-muted"> · {connectors.length} total configured</span>
            </div>
            <div className="mt-1 text-xs text-muted">
              {lastRun
                ? `Last run: ${new Date(lastRun.startedAt).toLocaleString()} · ${Object.keys(lastRun.results).length} completed · ${lastRun.errors.length} error${lastRun.errors.length === 1 ? '' : 's'}`
                : 'Not run this session'}
            </div>
          </div>
          <button
            type="button"
            onClick={runAll}
            disabled={running}
            className="rounded bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-500 disabled:bg-slate-700"
          >
            {running ? '⟳ Running all connectors…' : '⚡ Run all connectors'}
          </button>
        </div>

        {/* Per-domain sections — shared-public first, per-customer last */}
        {orderedDomains.length === 0 && <div className="text-sm italic text-subtle">No connectors configured yet.</div>}
        {orderedDomains.map((domain) => {
          const conns = byDomain[domain];
          const oldestSuccess = conns.map((c) => c.lastSuccessAt).filter(Boolean).sort()[0];
          return (
            <section key={domain} className="rounded-lg border border-border bg-ink/60 p-4">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-white">{DOMAIN_LABELS[domain] || domain}</h2>
                  {DOMAIN_DESCRIPTIONS[domain] && <p className="mt-0.5 text-xs text-muted">{DOMAIN_DESCRIPTIONS[domain]}</p>}
                </div>
                <span className="shrink-0 whitespace-nowrap text-xs text-subtle">
                  Freshness: <span className={oldestSuccess ? 'text-accent' : 'text-subtle'}>{freshness(oldestSuccess)}</span>
                </span>
              </div>
              <div className="space-y-2">
                {conns.map((c) => (
                  <div key={c.key} className="flex items-center gap-3 rounded border border-border/50 bg-panel/40 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => toggleEnabled(c.key)}
                      role="switch"
                      aria-checked={c.enabled}
                      aria-label={`${c.enabled ? 'Disable' : 'Enable'} ${c.label}`}
                      className="relative h-5 w-9 shrink-0 rounded-full transition-colors"
                      style={{ background: c.enabled ? '#0ea5e9' : '#475569' }}
                    >
                      <span
                        className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all"
                        style={{ left: c.enabled ? '18px' : '2px' }}
                      />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-white">
                        {c.label}
                        {c.isMock && (
                          <span className="rounded border border-amber-500/40 bg-amber-900/30 px-1.5 py-0.5 text-xs text-amber-400">MOCK</span>
                        )}
                        {c.requiresOAuth && (
                          <span className="rounded border border-purple-500/40 bg-purple-900/30 px-1.5 py-0.5 text-xs text-purple-300">OAuth required</span>
                        )}
                      </div>
                      <div className="text-xs text-muted">
                        {c.lastSuccessAt
                          ? `Last successful fetch: ${new Date(c.lastSuccessAt).toLocaleString()}${c.isStale ? ' (stale)' : ''}`
                          : c.lastFetchAt
                            ? `Attempted: ${new Date(c.lastFetchAt).toLocaleString()} (no success yet)`
                            : 'Never fetched'}
                        {c.lastError && <span className="ml-2 text-red-400">· error: {c.lastError}</span>}
                      </div>
                    </div>
                    <span className="text-xs text-subtle">{c.enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* Connector economics & coverage reference */}
        <div className="space-y-2 rounded-lg border border-border/50 bg-ink/40 p-4 text-xs">
          <div className="font-semibold text-slate-300">Cost reference</div>
          <div className="leading-relaxed text-muted">
            <strong className="text-slate-300">Shared public data</strong> (SEC EDGAR, FRED, BLS, GDELT, Google News RSS) costs
            ~$20/month for the Vercel proxy infrastructure — and serves every customer from one deployment, with zero marginal cost
            per customer added. <strong className="text-slate-300">Customer-specific data</strong> (social listening per company,
            their own Salesforce/Workday, their own Glassdoor reviews) is per-customer billing, pass-through on the customer's contract.
            Mock connectors are free, demo-quality, and the right default for pre-revenue prospect conversations.
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
