// Visual QA harness (dev-only): renders SwotBubbleChart to a static HTML file
// for screenshotting. Usage: npx vite-node scripts/render-swot-preview.mjs
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { writeFileSync } from 'node:fs';
import SwotBubbleChart from '../src/dashboards/swot/SwotBubbleChart.jsx';
import { REFERENCE_FACTORS, REFERENCE_ARROWS } from '../src/data/datasets/swot.js';

const svg = renderToStaticMarkup(
  createElement(SwotBubbleChart, { factors: REFERENCE_FACTORS, arrows: REFERENCE_ARROWS }),
);

const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{margin:0;background:#0b1220;display:flex;align-items:center;justify-content:center;min-height:100vh}
svg{width:900px;height:auto}
</style></head><body>${svg}</body></html>`;

const out = process.argv[2] ?? 'swot-preview.html';
writeFileSync(out, html);
console.log('written', out, '— svg bytes:', svg.length);
