// Fill Jobs — ASSET-P Job Interpreter (native rebuild of the v1.24L embedded
// HTML tool; brief §4.3 option b). Interpret a job description into a 9-style
// ASSET-P profile, then match a 22-candidate pool against it with tolerance
// bands, fit ranking and radar overlays.
import { useMemo, useRef, useState, useCallback } from 'react';
import DashboardShell from '../../components/DashboardShell.jsx';
import { CANDIDATES, CANDIDATE_COLORS, DEFAULT_ASSET, DEFAULT_JOB_META } from '../../data/datasets/fill-jobs.js';
import { rankCandidates, bandsForScores, scoreText, extractMeta, buildInterpretation } from './logic.js';
import ChartPanel from './ChartPanel.jsx';
import RightPanel from './RightPanel.jsx';
import CandidatePopup from './CandidatePopup.jsx';
import JobIntake from './JobIntake.jsx';

// Stable candidate color assignment by original array index (legacy colorMap)
const COLOR_MAP = {};
CANDIDATES.forEach((c, i) => { COLOR_MAP[c.id] = CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]; });

export default function FillJobsDashboard() {
  const [jobs, setJobs] = useState([]);
  const [activeJobId, setActiveJobId] = useState(null);
  const [finalists, setFinalists] = useState(() => new Set());
  const [popupChecked, setPopupChecked] = useState(() => new Set());
  const [dashChecked, setDashChecked] = useState(() => new Set());
  const [popupOpen, setPopupOpen] = useState(false);
  const [interpretation, setInterpretation] = useState(null); // { title, paras }
  const [banner, setBanner] = useState('');
  const intakeRef = useRef(null);
  const topRef = useRef(null);
  const bannerTimer = useRef(null);

  const showBanner = useCallback((msg) => {
    setBanner('✓ ' + msg);
    clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => setBanner(''), 3000);
  }, []);

  const activeJob = jobs.find((j) => j.id === activeJobId) || null;
  const asset = useMemo(
    () => (activeJob ? { scores: activeJob.scores, bands: bandsForScores(activeJob.scores) } : DEFAULT_ASSET),
    [activeJob],
  );

  const ranked = useMemo(() => rankCandidates(CANDIDATES, asset), [asset]);
  const pool = useMemo(
    () => (finalists.size > 0 ? ranked.filter((c) => finalists.has(c.id)) : ranked),
    [ranked, finalists],
  );

  const addJob = useCallback((text) => {
    const scores = scoreText(text);
    const { title, loc } = extractMeta(text);
    const id = Date.now();
    setJobs((js) => [...js, { id, title, loc, text, scores }]);
    setActiveJobId(id);
    setInterpretation({ title, paras: buildInterpretation(title, scores, bandsForScores(scores)) });
    showBanner('Interpreted: ' + title);
  }, [showBanner]);

  const activateJob = useCallback((id) => {
    setActiveJobId(id);
    const job = jobs.find((j) => j.id === id);
    if (job) {
      setInterpretation({ title: job.title, paras: buildInterpretation(job.title, job.scores, bandsForScores(job.scores)) });
      showBanner('Interpreted: ' + job.title);
    }
  }, [jobs, showBanner]);

  const toggleDash = useCallback((id) => {
    setDashChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const commitFinalists = useCallback(() => {
    setFinalists(new Set(popupChecked));
    setDashChecked(new Set());
    setPopupOpen(false);
  }, [popupChecked]);

  const fillThisPosition = useCallback(() => {
    if (!activeJob) return;
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => showBanner('Now filling: ' + activeJob.title), 400);
  }, [activeJob, showBanner]);

  const statTop = Math.max(...asset.scores).toFixed(1);
  const statMean = (asset.scores.reduce((a, b) => a + b, 0) / 9).toFixed(2);

  return (
    <DashboardShell
      title="Fill Jobs"
      icon="🎯"
      subtitle="ASSET-P Position Interpreter — match candidates to roles across 9 Achieving Styles"
      actions={
        <span className="rounded-full border border-border bg-ink px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-accent">
          CLI Certified Use Only
        </span>
      }
    >
      <div ref={topRef} className="-m-6">
        {/* Job card */}
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-border bg-panel px-8 py-4">
          <div>
            <div className="font-mono text-xl font-bold text-white">{activeJob ? activeJob.title : DEFAULT_JOB_META.title}</div>
            <div className="mt-1 flex flex-wrap gap-5 text-xs text-muted">
              {[DEFAULT_JOB_META.company, activeJob?.loc || DEFAULT_JOB_META.loc, DEFAULT_JOB_META.grade, DEFAULT_JOB_META.jobId, DEFAULT_JOB_META.posted].map((m) => (
                <span key={m} className="flex items-center gap-1.5">
                  <span className="inline-block h-1 w-1 rounded-full bg-accent" />
                  {m}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-6">
            {[
              { val: statTop, lbl: 'Top style score' },
              { val: statMean, lbl: 'Cumulative mean' },
              { val: pool.length, lbl: 'Candidates' },
              { val: dashChecked.size, lbl: 'Overlaid' },
            ].map((s, i) => (
              <div key={s.lbl} className={`text-center ${i > 0 ? 'border-l border-border pl-6' : ''}`}>
                <div className="font-mono text-xl text-accent">{s.val}</div>
                <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Setup bar */}
        <div className="flex flex-wrap items-center gap-2.5 border-b border-border bg-panel/60 px-8 py-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Setup</span>
          <span className={`flex-1 text-xs ${activeJob ? 'text-slate-200' : 'italic text-muted'}`}>
            {activeJob ? `📋 ${activeJob.title}${activeJob.loc ? ' · ' + activeJob.loc : ''}` : 'No job loaded — scroll down to add one ↓'}
          </span>
          <button
            onClick={() => intakeRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="rounded-md border border-border bg-ink px-4 py-1.5 text-xs font-semibold text-slate-100 hover:border-accent"
          >
            ⚡ Add Job
          </button>
          <button
            onClick={() => setPopupOpen(true)}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
          >
            + Add Candidate
          </button>
          <span className="text-[11px] italic text-muted">Scores derived from job description via CLI ASSET methodology</span>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[440px_1fr]">
          <ChartPanel
            asset={asset}
            overlays={ranked.filter((c) => dashChecked.has(c.id)).map((c) => ({ ...c, color: COLOR_MAP[c.id] }))}
            jobs={jobs}
            activeJobId={activeJobId}
            onActivateJob={activateJob}
            onFillPosition={fillThisPosition}
          />
          <RightPanel asset={asset} pool={pool} dashChecked={dashChecked} onToggle={toggleDash} colorMap={COLOR_MAP} />
        </div>

        {/* Bottom: job management + interpretation */}
        <div ref={intakeRef}>
          <JobIntake
            jobs={jobs}
            activeJob={activeJob}
            activeJobId={activeJobId}
            onActivateJob={activateJob}
            onAddJob={addJob}
            onFillPosition={fillThisPosition}
            interpretation={interpretation}
          />
        </div>

        <footer className="flex justify-between border-t border-border px-8 py-3 text-[10px] text-subtle">
          <span>© 2026 Connective Leadership Institute · ASSET-P · CLI-Certified Practitioner Use Only</span>
          <span>Dashboard v2.0 · {DEFAULT_JOB_META.company}</span>
        </footer>
      </div>

      {popupOpen && (
        <CandidatePopup
          asset={asset}
          candidates={ranked}
          checked={popupChecked}
          onChecked={setPopupChecked}
          colorMap={COLOR_MAP}
          onDone={commitFinalists}
        />
      )}

      {banner && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-accent bg-panel px-4 py-2 text-sm text-slate-100 shadow-xl">
          {banner}
        </div>
      )}
    </DashboardShell>
  );
}
