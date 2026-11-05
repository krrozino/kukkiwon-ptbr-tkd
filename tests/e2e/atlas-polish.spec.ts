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
      definition_pt:"Superfície junto ao dedo mínimo.",record_kind:"surface",
      publication_status:"published",term_aliases:[]
    }]});
    if(table==="term_sources")return route.fulfill({json:[]});
    if(table==="body_region_terms")return route.fulfill({json:[]});
    await route.fulfill({json:[]});
  });
  await page.goto("/atlas?region=hands&zoom=1");
  const cutout=page.locator('svg [data-region="sonnal"]');
  await expect(cutout).toBeVisible();
  if(isMobile)await cutout.tap();else await cutout.hover();
  const tip=page.getByRole("tooltip");
  await expect(tip).toContainText("Sonnal");
  const illustration=page.locator(".surface-canvas .detail-svg");
  await expect(tip).toBeVisible();
  const a=await illustration.boundingBox(),b=await tip.boundingBox();
  expect(a).toBeTruthy();expect(b).toBeTruthy();
  const overlapWidth=Math.max(0,Math.min(a!.x+a!.width,b!.x+b!.width)-Math.max(a!.x,b!.x));
  const overlapHeight=Math.max(0,Math.min(a!.y+a!.height,b!.y+b!.height)-Math.max(a!.y,b!.y));
  expect(overlapWidth*overlapHeight).toBeLessThan(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
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
