// Management Challenges — challenge type grid (21 cards with hover tooltip),
// variant selector and the challenge-context fields.
import { useState } from 'react';
import { PROBLEMS, CHALLENGE_DESC, OUTCOME_OPTIONS, TIMEFRAME_OPTIONS } from '../../data/datasets/mgmt-challenges.js';

function ChallengeTooltip({ probId, pos }) {
  const p = PROBLEMS.find((x) => x.id === probId);
  if (!p) return null;
  const pad = 14;
  const w = 380;
  const h = 300;
  let x = pos.x + 18;
  let y = pos.y + 18;
  if (typeof window !== 'undefined') {
    if (x + w + pad > window.innerWidth) x = pos.x - w - 18;
    if (y + h + pad > window.innerHeight) y = window.innerHeight - h - pad;
  }
  if (x < pad) x = pad;
  if (y < pad) y = pad;
  return (
    <div
      className="pointer-events-none fixed z-50 w-[380px] rounded-lg border border-border border-l-4 bg-panel p-4 shadow-2xl"
      style={{ left: x, top: y, borderLeftColor: p.color }}
      role="tooltip"
    >
      <div className="mb-2 flex items-center gap-2.5">
        <span className="text-xl" aria-hidden>{p.icon}</span>
        <div>
          <div className="text-sm font-bold text-white">{p.name}</div>
          <div className="font-mono text-[10px] font-bold" style={{ color: p.color }}>{p.instrument}</div>
        </div>
      </div>
      <div className="mb-2 text-[11px] leading-relaxed text-slate-300">{CHALLENGE_DESC[p.id] || ''}</div>
      <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-accent">5 Common Variants</div>
      <div className="flex flex-col gap-0.5">
        {p.subtypes.map((s, i) => (
          <div key={i} className="flex gap-1.5 text-[10px] text-muted">
            <span className="font-bold" style={{ color: p.color }}>{i + 1}.</span>
            <span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChallengeGrid({ selProb, selSub, onSelectProb, onSelectSub, fields, onFields }) {
  const [tip, setTip] = useState(null); // { id, x, y }

  return (
    <div>
      <h2 className="text-sm font-bold text-white">Select Management Challenge</h2>
      <p className="mb-3 text-xs text-muted">Choose from 21 challenge types, each with 5 variants · Hover any card for a full description</p>

      {/* Card grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7">
        {PROBLEMS.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectProb(p)}
            onMouseEnter={(e) => setTip({ id: p.id, x: e.clientX, y: e.clientY })}
            onMouseMove={(e) => setTip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : t))}
            onMouseLeave={() => setTip(null)}
            className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-colors ${
              selProb?.id === p.id ? 'border-accent bg-ink' : 'border-border bg-panel hover:border-accent/50'
            }`}
          >
            <span className="text-xl" aria-hidden>{p.icon}</span>
            <span className="text-[11px] font-semibold leading-tight text-slate-100">{p.name}</span>
            <span className="font-mono text-[9px] font-bold leading-tight" style={{ color: p.color }}>{p.instrument}</span>
          </button>
        ))}
      </div>
      {tip && <ChallengeTooltip probId={tip.id} pos={tip} />}

      {/* Variant selector */}
      {selProb && (
        <div className="mt-4">
          <div className="mb-2 text-xs font-semibold text-slate-200">{selProb.name} — Select variant</div>
          <div className="flex flex-col gap-1">
            {selProb.subtypes.map((s, i) => (
              <button
                key={i}
                onClick={() => onSelectSub({ i, text: s })}
                className={`flex items-center gap-2.5 rounded-md border px-3 py-1.5 text-left text-xs transition-colors ${
                  selSub?.i === i ? 'border-accent bg-ink text-white' : 'border-border text-slate-300 hover:bg-ink'
                }`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-panel font-mono text-[10px] font-bold text-accent">{i + 1}</span>
                <span>{s}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Context fields */}
      {selProb && (
        <div className="mt-5 rounded-lg border border-border bg-panel p-4">
          <div className="mb-2.5 text-[13px] font-bold text-white">Challenge Context</div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted">Describe the problem</label>
          <textarea
            value={fields.desc}
            onChange={(e) => onFields((f) => ({ ...f, desc: e.target.value }))}
            placeholder="What is happening? When did it start? What have you tried?"
            className="mb-3 min-h-[60px] w-full rounded-md border border-border bg-ink p-2.5 text-xs text-slate-200 outline-none focus:border-accent"
          />
          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted">Desired outcome</label>
              <select
                value={fields.outcome}
                onChange={(e) => onFields((f) => ({ ...f, outcome: e.target.value }))}
                className="w-full rounded-md border border-border bg-ink p-2 text-xs text-slate-200 outline-none focus:border-accent"
              >
                <option value="">— Select outcome —</option>
                {OUTCOME_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted">Timeframe</label>
              <select
                value={fields.timeframe}
                onChange={(e) => onFields((f) => ({ ...f, timeframe: e.target.value }))}
                className="w-full rounded-md border border-border bg-ink p-2 text-xs text-slate-200 outline-none focus:border-accent"
              >
                <option value="">— Select timeframe —</option>
                {TIMEFRAME_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted">Organizational goals at stake</label>
          <textarea
            value={fields.orgGoals}
            onChange={(e) => onFields((f) => ({ ...f, orgGoals: e.target.value }))}
            placeholder="What objectives are impacted if this is not resolved?"
            className="min-h-[45px] w-full rounded-md border border-border bg-ink p-2.5 text-xs text-slate-200 outline-none focus:border-accent"
          />
        </div>
      )}
    </div>
  );
}
