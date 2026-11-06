import {test,expect,type Page} from '@playwright/test';

async function emptyCatalog(page:Page) {
  await page.route('**/rest/v1/**',route=>route.fulfill({json:[]}));
}

test('região técnica da borda do polegar mantém posição ao refinar os dedos',async({page})=>{
  await page.route('**/rest/v1/**',route=>{
    const table=new URL(route.request().url()).pathname.split('/').pop();
    return route.fulfill({json:table==='body_regions'?[{
      id:'edge',slug:'sonnaldeung',name_pt:'Borda da mão do lado do polegar',
      region_group:'hands',atlas_area:'hands',detail_view:'both',detail_x:28,detail_y:50,
    }]:[]});
  });
  await page.goto('/atlas?region=hands&zoom=1');
  await expect(page.locator('.detail-svg [data-region="sonnaldeung"]')).toHaveAttribute('aria-label','Borda da mão do lado do polegar');
  for(const view of ['Palma','Dorso']){
    await page.getByRole('button',{name:view,exact:true}).click();
    await page.locator('.detail-svg').scrollIntoViewIfNeeded();
    const hits=await page.locator('.anatomy-geometry').evaluate(group=>{
      const matrix=(group as SVGGraphicsElement).getScreenCTM()!;
      return [[27,50],[28,96]].map(([x,y])=>{
        const point=new DOMPoint(x,y).matrixTransform(matrix);
        return document.elementFromPoint(point.x,point.y)?.closest('[data-region]')?.getAttribute('data-region');
      });
    });
    expect(hits[0]).toBe('sonnaldeung');
    expect(hits[1]).toBe('illustration-hand-side');
  }
});

test('zona em revisão tem apenas duas linhas e não consulta ficha técnica',async({page})=>{
  await emptyCatalog(page);
  const queries:string[]=[];
  page.on('request',r=>{if(r.url().includes('/technical_terms'))queries.push(r.url());});
  await page.goto('/atlas?region=hands&zoom=1');
  await page.locator('[data-legend-zone="sonbadak"]').click();
  const panel=page.getByRole('tooltip');
  await expect(panel).toContainText('Palma da mão');
  await expect(panel).toContainText('Superfície interna');
  await expect(panel.locator('a,[lang="ko"]')).toHaveCount(0);
  expect(queries).toEqual([]);
});

for(const area of ['hands','feet']) {
  test(area+': vista dorsal espelha silhueta e recortes juntos',async({page})=>{
    await emptyCatalog(page);
    await page.goto('/atlas?region='+area+'&zoom=1');
    const position=()=>page.locator('.anatomy-geometry').evaluate((group)=>{
      const g=group as SVGGraphicsElement;
      const matrix=g.getScreenCTM()!;
      // Ponto do polegar/hálux na geometria de referência e eixo central.
      const edge=new DOMPoint(15,60).matrixTransform(matrix);
      const center=new DOMPoint(50,60).matrixTransform(matrix);
      return {edge:edge.x,center:center.x};
    });
    await expect(page.locator('.anatomy-geometry')).toBeVisible();
    const front=await position();
    expect(front.edge).toBeLessThan(front.center);
    await page.getByRole('button',{name:'Dorso',exact:true}).click();
    const back=await position();
    expect(back.edge).toBeGreaterThan(back.center);
    const slug=area==='hands'?'sonnal':'balnal';
    await page.locator('[data-legend-zone="'+slug+'"]').click();
    await expect(page.locator('.detail-svg [data-region="'+slug+'"]')).toHaveAttribute('aria-pressed','true');
    await expect(page.getByRole('tooltip')).toContainText('Borda do lado do dedo mínimo');
  });
}

test('recortes cobrem dedos, base, laterais, arco e calcanhar dentro da silhueta',async({page})=>{
  await emptyCatalog(page);
  for(const area of ['hands','feet'])for(const view of ['front','back']){
    await page.goto('/atlas?region='+area+'&zoom=1&detail='+view);
    await expect(page.locator('.anatomy-geometry')).toBeVisible();
    const coverage=await page.locator('.detail-svg').evaluate(svg=>{
      const outline=svg.querySelector('.anatomy-outline') as SVGPathElement;
      const paths=[...svg.querySelectorAll('.surface-cutout path')] as SVGPathElement[];
      let inside=0,covered=0;
      for(let x=2.3;x<98;x+=2)for(let y=2.3;y<136;y+=2){
        const p=new DOMPoint(x,y);
        if(outline.isPointInFill(p)){inside++;if(paths.some(path=>path.isPointInFill(p)))covered++;}
      }
      return {ratio:covered/inside,clip:svg.querySelector('.anatomy-cutouts')?.getAttribute('clip-path')};
    });
    expect(coverage.ratio).toBeGreaterThan(.98);
    expect(coverage.clip).toMatch(/^url\(#/);
    if(area==='hands'){
      await expect(page.locator('.detail-svg [data-region^="illustration-finger-"]')).toHaveCount(4);
      await expect(page.locator('.detail-svg [data-region="illustration-thumb"]')).toBeVisible();
    }else if(view==='front')await expect(page.locator('.detail-svg [data-region="illustration-foot-arch"]')).toBeVisible();
  }
});

test('primeiro toque e legenda continuam estáveis nas duas vistas do pé',async({page,isMobile})=>{
  await emptyCatalog(page);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/atlas?region=feet&zoom=1');
  for(const [view,slug] of [['Planta','balbadak'],['Dorso','baldeung']]){
    await page.getByRole('button',{name:view,exact:true}).click();
    const target=page.locator('.detail-svg [data-region="'+slug+'"]');
    await target.scrollIntoViewIfNeeded();
    const before=await page.evaluate(()=>({scrollY,height:document.documentElement.scrollHeight}));
    if(isMobile)await target.locator('path').tap();else await target.locator('path').click();
    await expect(target).toHaveAttribute('aria-pressed','true');
    await expect(page.getByRole('tooltip')).toContainText(view==='Planta'?'Planta do pé':'Dorso do pé');
    const after=await page.evaluate(()=>({scrollY,height:document.documentElement.scrollHeight}));
    expect(Math.abs(after.scrollY-before.scrollY)).toBeLessThan(8);
    expect(Math.abs(after.height-before.height)).toBeLessThan(1);
    await expect(page.locator('[data-legend-zone="'+slug+'"]')).toHaveAttribute('aria-pressed','true');
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
