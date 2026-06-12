// Management Challenges — CLI Achieving Styles "Peace Pad" tool (native
// rebuild of the v1.24L embedded HTML app; brief §4.3 option b).
// Select one of 21 challenge types → variant → add parties (SPGI people DB or
// custom) → overlay ASI/org-instrument profiles on the Peace Pad radar →
// behavioral gap analysis → downloadable resolution report.
import { useState, useRef, useCallback } from 'react';
import DashboardShell from '../../components/DashboardShell.jsx';
import { STYLES } from '../shared/StyleRadar.jsx';
import { PROBLEMS, PARTY_COLORS, PEOPLE_DB } from '../../data/datasets/mgmt-challenges.js';
import PeacePadPanel from './PeacePadPanel.jsx';
import ChallengeGrid from './ChallengeGrid.jsx';
import PartiesSection from './PartiesSection.jsx';
import AnalysisSection from './AnalysisSection.jsx';
import PeoplePopup from './PeoplePopup.jsx';
import FaqModal from './FaqModal.jsx';
import { generateReport } from './report.js';

const EMPTY_FIELDS = { desc: '', outcome: '', timeframe: '', orgGoals: '', notes: '' };

export default function MgmtChallengesDashboard() {
  const [selProbId, setSelProbId] = useState(null);
  const [selSub, setSelSub] = useState(null); // { i, text }
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [parties, setParties] = useState([]);
  const [overlaid, setOverlaid] = useState(() => new Set());
  const [instrOverlays, setInstrOverlays] = useState(() => new Set());
  const [saved, setSaved] = useState([]);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [reportOpts, setReportOpts] = useState({ summary: true, behavioral: true, instruments: true, risks: true, playbook: false, cli: false });
  const [banner, setBanner] = useState('');
  const bannerTimer = useRef(null);
  const partySeqRef = useRef(0); // unique party-id counter (component-scoped, §4.4)

  const selProb = PROBLEMS.find((p) => p.id === selProbId) || null;

  const showBanner = useCallback((msg) => {
    setBanner(msg);
    clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => setBanner(''), 2200);
  }, []);

  const selectProb = useCallback((p) => {
    setSelProbId(p.id);
    setSelSub(null);
    setActiveChallenges((prev) => (prev.includes(p.id) ? prev : [...prev, p.id]));
  }, []);

  const addParty = useCallback((name, role, instrument, scores) => {
    setParties((prev) => {
      const col = PARTY_COLORS[prev.length % PARTY_COLORS.length];
      const sc = scores || STYLES.map(() => parseFloat((4.5 + Math.random() * 3).toFixed(1)));
      return [...prev, {
        id: 'p' + Date.now() + '-' + partySeqRef.current++,
        name: name || 'Party ' + String.fromCharCode(65 + prev.length),
        role: role || '',
        instrument: instrument || 'ASI',
        scores: sc,
        col,
      }];
    });
  }, []);

  const removeParty = useCallback((id) => {
    setParties((prev) => prev.filter((p) => p.id !== id));
    setOverlaid((prev) => { const n = new Set(prev); n.delete(id); return n; });
  }, []);

  const updateParty = useCallback((id, field, value) => {
    setParties((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }, []);

  const updateScore = useCallback((id, idx, val) => {
    const v = Math.max(0, Math.min(10, parseFloat(val) || 0));
    setParties((prev) => prev.map((p) => (p.id === id ? { ...p, scores: p.scores.map((s, i) => (i === idx ? v : s)) } : p)));
  }, []);

  const toggleOverlay = useCallback((id) => {
    setOverlaid((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  const overlayAll = useCallback(() => {
    setOverlaid(new Set(parties.map((p) => p.id)));
    showBanner('All parties overlaid');
  }, [parties, showBanner]);

  const toggleInstr = useCallback((k) => {
    setInstrOverlays((prev) => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });
  }, []);

  const commitPeople = useCallback((keys) => {
    keys.forEach((key) => {
      const [gi, pi] = key.split('-').map(Number);
      const grp = PEOPLE_DB[gi];
      const person = grp?.people[pi];
      if (person && !parties.find((p) => p.name === person.name)) {
        addParty(person.name, person.role, grp.type === 'team' ? 'OASI' : 'ASI', null);
      }
    });
    setPeopleOpen(false);
    showBanner('Parties added');
  }, [parties, addParty, showBanner]);

  const saveChallenge = useCallback(() => {
    if (!selProb) { showBanner('Select a challenge type first'); return; }
    setSaved((prev) => [...prev, { prob: selProb.name, sub: selSub ? selSub.text : '', parties: parties.map((p) => p.name).join(', ') }]);
    showBanner('Challenge saved');
  }, [selProb, selSub, parties, showBanner]);

  const clearAll = useCallback(() => {
    setSelProbId(null); setSelSub(null); setParties([]);
    setOverlaid(new Set()); setInstrOverlays(new Set()); setFields(EMPTY_FIELDS);
    showBanner('Cleared');
  }, [showBanner]);

  const runReport = useCallback(() => {
    if (!selProb) { showBanner('Select a challenge type first'); return; }
    generateReport({ prob: selProb, sub: selSub, fields, parties, opts: reportOpts });
    showBanner('Report downloaded!');
  }, [selProb, selSub, fields, parties, reportOpts, showBanner]);

  // Challenge-bar stats
  const gaps = parties.length >= 2 ? STYLES.map((_, i) => Math.abs(parties[0].scores[i] - parties[1].scores[i])) : null;
  const avgGap = gaps ? (gaps.reduce((a, b) => a + b, 0) / 9).toFixed(1) : null;
  const risk = avgGap === null ? '—' : parseFloat(avgGap) >= 3 ? 'High' : parseFloat(avgGap) >= 1.5 ? 'Med' : 'Low';

  return (
    <DashboardShell
      title="Management Challenges"
      icon="⚡"
      subtitle="CLI Achieving Styles Framework — Behavioral conflict resolution & organizational alignment"
      actions={
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-border bg-ink px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-accent">CLI Certified Use Only</span>
          <button onClick={() => setFaqOpen(true)} className="rounded-md border border-border bg-ink px-3 py-1 text-xs text-slate-200 hover:border-accent">
            ❓ What&apos;s this?
          </button>
        </div>
      }
    >
      <div className="-m-6">
        {/* Challenge bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-panel px-8 py-3">
          <div>
            <div className="text-base font-bold text-white">{selProb ? selProb.name + (selSub ? ': ' + selSub.text : '') : 'Select a management challenge below'}</div>
            <div className="mt-0.5 flex gap-4 text-[11px] text-muted">
              <span>{selProb ? selProb.name : 'No challenge selected'}</span>
              <span>{parties.length} parties</span>
              <span>{selProb ? selProb.instrument : 'No instruments assigned'}</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            {[
              { val: avgGap ?? '—', lbl: 'Style Gap' },
              { val: parties.length, lbl: 'Parties' },
              { val: risk, lbl: 'Risk Level' },
              { val: overlaid.size + instrOverlays.size, lbl: 'Overlaid' },
            ].map((s, i) => (
              <div key={s.lbl} className={`text-center ${i > 0 ? 'border-l border-border pl-5' : ''}`}>
                <div className="font-mono text-lg text-accent">{s.val}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Setup bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-panel/60 px-8 py-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Setup</span>
          <button onClick={() => (selProb ? setPeopleOpen(true) : showBanner('Select a challenge type first'))} className="rounded-md border border-border bg-ink px-3 py-1.5 text-xs font-semibold text-slate-100 hover:border-accent">👥 Involved Parties</button>
          <button onClick={() => addParty()} className="rounded-md border border-border bg-ink px-3 py-1.5 text-xs font-semibold text-slate-100 hover:border-accent">+ Custom Party</button>
          <button onClick={overlayAll} className="rounded-md bg-accent/20 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/30">▲ Overlay on Peace Pad</button>
          <button onClick={runReport} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500">📄 Generate Report</button>
          <span className="text-[11px] italic text-muted">Select a challenge · Add parties · Overlay profiles · Generate report</span>
        </div>

        {/* Main */}
        <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr]">
          <PeacePadPanel
            selProb={selProb}
            selSub={selSub}
            fields={fields}
            parties={parties}
            overlaid={overlaid}
            instrOverlays={instrOverlays}
            onToggleInstr={toggleInstr}
            activeChallenges={activeChallenges}
            onSelectChallenge={(id) => { const p = PROBLEMS.find((x) => x.id === id); if (p) selectProb(p); }}
          />
          <div className="overflow-y-auto p-6">
            <ChallengeGrid selProb={selProb} selSub={selSub} onSelectProb={selectProb} onSelectSub={setSelSub} fields={fields} onFields={setFields} />
            {selProb && (
              <>
                <PartiesSection parties={parties} overlaid={overlaid} onToggleOverlay={toggleOverlay} onAddParty={() => addParty()} onRemoveParty={removeParty} onUpdateParty={updateParty} onUpdateScore={updateScore} />
                <AnalysisSection selProb={selProb} parties={parties} reportOpts={reportOpts} onReportOpts={setReportOpts} onGenerate={runReport} />
              </>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="grid grid-cols-1 border-t-2 border-border lg:grid-cols-[280px_1fr]">
          <div className="border-r border-border bg-panel/60 px-4 py-4">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-accent">Saved Challenges</div>
            <div className="flex max-h-32 flex-col gap-1.5 overflow-y-auto">
              {saved.length === 0 ? (
                <div className="text-[10px] italic text-muted">No saved challenges</div>
              ) : (
                saved.map((s, i) => (
                  <div key={i} className="rounded-md border border-border bg-ink px-2.5 py-1.5">
                    <div className="text-xs font-medium text-slate-100">{s.prob}</div>
                    <div className="truncate text-[10px] text-muted">{s.parties}</div>
                  </div>
                ))
              )}
            </div>
            <button onClick={saveChallenge} className="mt-2 w-full rounded-md border border-border bg-ink px-3 py-1.5 text-[11px] font-semibold text-slate-100 hover:border-accent">💾 Save Challenge</button>
          </div>
          <div className="flex flex-col bg-panel px-6 py-4">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-accent">Notes &amp; Additional Context</div>
            <textarea
              value={fields.notes}
              onChange={(e) => setFields((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Add background context, prior interventions attempted, political sensitivities..."
              aria-label="Notes and additional context"
              className="min-h-[70px] flex-1 rounded-md border border-border bg-ink p-3 text-xs text-slate-200 outline-none focus:border-accent"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button onClick={clearAll} className="rounded-md border border-border px-3 py-1.5 text-xs text-slate-300 hover:border-red-400 hover:text-red-300">Clear All</button>
              <button onClick={runReport} className="rounded-md bg-accent/20 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/30">Generate Report</button>
            </div>
          </div>
        </div>

        <footer className="flex flex-wrap justify-between gap-2 border-t border-border px-8 py-3 text-[10px] text-subtle">
          <span>Connective Leadership Institute — Management Challenges Dashboard</span>
          <span>CLI v2.0 · ASSET-P Framework · CLI Certified Use Only</span>
          <span>connectiveleadership.com</span>
        </footer>
      </div>

      {peopleOpen && <PeoplePopup parties={parties} onDone={commitPeople} />}
      {faqOpen && <FaqModal onClose={() => setFaqOpen(false)} />}
      {banner && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-accent bg-panel px-4 py-2 text-sm text-slate-100 shadow-xl">✓ {banner}</div>
      )}
    </DashboardShell>
  );
}
