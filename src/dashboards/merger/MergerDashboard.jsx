// Post Merger Updates (view id: 'merger') — acquired-employee feedback, at-risk
// segments, recommendations, and the SPGI M&A deal scorecard.
// Ported from v1.24L App.jsx PostMergerUpdatesDashboard (lines 7474-7879).
import { useState } from 'react';
import DashboardShell from '../../components/DashboardShell.jsx';
import { Panel, StatusBadge } from '../../components/primitives.jsx';
import { MERGER_FEEDBACK_DATA, MERGER_RECOMMENDATIONS } from '../../data/datasets/merger.js';
import MergerRecommendationCard from './MergerRecommendationCard.jsx';
import { OverviewTab, SurveyTab, RisksTab } from './MergerSurveyTabs.jsx';
import MergerDealsTab from './MergerDealsTab.jsx';

const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'survey', label: 'Survey Results' },
  { id: 'risks', label: 'At-Risk Segments' },
  { id: 'recommendations', label: 'Recommendations' },
  { id: 'ma-deals', label: 'M&A Deals 2020-2025' },
];

export default function MergerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const data = MERGER_FEEDBACK_DATA;

  return (
    <DashboardShell
      title="Post Merger Updates"
      icon="🤝"
      subtitle={`Milestone tracking and integration health • acquired employee feedback from ${data.metadata.totalRespondents.toLocaleString()} respondents (${data.metadata.responseRate}% response rate)`}
      actions={<StatusBadge status="mock">demo data</StatusBadge>}
      tabs={SUB_TABS}
      activeTab={activeTab}
      onTab={setActiveTab}
    >
      <div className="space-y-6">
        {/* Critical alert */}
        <div className="rounded-xl border border-red-500/50 bg-gradient-to-r from-red-900/30 to-amber-900/20 p-4">
          <div className="flex items-center gap-4">
            <div aria-hidden className="text-4xl">⚠️</div>
            <div className="flex-1">
              <div className="font-semibold text-red-400">Critical: 38% of Acquired Employees at Elevated Flight Risk</div>
              <div className="mt-1 text-sm text-slate-300">
                42% were happier before merger • 38% identify as 'holdover/legacy' • Effectiveness gap -1.1 vs benchmark
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-400">573</div>
              <div className="text-xs text-muted">High-risk individuals</div>
            </div>
          </div>
        </div>

        {/* Source mergers */}
        <div className="flex flex-wrap items-center gap-3">
          {data.metadata.sourceMergers.map((m) => (
            <div key={m.name} className="rounded-lg border border-border bg-panel px-3 py-1.5 text-sm">
              <span className="text-white">{m.name}</span>
              <span className="ml-2 text-muted">({m.year})</span>
            </div>
          ))}
        </div>

        {activeTab === 'overview' && <OverviewTab data={data} />}
        {activeTab === 'survey' && <SurveyTab data={data} />}
        {activeTab === 'risks' && <RisksTab data={data} />}
        {activeTab === 'recommendations' && (
          <Panel title="💡 Recommendations to Optimize Acquired Talent">
            <div className="space-y-4">
              {MERGER_RECOMMENDATIONS.map((rec, i) => (
                <MergerRecommendationCard key={rec.id} recommendation={rec} defaultExpanded={i === 0} />
              ))}
            </div>
          </Panel>
        )}
        {activeTab === 'ma-deals' && <MergerDealsTab />}
      </div>
    </DashboardShell>
  );
}
