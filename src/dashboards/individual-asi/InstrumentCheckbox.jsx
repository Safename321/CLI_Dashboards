// Single labeled instrument checkbox with the tri-color CLI checkmark.
import { CLI_TRICOLOR_GRADIENT } from './instruments.js';

export default function InstrumentCheckbox({ label, color, borderColor, checked, onChange }) {
  return (
    <span className="group flex cursor-pointer flex-col items-center">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={`${label} instrument`}
        className="flex h-5 w-5 items-center justify-center rounded border-2 bg-white transition-all"
        style={{ borderColor }}
        onClick={(e) => {
          e.stopPropagation();
          onChange?.(e);
        }}
      >
        {checked && <span className="h-3 w-3 rounded-sm" style={{ background: CLI_TRICOLOR_GRADIENT }} />}
      </button>
      <span className="mt-1 text-xs transition-colors" style={{ color }}>{label}</span>
    </span>
  );
}
