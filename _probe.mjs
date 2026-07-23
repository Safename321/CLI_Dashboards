import { chromium } from 'playwright-core';
const link = process.argv[2];
const b = await chromium.launch({ headless: true });
const pg = await b.newPage();
const trail = [];
pg.on('framenavigated', f => { if (f === pg.mainFrame()) trail.push(f.url()); });
await pg.goto(link, { waitUntil: 'networkidle', timeout: 30000 }).catch(e=>console.log('goto err', e.message));
await pg.waitForTimeout(2000);
console.log('FINAL URL:', pg.url());
console.log('TITLE:', await pg.title());
console.log('NAV TRAIL:', trail.slice(-6).join('  ->  '));
const info = await pg.evaluate(() => ({
  textHead: document.body.innerText.slice(0, 700),
  forms: [...document.forms].map(f => ({ action: f.action, method: f.method, inputs: f.elements.length })),
  radios: document.querySelectorAll('input[type=radio]').length,
  selects: document.querySelectorAll('select').length,
  tables: document.querySelectorAll('table').length,
  btns: [...document.querySelectorAll('input[type=submit],button,input[type=button],a')].map(x=>(x.value||x.innerText||'').trim()).filter(Boolean).slice(0,12),
}));
console.log('RADIOS:', info.radios, '| SELECTS:', info.selects, '| TABLES:', info.tables);
console.log('FORMS:', JSON.stringify(info.forms));
console.log('BUTTONS/LINKS:', JSON.stringify(info.btns));
console.log('--- visible text head ---'); console.log(info.textHead);
await pg.screenshot({ path: '/c/Users/nahin/AppData/Local/Temp/claude/C--Users-nahin/457ad49b-a7d8-4ef6-a76c-abf39e820383/scratchpad/probe.png' }).catch(()=>{});
await b.close();
