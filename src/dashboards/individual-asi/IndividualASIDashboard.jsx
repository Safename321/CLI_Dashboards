// Assign CLI Instruments — pick employees and dispatch CLI assessment instruments.
// Ported from legacy IndividualASIDashboard (App.jsx ~5576-5826). View id: individual-asi.
import { useEffect, useMemo, useState } from 'react';
import DashboardShell from '../../components/DashboardShell.jsx';
import { ASI_ROSTER } from '../../data/datasets/asi-roster.js';
import { useRoster } from '../../lib/liveData.js';
import { INSTRUMENTS, CLI_TRICOLOR_GRADIENT } from './instruments.js';
import InstrumentCheckbox from './InstrumentCheckbox.jsx';
import ConfirmationModal from './ConfirmationModal.jsx';
import { ExpandableSection } from './RosterSections.jsx';
import EmployeeCard from './EmployeeCard.jsx';

// Build the nested roster shape ({ sectionKey: { title, count, subgroups:[...] } })
// the view consumes from the live flat roster (/dashboard/roster →
// [{ id, firstname, lastname, email }]). Returns null when the roster is empty so the
// caller falls back to the static demo roster (keeps unseeded tenants rendering).
const buildLiveRoster = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const employees = rows.map((r) => ({
    name: [r.firstname, r.lastname].filter(Boolean).join(' ').trim() || r.email || 'Unknown',
    designation: r.designation || r.email || '',
    background: r.email || '',
  }));
  return {
    company: {
      title: 'Company Roster',
      icon: '👥',
      count: employees.length,
      subgroups: [{ seniority: 'All Employees', employees }],
    },
  };
};

// Flat list of every employee with its stable empId ("sectionKey-subIdx-empIdx")
const flattenRoster = (roster) => {
  const all = [];
  Object.entries(roster).forEach(([key, section]) => {
    section.subgroups.forEach((subgroup, subIdx) => {
      subgroup.employees.forEach((emp, empIdx) => {
        all.push({
          ...emp,
          section: section.title,
          seniority: subgroup.seniority,
          empId: `${key}-${subIdx}-${empIdx}`,
          sectionKey: key,
        });
      });
    });
  });
  return all;
};

// preSelection (mentor deep-link): { employeeIds: string[], instrument } —
// empty employeeIds means "all employees".
export default function IndividualASIDashboard({ preSelection = null }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState({});
  const [instrumentState, setInstrumentState] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Source the roster from the live /dashboard/roster endpoint, falling back to the
  // static demo roster when it's empty (unseeded tenant / fetch unavailable).
  const liveRows = useRoster();
  const roster = useMemo(() => buildLiveRoster(liveRows) ?? ASI_ROSTER, [liveRows]);

  const allEmployees = useMemo(() => flattenRoster(roster), [roster]);

  // Apply mentor deep-link pre-selection: check the instrument for the targeted
  // employees and expand the sections/subgroups that contain them.
  useEffect(() => {
    if (!preSelection?.instrument) return;
    const ids = preSelection.employeeIds?.length
      ? preSelection.employeeIds
      : allEmployees.map((e) => e.empId);
    setInstrumentState((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        next[id] = { ...(next[id] || {}), [preSelection.instrument]: true };
      });
      return next;
    });
    setExpanded((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        const [sectionKey, subIdx] = id.split('-');
        next[sectionKey] = true;
        next[`${sectionKey}-${subIdx}`] = true;
      });
      return next;
    });
  }, [preSelection, allEmployees]);

  const handleInstrumentChange = (employeeId, instrumentKey, value) => {
    setInstrumentState((prev) => ({
      ...prev,
      [employeeId]: { ...(prev[employeeId] || {}), [instrumentKey]: value },
    }));
  };

  const handleSend = () => {
    console.log('Sending instruments:', instrumentState);
    // TODO: POST instrumentState to the CLI instrument-dispatch API once specified.
    setShowConfirmModal(false);
    setInstrumentState({});
  };

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return allEmployees.filter(
      (emp) => emp.name.toLowerCase().includes(q) || emp.designation.toLowerCase().includes(q)
    );
  }, [searchQuery, allEmployees]);

  const totalEmployees = Object.values(roster).reduce((sum, section) => sum + section.count, 0);

  const handleBulkInstrumentChange = (instrumentKey, value) => {
    setInstrumentState((prev) => {
      const next = { ...prev };
      searchResults.forEach((emp, idx) => {
        const id = `search-${idx}`;
        next[id] = { ...(next[id] || {}), [instrumentKey]: value };
      });
      return next;
    });
  };

  const handleBulkAllChange = (value) => {
    setInstrumentState((prev) => {
      const next = { ...prev };
      searchResults.forEach((emp, idx) => {
        const id = `search-${idx}`;
        next[id] = { ...(next[id] || {}) };
        INSTRUMENTS.forEach((inst) => { next[id][inst.key] = value; });
      });
      return next;
    });
  };

  const everyResultChecked = (instKey) =>
    searchResults.every((emp, idx) => instrumentState[`search-${idx}`]?.[instKey]);
  const everyResultAllChecked = searchResults.every((emp, idx) =>
    INSTRUMENTS.every((inst) => instrumentState[`search-${idx}`]?.[inst.key])
  );

  return (
    <DashboardShell
      title="Assign CLI Instruments"
      icon="👤"
      alerts={2}
      subtitle={`Assign CLI instruments to key personnel · ${totalEmployees} employees across 3 sections`}
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="rounded-xl bg-panel p-4">
          <input
            type="text"
            placeholder="Search by name or role..."
            aria-label="Search employees by name or role"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Search results with bulk-select row */}
        {searchQuery && searchResults.length > 0 && (
          <div className="rounded-xl bg-panel p-4">
            <div className="mb-3 text-sm text-muted">{searchResults.length} results for "{searchQuery}"</div>

            <div className="mb-3 flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-3">
              <div className="flex flex-1 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-600 text-lg text-muted" aria-hidden>✓</div>
                <div>
                  <div className="font-medium text-slate-300">Select All</div>
                  <div className="text-sm text-subtle">Apply to all {searchResults.length} results</div>
                </div>
              </div>

              {/* mr-7 aligns the bulk checkboxes with the employee rows below */}
              <div className="mr-7 flex items-center gap-2">
                {INSTRUMENTS.map((inst) => (
                  <InstrumentCheckbox
                    key={inst.key}
                    label={inst.label}
                    color={inst.color}
                    borderColor={inst.color}
                    checked={everyResultChecked(inst.key)}
                    onChange={() => handleBulkInstrumentChange(inst.key, !everyResultChecked(inst.key))}
                  />
                ))}
                <InstrumentCheckbox
                  label="ALL"
                  color="rgba(255,255,255,0.9)"
                  borderColor={CLI_TRICOLOR_GRADIENT}
                  checked={everyResultAllChecked}
                  onChange={() => handleBulkAllChange(!everyResultAllChecked)}
                />
              </div>
            </div>

            <div className="divide-y divide-slate-700/50">
              {searchResults.map((emp, idx) => (
                <EmployeeCard
                  key={emp.empId}
                  employee={emp}
                  sectionId="search"
                  employeeIndex={idx}
                  instrumentState={instrumentState}
                  onInstrumentChange={handleInstrumentChange}
                />
              ))}
            </div>
          </div>
        )}

        {/* Roster sections (hidden while searching) */}
        {!searchQuery && (
          <div className="space-y-4">
            {Object.entries(roster).map(([key, section]) => (
              <ExpandableSection
                key={key}
                section={section}
                sectionKey={key}
                expanded={expanded}
                setExpanded={setExpanded}
                instrumentState={instrumentState}
                onInstrumentChange={handleInstrumentChange}
              />
            ))}
          </div>
        )}

        {/* Commit */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setShowConfirmModal(true)}
            className="rounded-lg bg-cyan-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-cyan-500"
          >
            Commit
          </button>
        </div>

        <ConfirmationModal
          isOpen={showConfirmModal}
          onSend={handleSend}
          onCancel={() => setShowConfirmModal(false)}
        />

        <div className="py-4 text-center text-sm text-subtle">Last Updated: February 2026</div>
      </div>
    </DashboardShell>
  );
}
