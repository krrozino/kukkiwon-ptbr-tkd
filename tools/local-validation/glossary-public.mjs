import {chromium,devices,expect} from '@playwright/test';
import {resolve,extname} from 'node:path';
import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
const root=resolve(process.argv[2]||'dist');
const approved=JSON.parse(readFileSync('content/glossary/approved.json','utf8'));
const review=JSON.parse(readFileSync('content/glossary/review.json','utf8'));
const released=new Set([...approved.words,...approved.expressions].map(e=>e.id));
const browser=await chromium.launch(),checks=[],errors=[];
try{
 for(const [name,device] of [['desktop',devices['Desktop Chrome']],['mobile',devices['Pixel 7']]]){
  const context=await browser.newContext(device),page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>{
   const u=new URL(route.request().url());
   if(u.hostname!=='public.local')return route.abort();
   const path=resolve(root,'.'+u.pathname+(extname(u.pathname)?'':'/index.html'));
   if(!path.startsWith(root)||!existsSync(path))return route.fulfill({status:404,body:''});
   return route.fulfill({path,contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'})[extname(path)]||'application/octet-stream'});
  });
  await page.goto('http://public.local/glossario',{waitUntil:'networkidle'});
  await expect(page.locator('[data-word-card]')).toHaveCount(approved.words.length);
  await expect(page.locator('.glossary-review-banner')).toHaveCount(0);
  for(const entry of review.words.filter(e=>!released.has(e.id)))await expect(page.locator('[data-word-card="'+entry.id+'"]')).toHaveCount(0);
  for(const entry of review.expressions.filter(e=>!released.has(e.id)))await expect(page.locator('[data-expression="'+entry.id+'"]')).toHaveCount(0);
  await page.goto('http://public.local/fundamentos/alturas-e-direcoes',{waitUntil:'networkidle'});
  await expect(page.locator('.height-card')).toHaveCount(3);
  await expect(page.locator('.glossary-review-banner')).toHaveCount(0);
  if(!approved.words.length)await expect(page.locator('.korean-word')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  checks.push({device:name,approvedWords:approved.words.length,reviewLeak:false});
  await context.close();
 }
 expect(errors).toEqual([]);
 mkdirSync('.local-validation',{recursive:true});
 writeFileSync('.local-validation/glossary-public-smoke.json',JSON.stringify({status:'passed',checks,javascriptErrors:errors.length},null,2));
 console.log('Pacote público aprovado em desktop/mobile: nenhum termo em revisão exposto.');
}finally{await browser.close();}
