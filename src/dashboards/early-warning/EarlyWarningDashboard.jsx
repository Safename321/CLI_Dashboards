// Early Warning KPIs (view id: early-warning, icon ⚡, 2 alerts).
// Probability-weighted forecasts of threshold breaches with dollar impact,
// plus financial / working-capital / people warning cards and the Scenario
// Tester modal.
import { useState } from 'react';
import DashboardShell from '../../components/DashboardShell.jsx';
import { EW_RECOMMENDATION, EW_METHODOLOGY } from '../../data/datasets/early-warning.js';
import RecommendationPanel from '../../components/RecommendationPanel.jsx';
import BreachForecastPanel from './BreachForecastPanel.jsx';
import { FinancialWarnings, WorkingCapitalWarnings, PeopleWarnings, RevenueImpactPanel } from './WarningSections.jsx';
import ScenarioTesterModal from './ScenarioTesterModal.jsx';
import LeadingIndicators from '../shared/LeadingIndicators.jsx';

const DEMO_BUILD = import.meta.env.VITE_AUTH_DISABLED === 'true';
const DemoTag = () => (DEMO_BUILD ? null : (
  <span className="ml-2 rounded-full border border-amber-500/40 bg-amber-900/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-400">demo figures</span>
));

export default function EarlyWarningDashboard({ onMetricClick }) {
  const [scenarioOpen, setScenarioOpen] = useState(false);

  return (
    <DashboardShell
      title="Early Warning KPIs"
      icon="⚡"
      alerts={2}
      subtitle="Probability-weighted forecasts of threshold breaches, with dollar impact to the budget — refreshed every 24h"
      actions={
        <button
          onClick={() => setScenarioOpen(true)}
          className="rounded border border-cyan-500/40 bg-cyan-600/20 px-3 py-1.5 text-sm text-cyan-300 hover:bg-cyan-600/30"
        >
          🔮 Scenario Tester
        </button>
      }
    >
      <div className="space-y-6">
        {/* Live tenant early-warning signals (D3) — real login only. */}
        {!DEMO_BUILD && <LeadingIndicators title="Live Early-Warning Signals" />}

        <RecommendationPanel
          title={DEMO_BUILD ? EW_RECOMMENDATION.title : `${EW_RECOMMENDATION.title} — demo figures`}
          evidence={EW_RECOMMENDATION.evidence}
          strategy={EW_RECOMMENDATION.strategy}
          tactics={EW_RECOMMENDATION.tactics}
        />

        {!DEMO_BUILD && (
          <div className="flex items-center text-xs text-muted">Financial / working-capital forecast panels below use illustrative figures<DemoTag /></div>
        )}
        <BreachForecastPanel />
        <FinancialWarnings />
        <WorkingCapitalWarnings />
        <PeopleWarnings onMetricClick={onMetricClick} />
        <RevenueImpactPanel />

        {/* Methodology footer */}
        <div className="rounded-xl border border-border/50 bg-ink/50 p-4 text-xs text-muted">
          <span className="font-semibold text-slate-300">Methodology:</span> {EW_METHODOLOGY}
        </div>
      </div>

      <ScenarioTesterModal open={scenarioOpen} onClose={() => setScenarioOpen(false)} />
    </DashboardShell>
  );
}
