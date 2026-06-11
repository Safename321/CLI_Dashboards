// Thin chart wrappers over recharts so dashboards stay declarative (§4.2/§4.6).
import { memo } from 'react';
import {
  ResponsiveContainer,
  RadarChart as ReRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart as ReLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart as ReBar, Bar,
  PieChart as RePie, Pie, Cell,
} from 'recharts';

const AXIS = '#64748b';
const GRID = '#334155';
const PALETTE = ['#06b6d4', '#E00000', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

const tooltipStyle = {
  contentStyle: { background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#e2e8f0' },
};

export const RadarChart = memo(function RadarChart({ data, series, angleKey = 'axis', height = 300 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReRadar data={data} outerRadius="75%">
        <PolarGrid stroke={GRID} />
        <PolarAngleAxis dataKey={angleKey} tick={{ fill: AXIS, fontSize: 11 }} />
        <PolarRadiusAxis tick={{ fill: AXIS, fontSize: 10 }} stroke={GRID} />
        {series.map((s, i) => (
          <Radar key={s.key} name={s.name} dataKey={s.key} stroke={s.color || PALETTE[i % PALETTE.length]} fill={s.color || PALETTE[i % PALETTE.length]} fillOpacity={0.25} />
        ))}
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Tooltip {...tooltipStyle} />
      </ReRadar>
    </ResponsiveContainer>
  );
});

export const LineChart = memo(function LineChart({ data, xKey, series, height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReLine data={data}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
        <XAxis dataKey={xKey} tick={{ fill: AXIS, fontSize: 11 }} />
        <YAxis tick={{ fill: AXIS, fontSize: 11 }} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s, i) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color || PALETTE[i % PALETTE.length]} dot={false} strokeWidth={2} />
        ))}
      </ReLine>
    </ResponsiveContainer>
  );
});

export const BarChart = memo(function BarChart({ data, xKey, series, height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBar data={data}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
        <XAxis dataKey={xKey} tick={{ fill: AXIS, fontSize: 11 }} />
        <YAxis tick={{ fill: AXIS, fontSize: 11 }} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s, i) => (
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color || PALETTE[i % PALETTE.length]} radius={[3, 3, 0, 0]} />
        ))}
      </ReBar>
    </ResponsiveContainer>
  );
});

export const DonutChart = memo(function DonutChart({ data, nameKey = 'name', valueKey = 'value', height = 240 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RePie>
        <Pie data={data} nameKey={nameKey} dataKey={valueKey} innerRadius="55%" outerRadius="80%" paddingAngle={2}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color || PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </RePie>
    </ResponsiveContainer>
  );
});

export { PALETTE };
