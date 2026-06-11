// About CLI — Achieving Styles™ framework reference (Direct / Relational /
// Instrumental sets with per-style deep dives, resources, and stats).
// Ported from v1.24L AboutCLIDashboard (App.jsx 8936–9133).
import { useState } from 'react';
import DashboardShell from '../components/DashboardShell.jsx';
import { Panel } from '../components/primitives.jsx';
import {
  ABOUT_INTRO,
  ABOUT_FOOTNOTE,
  STYLE_SET_TABS,
  STYLE_SET_CONTENT,
} from '../data/datasets/about-cli-content.js';

const STATS = [
  { value: 3, label: 'SETS OF STYLES', className: 'border-blue-500/30 bg-blue-500/10 text-blue-400' },
  { value: 3, label: 'STYLES PER SET', className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
  { value: 9, label: 'TOTAL STYLES', className: 'border-purple-500/30 bg-purple-500/10 text-purple-400' },
];

const RESOURCES = [
  {
    key: 'website',
    icon: '🌐',
    title: 'ConnectiveLeadership.com',
    desc: "Learn more about CLI's behavioral measurement methodology and engagement model.",
    href: 'https://www.connectiveleadership.com',
    badge: 'Live',
  },
  {
    key: 'android',
    icon: '📱',
    title: 'CLI App · Google Play',
    desc: "Download the CLI behavioral measurement app for Android — measure your team's OASI scores in the field.",
    badge: 'Coming soon',
  },
  {
    key: 'ios',
    icon: '🍎',
    title: 'CLI App · Apple App Store',
    desc: "Download the CLI behavioral measurement app for iOS — measure your team's OASI scores in the field.",
    badge: 'Coming soon',
  },
];

function ResourceCard({ res }) {
  const inner = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-2xl" aria-hidden>{res.icon}</span>
        <span
          className={`rounded px-2 py-0.5 text-xs font-semibold ${
            res.href ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-400/15 text-amber-400'
          }`}
        >
          {res.badge}
        </span>
      </div>
      <div>
        <div className={`text-sm font-semibold ${res.href ? 'text-accent' : 'text-slate-300'}`}>{res.title}</div>
        <div className={`mt-1 text-xs ${res.href ? 'text-muted' : 'text-subtle'}`}>{res.desc}</div>
      </div>
    </>
  );
  if (res.href) {
    return (
      <a
        href={res.href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col gap-2 rounded-lg border border-accent/30 bg-accent/5 p-4 no-underline transition-colors hover:bg-accent/15"
      >
        {inner}
      </a>
    );
  }
  return (
    <div className="flex cursor-not-allowed flex-col gap-2 rounded-lg border border-amber-400/30 bg-panel/40 p-4" title="Coming soon — app store URL pending">
      {inner}
    </div>
  );
}

export default function AboutCLIDashboard() {
  const [activeTab, setActiveTab] = useState('direct');
  const [activeSubTab, setActiveSubTab] = useState('intrinsic');

  const currentTab = STYLE_SET_TABS.find((t) => t.id === activeTab);
  const content = STYLE_SET_CONTENT[activeTab];

  return (
    <DashboardShell title="About CLI" icon="ℹ️" subtitle="Achieving Styles™ Framework">
      <div className="space-y-6">
        {/* Introduction */}
        <Panel title="Achieving Styles™">
          <div className="space-y-4 text-sm text-slate-300">
            {ABOUT_INTRO.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </Panel>

        {/* Resources & links */}
        <Panel title="Resources & Links">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {RESOURCES.map((res) => <ResourceCard key={res.key} res={res} />)}
          </div>
        </Panel>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className={`rounded-lg border p-6 text-center ${s.className}`}>
              <div className="mb-2 text-5xl font-bold">{s.value}</div>
              <div className="text-sm text-slate-300">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Style set tabs */}
        <div className="overflow-hidden rounded-lg border border-border bg-panel/50">
          <div className="flex border-b border-border" role="tablist" aria-label="Achieving Style sets">
            {STYLE_SET_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => { setActiveTab(tab.id); setActiveSubTab(tab.subtabs[0]); }}
                className={`flex-1 px-6 py-4 font-semibold transition-all ${
                  activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-muted hover:bg-ink hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            <p className="mb-6 text-sm text-slate-300">{content.main}</p>

            <div className="mb-4 flex gap-2" role="tablist" aria-label="Styles in this set">
              {currentTab.subtabs.map((subtab) => (
                <button
                  key={subtab}
                  type="button"
                  role="tab"
                  aria-selected={activeSubTab === subtab}
                  onClick={() => setActiveSubTab(subtab)}
                  className={`rounded-lg px-4 py-2 font-medium capitalize transition-all ${
                    activeSubTab === subtab
                      ? 'bg-emerald-600 text-white'
                      : 'bg-ink text-muted hover:bg-border hover:text-white'
                  }`}
                >
                  {subtab}
                </button>
              ))}
            </div>

            <div className="rounded-lg bg-black/30 p-5">
              <h3 className="mb-3 text-xl font-bold capitalize text-emerald-400">{activeSubTab}</h3>
              <p className="text-sm leading-relaxed text-slate-300">{content[activeSubTab]}</p>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
          <p className="text-sm text-slate-300">
            <strong className="text-blue-400">Note:</strong> {ABOUT_FOOTNOTE}
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
