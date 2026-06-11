// Searchable, sortable CLI reference library table (414 refs). Shared by the
// Further Reading dashboard and the Help & Guide "Further Reading" page.
// Ported from v1.24L renderFurtherReading (App.jsx 2349–2502); the REFS array
// was extracted verbatim to data/datasets/further-reading.json.
import { useMemo, useState } from 'react';
import REFS from '../../data/datasets/further-reading.json';

const SEARCH_ENGINES = [
  { key: 'google', header: 'Google', short: 'G', url: (q) => `https://www.google.com/search?q=${q}` },
  { key: 'yahoo', header: 'Yahoo', short: 'Y', url: (q) => `https://search.yahoo.com/search?p=${q}` },
  { key: 'bing', header: 'Bing', short: 'B', url: (q) => `https://www.bing.com/search?q=${q}` },
  { key: 'ddg', header: 'DkDkGo', short: 'D', url: (q) => `https://duckduckgo.com/?q=${q}` },
];

const COL_WIDTHS = ['50%', '20%', '5%', '5%', '5%', '5%', '5%', '5%'];

const mkQuery = (r) => encodeURIComponent(`${r.author} ${r.title}`.trim());

function ColGroup() {
  return (
    <colgroup>
      {COL_WIDTHS.map((w, i) => <col key={i} style={{ width: w }} />)}
    </colgroup>
  );
}

export default function ReferenceLibrary() {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState('year');
  const [sortDir, setSortDir] = useState(-1);

  const filteredRefs = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = q
      ? REFS.filter((r) => r.title.toLowerCase().includes(q) || r.author.toLowerCase().includes(q) || r.year.includes(q))
      : [...REFS];
    // Legacy comparator preserved exactly (incl. its inverted direction semantics).
    return filtered.sort((a, b) => {
      const av = (a[sortCol] || '').toLowerCase();
      const bv = (b[sortCol] || '').toLowerCase();
      return av < bv ? sortDir : av > bv ? -sortDir : 0;
    });
  }, [search, sortCol, sortDir]);

  const SortHdr = ({ col, label }) => {
    const active = sortCol === col;
    return (
      <button
        type="button"
        className="select-none font-bold text-sky-300 hover:text-accent"
        aria-label={`Sort by ${label}`}
        onClick={() => {
          if (sortCol === col) setSortDir((d) => -d);
          else { setSortCol(col); setSortDir(1); }
        }}
      >
        {label} {active ? (sortDir === 1 ? '↑' : '↓') : '↕'}
      </button>
    );
  };

  const thClass = 'sticky top-0 z-10 whitespace-nowrap border-b border-border bg-panel px-1.5 py-2 text-[11px] font-bold tracking-wide text-sky-300';
  const tdClass = 'border-b border-border px-2 py-1.5 align-top leading-snug text-muted';

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center gap-2.5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search titles, authors, or years…"
          aria-label="Search references"
          className="flex-1 rounded-md border border-border bg-panel px-3.5 py-1.5 text-[13px] text-white outline-none placeholder:text-subtle focus:border-accent"
        />
        <span className="whitespace-nowrap text-[11px] text-muted">{filteredRefs.length} / {REFS.length}</span>
        <button
          type="button"
          onClick={() => setSearch('')}
          className="rounded border border-border bg-panel px-3 py-1.5 text-[11px] text-muted hover:text-white"
        >
          Clear
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border">
        {/* Fixed header */}
        <table className="w-full shrink-0 table-fixed border-collapse text-xs">
          <ColGroup />
          <thead>
            <tr>
              <th className={`${thClass} text-left`}><SortHdr col="title" label="Article / Title" /></th>
              <th className={`${thClass} text-left`}><SortHdr col="author" label="Author" /></th>
              <th className={`${thClass} text-center`}><SortHdr col="year" label="Year" /></th>
              {SEARCH_ENGINES.map((e) => <th key={e.key} className={`${thClass} text-center`}>{e.header}</th>)}
              <th className={`${thClass} text-center`} aria-label="Direct link" />
            </tr>
          </thead>
        </table>
        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full table-fixed border-collapse text-xs">
            <ColGroup />
            <tbody>
              {filteredRefs.map((r, i) => {
                const q = mkQuery(r);
                return (
                  <tr key={`${r.title}-${i}`} className={i % 2 === 1 ? 'bg-panel/40' : ''}>
                    <td className={tdClass}>
                      {r.url
                        ? <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{r.title}</a>
                        : <span>{r.title}</span>}
                    </td>
                    <td className={`${tdClass} text-[11px]`}>{r.author}</td>
                    <td className={`${tdClass} text-center font-mono text-[11px] text-sky-300`}>{r.year}</td>
                    {SEARCH_ENGINES.map((e) => (
                      <td key={e.key} className={`${tdClass} text-center`}>
                        <a
                          href={e.url(q)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-accent hover:underline"
                          aria-label={`Search ${e.header} for ${r.title}`}
                        >
                          {e.short}
                        </a>
                      </td>
                    ))}
                    <td className={`${tdClass} text-center`}>
                      {r.url
                        ? <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-accent hover:underline" aria-label={`Open ${r.title}`}>↗</a>
                        : <span className="text-subtle">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
