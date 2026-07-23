import { chromium } from 'playwright-core';
const link = process.argv[2];
const b = await chromium.launch({ headless: true });
const pg = await b.newPage();
await pg.goto(link, { waitUntil: 'networkidle', timeout: 30000 });
await pg.waitForTimeout(1500);
console.log('STEP1 (consent):', pg.url());
// grant permission / confirm -> section1
const grant = await pg.$('input[value*="Grant" i], button:has-text("Grant"), input[value*="Confirm" i]');
if (grant) { await grant.click().catch(()=>{}); }
else { const f = await pg.$('form[action*="section1"]'); if (f) await pg.evaluate(()=>{const fm=[...document.forms].find(x=>x.action.includes('section1')); if(fm) fm.submit();}); }
await pg.waitForLoadState('networkidle', {timeout:30000}).catch(()=>{});
await pg.waitForTimeout(1500);
console.log('STEP2 (after consent):', pg.url());
const info = await pg.evaluate(() => {
  const qs = [...document.querySelectorAll('input[type=radio]')];
  const names = [...new Set(qs.map(r=>r.name))];
  const opts = {};
  names.slice(0,3).forEach(n=>opts[n]=[...document.querySelectorAll(`input[name="${n}"]`)].map(r=>r.value));
  const form = document.forms[0];
  return {
    title: document.title,
    radioGroups: names.length,
    sampleGroups: names.slice(0,5),
    sampleOptions: opts,
    selects: document.querySelectorAll('select').length,
    formAction: form ? form.action : null,
    formMethod: form ? form.method : null,
    nextBtns: [...document.querySelectorAll('input[type=submit],button')].map(x=>(x.value||x.innerText||'').trim()).filter(Boolean).slice(0,8),
    textHead: document.body.innerText.replace(/\n{2,}/g,'\n').slice(0,500),
  };
});
console.log(JSON.stringify(info, null, 1));
await pg.screenshot({ path: '/c/Users/nahin/AppData/Local/Temp/claude/C--Users-nahin/457ad49b-a7d8-4ef6-a76c-abf39e820383/scratchpad/section1.png', fullPage:true }).catch(()=>{});
await b.close();
