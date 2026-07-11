// Domain: macro — FRED indicators + BLS JOLTS (all requested series, §5) + mock.
import { BaseConnector } from './BaseConnector.js';

export class FREDConnector extends BaseConnector {
  static domain = 'macro';
  static label = 'FRED (St. Louis Fed)';
  static isMock = false;

  static SERIES_LABELS = {
    DGS10: '10Y Treasury', UNRATE: 'Unemployment Rate', CPIAUCSL: 'CPI', SP500: 'S&P 500',
    FEDFUNDS: 'Fed Funds Rate', GDP: 'GDP',
  };

  async _fetch() {
    const series = this.config.series || ['DGS10', 'UNRATE', 'CPIAUCSL', 'SP500'];
    // E1: authed Laravel proxy — one call per series (GET /api/data/fred
    // returns raw FRED observations for a single series_id).
    const results = await Promise.all(series.map(async (id) => {
      try {
        const raw = await this._data('fred', { series_id: id });
        const obs = (raw?.observations || []).filter((o) => o.value !== '.');
        const last = obs[obs.length - 1];
        return [id, last ? {
          label: FREDConnector.SERIES_LABELS[id] || id,
          value: Number(last.value),
          asOf: last.date,
        } : null];
      } catch {
        return [id, null]; // one bad series must not sink the rest
      }
    }));
    const map = Object.fromEntries(results.filter(([, v]) => v !== null));
    if (!Object.keys(map).length) throw new Error('fred unavailable: no series returned');
    const asOf = Object.values(map).map((s) => s.asOf).sort().pop() ?? null;
    return { source: 'FRED', series: map, asOf };
  }
}

export class BLSJoltsConnector extends BaseConnector {
  static domain = 'macro';
  static label = 'BLS JOLTS (hiring/quits/layoffs)';
  static isMock = false;

  // JOLTS total-nonfarm, seasonally adjusted: openings/hires/quits/layoffs.
  // Industry-specific series ids can be supplied via config.blsSeries.
  static DEFAULT_SERIES = {
    jobOpenings: 'JTS000000000000000JOL',
    hires:       'JTS000000000000000HIL',
    quits:       'JTS000000000000000QUL',
    layoffs:     'JTS000000000000000LDL',
  };

  async _fetch() {
    const seriesMap = this.config.blsSeries || BLSJoltsConnector.DEFAULT_SERIES;
    const ids = Object.values(seriesMap);
    // E1: authed Laravel proxy — raw BLS v2 timeseries payload for ALL ids.
    const raw = await this._data('bls', { series: ids.join(',') });
    const byId = {};
    for (const s of raw?.Results?.series || []) {
      const latest = s.data?.[0];
      if (latest) byId[s.seriesID] = { value: Number(latest.value) * 1000, period: `${latest.year}-${latest.periodName}` };
    }
    const latest = {};
    for (const [metric, id] of Object.entries(seriesMap)) {
      if (byId[id]) latest[metric] = byId[id].value;
    }
    if (!Object.keys(latest).length) throw new Error('bls unavailable: no series returned');
    return {
      source: 'BLS JOLTS',
      sector: this.config.sectorName || (this.config.blsSeries ? this.config.sector : 'Total nonfarm'),
      latest,
      asOf: Object.values(byId)[0]?.period ?? null,
      trend: [],   // trend needs history retention — future enhancement
    };
  }
}

export class MockMacroConnector extends BaseConnector {
  static domain = 'macro';
  static label = 'Mock macro indicators (demo)';
  static isMock = true;

  async _fetch() {
    return {
      source: 'mock',
      series: {
        DGS10: { label: '10Y Treasury', value: 4.42, asOf: '2026-05-25', wow: -0.08 },
        UNRATE: { label: 'Unemployment Rate', value: 3.9, asOf: '2026-04-30', mom: 0.1 },
        CPIAUCSL: { label: 'CPI', value: 313.5, asOf: '2026-04-30', yoy: 3.1 },
        SP500: { label: 'S&P 500', value: 5470, asOf: '2026-05-25', wow: 0.4 },
      },
      jolts: { sector: 'Financial Activities', latest: { jobOpenings: 482000, hires: 119000, quits: 87000, layoffs: 41000 } },
      note: 'MOCK DATA — wire to FRED + BLS JOLTS for live macro context.',
    };
  }
}
