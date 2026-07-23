import { chromium } from 'playwright-core';
const d = JSON.parse(process.argv[2]);
const log=(...a)=>console.log(`[${new Date().toISOString().slice(11,19)}]`,...a);
const b = await chromium.launch({ headless:true });
const pg = await (await b.newContext()).newPage();
pg.setDefaultTimeout(25000);
let landed=false;
for(let a=0;a<5;a++){
  await pg.goto(d.link,{waitUntil:'networkidle',timeout:30000}).catch(e=>log('goto',e.message));
  await pg.waitForTimeout(2000);
  if(!pg.url().includes('task=logout')){landed=true;break;}
  log(`bounce ${a+1}, backoff`); await pg.waitForTimeout(3000*(a+1));
}
if(!landed){log('GAVE UP bounce');await b.close();process.exit(2);}
log('reached',pg.url().split('/').pop());
const DONE=/thank you for completing|has been submitted|successfully completed|assessment is complete|completed the assessment|submission (is )?complete/i;
const DONEURL=/thankyou|complete|finish|results\.asp|congrat/i;
let outcome='maxsteps';
for(let s=0;s<30;s++){
  const u=pg.url();
  if(u.includes('task=logout')){outcome='logout-midway';break;}
  const txt=await pg.evaluate(()=>document.body.innerText);
  if(DONE.test(txt)||DONEURL.test(u.split('/').pop())){outcome='COMPLETE';break;}
  const info=await pg.evaluate((emp)=>{
    const form=[...document.forms].find(f=>!f.action.includes('bannerv2'))||document.forms[0];
    if(!form)return{r:0,note:'noform'};
    form.querySelectorAll('input[type=text]').forEach(i=>{const n=(i.name||'').toLowerCase();
      if(/first/.test(n))i.value=emp.first;else if(/last/.test(n))i.value=emp.last;
      else if(/city/.test(n))i.value='New York';else if(/zip|postal/.test(n))i.value='10001';
      else if(/address|street/.test(n))i.value='1 Main St';else if(/state/.test(n))i.value='NY';else if(!i.value)i.value='NA';});
    form.querySelectorAll('select').forEach(s=>{const us=[...s.options].find(o=>/united states/i.test(o.text));
      if(us)s.value=us.value;else{const o=[...s.options].filter(o=>o.value&&o.value!=='0'&&o.value!=='');if(o.length)s.value=o[Math.floor(Math.random()*o.length)].value;}s.dispatchEvent(new Event('change',{bubbles:true}));});
    // consent grant radio: pick the one whose label/value implies grant/allow/yes
    const g={};form.querySelectorAll('input[type=radio]').forEach(r=>{(g[r.name]??=[]).push(r);});
    Object.values(g).forEach(rs=>{
      const grant=rs.find(r=>/grant|allow|yes|agree|1/i.test(r.value));
      const pick=grant||rs[Math.floor(Math.random()*rs.length)]; pick.checked=true; pick.dispatchEvent(new Event('click',{bubbles:true}));});
    return{r:Object.keys(g).length,note:'filled'};
  },d);
  const btn=await pg.$('input[value*="Grant" i], input[value*="Next" i], input[value*="Continue" i], input[value*="Submit" i], input[value*="Finish" i], input[value*="Save" i], input[type=submit], button[type=submit]');
  const before=pg.url();
  if(btn){await Promise.all([pg.waitForLoadState('networkidle',{timeout:30000}).catch(()=>{}),btn.click().catch(()=>{})]);}
  else{await pg.evaluate(()=>{const f=[...document.forms].find(x=>!x.action.includes('bannerv2'))||document.forms[0];if(f)f.submit();});await pg.waitForLoadState('networkidle',{timeout:30000}).catch(()=>{});}
  await pg.waitForTimeout(1500);
  log(`step ${s}: ${before.split('/').pop().slice(0,26)} radios=${info.r} -> ${pg.url().split('/').pop().slice(0,26)}`);
  if(before===pg.url()&&s>0){outcome='stuck';break;}
}
log('OUTCOME:',outcome,'| final:',pg.url().split('/').pop());
log('text:',(await pg.evaluate(()=>document.body.innerText)).replace(/\s+/g,' ').slice(0,220));
await pg.screenshot({path:'/c/Users/nahin/AppData/Local/Temp/claude/C--Users-nahin/457ad49b-a7d8-4ef6-a76c-abf39e820383/scratchpad/c2.png',fullPage:true}).catch(()=>{});
await b.close();
