// Modal opened by onMetricClick: shows a metric's trend across the dataset's
// financial years. (The v1.24L TrendChart rendered an empty overlay — this
// restores the intended behavior with a real chart.)
import { useMemo } from 'react';
import { LineChart } from './charts.jsx';
import { useData } from '../data/DataContext.jsx';

export default function TrendChartModal({ metric, label, onClose }) {
  const { data } = useData();
  const chartData = useMemo(() => {
    // A metric may live in financials (revenue, eps…) or yearlyKPIs
    // (jobHappiness, flightRisk…) — check both per year.
    const fin = data?.financials || {};
    const kpis = data?.yearlyKPIs || {};
    const years = [...new Set([...Object.keys(fin), ...Object.keys(kpis)])].sort();
    return years
      .map((year) => ({ year, value: fin[year]?.[metric] ?? kpis[year]?.[metric] }))
      .filter((d) => typeof d.value === 'number');
  }, [data, metric]);

  if (!metric) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
      role="dialog"
      aria-label={`${label || metric} trend`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-xl border border-border bg-panel p-5">
        <header className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">{label || metric} — trend</h3>
          <button onClick={onClose} aria-label="Close trend chart" className="text-muted hover:text-white">✕</button>
        </header>
        {chartData.length > 0 ? (
          <LineChart data={chartData} xKey="year" series={[{ key: 'value', name: label || metric }]} height={260} />
        ) : (
          <p className="text-sm text-muted">No year-over-year data available for this metric.</p>
        )}
      </div>
    </div>
  );
}
