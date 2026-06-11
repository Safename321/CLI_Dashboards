// Domain: hris — Workday / BambooHR (customer OAuth) + mock.
import { BaseConnector } from './BaseConnector.js';

export class WorkdayConnector extends BaseConnector {
  static domain = 'hris';
  static label = 'Workday (customer HRIS)';
  static isMock = false;
  static requiresOAuth = true;

  async _fetch() {
    if (!this.config.tenantUrl || !this.config.accessToken) throw new Error('Workday requires tenantUrl + OAuth accessToken from customer');
    const proxyBase = this.config.proxyBase || '';
    const res = await fetch(`${proxyBase}/api/workday?tenant=${encodeURIComponent(this.config.tenantUrl)}`, {
      headers: { 'x-customer-token': this.config.accessToken },
    });
    if (!res.ok) throw new Error(`Workday proxy error ${res.status}`);
    return await res.json();
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
