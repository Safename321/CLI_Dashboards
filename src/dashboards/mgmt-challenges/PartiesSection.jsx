// Management Challenges — involved parties editor + candidate pool table
// (fit by mean, r² vs first party, inline-editable style scores).
import { STYLES, STYLE_ABBR, STYLES_FULL } from '../shared/StyleRadar.jsx';
import { PARTY_INSTRUMENTS } from '../../data/datasets/mgmt-challenges.js';

export const mean = (s) => (s.reduce((a, b) => a + b, 0) / s.length).toFixed(2);

export function fitLbl(m) {
  const v = parseFloat(m);
  if (v >= 7) return { t: 'Best Fit', cls: 'bg-green-400/15 text-green-400' };
  if (v >= 5.5) return { t: 'Good Fit', cls: 'bg-cyan-400/15 text-cyan-300' };
  if (v >= 4) return { t: 'Fair Fit', cls: 'bg-blue-500/20 text-sky-300' };
  return { t: 'Weak Fit', cls: 'bg-red-500/15 text-red-400' };
}

// Pearson r² of a party's scores vs the first party (reference)
export function calcR2(s, parties) {
  if (parties.length < 2) return null;
  const ref = parties[0].scores;
  const n = s.length;
  const xm = s.reduce((a, b) => a + b, 0) / n;
  const ym = ref.reduce((a, b) => a + b, 0) / n;
  const num = s.reduce((t, x, i) => t + (x - xm) * (ref[i] - ym), 0);
  const dx = Math.sqrt(s.reduce((t, x) => t + (x - xm) ** 2, 0));
  const dy = Math.sqrt(ref.reduce((t, y) => t + (y - ym) ** 2, 0));
  const r = dx * dy === 0 ? 0 : num / (dx * dy);
  return (r * r).toFixed(2);
}

const initials = (name) => name.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase();

export default function PartiesSection({ parties, overlaid, onToggleOverlay, onAddParty, onRemoveParty, onUpdateParty, onUpdateScore }) {
  const means = parties.map((p) => parseFloat(mean(p.scores)));
  const bestIdx = means.indexOf(Math.max(...means));

  return (
    <div className="mt-6">
      <h3 className="text-[13px] font-bold text-white">Involved Parties</h3>
      <p className="mb-2.5 text-xs text-muted">
        Assign ASI or A-ASI per party · Check to overlay on Peace Pad · OASI/A-OASI/360° overlays on the left panel
      </p>

      {/* Party editor rows */}
      <div className="flex flex-col gap-2">
        {parties.map((p) => (
          <div key={p.id} className="flex items-start gap-3 rounded-lg border border-border bg-panel p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: p.col }} aria-hidden>
              {initials(p.name)}
            </div>
            <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
              <div>
                <span className="mb-0.5 block text-[9px] uppercase tracking-wider text-muted">Name / Team</span>
                <input
                  value={p.name}
                  onChange={(e) => onUpdateParty(p.id, 'name', e.target.value)}
                  placeholder="Name or team"
                  className="w-full rounded border border-border bg-ink px-2 py-1 text-xs text-slate-200 outline-none focus:border-accent"
                />
              </div>
              <div>
                <span className="mb-0.5 block text-[9px] uppercase tracking-wider text-muted">Role / Title</span>
                <input
                  value={p.role}
                  onChange={(e) => onUpdateParty(p.id, 'role', e.target.value)}
                  placeholder="Role or dept"
                  className="w-full rounded border border-border bg-ink px-2 py-1 text-xs text-slate-200 outline-none focus:border-accent"
                />
              </div>
              <div>
                <span className="mb-0.5 block text-[9px] uppercase tracking-wider text-muted">CLI Instrument</span>
                <select
                  value={p.instrument}
                  onChange={(e) => onUpdateParty(p.id, 'instrument', e.target.value)}
                  className="w-full rounded border border-border bg-ink px-2 py-1 text-xs text-slate-200 outline-none focus:border-accent"
                >
                  {PARTY_INSTRUMENTS.map((i) => <option key={i}>{i}</option>)}
                </select>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <label className="flex cursor-pointer items-center gap-1 text-[9px] text-muted">
                <input type="checkbox" checked={overlaid.has(p.id)} onChange={() => onToggleOverlay(p.id)} style={{ accentColor: p.col }} />
                <span>Overlay</span>
              </label>
              <button onClick={() => onRemoveParty(p.id)} aria-label={`Remove ${p.name}`} className="rounded px-1.5 text-base leading-none text-muted hover:text-red-400">×</button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onAddParty} className="mt-2 w-full rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted hover:border-accent hover:text-accent">
        + Add Party / Team
      </button>

      {/* Pool table */}
      {parties.length > 0 && (
        <div className="mt-4 rounded-lg border border-border bg-panel p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-accent">Candidate Pool — Style Scores &amp; Fit Analysis</div>
          <div className="mb-2 text-[10px] text-muted">✓ Check to overlay on Peace Pad · Best alignment highlighted · Edit scores inline</div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-ink text-left text-[10px] font-semibold text-sky-300">
                  <th className="w-6 px-1 py-1.5" aria-label="Overlay" />
                  <th className="px-1.5 py-1.5">Party / Team</th>
                  <th className="px-1.5 py-1.5">Instr.</th>
                  <th className="px-1.5 py-1.5">FIT</th>
                  <th className="px-1.5 py-1.5 text-right" title="Pearson r²">r²</th>
                  {STYLE_ABBR.map((a, i) => <th key={a} className="px-1 py-1.5 text-right" title={STYLES_FULL[i]}>{a}</th>)}
                  <th className="px-1.5 py-1.5 text-right">Mean</th>
                </tr>
              </thead>
              <tbody>
                {parties.map((p, idx) => {
                  const m = mean(p.scores);
                  const r2 = calcR2(p.scores, parties);
                  const fl = fitLbl(m);
                  const r2col = r2 !== null ? (parseFloat(r2) >= 0.85 ? '#4ade80' : parseFloat(r2) >= 0.65 ? '#93c5fd' : '#7fb3d3') : '#7fb3d3';
                  return (
                    <tr key={p.id} className={`border-b border-border ${idx === bestIdx ? 'bg-green-400/5' : overlaid.has(p.id) ? 'bg-blue-500/5' : ''}`}>
                      <td className="px-1 py-1.5 text-center">
                        <input type="checkbox" checked={overlaid.has(p.id)} onChange={() => onToggleOverlay(p.id)} style={{ accentColor: p.col }} aria-label={`Overlay ${p.name}`} />
                      </td>
                      <td className="px-1.5 py-1.5">
                        <div className="flex items-center gap-1.5 font-semibold text-white">
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: p.col }} />
                          {p.name}{idx === bestIdx ? ' ★' : ''}
                        </div>
                        <div className="text-[10px] text-muted">{p.role}</div>
                      </td>
                      <td className="px-1.5 py-1.5">
                        <span className="rounded-full bg-violet-400/10 px-1.5 py-0.5 text-[9px] font-bold text-violet-300">{p.instrument}</span>
                      </td>
                      <td className="px-1.5 py-1.5">
                        <span className={`inline-block rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase ${fl.cls}`}>{fl.t}</span>
                      </td>
                      <td className="px-1.5 py-1.5 text-right font-mono font-bold" style={{ color: r2col }}>{r2 !== null ? r2 : '—'}</td>
                      {p.scores.map((v, i) => (
                        <td key={i} className="px-0.5 py-1">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={v}
                            onChange={(e) => onUpdateScore(p.id, i, e.target.value)}
                            aria-label={`${p.name} ${STYLES[i]} score`}
                            className="w-11 rounded border border-transparent bg-transparent px-0.5 py-0.5 text-right font-mono text-[11px] outline-none hover:border-border focus:border-accent"
                            style={{ color: v >= 7 ? '#eab308' : v >= 5 ? '#3b82f6' : '#cbd5e1' }}
                          />
                        </td>
                      ))}
                      <td className="px-1.5 py-1.5 text-right font-mono text-slate-300">{m}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
