// SWOT report smoke test — verifies buildSwotReportHtml embeds the ACTUAL
// materiality-bubble diagram (renderToStaticMarkup of SwotBubbleChart), not a
// text translation of it (2026-08 requirement).
import { describe, it, expect } from 'vitest';
import { buildSwotReportHtml } from '../../src/dashboards/swot/report.js';
import { REFERENCE_FACTORS, REFERENCE_ARROWS, REFERENCE_RECOMMENDATIONS } from '../../src/data/datasets/swot.js';

describe('SWOT report — embedded diagram', () => {
  const html = buildSwotReportHtml({
    factors: REFERENCE_FACTORS,
    arrows: REFERENCE_ARROWS,
    title: 'Strategic SWOT',
    subtitle: 'test profile',
    meta: { respondents: 15, instrument: 'OASI' },
    recommendations: REFERENCE_RECOMMENDATIONS,
  });

  it('embeds an inline SVG chart, not just text', () => {
    expect(html).toContain('<svg');
    expect(html).toContain('class="swotchart"');
    // the chart bakes its legend caption into the SVG
    expect(html).toContain('bubble area = strategic materiality');
  });

  it('still renders the ranked matrix and recommendations alongside the diagram', () => {
    expect(html).toContain('SWOT Matrix');
    expect(html).toContain('Strategic Recommendations');
  });

  it('renders without throwing when no arrows are supplied', () => {
    expect(() => buildSwotReportHtml({ factors: REFERENCE_FACTORS, title: 't', subtitle: 's' })).not.toThrow();
  });
});
