import { chromium } from 'playwright-core';
import { readFileSync, appendFileSync, writeFileSync } from 'node:fs';
const CSV = String.raw`C:\Users\nahin\demo\theiatech-exp50-links.csv`;
const OUT = String.raw`C:\Users\nahin\AppData\Local\Temp\claude\C--Users-nahin\457ad49b-a7d8-4ef6-a76c-abf39e820383\scratchpad\sweep_results.csv`;
const rows = readFileSync(CSV,'utf8').trim().split('\n').slice(1).map(l=>{
  const [email,cfg,seq,link] = l.split(',');
  return {email,cfg,seq,link};
});
writeFileSync(OUT,'email,config_no,sequence,opens_to_reach,final_page\n');
const b = await chromium.launch({ headless:true });
for (const r of rows) {
  const ctx = await b.newContext();
  const pg = await ctx.newPage();
  pg.setDefaultTimeout(20000);
  let reachedOn = 'never', finalPage = '';
  for (let open=1; open<=3; open++) {
    await pg.goto(r.link,{waitUntil:'networkidle',timeout:25000}).catch(()=>{});
    await pg.waitForTimeout(1800);
    const last = pg.url().split('/').pop();
    if (!pg.url().includes('task=logout')) { reachedOn=String(open); finalPage=last.slice(0,30); break; }
    await pg.waitForTimeout(2500);
  }
  if (reachedOn==='never') finalPage='login(bounced x3)';
  const line = `${r.email},${r.cfg},"${r.seq}",${reachedOn},${finalPage}`;
  appendFileSync(OUT, line+'\n');
  console.log(`cfg${r.cfg} ${r.seq.padEnd(28)} -> open#${reachedOn} ${finalPage}`);
  await ctx.close();
  await new Promise(z=>setTimeout(z,2500));
}
await b.close();
console.log('DONE');
