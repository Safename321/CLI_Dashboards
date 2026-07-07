// Post Merger Updates (view id: 'merger') — acquired-employee feedback, at-risk
// segments, recommendations, and the M&A deal scorecard.
// Ported from v1.24L App.jsx PostMergerUpdatesDashboard (lines 7474-7879).
//
// Phase 3 (D2): tenant-real. The demo build keeps the static S&P dataset; a
// real login reads the per-tenant `mergerFeedback` / `mergerRecommendations` /
// `maDeals` datasets (entered via the SuperAdmin dataset editor — same shapes
// as the static files). No data stored → honest instructional empty state.
import { useState } from 'react';
import DashboardShell from '../../components/DashboardShell.jsx';
import { Panel, StatusBadge } from '../../components/primitives.jsx';
import { MERGER_FEEDBACK_DATA, MERGER_RECOMMENDATIONS } from '../../data/datasets/merger.js';
import { useDataset } from '../../lib/liveData.js';
import MergerRecommendationCard from './MergerRecommendationCard.jsx';
import { OverviewTab, SurveyTab, RisksTab } from './MergerSurveyTabs.jsx';
import MergerDealsTab from './MergerDealsTab.jsx';

const DEMO_BUILD = import.meta.env.VITE_AUTH_DISABLED === 'true';

const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'survey', label: 'Survey Results' },
  { id: 'risks', label: 'At-Risk Segments' },
  { id: 'recommendations', label: 'Recommendations' },
  { id: 'ma-deals', label: 'M&A Deals' },
];

// The tabs dereference nested sections directly, so a partially-entered
// tenant dataset must be normalized over a complete skeleton (never crash
// on missing keys — render zeros/empty instead).
const EMPTY_SURVEY = {
  metadata: {},
  mergerSuccess: { yes: 0, no: 0, uncertain: 0 },
  identity: { fullyIntegrated: 0, mostlyIntegrated: 0, holdover: 0, legacy: 0 },
  effectiveness: { score: 0, benchmark: 0, barriers: [] },
  happiness: { happierBefore: 0, same: 0, happierNow: 0 },
  colleagueRetention: { average: 0, distribution: [] },
  atRiskSegments: [],
};

function normalizeSurvey(raw) {
  const merged = { ...EMPTY_SURVEY, ...raw };
  for (const key of ['mergerSuccess', 'identity', 'effectiveness', 'happiness', 'colleagueRetention']) {
    merged[key] = { ...EMPTY_SURVEY[key], ...(raw[key] || {}) };
  }
  merged.effectiveness.barriers = Array.isArray(merged.effectiveness.barriers) ? merged.effectiveness.barriers : [];
  merged.colleagueRetention.distribution = Array.isArray(merged.colleagueRetention.distribution) ? merged.colleagueRetention.distribution : [];
  merged.atRiskSegments = (Array.isArray(merged.atRiskSegments) ? merged.atRiskSegments : [])
    .map((s) => ({ segment: '', count: 0, flightRisk: 0, priority: 'medium', ...s }));
  return merged;
}

// The top banner is derived from the dataset (was hardcoded demo numbers).
function CriticalBanner({ data }) {
  const segments = data.atRiskSegments ?? [];
  const highRisk = segments
    .filter((s) => s.priority === 'critical' || s.priority === 'high')
    .reduce((sum, s) => sum + (s.count ?? 0), 0);
  const maxFlight = Math.max(0, ...segments.map((s) => s.flightRisk ?? 0));
  const happierBefore = data.happiness?.happierBefore;
  const holdover = (data.identity?.holdover ?? 0) + (data.identity?.legacy ?? 0);
  const effGap = data.effectiveness?.score != null && data.effectiveness?.benchmark != null
    ? (data.effectiveness.score - data.effectiveness.benchmark).toFixed(1)
    : null;

  if (!segments.length && happierBefore == null) return null;
  return (
    <div className="rounded-xl border border-red-500/50 bg-gradient-to-r from-red-900/30 to-amber-900/20 p-4">
      <div className="flex items-center gap-4">
        <div aria-hidden className="text-4xl">⚠️</div>
        <div className="flex-1">
          <div className="font-semibold text-red-400">
            {maxFlight > 0 ? `Critical: up to ${maxFlight}% of acquired employees at elevated flight risk` : 'Integration health signals'}
          </div>
          <div className="mt-1 text-sm text-slate-300">
            {[
              happierBefore != null ? `${happierBefore}% were happier before merger` : null,
              holdover > 0 ? `${holdover}% identify as 'holdover/legacy'` : null,
              effGap != null ? `Effectiveness gap ${effGap} vs benchmark` : null,
            ].filter(Boolean).join(' • ')}
          </div>
        </div>
        {highRisk > 0 && (
          <div className="text-right">
            <div className="text-2xl font-bold text-red-400">{highRisk}</div>
            <div className="text-xs text-muted">High-risk individuals</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MergerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Live tenant datasets (same shapes as the static demo files).
  const storedFeedback = useDataset('mergerFeedback', null);
  const storedRecs = useDataset('mergerRecommendations', null);
  const storedDeals = useDataset('maDeals', null);

  const data = DEMO_BUILD ? MERGER_FEEDBACK_DATA
    : (storedFeedback && Object.keys(storedFeedback).length ? normalizeSurvey(storedFeedback) : null);
  const recs = DEMO_BUILD ? MERGER_RECOMMENDATIONS
    : (Array.isArray(storedRecs) && storedRecs.length ? storedRecs : [])
        // The card dereferences these directly — default missing sections.
        .map((r) => ({
          priority: 'medium', evidence: [], tactics: [],
          expectedImpact: { happiness: 0, effectiveness: 0, retention: 0 },
          ...r,
        }));
  const deals = DEMO_BUILD ? undefined
    : (Array.isArray(storedDeals) && storedDeals.length ? storedDeals : []);

  if (!data) {
    return (
      <DashboardShell
        title="Post Merger Updates"
        icon="🤝"
        subtitle="Milestone tracking and integration health"
      >
        <div className="mx-auto mt-10 max-w-xl rounded-xl border border-border bg-panel p-8">
          <p className="text-sm font-semibold text-amber-400">No merger survey data entered yet.</p>
          <p className="mt-2 text-sm text-muted">
            This view reads your organization's post-merger survey results from the
            <span className="font-semibold text-slate-200"> mergerFeedback</span> dataset
            (plus <span className="font-semibold text-slate-200">mergerRecommendations</span> and
            <span className="font-semibold text-slate-200"> maDeals</span>). An administrator can
            enter them via the SuperAdmin console's dataset editor — the panels light up as soon
            as data is stored.
          </p>
        </div>
      </DashboardShell>
    );
  }

  const meta = data.metadata ?? {};
  return (
    <DashboardShell
      title="Post Merger Updates"
      icon="🤝"
      subtitle={`Milestone tracking and integration health${meta.totalRespondents ? ` • acquired employee feedback from ${Number(meta.totalRespondents).toLocaleString()} respondents${meta.responseRate ? ` (${meta.responseRate}% response rate)` : ''}` : ''}`}
      actions={DEMO_BUILD
        ? <StatusBadge status="mock">demo data</StatusBadge>
        : <StatusBadge status="green">tenant dataset{meta.surveyDate ? ` · ${meta.surveyDate}` : ''}</StatusBadge>}
      tabs={SUB_TABS}
      activeTab={activeTab}
      onTab={setActiveTab}
    >
      <div className="space-y-6">
        <CriticalBanner data={data} />

        {/* Source mergers */}
        {meta.sourceMergers?.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            {meta.sourceMergers.map((m) => (
              <div key={m.name} className="rounded-lg border border-border bg-panel px-3 py-1.5 text-sm">
                <span className="text-white">{m.name}</span>
                <span className="ml-2 text-muted">({m.year})</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'overview' && <OverviewTab data={data} />}
        {activeTab === 'survey' && <SurveyTab data={data} />}
        {activeTab === 'risks' && <RisksTab data={data} />}
        {activeTab === 'recommendations' && (
          <Panel title="💡 Recommendations to Optimize Acquired Talent">
            {recs.length ? (
              <div className="space-y-4">
                {recs.map((rec, i) => (
                  <MergerRecommendationCard key={rec.id ?? i} recommendation={rec} defaultExpanded={i === 0} />
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-muted">
                No recommendations stored — enter the mergerRecommendations dataset via the console editor.
              </p>
            )}
          </Panel>
        )}
        {activeTab === 'ma-deals' && <MergerDealsTab deals={deals} />}
      </div>
    </DashboardShell>
  );
}
