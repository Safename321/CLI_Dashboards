// Management Challenges — "Involved Parties" picker drawer over the SPGI
// people/teams database. Done commits: teams → OASI, individuals → ASI.
import { useState, useMemo } from 'react';
import { PEOPLE_DB } from '../../data/datasets/mgmt-challenges.js';

export default function PeoplePopup({ parties, onDone }) {
  const [search, setSearch] = useState('');
  const [teamsOnly, setTeamsOnly] = useState(false);
  const [selected, setSelected] = useState(() => new Set());

  const f = search.toLowerCase();
  const groups = useMemo(
    () =>
      PEOPLE_DB.map((grp, gi) => ({
        grp,
        gi,
        visible: grp.people
          .map((person, pi) => ({ person, pi }))
          .filter(({ person }) => !f || person.name.toLowerCase().includes(f) || person.role.toLowerCase().includes(f)),
      })).filter((g) => (!teamsOnly || g.grp.type === 'team') && g.visible.length > 0),
    [f, teamsOnly],
  );

  const toggle = (key) =>
    setSelected((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const selectAllVisible = () =>
    setSelected((prev) => {
      const n = new Set(prev);
      groups.forEach(({ gi, visible }) => visible.forEach(({ pi }) => n.add(gi + '-' + pi)));
      return n;
    });

  return (
    <div className="fixed inset-y-0 right-0 z-40 flex w-[640px] max-w-[96vw] flex-col border-l-2 border-border bg-panel shadow-2xl">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
        <div>
          <div className="text-sm font-bold text-white">Select Involved Parties</div>
          <div className="mt-0.5 text-[10px] text-muted">Choose from SPGI database · teams auto-assigned OASI · individuals auto-assigned ASI</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-ink px-3 py-1 text-xs text-accent">{selected.size} selected</span>
          <button onClick={() => onDone([...selected])} className="rounded-md border border-accent bg-ink px-4 py-1.5 text-xs font-semibold text-slate-100 hover:bg-ink/60">
            Done ✓
          </button>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-5 py-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or role..."
          aria-label="Search people"
          className="flex-1 rounded-md border border-border bg-ink px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-accent"
        />
        <button onClick={selectAllVisible} className="rounded border border-border bg-ink px-3 py-1 text-[11px] text-sky-300">Select all visible</button>
        <button onClick={() => setSelected(new Set())} className="rounded border border-border px-3 py-1 text-[11px] text-slate-300">Clear all</button>
        <label className="flex cursor-pointer items-center gap-1 text-[10px] text-slate-300">
          <input type="checkbox" checked={teamsOnly} onChange={(e) => setTeamsOnly(e.target.checked)} className="accent-cyan-400" /> Teams only
        </label>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {groups.map(({ grp, gi, visible }) => (
          <div key={grp.name}>
            <div className="mb-1 mt-4 text-[10px] font-bold uppercase tracking-widest text-accent">
              {grp.name}{grp.type === 'team' ? ' (Teams)' : ' (Individuals)'}
            </div>
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-ink text-left text-[10px] font-semibold text-sky-300">
                  <th className="w-7 px-1 py-1.5" aria-label="Select" />
                  <th className="px-2 py-1.5">Name</th>
                  <th className="px-2 py-1.5">Role</th>
                  <th className="px-2 py-1.5">Instrument</th>
                  <th className="px-2 py-1.5">Type</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(({ person, pi }) => {
                  const key = gi + '-' + pi;
                  const isSel = selected.has(key);
                  const alreadyAdded = parties.find((p) => p.name === person.name);
                  return (
                    <tr
                      key={key}
                      onClick={() => toggle(key)}
                      className={`cursor-pointer border-b border-border/50 ${isSel ? 'bg-accent/10' : 'hover:bg-ink'}`}
                    >
                      <td className="px-1 py-1.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSel}
                          onChange={() => toggle(key)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Select ${person.name}`}
                          className="accent-cyan-400"
                        />
                      </td>
                      <td className="px-2 py-1.5 font-semibold text-white">
                        {person.name}
                        {alreadyAdded && <span className="ml-1 text-[8px] text-emerald-400">✓</span>}
                      </td>
                      <td className="px-2 py-1.5 text-slate-300">{person.role}</td>
                      <td className="px-2 py-1.5">
                        <span className={`rounded-full bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold ${grp.type === 'team' ? 'text-blue-400' : 'text-accent'}`}>
                          {grp.type === 'team' ? 'OASI' : 'ASI'}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-[10px] text-muted">{grp.type === 'team' ? 'Team' : 'Individual'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
        {groups.length === 0 && <div className="mt-6 text-center text-xs italic text-muted">No matches.</div>}
      </div>
    </div>
  );
}
