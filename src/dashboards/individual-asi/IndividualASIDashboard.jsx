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
import FocalSetupPanel from './FocalSetupPanel.jsx';
import AssignRosterTable from './AssignRosterTable.jsx';

// Instrument keys that make an employee a 360 FOCAL (needs gender + evaluators).
const FOCAL_KEYS = ['360', 'a360'];
const isFocalRow = (chosen) => chosen.some((k) => FOCAL_KEYS.includes(k));

// Static demo roster is for the public onboarding demo only. A real company login
// shows its own employees, or instructions to onboard them — never demo people.
const DEMO_BUILD = import.meta.env.VITE_AUTH_DISABLED === 'true';

// Build the FLAT live employee list from /dashboard/roster. ONE group by design
// (client feedback 2026-08-25: no by-title sections — the table's filter bar
// narrows by name/title/location/age instead). empId is the stable `live-<id>`
// key, so selections survive filtering. Returns null when the roster is empty so
// the caller falls back to the static demo roster / onboarding instruction.
const buildLiveEmployees = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return null;
  return rows.map((r, idx) => ({
    name: [r.firstname, r.lastname].filter(Boolean).join(' ').trim() || r.email || 'Unknown',
    designation: r.designation || '',
    background: r.email || '',
    // Preserved for the assignment payload (POST /assignments needs userId or email).
    userId: r.id ?? r.userId ?? null,
    email: r.email || '',
    firstName: r.firstname || '',
    lastName: r.lastname || '',
    city: r.city || '',
    age: r.age ?? null,
    empId: `live-${r.id ?? r.userId ?? idx}`,
  }));
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
  // Per-focal 360 config, keyed by the same instrumentState key (empId or `search-<idx>`):
  //   { [key]: { gender: 'M'|'F', evaluatorIds: string[] } }
  const [focalConfig, setFocalConfig] = useState({});

  // Source the roster from the live /dashboard/roster endpoint, falling back to the
  // static demo roster when it's empty (unseeded tenant / fetch unavailable).
  const liveRows = useRoster();
  const liveEmployees = useMemo(() => buildLiveEmployees(liveRows), [liveRows]);
  // Demo build → demo roster; real login → live flat table, or {} (empty) so we
  // render an onboarding instruction below instead of demo people.
  const roster = liveEmployees ? {} : (DEMO_BUILD ? ASI_ROSTER : {});

  const allEmployees = useMemo(
    () => liveEmployees ?? flattenRoster(roster),
    [liveEmployees, roster]
  );

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
        if (id.startsWith('live-')) return;   // live table has no collapsible sections
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
    let focalIncomplete = false;
    let evaluatorTotal = 0;
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

      // 360 / a-360 focal: attach gender + evaluators picked from the roster.
      if (isFocalRow(chosen)) {
        const cfg = focalConfig[key] || {};
        row.gender = cfg.gender || 'M';
        const evalEmps = (cfg.evaluatorIds || [])
          .map((id) => allEmployees.find((e) => e.empId === id) || searchResults.find((e) => e.empId === id))
          .filter(Boolean);
        row.evaluators = evalEmps
          .map((e) => ({
            firstName: e.firstName || (e.name || '').split(' ')[0] || 'Unknown',
            lastName: e.lastName || (e.name || '').split(' ').slice(1).join(' ') || '-',
            email: e.email,
          }))
          .filter((e) => e.email);
        if (!cfg.gender || row.evaluators.length === 0) focalIncomplete = true;
        evaluatorTotal += row.evaluators.length;
      }
      rows.push(row);
    });

    if (!rows.length) {
      setSendError('Select at least one employee (with an email) and one instrument. The demo roster has no emails — sign in to a real tenant to dispatch.');
      return;
    }
    if (focalIncomplete) {
      setSendError('Each 360 assignment needs a focal gender and at least one evaluator (with an email) selected from the roster.');
      return;
    }
    setSending(true); setSendError(''); setSendOk('');
    try {
      const res = await assignInstruments({ assignments: rows, sendEmails: true, groupLabel: 'Dashboard assignment' });
      setShowConfirmModal(false);
      setInstrumentState({});
      setFocalConfig({});
      setSendOk(`Assigned to ${res.stubsCreated ?? rows.length} employee${rows.length === 1 ? '' : 's'}${res.emailsQueued ? ` · ${res.emailsQueued} invite email(s) sending in the background` : ''}${evaluatorTotal ? ` · incl. ${evaluatorTotal} 360 evaluator invite(s)` : ''}.`);
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

  // instrumentState keys whose checked instruments make the employee a 360 focal.
  const focalKeys = useMemo(
    () => Object.entries(instrumentState)
      .filter(([, insts]) => isFocalRow(Object.entries(insts || {}).filter(([, v]) => v).map(([k]) => k)))
      .map(([key]) => key),
    [instrumentState]
  );

  const totalEmployees = liveEmployees
    ? liveEmployees.length
    : Object.values(roster).reduce((sum, section) => sum + section.count, 0);

  // Live-table bulk change: ids are stable `live-<userId>` keys from the table's
  // currently VISIBLE (filtered) rows. instrumentKey null = every instrument (ALL).
  const handleTableBulkChange = (ids, instrumentKey, value) => {
    setInstrumentState((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        next[id] = { ...(next[id] || {}) };
        if (instrumentKey) next[id][instrumentKey] = value;
        else INSTRUMENTS.forEach((inst) => { next[id][inst.key] = value; });
      });
      return next;
    });
  };

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
  if (!DEMO_BUILD && !liveEmployees) {
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
      subtitle={`Assign CLI instruments to key personnel · ${totalEmployees} employees`}
    >
      <div className="space-y-6">
        {/* LIVE tenant: flat filterable table with an always-visible column-select header */}
        {liveEmployees && (
          <AssignRosterTable
            employees={liveEmployees}
            instrumentState={instrumentState}
            onInstrumentChange={handleInstrumentChange}
            onBulkChange={handleTableBulkChange}
          />
        )}

        {/* DEMO build: original search + sectioned roster */}
        {!liveEmployees && (
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
        )}

        {/* Search results with bulk-select row */}
        {!liveEmployees && searchQuery && searchResults.length > 0 && (
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

        {/* Roster sections (demo build only, hidden while searching) */}
        {!liveEmployees && !searchQuery && (
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

        {/* 360 / a-360 focal setup — one panel per selected focal (gender + evaluators) */}
        {focalKeys.length > 0 && (
          <div className="rounded-xl bg-panel p-4">
            <div className="mb-1 text-lg font-semibold text-white">360 Focal Setup</div>
            <div className="mb-3 text-sm text-muted">
              Each employee assigned a 360 or a-360 needs a gender and evaluators picked from your roster.
            </div>
            <div className="space-y-4">
              {focalKeys.map((key) => {
                const focal = resolveEmp(key);
                if (!focal) return null;
                return (
                  <FocalSetupPanel
                    key={key}
                    focal={focal}
                    roster={allEmployees}
                    value={focalConfig[key]}
                    onChange={(next) => setFocalConfig((prev) => ({ ...prev, [key]: next }))}
                  />
                );
              })}
            </div>
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
