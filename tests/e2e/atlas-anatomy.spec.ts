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

test('zona ilustrada explica a anatomia sem consultar ficha técnica não publicada',async({page})=>{
  await emptyCatalog(page);
  const queries:string[]=[];
  page.on('request',r=>{if(r.url().includes('/technical_terms'))queries.push(r.url());});
  await page.goto('/atlas?region=hands&zoom=1');
  await page.locator('[data-legend-zone="sonbadak"]').click();
  const panel=page.getByRole('tooltip');
  await expect(panel).toContainText('Palma da mão');
  await expect(panel).toContainText('Superfície interna');
  await expect(panel.locator('[lang="ko"],a[href^="/tecnica"]')).toHaveCount(0);
  await expect(panel.getByRole("link",{name:"Fontes e referências"})).toHaveAttribute("href","/fontes");
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
    await expect(page.getByRole('tooltip')).toContainText(area==='hands'?'Borda do lado do dedo mínimo':'Borda externa do pé');
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

test('geometria SVG da mão tem sobreposição amostrada zero, sem captura invisível e hit-testing preciso nos 4 estados',async({page})=>{
  await emptyCatalog(page);
  await page.goto('/atlas?region=hands&zoom=1');
  for(const viewLabel of ['Palma','Dorso'] as const){
    await page.getByRole('button',{name:viewLabel,exact:true}).click();
    for(const postureLabel of ['Mão aberta','Punho'] as const){
      await page.getByRole('button',{name:postureLabel,exact:true}).click();
      await page.locator('.detail-svg').scrollIntoViewIfNeeded();
      const metrics=await page.locator('.detail-svg').evaluate((svg,state)=>{
        const group=svg.querySelector('.anatomy-geometry') as SVGGraphicsElement;
        const ctm=group.getScreenCTM()!;
        const outline=svg.querySelector('.anatomy-outline') as SVGPathElement;
        const cutouts=[...svg.querySelectorAll('.surface-cutout')] as SVGGElement[];
        const paths=cutouts.map(g=>({
          slug:g.getAttribute('data-region')!,
          color:g.style.getPropertyValue('--surface-color').trim(),
          fill:getComputedStyle(g.querySelector('path')!).fill,
          path:g.querySelector('path') as SVGPathElement,
        }));
        let inside=0,covered=0,overlaps=0,outsideFill=0,outsideDomHit=0;
        for(let x=2.3;x<98;x+=2)for(let y=2.3;y<136;y+=2){
          const p=new DOMPoint(x,y);
          const inOutline=outline.isPointInFill(p);
          const hits=paths.filter(item=>item.path.isPointInFill(p));
          if(inOutline){
            inside++;
            if(hits.length>=1)covered++;
            if(hits.length>1)overlaps++;
          }else{
            if(hits.length>0)outsideFill++;
            const screenPt=p.matrixTransform(ctm);
            const domHit=document.elementFromPoint(screenPt.x,screenPt.y)?.closest('[data-region]');
            if(domHit)outsideDomHit++;
          }
        }
        const checkPoint=(x:number,y:number)=>{
          const p=new DOMPoint(x,y);
          const screenPt=p.matrixTransform(ctm);
          return document.elementFromPoint(screenPt.x,screenPt.y)?.closest('[data-region]')?.getAttribute('data-region')??null;
        };
        const boundaryProbes=state.postureLabel==='Mão aberta'?{
          cleftThumbIndex:checkPoint(22,58),
          cleftIndexMiddle:checkPoint(38,42),
          cleftMiddleRing:checkPoint(50,42),
          cleftRingLittle:checkPoint(61,48),
          indexLeftOfCleft:checkPoint(36,35),
          middleRightOfIndex:checkPoint(40,35),
          middleLeftOfRing:checkPoint(48,35),
          ringRightOfMiddle:checkPoint(52,35),
          ringLeftOfLittle:checkPoint(59,45),
          littleRightOfRing:checkPoint(63,45),
          sonnaldeungSideOfIndex:checkPoint(30.0,52),
          indexSideOfSonnaldeung:checkPoint(31.5,52),
          sonnaldeungAboveWeb:checkPoint(27,71.25),
          webBelowSonnaldeung:checkPoint(27,72.75),
          webLeftOfPalm:checkPoint(34.75,76),
          palmRightOfWeb:checkPoint(36.25,76),
          thumbLeftOfWeb:checkPoint(21.6,79),
          webRightOfThumb:checkPoint(23.4,79),
          sonnalInnerSide:checkPoint(62.25,81.5),
          sonnalOuterSide:checkPoint(63.75,81.5),
          sonnaldeungEdge:checkPoint(27,50),
          indexShaft:checkPoint(33,50),
          sonnalEdge:checkPoint(66.5,88),
          centralPalmOrDorsum:checkPoint(52,82),
          thumbWeb:checkPoint(28,77),
          thumbBody:checkPoint(16,69),
        }:{
          jumeokKnuckles:checkPoint(46,42),
          fistBody:checkPoint(44,75),
          mejumeokEdge:checkPoint(74.5,74),
          fistBase:checkPoint(48,106),
        };
        return {
          inside,
          ratio:covered/inside,
          overlaps,
          outsideFill,
          outsideDomHit,
          count:paths.length,
          allColored:paths.every(p=>p.color.startsWith('#')&&p.fill!=='none'&&p.fill!=='transparent'),
          boundaryProbes,
        };
      },{viewLabel,postureLabel});
      expect(metrics.inside).toBeGreaterThan(350);
      expect(metrics.ratio).toBeGreaterThan(.99);
      expect(metrics.overlaps).toBe(0);
      expect(metrics.outsideFill).toBe(0);
      expect(metrics.outsideDomHit).toBe(0);
      expect(metrics.allColored).toBe(true);
      if(postureLabel==='Mão aberta'){
        expect(metrics.count).toBe(11);
        expect(metrics.boundaryProbes).toEqual({
          cleftThumbIndex:null,
          cleftIndexMiddle:null,
          cleftMiddleRing:null,
          cleftRingLittle:null,
          indexLeftOfCleft:'illustration-finger-index',
          middleRightOfIndex:'illustration-finger-middle',
          middleLeftOfRing:'illustration-finger-middle',
          ringRightOfMiddle:'illustration-finger-ring',
          ringLeftOfLittle:'illustration-finger-ring',
          littleRightOfRing:'illustration-finger-little',
          sonnaldeungSideOfIndex:'sonnaldeung',
          indexSideOfSonnaldeung:'illustration-finger-index',
          sonnaldeungAboveWeb:'sonnaldeung',
          webBelowSonnaldeung:viewLabel==='Palma'?'ageumson':'illustration-hand-web',
          webLeftOfPalm:viewLabel==='Palma'?'ageumson':'illustration-hand-web',
          palmRightOfWeb:viewLabel==='Palma'?'sonbadak':'sondeung',
          thumbLeftOfWeb:'illustration-thumb',
          webRightOfThumb:viewLabel==='Palma'?'ageumson':'illustration-hand-web',
          sonnalInnerSide:viewLabel==='Palma'?'sonbadak':'sondeung',
          sonnalOuterSide:'sonnal',
          sonnaldeungEdge:'sonnaldeung',
          indexShaft:'illustration-finger-index',
          sonnalEdge:'sonnal',
          centralPalmOrDorsum:viewLabel==='Palma'?'sonbadak':'sondeung',
          thumbWeb:viewLabel==='Palma'?'ageumson':'illustration-hand-web',
          thumbBody:'illustration-thumb',
        });
      }else{
        expect(metrics.count).toBe(4);
        expect(metrics.boundaryProbes).toEqual({
          jumeokKnuckles:'jumeok',
          fistBody:viewLabel==='Palma'?'illustration-fist-palm':'deungjumeok',
          mejumeokEdge:'mejumeok',
          fistBase:'illustration-fist-base',
        });
      }
    }
  }
});
