// Fill Jobs — scoring, fit and interpretation logic (behavior spec: decoded
// v1.24L FILL_JOBS_HTML_B64 tool). Pure functions; numbers must match legacy.
import { STYLES, STYLES_FULL, DOMAINS } from '../shared/StyleRadar.jsx';
import { KEYWORDS } from '../../data/datasets/fill-jobs.js';

// Weighted, band-penalized distance between a candidate and the ASSET target.
export function calcFit(candScores, asset) {
  let wSum = 0;
  let dSum = 0;
  asset.scores.forEach((t, i) => {
    const w = 1 / asset.bands[i];
    const d = Math.abs(candScores[i] - t);
    dSum += (d + (d > asset.bands[i] ? (d - asset.bands[i]) * 2 : 0)) * w;
    wSum += w;
  });
  return dSum / wSum;
}

export function fitLabel(fit) {
  if (fit < 0.8) return { t: 'Best Fit', cls: 'best' };
  if (fit < 1.4) return { t: 'Good Fit', cls: 'good' };
  if (fit < 2.2) return { t: 'Fair Fit', cls: 'fair' };
  return { t: 'Weak Fit', cls: 'weak' };
}

// Pearson r² between candidate scores and the ASSET target profile.
export function calcR2(candScores, target) {
  const n = candScores.length;
  const xMean = candScores.reduce((a, b) => a + b, 0) / n;
  const yMean = target.reduce((a, b) => a + b, 0) / n;
  const num = candScores.reduce((s, x, i) => s + (x - xMean) * (target[i] - yMean), 0);
  const denX = Math.sqrt(candScores.reduce((s, x) => s + (x - xMean) ** 2, 0));
  const denY = Math.sqrt(target.reduce((s, y) => s + (y - yMean) ** 2, 0));
  const r = denX * denY === 0 ? 0 : num / (denX * denY);
  return (r * r).toFixed(2);
}

// Annotate + rank the candidate pool against the active ASSET profile.
// Returns a new array sorted by fit ascending, isBest on the first entry.
export function rankCandidates(candidates, asset) {
  const ranked = candidates.map((c) => ({
    ...c,
    fit: calcFit(c.scores, asset),
    mean: (c.scores.reduce((a, b) => a + b, 0) / 9).toFixed(2),
    r2: calcR2(c.scores, asset.scores),
  }));
  ranked.sort((a, b) => a.fit - b.fit);
  return ranked.map((c, i) => ({ ...c, isBest: i === 0 }));
}

// Per-cell proximity class: within band → high, within 1.5× band → mid.
export function cellLevel(value, i, asset) {
  const d = Math.abs(value - asset.scores[i]);
  if (d <= asset.bands[i]) return 'high';
  if (d <= asset.bands[i] * 1.5) return 'mid';
  return 'base';
}

// ── Job-description interpreter ─────────────────────────────────────────────
// Keyword hits move a raw 5.0 base (+0.35 / −0.25), then scores are min-max
// rescaled onto a 2–9 range (legacy scoreText).
export function scoreText(text) {
  const lo = text.toLowerCase();
  const keys = ['intrinsic', 'competitive', 'power', 'personal', 'social', 'entrusting', 'collaborative', 'contributory', 'vicarious'];
  const raw = {};
  keys.forEach((s) => {
    let sc = 5;
    KEYWORDS[s].hi.forEach((w) => { if (lo.includes(w)) sc += 0.35; });
    KEYWORDS[s].lo.forEach((w) => { if (lo.includes(w)) sc -= 0.25; });
    raw[s] = Math.max(1, Math.min(10, sc));
  });
  const vals = Object.values(raw);
  const mn = Math.min(...vals);
  const mx = Math.max(...vals);
  const rng = mx - mn || 1;
  return keys.map((s) => parseFloat((2 + ((raw[s] - mn) / rng) * 7).toFixed(1)));
}

export function extractMeta(text) {
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const title = lines[0] ? lines[0].substring(0, 80) : 'Untitled Position';
  let loc = '';
  const re = /new york|boston|chicago|dallas|miami|seattle|houston|atlanta|san francisco|los angeles|toronto|washington|philadelphia|montreal|minneapolis|london|denver|austin/i;
  for (let i = 1; i < Math.min(8, lines.length); i++) {
    if (re.test(lines[i])) { loc = lines[i].substring(0, 50); break; }
  }
  return { title, loc };
}

// Rank-based tolerance bands applied when a job is activated:
// rank 1–2 → ±0.5, 3–4 → ±0.8, 5–7 → ±1.2, 8–9 → ±1.8.
export function bandsForScores(scores) {
  const ranked = scores.map((s, i) => ({ s, i })).sort((a, b) => b.s - a.s);
  const bands = Array(9).fill(1.8);
  ranked.forEach(({ i }, ri) => { bands[i] = ri < 2 ? 0.5 : ri < 4 ? 0.8 : ri < 7 ? 1.2 : 1.8; });
  return bands;
}

// ── CLI behavioral interpretation (local; the legacy live-LLM call is not
// reproduced — see parity notes). Returns 2 paragraphs from the ranked styles.
export function buildInterpretation(title, scores, bands) {
  const ranked = scores
    .map((s, i) => ({ name: STYLES[i], full: STYLES_FULL[i], domain: DOMAINS[i], score: s, band: bands[i] }))
    .sort((a, b) => b.score - a.score);
  const top = ranked.slice(0, 3);
  const bot = ranked.slice(-2);
  const domTop = [...new Set(top.map((s) => s.domain))].join(' and ');
  const p1 =
    `The ASSET-P profile for this ${title} role reveals a ${domTop}-dominant achiever pattern. ` +
    `The top three required styles — ${top.map((s) => s.name).join(', ')} — indicate that success in this position depends on ` +
    `${top[0].name.toLowerCase()} achievement as the primary motivational driver, supported by ${top[1].name.toLowerCase()} energy ` +
    `and ${top[2].name.toLowerCase()} orientation. This combination signals a role where the achiever must generate results through ` +
    `personal drive, measured against clear external benchmarks, while maintaining the technical or relational depth the position demands.`;
  const p2 =
    `From a candidate selection standpoint, the low scores in ${bot.map((s) => s.name).join(' and ')} are as informative as the highs. ` +
    `A candidate who leads with ${bot[0].name} style — deriving meaning primarily from ${bot[0].name.toLowerCase()} achievement — will likely ` +
    `experience motivational friction in this role. Interview processes should surface how candidates describe their best performance: ` +
    `listen for language that aligns with ${top[0].name.toLowerCase()} and ${top[1].name.toLowerCase()} patterns. Style mismatches at the top two ranks ` +
    `are the most predictive of early attrition in CLI research, particularly when organizational expectations and individual achieving style diverge within the first 90 days.`;
  return [p1, p2];
}
