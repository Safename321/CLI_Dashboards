// Management Challenges — persistent CANDIDATE POOL column (client feedback
// 2026-08-25: the people picker must be visible as the third column, not hidden
// behind the "Involved Parties" popup). Same data contract as PeoplePopup:
// `db` = tenant's live employees (real ASI profiles) or the static demo set;
// teams commit as OASI, individuals as ASI. Selecting rows and pressing "Add"
// hands the keys to the dashboard's commitPeople.
import { useState, useMemo, forwardRef } from 'react';
import { PEOPLE_DB } from '../../data/datasets/mgmt-challenges.js';

const PeoplePoolPanel = forwardRef(function PeoplePoolPanel({ parties, onAdd, db = PEOPLE_DB, note = null }, ref) {
  const [search, setSearch] = useState('');
  const [teamsOnly, setTeamsOnly] = useState(false);
  const [selected, setSelected] = useState(() => new Set());

  const f = search.toLowerCase();
  const groups = useMemo(
    () =>
      db.map((grp, gi) => ({
        grp,
        gi,
        visible: grp.people
          .map((person, pi) => ({ person, pi }))
          .filter(({ person }) => !f || person.name.toLowerCase().includes(f) || person.role.toLowerCase().includes(f)),
      })).filter((g) => (!teamsOnly || g.grp.type === 'team') && g.visible.length > 0),
    [db, f, teamsOnly],
  );

  const toggle = (key) =>
    setSelected((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const selectAllVisible = () =>
    setSelected((prev) => {
      const n = new Set(prev);
      groups.forEach(({ gi, visible }) => visible.forEach(({ pi }) => n.add(gi + '-' + pi)));
      return n;
    });

  const add = () => {
    if (selected.size === 0) return;
    onAdd([...selected]);
    setSelected(new Set());
  };

  return (
    <div ref={ref} className="flex h-full flex-col border-l border-border bg-panel/60">
      <div className="shrink-0 border-b border-border px-4 py-3">
        <div className="text-[10px] font-bold uppercase tracking-widest text-accent">Candidate Pool</div>
        <div className="mt-0.5 text-[10px] text-muted">Teams commit as OASI · individuals as ASI</div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-border px-4 py-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or role..."
          aria-label="Search candidate pool"
          className="w-full rounded-md border border-border bg-ink px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-accent"
        />
        <button onClick={selectAllVisible} className="rounded border border-border bg-ink px-2 py-1 text-[10px] text-sky-300">Select all visible</button>
        <button onClick={() => setSelected(new Set())} className="rounded border border-border px-2 py-1 text-[10px] text-slate-300">Clear</button>
        <label className="flex cursor-pointer items-center gap-1 text-[10px] text-slate-300">
          <input type="checkbox" checked={teamsOnly} onChange={(e) => setTeamsOnly(e.target.checked)} className="accent-cyan-400" /> Teams only
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">
        {groups.map(({ grp, gi, visible }) => (
          <div key={grp.name}>
            <div className="mb-1 mt-3 text-[10px] font-bold uppercase tracking-widest text-accent">
              {grp.name}{grp.type === 'team' ? ' (Teams)' : ' (Individuals)'}
            </div>
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-ink text-left text-[10px] font-semibold text-sky-300">
                  <th className="w-6 px-1 py-1" aria-label="Select" />
                  <th className="px-1.5 py-1">Name</th>
                  <th className="px-1.5 py-1">Role</th>
                  <th className="px-1.5 py-1">Instr.</th>
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
                      <td className="px-1 py-1 text-center">
                        <input
                          type="checkbox"
                          checked={isSel}
                          onChange={() => toggle(key)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Select ${person.name}`}
                          className="accent-cyan-400"
                        />
                      </td>
                      <td className="px-1.5 py-1 font-semibold text-white">
                        <span className="block max-w-[120px] truncate">{person.name}</span>
                        {alreadyAdded && <span className="text-[8px] text-emerald-400">added ✓</span>}
                      </td>
                      <td className="max-w-[110px] truncate px-1.5 py-1 text-slate-300">{person.role}</td>
                      <td className="px-1.5 py-1">
                        <span className={`rounded-full bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold ${grp.type === 'team' ? 'text-blue-400' : 'text-accent'}`}>
                          {grp.type === 'team' ? 'OASI' : 'ASI'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
        {note && (
          <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-900/15 px-3 py-2.5 text-xs leading-relaxed text-amber-200">
            {note}
          </div>
        )}
        {!note && groups.length === 0 && <div className="mt-4 text-center text-xs italic text-muted">No matches.</div>}
      </div>

      <div className="shrink-0 border-t border-border px-4 py-2.5">
        <button
          onClick={add}
          disabled={selected.size === 0}
          className="w-full rounded-md border border-accent bg-ink px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-ink/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add {selected.size || ''} selected as parties ✓
        </button>
      </div>
    </div>
  );
});

export default PeoplePoolPanel;
