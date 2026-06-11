// Domain: owned-social — Meta Graph (customer-owned FB/IG) + mock.
import { BaseConnector } from './BaseConnector.js';

export class MetaGraphConnector extends BaseConnector {
  static domain = 'owned-social';
  static label = 'Meta Graph (customer-owned FB/IG)';
  static isMock = false;
  static requiresOAuth = true;

  async _fetch() {
    if (!this.config.accessToken) throw new Error("MetaGraph requires accessToken (OAuth-issued for the customer's page admin)");
    if (!this.config.pageId) throw new Error('MetaGraph requires pageId in config');
    const proxyBase = this.config.proxyBase || '';
    const res = await fetch(`${proxyBase}/api/meta-graph?pageId=${this.config.pageId}`, {
      headers: { 'x-customer-token': this.config.accessToken },
    });
    if (!res.ok) throw new Error(`Meta Graph proxy error ${res.status}`);
    return await res.json();
  }
}

export class MockOwnedSocialConnector extends BaseConnector {
  static domain = 'owned-social';
  static label = 'Mock owned-social (demo)';
  static isMock = true;

  async _fetch() {
    return {
      source: 'mock',
      page: this.config.pageName || 'Demo Co Official',
      facebook: { followers: 47800, engagement7d: 1240, sentiment: 7.2 },
      instagram: { followers: 22300, engagement7d: 880, sentiment: 7.6 },
      topPosts: [
        { platform: 'facebook', text: 'Q1 community update', engagement: 320 },
        { platform: 'instagram', text: 'Team spotlight reel', engagement: 410 },
      ],
      note: 'MOCK DATA — wire to Meta Graph API with customer OAuth.',
    };
  }
}
