// Domain: markets — Alpha Vantage prices/indicators + mock.
import { BaseConnector } from './BaseConnector.js';

export class AlphaVantageConnector extends BaseConnector {
  static domain = 'markets';
  static label = 'Alpha Vantage (stock prices + indicators)';
  static isMock = false;

  async _fetch() {
    const ticker = this.config.ticker || 'SPGI';
    // E1: authed Laravel proxy. /data/markets returns the raw Alpha Vantage
    // GLOBAL_QUOTE object; the 52-week range comes from the OVERVIEW function
    // via /data/alphavantage (best-effort — quota-heavy, nulls on failure).
    const quote = await this._data('markets', { symbol: ticker });
    let week52High = null;
    let week52Low = null;
    try {
      const overview = await this._data('alphavantage', { function: 'OVERVIEW', symbol: ticker });
      week52High = overview?.['52WeekHigh'] != null ? Number(overview['52WeekHigh']) : null;
      week52Low = overview?.['52WeekLow'] != null ? Number(overview['52WeekLow']) : null;
    } catch { /* overview optional */ }
    const num = (k) => (quote?.[k] != null ? Number(String(quote[k]).replace('%', '')) : null);
    return {
      source: 'Alpha Vantage',
      ticker,
      price: num('05. price'),
      change: num('09. change'),
      changePercent: num('10. change percent'),
      volume: num('06. volume'),
      week52High,
      week52Low,
      asOf: quote?.['07. latest trading day'] ?? null,
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
