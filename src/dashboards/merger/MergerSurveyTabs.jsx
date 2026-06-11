// Overview / Survey Results / At-Risk Segments sub-tabs of Post Merger Updates.
// Ported from v1.24L App.jsx PostMergerUpdatesDashboard (lines 7536-7698).
import { Panel } from '../../components/primitives.jsx';

const TILE_TINTS = {
  amber: 'bg-amber-900/20 border border-amber-500/30 text-amber-400',
  emerald: 'bg-emerald-900/20 border border-emerald-500/30 text-emerald-400',
  red: 'bg-red-900/20 border border-red-500/30 text-red-400',
  cyan: 'bg-cyan-900/20 border border-cyan-500/30 text-cyan-400',
};

function StatTile({ tint, value, label }) {
  const cls = TILE_TINTS[tint] || TILE_TINTS.cyan;
  return (
    <div className={`rounded-xl p-4 text-center ${cls}`}>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm text-muted">{label}</div>
    </div>
  );
}

function IdentityTile({ tint, value, label }) {
  const color = { emerald: 'text-emerald-400 bg-emerald-900/20', cyan: 'text-cyan-400 bg-cyan-900/20', amber: 'text-amber-400 bg-amber-900/20', red: 'text-red-400 bg-red-900/20', slate: 'text-slate-300 bg-slate-700/50' }[tint];
  return (
    <div className={`rounded-lg p-3 text-center ${color}`}>
      <div className="text-xl font-bold">{value}%</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

export function OverviewTab({ data }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4">
        <StatTile tint="amber" value={`${data.mergerSuccess.yes}%`} label="Say Merger Success" />
        <StatTile tint="emerald" value={`${data.identity.fullyIntegrated + data.identity.mostlyIntegrated}%`} label="Feel Integrated" />
        <StatTile tint="red" value={data.effectiveness.score} label="Effectiveness /10" />
        <StatTile tint="amber" value={`${data.happiness.happierNow}%`} label="Happier Now" />
        <StatTile tint="cyan" value={`${data.colleagueRetention.average}%`} label="Colleague Retention" />
      </div>

      <Panel title="⚡ Top Barriers to Effectiveness">
        <div className="space-y-3">
          {data.effectiveness.barriers.map((b, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-48 text-sm text-slate-300">{b.barrier}</div>
              <div className="h-4 flex-1 overflow-hidden rounded-lg bg-slate-700">
                <div className="h-full rounded-lg bg-red-500" style={{ width: `${b.percent}%` }} />
              </div>
              <div className="w-12 text-right font-bold text-red-400">{b.percent}%</div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-6">
        <Panel title="🪪 Employee Identity">
          <div className="grid grid-cols-4 gap-3">
            <IdentityTile tint="emerald" value={data.identity.fullyIntegrated} label="Fully Integrated" />
            <IdentityTile tint="cyan" value={data.identity.mostlyIntegrated} label="Mostly Integrated" />
            <IdentityTile tint="amber" value={data.identity.holdover} label="Holdover" />
            <IdentityTile tint="red" value={data.identity.legacy} label="Legacy" />
          </div>
        </Panel>
        <Panel title="😊 Happiness Comparison">
          <div className="grid grid-cols-3 gap-3">
            <IdentityTile tint="red" value={data.happiness.happierBefore} label="Happier Before" />
            <IdentityTile tint="slate" value={data.happiness.same} label="About Same" />
            <IdentityTile tint="emerald" value={data.happiness.happierNow} label="Happier Now" />
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function SurveyTab({ data }) {
  const gap = (data.effectiveness.benchmark - data.effectiveness.score).toFixed(1);
  const questions = [
    {
      q: 'Q1: Is the merger a success?',
      parts: [
        { text: `Yes: ${data.mergerSuccess.yes}%`, cls: 'text-emerald-400' },
        { text: `No: ${data.mergerSuccess.no}%`, cls: 'text-red-400' },
        { text: `Uncertain: ${data.mergerSuccess.uncertain}%`, cls: 'text-muted' },
      ],
    },
    {
      q: "Q2: Do you consider yourself a 'holdover' or 'legacy' hire?",
      parts: [
        { text: `Fully Integrated: ${data.identity.fullyIntegrated}%`, cls: 'text-emerald-400' },
        { text: `Mostly: ${data.identity.mostlyIntegrated}%`, cls: 'text-cyan-400' },
        { text: `Holdover: ${data.identity.holdover}%`, cls: 'text-amber-400' },
        { text: `Legacy: ${data.identity.legacy}%`, cls: 'text-red-400' },
      ],
    },
    {
      q: 'Q3: Are you able to work as effectively?',
      parts: [
        { text: `Score: ${data.effectiveness.score}/10`, cls: 'text-amber-400 font-bold' },
        { text: `Benchmark: ${data.effectiveness.benchmark}`, cls: 'text-muted' },
        { text: `Gap: -${gap}`, cls: 'text-red-400' },
      ],
    },
    {
      q: 'Q4: Were you happier before the merger?',
      parts: [
        { text: `Happier Before: ${data.happiness.happierBefore}%`, cls: 'text-red-400' },
        { text: `Same: ${data.happiness.same}%`, cls: 'text-muted' },
        { text: `Happier Now: ${data.happiness.happierNow}%`, cls: 'text-emerald-400' },
      ],
    },
    {
      q: 'Q5: What % of former colleagues still work here?',
      parts: [
        { text: `Average: ${data.colleagueRetention.average}%`, cls: 'text-cyan-400 font-bold' },
        { text: 'Strong correlation with happiness (r=0.72)', cls: 'text-muted' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <Panel title="📊 5 Core Survey Questions">
        <div className="space-y-4">
          {questions.map((item, i) => (
            <div key={i} className="rounded-lg bg-slate-700/50 p-4">
              <div className="mb-2 font-medium text-cyan-400">{item.q}</div>
              <div className="flex flex-wrap gap-4 text-sm">
                {item.parts.map((p, j) => (
                  <span key={j} className={p.cls}>{p.text}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="👥 Colleague Retention vs Happiness">
        <div className="grid grid-cols-5 gap-3">
          {data.colleagueRetention.distribution.map((d, i) => (
            <div key={i} className="rounded-lg bg-slate-700/50 p-4 text-center">
              <div className="mb-2 text-sm text-muted">{d.range} retained</div>
              <div className="text-2xl font-bold text-cyan-400">{d.happiness}</div>
              <div className="text-xs text-subtle">happiness score</div>
              <div className="mt-1 text-xs text-muted">{d.percent}% of employees</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function RisksTab({ data }) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-gradient-to-r from-red-900/20 to-panel p-6">
      <h3 className="mb-4 font-semibold text-red-400">🚨 At-Risk Acquired Employee Segments</h3>
      <div className="space-y-4">
        {data.atRiskSegments.map((seg, i) => (
          <div
            key={i}
            className={`rounded-lg p-4 ${
              seg.priority === 'critical'
                ? 'border border-red-500/50 bg-red-900/30'
                : seg.priority === 'high'
                  ? 'border border-amber-500/50 bg-amber-900/30'
                  : 'bg-slate-700/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span
                  className={`mr-3 rounded px-2 py-0.5 text-xs font-bold ${
                    seg.priority === 'critical' ? 'bg-red-500 text-white' : seg.priority === 'high' ? 'bg-amber-500 text-white' : 'bg-slate-600 text-slate-300'
                  }`}
                >
                  {seg.priority.toUpperCase()}
                </span>
                <span className="font-medium text-white">{seg.segment}</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{seg.count}</div>
                  <div className="text-xs text-subtle">employees</div>
                </div>
                <div className="text-center">
                  <div className={`text-xl font-bold ${seg.flightRisk >= 30 ? 'text-red-400' : 'text-amber-400'}`}>{seg.flightRisk}%</div>
                  <div className="text-xs text-subtle">flight risk</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
