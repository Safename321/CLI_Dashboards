// Domain: customer-health — Salesforce / Gainsight (customer OAuth) + mock.
import { BaseConnector } from './BaseConnector.js';

export class SalesforceConnector extends BaseConnector {
  static domain = 'customer-health';
  static label = 'Salesforce (customer CRM)';
  static isMock = false;
  static requiresOAuth = true;

  async _fetch() {
    if (!this.config.instanceUrl || !this.config.accessToken) throw new Error('Salesforce requires instanceUrl + OAuth accessToken from customer');
    const proxyBase = this.config.proxyBase || '';
    const res = await fetch(`${proxyBase}/api/salesforce?instance=${encodeURIComponent(this.config.instanceUrl)}`, {
      headers: { 'x-customer-token': this.config.accessToken },
    });
    if (!res.ok) throw new Error(`Salesforce proxy error ${res.status}`);
    return await res.json();
  }
}

export class GainsightConnector extends BaseConnector {
  static domain = 'customer-health';
  static label = 'Gainsight (customer success)';
  static isMock = false;
  static requiresOAuth = true;

  async _fetch() {
    if (!this.config.apiKey) throw new Error('Gainsight requires apiKey from customer');
    const proxyBase = this.config.proxyBase || '';
    const res = await fetch(`${proxyBase}/api/gainsight`, { headers: { 'x-customer-token': this.config.apiKey } });
    if (!res.ok) throw new Error(`Gainsight proxy error ${res.status}`);
    return await res.json();
  }
}

export class MockCustomerHealthConnector extends BaseConnector {
  static domain = 'customer-health';
  static label = 'Mock customer health (demo)';
  static isMock = true;

  async _fetch() {
    return {
      source: 'mock',
      accountsTotal: 8420,
      healthDistribution: { green: 0.62, yellow: 0.28, red: 0.1 },
      nps: 47,
      npsWoW: 1.2,
      grossChurn12mo: 0.045,
      netRetention: 1.12,
      arrAtRisk: 14200000,
      criticalAccounts: [
        { name: 'Acme Corp', arr: 2800000, health: 'red', signal: 'Engagement -42% in 30 days' },
        { name: 'Globex Inc', arr: 1900000, health: 'yellow', signal: 'Executive sponsor turnover' },
      ],
      note: 'MOCK DATA — wire to Salesforce/Gainsight/Zendesk with customer OAuth.',
    };
  }
}
