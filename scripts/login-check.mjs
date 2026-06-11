// Manual verification helper (§8): drives a real browser through the login
// flow against a given origin and reports console errors (incl. crypto.subtle
// / secure-context complaints, which must never appear).
// Usage: node scripts/login-check.mjs [origin] [email] [password]
import { chromium } from '@playwright/test';

const origin = process.argv[2] || 'http://localhost:8787';
const email = process.argv[3] || 'admin@snpglobal.com';
const password = process.argv[4] || process.env.CLI_DEMO_PASSWORD || 'ConnectiveDemo2026!';

const browser = await chromium.launch({ args: ['--ignore-certificate-errors'] });
const page = await browser.newPage({ ignoreHTTPSErrors: true });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

await page.goto(origin + '/', { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', email);
await page.fill('input[type="password"]', password);
await page.click('button[type="submit"]');
await page.waitForTimeout(2500);

const body = (await page.locator('body').innerText()).slice(0, 500).replace(/\n+/g, ' | ');
const authed = !body.includes('Sign in');
console.log('ORIGIN:', origin);
console.log('LOGIN', authed ? 'OK' : 'FAILED');
console.log('AFTER LOGIN:', body.slice(0, 300));
const secureCtx = errors.filter((e) => /crypto\.subtle|SubtleCrypto|secure context/i.test(e));
console.log('CONSOLE ERRORS:', errors.length ? errors : 'none');
console.log('SECURE-CONTEXT ERRORS:', secureCtx.length ? secureCtx : 'none');
await browser.close();
process.exit(authed && secureCtx.length === 0 ? 0 : 1);
