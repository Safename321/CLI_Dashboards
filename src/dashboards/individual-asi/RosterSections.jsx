// Expandable roster hierarchy: section (org group) → subgroup (seniority) → employees.
import EmployeeCard from './EmployeeCard.jsx';

export function ExpandableSubgroup({ subgroup, sectionId, subgroupIndex, expanded, setExpanded, instrumentState, onInstrumentChange }) {
  const subKey = `${sectionId}-${subgroupIndex}`;
  const isExpanded = expanded[subKey];

  return (
    <div className="ml-4 border-l-2 border-cyan-500/20">
      <button
        className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-slate-700/30"
        onClick={() => setExpanded((prev) => ({ ...prev, [subKey]: !isExpanded }))}
      >
        <span className="flex items-center gap-2">
          <span aria-hidden className={`text-sm transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
          <span className="font-medium text-slate-300">{subgroup.seniority}</span>
          <span className="text-xs text-subtle">({subgroup.employees.length})</span>
        </span>
      </button>

      {isExpanded && (
        <div className="ml-4">
          {subgroup.employees.map((emp, idx) => (
            <EmployeeCard
              key={idx}
              employee={emp}
              sectionId={subKey}
              employeeIndex={idx}
              instrumentState={instrumentState}
              onInstrumentChange={onInstrumentChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ExpandableSection({ section, sectionKey, expanded, setExpanded, instrumentState, onInstrumentChange }) {
  const isExpanded = expanded[sectionKey];

  return (
    <div className="overflow-hidden rounded-xl bg-panel">
      <button
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-700/50"
        onClick={() => setExpanded((prev) => ({ ...prev, [sectionKey]: !isExpanded }))}
      >
        <span className="flex items-center gap-3">
          <span aria-hidden className={`text-2xl transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
          <span className="text-xl" aria-hidden>{section.icon}</span>
          <span>
            <span className="block font-semibold text-white">{section.title}</span>
            <span className="block text-sm text-muted">{section.count} employees</span>
          </span>
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4">
          {section.subgroups.map((subgroup, idx) => (
            <ExpandableSubgroup
              key={idx}
              subgroup={subgroup}
              sectionId={sectionKey}
              subgroupIndex={idx}
              expanded={expanded}
              setExpanded={setExpanded}
              instrumentState={instrumentState}
              onInstrumentChange={onInstrumentChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
