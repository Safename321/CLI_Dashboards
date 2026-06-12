// Builds the per-tenant connector registry. Ships demo-ready with MOCK
// connectors registered by default; flip to real implementations in Tenant
// Config once API keys + proxy endpoints are available.
import { ConnectorRegistry } from './ConnectorRegistry.js';
import { SECEdgarFinancialConnector, MockFinancialConnector } from './FinancialConnector.js';
import { MockNewsConnector } from './NewsConnector.js';
import { MockSocialSentimentConnector } from './SocialSentimentConnector.js';
import { MockMacroConnector } from './MacroConnector.js';
import { MockMarketsConnector } from './MarketsConnector.js';
import { MockInnovationConnector } from './InnovationConnector.js';
import { MockOwnedSocialConnector } from './OwnedSocialConnector.js';
import { MockCultureConnector } from './CultureConnector.js';
import { MockHRISConnector, WorkdayConnector } from './HRISConnector.js';
import { MockCustomerHealthConnector } from './CustomerHealthConnector.js';

// tenant: a tenant metadata object from config/tenants.js
// auth:   { hasSession, getToken } from the auth layer — when a session exists,
//         the real WorkdayConnector is registered (JWT-gated /api/workday;
//         serves labelled staged/CSV data until Workday creds exist).
export function buildDefaultRegistry(tenant = {}, auth = {}) {
  const reg = new ConnectorRegistry();
  const tenantId = tenant.id || 'spgi';
  const companyName = tenant.companyName || 'S&P Global';
  const ticker = tenant.ticker || 'SPGI';
  const common = { tenantId };

  // Real SEC connector for tenants with a ticker; mock otherwise.
  if (tenant.hasLiveData && ticker) {
    reg.register(new SECEdgarFinancialConnector({ ...common, cik: '0000064040', ticker, refreshMinutes: 60 * 24 }), 'sec');
  } else {
    reg.register(new MockFinancialConnector({ ...common, ticker, refreshMinutes: 60 * 24 }), 'financial-mock');
  }

  reg.register(new MockSocialSentimentConnector({ ...common, companyName, hashtags: [`#${ticker}`], refreshMinutes: 60 }), 'social-mock');
  reg.register(new MockNewsConnector({ ...common, companyName, refreshMinutes: 60 }), 'news-mock');
  reg.register(new MockMacroConnector({ ...common, refreshMinutes: 60 * 24 }), 'macro-mock');
  reg.register(new MockMarketsConnector({ ...common, ticker, refreshMinutes: 15 }), 'markets-mock');
  reg.register(new MockInnovationConnector({ ...common, companyName, refreshMinutes: 7 * 24 * 60 }), 'innovation-mock');
  reg.register(new MockOwnedSocialConnector({ ...common, pageName: `${companyName} Official`, refreshMinutes: 60 }), 'owned-social-mock');
  reg.register(new MockCultureConnector({ ...common, employerName: companyName, refreshMinutes: 24 * 60 }), 'culture-mock');
  reg.register(new MockHRISConnector({ ...common, employerName: companyName, refreshMinutes: 60 }), 'hris-mock');
  if (auth.hasSession && typeof auth.getToken === 'function') {
    // Registered alongside the mock; getLatestForDomain prefers real over mock.
    reg.register(new WorkdayConnector({ ...common, getAuthToken: auth.getToken, refreshMinutes: 60 }), 'workday');
  }
  reg.register(new MockCustomerHealthConnector({ ...common, refreshMinutes: 30 }), 'customer-health-mock');

  return reg;
}
