// Manual verification: open the AI mentor, send a message, and confirm the
// user-facing handling (with no ANTHROPIC_API_KEY the server 500s and the UI
// must show a friendly banner — never a raw server error).
import { chromium } from '@playwright/test';

const origin = process.argv[2] || 'http://localhost:8787';
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

await page.goto(origin + '/', { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'admin@snpglobal.com');
await page.fill('input[type="password"]', process.env.CLI_DEMO_PASSWORD || 'ConnectiveDemo2026!');
await page.click('button[type="submit"]');
await page.waitForTimeout(1500);

await page.click('button[aria-label="Open AI mentor"]');
await page.waitForTimeout(800);
const panel = await page.locator('body').innerText();
console.log('MENTOR OPEN:', /mentor|CLAIM|ask/i.test(panel) ? 'OK' : 'NOT FOUND');

const input = page.locator('textarea, input[type="text"]').last();
await input.fill('What do my OASI scores mean?');
await input.press('Enter');
await page.waitForTimeout(4000);

const after = await page.locator('body').innerText();
const rawLeak = /ANTHROPIC_API_KEY|Internal server error|misconfigured/i.test(after);
const friendly = /unavailable|try again|sign in again|wait/i.test(after);
console.log('RAW ERROR LEAKED:', rawLeak ? 'YES (BAD)' : 'no');
console.log('FRIENDLY MESSAGE SHOWN:', friendly ? 'yes' : 'NO (BAD)');
console.log('PAGE ERRORS:', errors.length ? errors : 'none');
await browser.close();
process.exit(!rawLeak && friendly && errors.length === 0 ? 0 : 1);
