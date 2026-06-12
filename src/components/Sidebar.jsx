// Left navigation — redrawn to match v1.24L: role-based, independently
// collapsible sections (CEO, CFO, CSO, …) each with a descriptor, section
// dividers, rotating chevrons, alert badges, and a blue active marker. Collapse
// state persists to localStorage (default: only CEO expanded). Fonts and colors
// mirror v1.24L exactly.
import { useState } from 'react';
import { NAV_SECTIONS } from '../config/nav.js';
import { APP_VERSION_LABEL } from '../config/version.js';
import { assetUrl } from '../lib/apiBase.js';

// v1.24L palette
const SIDEBAR_BG = '#0c1e35';
const SIDEBAR_BORDER = '#1e3a5f';
const TEXT_COLOR = '#f1f5f9';
const TEXT_MUTED = '#7fb3d3';
const ACTIVE_BG = '#1e3a5f';
const ACTIVE_BAR = '#2E5090'; // CLI blue
const ALERT_RED = '#C41E3A';

const DATA_YEARS = [2022, 2023, 2024, 2025];
const COLLAPSE_KEY = 'cli_collapsed_role_sections_v2';
// Default: every section collapsed except CEO.
const DEFAULT_COLLAPSED = NAV_SECTIONS.reduce(
  (acc, s) => ({ ...acc, [s.title]: s.title !== 'CEO' }),
  {},
);

export default function Sidebar({ active, onNav, tenant, email, onLogout, authDisabled, selectedYear, onYearChange }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem(COLLAPSE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_COLLAPSED;
    } catch {
      return DEFAULT_COLLAPSED;
    }
  });

  const toggle = (title) =>
    setCollapsed((prev) => {
      const next = { ...prev, [title]: !prev[title] };
      try { localStorage.setItem(COLLAPSE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });

  return (
    <div
      className="flex w-56 shrink-0 flex-col overflow-y-auto"
      style={{ backgroundColor: SIDEBAR_BG, borderRight: `1px solid ${SIDEBAR_BORDER}` }}
    >
      {/* Header — logo + brand, click to go Home (overview) */}
      <button
        onClick={() => onNav('overview')}
        className="p-4 text-left"
        style={{ borderBottom: `1px solid ${SIDEBAR_BORDER}`, background: 'transparent', cursor: 'pointer' }}
        title="Home"
      >
        <div className="flex items-center gap-3">
          <img src={assetUrl('cli-wheel.png')} alt="CLI" style={{ width: 40, height: 40 }} />
          <span style={{ color: '#E00000', fontFamily: "'Arial Black','Arial',sans-serif", fontWeight: 800, fontSize: '30px', lineHeight: '34px' }}>
            The Future
          </span>
        </div>
        <div className="mt-2" style={{ color: TEXT_MUTED, fontSize: '12px' }}>
          Connective Leadership Dashboards
        </div>
      </button>

      {/* Role sections */}
      <nav className="flex-1 overflow-y-auto py-1">
        {NAV_SECTIONS.map((section, si) => {
          const isCollapsed = !!collapsed[section.title];
          return (
            <div key={section.title} className="mb-0">
              {si > 0 && (
                <div
                  style={{ height: '2px', backgroundColor: SIDEBAR_BORDER, marginTop: '10px', marginLeft: '12px', marginRight: '60px', borderRadius: '1px' }}
                />
              )}
              <div
                className="select-none px-3"
                style={{ paddingTop: '8px', paddingBottom: '4px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}
                onClick={() => toggle(section.title)}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#13294a'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                title={isCollapsed ? 'Click to expand' : 'Click to collapse'}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: TEXT_COLOR, fontSize: '15px', lineHeight: '18px', fontWeight: 700 }}>{section.title}</div>
                  {section.descriptor && (
                    <div style={{ color: TEXT_MUTED, fontSize: '10px', lineHeight: '13px', marginTop: '1px' }}>{section.descriptor}</div>
                  )}
                </div>
                <span style={{ color: TEXT_MUTED, fontSize: '11px', lineHeight: '18px', transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform .18s ease', flexShrink: 0, marginTop: '1px' }}>▾</span>
              </div>

              {!isCollapsed && section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNav(item.id)}
                  aria-current={active === item.id ? 'page' : undefined}
                  className={'flex w-full items-center gap-2 px-3 py-1 text-left transition-all duration-200 ' + (active === item.id ? 'border-l-2' : '')}
                  style={{
                    backgroundColor: active === item.id ? ACTIVE_BG : 'transparent',
                    color: active === item.id ? TEXT_COLOR : TEXT_MUTED,
                    borderLeftColor: active === item.id ? ACTIVE_BAR : 'transparent',
                  }}
                  onMouseOver={(e) => {
                    if (active !== item.id) { e.currentTarget.style.backgroundColor = ACTIVE_BG; e.currentTarget.style.color = TEXT_COLOR; }
                  }}
                  onMouseOut={(e) => {
                    if (active !== item.id) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = TEXT_MUTED; }
                  }}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="flex-1 truncate text-xs">{item.label}</span>
                  {item.alerts > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: ALERT_RED }}>
                      {item.alerts}
                    </span>
                  )}
                </button>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Footer — account, version, data year */}
      <div className="space-y-2 px-3 py-2">
        {!authDisabled && email && (
          <button
            onClick={onLogout}
            style={{ width: '100%', background: 'transparent', border: '1px solid #475569', color: '#94a3b8', fontSize: '11px', fontWeight: 600, padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', textAlign: 'center' }}
            onMouseOver={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = '#f87171'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#475569'; }}
            title={email}
          >
            ⏻ Logout
          </button>
        )}
        <div className="text-center font-mono text-xs" style={{ color: TEXT_MUTED }}>{APP_VERSION_LABEL}</div>
      </div>

      {onYearChange && (
        <div className="p-2" style={{ borderTop: `1px solid ${SIDEBAR_BORDER}` }}>
          <div className="flex items-center justify-between gap-2 px-1">
            <span style={{ color: '#94a3b8', fontSize: '12px' }}>Data Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="rounded border bg-transparent px-2 py-0.5 text-xs"
              style={{ borderColor: SIDEBAR_BORDER, color: TEXT_COLOR }}
            >
              {DATA_YEARS.map((y) => (
                <option key={y} value={y} style={{ color: '#000' }}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
