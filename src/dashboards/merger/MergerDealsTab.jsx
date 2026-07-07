// M&A Deals 2020-2025 sub-tab: portfolio stats, deal scorecards, performance summary.
// Ported from v1.24L App.jsx PostMergerUpdatesDashboard (lines 7714-7873).
import { SPGI_MA_DEALS } from '../../data/datasets/merger-deals.js';

// Visual tier from CLI letter rating: A* emerald, B* cyan, else amber.
// Tenant-entered rows may omit fields — default to C-tier rather than crash.
const tierOf = (rating) => {
  const r = String(rating ?? '');
  return r.startsWith('A') ? 'A' : r.startsWith('B') ? 'B' : 'C';
};
const TIER = {
  A: { border: 'border-emerald-500/30', chip: 'bg-emerald-900/50 text-emerald-400', box: 'bg-emerald-900/20 border border-emerald-500/30', text: 'text-emerald-400', mark: '✓' },
  B: { border: 'border-cyan-500/30', chip: 'bg-cyan-900/50 text-cyan-400', box: 'bg-cyan-900/20 border border-cyan-500/30', text: 'text-cyan-400', mark: '○' },
  C: { border: 'border-amber-500/30', chip: 'bg-amber-900/50 text-amber-400', box: 'bg-amber-900/20 border border-amber-500/30', text: 'text-amber-400', mark: '△' },
};

const SUMMARY_STATS = [
  { value: '$47.1B+', label: 'Total Deal Value', note: '2018-2024', tint: 'from-emerald-900/30 border-emerald-500/30 text-emerald-400' },
  { value: '11', label: 'Major Deals', note: 'Acquisitions & Investments', tint: 'from-cyan-900/30 border-cyan-500/30 text-cyan-400' },
  { value: '$830M', label: 'Synergies Realized', note: 'Cost + Revenue', tint: 'from-amber-900/30 border-amber-500/30 text-amber-400' },
  { value: '+50%', label: 'Margin Improvement', note: 'Operating profit margin', tint: 'from-purple-900/30 border-purple-500/30 text-purple-400' },
];

function PerfCell({ label, value, valueClass }) {
  return (
    <div className="rounded-lg bg-slate-700/50 p-3 text-center">
      <div className="mb-1 text-xs text-muted">{label}</div>
      <div className={`font-bold ${valueClass}`}>{value}</div>
    </div>
  );
}

function DealCard({ deal }) {
  const tier = TIER[tierOf(deal.rating)];
  const perf = deal.performance ?? null;
  return (
    <article className={`overflow-hidden rounded-xl border bg-panel ${tier.border}`}>
      <div className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg text-xl font-bold ${tier.chip}`}>{deal.rating}</div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-white">{deal.company}</h3>
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${deal.type === 'Acquisition' ? 'bg-cyan-900/50 text-cyan-400' : 'bg-purple-900/50 text-purple-400'}`}>
                  {deal.type}
                </span>
              </div>
              <div className="text-sm text-muted">{deal.description}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{deal.value}</div>
            <div className="text-sm text-muted">Closed: {deal.closed}</div>
          </div>
        </div>

        {perf && (
          <div className="mb-4 grid grid-cols-5 gap-3">
            <PerfCell label="Revenue Impact" value={perf.revenueImpact ?? '—'} valueClass={String(perf.revenueImpact ?? '').includes('+') ? 'text-emerald-400' : 'text-slate-300'} />
            <PerfCell label="Margin Impact" value={perf.marginImpact ?? '—'} valueClass={String(perf.marginImpact ?? '').includes('+') ? 'text-emerald-400' : 'text-slate-300'} />
            <PerfCell
              label="Integration"
              value={perf.integrationStatus ?? '—'}
              valueClass={perf.integrationStatus === 'Complete' ? 'text-emerald-400' : perf.integrationStatus === 'Integrating' ? 'text-amber-400' : 'text-cyan-400'}
            />
            <PerfCell label="Synergies" value={perf.synergiesRealized ?? '—'} valueClass={['95%', '100%'].includes(perf.synergiesRealized) ? 'text-emerald-400' : 'text-slate-300'} />
            <PerfCell
              label="Retention"
              value={perf.employeeRetention ?? '—'}
              valueClass={parseInt(perf.employeeRetention, 10) >= 80 ? 'text-emerald-400' : parseInt(perf.employeeRetention, 10) >= 70 ? 'text-amber-400' : 'text-slate-300'}
            />
          </div>
        )}

        {(deal.rationale || deal.synergies) && (
          <div className="mb-4 grid grid-cols-2 gap-4">
            {deal.rationale && (
              <div className="rounded-lg bg-slate-700/30 p-3">
                <div className="mb-1 text-xs font-medium text-cyan-400">Strategic Rationale</div>
                <div className="text-sm text-slate-300">{deal.rationale}</div>
              </div>
            )}
            {deal.synergies && (
              <div className="rounded-lg bg-slate-700/30 p-3">
                <div className="mb-1 text-xs font-medium text-cyan-400">Synergy Targets</div>
                <div className="text-sm text-slate-300">
                  Cost: {deal.synergies.cost} • Revenue: {deal.synergies.revenue} • Timeline: {deal.synergies.timeline}
                </div>
              </div>
            )}
          </div>
        )}

        {deal.verdict && (
          <div className={`rounded-lg p-3 ${tier.box}`}>
            <div className="flex items-center gap-2">
              <span className={`text-lg ${tier.text}`}>{tier.mark}</span>
              <span className={`font-medium ${tier.text}`}>CLI Assessment:</span>
              <span className="text-slate-300">{deal.verdict}</span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

// deals: per-tenant `maDeals` dataset rows (same shape as SPGI_MA_DEALS);
// undefined → static demo portfolio. The demo summary stats + performance
// summary are S&P-specific, so they only render on the demo portfolio.
export default function MergerDealsTab({ deals }) {
  const isDemo = deals === undefined;
  const rows = isDemo ? SPGI_MA_DEALS : deals;

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-border bg-panel p-8 text-center">
        <p className="text-sm font-semibold text-amber-400">No M&A deals entered.</p>
        <p className="mt-2 text-sm text-muted">Store your deal list in the <span className="font-semibold text-slate-200">maDeals</span> dataset to populate this scorecard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isDemo && (
        <div className="grid grid-cols-4 gap-4">
          {SUMMARY_STATS.map((s) => (
            <div key={s.label} className={`rounded-xl border bg-gradient-to-br to-panel p-4 ${s.tint}`}>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-sm text-muted">{s.label}</div>
              <div className="mt-1 text-xs">{s.note}</div>
            </div>
          ))}
        </div>
      )}

      {isDemo && (
        <div className="rounded-lg border border-border bg-panel/50 p-3">
          <div className="flex items-center gap-2 text-sm text-muted">
            <span aria-hidden>📄</span>
            <span>Data sources: SEC 8-K filings, S&P Global press releases, earnings reports, and financial disclosures</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {rows.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>

      {isDemo && <div className="rounded-xl border border-border bg-gradient-to-r from-panel to-ink p-6">
        <h3 className="mb-4 font-semibold text-white">📊 M&A Portfolio Performance Summary</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="mb-2 text-sm text-muted">Rating Distribution</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-16 rounded bg-emerald-500" />
                <span className="text-sm text-emerald-400">A-tier: 2 deals (IHS Markit, Kensho)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-14 rounded bg-cyan-500" />
                <span className="text-sm text-cyan-400">B-tier: 5 deals</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-10 rounded bg-amber-500" />
                <span className="text-sm text-amber-400">C-tier: 4 deals</span>
              </div>
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm text-muted">Key Outcomes</div>
            <div className="space-y-1 text-sm">
              <div className="text-emerald-400">✓ IHS Markit: Exceeded synergy targets</div>
              <div className="text-emerald-400">✓ Kensho: AI leadership established</div>
              <div className="text-cyan-400">○ Visible Alpha: Integration in progress</div>
              <div className="text-cyan-400">○ Tealbook/Measurabl: ESG growth</div>
              <div className="text-amber-400">△ Crypto investments: Market headwinds</div>
            </div>
          </div>
          <div>
            <div className="mb-2 text-sm text-muted">Financial Impact (2022-2025)</div>
            <div className="space-y-1 text-sm">
              <div className="text-white">Revenue: $7.3B → $14.8B <span className="text-emerald-400">(+103%)</span></div>
              <div className="text-white">Operating Margin: 42% → 50.4% <span className="text-emerald-400">(+840bps)</span></div>
              <div className="text-white">Adjusted EPS: $12.51 → $17.83 <span className="text-emerald-400">(+43%)</span></div>
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
}
