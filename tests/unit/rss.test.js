import { describe, it, expect } from 'vitest';
import { parseRssItems } from '../../cli-proxy-server/lib/rss.js';

const GOOGLE_NEWS_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>"S&amp;P Global" - Google News</title>
    <item>
      <title>S&amp;P Global beats earnings expectations</title>
      <link>https://news.example.com/a</link>
      <pubDate>Tue, 10 Jun 2026 12:00:00 GMT</pubDate>
      <source url="https://example.com">Example Wire</source>
    </item>
    <item>
      <title><![CDATA[Ratings division under review]]></title>
      <link>https://news.example.com/b</link>
      <pubDate>Tue, 10 Jun 2026 09:00:00 GMT</pubDate>
      <source url="https://other.com">Other Outlet</source>
    </item>
  </channel>
</rss>`;

describe('parseRssItems (real XML parser, §5)', () => {
  it('parses all items with title/link/pubDate/source', () => {
    const items = parseRssItems(GOOGLE_NEWS_SAMPLE);
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      title: 'S&P Global beats earnings expectations',
      link: 'https://news.example.com/a',
      source: 'Example Wire',
    });
    expect(items[0].pubDate).toMatch(/10 Jun 2026/);
  });

  it('handles CDATA-wrapped titles', () => {
    const items = parseRssItems(GOOGLE_NEWS_SAMPLE);
    expect(items[1].title).toBe('Ratings division under review');
  });

  it('normalizes a single-item channel to an array', () => {
    const single = `<rss><channel><item><title>Solo</title><link>https://x</link></item></channel></rss>`;
    const items = parseRssItems(single);
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('Solo');
  });

  it('returns [] for an empty channel and for non-RSS input', () => {
    expect(parseRssItems('<rss><channel><title>empty</title></channel></rss>')).toEqual([]);
    expect(parseRssItems('<html><body>not rss</body></html>')).toEqual([]);
  });
});
