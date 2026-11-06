import {expect,test} from '@playwright/test';

test('public Poomsae empty state works without calling the optional schema',async({page})=>{
  const schemaRequests:string[]=[];
  page.on('request',request=>{if(/\/poomsae_(forms|steps)/.test(request.url()))schemaRequests.push(request.url());});
  await page.goto('/poomsae');
  await expect(page.getByRole('heading',{name:'Poomsae',exact:true})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Poomsae em preparação'})).toBeVisible();
  await expect(page.getByRole('link',{name:'Consultar catálogo',exact:true})).toHaveAttribute('href','/catalogo');
  expect(schemaRequests).toEqual([]);
});

test('learning has an honest empty state and no synthetic exercises',async({page})=>{
  await page.route('**/rest/v1/**',route=>route.fulfill({json:{items:[],total:0}}));
  await page.goto('/aprender');
  await expect(page.getByRole('heading',{name:'Revisar e aprender',exact:true})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Exercícios em preparação'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Mostrar resposta'})).toHaveCount(0);
  await expect(page.getByRole('link',{name:'Explorar o glossário',exact:true})).toHaveAttribute('href','/glossario');
});

test('learning derives a flashcard from a checked published API record and links its source',async({page})=>{
  const term={id:'fixture-a',slug:'fixture-a',category:'test',romanization:'Fixture A',hangul:null,translation_pt:'Resposta da fixture',definition_pt:'Texto só de teste.',pronunciation_pt:null,publication_status:'published',record_kind:'technique',term_aliases:[]};
  await page.route('**/rest/v1/**',route=>{
    const table=new URL(route.request().url()).pathname.split('/').pop();
    return route.fulfill({json:table==='search_catalog'?{items:[term],total:1}:table==='technical_terms'?[term]:table==='term_sources'?[{source_locator:'Fixture §1',checked_at:'2026-11-06',content_sources:{institution:'Teste',title:'Fonte da fixture',edition:null,publication_year:2026,official_url:'https://example.org/fixture'}}]:[]});
  });
  await page.goto('/aprender');
  const card=page.getByRole('region',{name:'Cartão de estudo'});
  await expect(card).toContainText('Fixture A');
  await expect(card).not.toContainText('Resposta da fixture');
  await card.getByRole('button',{name:'Mostrar resposta'}).click();
  await expect(card).toContainText('Resposta da fixture');
  await expect(card.getByRole('link',{name:'Fonte da fixture'})).toHaveAttribute('href','https://example.org/fixture');
  await expect(card.getByRole('link',{name:'Consultar ficha completa'})).toHaveAttribute('href','/tecnica?slug=fixture-a');
  await expect(page.getByRole('heading',{name:'Quiz de tradução'})).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
