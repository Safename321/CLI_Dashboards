// Domain: social-sentiment — per-platform sentiment 0-10, volume, themes.
import { BaseConnector } from './BaseConnector.js';

const PLATFORMS = ['x', 'linkedin', 'facebook', 'instagram', 'tiktok'];

function seededRandom(seed) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = ((s << 5) - s + seed.charCodeAt(i)) | 0;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const THEME_POOLS = {
  x: ['product launch chatter', 'CEO mention', 'pricing complaints', 'competitor comparison', 'announcement reaction'],
  linkedin: ['hiring posts', 'leadership content', 'industry commentary', 'partnership news', 'team culture'],
  facebook: ['community posts', 'customer feedback', 'event coverage', 'brand storytelling'],
  instagram: ['behind-the-scenes', 'employee spotlights', 'product imagery', 'event reels'],
  tiktok: ['employee creator content', 'industry trends', 'product demos', 'brand challenges'],
};

export class MockSocialSentimentConnector extends BaseConnector {
  static domain = 'social-sentiment';
  static label = 'Mock social sentiment (demo)';
  static isMock = true;

  async _fetch() {
    const company = this.config.companyName || 'Demo Co';
    const handles = this.config.handles || {};
    const rand = seededRandom(company + (this.config.tenantId || ''));
    const platforms = {};
    for (const p of PLATFORMS) {
      platforms[p] = {
        platform: p,
        handle: handles[p] || null,
        sentiment: Number((5.5 + rand() * 3).toFixed(1)),
        sentimentWoW: Number(((rand() - 0.5) * 1.4).toFixed(2)),
        volume: Math.round(50 + rand() * 950),
        coverage: ['linkedin', 'facebook', 'instagram'].includes(p) ? 'public-mentions-only' : 'full',
        topThemes: this._themes(rand, p),
      };
    }
    const totalVolume = Object.values(platforms).reduce((a, b) => a + b.volume, 0);
    const overall = totalVolume > 0 ? Object.values(platforms).reduce((a, b) => a + b.sentiment * b.volume, 0) / totalVolume : 0;
    return {
      company,
      hashtags: this.config.hashtags || [],
      overallSentiment: Number(overall.toFixed(1)),
      totalVolume,
      platforms,
      note: 'MOCK DATA — replace with Brand24/Brandwatch for real customer data.',
    };
  }

  _themes(rand, platform) {
    const pool = THEME_POOLS[platform] || ['general mentions'];
    const count = 2 + Math.floor(rand() * 2);
    return Array.from({ length: count }, () => pool[Math.floor(rand() * pool.length)]).filter((v, i, a) => a.indexOf(v) === i);
  }
}

export class Brand24Connector extends BaseConnector {
  static domain = 'social-sentiment';
  static label = 'Brand24';
  static isMock = false;

  async _fetch() {
    if (!this.config.apiKey) throw new Error('Brand24 connector requires apiKey in config');
    if (!this.config.projectId) throw new Error('Brand24 connector requires projectId in config');
    const proxyBase = this.config.proxyBase || '';
    const res = await fetch(`${proxyBase}/api/brand24?projectId=${this.config.projectId}`);
    if (!res.ok) throw new Error(`Brand24 proxy error ${res.status}`);
    return await res.json();
  }
}
