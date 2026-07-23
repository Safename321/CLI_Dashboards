import { chromium } from 'playwright-core';
const b = await chromium.launch({ headless: true });
const pg = await b.newPage();
await pg.goto(process.argv[2], { waitUntil:'networkidle', timeout:30000 });
await pg.evaluate(()=>{const f=[...document.forms].find(x=>x.action.includes('section1')); if(f) f.submit();});
await pg.waitForLoadState('networkidle',{timeout:30000}).catch(()=>{});
await pg.waitForTimeout(1000);
console.log('URL:', pg.url());
const fields = await pg.evaluate(() => {
  // find the form that is NOT the banner/language form
  const dataForm = [...document.forms].find(f=>!f.action.includes('bannerv2')) || document.forms[document.forms.length-1];
  const els = dataForm ? [...dataForm.elements] : [];
  const named = els.filter(e=>e.name).map(e=>({name:e.name, type:e.type||e.tagName, req:e.required||/required/i.test(e.className), opts: e.tagName==='SELECT'? e.options.length : undefined}));
  return {
    formAction: dataForm?.action, formMethod: dataForm?.method,
    fieldCount: named.length,
    fields: named,
    submit: [...document.querySelectorAll('input[type=submit],button[type=submit],input[type=button]')].map(x=>({v:x.value||x.innerText, oc:(x.getAttribute('onclick')||'').slice(0,60)})),
  };
});
console.log(JSON.stringify(fields, null, 1));
await b.close();
