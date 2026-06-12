// Domain: hris — Workday / BambooHR (customer OAuth) + mock.
import { BaseConnector } from './BaseConnector.js';

// Talks to the JWT-protected /api/workday on cli-proxy-server. Two modes:
//  - staged/CSV (default): no customer Workday creds needed; the server returns
//    clearly-labelled data (payload.source: 'staged' | 'csv').
//  - live (Phase 2 gate): when the customer's tenantUrl + OAuth accessToken are
//    configured they're forwarded; until the server's Workday API client exists
//    it acknowledges them in payload.meta.liveReason and still serves staged/CSV.
// requiresOAuth stays true: REAL Workday data needs customer OAuth/ISU creds.
export class WorkdayConnector extends BaseConnector {
  static domain = 'hris';
  static label = 'Workday (customer HRIS)';
  static isMock = false;
  static requiresOAuth = true;

  hasCustomerCreds() {
    return !!(this.config.tenantUrl && this.config.accessToken);
  }

  async _fetch() {
    // Session JWT (the app login), not the customer's Workday credential.
    const token = typeof this.config.getAuthToken === 'function' ? this.config.getAuthToken() : this.config.authToken;
    if (!token) throw new Error('Workday connector requires a signed-in session (missing JWT)');

    const proxyBase = this.config.proxyBase || '';
    const headers = { Authorization: `Bearer ${token}` };
    let url = `${proxyBase}/api/workday`;
    if (this.hasCustomerCreds()) {
      url += `?tenant=${encodeURIComponent(this.config.tenantUrl)}`;
      headers['x-customer-token'] = this.config.accessToken;
    }

    const res = await fetch(url, { headers });
    if (res.status === 401) throw new Error('Workday proxy unauthorized — session expired, sign in again');
    if (!res.ok) throw new Error(`Workday proxy error ${res.status}`);
    return await res.json(); // payload.source labels staged vs csv vs (later) live
  }
}

export class BambooHRConnector extends BaseConnector {
  static domain = 'hris';
  static label = 'BambooHR (customer HRIS)';
  static isMock = false;
  static requiresOAuth = true;

  async _fetch() {
    if (!this.config.subdomain || !this.config.apiKey) throw new Error('BambooHR requires subdomain + apiKey from customer');
    const proxyBase = this.config.proxyBase || '';
    const res = await fetch(`${proxyBase}/api/bamboohr?subdomain=${this.config.subdomain}`);
    if (!res.ok) throw new Error(`BambooHR proxy error ${res.status}`);
    return await res.json();
  }
}

export class MockHRISConnector extends BaseConnector {
  static domain = 'hris';
  static label = 'Mock HRIS (demo)';
  static isMock = true;

  async _fetch() {
    return {
      source: 'mock',
      employer: this.config.employerName || 'Demo Co',
      headcount: 1247,
      headcountYoY: 0.04,
      turnover12mo: 0.082,
      voluntaryTurnover12mo: 0.061,
      involuntaryTurnover12mo: 0.021,
      avgTenureYears: 4.3,
      openReqs: 38,
      timeToFillDays: 42,
      note: 'MOCK DATA — wire to Workday/BambooHR/Rippling/Lattice with customer OAuth.',
    };
  }
}
