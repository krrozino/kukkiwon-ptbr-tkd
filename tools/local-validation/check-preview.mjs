import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:net';
import {launchService} from './process.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..'),require=createRequire(new URL('../../package.json',import.meta.url));
const review=JSON.parse(readFileSync(resolve(root,'.preview-build/release.json'),'utf8')).mode==='editorial_review_opt_in';
const {chromium,devices}=require('@playwright/test');
const listener=createServer();await new Promise(done=>listener.listen(0,'127.0.0.1',done));
const port=listener.address().port;await new Promise(done=>listener.close(done));
const pkg=JSON.parse(readFileSync(resolve(root,'node_modules/wrangler/package.json'),'utf8'));
const wrangler=resolve(root,'node_modules/wrangler',pkg.bin.wrangler);
const worker=await launchService(process.execPath,[wrangler,'dev','--local','--config','wrangler.preview.jsonc','--ip','127.0.0.1','--port',String(port)],{
  cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe'],env:{...process.env,WRANGLER_SEND_METRICS:'false'},
});
let logs='';worker.stdout.on('data',c=>{logs+=c;});worker.stderr.on('data',c=>{logs+=c;});
let browser;
try {
  const base='http://127.0.0.1:'+port;
  let ready=false;
  for(let i=0;i<150;i++) {
    if(worker.exitCode!==null)throw new Error('Worker local encerrou: '+logs.slice(-2000));
    try {if((await fetch(base+'/')).ok){ready=true;break;}}catch{}
    await new Promise(done=>setTimeout(done,200));
  }
  if(!ready)throw new Error('Timeout do Worker local: '+logs.slice(-1000));
  browser=await chromium.launch();
  mkdirSync(resolve(root,'.preview-build/screenshots'),{recursive:true});
  for(const [name,device] of [['desktop',devices['Desktop Chrome']],['mobile',devices['Pixel 7']]]) {
    const context=await browser.newContext(device),page=await context.newPage();
    const remote=[];page.on('request',r=>{if(!r.url().startsWith(base))remote.push(r.url());});
    await page.goto(base+(review?'/atlas?region=sonnal':'/atlas'));
    if(review) {
      await page.locator('svg [data-region="sonnal"]').click();
      await page.getByRole('region',{name:'Ficha contextual'}).getByRole('heading',{name:'Sonnal',exact:true}).waitFor();
      await page.getByRole('button',{name:'Ver aqui: Sonnal-an-makgi',exact:true}).waitFor();
      await page.screenshot({path:resolve(root,'.preview-build/screenshots/atlas-v2-'+name+'.png'),fullPage:true});
      await page.getByRole('button',{name:'Voltar ao corpo inteiro'}).click();
    }
    await page.getByRole('button',{name:'Vista posterior'}).click();
    await page.getByRole('img',{name:'Corpo humano — vista posterior'}).waitFor();
    await page.getByRole('button',{name:'Ampliar região'}).click();
    await page.getByRole('img',{name:/Detalhe original da mão/}).waitFor();
    await page.getByRole('button',{name:'Voltar ao corpo inteiro'}).click();
    await page.screenshot({path:resolve(root,'.preview-build/screenshots/atlas-'+name+'.png'),fullPage:true});
    await page.goto(base+'/catalogo');
    if(review){await page.getByRole('searchbox').fill('sonnal');await page.getByRole('link',{name:/Sonnal-an-makgi/}).waitFor();}
    else await page.getByText('Catálogo ainda não conectado nesta versão.',{exact:true}).waitFor();
    if(remote.length)throw new Error('Prévia offline tentou consultar serviços externos.');
    if(!await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))throw new Error('Overflow na prévia '+name);
    await context.close();process.stdout.write('OK Cloudflare Worker local: '+name+'\n');
  }
  writeFileSync(resolve(root,'.preview-build/smoke.json'),JSON.stringify({status:'passed',runtime:'Wrangler local',profiles:['desktop','mobile'],remoteRequests:0,uploaded:false},null,2));
} finally {
  await browser?.close();
  if(worker.exitCode===null) {
    if(process.platform==='win32')await new Promise(done=>{
      const stop=spawn('taskkill',['/PID',String(worker.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});stop.once('exit',done);
    });
    else worker.kill('SIGTERM');
  }
}
