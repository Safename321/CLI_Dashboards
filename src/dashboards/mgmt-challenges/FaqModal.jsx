// "What's this?" FAQ modal — overview of the Achieving Styles framework + CLI
// instruments, plus one reference page per challenge type (driven by PROBLEMS).
// The legacy embedded a base64 PDF download here; dropped per §4.3 — the same
// content renders natively below.
import { useState } from 'react';
import { PROBLEMS } from '../../data/datasets/mgmt-challenges.js';
import { DOMAIN_COLORS } from '../shared/StyleRadar.jsx';

const INSTRUMENT_GLANCE = [
  { n: 'ASI', what: 'Individual achieving style', use: 'Individual conflict & development' },
  { n: 'A-ASI', what: 'Adapted style under pressure', use: 'Stress-response & blind spots' },
  { n: 'OASI', what: 'Organizational rewarded behaviors', use: 'Culture & integration challenges' },
  { n: 'A-OASI', what: 'Aspirational organizational style', use: 'Culture change target state' },
  { n: 'ASI 360°', what: 'Multi-rater behavioral view', use: 'Leadership development' },
  { n: 'ASSET-T', what: 'Team collective profile', use: 'Team composition & integration' },
  { n: 'ASSET-P', what: 'Role behavioral requirements', use: 'Hiring & job fit' },
];

const STYLE_CLUSTERS = [
  { label: 'DIRECT', color: DOMAIN_COLORS.Direct, styles: ['Intrinsic', 'Competitive', 'Power'] },
  { label: 'INSTRUMENTAL', color: DOMAIN_COLORS.Instrumental, styles: ['Personal', 'Social', 'Entrusting'] },
  { label: 'RELATIONAL', color: DOMAIN_COLORS.Relational, styles: ['Collaborative', 'Contributory', 'Vicarious'] },
];

const levelBadge = (l) =>
  l === 'primary' ? 'bg-accent/15 text-accent' : 'bg-slate-500/15 text-slate-300';

function IntroPage() {
  return (
    <div>
      <p className="mb-4 text-sm leading-relaxed text-muted">
        The CLI Management Challenges dashboard uses the <strong className="text-slate-100">Achieving Styles™ framework</strong> to
        diagnose, visualize, and resolve the behavioral root causes of common management challenges. Unlike personality
        assessments, CLI measures <em>how</em> people achieve — external, observable behavior that is situational and changeable.
      </p>
      <div className="mb-4 rounded-lg border border-border bg-ink p-4">
        <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-accent">The 9 Achieving Styles</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {STYLE_CLUSTERS.map((c) => (
            <div key={c.label} className="rounded-r-md bg-panel px-3 py-2" style={{ borderLeft: `3px solid ${c.color}` }}>
              <div className="mb-1 text-[9px] font-extrabold" style={{ color: c.color }}>{c.label}</div>
              {c.styles.map((s) => (
                <div key={s} className="text-[11px] text-slate-300">· {s}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-border bg-ink p-4">
        <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-accent">CLI Instruments at a Glance</div>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="text-left text-[11px] text-sky-300">
              <th className="border-b border-border bg-panel px-2 py-1.5 font-semibold">Instrument</th>
              <th className="border-b border-border bg-panel px-2 py-1.5 font-semibold">What It Measures</th>
              <th className="border-b border-border bg-panel px-2 py-1.5 font-semibold">Best Used For</th>
            </tr>
          </thead>
          <tbody>
            {INSTRUMENT_GLANCE.map((r, i) => (
              <tr key={r.n} className={i % 2 ? 'bg-panel/60' : ''}>
                <td className="border-b border-border/50 px-2 py-1.5 font-bold text-brand">{r.n}</td>
                <td className="border-b border-border/50 px-2 py-1.5 text-slate-300">{r.what}</td>
                <td className="border-b border-border/50 px-2 py-1.5 text-muted">{r.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProblemPage({ p }) {
  return (
    <div>
      <div className="mb-4 pl-3" style={{ borderLeft: `4px solid ${p.color}` }}>
        <h2 className="text-lg font-bold text-slate-100">{p.icon} {p.name}</h2>
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: p.color }}>{p.instrument}</span>
      </div>

      <div className="mb-4">
        <div className="mb-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: p.color }}>Recommended Instruments</div>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="text-left text-[11px] text-sky-300">
              <th className="w-20 border-b border-border bg-panel px-2 py-1.5 font-semibold">Instrument</th>
              <th className="w-20 border-b border-border bg-panel px-2 py-1.5 font-semibold">Level</th>
              <th className="border-b border-border bg-panel px-2 py-1.5 font-semibold">Why Use It</th>
            </tr>
          </thead>
          <tbody>
            {p.instruments.map((ins, i) => (
              <tr key={ins.n} className={i % 2 ? 'bg-panel/60' : ''}>
                <td className="border-b border-border/50 px-2 py-1 font-bold text-brand">{ins.n}</td>
                <td className="border-b border-border/50 px-2 py-1">
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${levelBadge(ins.l)}`}>{ins.l}</span>
                </td>
                <td className="border-b border-border/50 px-2 py-1 text-slate-300">{ins.w}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-4">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: p.color }}>5 Common Variants</div>
        <div className="flex flex-col gap-1">
          {p.subtypes.map((s, i) => (
            <div key={i} className="flex gap-2 rounded bg-ink px-2.5 py-1.5 text-xs text-slate-300">
              <span className="min-w-[16px] font-bold" style={{ color: p.color }}>{i + 1}.</span>
              {s}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-red-900/60 bg-red-950/40 p-3">
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-red-400">⚠ Risks to Non-Involved Parties</div>
          {p.risks.map((r, i) => (
            <div key={i} className="flex gap-1.5 py-0.5 text-[11px] text-red-300"><span className="text-red-500">·</span>{r}</div>
          ))}
        </div>
        <div className="rounded-md border border-amber-900/60 bg-amber-950/40 p-3">
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">🎯 Organizational Goals at Stake</div>
          {p.goals.map((g, i) => (
            <div key={i} className="flex gap-1.5 py-0.5 text-[11px] text-amber-200"><span className="text-amber-500">·</span>{g}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FaqModal({ onClose }) {
  const [active, setActive] = useState('intro');
  const nav = [
    { id: 'intro', icon: '📖', label: 'Overview & Instruments', color: '#22d3ee' },
    ...PROBLEMS.map((p, i) => ({ id: p.id, icon: p.icon, label: `${String(i + 1).padStart(2, '0')} · ${p.name}`, color: p.color })),
  ];
  const problem = PROBLEMS.find((p) => p.id === active);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-label="Management Challenges guide"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex h-[91vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border bg-panel shadow-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-border bg-ink/60 px-4 py-3">
          <h2 className="text-sm font-semibold text-white">❓ Management Challenges — Guide</h2>
          <button onClick={onClose} aria-label="Close guide" className="text-muted hover:text-white">✕</button>
        </header>
        <div className="flex min-h-0 flex-1">
          <nav className="w-52 shrink-0 overflow-y-auto border-r border-border bg-ink py-1.5" aria-label="Guide sections">
            <div className="px-3 pb-1 pt-2 text-[9px] font-bold uppercase tracking-widest text-subtle">Sections</div>
            {nav.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11px] transition-colors ${
                  active === item.id ? 'bg-accent/10 text-slate-100' : 'text-muted hover:bg-panel hover:text-slate-100'
                }`}
                style={{ borderLeft: `3px solid ${active === item.id ? item.color : 'transparent'}` }}
              >
                <span aria-hidden>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="flex-1 overflow-y-auto p-6">
            {active === 'intro' ? (
              <>
                <h2 className="mb-3 text-lg font-bold text-slate-100">Overview — CLI Management Challenges</h2>
                <IntroPage />
              </>
            ) : problem ? (
              <ProblemPage p={problem} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
