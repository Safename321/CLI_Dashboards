// Employee row: avatar, name/role, per-instrument checkboxes, expandable background.
import { useState } from 'react';
import InstrumentCheckbox from './InstrumentCheckbox.jsx';
import { INSTRUMENTS, CLI_TRICOLOR_GRADIENT } from './instruments.js';

export default function EmployeeCard({ employee, sectionId, employeeIndex, instrumentState, onInstrumentChange }) {
  const [showDetails, setShowDetails] = useState(false);
  const { name, designation, background } = employee;
  const empId = `${sectionId}-${employeeIndex}`;
  const state = instrumentState[empId] || {};

  const allChecked = INSTRUMENTS.every((inst) => state[inst.key]);
  const handleAllChange = (checked) => {
    INSTRUMENTS.forEach((inst) => onInstrumentChange(empId, inst.key, checked));
  };

  return (
    <div className="border-b border-slate-700/50 last:border-0">
      <div className="flex items-center gap-3 p-3 transition-colors hover:bg-slate-700/30">
        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-semibold text-white">
          {name.split(' ').map((n) => n[0]).join('')}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 font-medium text-white">{name}</div>
          <div className="text-sm text-muted">{designation}</div>
        </div>

        {/* Instrument checkboxes */}
        <div className="flex items-center gap-2">
          {INSTRUMENTS.map((inst) => (
            <InstrumentCheckbox
              key={inst.key}
              label={inst.label}
              color={inst.color}
              borderColor={inst.color}
              checked={state[inst.key] || false}
              onChange={() => onInstrumentChange(empId, inst.key, !state[inst.key])}
            />
          ))}
          <InstrumentCheckbox
            label="ALL"
            color="rgba(255,255,255,0.9)"
            borderColor={CLI_TRICOLOR_GRADIENT}
            checked={allChecked}
            onChange={() => handleAllChange(!allChecked)}
          />
        </div>

        <button
          aria-label={showDetails ? `Hide details for ${name}` : `Show details for ${name}`}
          className={`ml-2 cursor-pointer text-sm text-subtle transition-transform ${showDetails ? 'rotate-180' : ''}`}
          onClick={() => setShowDetails(!showDetails)}
        >
          ⌄
        </button>
      </div>

      {showDetails && (
        <div className="ml-[52px] mt-3 border-l-2 border-cyan-500/30 pb-3 pl-3">
          <div className="rounded-lg bg-slate-800/50 p-3">
            <div className="mb-1 text-xs text-muted">Background</div>
            <div className="text-sm text-slate-300">{background}</div>
          </div>
        </div>
      )}
    </div>
  );
}
