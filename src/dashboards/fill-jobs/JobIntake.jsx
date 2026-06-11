// Fill Jobs — bottom job-management section: open positions, paste/upload a
// job description (.txt or .docx), interpreted-job display and the CLI
// behavioral interpretation panel. The .docx text extraction uses the
// browser-native DecompressionStream (no JSZip / external CDN).
import { useState } from 'react';
import { ScoresGrid } from './RightPanel.jsx';
import { BAND_KEY } from '../../data/datasets/fill-jobs.js';

// Minimal .docx reader: locate word/document.xml in the zip central directory,
// inflate it with DecompressionStream('deflate-raw'), strip <w:t> tags.
async function extractDocx(buf) {
  try {
    const view = new DataView(buf);
    const bytes = new Uint8Array(buf);
    // End-of-central-directory record (signature 0x06054b50), scan from the end
    let eocd = -1;
    for (let i = buf.byteLength - 22; i >= 0; i--) {
      if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) return '';
    const count = view.getUint16(eocd + 10, true);
    let off = view.getUint32(eocd + 16, true);
    const dec = new TextDecoder();
    for (let n = 0; n < count; n++) {
      if (view.getUint32(off, true) !== 0x02014b50) break;
      const method = view.getUint16(off + 10, true);
      const compSize = view.getUint32(off + 20, true);
      const nameLen = view.getUint16(off + 28, true);
      const extraLen = view.getUint16(off + 30, true);
      const commentLen = view.getUint16(off + 32, true);
      const localOff = view.getUint32(off + 42, true);
      const name = dec.decode(bytes.subarray(off + 46, off + 46 + nameLen));
      if (name === 'word/document.xml') {
        const lNameLen = view.getUint16(localOff + 26, true);
        const lExtraLen = view.getUint16(localOff + 28, true);
        const start = localOff + 30 + lNameLen + lExtraLen;
        const data = bytes.subarray(start, start + compSize);
        let xml;
        if (method === 8) {
          const ds = new DecompressionStream('deflate-raw');
          xml = await new Response(new Blob([data]).stream().pipeThrough(ds)).text();
        } else {
          xml = dec.decode(data);
        }
        const tags = xml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
        return tags.map((t) => t.replace(/<[^>]+>/g, '')).join(' ');
      }
      off += 46 + nameLen + extraLen + commentLen;
    }
    return '';
  } catch (err) {
    console.error('[FillJobs] docx extraction failed:', err);
    return '';
  }
}

export default function JobIntake({ jobs, activeJob, activeJobId, onActivateJob, onAddJob, onFillPosition, interpretation }) {
  const [paste, setPaste] = useState('');
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(true);

  const submit = (text) => {
    if (!text || text.trim().length < 40) {
      setError('Could not read text. Try pasting the description directly (min ~40 characters).');
      return;
    }
    setError('');
    setShowAdd(false);
    onAddJob(text.trim());
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      let text = '';
      if (file.name.endsWith('.docx')) text = await extractDocx(await file.arrayBuffer());
      else text = await file.text();
      if (!text || text.trim().length < 40) {
        setError(`Could not read "${file.name}". Try saving as .txt and uploading again, or paste the text directly.`);
        return;
      }
      setPaste(text.substring(0, 400) + '\n...');
      submit(text);
    } catch (err) {
      console.error('[FillJobs] file upload failed:', err);
      setError(`Could not read "${file.name}".`);
    }
  };

  const showDisplay = activeJob && !showAdd;

  return (
    <div className="grid grid-cols-1 border-t-2 border-border lg:grid-cols-[280px_1fr]">
      {/* Left: open positions */}
      <div className="flex flex-col border-r border-border bg-panel/60 px-4 py-5">
        <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-accent">Open Positions</div>
        <div className="mb-3 flex min-h-[60px] flex-1 flex-col gap-1.5 overflow-y-auto">
          {jobs.length === 0 ? (
            <div className="text-[11px] italic text-subtle">Upload a job description →</div>
          ) : (
            jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => { onActivateJob(job.id); setShowAdd(false); }}
                className={`w-full rounded-md border px-2.5 py-1.5 text-left transition-colors ${
                  job.id === activeJobId ? 'border-accent bg-ink text-slate-100' : 'border-border text-slate-300 hover:bg-ink'
                }`}
              >
                <div className="truncate text-xs font-medium">{job.title}</div>
                {job.loc && <div className={`text-[10px] ${job.id === activeJobId ? 'text-accent' : 'text-muted'}`}>{job.loc}</div>}
              </button>
            ))
          )}
        </div>
        <button
          onClick={onFillPosition}
          disabled={!activeJobId}
          className="w-full rounded-md bg-gradient-to-br from-blue-600 to-cyan-500 px-3 py-2 text-xs font-bold text-white transition-opacity disabled:pointer-events-none disabled:opacity-30"
        >
          ▲ Fill This Position
        </button>
        <div className="mt-1.5 text-center text-[10px] text-slate-600">Loads job into top panel · continues candidate selection</div>
      </div>

      {/* Right: add / display + interpretation */}
      <div className="flex flex-col gap-3.5 bg-panel px-8 py-6 shadow-inner">
        {!showDisplay ? (
          <div>
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-accent">Add Job Description</div>
            <div className="flex flex-wrap items-start gap-3">
              <textarea
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
                placeholder="Paste job description text here..."
                aria-label="Job description text"
                className="min-h-[110px] flex-1 rounded-md border border-border bg-ink p-3 text-xs text-slate-200 outline-none focus:border-accent"
              />
              <div className="flex flex-col gap-2">
                <label className="cursor-pointer rounded-md border border-border bg-ink px-4 py-2 text-center text-xs font-semibold text-slate-200 hover:border-accent">
                  ⇪ Upload .docx / .txt
                  <input type="file" accept=".txt,.docx" onChange={handleUpload} className="hidden" aria-label="Upload job description file" />
                </label>
                <button onClick={() => submit(paste)} className="rounded-md bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500">
                  ⚡ Interpret &amp; Add
                </button>
              </div>
            </div>
            {error && <div className="mt-2 text-xs text-red-400">{error}</div>}
          </div>
        ) : (
          <div>
            <div className="mb-2.5 flex items-start justify-between">
              <div>
                <div className="text-sm font-bold text-white">{activeJob.title}</div>
                <div className="text-xs text-muted">{activeJob.loc || ''}</div>
              </div>
              <button onClick={() => setShowAdd(true)} className="rounded border border-border px-3 py-1 text-[11px] text-slate-300 hover:border-accent">
                + Add another
              </button>
            </div>
            <ScoresGrid scores={activeJob.scores} />
            <div className="mt-3 rounded-lg border border-border bg-ink px-3.5 py-2.5 text-[11px] text-muted">
              <strong className="text-[10px] uppercase tracking-wider">Channel key: </strong>
              {[['±0.5–0.6 Essential', BAND_KEY[0].color], ['±0.8–1.0 Important', BAND_KEY[1].color], ['±1.2–1.6 Useful', BAND_KEY[2].color], ['±1.8–2.2 Least required', BAND_KEY[3].color]].map(([txt, color], i) => (
                <span key={txt}>
                  <span style={{ color }}>{txt}</span>
                  {i < 3 ? ' · ' : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CLI Behavioral Interpretation */}
        {interpretation && (
          <div>
            <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted">CLI Behavioral Interpretation</div>
            <div className="rounded-lg border border-border bg-ink px-6 py-5 text-[13.5px] leading-7 text-slate-100">
              {interpretation.paras.map((p, i) => (
                <p key={i} className={i < interpretation.paras.length - 1 ? 'mb-3' : ''}>{p}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
