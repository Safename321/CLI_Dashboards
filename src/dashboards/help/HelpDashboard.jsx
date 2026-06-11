// Help & Guide — multi-page documentation browser for the dashboard suite.
// Three-pane layout ported from v1.24L HelpDashboard (App.jsx 1769–2349):
// page nav | section nav | scrollable content. Page prose lives in
// data/datasets/help-content(-exec).js; the reference library is shared with
// the Further Reading dashboard.
import { useRef, useState } from 'react';
import DashboardShell from '../../components/DashboardShell.jsx';
import { HELP_NAV, HELP_PAGES_CORE } from '../../data/datasets/help-content.js';
import { HELP_PAGES_EXEC } from '../../data/datasets/help-content-exec.js';
import HelpPage, { Hdr } from './HelpPage.jsx';
import ReferenceLibrary from './ReferenceLibrary.jsx';

const HELP_PAGES = { ...HELP_PAGES_CORE, ...HELP_PAGES_EXEC };

export default function HelpDashboard() {
  const [activePage, setActivePage] = useState('overview');
  const [activeSecIdx, setActiveSecIdx] = useState(0);
  const contentRef = useRef(null);

  const page = HELP_PAGES[activePage];
  const showSecNav = activePage !== 'further-reading';
  const currentSecs = page ? page.sections.map((s) => s.heading) : [];

  const scrollToSec = (idx) => {
    setActiveSecIdx(idx);
    if (contentRef.current) {
      const el = contentRef.current.querySelectorAll('[data-sec-idx]')[idx];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <DashboardShell
      title="Help & Guide"
      icon="📖"
      subtitle="Documentation for every dashboard, grounded in the Achieving Styles™ framework"
    >
      <div className="flex h-full overflow-hidden rounded-lg border border-border bg-ink">
        {/* Page nav */}
        <nav className="w-48 shrink-0 overflow-y-auto border-r border-border bg-panel/40 py-2" aria-label="Help pages">
          {HELP_NAV.map((group) => (
            <div key={group.title}>
              <div className="px-3.5 pb-1 pt-2.5 text-[9px] font-bold uppercase tracking-widest text-muted">{group.title}</div>
              {group.items.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { setActivePage(item.id); setActiveSecIdx(0); }}
                    className={`flex w-full items-center gap-1.5 border-l-[3px] px-2.5 py-1.5 text-left text-[11px] ${
                      isActive
                        ? 'border-accent bg-accent/10 font-semibold text-white'
                        : 'border-transparent text-muted hover:text-white'
                    }`}
                  >
                    <span className="shrink-0 text-xs" aria-hidden>{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Section nav */}
        {showSecNav && (
          <nav className="w-44 shrink-0 overflow-y-auto border-r border-border py-2" aria-label="Page sections">
            <div className="px-3.5 pb-1.5 pt-2.5 text-[9px] font-bold uppercase tracking-widest text-accent">Sections</div>
            {currentSecs.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToSec(i)}
                className={`w-full border-l-[3px] px-3 py-1.5 text-left text-[11px] leading-snug ${
                  activeSecIdx === i
                    ? 'border-accent bg-accent/5 text-white'
                    : 'border-transparent text-muted hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </nav>
        )}

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto px-9 py-7">
          {activePage === 'further-reading'
            ? (
              <div className="flex h-full flex-col">
                <Hdr title="Further Reading" sub="CLI Reference Library · v1.24L" />
                <div className="min-h-0 flex-1"><ReferenceLibrary /></div>
              </div>
            )
            : page
              ? <HelpPage page={page} />
              : <div className="text-muted">Select a dashboard from the left.</div>}
        </div>
      </div>
    </DashboardShell>
  );
}
