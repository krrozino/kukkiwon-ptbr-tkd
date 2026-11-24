import { expect, type Locator, type Page } from '@playwright/test';

export type CuratedZoneCheck = Readonly<{
  id: string;
  urlSlug: string;
  name: string;
  hangul: readonly string[];
}>;

export type GeometryProbe = readonly [regionId: string, x: number, y: number];

export async function assertCuratedBodyAreaInThemes(
  page: Page,
  isMobile: boolean,
  options: Readonly<{
    area: string;
    theme: 'light' | 'dark';
    views: readonly (readonly [viewLabel: string, zones: readonly CuratedZoneCheck[]])[];
    onZoneSelected?: (zone: CuratedZoneCheck, inspector: Locator) => Promise<void>;
  }>,
) {
  const catalogRequests: string[] = [];
  await page.route('**/rest/v1/**', route => {
    catalogRequests.push(route.request().url());
    return route.abort();
  });
  await page.emulateMedia({ colorScheme: options.theme });
  await page.goto(`/atlas?region=${options.area}&zoom=1`);

  const figure = page.getByRole('region', { name: 'Explorar o mapa corporal' });
  const inspector = page.getByRole('region', { name: 'Detalhes da região selecionada' });
  const legend = figure.getByRole('navigation', { name: 'Selecionar zona ilustrada' });

  for (const [viewLabel, zones] of options.views) {
    await figure.getByRole('button', { name: viewLabel, exact: true }).click();
    await expect(legend.getByRole('button')).toHaveCount(zones.length);
    for (const zone of zones) {
      const hotspot = figure.locator(`[data-region="${zone.id}"]`);
      if (isMobile) {
        await hotspot.scrollIntoViewIfNeeded();
        const point = await hotspot.evaluate(node => {
          const x = Number(node.getAttribute('data-anchor-x'));
          const y = Number(node.getAttribute('data-anchor-y'));
          return new DOMPoint(x, y).matrixTransform((node as SVGGraphicsElement).getScreenCTM()!).toJSON();
        });
        await page.touchscreen.tap(point.x, point.y);
      } else {
        await hotspot.focus();
        await hotspot.press('Space');
      }
      await expect(hotspot).toHaveAttribute('aria-pressed', 'true');
      await expect(legend.getByRole('button', { name: zone.name, exact: true })).toHaveAttribute('aria-pressed', 'true');
      await expect(page).toHaveURL(new RegExp(`region=${zone.urlSlug}(&|$)`));
      await expect(inspector).toContainText(zone.name);
      await expect(inspector.locator('[lang="ko"]')).toHaveText([...zone.hangul]);
      if (options.onZoneSelected) {
        await options.onZoneSelected(zone, inspector);
      }
    }
  }

  await expect(page.locator('html')).toHaveAttribute('data-theme', options.theme);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(catalogRequests).toEqual([]);
}

export async function assertBodyAreaSvgGeometry(
  page: Page,
  area: string,
  views: readonly (readonly [viewLabel: string, probes: readonly GeometryProbe[]])[],
) {
  await page.route('**/rest/v1/**', route => route.abort());
  await page.goto(`/atlas?region=${area}&zoom=1`);
  const svg = page.locator('.body-detail .detail-svg');

  for (const [viewLabel, probes] of views) {
    await page.getByRole('button', { name: viewLabel, exact: true }).click();
    await svg.scrollIntoViewIfNeeded();
    const result = await svg.evaluate((node, points) => {
      const svgEl = node as SVGSVGElement;
      const outline = svgEl.querySelector<SVGPathElement>('clipPath path')!;
      const zones = [...svgEl.querySelectorAll<SVGGElement>('.surface-cutout')];
      const paths = zones.map(z => z.querySelector<SVGPathElement>('path')!);
      const matrix = svgEl.getScreenCTM()!;
      const hit = (pt: DOMPoint) => {
        const s = pt.matrixTransform(matrix);
        return document.elementFromPoint(s.x, s.y)?.closest('[data-region]')?.getAttribute('data-region') ?? null;
      };
      const anchorsValid = zones.every((z, i) => {
        const pt = new DOMPoint(Number(z.getAttribute('data-anchor-x')), Number(z.getAttribute('data-anchor-y')));
        return paths[i].isPointInFill(pt) && outline.isPointInFill(pt);
      });
      let overlaps = 0;
      const vb = svgEl.viewBox.baseVal;
      for (let x = vb.x + 0.371; x < vb.x + vb.width; x += 0.75) {
        for (let y = vb.y + 0.277; y < vb.y + vb.height; y += 0.75) {
          const pt = new DOMPoint(x, y);
          if (!outline.isPointInFill(pt)) continue;
          const fills = paths.filter(p => p.isPointInFill(pt));
          if (fills.length > 1) {
            const neighbors = [
              new DOMPoint(x - 0.02, y),
              new DOMPoint(x + 0.02, y),
              new DOMPoint(x, y - 0.02),
              new DOMPoint(x, y + 0.02),
            ];
            if (neighbors.every(n => fills.every(p => p.isPointInFill(n)))) overlaps++;
          }
        }
      }
      return {
        anchorsValid,
        overlaps,
        hits: points.map(([, x, y]) => hit(new DOMPoint(x, y))),
      };
    }, probes);
    expect(result.anchorsValid, viewLabel).toBe(true);
    expect(result.overlaps, viewLabel).toBe(0);
    expect(result.hits, viewLabel).toEqual(probes.map(([id]) => id));
  }
}
