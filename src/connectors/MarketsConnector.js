// Domain: markets — Alpha Vantage prices/indicators + mock.
import { BaseConnector } from './BaseConnector.js';

export class AlphaVantageConnector extends BaseConnector {
  static domain = 'markets';
  static label = 'Alpha Vantage (stock prices + indicators)';
  static isMock = false;

  async _fetch() {
    const proxyBase = this.config.proxyBase || '';
    const ticker = this.config.ticker || 'SPGI';
    const res = await fetch(`${proxyBase}/api/alphavantage?ticker=${ticker}`);
    if (!res.ok) throw new Error(`Alpha Vantage proxy error ${res.status}`);
    const data = await res.json();
    return {
      source: 'Alpha Vantage',
      ticker,
      price: data.price,
      change: data.change,
      changePercent: data.changePercent,
      volume: data.volume,
      week52High: data.week52High,
      week52Low: data.week52Low,
      asOf: data.asOf || null,
    };
  }
}

export class MockMarketsConnector extends BaseConnector {
  static domain = 'markets';
  static label = 'Mock markets data (demo)';
  static isMock = true;

  async _fetch() {
    return {
      source: 'mock',
      ticker: this.config.ticker || 'SPGI',
      price: 487.32,
      change: -2.18,
      changePercent: -0.45,
      volume: 1840000,
      week52High: 525.4,
      week52Low: 410.2,
      asOf: new Date().toISOString().split('T')[0],
      note: 'MOCK DATA — wire to Alpha Vantage for live prices.',
    };
  }
}
