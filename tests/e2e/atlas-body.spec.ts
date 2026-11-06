import {test,expect} from '@playwright/test';

test.beforeEach(async({page})=>{
  await page.route('**/rest/v1/**',route=>route.fulfill({json:[]}));
});

test('controles do corpo ficam ocultos nos detalhes e a vista anterior volta com foco',async({page})=>{
  await page.goto('/atlas');
  await page.getByRole('button',{name:'Vista posterior',exact:true}).click();
  await page.getByRole('button',{name:'Ampliar região',exact:true}).click();
  await expect(page.getByRole('group',{name:'Vista do corpo',exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Palma',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Dorso',exact:true}).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Vista posterior',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.getByRole('button',{name:'Ampliar região',exact:true})).toBeFocused();
  await page.getByRole('button',{name:'Pés',exact:true}).click();
  await page.getByRole('button',{name:'Ampliar região',exact:true}).click();
  await expect(page.getByRole('group',{name:'Vista do corpo',exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Planta',exact:true})).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('group',{name:'Vista do corpo',exact:true})).toBeVisible();
});

test('um toque numa região publicada cria uma só entrada no histórico e preserva antebraços',async({page,isMobile})=>{
  await page.route('**/rest/v1/**',route=>{
    const table=new URL(route.request().url()).pathname.split('/').pop();
    return route.fulfill({json:table==='body_regions'?['palgup','anpalmok','bakkatpalmok'].map(slug=>({
      id:slug,slug,region_group:'arms',atlas_area:'arms',name_pt:'Publicado '+slug,detail_view:'both',detail_x:null,detail_y:null,
    })):[]});
  });
  await page.goto('/atlas?region=arms&zoom=1');
  await expect(page.locator('.body-detail [data-region="arms-elbow"]')).toHaveAttribute('aria-label','Publicado palgup');
  for(const slug of ['anpalmok','bakkatpalmok'])await expect(page.locator('.body-detail').getByRole('button',{name:'Publicado '+slug,exact:true}).first()).toBeVisible();
  const before=page.url(),target=page.locator('.body-detail [data-region="arms-elbow"]');
  await target.scrollIntoViewIfNeeded();
  const point=await target.evaluate(g=>new DOMPoint(68,185).matrixTransform((g as SVGGraphicsElement).getScreenCTM()!).toJSON());
  if(isMobile)await page.touchscreen.tap(point.x,point.y);else await page.mouse.click(point.x,point.y);
  await expect(page).toHaveURL(/region=palgup/);
  await page.goBack();await expect(page).toHaveURL(before);
});

for(const [area,count] of [['head',5],['torso',4],['arms',4],['legs',3]] as const){
  test(area+': ilustrações, primeiro toque e legenda independem de termos publicados',async({page,isMobile})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('/atlas?region='+area+'&zoom=1');
    const cuts=page.locator('.body-detail .surface-cutout');
    await expect(cuts.first()).toBeVisible();
    expect(await cuts.count()).toBeGreaterThanOrEqual(count);
    const target=cuts.first();await target.scrollIntoViewIfNeeded();
    const before=await page.evaluate(()=>({scrollY,height:document.documentElement.scrollHeight}));
    const point=await target.evaluate(g=>new DOMPoint(Number(g.getAttribute('data-anchor-x')),Number(g.getAttribute('data-anchor-y'))).matrixTransform((g as SVGGraphicsElement).getScreenCTM()!).toJSON());
    if(isMobile)await page.touchscreen.tap(point.x,point.y);else await page.mouse.click(point.x,point.y);
    await expect(target).toHaveAttribute('aria-pressed','true');
    await expect(page.getByRole('tooltip')).toHaveText('Zona ilustrativaNome técnico em revisão');
    const id=await target.getAttribute('data-region');
    await expect(page.locator('[data-legend-zone="'+id+'"]')).toHaveAttribute('aria-pressed','true');
    const after=await page.evaluate(()=>({scrollY,height:document.documentElement.scrollHeight}));
    expect(Math.abs(after.scrollY-before.scrollY)).toBeLessThan(8);
    expect(after.height).toBe(before.height);
    await page.getByRole('button',{name:'Vista posterior',exact:true}).click();
    await expect(cuts.first()).toBeVisible();
    if(area==='head')await expect(page.locator('[data-region="head-occiput"]')).toBeVisible();
    if(area==='legs'){
      await expect(page.locator('[data-region="legs-calf"]')).toBeVisible();
      await expect(page.locator('[data-region="legs-shin"]')).toHaveCount(0);
    }
    const legend=page.locator('.body-detail [data-legend-zone]').last();
    await legend.click();await expect(legend).toHaveAttribute('aria-pressed','true');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}
