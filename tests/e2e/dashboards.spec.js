// E2E smoke + content assertions (§6): every view in the nav mounts without
// throwing, renders expected content, and produces no console errors.
import { test, expect } from '@playwright/test';
import { NAV_ITEMS } from '../../src/config/nav.js';

const EMAIL = process.env.E2E_EMAIL || 'admin@snpglobal.com';
const PASSWORD = process.env.E2E_PASSWORD || 'ConnectiveDemo2026!';

// Per-view content expectations (substrings that must appear after mounting).
// Keys are nav view ids; every nav item must be listed so new dashboards
// can't ship without a smoke assertion.
const VIEW_EXPECTATIONS = {
  overview: ['Overview', 'Revenue'],
  'ceo-advisory': ['CEO Advisory'],
  'meeting-prep': ['Meeting Prep'],
  merger: ['Post Merger Updates'],
  'board-packet': ['Board'],
  'investor-relations': ['Investor Relations'],
  'early-warning': ['Early Warning'],
  'investor-behavior': ['Investor Behavior'],
  'scenario-modeling': ['Scenario Modeling'],
  'causal-analysis': ['Behavioral'],
  external: ['External View'],
  'customer-health': ['Customer Health'],
  'merger-integration': ['Post Merger Integration'],
  'org-oasi': ['OASI'],
  'aspirational-oasi': ['Aspirational'],
  'individual-asi': ['CLI Instruments'],
  sentiment: ['Sentiment'],
  'employee-leading': ['Employee Leading'],
  'culture-change': ['Culture Change'],
  'mgmt-challenges': ['Management Challenges', 'Peace Pad', 'Achieving Styles Framework'],
  hiring: ['Hiring'],
  'fill-jobs': ['Fill Jobs', 'ASSET-P Position Interpreter'],
  'tenant-config': ['Tenant Config'],
  'data-provenance': ['Data Provenance'],
  'about-cli': ['About CLI'],
  'further-reading': ['Further Reading'],
  help: ['Help'],
};

async function login(page) {
  await page.goto('/');
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await expect(page.locator('nav')).toContainText('Overview', { timeout: 10_000 });
}

test.describe('dashboard smoke', () => {
  test('every nav view has a smoke expectation', () => {
    const missing = NAV_ITEMS.filter((n) => !VIEW_EXPECTATIONS[n.id]).map((n) => n.id);
    expect(missing).toEqual([]);
  });

  test('login works without secure-context APIs', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await login(page);
    const secureCtx = errors.filter((e) => /crypto\.subtle|SubtleCrypto|secure context/i.test(e));
    expect(secureCtx).toEqual([]);
  });

  test('rejects bad credentials with a clean message', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', 'definitely-wrong');
    await page.click('button[type="submit"]');
    await expect(page.getByText('Incorrect email or password')).toBeVisible();
  });

  for (const [view, expectations] of Object.entries(VIEW_EXPECTATIONS)) {
    test(`view "${view}" mounts with expected content and no console errors`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

      await login(page);
      // Navigate via the sidebar button for the view (real user path), using
      // the exact label from the nav config.
      const navItem = NAV_ITEMS.find((n) => n.id === view);
      expect(navItem, `view "${view}" must exist in nav.js`).toBeTruthy();
      await page.locator('nav button', { hasText: navItem.label }).first().click();
      for (const text of expectations) {
        await expect(page.locator('main')).toContainText(text, { timeout: 10_000 });
      }
      expect(errors).toEqual([]);
    });
  }
});
