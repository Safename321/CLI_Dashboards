// Domain: financial — SEC EDGAR public-company filings via the proxy.
import { BaseConnector } from './BaseConnector.js';

export class SECEdgarFinancialConnector extends BaseConnector {
  static domain = 'financial';
  static label = 'SEC EDGAR (US public companies)';
  static isMock = false;

  async _fetch() {
    const cik = this.config.cik || '0000064040';
    const ticker = this.config.ticker || 'SPGI';
    // E1: authed Laravel proxy (GET /api/data/sec) — raw SEC submissions JSON.
    const data = await this._data('sec', { cik });
    const recent = data?.filings?.recent || {};
    const filings = (recent.form || []).slice(0, 12).map((form, i) => ({
      form,
      filed: recent.filingDate?.[i] ?? null,
      accession: recent.accessionNumber?.[i] ?? null,
      description: recent.primaryDocDescription?.[i] ?? null,
    }));
    return {
      source: 'SEC EDGAR',
      ticker,
      cik,
      entityName: data?.name ?? null,
      financials: {},                 // submissions feed carries filings, not statements
      asOf: filings[0]?.filed ?? null,
      filings,
    };
  }
}

export class MockFinancialConnector extends BaseConnector {
  static domain = 'financial';
  static label = 'Mock financial data (demo)';
  static isMock = true;

  async _fetch() {
    return {
      source: 'mock',
      ticker: this.config.ticker || 'DEMO',
      financials: {
        2025: { revenue: 14500, revenueGrowth: 6.8, netIncome: 4100, eps: 13.2, operatingMargin: 41.0, netMargin: 28.3, roe: 17.5 },
      },
      asOf: new Date().toISOString().split('T')[0],
      filings: [],
      note: 'MOCK DATA — wire to SEC EDGAR proxy for live filings.',
    };
  }
}
