// Expandable advisory recommendation panel + "Create Report" modal
// (v1.24L App.jsx 1421–1670). The dataset for report financials comes from
// the `reportData` prop when given; otherwise the panel reads it from
// useData() itself (panels normally render inside DataProvider — the hook
// call is guarded so the component still works without a provider).
import { useState } from 'react';
import { useDataMaybe } from '../data/DataContext.jsx';
import {
  generateReport,
  getReportQuestions,
  REPORT_BUTTON_SAYINGS,
  generateBoardPacketPDF,
  generateInvestorPDF,
} from '../reports/index.js';

const SEVERITY_STYLES = {
  critical: { bg: 'bg-gradient-to-r from-slate-800 to-slate-900', border: 'border-slate-700', accent: '#64748b', text: 'text-cyan-400', icon: '' },
  warning: { bg: 'bg-yellow-900/30', border: 'border-yellow-600', accent: '#eab308', text: 'text-yellow-400', icon: '[!]' },
  info: { bg: 'bg-blue-900/30', border: 'border-blue-500', accent: '#3b82f6', text: 'text-blue-400', icon: '' },
};

const fieldClasses =
  'w-full rounded-lg border border-border bg-ink px-3 py-2.5 text-[13px] outline-none focus:border-cyan-400';
const labelClasses = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted';

function ReportModal({ tactic, panelTitle, evidence, strategy, data, onClose }) {
  const questions = getReportQuestions(tactic.title, tactic.deliverable);
  const [answers, setAnswers] = useState(['', '', '']);
  const [specificProblem, setSpecificProblem] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);
  const [saying] = useState(() => REPORT_BUTTON_SAYINGS[Math.floor(Math.random() * REPORT_BUTTON_SAYINGS.length)]);

  const handleGenerate = () => {
    setDownloading(true);
    setTimeout(() => {
      generateReport(tactic, panelTitle, evidence, strategy, answers, specificProblem, data);
      setDownloading(false);
      setDone(true);
    }, 300);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-2xl border border-border bg-panel p-7">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="text-[15px] font-bold text-cyan-300">{tactic.deliverable || tactic.title}</div>
            <div className="mt-0.5 text-xs text-subtle">Answer a few questions to personalise your report</div>
          </div>
          <button onClick={onClose} aria-label="Close report dialog" className="pl-3 text-lg leading-none text-subtle hover:text-slate-200">
            ✕
          </button>
        </div>

        {/* 3 questions as dropdowns */}
        <div className="mb-5 flex flex-col gap-4">
          {questions.map((q, i) => (
            <div key={i}>
              <label className={labelClasses}>
                {i + 1}. {q.question}
              </label>
              <div className="relative">
                <select
                  value={answers[i]}
                  onChange={(e) =>
                    setAnswers((prev) => {
                      const next = [...prev];
                      next[i] = e.target.value;
                      return next;
                    })
                  }
                  className={`${fieldClasses} cursor-pointer appearance-none pr-8 ${answers[i] ? 'text-slate-100' : 'text-subtle'}`}
                >
                  <option value="">-- Select an answer --</option>
                  {q.choices.map((choice, ci) => (
                    <option key={ci} value={choice}>
                      {choice}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-subtle">▾</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4 border-t border-border" />

        {/* Specific problem */}
        <div className="mb-6">
          <label className={labelClasses} htmlFor="report-specific-problem">
            Is there a specific problem you want the report to address?
          </label>
          <textarea
            id="report-specific-problem"
            value={specificProblem}
            onChange={(e) => setSpecificProblem(e.target.value)}
            placeholder="Describe any specific challenge, question, or concern you want included... (optional)"
            rows={3}
            className={`${fieldClasses} resize-y text-slate-100`}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2.5">
          <button onClick={onClose} className="flex-1 rounded-lg bg-border py-2.5 text-[13px] text-muted hover:text-slate-200">
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={downloading}
            className={`flex-[2] rounded-lg py-2.5 text-[13px] font-semibold text-white ${
              done ? 'bg-emerald-600' : downloading ? 'cursor-wait bg-emerald-800' : 'bg-cyan-700 hover:bg-cyan-600'
            }`}
          >
            {done ? 'Downloaded! Generate Again?' : downloading ? 'Generating...' : saying}
          </button>
        </div>

        <div className="mt-3 text-center text-[11px] text-slate-600">
          Downloads as HTML -- open in browser and use Print to save as PDF
        </div>
      </div>
    </div>
  );
}

// `download` ({label, onDownload}) supports custom document generators;
// `downloadUrl`/`downloadLabel` keep the legacy Board/Investor packet routing.
export default function RecommendationPanel({ severity, title, evidence, strategy, tactics, downloadUrl, downloadLabel, download, reportData }) {
  const [expanded, setExpanded] = useState(true);
  const [selectedTactic, setSelectedTactic] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState(null);
  const [modalTactic, setModalTactic] = useState(null);

  // Dataset for report financials: prop wins, context is the fallback.
  // useDataMaybe never throws (null outside a DataProvider), so the hook is
  // genuinely unconditional — no try/catch around a hook call.
  const ctx = useDataMaybe();
  const data = reportData ?? ctx?.data ?? null;

  const c = SEVERITY_STYLES[severity] || SEVERITY_STYLES.info;

  const handleDownload = () => {
    setDownloadStatus('downloading');
    setTimeout(() => {
      try {
        if (download?.onDownload) download.onDownload();
        else if (downloadUrl && downloadUrl.includes('Board')) generateBoardPacketPDF(data);
        else if (downloadUrl && downloadUrl.includes('Investor')) generateInvestorPDF(data);
      } catch (err) {
        console.error('[RecommendationPanel] packet generation failed:', err);
      }
      setDownloadStatus('complete');
      setTimeout(() => setDownloadStatus(null), 2000);
    }, 300);
  };
  const hasDownload = Boolean(downloadUrl || download);

  return (
    <div className={`${c.bg} border-l-4 ${c.border} mb-6 overflow-hidden rounded-r-xl`} style={{ borderLeftColor: c.accent }}>
      {modalTactic && (
        <ReportModal
          tactic={modalTactic}
          panelTitle={title}
          evidence={evidence}
          strategy={strategy}
          data={data}
          onClose={() => setModalTactic(null)}
        />
      )}

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left hover:bg-white/5"
      >
        <span className="flex items-center gap-3">
          {c.icon && <span className="text-2xl">{c.icon}</span>}
          <span>
            <h3 className={`font-bold ${c.text}`}>{title}</h3>
            <p className="text-sm text-muted">CLI Advisory Recommendation</p>
          </span>
        </span>
        <span className="text-muted transition-transform" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▾
        </span>
      </button>

      {expanded && (
        <div className="space-y-4 px-4 pb-4">
          {/* Pre-generated downloads */}
          {hasDownload && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-900/30 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-emerald-400">{download?.label || downloadLabel || 'Pre-Generated Presentation Ready'}</div>
                  <div className="text-xs text-muted">Downloads as HTML -- Print to PDF in browser</div>
                </div>
                <button
                  onClick={handleDownload}
                  disabled={downloadStatus === 'downloading'}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white ${
                    downloadStatus === 'complete' ? 'bg-emerald-500' : downloadStatus === 'downloading' ? 'bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  {downloadStatus === 'downloading'
                    ? 'Generating...'
                    : downloadStatus === 'complete'
                      ? 'Downloaded!'
                      : REPORT_BUTTON_SAYINGS[Math.floor(Date.now() / 1000) % REPORT_BUTTON_SAYINGS.length]}
                </button>
              </div>
            </div>
          )}

          {/* Evidence */}
          <div className="rounded-lg bg-slate-900/50 p-3">
            <div className="mb-2 text-xs uppercase tracking-wider text-muted">Key Evidence</div>
            <ul className="space-y-1">
              {evidence.map((e, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className={c.text}>-</span>
                  <span className="text-slate-300">{e}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Strategy */}
          <div className="rounded-lg bg-slate-900/50 p-3">
            <div className="mb-2 text-xs uppercase tracking-wider text-muted">Recommended Strategy</div>
            <p className="text-sm text-white">{strategy}</p>
          </div>

          {/* Tactics */}
          <div>
            <div className="mb-2 text-xs uppercase tracking-wider text-muted">Actionable Tactics</div>
            <div className="space-y-2">
              {tactics.map((tactic, i) => (
                <div key={i}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTactic(selectedTactic === i ? null : i);
                    }}
                    className={`w-full rounded-lg border p-3 text-left transition-all ${
                      selectedTactic === i ? 'border-cyan-500 bg-cyan-900/30' : 'border-border bg-panel hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-cyan-400">{i + 1}.</span>
                        <span className="text-sm font-medium text-white">{tactic.title}</span>
                      </div>
                      {tactic.canCreate && <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-400">Create Report</span>}
                    </div>
                    <p className="ml-5 mt-1 text-xs text-muted">{tactic.description}</p>
                  </button>

                  {selectedTactic === i && tactic.canCreate && (
                    <div className="ml-4 mt-2 rounded-lg border border-cyan-500/30 bg-panel p-3">
                      <p className="mb-3 text-sm text-slate-300">Answer 3 quick questions to tailor this report to your situation.</p>
                      <button
                        onClick={() => {
                          setModalTactic(tactic);
                          setSelectedTactic(null);
                        }}
                        className="w-full rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
                      >
                        Create {tactic.deliverable || 'Report'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
