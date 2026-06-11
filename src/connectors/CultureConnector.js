// Domain: culture — Glassdoor partner (customer's own reviews) + mock.
import { BaseConnector } from './BaseConnector.js';

export class GlassdoorConnector extends BaseConnector {
  static domain = 'culture';
  static label = "Glassdoor (customer's own reviews)";
  static isMock = false;
  static requiresOAuth = true;

  async _fetch() {
    if (!this.config.partnerId || !this.config.partnerKey) {
      throw new Error('Glassdoor requires partnerId + partnerKey (partner agreement, per-customer)');
    }
    if (!this.config.employerId) throw new Error('Glassdoor requires employerId in config');
    const proxyBase = this.config.proxyBase || '';
    const res = await fetch(`${proxyBase}/api/glassdoor?employerId=${this.config.employerId}`);
    if (!res.ok) throw new Error(`Glassdoor proxy error ${res.status}`);
    return await res.json();
  }
}

export class MockCultureConnector extends BaseConnector {
  static domain = 'culture';
  static label = 'Mock culture data (demo)';
  static isMock = true;

  async _fetch() {
    return {
      source: 'mock',
      employer: this.config.employerName || 'Demo Co',
      overallRating: 4.2,
      recommendToFriend: 0.78,
      ceoApproval: 0.84,
      reviewCount: 1247,
      reviewCountLast90d: 38,
      topThemes: ['Strong leadership', 'Compensation competitive', 'Work-life balance concerns', 'Growth opportunities'],
      sentimentTrend: 'stable',
      note: 'MOCK DATA — wire to Glassdoor Partner API (per-customer agreement required).',
    };
  }
}
