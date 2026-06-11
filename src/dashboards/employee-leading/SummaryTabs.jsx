// Employee-leading tab set 1/3: Executive Summary, Retention Risk, Key Talent.
// Ported from v1.24L App.jsx lines 7886–8025 (behavior spec, rewritten on tokens).
import { Panel } from '../../components/primitives.jsx';
import { StatTile, Bar } from './parts.jsx';

const RISK_BADGE = {
  critical: 'bg-red-900/50 text-red-400',
  high: 'bg-amber-900/50 text-amber-400',
};

export function ExecutiveSummaryTab({ data }) {
  const scores = data.executiveSummary.healthScores;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-red-500/30 bg-panel p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">🚨 Critical Health Scores</h3>
          <div className="space-y-3">
            {scores.filter((s) => s.status === 'critical').map((item) => (
              <div key={item.area} className="flex items-center justify-between rounded-lg bg-red-900/20 p-3">
                <span className="text-slate-300">{item.area}</span>
                <span className="text-xl font-bold text-red-400">{item.score}/10</span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-amber-500/30 bg-panel p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">⚠️ Warning Areas</h3>
          <div className="space-y-3">
            {scores.filter((s) => s.status === 'warning').map((item) => (
              <div key={item.area} className="flex items-center justify-between rounded-lg bg-amber-900/20 p-3">
                <span className="text-slate-300">{item.area}</span>
                <span className="text-xl font-bold text-amber-400">{item.score}/10</span>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Panel title="💰 Value at Risk Breakdown">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile value="$8.2M" label="Talent Replacement" tone="red" />
          <StatTile value="$4.2M" label="Revenue at Risk" tone="amber" />
          <StatTile value="$2.3M/mo" label="Productivity Loss" tone="blue" />
        </div>
      </Panel>
    </div>
  );
}

export function RetentionRiskTab({ data }) {
  const { breakdown, byDivision, topReasons } = data.retentionRisk;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {breakdown.map((item) => (
          <StatTile
            key={item.timeframe}
            value={item.count}
            label={item.timeframe}
            sub={`${item.percent}% of total`}
            tone={item.severity === 'critical' ? 'red' : 'amber'}
          />
        ))}
      </div>
      <Panel title="Flight Risk by Division">
        <div className="space-y-3">
          {byDivision.map((div) => (
            <div key={div.division} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-slate-300">{div.division}</span>
                  <span className="text-sm text-muted">{div.total} employees ({div.percent}%)</span>
                </div>
                <Bar pct={div.flightRisk} color="bg-red-500" />
              </div>
              <div className="w-16 text-right font-bold text-red-400">{div.flightRisk}%</div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Top Reasons for Leaving">
        <div className="space-y-2">
          {topReasons.map((reason) => (
            <div key={reason.reason} className="flex items-center justify-between rounded-lg bg-ink/60 p-3">
              <span className="text-slate-300">{reason.reason}</span>
              <span className="font-bold text-red-400">{reason.percent}%</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function KeyTalentTab({ data }) {
  const { criticalCount, atRiskCount, replacementCost, profiles, knowledgeTransfer } = data.keyTalent;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile value={criticalCount} label="Critical Talent" tone="red" />
        <StatTile value={atRiskCount} label="At Risk" tone="amber" />
        <StatTile value={`$${replacementCost}M`} label="Replacement Cost" tone="blue" />
      </div>
      <Panel title="Critical Talent Profiles">
        <div className="space-y-3">
          {profiles.map((profile) => (
            <div key={profile.name} className="rounded-lg bg-ink/60 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-white">{profile.name}</span>
                <span className={`rounded px-3 py-1 text-sm ${RISK_BADGE[profile.risk] || 'bg-blue-900/50 text-blue-400'}`}>
                  {profile.risk.toUpperCase()}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
                <div><span className="text-subtle">Count:</span> <span className="text-slate-300">{profile.count}</span></div>
                <div><span className="text-subtle">Documentation:</span> <span className="text-slate-300">{profile.docStatus}</span></div>
                {profile.skillGap && <div><span className="text-subtle">Skill Gap:</span> <span className="text-slate-300">{profile.skillGap} months</span></div>}
                {profile.revenue && <div><span className="text-subtle">Revenue:</span> <span className="text-slate-300">${profile.revenue}M</span></div>}
                {profile.dependency && <div><span className="text-subtle">Dependencies:</span> <span className="text-slate-300">{profile.dependency} people</span></div>}
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Knowledge Transfer Progress">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile value={`${knowledgeTransfer.complete}%`} label="Complete" tone="emerald" />
          <StatTile value={`${knowledgeTransfer.inProgress}%`} label="In Progress" tone="amber" />
          <StatTile value={`${knowledgeTransfer.notStarted}%`} label="Not Started" tone="red" />
        </div>
      </Panel>
    </div>
  );
}
