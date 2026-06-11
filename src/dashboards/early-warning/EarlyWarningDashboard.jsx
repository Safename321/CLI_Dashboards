// Early Warning KPIs (view id: early-warning, icon ⚡, 2 alerts).
// Probability-weighted forecasts of threshold breaches with dollar impact,
// plus financial / working-capital / people warning cards and the Scenario
// Tester modal.
import { useState } from 'react';
import DashboardShell from '../../components/DashboardShell.jsx';
import { EW_RECOMMENDATION, EW_METHODOLOGY } from '../../data/datasets/early-warning.js';
import RecommendationPanel from './RecommendationPanel.jsx';
import BreachForecastPanel from './BreachForecastPanel.jsx';
import { FinancialWarnings, WorkingCapitalWarnings, PeopleWarnings, RevenueImpactPanel } from './WarningSections.jsx';
import ScenarioTesterModal from './ScenarioTesterModal.jsx';

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
        <RecommendationPanel
          title={EW_RECOMMENDATION.title}
          evidence={EW_RECOMMENDATION.evidence}
          strategy={EW_RECOMMENDATION.strategy}
          tactics={EW_RECOMMENDATION.tactics}
        />

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
