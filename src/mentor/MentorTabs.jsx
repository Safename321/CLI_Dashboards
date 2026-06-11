// Mentor tab row — 15 mode pills in 5 labeled groups, with a hover tooltip
// showing each mode's description (legacy v1.24L layout).
import { useState } from 'react';
import { MENTOR_TABS, MENTOR_TAB_GROUPS } from '../data/datasets/mentor-content.js';

export default function MentorTabs({ activeTab, onSelect, disabled }) {
  const [hoveredTab, setHoveredTab] = useState(null);
  const hovered = hoveredTab ? MENTOR_TABS.find((t) => t.id === hoveredTab) : null;

  return (
    <div className="relative shrink-0 border-b border-border/70 px-3 py-2" style={{ overflow: 'visible' }}>
      <div className="flex flex-wrap items-center gap-1.5">
        {MENTOR_TAB_GROUPS.map((g, gIdx) => {
          const tabsInGroup = MENTOR_TABS.filter((t) => t.group === g.id);
          if (tabsInGroup.length === 0) return null;
          return (
            <span key={g.id} className="contents">
              {gIdx > 0 && <span className="mx-1 h-[18px] w-px self-center bg-border" aria-hidden="true" />}
              <span
                className="mr-1 select-none self-center text-[9px] uppercase tracking-[0.7px] text-subtle"
              >
                {g.label}
              </span>
              {tabsInGroup.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onSelect(tab)}
                    onMouseEnter={() => setHoveredTab(tab.id)}
                    onMouseLeave={() => setHoveredTab(null)}
                    disabled={disabled}
                    style={{
                      borderColor: isActive ? tab.color : 'rgba(100,116,139,0.4)',
                      color: isActive ? '#fff' : '#94a3b8',
                      backgroundColor: isActive ? tab.color : 'transparent',
                    }}
                    className="relative flex items-center gap-1.5 rounded-md border-2 px-3 py-2 text-[13px] font-medium transition-all hover:opacity-90 disabled:opacity-40"
                  >
                    <span className="text-[14px]">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </span>
          );
        })}
      </div>

      {/* Hover tooltip — positioned absolutely below the tab row */}
      {hovered && (
        <div
          className="pointer-events-none absolute left-3 right-3 top-full z-[60] mt-1 rounded-lg bg-ink px-3.5 py-2.5 shadow-2xl"
          style={{ border: `2px solid ${hovered.color}` }}
        >
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-[16px]">{hovered.icon}</span>
            <span className="text-[13px] font-bold" style={{ color: hovered.color }}>
              {hovered.label}
            </span>
            <span className="text-[9px] uppercase tracking-[0.7px] text-subtle">· {hovered.group}</span>
          </div>
          <div className="text-[12px] leading-[1.55] text-slate-300">{hovered.description}</div>
        </div>
      )}
    </div>
  );
}
