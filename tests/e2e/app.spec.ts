import { test,expect,type Page } from '@playwright/test';
const term={id:'t1',slug:'ap-chagi',category:'chute',hangul:'앞차기',romanization:'Ap-chagi',translation_pt:'Chute frontal',pronunciation_pt:null,definition_pt:'Fixture de teste, nunca conteúdo público.',publication_status:'published',record_kind:'technique',term_aliases:[]};
const foot={id:'r1',slug:'apchuk',region_group:'feet',atlas_area:'feet',name_pt:'Parte anterior da planta do pé',detail_view:'front',detail_x:50,detail_y:28};
async function api(page:Page,{empty=false,error=false,delay=0}={}) {
  await page.route('**/rest/v1/**',async route=>{
    if(delay)await new Promise(r=>setTimeout(r,delay));
    if(error)return route.fulfill({status:503,body:'unavailable'});
    const u=new URL(route.request().url()), table=u.pathname.split('/').pop();
    let data:unknown=[];
    if(table==='search_catalog') {
      const p=route.request().postDataJSON();
      data={items:empty?[]:[{...term,...(p.page_offset?{id:'last',slug:'last-term',romanization:'Última técnica'}:{})}],total:empty?0:601};
    } else if(table==='catalog_facets')data={categories:['chute'],regions:[{slug:foot.slug,name_pt:foot.name_pt}],families:[]};
    else if(table==='body_regions')data=!empty&&(u.searchParams.get('slug')==='eq.apchuk'||u.searchParams.get('atlas_area')==='eq.feet')?[foot]:[];
    else if(table==='body_region_terms')data=u.searchParams.has('region_id')?[{term_id:term.id,usage_context:'surface',anatomical_role:'surface',technical_terms:{slug:term.slug,romanization:term.romanization,translation_pt:term.translation_pt}}]:[];
    else if(table==='technical_terms')data=[term];
    else if(table==='term_sources')data=[{source_locator:'§1 > Ap-chagi',checked_at:'2026-01-01T00:00:00Z',content_sources:{institution:'Fixture',title:'Fonte de teste',edition:'Teste',publication_year:2011,official_url:'https://example.org/test'}}];
    await route.fulfill({json:data});
  });
}
test('atlas: teclado, seleção fixa, frente/costas e zoom com retorno',async({page})=>{
  await api(page);await page.goto('/atlas');
  await expect(page.getByRole('heading',{name:'Mãos',exact:true})).toBeVisible();
  await expect(page.getByRole('region',{name:'Explorar o mapa corporal'})).toHaveAttribute('aria-busy','false');
  const feet=page.getByRole('button',{name:'Pés — selecionar região'});
  await feet.focus();await feet.press('Enter');
  await expect(page.getByRole('heading',{name:'Pés',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Vista posterior'}).click();
  await expect(page.getByRole('img',{name:'Corpo humano — vista posterior'})).toBeVisible();
  await page.getByRole('button',{name:'Ampliar região'}).click();
  await expect(page.getByRole('img',{name:/Detalhe original do pé/})).toBeVisible();
  await page.getByRole('button',{name:'Voltar ao corpo inteiro'}).click();
  await expect(page.getByRole('img',{name:'Corpo humano — vista posterior'})).toBeVisible();
  await feet.focus();await feet.press('Space');
  await expect(page).toHaveURL(/region=feet/);
});
test('atlas: deep link, detalhe publicado e navegação à ficha',async({page})=>{
  await api(page);await page.goto('/atlas?region=apchuk');
  await expect(page.getByRole('heading',{name:foot.name_pt,exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Ap-chagi'})).toBeVisible();
  await page.getByRole('link',{name:'Ap-chagi'}).click();
  await expect(page).toHaveURL(/tecnica\?slug=ap-chagi/);
  await expect(page.getByRole('heading',{name:'Ap-chagi',exact:true})).toBeVisible();
});
test('atlas: toque expande pé e Escape retorna, sem overflow',async({page,isMobile})=>{
  await api(page);await page.goto('/atlas?region=feet');
  const zoom=page.getByRole('button',{name:'Ampliar região'});
  if(isMobile)await zoom.tap();else await zoom.click();
  const hotspot=page.getByRole('button',{name:foot.name_pt,exact:true}).first();
  if(isMobile)await hotspot.tap();else await hotspot.click();
  await expect(page.getByRole('heading',{name:foot.name_pt,exact:true})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Ampliar região'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Ampliar região'})).toBeFocused();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
test('atlas: região desconhecida e ausência de dados não inventam termos',async({page})=>{
  await api(page,{empty:true});await page.goto('/atlas?region=inexistente');
  await expect(page.getByText(/Região não encontrada ou ainda não publicada/)).toBeVisible();
  await expect(page.getByText('23 de 23 termos')).toBeVisible();
  await expect(page.getByRole('link',{name:'Ap-chagi'})).toHaveCount(0);
});
test('atlas: carregamento e erro de API permitem tentar novamente',async({page})=>{
  await api(page,{error:true,delay:300});await page.goto('/atlas?region=feet');
  await expect(page.getByText('Carregando regiões publicadas...')).toBeVisible();
  await expect(page.getByRole('alert').filter({hasText:'Não foi possível carregar'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Tentar novamente'})).toBeVisible();
});
test('catálogo: filtros no servidor, página seguinte e erro explícito',async({page})=>{
  await api(page);await page.goto('/catalogo');
  await expect(page.getByRole('link',{name:/Ap-chagi/})).toBeVisible();
  const response=page.waitForRequest(r=>r.url().endsWith('/rpc/search_catalog')&&r.postDataJSON().page_offset===24);
  await page.getByRole('button',{name:'Próxima página'}).click();await response;
  await expect(page.getByRole('link',{name:/Última técnica/})).toBeVisible();
  await page.getByRole('searchbox').fill('앞차기');
  await expect.poll(async()=>new URL(page.url()).searchParams.get('page')).toBeNull();
  await expect(page.getByRole('link',{name:/Ap-chagi/})).toBeVisible();
});
test('catálogo: rede indisponível não aparece como catálogo vazio',async({page})=>{
  await api(page,{error:true});await page.goto('/catalogo');
  await expect(page.getByRole('alert').filter({hasText:'Não foi possível carregar o catálogo'})).toBeVisible();
  await expect(page.getByText('Nenhuma técnica publicada ainda.')).toHaveCount(0);
});
test('atlas: hover preserva seleção e histórico restaura a região',async({page,isMobile})=>{
  await api(page);await page.goto('/atlas?region=hands');
  await expect(page.getByText('23 de 23 termos')).toBeVisible();
  // A consulta inicial precisa terminar antes de contar requisições provocadas pelo hover.
  await expect(page.locator('.atlas-information')).toHaveAttribute('aria-busy','false');
  let requests=0;page.on('request',r=>{if(r.url().includes('/rest/v1/'))requests++;});
  if(!isMobile) {
    await page.getByRole('button',{name:'Pés — selecionar região'}).locator('path').first().hover();
    await expect(page.getByRole('heading',{name:'Mãos',exact:true})).toBeVisible();
    expect(requests).toBe(0);
  }
  await page.getByRole('button',{name:'Pés — selecionar região'}).locator('path').first().click();
  await expect(page.getByRole('heading',{name:'Pés',exact:true})).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading',{name:'Mãos',exact:true})).toBeVisible();
});
test('atlas: captura das vistas e detalhes com fixtures isoladas',async({page},testInfo)=>{
  await api(page);await page.goto('/atlas?region=feet&view=back');
  await expect(page.getByRole('button',{name:foot.name_pt,exact:true})).toBeVisible();
  await page.screenshot({path:'test-results/previews/atlas-'+testInfo.project.name+'.png',fullPage:true});
  await page.getByRole('button',{name:'Ampliar região'}).click();
  await page.screenshot({path:'test-results/previews/atlas-'+testInfo.project.name+'-detail.png',fullPage:true});
});
test('atlas: histórico preserva o lado do detalhe técnico',async({page})=>{
  await api(page);await page.goto('/atlas?region=apchuk&detail=back');
  await expect(page.getByRole('img',{name:'Detalhe original do pé — dorso'})).toBeVisible();
  await page.getByRole('button',{name:'Planta',exact:true}).click();
  await page.goBack();
  await expect(page.getByRole('img',{name:'Detalhe original do pé — dorso'})).toBeVisible();
});
test('atlas: navegação cancelada não altera a região que está carregando',async({page})=>{
  await api(page);await page.goto('/atlas?region=hands');
  await expect(page.getByText('23 de 23 termos')).toBeVisible();
  let release!:()=>void;
  const held=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/rest/v1/body_regions?**',async route=>{
    if(new URL(route.request().url()).searchParams.has('slug')) {
      await held;
      try {await route.fulfill({json:[]});}catch{/* a requisição anterior foi cancelada */}
    } else await route.fallback();
  });
  const first=page.waitForRequest(r=>r.url().includes('slug=eq.apchuk'));
  await page.evaluate(()=>{
    history.pushState(null,'','/atlas?region=apchuk');dispatchEvent(new PopStateEvent('popstate'));
  });await first;
  const second=page.waitForRequest(r=>r.url().includes('slug=eq.inexistente'));
  await page.evaluate(()=>{
    history.pushState(null,'','/atlas?region=inexistente');dispatchEvent(new PopStateEvent('popstate'));
  });await second;
  try {
    await expect(page.getByRole('region',{name:'Explorar o mapa corporal'})).toHaveAttribute('aria-busy','true');
    await expect(page.getByText('Não foi possível carregar o link da região.')).toHaveCount(0);
  } finally {release();}
  await expect(page.getByText('Região não encontrada ou ainda não publicada.')).toBeVisible();
});
