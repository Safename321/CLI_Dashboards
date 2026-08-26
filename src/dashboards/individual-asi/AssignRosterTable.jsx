// Flat roster table for LIVE tenants (client feedback 2026-08-25):
//  - ONE group by default — no by-title sections; a filter bar (name, title,
//    location, age) narrows the list instead.
//  - Always-visible sticky HEADER ROW with per-instrument column select-alls
//    (+ ALL), applying to every currently VISIBLE (filtered) employee.
//  - Three aligned columns: Employee | Title | Instruments.
// Selections key on the stable `live-<userId>` empId, so they survive filtering.
import { useMemo, useState } from 'react';
import InstrumentCheckbox from './InstrumentCheckbox.jsx';
import { INSTRUMENTS, CLI_TRICOLOR_GRADIENT } from './instruments.js';

const GRID = 'grid grid-cols-[minmax(200px,1.3fr)_minmax(140px,1fr)_auto] items-center gap-3';

export default function AssignRosterTable({ employees, instrumentState, onInstrumentChange, onBulkChange }) {
  const [fName, setFName] = useState('');
  const [fTitle, setFTitle] = useState('');
  const [fCity, setFCity] = useState('');
  const [fAgeMin, setFAgeMin] = useState('');
  const [fAgeMax, setFAgeMax] = useState('');

  const titles = useMemo(
    () => [...new Set(employees.map((e) => (e.designation || '').trim()).filter(Boolean))].sort(),
    [employees]
  );
  const cities = useMemo(
    () => [...new Set(employees.map((e) => (e.city || '').trim()).filter(Boolean))].sort(),
    [employees]
  );
  const hasAges = useMemo(() => employees.some((e) => e.age != null), [employees]);

  const visible = useMemo(() => {
    const q = fName.trim().toLowerCase();
    const min = fAgeMin === '' ? null : Number(fAgeMin);
    const max = fAgeMax === '' ? null : Number(fAgeMax);
    return employees.filter((e) => {
      if (q && !(e.name || '').toLowerCase().includes(q) && !(e.email || '').toLowerCase().includes(q)) return false;
      if (fTitle && (e.designation || '').trim() !== fTitle) return false;
      if (fCity && (e.city || '').trim() !== fCity) return false;
      if (min != null && !(e.age != null && e.age >= min)) return false;
      if (max != null && !(e.age != null && e.age <= max)) return false;
      return true;
    });
  }, [employees, fName, fTitle, fCity, fAgeMin, fAgeMax]);

  const filtered = visible.length !== employees.length;
  const columnChecked = (instKey) =>
    visible.length > 0 && visible.every((e) => instrumentState[e.empId]?.[instKey]);
  const allChecked =
    visible.length > 0 &&
    visible.every((e) => INSTRUMENTS.every((inst) => instrumentState[e.empId]?.[inst.key]));

  const selectStyle =
    'rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none';

  return (
    <div className="rounded-xl bg-panel p-4">
      {/* Filter bar — the list stays ONE group; these narrow it. */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Filter by name..."
          aria-label="Filter employees by name"
          value={fName}
          onChange={(e) => setFName(e.target.value)}
          className={`${selectStyle} min-w-[180px] flex-1`}
        />
        <select aria-label="Filter by title" value={fTitle} onChange={(e) => setFTitle(e.target.value)} className={selectStyle}>
          <option value="">All titles</option>
          {titles.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        {cities.length > 0 && (
          <select aria-label="Filter by location" value={fCity} onChange={(e) => setFCity(e.target.value)} className={selectStyle}>
            <option value="">All locations</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        {hasAges && (
          <span className="flex items-center gap-1">
            <input type="number" placeholder="Age min" aria-label="Minimum age" value={fAgeMin}
              onChange={(e) => setFAgeMin(e.target.value)} className={`${selectStyle} w-24`} />
            <span className="text-subtle">–</span>
            <input type="number" placeholder="max" aria-label="Maximum age" value={fAgeMax}
              onChange={(e) => setFAgeMax(e.target.value)} className={`${selectStyle} w-24`} />
          </span>
        )}
        {filtered && (
          <button
            onClick={() => { setFName(''); setFTitle(''); setFCity(''); setFAgeMin(''); setFAgeMax(''); }}
            className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:border-cyan-500"
          >
            Clear
          </button>
        )}
      </div>
      <div className="mb-2 text-sm text-muted">
        {filtered ? `Showing ${visible.length} of ${employees.length} employees` : `${employees.length} employees`}
      </div>

      {/* Header row — always visible; column checkboxes select the whole visible column */}
      <div className={`${GRID} sticky top-0 z-10 rounded-lg border border-slate-600 bg-slate-700/95 px-3 py-2 backdrop-blur`}>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">Employee</div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">Title</div>
        <div className="mr-7 flex items-center gap-2">
          {INSTRUMENTS.map((inst) => (
            <InstrumentCheckbox
              key={inst.key}
              label={inst.label}
              color={inst.color}
              borderColor={inst.color}
              checked={columnChecked(inst.key)}
              onChange={() => onBulkChange(visible.map((e) => e.empId), inst.key, !columnChecked(inst.key))}
            />
          ))}
          <InstrumentCheckbox
            label="ALL"
            color="rgba(255,255,255,0.9)"
            borderColor={CLI_TRICOLOR_GRADIENT}
            checked={allChecked}
            onChange={() => onBulkChange(visible.map((e) => e.empId), null, !allChecked)}
          />
        </div>
      </div>

      {/* Rows — one flat group, three aligned columns */}
      <div className="divide-y divide-slate-700/50">
        {visible.length === 0 && (
          <div className="p-4 text-sm text-subtle">No employees match the current filters.</div>
        )}
        {visible.map((emp) => {
          const state = instrumentState[emp.empId] || {};
          const rowAll = INSTRUMENTS.every((inst) => state[inst.key]);
          return (
            <div key={emp.empId} className={`${GRID} px-3 py-2.5 transition-colors hover:bg-slate-700/30`}>
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-semibold text-white">
                  {(emp.name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium text-white">{emp.name}</div>
                  <div className="truncate text-xs text-muted">{emp.email}</div>
                </div>
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm text-slate-300">{emp.designation || '—'}</div>
                {(emp.city || emp.age != null) && (
                  <div className="truncate text-xs text-subtle">
                    {[emp.city, emp.age != null ? `age ${emp.age}` : null].filter(Boolean).join(' · ')}
                  </div>
                )}
              </div>
              <div className="mr-7 flex items-center gap-2">
                {INSTRUMENTS.map((inst) => (
                  <InstrumentCheckbox
                    key={inst.key}
                    label={inst.label}
                    color={inst.color}
                    borderColor={inst.color}
                    checked={state[inst.key] || false}
                    onChange={() => onInstrumentChange(emp.empId, inst.key, !state[inst.key])}
                  />
                ))}
                <InstrumentCheckbox
                  label="ALL"
                  color="rgba(255,255,255,0.9)"
                  borderColor={CLI_TRICOLOR_GRADIENT}
                  checked={rowAll}
                  onChange={() => INSTRUMENTS.forEach((inst) => onInstrumentChange(emp.empId, inst.key, !rowAll))}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
