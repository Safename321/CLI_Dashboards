// Investor Behavior — live tenant view (Phase 3 / D5).
// Renders the tenant's real market identity through the authed /data proxy
// (markets quote + SEC filings, keys server-side) plus the per-tenant
// `shareholders` dataset. The ticker/CIK come from the `companyProfile`
// dataset; private companies (no profile) get an instructional empty state.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Panel } from '../../components/primitives.jsx';
import { dashFetch } from '../../lib/auth.js';
import { useDataset } from '../../lib/liveData.js';

const fmt = (v, d = 2) => (v == null || Number.isNaN(v) ? '—' : Number(v).toFixed(d));

// One authed /data call, unwrapping the proxy envelope.
async function fetchData(source, params) {
  const qs = new URLSearchParams(params).toString();
  const res = await dashFetch(`/data/${source}?${qs}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const env = await res.json();
  return env?.available ? env.data : { __degraded: env?.note || 'unavailable' };
}

function QuoteRow({ quote, ticker }) {
  if (!quote) return null;
  if (quote.__degraded) {
    return (
      <Panel title={`💹 ${ticker} — market quote`}>
        <p className="text-sm italic text-muted">
          Live quote unavailable: {quote.__degraded}. (Alpha Vantage key not configured on the backend yet.)
        </p>
      </Panel>
    );
  }
  const num = (k) => (quote?.[k] != null ? Number(String(quote[k]).replace('%', '')) : null);
  const change = num('09. change');
  const tiles = [
    ['Price', `$${fmt(num('05. price'))}`, change == null ? '' : change >= 0 ? 'text-emerald-400' : 'text-red-400'],
    ['Change', `${change != null && change >= 0 ? '+' : ''}${fmt(change)} (${fmt(num('10. change percent'))}%)`, change == null ? '' : change >= 0 ? 'text-emerald-400' : 'text-red-400'],
    ['Volume', num('06. volume') != null ? Number(num('06. volume')).toLocaleString() : '—', 'text-slate-100'],
    ['Prev close', `$${fmt(num('08. previous close'))}`, 'text-slate-100'],
    ['As of', quote?.['07. latest trading day'] ?? '—', 'text-slate-100'],
  ];
  return (
    <Panel title={`💹 ${ticker} — live market quote`}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {tiles.map(([label, value, tone]) => (
          <div key={label} className="rounded-lg border border-border bg-ink px-3 py-3 text-center">
            <div className={`text-lg font-bold ${tone || 'text-accent'}`}>{value}</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted">{label}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function FilingsPanel({ sec }) {
  if (!sec) return null;
  if (sec.__degraded) {
    return (
      <Panel title="📄 SEC filings">
        <p className="text-sm italic text-muted">Filings unavailable: {sec.__degraded}</p>
      </Panel>
    );
  }
  const recent = sec?.filings?.recent || {};
  const rows = (recent.form || []).slice(0, 10).map((form, i) => ({
    form,
    filed: recent.filingDate?.[i],
    doc: recent.primaryDocDescription?.[i] || recent.primaryDocument?.[i] || '',
  }));
  return (
    <Panel title={`📄 SEC filings — ${sec?.name ?? ''}`}>
      {rows.length === 0 ? (
        <p className="text-sm italic text-muted">No recent filings returned.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted">
                <th className="py-2 pr-4">Form</th>
                <th className="py-2 pr-4">Filed</th>
                <th className="py-2 pr-4">Document</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2 pr-4 font-mono font-semibold text-accent">{r.form}</td>
                  <td className="py-2 pr-4 text-slate-200">{r.filed ?? '—'}</td>
                  <td className="py-2 pr-4 text-muted">{r.doc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function ShareholdersPanel({ stored }) {
  const years = useMemo(
    () => Object.keys(stored || {}).filter((y) => Array.isArray(stored[y])).sort().reverse(),
    [stored],
  );
  if (!years.length) return null;
  const latest = years[0];
  const rows = stored[latest].slice(0, 10);
  return (
    <Panel title={`📊 Top institutional shareholders (${latest} · entered dataset)`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted">
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">Holder</th>
              <th className="py-2 pr-4">Shares (M)</th>
              <th className="py-2 pr-4">% owned</th>
              <th className="py-2 pr-4">Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((h, i) => (
              <tr key={i} className="border-b border-border/50">
                <td className="py-2 pr-4 text-muted">{h.rank ?? i + 1}</td>
                <td className="py-2 pr-4 font-semibold text-slate-100">{h.name}</td>
                <td className="py-2 pr-4 font-mono text-slate-200">{h.shares ?? '—'}</td>
                <td className="py-2 pr-4 font-mono text-slate-200">{h.pctOwned != null ? `${h.pctOwned}%` : '—'}</td>
                <td className={`py-2 pr-4 font-mono ${String(h.change || '').startsWith('+') ? 'text-emerald-400' : String(h.change || '').startsWith('-') ? 'text-red-400' : 'text-muted'}`}>{h.change ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export default function LiveInvestorBehavior() {
  const profile = useDataset('companyProfile', null);
  const shareholders = useDataset('shareholders', null);
  const ticker = profile?.ticker || null;
  const cik = profile?.cik || null;

  const [quote, setQuote] = useState(null);
  const [sec, setSec] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!ticker && !cik) return;
    setLoading(true);
    const [q, s] = await Promise.all([
      ticker ? fetchData('markets', { symbol: ticker }).catch((e) => ({ __degraded: e.message })) : null,
      cik ? fetchData('sec', { cik }).catch((e) => ({ __degraded: e.message })) : null,
    ]);
    setQuote(q);
    setSec(s);
    setLoading(false);
  }, [ticker, cik]);

  useEffect(() => { load(); }, [load]);

  const hasProfile = Boolean(ticker || cik);
  const hasShareholders = shareholders && Object.keys(shareholders).length > 0;

  if (!hasProfile && !hasShareholders) {
    return (
      <div className="mx-auto mt-10 max-w-xl rounded-xl border border-border bg-panel p-8">
        <p className="text-sm font-semibold text-amber-400">No market identity configured.</p>
        <p className="mt-2 text-sm text-muted">
          For a public company, store the <span className="font-semibold text-slate-200">companyProfile</span> dataset
          (<code className="text-slate-300">{'{"ticker":"SPGI","cik":"0000064040","companyName":"..."}'}</code>) via the
          SuperAdmin dataset editor — live quotes and SEC filings render from it. Private companies can enter
          the <span className="font-semibold text-slate-200">shareholders</span> dataset instead.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {hasProfile && (
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-emerald-500/50 bg-emerald-900/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
            live · {profile?.companyName || ticker || `CIK ${cik}`}
          </span>
          {loading && <span className="text-xs text-muted">refreshing…</span>}
        </div>
      )}
      <QuoteRow quote={quote} ticker={ticker} />
      <FilingsPanel sec={sec} />
      <ShareholdersPanel stored={shareholders} />
      <p className="text-[11px] italic text-subtle">
        Quotes and filings come from the authenticated data proxy (keys server-side); shareholder
        composition from your entered dataset.
      </p>
    </div>
  );
}
