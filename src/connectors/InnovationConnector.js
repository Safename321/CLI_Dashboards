// Domain: innovation — USPTO PatentsView (current Search API via proxy, §5) + mock.
import { BaseConnector } from './BaseConnector.js';

export class USPTOPatentsConnector extends BaseConnector {
  static domain = 'innovation';
  static label = 'USPTO PatentsView (patent filings)';
  static isMock = false;

  async _fetch() {
    const proxyBase = this.config.proxyBase || '';
    const company = this.config.companyName || 'S&P Global';
    const res = await fetch(`${proxyBase}/api/uspto?assignee=${encodeURIComponent(company)}`);
    if (!res.ok) throw new Error(`USPTO proxy error ${res.status}`);
    const data = await res.json();
    return {
      source: 'USPTO PatentsView',
      company,
      totalPatents: data.total || 0,
      patentsLast12mo: data.last12mo || 0,
      patentsLast12moYoY: data.yoy ?? null,
      recentFilings: data.recent || [],
    };
  }
}

export class MockInnovationConnector extends BaseConnector {
  static domain = 'innovation';
  static label = 'Mock innovation data (demo)';
  static isMock = true;

  async _fetch() {
    return {
      source: 'mock',
      company: this.config.companyName || 'Demo Co',
      totalPatents: 47,
      patentsLast12mo: 8,
      patentsLast12moYoY: 0.15,
      recentFilings: [
        { title: 'System and method for credit risk scoring using behavioral signals', filedAt: '2026-04-22' },
        { title: 'Apparatus for high-throughput data quality validation', filedAt: '2026-03-15' },
      ],
      note: 'MOCK DATA — wire to USPTO PatentsView for real innovation signal.',
    };
  }
}
