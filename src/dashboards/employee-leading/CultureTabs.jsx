// Employee-leading tab set 3/3: Culture & Voice, Friction Points.
// Ported from v1.24L App.jsx lines 8140–8235.
import { Panel } from '../../components/primitives.jsx';
import { StatTile, Bar, scoreBarColor } from './parts.jsx';

const CATEGORY_BADGE = {
  Tech: 'bg-cyan-900/50 text-cyan-400',
  Process: 'bg-amber-900/50 text-amber-400',
  Culture: 'bg-purple-900/50 text-purple-400',
};

export function CultureVoiceTab({ data }) {
  const { ideasUsedScore, bestPracticesAdopted, innovationDecline, segments, collaborationFreq } = data.cultureVoice;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile value={`${ideasUsedScore}/10`} label="Ideas Being Used" tone="red" />
        <StatTile value={`${bestPracticesAdopted}%`} label="Best Practices Adopted" tone="amber" />
        <StatTile value={`${innovationDecline}%`} label="Innovation Decline" tone="red" />
      </div>
      <Panel title="Integration Identity">
        <div className="space-y-3">
          {segments.map((seg) => (
            <div key={seg.identity} className="rounded-lg bg-ink/60 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-white">{seg.identity}</span>
                <span className="text-muted">{seg.percent}% of workforce</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-subtle">Satisfaction:</span>
                <div className="flex-1">
                  <Bar pct={(seg.satisfaction / 10) * 100} color={scoreBarColor(seg.satisfaction, 8, 7)} />
                </div>
                <span className="w-12 font-bold text-white">{seg.satisfaction}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Cross-Company Collaboration Frequency">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {collaborationFreq.map((freq) => (
            <div key={freq.frequency} className="rounded-lg bg-ink/60 p-3">
              <div className="mb-1 text-sm text-slate-300">{freq.frequency}</div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Bar pct={freq.percent} color="bg-cyan-500" />
                </div>
                <span className="font-bold text-cyan-400">{freq.percent}%</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function FrictionPointsTab({ data }) {
  const { hoursLostPerWeek, productivityCost, topIssues, systemsRated } = data.frictionPoints;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatTile value={hoursLostPerWeek} label="Hours Lost per Week" tone="red" />
        <StatTile value={`$${productivityCost}M/mo`} label="Productivity Cost" tone="amber" />
      </div>
      <Panel title="Top Friction Issues">
        <div className="space-y-2">
          {topIssues.map((issue) => (
            <div key={issue.issue} className="flex items-center gap-3 rounded-lg bg-ink/60 p-3">
              <span className={`rounded px-2 py-1 text-xs ${CATEGORY_BADGE[issue.category] || 'bg-slate-700 text-slate-400'}`}>
                {issue.category}
              </span>
              <div className="flex-1 text-slate-300">{issue.issue}</div>
              <span className="font-bold text-red-400">{issue.percent}%</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Systems Satisfaction Ratings">
        <div className="space-y-3">
          {systemsRated.map((sys) => (
            <div key={sys.system} className="flex items-center gap-4">
              <span className="w-48 text-slate-300">{sys.system}</span>
              <div className="flex-1">
                <Bar pct={(sys.score / 10) * 100} color={scoreBarColor(sys.score, 7, 5)} />
              </div>
              <span className="w-12 font-bold text-white">{sys.score}/10</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
