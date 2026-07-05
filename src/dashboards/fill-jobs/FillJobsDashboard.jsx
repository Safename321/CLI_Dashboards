// Fill Jobs — ASSET-P Job Interpreter (native rebuild of the v1.24L embedded
// HTML tool; brief §4.3 option b). Interpret a job description into a 9-style
// ASSET-P profile, then match a 22-candidate pool against it with tolerance
// bands, fit ranking and radar overlays.
import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import DashboardShell from '../../components/DashboardShell.jsx';
import { CANDIDATES, CANDIDATE_COLORS, DEFAULT_ASSET, DEFAULT_JOB_META } from '../../data/datasets/fill-jobs.js';
import { useFillJobsBundle } from '../../lib/liveData.js';
import { rankCandidates, bandsForScores, scoreText, extractMeta, buildInterpretation } from './logic.js';
import ChartPanel from './ChartPanel.jsx';
import RightPanel from './RightPanel.jsx';
import CandidatePopup from './CandidatePopup.jsx';
import JobIntake from './JobIntake.jsx';

// The static demo pool is ONLY for the public demo build (VITE_AUTH_DISABLED).
// A real tenant sees live data or an explicit instructional state — never demo people.
const DEMO_BUILD = import.meta.env.VITE_AUTH_DISABLED === 'true';

export default function FillJobsDashboard() {
  // Live tenant data (GET /dashboard/fill-jobs-data): real ASI candidate profiles +
  // real ASSET-P role profiles from CLIRC-synced scores.
  const { data: live, status } = useFillJobsBundle(!DEMO_BUILD);
  const candidates = useMemo(
    () => (DEMO_BUILD
      ? CANDIDATES
      : (live?.candidates ?? []).map((c) => ({ ...c, name: c.name || c.email || `Candidate ${c.id}` }))),
    [live],
  );
  const isLive = !DEMO_BUILD && candidates.length > 0;
  // Stable candidate color assignment by array index (legacy colorMap)
  const COLOR_MAP = useMemo(() => {
    const m = {};
    candidates.forEach((c, i) => { m[c.id] = CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]; });
    return m;
  }, [candidates]);
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

  // Seed the jobs list once from the tenant's real ASSET-P role profiles (if any),
  // without clobbering jobs the user has already interpreted from a description.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current || !live?.roles?.length) return;
    seededRef.current = true;
    const seeded = live.roles.map((r) => ({
      id: `role-${r.id}`,
      title: r.title,
      loc: '',
      text: '',
      scores: r.scores,
    }));
    setJobs((js) => (js.length ? js : seeded));
    setActiveJobId((cur) => cur ?? seeded[0]?.id ?? null);
  }, [live]);

  const ranked = useMemo(() => rankCandidates(candidates, asset), [candidates, asset]);
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

  // Real tenant without usable data: explain exactly what to do — never show demo people.
  if (!DEMO_BUILD && !isLive) {
    const body = status === 'loading' ? (
      <p className="text-sm text-muted">Loading your organization's assessment data…</p>
    ) : status === 'error' ? (
      <>
        <p className="text-sm font-semibold text-red-400">Couldn't load your organization's assessment data.</p>
        <p className="mt-2 text-sm text-muted">
          Your session may have expired or the backend is unreachable. Refresh the page and sign in again —
          if it persists, contact your administrator.
        </p>
      </>
    ) : (
      <>
        <p className="text-sm font-semibold text-amber-400">No candidate profiles synced yet.</p>
        <p className="mt-2 text-sm text-muted">Fill Jobs ranks real employees by their CLI assessment scores. To populate it:</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-300">
          <li>Open <span className="font-semibold text-white">Assign CLI Instruments</span> and send the ASI instrument to your employees.</li>
          <li>Employees complete the assessment via the emailed magic link.</li>
          <li>Scores sync back automatically — candidates appear here, and completed ASSET-P role profiles appear as selectable positions.</li>
        </ol>
      </>
    );
    return (
      <DashboardShell
        title="Fill Jobs"
        icon="🎯"
        subtitle="ASSET-P Position Interpreter — match candidates to roles across 9 Achieving Styles"
      >
        <div className="mx-auto mt-10 max-w-xl rounded-xl border border-border bg-panel p-8">{body}</div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Fill Jobs"
      icon="🎯"
      subtitle="ASSET-P Position Interpreter — match candidates to roles across 9 Achieving Styles"
      actions={
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${isLive ? 'border-emerald-500/50 bg-emerald-900/20 text-emerald-400' : 'border-amber-500/50 bg-amber-900/20 text-amber-400'}`}>
            {isLive ? `Live tenant data · ${candidates.length} candidates` : 'Demo data — public demo build'}
          </span>
          <span className="rounded-full border border-border bg-ink px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-accent">
            CLI Certified Use Only
          </span>
        </div>
      }
    >
      <div ref={topRef} className="-m-6">
        {/* Job card */}
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-border bg-panel px-8 py-4">
          <div>
            <div className="font-mono text-xl font-bold text-white">
              {activeJob ? activeJob.title : (isLive ? 'Select a role below or interpret a job description ↓' : DEFAULT_JOB_META.title)}
            </div>
            <div className="mt-1 flex flex-wrap gap-5 text-xs text-muted">
              {(isLive
                ? [activeJob?.loc, 'Synced from CLIRC assessments'].filter(Boolean)
                : [DEFAULT_JOB_META.company, activeJob?.loc || DEFAULT_JOB_META.loc, DEFAULT_JOB_META.grade, DEFAULT_JOB_META.jobId, DEFAULT_JOB_META.posted]
              ).map((m) => (
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
