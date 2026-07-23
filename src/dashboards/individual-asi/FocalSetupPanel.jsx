// Focal-person setup for a 360 / a-360 assignment: name the focal's gender and pick
// their evaluators from the company roster. Rendered when an employee's checked
// instruments include '360' or 'a360'. value = { gender, evaluatorIds: string[] }
// (evaluatorIds are roster empId strings). onChange(next) replaces the whole value.
import { useMemo, useState } from 'react';

export default function FocalSetupPanel({ focal, roster, value, onChange }) {
  const [query, setQuery] = useState('');
  const gender = value?.gender || '';
  const evaluatorIds = value?.evaluatorIds || [];

  const setGender = (g) => onChange({ gender: g, evaluatorIds });
  const toggleEvaluator = (empId) => {
    const next = evaluatorIds.includes(empId)
      ? evaluatorIds.filter((id) => id !== empId)
      : [...evaluatorIds, empId];
    onChange({ gender, evaluatorIds: next });
  };

  // Every roster employee except the focal themself (matched by empId, then email).
  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return roster.filter((e) => {
      if (e.empId === focal.empId) return false;
      if (focal.email && e.email && e.email.toLowerCase() === focal.email.toLowerCase()) return false;
      if (!q) return true;
      return (e.name || '').toLowerCase().includes(q) || (e.designation || '').toLowerCase().includes(q);
    });
  }, [roster, focal, query]);

  return (
    <div className="mt-3 rounded-lg border border-pink-500/30 bg-slate-800/50 p-4">
      <div className="mb-3 text-sm font-semibold text-pink-300">
        360 setup for {focal.name}
      </div>

      {/* Gender toggle (required) */}
      <div className="mb-4">
        <div className="mb-2 text-xs text-muted">Focal gender <span className="text-pink-400">*</span></div>
        <div className="flex items-center gap-2" role="radiogroup" aria-label={`Focal gender for ${focal.name}`}>
          {[{ v: 'M', label: 'Male' }, { v: 'F', label: 'Female' }].map((opt) => (
            <button
              key={opt.v}
              type="button"
              role="radio"
              aria-checked={gender === opt.v}
              onClick={() => setGender(opt.v)}
              className={`rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                gender === opt.v
                  ? 'border-cyan-500 bg-cyan-600 text-white'
                  : 'border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Evaluator multi-select */}
      <div>
        <div className="mb-2 text-xs text-muted">Evaluators <span className="text-pink-400">*</span></div>
        <input
          type="text"
          placeholder="Search evaluators by name or role..."
          aria-label={`Search evaluators for ${focal.name}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-2 w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
        />
        <div className="max-h-56 divide-y divide-slate-700/50 overflow-y-auto rounded-lg border border-slate-700">
          {candidates.length === 0 && (
            <div className="p-3 text-sm text-subtle">No matching employees.</div>
          )}
          {candidates.map((emp) => {
            const checked = evaluatorIds.includes(emp.empId);
            return (
              <label
                key={emp.empId}
                className="flex cursor-pointer items-center gap-3 p-2 transition-colors hover:bg-slate-700/30"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleEvaluator(emp.empId)}
                  className="h-4 w-4 shrink-0 accent-cyan-500"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-white">{emp.name}</span>
                  <span className="block truncate text-xs text-muted">{emp.designation}</span>
                </span>
                {!emp.email && (
                  <span className="shrink-0 text-xs text-amber-400" title="No email — cannot be invited">no email</span>
                )}
              </label>
            );
          })}
        </div>
        <div className="mt-2 text-xs text-subtle">{evaluatorIds.length} evaluator(s) selected</div>
      </div>
    </div>
  );
}
