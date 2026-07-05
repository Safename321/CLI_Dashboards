// Assign CLI Instruments — pick employees and dispatch CLI assessment instruments.
// Ported from legacy IndividualASIDashboard (App.jsx ~5576-5826). View id: individual-asi.
import { useEffect, useMemo, useState } from 'react';
import DashboardShell from '../../components/DashboardShell.jsx';
import { ASI_ROSTER } from '../../data/datasets/asi-roster.js';
import { useRoster, assignInstruments } from '../../lib/liveData.js';
import { INSTRUMENTS, CLI_TRICOLOR_GRADIENT } from './instruments.js';
import InstrumentCheckbox from './InstrumentCheckbox.jsx';
import ConfirmationModal from './ConfirmationModal.jsx';
import { ExpandableSection } from './RosterSections.jsx';
import EmployeeCard from './EmployeeCard.jsx';

// Static demo roster is for the public onboarding demo only. A real company login
// shows its own employees, or instructions to onboard them — never demo people.
const DEMO_BUILD = import.meta.env.VITE_AUTH_DISABLED === 'true';

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
    // Preserved for the assignment payload (POST /assignments needs userId or email).
    userId: r.id ?? r.userId ?? null,
    email: r.email || '',
    firstName: r.firstname || '',
    lastName: r.lastname || '',
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
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendOk, setSendOk] = useState('');

  // Source the roster from the live /dashboard/roster endpoint, falling back to the
  // static demo roster when it's empty (unseeded tenant / fetch unavailable).
  const liveRows = useRoster();
  const liveRoster = useMemo(() => buildLiveRoster(liveRows), [liveRows]);
  // Demo build → demo roster; real login → live roster, or {} (empty) so we render
  // an onboarding instruction below instead of demo people.
  const roster = liveRoster ?? (DEMO_BUILD ? ASI_ROSTER : {});

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

  // Resolve an instrumentState key back to its employee. Roster rows use the
  // "sectionKey-subIdx-empIdx" empId; search rows use "search-<idx>".
  const resolveEmp = (key) =>
    (key.startsWith('search-') ? searchResults[Number(key.split('-')[1])] : allEmployees.find((e) => e.empId === key));

  const handleSend = async () => {
    // One assignment row per selected employee, carrying the checked instruments.
    const rows = [];
    Object.entries(instrumentState).forEach(([key, insts]) => {
      const chosen = Object.entries(insts || {}).filter(([, v]) => v).map(([k]) => k);
      if (!chosen.length) return;
      const emp = resolveEmp(key);
      if (!emp) return;
      const row = { instruments: chosen };
      if (emp.userId) {
        row.userId = emp.userId;
      } else if (emp.email) {
        row.firstName = emp.firstName || (emp.name || '').split(' ')[0] || emp.name || 'Unknown';
        row.lastName = emp.lastName || (emp.name || '').split(' ').slice(1).join(' ') || '-';
        row.email = emp.email;
      } else {
        return; // demo roster row has no id/email — can't dispatch
      }
      if (emp.designation) row.designation = emp.designation;
      rows.push(row);
    });

    if (!rows.length) {
      setSendError('Select at least one employee (with an email) and one instrument. The demo roster has no emails — sign in to a real tenant to dispatch.');
      return;
    }
    setSending(true); setSendError(''); setSendOk('');
    try {
      const res = await assignInstruments({ assignments: rows, sendEmails: true, groupLabel: 'Dashboard assignment' });
      setShowConfirmModal(false);
      setInstrumentState({});
      setSendOk(`Assigned to ${res.stubsCreated ?? rows.length} employee${rows.length === 1 ? '' : 's'}${res.emailsQueued ? ` · ${res.emailsQueued} invite email(s) queued` : ''}.`);
    } catch (e) {
      setSendError(e.message || 'Assignment failed. Check your connection and try again.');
    } finally {
      setSending(false);
    }
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

  // Real company login with no employees yet: instruct onboarding, don't show demo people.
  if (!DEMO_BUILD && !liveRoster) {
    return (
      <DashboardShell title="Assign CLI Instruments" icon="👤" subtitle="Assign CLI instruments to your employees">
        <div className="mx-auto mt-10 max-w-xl rounded-xl border border-border bg-panel p-8">
          <p className="text-sm font-semibold text-amber-400">No employees in your organization yet.</p>
          <p className="mt-2 text-sm text-muted">Add your team before assigning instruments:</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-300">
            <li>Open <span className="font-semibold text-white">HRIS / Onboarding</span> to add employees manually, bulk-paste them, or import from your HRIS.</li>
            <li>Return here — your employees appear in the roster, ready to receive CLI instruments.</li>
          </ol>
        </div>
      </DashboardShell>
    );
  }

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
        <div className="flex flex-col items-center gap-3 pt-4">
          <button
            onClick={() => { setSendError(''); setSendOk(''); setShowConfirmModal(true); }}
            disabled={sending}
            className="rounded-lg bg-cyan-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? 'Sending…' : 'Commit'}
          </button>
          {sendError && <div className="max-w-lg rounded-lg border border-red-500/40 bg-red-900/20 px-4 py-2 text-center text-sm text-red-300">{sendError}</div>}
          {sendOk && <div className="max-w-lg rounded-lg border border-emerald-500/40 bg-emerald-900/20 px-4 py-2 text-center text-sm text-emerald-300">{sendOk}</div>}
        </div>

        <ConfirmationModal
          isOpen={showConfirmModal}
          sending={sending}
          onSend={handleSend}
          onCancel={() => setShowConfirmModal(false)}
        />

        <div className="py-4 text-center text-sm text-subtle">Last Updated: February 2026</div>
      </div>
    </DashboardShell>
  );
}
