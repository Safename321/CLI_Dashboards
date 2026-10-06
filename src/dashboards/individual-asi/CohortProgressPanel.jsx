// Progress of one rollout (cohort) sent from the Assign screen — cli-backend R3.3.
// Polls GET /assignment-cohorts/{id} while it is queued or sending; offers Resume for
// failed / lost / stuck batches and Cancel for batches not yet sent.
import { useEffect, useRef, useState } from 'react';
import { assignmentCohortStatus, resumeAssignmentCohort, cancelAssignmentCohort } from '../../lib/liveData.js';
import { describeCohort } from './cohortProgress.js';

const POLL_MS = 5000;
const STALL_MS = 3 * 60 * 1000;   // no movement for this long while mid-send → offer Resume

const TONE = {
  ok: 'border-emerald-500/40 text-emerald-300',
  bad: 'border-red-500/40 text-red-300',
  muted: 'border-slate-600 text-muted',
  busy: 'border-cyan-500/40 text-cyan-300',
};
const BAR = { ok: 'bg-emerald-500', bad: 'bg-red-500', muted: 'bg-slate-500', busy: 'bg-cyan-500' };

// autoScroll: bring the panel into view once loaded (a rollout just sent from below the roster).
export default function CohortProgressPanel({ cohortId, onDismiss, onGone, autoScroll = false }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);              // bump to fetch again now
  const lastMove = useRef({ sig: '', at: Date.now() });
  const box = useRef(null);
  const loaded = data !== null;

  useEffect(() => {
    if (autoScroll && loaded) box.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [autoScroll, loaded]);

  useEffect(() => {
    let cancelled = false;
    let timer = null;
    const load = async () => {
      try {
        const res = await assignmentCohortStatus(cohortId);
        if (cancelled) return;
        setData(res); setError('');
        if (res.cohort?.status === 'sent') setNote('');   // "Retrying…" is stale once all sent
        const sig = JSON.stringify(res.cohort?.chunks || {});
        if (sig !== lastMove.current.sig) lastMove.current = { sig, at: Date.now() };
        if (['queued', 'sending'].includes(res.cohort?.status)) timer = setTimeout(load, POLL_MS);
      } catch (e) {
        if (cancelled) return;
        if (e.status === 404) { onGone?.(); return; }   // another tenant's, or deleted
        setError(e.message || 'Could not load the rollout status.');
        timer = setTimeout(load, POLL_MS * 2);
      }
    };
    load();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [cohortId, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (fn, describe) => {
    setBusy(true); setNote(''); setError('');
    try {
      setNote(describe(await fn(cohortId)));
      lastMove.current = { sig: '', at: Date.now() };
      setTick((t) => t + 1);
    } catch (e) {
      setError(e.message || 'Request failed.');
    } finally {
      setBusy(false);
    }
  };

  if (!data) {
    return (
      <div className="rounded-xl border border-slate-600 bg-panel p-4 text-sm text-muted">
        {error || `Loading rollout #${cohortId}…`}
      </div>
    );
  }

  const stalled = Date.now() - lastMove.current.at > STALL_MS;
  const v = describeCohort(data.cohort, { stalled });

  return (
    <div ref={box} className={`rounded-xl border bg-panel p-4 ${TONE[v.tone]}`} aria-live="polite">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-lg font-semibold text-white">
          Rollout #{data.cohort.id}{data.cohort.groupLabel ? ` · ${data.cohort.groupLabel}` : ''}
        </div>
        <div className="text-sm font-medium">{v.label}</div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-700" role="progressbar"
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={v.percent} aria-label="People sent">
        <div className={`h-full ${BAR[v.tone]} transition-all`} style={{ width: `${v.percent}%` }} />
      </div>

      <div className="mt-2 text-sm text-slate-300">
        {v.sentPeople} of {v.total} people sent · {v.chunksSent} of {v.chunksTotal} batches
        {v.chunksInFlight > 0 && ` · ${v.chunksInFlight} sending now`}
        {v.chunksWaiting > 0 && ` · ${v.chunksWaiting} waiting`}
        {v.chunksBroken > 0 && <span className="text-red-300">{` · ${v.chunksBroken} failed or unconfirmed`}</span>}
      </div>

      {v.status === 'queued' && (
        <p className="mt-2 text-xs text-muted">Batches are picked up by the background sender, which runs every minute.</p>
      )}
      {v.chunksBroken > 0 && (
        <p className="mt-2 text-xs text-muted">
          Resume sends the failed or unconfirmed batches again. It never creates a second set of
          links: anyone CLIRC already has is returned, not re-created.
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {v.canResume && (
          <button disabled={busy}
            onClick={() => act(resumeAssignmentCohort, (r) => (r.resumed
              ? `Retrying ${r.resumed} batch${r.resumed === 1 ? '' : 'es'}.`
              : 'Nothing to retry yet: every batch is sent or still in progress.'))}
            className="rounded-lg bg-cyan-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-cyan-500 disabled:opacity-60">
            Resume
          </button>
        )}
        {v.canCancel && (
          <button disabled={busy}
            onClick={() => {
              if (!window.confirm('Stop the batches not yet sent? People already sent keep their links.')) return;
              act(cancelAssignmentCohort, (r) => `Cancelled ${r.cancelledChunks} unsent batch${r.cancelledChunks === 1 ? '' : 'es'}.`);
            }}
            className="rounded-lg bg-slate-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-600 disabled:opacity-60">
            Cancel unsent
          </button>
        )}
        {!v.active && (
          <button onClick={onDismiss}
            className="rounded-lg bg-slate-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-600">
            Dismiss
          </button>
        )}
      </div>

      {note && <div className="mt-2 text-sm text-slate-300">{note}</div>}
      {error && <div className="mt-2 text-sm text-red-300">{error}</div>}
    </div>
  );
}
