// Domain: macro — FRED indicators + BLS JOLTS (all requested series, §5) + mock.
import { BaseConnector } from './BaseConnector.js';

export class FREDConnector extends BaseConnector {
  static domain = 'macro';
  static label = 'FRED (St. Louis Fed)';
  static isMock = false;

  async _fetch() {
    const proxyBase = this.config.proxyBase || '';
    const series = this.config.series || ['DGS10', 'UNRATE', 'CPIAUCSL', 'SP500'];
    const res = await fetch(`${proxyBase}/api/fred?series=${series.join(',')}`);
    if (!res.ok) throw new Error(`FRED proxy error ${res.status}`);
    const data = await res.json();
    return { source: 'FRED', series: data.series || {}, asOf: data.asOf || null };
  }
}

export class BLSJoltsConnector extends BaseConnector {
  static domain = 'macro';
  static label = 'BLS JOLTS (hiring/quits/layoffs)';
  static isMock = false;

  async _fetch() {
    const proxyBase = this.config.proxyBase || '';
    const sector = this.config.sector || '510000';
    const res = await fetch(`${proxyBase}/api/bls-jolts?sector=${sector}`);
    if (!res.ok) throw new Error(`BLS JOLTS proxy error ${res.status}`);
    const data = await res.json();
    // §5: the proxy returns ALL requested series — no client-side slice.
    return { source: 'BLS JOLTS', sector: data.sectorName || sector, latest: data.latest || {}, trend: data.trend || [] };
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
