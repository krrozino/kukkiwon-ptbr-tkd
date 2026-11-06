import {test,expect} from '@playwright/test';
test('busca aceita aliases nas expressões completas',async({page})=>{
 await page.goto('/glossario');
 await expect(page.locator('[data-expression="arae-makgi"]').first()).toBeVisible();
 for(const [query,id] of [['Arae makki','arae-makgi'],['arae-makki','arae-makgi'],['montong makki','momtong-makgi'],['montong mak','momtong-makgi']]){
  await page.getByRole('searchbox').fill(query);
  await expect(page.locator('[data-expression="'+id+'"]').first()).toBeVisible();
 }
});
test('glossário explica palavra e expressão em ambos os alfabetos sem reflow',async({page,isMobile})=>{
 await page.goto('/glossario');
 await expect(page.getByRole('heading',{name:'Entenda o coreano do Taekwondo',exact:true})).toBeVisible();
 await expect(page.getByText('Prévia local de conteúdo em revisão',{exact:true})).toBeVisible();
 await page.getByRole('searchbox',{name:'Buscar palavra ou expressão'}).fill('makki');
 await expect(page.locator('[data-word-card="makgi"]')).toBeVisible();
 await page.getByRole('searchbox').fill('montong');
 await expect(page.locator('[data-word-card="momtong"]')).toBeVisible();
 await page.getByRole('searchbox').fill('');
 const expression=page.locator('[data-expression="arae-makgi"][data-script="romanization"]').first();
 const word=expression.getByRole('button',{name:'Arae: significado',exact:true});
 await word.scrollIntoViewIfNeeded();const before=await page.evaluate(()=>({scrollY,height:document.documentElement.scrollHeight}));
 if(isMobile)await word.tap();else {await word.hover();await expect(page.getByRole('tooltip')).toContainText('Parte inferior');await page.keyboard.press('Escape');await expect(page.getByRole('tooltip')).toHaveCount(0);await word.click();}
 const dialog=page.getByRole('dialog',{name:'Significado de Arae'});
 await expect(dialog).toContainText('Parte inferior');await expect(dialog).toContainText('No contexto');
 const after=await page.evaluate(()=>({scrollY,height:document.documentElement.scrollHeight}));
 expect(after.height).toBe(before.height);expect(Math.abs(after.scrollY-before.scrollY)).toBeLessThan(2);
 await page.keyboard.press('Escape');await expect(word).toBeFocused();await expect(dialog).toHaveCount(0);
 const hangul=page.locator('[data-expression="arae-makgi"][data-script="hangul"]').first();
 await hangul.getByRole('button',{name:'아래: significado',exact:true}).click();
 await expect(page.getByRole('dialog')).toContainText('Parte inferior');await page.keyboard.press('Escape');
 await expression.getByRole('button',{name:'Entender Arae-makgi por inteiro',exact:true}).click();
 await expect(page.getByRole('dialog')).toContainText('Expressão completa');
 await expect(page.getByRole('dialog').getByRole('link',{name:'Abrir ficha técnica'})).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('alturas são um módulo separado e a dica permanece dentro da tela',async({page})=>{
 await page.goto('/fundamentos/alturas-e-direcoes');
 await expect(page.getByRole('heading',{name:'Alturas e direções',exact:true})).toBeVisible();
 await expect(page.locator('.body-svg,.detail-svg')).toHaveCount(0);
 const low=page.getByRole('region',{name:'Referência baixa'});
 await low.getByRole('button',{name:'아래: significado',exact:true}).focus();
 await expect(page.getByRole('tooltip')).toContainText('Parte inferior');
 const bounds=await page.getByRole('tooltip').boundingBox(),width=await page.evaluate(()=>innerWidth);
 expect(bounds!.x).toBeGreaterThanOrEqual(0);expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(width);
 await page.keyboard.press('Escape');await expect(page.getByRole('tooltip')).toHaveCount(0);
 await expect(low.getByRole('button',{name:'아래: significado',exact:true})).toBeFocused();
 await low.getByRole('button',{name:'아래: significado',exact:true}).press('Enter');
 await expect(page.getByRole('dialog')).toContainText('Parte inferior');
 await page.keyboard.press('Escape');
 await page.getByRole('region',{name:'Referência alta'}).getByRole('button',{name:'얼굴: significado',exact:true}).click();
 await expect(page.getByRole('dialog')).toContainText('Rosto');await expect(page.getByRole('dialog')).not.toContainText('Parte inferior');
});

test('ficha publicada usa segmentos editoriais e oferece link acessível',async({page})=>{
 await page.route('**/rest/v1/**',route=>route.fulfill({json:new URL(route.request().url()).pathname.endsWith('/technical_terms')?[{
  id:'example',slug:'arae-makgi',category:'makgi',hangul:'아래막기',romanization:'Arae-makgi',translation_pt:'Fixture de teste',pronunciation_pt:null,definition_pt:'Fixture local.',publication_status:'published',term_aliases:[],
 }]:[]}));
 await page.goto('/tecnica?slug=arae-makgi');
 await page.getByRole('heading',{level:1}).getByRole('button',{name:'Arae: significado',exact:true}).click();
 await expect(page.getByRole('dialog')).toContainText('Parte inferior');await page.keyboard.press('Escape');
 await page.getByRole('heading',{level:1}).getByRole('button',{name:'Entender Arae-makgi por inteiro',exact:true}).click();
 await expect(page.getByRole('dialog').getByRole('link',{name:'Abrir ficha técnica'})).toHaveAttribute('href','/tecnica?slug=arae-makgi');
});
