// Domain: news — GDELT tone, Google News RSS, NewsAPI (real) + deterministic mock.
// Real connectors route through the proxy so the §5 RSS-parser/USPTO/BLS fixes
// live server-side; the client just consumes normalized JSON.
import { BaseConnector } from './BaseConnector.js';

export class GDELTNewsConnector extends BaseConnector {
  static domain = 'news';
  static label = 'GDELT 2.0 (global news + tone)';
  static isMock = false;

  async _fetch() {
    const company = this.config.companyName || 'S&P Global';
    const proxyBase = this.config.proxyBase || '';
    const res = await fetch(`${proxyBase}/api/gdelt?query=${encodeURIComponent(`"${company}"`)}&timespan=7d`);
    if (!res.ok) throw new Error(`GDELT proxy error ${res.status}`);
    const data = await res.json();
    const articles = data.articles || [];
    const tones = articles.map((a) => a.tone).filter((t) => typeof t === 'number');
    const avgTone = tones.length ? tones.reduce((a, b) => a + b, 0) / tones.length : 0;
    const sentimentScore = Math.max(0, Math.min(10, (avgTone + 10) / 2));
    const dayMs = 24 * 60 * 60 * 1000;
    const recent = articles.filter((a) => a.seendate && Date.now() - Date.parse(a.seendate) < dayMs);
    const negativeRecent = recent.filter((a) => a.tone < -3);
    return {
      source: 'GDELT 2.0',
      company,
      volume: articles.length,
      sentimentScore: Number(sentimentScore.toFixed(2)),
      sentimentWoW: null,
      recentNegativeCount: negativeRecent.length,
      crisisActive: negativeRecent.length >= 3,
      topHeadlines: articles.slice(0, 5).map((a) => ({ title: a.title, url: a.url, tone: a.tone, seenAt: a.seendate, source: a.domain })),
    };
  }
}

export class GoogleNewsRSSConnector extends BaseConnector {
  static domain = 'news';
  static label = 'Google News RSS (basic mentions)';
  static isMock = false;

  async _fetch() {
    const company = this.config.companyName || 'S&P Global';
    const proxyBase = this.config.proxyBase || '';
    const res = await fetch(`${proxyBase}/api/google-news?q=${encodeURIComponent(company)}`);
    if (!res.ok) throw new Error(`Google News proxy error ${res.status}`);
    const data = await res.json();
    return {
      source: 'Google News RSS',
      company,
      volume: data.items?.length || 0,
      sentimentScore: null,
      topHeadlines: (data.items || []).slice(0, 10).map((i) => ({ title: i.title, url: i.link, publishedAt: i.pubDate, source: i.source })),
    };
  }
}

export class NewsAPIConnector extends BaseConnector {
  static domain = 'news';
  static label = 'NewsAPI (commercial)';
  static isMock = false;

  async _fetch() {
    if (!this.config.apiKey) throw new Error('NewsAPI connector requires apiKey in config');
    const proxyBase = this.config.proxyBase || '';
    const res = await fetch(`${proxyBase}/api/newsapi?q=${encodeURIComponent(this.config.companyName || 'S&P Global')}`);
    if (!res.ok) throw new Error(`NewsAPI proxy error ${res.status}`);
    return await res.json();
  }
}

export class MockNewsConnector extends BaseConnector {
  static domain = 'news';
  static label = 'Mock news (demo)';
  static isMock = true;

  async _fetch() {
    const company = this.config.companyName || 'Demo Co';
    const seed = company.length;
    return {
      source: 'mock',
      company,
      volume: 12 + (seed % 18),
      sentimentScore: Number((6 + (seed % 30) / 10).toFixed(1)),
      sentimentWoW: -0.2,
      recentNegativeCount: 0,
      crisisActive: false,
      topHeadlines: [
        { title: `${company} announces quarterly earnings beat`, tone: 4.5, source: 'reuters.com' },
        { title: `${company} CEO discusses 2026 outlook`, tone: 2.1, source: 'wsj.com' },
        { title: `Analyst maintains buy rating on ${company}`, tone: 3.8, source: 'bloomberg.com' },
      ],
      note: 'MOCK DATA — wire to GDELT or NewsAPI for live signals.',
    };
  }
}
