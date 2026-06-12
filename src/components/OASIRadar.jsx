// OASI radar visuals (ported from legacy App.jsx lines ~290-470).
// - CLILogo: CLI brand mark (tri-color ring + "CLI" text)
// - OASIRadarChart: tri-color 9-style radar. Recharts can't color individual
//   polygon segments, so three Radar traces are overlaid — each carries only
//   its 3 cluster styles and zeroes the rest.
// - OASIOverlayRadarChart: current-vs-ideal overlay radar.
import {
  ResponsiveContainer, RadarChart as ReRadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Legend,
} from 'recharts';
import { generateOASIExplainerReport } from '../reports/index.js';

// CLILogo lives in its own module now (shared by sidebar/login/mentor); keep the
// re-export so existing OASIRadar importers are unaffected.
export { CLILogo } from './CLILogo.jsx';

// Exact wheel order + cluster assignment (do not reorder — matches the CLI wheel)
const WHEEL_ORDER = [
  { style: 'Vicarious', key: 'vicarious', set: 'relational' },
  { style: 'Intrinsic', key: 'intrinsic', set: 'direct' },
  { style: 'Competitive', key: 'competitive', set: 'direct' },
  { style: 'Power', key: 'power', set: 'direct' },
  { style: 'Personal', key: 'personal', set: 'instrumental' },
  { style: 'Social', key: 'social', set: 'instrumental' },
  { style: 'Entrusting', key: 'entrusting', set: 'instrumental' },
  { style: 'Collaborative', key: 'collaborative', set: 'relational' },
  { style: 'Contributory', key: 'contributory', set: 'relational' },
];
const COLOR_MAP = { direct: '#eab308', instrumental: '#ef4444', relational: '#3b82f6' };
const FILL_MAP = { direct: 'rgba(234,179,8,0.22)', instrumental: 'rgba(239,68,68,0.22)', relational: 'rgba(59,130,246,0.22)' };
const LABEL_COL = { direct: '#fbbf24', instrumental: '#f87171', relational: '#60a5fa' };
const SHORT_MAP = { Competitive: 'Compet.', Contributory: 'Contrib.', Collaborative: 'Collab.', Entrusting: 'Entrust.' };

const CLUSTER_LEGEND = [
  { color: COLOR_MAP.direct, label: 'DIRECT', styles: 'Intrinsic · Compet. · Power' },
  { color: COLOR_MAP.instrumental, label: 'INSTRUMENTAL', styles: 'Personal · Social · Entrust.' },
  { color: COLOR_MAP.relational, label: 'RELATIONAL', styles: 'Collab. · Contrib. · Vicarious' },
];

const renderAngleLabel = ({ x, y, payload }) => {
  const s = WHEEL_ORDER.find((r) => r.style === payload.value);
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={LABEL_COL[s?.set || 'direct']} fontSize={9} fontWeight="700">
      {SHORT_MAP[payload.value] || payload.value}
    </text>
  );
};

const clusterDot = (set) => function ClusterDot({ cx, cy, payload }) {
  if (!payload[set]) return null;
  return <circle cx={cx} cy={cy} r={4} fill={COLOR_MAP[set]} stroke="#0f172a" strokeWidth={1.5} />;
};

export const OASIRadarChart = ({ scores, onExplain = generateOASIExplainerReport }) => {
  // One row per style; each cluster trace only carries its own 3 styles
  const data = WHEEL_ORDER.map((s) => ({
    style: s.style,
    direct: s.set === 'direct' ? scores[s.key] || 0 : 0,
    instrumental: s.set === 'instrumental' ? scores[s.key] || 0 : 0,
    relational: s.set === 'relational' ? scores[s.key] || 0 : 0,
  }));

  const mean = Object.values(scores).reduce((a, b) => a + b, 0) / 9;
  const setMeans = [
    { label: 'Direct', val: ((scores.intrinsic + scores.competitive + scores.power) / 3).toFixed(2), color: COLOR_MAP.direct },
    { label: 'Instrumental', val: ((scores.personal + scores.social + scores.entrusting) / 3).toFixed(2), color: COLOR_MAP.instrumental },
    { label: 'Relational', val: ((scores.collaborative + scores.contributory + scores.vicarious) / 3).toFixed(2), color: COLOR_MAP.relational },
    { label: 'Overall OASI', val: mean.toFixed(2), color: '#22d3ee' },
  ];

  return (
    <div className="flex items-start gap-4">
      {/* LEFT: radar + explain button + wheel/legend row */}
      <div className="shrink-0">
        <ResponsiveContainer width={300} height={310}>
          <ReRadarChart data={data} startAngle={130} endAngle={-230} margin={{ top: 44, right: 72, bottom: 44, left: 72 }} outerRadius={82}>
            <PolarGrid stroke="#1e3a5f" />
            <PolarAngleAxis dataKey="style" tick={renderAngleLabel} />
            <PolarRadiusAxis angle={90} domain={[0, 7]} tick={{ fill: '#475569', fontSize: 7 }} tickCount={4} />
            <Radar name="Direct" dataKey="direct" stroke={COLOR_MAP.direct} fill={FILL_MAP.direct} strokeWidth={2.5} dot={clusterDot('direct')} />
            <Radar name="Instrumental" dataKey="instrumental" stroke={COLOR_MAP.instrumental} fill={FILL_MAP.instrumental} strokeWidth={2.5} dot={clusterDot('instrumental')} />
            <Radar name="Relational" dataKey="relational" stroke={COLOR_MAP.relational} fill={FILL_MAP.relational} strokeWidth={2.5} dot={clusterDot('relational')} />
          </ReRadarChart>
        </ResponsiveContainer>

        <div className="mb-0.5 mt-1 text-center">
          <button
            onClick={onExplain}
            className="rounded-lg border-2 border-cyan-400 bg-transparent px-4 py-1.5 text-lg font-bold text-cyan-400 opacity-85 transition-opacity hover:opacity-100"
          >
            📄 Explain the OASI
          </button>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <img
            src="/cli-wheel.png"
            alt="CLI Achieving Styles wheel"
            className="h-[88px] w-[88px] shrink-0 rounded-lg border border-border bg-white object-contain"
          />
          <div className="flex flex-col gap-[5px]">
            {CLUSTER_LEGEND.map((g) => (
              <div key={g.label} className="flex items-center gap-1.5">
                <span className="inline-block h-[9px] w-[9px] shrink-0 rounded-sm" style={{ background: g.color }} />
                <span className="min-w-[76px] text-[10px] font-bold" style={{ color: g.color }}>{g.label}</span>
                <span className="text-[9px] text-subtle">{g.styles}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: scores table + set means */}
      <div className="min-w-[160px] flex-1">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle">Scores</div>
        <table className="w-full border-collapse text-[11px]">
          <tbody>
            {WHEEL_ORDER.map((s) => (
              <tr key={s.key} className="border-b border-panel">
                <td className="py-[3px]" style={{ color: COLOR_MAP[s.set] }}>{s.style}</td>
                <td className="pr-1 text-right font-bold" style={{ color: COLOR_MAP[s.set] }}>{(scores[s.key] || 0).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-2.5 border-t border-border pt-2">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-subtle">Set Means</div>
          {setMeans.map((r, i) => (
            <div key={r.label} className={`mb-[3px] flex justify-between pb-[3px] ${i < 3 ? 'border-b border-panel' : ''}`}>
              <span className="text-[11px] text-muted">{r.label}</span>
              <span className="text-[13px] font-bold" style={{ color: r.color }}>{r.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Current vs Ideal overlay radar (used by the Aspirational OASI dashboard)
export const OASIOverlayRadarChart = ({ currentScores, idealScores, size = 300 }) => {
  const order = ['Collaborative', 'Vicarious', 'Contributory', 'Entrusting', 'Social', 'Personal', 'Intrinsic', 'Competitive', 'Power'];
  const data = order.map((style) => {
    const key = style.toLowerCase();
    return { style, current: currentScores[key], ideal: idealScores[key] };
  });
  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width={size} height={size}>
        <ReRadarChart data={data} startAngle={-30} endAngle={-390}>
          <PolarGrid stroke="#475569" />
          <PolarAngleAxis dataKey="style" tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[1, 7]} tick={{ fill: '#64748b', fontSize: 9 }} />
          <Radar name="Ideal (2028)" dataKey="ideal" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} strokeWidth={2} strokeDasharray="5 5" />
          <Radar name="Current (2025)" dataKey="current" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} strokeWidth={2} />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
        </ReRadarChart>
      </ResponsiveContainer>
    </div>
  );
};
