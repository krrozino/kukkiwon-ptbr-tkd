import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{
  await page.route('**/rest/v1/**',async route=>{
    const original=new URL(route.request().url());
    const path=original.pathname.replace(/^\/rest\/v1/,'')+original.search;
    const response=await route.fetch({url:process.env.KUKKIWON_LOCAL_API_URL+path});
    await route.fulfill({response});
  });
});
test('dados reais da API: catálogo e busca depois de 1000 registros',async({page})=>{
  await page.goto('/catalogo?page=42');
  await expect(page.getByRole('status')).toContainText('1006 registro(s)');
  await expect(page.getByRole('link',{name:/QA Técnica/}).first()).toBeVisible();
  await page.getByRole('searchbox').fill('앞차기');
  await expect(page.getByRole('link',{name:/QA Ap-chagi/})).toBeVisible();
  await expect(page.getByRole('status')).toContainText('1 registro(s)');
});
test('dados reais da API: atlas, ficha, fonte e família',async({page})=>{
  await page.goto('/atlas?region=qa-foot');
  await expect(page.getByRole('heading',{name:'QA região do pé',exact:true})).toBeVisible();
  await page.getByRole('link',{name:'QA Ap-chagi',exact:true}).click();
  await expect(page.getByRole('heading',{name:'QA Ap-chagi',exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Fixture de integração'})).toHaveAttribute('href','https://example.org/qa');
  await expect(page.getByRole('link',{name:'QA Família',exact:true})).toBeVisible();
  await page.getByRole('link',{name:'QA região do pé',exact:true}).click();
  await expect(page).toHaveURL(/atlas\?region=qa-foot/);
});
test('dados reais da API: toque/teclado selecionam detalhe do pé',async({page,isMobile})=>{
  await page.goto('/atlas?region=feet');
  await expect(page.getByRole('button',{name:'QA região do pé',exact:true})).toBeVisible();
  const zoom=page.getByRole('button',{name:'Ampliar região'});
  if(isMobile)await zoom.tap();else await zoom.click();
  const region=page.getByRole('button',{name:'QA região do pé',exact:true}).first();
  if(isMobile)await region.tap();else{await region.focus();await region.press('Enter');}
  await expect(page.getByRole('link',{name:'QA Ap-chagi',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
