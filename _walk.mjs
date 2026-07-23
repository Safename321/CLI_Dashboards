import { chromium } from 'playwright-core';
const d = JSON.parse(process.argv[2]);
const b = await chromium.launch({ headless: true });
const pg = await b.newPage();
const log = (...a)=>console.log(...a);
await pg.goto(d.link, { waitUntil:'networkidle', timeout:30000 });
await pg.waitForTimeout(1800);   // let consent page set its JS session
log('landed:', pg.url());
for (let step=0; step<20; step++) {
  const u = pg.url();
  const txt = (await pg.evaluate(()=>document.body.innerText)).toLowerCase();
  if (u.includes('task=logout')) { log('!! BOUNCED TO LOGOUT at step', step); break; }
  if (/thank you|completed|has been submitted|finished|results have been/.test(txt)) { log('== COMPLETE at step', step, u); break; }
  // fill this page adaptively
  const acted = await pg.evaluate((emp) => {
    const form = [...document.forms].find(f=>!f.action.includes('bannerv2')) || document.forms[0];
    if (!form) return 'noform';
    // text inputs: required name fields
    form.querySelectorAll('input[type=text]').forEach(i=>{
      const n=(i.name||'').toLowerCase();
      if (/first/.test(n)) i.value=emp.first;
      else if (/last/.test(n)) i.value=emp.last;
      else if (/city/.test(n)) i.value='New York';
      else if (/zip|postal/.test(n)) i.value='10001';
      else if (/address|street/.test(n)) i.value='1 Main St';
      else if (/state/.test(n)) i.value='NY';
      else if (!i.value) i.value='NA';
    });
    // selects: pick United States for country, else first non-empty option
    form.querySelectorAll('select').forEach(s=>{
      const us=[...s.options].find(o=>/united states/i.test(o.text));
      if (us) s.value=us.value;
      else { const opt=[...s.options].find(o=>o.value&&o.value!=='0'&&o.value!==''); if(opt) s.value=opt.value; }
      s.dispatchEvent(new Event('change',{bubbles:true}));
    });
    // radio groups: pick a random option in each group (varied answers)
    const groups={}; form.querySelectorAll('input[type=radio]').forEach(r=>{(groups[r.name]??=[]).push(r);});
    let radioCount=0;
    Object.values(groups).forEach(rs=>{ const pick=rs[Math.floor(Math.random()*rs.length)]; pick.checked=true; pick.dispatchEvent(new Event('click',{bubbles:true})); radioCount++; });
    return 'filled radios='+Object.keys(groups).length;
  }, d);
  // click the advance/submit control
  const btn = await pg.$('input[type=submit], button[type=submit], input[value*="Next" i], input[value*="Continue" i], input[value*="Submit" i], input[value*="Grant" i], button:has-text("Next"), button:has-text("Submit"), button:has-text("Grant")');
  let clicked=false;
  if (btn) { await Promise.all([pg.waitForLoadState('networkidle',{timeout:30000}).catch(()=>{}), btn.click().catch(()=>{})]); clicked=true; }
  else { await pg.evaluate(()=>{const f=[...document.forms].find(x=>!x.action.includes('bannerv2'))||document.forms[0]; if(f) f.submit();}); await pg.waitForLoadState('networkidle',{timeout:30000}).catch(()=>{}); clicked=true; }
  await pg.waitForTimeout(1200);
  log(`step ${step}: ${u.split('/').pop().slice(0,40)} | ${acted} | clicked=${clicked} -> ${pg.url().split('/').pop().slice(0,40)}`);
}
log('FINAL:', pg.url());
log('FINAL TEXT:', (await pg.evaluate(()=>document.body.innerText)).replace(/\n{2,}/g,'\n').slice(0,300));
await b.close();
