// Single import surface for the connector layer.
export { BaseConnector, CACHE_TTL_MINUTES } from './BaseConnector.js';
export { ConnectorRegistry } from './ConnectorRegistry.js';

export { SECEdgarFinancialConnector, MockFinancialConnector } from './FinancialConnector.js';
export { GDELTNewsConnector, GoogleNewsRSSConnector, NewsAPIConnector, MockNewsConnector } from './NewsConnector.js';
export { MockSocialSentimentConnector, Brand24Connector } from './SocialSentimentConnector.js';
export { FREDConnector, BLSJoltsConnector, MockMacroConnector } from './MacroConnector.js';
export { AlphaVantageConnector, MockMarketsConnector } from './MarketsConnector.js';
export { USPTOPatentsConnector, MockInnovationConnector } from './InnovationConnector.js';
export { MetaGraphConnector, MockOwnedSocialConnector } from './OwnedSocialConnector.js';
export { GlassdoorConnector, MockCultureConnector } from './CultureConnector.js';
export { WorkdayConnector, BambooHRConnector, MockHRISConnector } from './HRISConnector.js';
export { SalesforceConnector, GainsightConnector, MockCustomerHealthConnector } from './CustomerHealthConnector.js';

export { buildDefaultRegistry } from './buildRegistry.js';
