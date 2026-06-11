// New products & OASI execution risk assessment + personnel analysis generator.
import { useEffect, useRef, useState } from 'react';
import { NEW_PRODUCTS } from '../../data/datasets/investor-behavior.js';

const gapTone = {
  critical: 'bg-red-900/10 border-red-500/30',
  moderate: 'bg-amber-900/10 border-amber-500/30',
  low: 'bg-emerald-900/10 border-emerald-500/30',
};

const riskTone = (risk) =>
  risk === 'Very High' || risk === 'High' ? 'text-red-400' : risk === 'Medium' ? 'text-amber-400' : 'text-emerald-400';

export default function ProductsSection() {
  const [pdfState, setPdfState] = useState('idle'); // idle | generating | done
  const timerRef = useRef(null);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const generatePersonnelPDF = () => {
    setPdfState('generating');
    // Legacy behavior: simulated 2s generation (demo — no real PDF backend).
    timerRef.current = setTimeout(() => setPdfState('done'), 2000);
  };

  return (
    <section className="rounded-xl border border-border bg-panel p-6">
      <h3 className="mb-4 font-semibold text-white">🚀 New Products & OASI Execution Risk Assessment</h3>

      <p className="mb-4 text-sm text-muted">
        Analysis of whether announced products can be executed well given current OASI profile. Products requiring
        elevated Relational styles (Collaborative 5.5, Vicarious 4.2, Entrusting 4.8) face higher execution risk.
      </p>

      <div className="space-y-4">
        {NEW_PRODUCTS.map((product) => (
          <div key={product.name} className={`rounded-lg border p-4 ${gapTone[product.oasiGap] || gapTone.low}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h4 className="font-semibold text-white">{product.name}</h4>
                  <span className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300">{product.category}</span>
                  <span className="text-xs text-subtle">{product.launched}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{product.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-subtle">Required OASI:</span>
                  {product.oasiRequired.map((style) => (
                    <span key={style} className="rounded bg-cyan-900/30 px-2 py-0.5 text-xs text-cyan-400">
                      {style}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted">
                  <strong className="text-slate-300">Personnel Needs:</strong> {product.personnelNeeds}
                </p>
              </div>
              <div className="ml-4 text-right">
                <div className={`text-sm font-semibold ${riskTone(product.executionRisk)}`}>{product.executionRisk} Risk</div>
                {product.hiringNeeded && (
                  <span className="mt-1 inline-block rounded bg-purple-900/30 px-2 py-0.5 text-xs text-purple-400">
                    Hiring Required
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-ink p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <h4 className="font-semibold text-purple-400">📄 Deep Personnel Analysis Available</h4>
            <p className="mt-1 text-sm text-muted">
              Generate a 3-page PDF analyzing all 600+ press releases since Feb 2023 with CLI's OASI and Achieving Styles
              framework. Includes hiring recommendations, training curriculum, and onboarding best practices.
            </p>
          </div>
          <button
            onClick={generatePersonnelPDF}
            disabled={pdfState === 'generating'}
            className={`rounded-lg px-4 py-2 font-medium transition-all ${
              pdfState === 'generating'
                ? 'cursor-not-allowed bg-slate-700 text-muted'
                : 'bg-purple-600 text-white hover:bg-purple-500'
            }`}
          >
            {pdfState === 'generating' ? 'Generating...' : 'Generate PDF Analysis'}
          </button>
        </div>
        {pdfState === 'done' && (
          <div className="mt-3 rounded border border-emerald-500/30 bg-emerald-900/20 p-3 text-sm text-emerald-300" role="status">
            PDF Generated: CLI_SPGI_Personnel_Analysis.pdf — this 3-page analysis covers (1) OASI-Aligned Hiring
            Recommendations, (2) Training & Development Framework, (3) Onboarding Best Practices Using Achieving Styles.
          </div>
        )}
      </div>
    </section>
  );
}
