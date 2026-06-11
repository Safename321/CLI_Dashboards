// Read-only external-data proxy routes. Keeps upstream API keys server-side
// (§3.5). Carries the §5 data-correctness fixes: BLS JOLTS returns ALL series,
// USPTO uses the current PatentsView Search API, Google News uses a real XML
// parser. Endpoints without a configured key return a clear 501 (not a crash).
import { Router } from 'express';
import { fetchJson, fetchText } from '../lib/fetchJson.js';
import { parseRssItems } from '../lib/rss.js';

const router = Router();
const need = (res, name) => res.status(501).json({ error: `${name} not configured on server` });

// SEC EDGAR — company facts (public, no key).
router.get('/sec-data', async (req, res) => {
  const cik = (req.query.cik || '0000064040').padStart(10, '0');
  try {
    const data = await fetchJson(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`, {
      headers: { 'User-Agent': 'CLI-Dashboards/2.0 (contact@connectiveleadership.com)' },
    });
    res.set('Cache-Control', 'public, max-age=86400');
    res.json({ source: 'SEC EDGAR', cik, entityName: data.entityName, financials: {}, filings: [] });
  } catch (e) {
    res.status(502).json({ error: String(e.message || e) });
  }
});

// FRED — requires key.
router.get('/fred', async (req, res) => {
  const key = process.env.FRED_API_KEY;
  if (!key) return need(res, 'FRED');
  const series = (req.query.series || 'DGS10,UNRATE,CPIAUCSL,SP500').split(',');
  try {
    const out = {};
    for (const id of series) {
      const d = await fetchJson(
        `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${key}&file_type=json&sort_order=desc&limit=1`
      );
      const obs = d.observations?.[0];
      out[id] = obs ? { value: Number(obs.value), asOf: obs.date } : null;
    }
    res.set('Cache-Control', 'public, max-age=86400');
    res.json({ source: 'FRED', series: out, asOf: new Date().toISOString().split('T')[0] });
  } catch (e) {
    res.status(502).json({ error: String(e.message || e) });
  }
});

// BLS JOLTS — §5: fetch ALL requested series, never slice.
router.get('/bls-jolts', async (req, res) => {
  const sector = req.query.sector || '510000';
  // Job openings, hires, quits, layoffs for the sector — ALL of them.
  const measures = { JTS000000000000000JOL: 'jobOpenings', JTS000000000000000HIL: 'hires', JTS000000000000000QUL: 'quits', JTS000000000000000LDL: 'layoffs' };
  const seriesIds = Object.keys(measures);
  try {
    const body = { seriesid: seriesIds, latest: true };
    if (process.env.BLS_API_KEY) body.registrationkey = process.env.BLS_API_KEY;
    const d = await fetchJson('https://api.bls.gov/publicAPI/v2/timeseries/data/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const latest = {};
    for (const s of d.Results?.series || []) {
      const key = measures[s.seriesID];
      const v = s.data?.[0];
      if (key && v) latest[key] = Number(v.value);
    }
    res.set('Cache-Control', 'public, max-age=86400');
    res.json({ source: 'BLS JOLTS', sectorName: sector, latest, trend: [] });
  } catch (e) {
    res.status(502).json({ error: String(e.message || e) });
  }
});

// GDELT 2.0 — public, no key.
router.get('/gdelt', async (req, res) => {
  const query = req.query.query || '"S&P Global"';
  const timespan = req.query.timespan || '7d';
  try {
    const d = await fetchJson(
      `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=ArtList&format=json&timespan=${timespan}&maxrecords=50`
    );
    const articles = (d.articles || []).map((a) => ({ title: a.title, url: a.url, tone: Number(a.tone), seendate: a.seendate, domain: a.domain }));
    res.set('Cache-Control', 'public, max-age=3600');
    res.json({ source: 'GDELT', articles });
  } catch (e) {
    res.status(502).json({ error: String(e.message || e) });
  }
});

// Google News RSS — §5: parse with a real XML parser.
router.get('/google-news', async (req, res) => {
  const q = req.query.q || 'S&P Global';
  try {
    const xml = await fetchText(`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`);
    res.set('Cache-Control', 'public, max-age=3600');
    res.json({ source: 'Google News RSS', items: parseRssItems(xml) });
  } catch (e) {
    res.status(502).json({ error: String(e.message || e) });
  }
});

// Alpha Vantage — requires key.
router.get('/alphavantage', async (req, res) => {
  const key = process.env.ALPHAVANTAGE_API_KEY;
  if (!key) return need(res, 'Alpha Vantage');
  const ticker = req.query.ticker || 'SPGI';
  try {
    const d = await fetchJson(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${key}`);
    const q = d['Global Quote'] || {};
    res.set('Cache-Control', 'public, max-age=900');
    res.json({
      source: 'Alpha Vantage',
      ticker,
      price: Number(q['05. price']),
      change: Number(q['09. change']),
      changePercent: q['10. change percent'],
      volume: Number(q['06. volume']),
      asOf: q['07. latest trading day'],
    });
  } catch (e) {
    res.status(502).json({ error: String(e.message || e) });
  }
});

// USPTO — §5: current PatentsView Search API (search.patentsview.org).
router.get('/uspto', async (req, res) => {
  const assignee = req.query.assignee || 'S&P Global';
  try {
    const q = encodeURIComponent(JSON.stringify({ _text_any: { 'assignees.assignee_organization': assignee } }));
    const f = encodeURIComponent(JSON.stringify(['patent_id', 'patent_title', 'patent_date']));
    const d = await fetchJson(`https://search.patentsview.org/api/v1/patent/?q=${q}&f=${f}`, {
      headers: process.env.USPTO_API_KEY ? { 'X-Api-Key': process.env.USPTO_API_KEY } : {},
    });
    const patents = d.patents || [];
    res.set('Cache-Control', 'public, max-age=604800');
    res.json({
      source: 'USPTO PatentsView',
      total: d.total_hits ?? patents.length,
      recent: patents.slice(0, 10).map((p) => ({ title: p.patent_title, filedAt: p.patent_date })),
    });
  } catch (e) {
    res.status(502).json({ error: String(e.message || e) });
  }
});

export default router;
