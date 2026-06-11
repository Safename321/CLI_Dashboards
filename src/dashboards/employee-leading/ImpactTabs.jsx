// Employee-leading tab set 2/3: Manager Quality, Customer Impact.
// Ported from v1.24L App.jsx lines 8028–8137.
import { Panel } from '../../components/primitives.jsx';
import { StatTile, Bar, scoreBarColor } from './parts.jsx';

export function ManagerQualityTab({ data }) {
  const { poorManagers, affectedEmployees, metrics, byOrigin } = data.managerQuality;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatTile value={poorManagers} label="Poor Managers Identified" tone="red" />
        <StatTile value={affectedEmployees} label="Employees Affected" tone="amber" />
      </div>
      <Panel title="Manager Performance Metrics">
        <div className="space-y-4">
          {metrics.map((metric) => (
            <div key={metric.metric}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-slate-300">{metric.metric}</span>
                <span className="text-sm text-muted">Current: {metric.score}/10 | Target: {metric.target}/10</span>
              </div>
              <Bar pct={(metric.score / 10) * 100} color="bg-red-500" />
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Performance by Manager Origin">
        <div className="space-y-3">
          {byOrigin.map((origin) => (
            <div key={origin.origin} className="rounded-lg bg-ink/60 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-white">{origin.origin}</span>
                <span className="text-sm text-muted">{origin.teamSatisfaction}% satisfaction</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-subtle">Manager Score:</span>
                <div className="flex-1">
                  <Bar pct={(origin.managerScore / 10) * 100} color={scoreBarColor(origin.managerScore, 7, 6)} />
                </div>
                <span className="w-12 font-bold text-white">{origin.managerScore}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function CustomerImpactTab({ data }) {
  const { revenueAtRisk, relationshipsDisrupted, clientsLost, concerns, bySegment } = data.customerImpact;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile value={`$${revenueAtRisk}M`} label="Revenue at Risk" tone="red" />
        <StatTile value={relationshipsDisrupted} label="Relationships Disrupted" tone="amber" />
        <StatTile value={clientsLost} label="Clients Lost" tone="red" />
      </div>
      <Panel title="Customer Concerns">
        <div className="space-y-3">
          {concerns.map((concern) => (
            <div key={concern.concern} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-slate-300">{concern.concern}</span>
                  <span className={`rounded px-2 py-1 text-xs ${concern.impact === 'high' ? 'bg-red-900/50 text-red-400' : 'bg-amber-900/50 text-amber-400'}`}>
                    {concern.impact.toUpperCase()}
                  </span>
                </div>
                <Bar pct={concern.percent} color="bg-red-500" />
              </div>
              <div className="w-16 text-right font-bold text-red-400">{concern.percent}%</div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Impact by Customer Segment">
        <div className="space-y-3">
          {bySegment.map((seg) => (
            <div key={seg.segment} className="flex items-center justify-between rounded-lg bg-ink/60 p-4">
              <div>
                <div className="font-medium text-white">{seg.segment}</div>
                <div className="mt-1 text-sm text-muted">{seg.affected} relationships affected</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-400">${seg.risk}M</div>
                <div className="text-xs text-subtle">at risk</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
