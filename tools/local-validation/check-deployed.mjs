import {chromium,devices,expect} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
const base=process.env.KUKKIWON_PREVIEW_URL||'https://kukkiwon-ptbr-tkd-preview.kukkiwon-ptbr-tkd.workers.dev';
if(new URL(base).origin!=='https://kukkiwon-ptbr-tkd-preview.kukkiwon-ptbr-tkd.workers.dev')throw new Error('Este smoke aceita somente a prévia dedicada aprovada.');
const browser=await chromium.launch(),results=[];
mkdirSync('.preview-build/external',{recursive:true});
try{
 for(const [name,device] of [['desktop',devices['Desktop Chrome']],['mobile',devices['Pixel 7']]]){
  const context=await browser.newContext({...device,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/atlas?region=sonnal');
  const cutout=page.locator('svg [data-region="sonnal"]');
  await cutout.click();await expect(cutout).toHaveAttribute('aria-pressed','true');
  const card=page.getByRole('region',{name:'Ficha contextual'});
  await expect(card).toContainText('손날');await expect(page.getByRole('tooltip')).toContainText('Sonnal');
  await page.getByRole('button',{name:'Ver aqui: Sonnal-an-makgi',exact:true}).click();
  await expect(card.getByRole('heading',{name:'Sonnal-an-makgi',exact:true})).toBeVisible();
  expect(new URL(page.url()).pathname.replace(/\/$/,'')).toBe('/atlas');
  await page.screenshot({path:'.preview-build/external/atlas-'+name+'.png',fullPage:true});
  results.push(name+': atlas com Sonnal, recorte selecionado, tooltip e técnica contextual');
  await page.goto(base+'/catalogo');await page.getByRole('searchbox').fill('sonnal-an-makgi');
  await page.getByRole('link',{name:/Sonnal-an-makgi/}).click();
  await expect(page.getByRole('heading',{name:'Sonnal-an-makgi',exact:true})).toBeVisible();
  await expect(page.getByText('Conteúdo provisório para revisão. Tradução e técnica ainda não aprovadas.',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'☆ Salvar nos estudos',exact:true}).click();
  results.push(name+': pesquisa, ficha e favorito');
  await page.goto(base+'/estudos');await expect(page.getByRole('button',{name:'Sonnal-an-makgi',exact:true})).toBeVisible();
  await page.getByLabel('Nova pasta',{exact:true}).fill('Revisão da aula');
  await page.getByRole('button',{name:'Criar pasta',exact:true}).click();
  await page.getByRole('button',{name:'Revisão da aula',exact:true}).click();await page.reload();
  await expect(page.getByRole('button',{name:'Revisão da aula',exact:true})).toBeVisible();
  results.push(name+': estudos persistidos e pasta');
  await page.goto(base+'/curriculos');await expect(page.getByRole('heading',{name:'Primeiros passos · faixa branca',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Modo professor · editar exemplo',exact:true}).click();
  await page.getByLabel('Nome do currículo',{exact:true}).fill('Teste externo local ao navegador');
  await page.getByRole('button',{name:'Salvar rascunho local',exact:true}).click();await page.reload();
  await expect(page.getByRole('heading',{name:'Teste externo local ao navegador',exact:true})).toBeVisible();
  results.push(name+': editor de currículo e persistência');
  await page.goto(base+'/escolas');await expect(page.getByLabel('Email',{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Criar conta de responsável',exact:true})).toBeVisible();
  await page.screenshot({path:'.preview-build/external/school-login-'+name+'.png',fullPage:true});
  results.push(name+': login conectado disponível');
  if(errors.length)throw new Error(name+': '+errors.join('; '));
  if(!await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))throw new Error('Overflow '+name);
  await context.close();
 }
 writeFileSync('.preview-build/external/smoke.json',JSON.stringify({status:'passed',base,checks:results,remoteAccountWrites:0},null,2));
 for(const r of results)process.stdout.write('OK '+r+'\n');
}finally{await browser.close();}
