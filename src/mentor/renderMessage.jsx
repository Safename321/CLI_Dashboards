// Renders mentor (CLAIM) messages with embedded action deep-links.
// Syntax emitted by the model (instructed in system-prompt.md):
//   [[LINK:visible text|nav-id|instrument|group]]
//   e.g. [[LINK:top 50 leaders|individual-asi|ASI360|top50]]
// group: 'top50' | 'all' → deep-link with a pre-selection payload
// ({ employeeIds, instrument }, consumed by the Assign Instruments dashboard);
// empty group → pure navigation (no pre-selection).
import { getTop50Leaders } from '../data/datasets/asi-roster.js';

const LINK_SPLIT = /(\[\[LINK:[^\]]+\]\])/g;
const LINK_PARSE = /\[\[LINK:([^|]+)\|([^|]+)\|([^|]+)\|([^\]]*)\]\]/;

export default function renderMentorMessage(content, onDeepLink, onNavigate) {
  if (!content) return null;
  const parts = content.split(LINK_SPLIT);
  return (
    <span>
      {parts.map((part, i) => {
        const m = part.match(LINK_PARSE);
        if (!m) {
          return (
            <span key={i} className="whitespace-pre-wrap">
              {part}
            </span>
          );
        }
        const [, label, navId, instrument, group] = m;
        const handleClick = () => {
          // empty employeeIds means "all employees" on the target dashboard.
          let sel = null;
          if (group === 'top50') sel = { employeeIds: getTop50Leaders(), instrument };
          else if (group === 'all') sel = { employeeIds: [], instrument };
          if (group && group !== '' && onDeepLink) onDeepLink(navId, sel);
          else if (onNavigate) onNavigate(navId);
        };
        return (
          <button
            key={i}
            type="button"
            onClick={handleClick}
            className="mx-px inline cursor-pointer rounded border border-sky-400/40 bg-sky-400/15 px-1.5 py-px text-[13px] font-semibold text-sky-400 underline decoration-dotted hover:bg-sky-400/25"
          >
            {label} ↗
          </button>
        );
      })}
    </span>
  );
}
