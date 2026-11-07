import { test, expect } from "@playwright/test";

const longName = "Borda externa da mão — superfície anatômica extensa com denominação descritiva em português e informações adicionais";
const mockRegion = {
  id:"sonnal-long",slug:"sonnal",region_group:"hands",atlas_area:"hands",
  name_pt:longName,detail_view:"both",detail_x:68,detail_y:68,
};

for (const width of [375,1280]) {
  test(`inspetor acomoda título comprido sem recortar texto (viewport ${width}px)`, async({page})=>{
    await page.setViewportSize({width,height:820});
    await page.route("**/rest/v1/**",route=>{
      const table = new URL(route.request().url()).pathname.split("/").pop();
      return route.fulfill({json:table==="body_regions"?[mockRegion]:[]});
    });
    await page.goto("/atlas?region=hands&zoom=1");
    const legend=page.locator('[data-legend-zone="sonnal"]');
    await expect(legend).toHaveAttribute("aria-label",longName);
    await legend.click();
    const tip=page.getByRole("tooltip");
    await expect(tip).toContainText(longName);
    const title=tip.locator("strong");
    await expect(title).toHaveText(longName);
    const dims=await title.evaluate(header=>{
      const parent=header.closest(".surface-inspector")!;
      const viewport=header.ownerDocument.documentElement;
      return {
        titleHeight:header.clientHeight,titleScrollHeight:header.scrollHeight,
        titleWidth:header.clientWidth,titleScrollWidth:header.scrollWidth,
        panelWidth:parent.clientWidth,panelHeight:parent.clientHeight,
        horizontalOverflow:viewport.scrollWidth>window.innerWidth+1,
      };
    });
    expect(dims.titleHeight+2).toBeGreaterThanOrEqual(dims.titleScrollHeight);
    expect(dims.titleWidth+2).toBeGreaterThanOrEqual(dims.titleScrollWidth);
    expect(dims.panelHeight).toBeGreaterThanOrEqual(350);
    expect(dims.panelWidth).toBeGreaterThan(250);
    expect(dims.horizontalOverflow).toBe(false);
  });
}
