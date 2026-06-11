// RSS parsing with a real XML parser (§5 — not hand-rolled regex).
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

export function parseRssItems(xml) {
  const doc = parser.parse(xml);
  const channel = doc?.rss?.channel;
  if (!channel) return [];
  const raw = channel.item;
  const items = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return items.map((it) => ({
    title: typeof it.title === 'string' ? it.title : it.title?.['#text'] || '',
    link: it.link || '',
    pubDate: it.pubDate || null,
    source: it.source?.['#text'] || it.source || null,
  }));
}
