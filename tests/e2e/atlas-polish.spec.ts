import {test,expect} from "@playwright/test";

const sonnal={
  id:"sonnal",slug:"sonnal",region_group:"hands",atlas_area:"hands",
  name_pt:"Borda externa da mão",detail_view:"both",detail_x:68,detail_y:68
};
test("tooltip em cascata permanece fora do desenho, no maior espaço disponível",async({page,isMobile})=>{
  await page.route("**/rest/v1/**",async route=>{
    const table=new URL(route.request().url()).pathname.split("/").pop();
    if(table==="body_regions")return route.fulfill({json:[sonnal]});
    if(table==="technical_terms")return route.fulfill({json:[{
      id:"sonnal",slug:"sonnal",category:"regiao-corporal",hangul:"손날",
      romanization:"Sonnal",translation_pt:sonnal.name_pt,pronunciation_pt:null,
      definition_pt:"Superfície junto ao dedo mínimo.",pronunciation_status:"verified",record_kind:"surface",
      publication_status:"published",term_aliases:[]
    }]});
    if(table==="term_sources")return route.fulfill({json:[]});
    if(table==="body_region_terms")return route.fulfill({json:[]});
    await route.fulfill({json:[]});
  });
  await page.goto("/atlas?region=hands&zoom=1");
  const cutout=page.locator('svg [data-region="sonnal"]');
  await expect(cutout).toBeVisible();
  // Esperar o registro publicado evita medir o recorte provisório durante a carga.
  await expect(cutout).toHaveAttribute('aria-label',sonnal.name_pt);
  if(isMobile)await cutout.tap();else await cutout.hover();
  const tip=page.getByRole("tooltip");
  await expect(tip).toContainText("Sonnal");
  await expect(tip).toContainText("Borda externa da mão");
  await expect(tip.locator('[lang="ko"]')).toHaveText('손날');
  await expect(tip).toContainText('Pronúncia: ainda não conferida');
  await expect(tip).toContainText('Superfície junto ao dedo mínimo.');
  await expect(tip.getByRole('link',{name:'Abrir ficha técnica'})).toHaveAttribute('href','/tecnica?slug=sonnal');
  const illustration=page.locator(".surface-canvas .detail-svg");
  await expect(tip).toBeVisible();
  const a=await illustration.boundingBox(),b=await tip.boundingBox();
  expect(a).toBeTruthy();expect(b).toBeTruthy();
  const overlapWidth=Math.max(0,Math.min(a!.x+a!.width,b!.x+b!.width)-Math.max(a!.x,b!.x));
  const overlapHeight=Math.max(0,Math.min(a!.y+a!.height,b!.y+b!.height)-Math.max(a!.y,b!.y));
  expect(overlapWidth*overlapHeight).toBeLessThan(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  // Uma seleção publicada não pode prevalecer sobre a próxima zona ilustrativa.
  await page.locator('[data-legend-zone="sonnal"]').click();
  await page.locator('[data-legend-zone="illustration-thumb"]').click();
  await expect(tip).toContainText('Polegar');
  await expect(tip.getByRole('link')).toHaveCount(0);
  await expect(page.locator('.detail-svg [data-region="illustration-thumb"]')).toHaveAttribute('aria-pressed','true');
  await page.locator('[data-legend-zone="sonnal"]').click();
  // Tab percorre os recortes seguintes sem apagar a ficha selecionada.
  await page.mouse.move(0,0);
  await cutout.focus();
  await cutout.press('Enter');
  for(let i=0;i<12;i++){
    await page.keyboard.press('Tab');
    if(await page.evaluate(()=>document.activeElement?.textContent?.startsWith('Abrir ficha técnica')))break;
  }
  await expect(tip.getByRole('link',{name:'Abrir ficha técnica'})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/tecnica\?slug=sonnal/);
  await page.goto('/atlas?region=hands&zoom=1');
  const publishedLegend=page.locator('[data-legend-zone="sonnal"]');
  await publishedLegend.focus();
  await publishedLegend.press('Enter');
  for(let i=0;i<5;i++){
    await page.keyboard.press('Shift+Tab');
    if(await page.evaluate(()=>document.activeElement?.textContent?.startsWith('Abrir ficha técnica')))break;
  }
  await expect(tip.getByRole('link',{name:'Abrir ficha técnica'})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/tecnica\?slug=sonnal/);
});

test("corpo integral mostra ilustração com detalhes de uniforme, sem números de hotspots",async({page})=>{
  await page.goto("/atlas");
  await expect(page.getByRole("img",{name:"Corpo humano — vista anterior"})).toBeVisible();
  await expect(page.locator(".body-illustration .figure-gi")).toHaveCount(1);
  await expect(page.locator(".body-illustration .figure-pants")).toHaveCount(1);
  await expect(page.locator(".body-svg .atlas-zone text")).toHaveCount(0);
  await page.getByRole("button",{name:"Vista posterior"}).click();
  await expect(page.getByRole("img",{name:"Corpo humano — vista posterior"})).toBeVisible();
});


test("recortes coloridos persistem em produção mesmo sem regiões técnicas publicadas",async({page,isMobile})=>{
  // Reproduz a produção: consulta anônima retorna zero regiões (todas em draft).
  await page.route("**/rest/v1/**",route=>route.fulfill({json:[]}));
  await page.goto("/atlas?region=hands&zoom=1");
  const cutouts=page.locator(".detail-svg .surface-cutout");
  await expect(cutouts.first()).toBeVisible();
  expect(await cutouts.count()).toBeGreaterThanOrEqual(5);
  const color=await cutouts.first().locator("path").evaluate(el=>getComputedStyle(el).fill);
  expect(color).not.toBe("none");
  expect(color).not.toBe("transparent");
  if(isMobile)await cutouts.first().tap();else await cutouts.first().hover();
  await expect(page.getByRole("tooltip")).toContainText("Palma da mão");
  await expect(page.getByRole("tooltip")).not.toContainText("Sonnal");
  await page.getByRole("button",{name:"Dorso",exact:true}).click();
  await expect(cutouts.first()).toBeVisible();
  await page.getByRole("button",{name:"Punho",exact:true}).click();
  await expect(cutouts.first()).toBeVisible();
  await page.getByRole("button",{name:"Pés",exact:true}).click();
  await page.getByRole("button",{name:"Ampliar região"}).click();
  await expect(cutouts.first()).toBeVisible();
  expect(await cutouts.count()).toBeGreaterThanOrEqual(3);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});


test("primeiro toque no pé seleciona a zona e não desloca a página",async({page,isMobile})=>{
  await page.route("**/rest/v1/**",route=>route.fulfill({json:[]}));
  await page.goto("/atlas?region=feet&zoom=1");
  const target=page.locator('.surface-cutout[data-region="apchuk"]');
  await expect(target).toBeVisible();
  const before=await page.evaluate(()=>({scrollY, pageHeight:document.documentElement.scrollHeight}));
  if(isMobile) await target.tap();
  else await target.click();
  await expect(target).toHaveAttribute("aria-pressed","true");
  await expect(page.getByRole("tooltip")).toContainText("Zona ilustrativa");
  const after=await page.evaluate(()=>({scrollY,pageHeight:document.documentElement.scrollHeight}));
  expect(Math.abs(after.scrollY-before.scrollY)).toBeLessThan(8);
  expect(Math.abs(after.pageHeight-before.pageHeight)).toBeLessThan(8);
  await expect(page.locator('[data-legend-zone="apchuk"]')).toHaveAttribute("aria-pressed","true");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test("legenda anatômica navega pelos recortes sem mostrar termos não aprovados",async({page,isMobile})=>{
  await page.route("**/rest/v1/**",route=>route.fulfill({json:[]}));
  await page.goto("/atlas?region=hands&zoom=1");
  const legend=page.getByRole("navigation",{name:"Selecionar zona ilustrada"});
  await expect(legend).toBeVisible();
  const buttons=legend.getByRole("button");
  await expect(buttons).toHaveCount(11);
  await buttons.nth(1).click();
  await expect(buttons.nth(1)).toHaveAttribute("aria-pressed","true");
  await expect(page.getByRole("tooltip")).toContainText("Base da palma");
  await expect(page.getByRole("tooltip")).not.toContainText("Batangson");
  const inspector=page.locator(".surface-inspector");
  const before=await inspector.boundingBox();
  await buttons.nth(2).click();
  const after=await inspector.boundingBox();
  expect(Math.abs((before?.height||0)-(after?.height||0))).toBeLessThan(1);
  await page.getByRole("button",{name:"Dorso",exact:true}).click();
  await expect(buttons).toHaveCount(11);
  await page.getByRole("button",{name:"Punho",exact:true}).click();
  // Dorso do punho: punho, dorso do punho e borda do punho.
  await expect(buttons).toHaveCount(4);
  if(isMobile)expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
