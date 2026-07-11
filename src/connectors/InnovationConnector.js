// Domain: innovation — USPTO PatentsView (current Search API via proxy, §5) + mock.
import { BaseConnector } from './BaseConnector.js';

export class USPTOPatentsConnector extends BaseConnector {
  static domain = 'innovation';
  static label = 'USPTO PatentsView (patent filings)';
  static isMock = false;

  async _fetch() {
    const company = this.config.companyName || 'S&P Global';
    // E1: authed Laravel proxy. /data/uspto passes q through to the
    // PatentsView Search API — q is a JSON query, assignee-organization match.
    const q = JSON.stringify({ _contains: { 'assignees.assignee_organization': company } });
    const data = await this._data('uspto', { q });
    const patents = data?.patents || [];
    const yearAgo = new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    const recent = patents.filter((p) => (p.patent_date || '') >= yearAgo);
    return {
      source: 'USPTO PatentsView',
      company,
      totalPatents: data?.total_hits ?? patents.length,
      patentsLast12mo: recent.length,
      patentsLast12moYoY: null,   // needs a second-year window — not derivable from one page
      recentFilings: patents.slice(0, 10).map((p) => ({
        title: p.patent_title,
        filedAt: p.patent_date,
        id: p.patent_id,
      })),
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
