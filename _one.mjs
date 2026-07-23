import { chromium } from 'playwright-core';
const b = await chromium.launch({ headless:true });
const pg = await (await b.newContext()).newPage();
let res='?';
for(let a=0;a<4;a++){
  await pg.goto(process.argv[2],{waitUntil:'networkidle',timeout:30000}).catch(()=>{});
  await pg.waitForTimeout(2500);
  if(!pg.url().includes('task=logout')){ res='REACHED: '+pg.url().split('/').pop(); break; }
  res='bounced'; console.log(`  attempt ${a+1}: bounced, retrying`); await pg.waitForTimeout(4000);
}
console.log('emp040 (previously bounced) ->', res);
await b.close();
