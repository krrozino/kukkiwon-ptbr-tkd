import { expect, test } from '@playwright/test';

const frontZones = [
  ['legs-hip', 'legs-hip', 'Quadril e transição pélvica', ['아래']],
  ['legs-thigh', 'legs-thigh', 'Coxa', []],
  ['legs-knee', 'mureup', 'Joelho', ['무릎']],
  ['legs-shin', 'jeonggangi', 'Canela', ['정강이']],
  ['legs-ankle', 'legs-ankle', 'Tornozelo (transição perna–pé)', ['발목']],
] as const;

const backZones = [
  ['legs-hip', 'legs-hip', 'Quadril e transição pélvica', ['아래']],
  ['legs-thigh', 'legs-thigh', 'Coxa', []],
  ['legs-knee-back', 'legs-knee-back', 'Posterior do joelho', ['오금']],
  ['legs-calf', 'legs-calf', 'Panturrilha', []],
  ['legs-ankle', 'legs-ankle', 'Tornozelo (transição perna–pé)', ['발목']],
] as const;

for (const theme of ['light', 'dark'] as const) {
  test('pernas e tornozelo selecionam todas as regiões sem catálogo remoto no tema ' + theme, async ({ page, isMobile }) => {
    const catalogRequests: string[] = [];
    await page.route('**/rest/v1/**', route => {
      catalogRequests.push(route.request().url());
      return route.abort();
    });
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/atlas?region=legs&zoom=1');
    const figure = page.getByRole('region', { name: 'Explorar o mapa corporal' });
    const inspector = page.getByRole('region', { name: 'Detalhes da região selecionada' });
    const legend = figure.getByRole('navigation', { name: 'Selecionar zona ilustrada' });

    for (const [view, zones] of [['Vista anterior', frontZones], ['Vista posterior', backZones]] as const) {
      await figure.getByRole('button', { name: view, exact: true }).click();
      await expect(legend.getByRole('button')).toHaveCount(zones.length);
      for (const [id, urlSlug, name, hangul] of zones) {
        const hotspot = figure.locator(`[data-region="${id}"]`);
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
          await hotspot.press('Enter');
        }
        await expect(hotspot).toHaveAttribute('aria-pressed', 'true');
        await expect(legend.getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'true');
        await expect(page).toHaveURL(new RegExp(`region=${urlSlug}(&|$)`));
        await expect(inspector).toContainText(name);
        await expect(inspector.locator('[lang="ko"]')).toHaveText([...hangul]);
        if (id === 'legs-knee' || id === 'legs-shin') {
          await expect(inspector).toContainText('Superfície técnica de contato');
        } else {
          await expect(inspector).toContainText('Região anatômica ilustrativa');
        }
        if (id === 'legs-ankle') {
          await expect(inspector).not.toContainText('Superfície técnica de contato');
          await expect(inspector.getByRole('link', { name: /Abrir detalhe das superfícies do pé/ })).toHaveAttribute('href', '/atlas?region=feet&zoom=1');
        }
      }
    }
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(catalogRequests).toEqual([]);
  });
}

test('joelho (Mureup), tornozelo e vista posterior preservam URL, fontes e retorno da Biblioteca', async ({ page }) => {
  await page.route('**/rest/v1/**', route => route.abort());
  await page.goto('/atlas?region=mureup&zoom=1');
  const figure = page.getByRole('region', { name: 'Explorar o mapa corporal' });
  const inspector = page.getByRole('region', { name: 'Detalhes da região selecionada' });
  await expect(figure.locator('[data-region="legs-knee"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(inspector).toContainText('Mureup');
  await inspector.locator('summary').click();
  await expect(inspector.getByRole('link', { name: /Applicable Parts of the Body > Mureup/ })).toHaveAttribute(
    'href',
    'https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=73',
  );

  await figure.getByRole('button', { name: 'Vista posterior', exact: true }).click();
  await expect(inspector.getByRole('status')).toHaveText('Região selecionada na vista anterior.');
  await page.reload();
  await expect(inspector.getByRole('status')).toHaveText('Região selecionada na vista anterior.');

  const mureupUrl = page.url();
  await inspector.getByRole('link', { name: /Abrir ficha de golpes com joelho/ }).click();
  await expect(page).toHaveURL(/\/biblioteca\/kibon-dongjak\/palgup-mureup-chigi\/?$/);
  await page.goBack();
  await expect(page).toHaveURL(mureupUrl);

  await figure.locator('[data-legend-zone="legs-ankle"]').click();
  await expect(page).toHaveURL(/region=legs-ankle/);
  await inspector.getByRole('link', { name: /Abrir detalhe das superfícies do pé/ }).click();
  await expect(page).toHaveURL(/\/atlas\?region=feet&zoom=1$/);
});

test('geometria de pernas e tornozelo tem sobreposição zero, âncoras válidas e simetria bilateral', async ({ page }) => {
  await page.route('**/rest/v1/**', route => route.abort());
  await page.goto('/atlas?region=legs&zoom=1');
  const svg = page.locator('.body-detail .detail-svg');
  const probesFront = [
    ['legs-hip', 130, 256],
    ['legs-thigh', 103, 292],
    ['legs-thigh', 157, 292],
    ['legs-knee', 101, 331],
    ['legs-knee', 159, 331],
    ['legs-shin', 100, 370],
    ['legs-shin', 160, 370],
    ['legs-ankle', 98, 407],
    ['legs-ankle', 162, 407],
  ] as const;
  const probesBack = [
    ['legs-hip', 130, 256],
    ['legs-thigh', 103, 292],
    ['legs-thigh', 157, 292],
    ['legs-knee-back', 101, 330],
    ['legs-knee-back', 159, 330],
    ['legs-calf', 100, 369],
    ['legs-calf', 160, 369],
    ['legs-ankle', 98, 407],
    ['legs-ankle', 162, 407],
  ] as const;

  for (const [view, probes] of [['Vista anterior', probesFront], ['Vista posterior', probesBack]] as const) {
    await page.getByRole('button', { name: view, exact: true }).click();
    await svg.scrollIntoViewIfNeeded();
    const result = await svg.evaluate((node, probes) => {
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
              new DOMPoint(x - 0.02, y), new DOMPoint(x + 0.02, y),
              new DOMPoint(x, y - 0.02), new DOMPoint(x, y + 0.02),
            ];
            if (neighbors.every(n => fills.every(p => p.isPointInFill(n)))) overlaps++;
          }
        }
      }
      return {
        anchorsValid,
        overlaps,
        hits: probes.map(([, x, y]) => hit(new DOMPoint(x, y))),
      };
    }, probes);
    expect(result.anchorsValid, view).toBe(true);
    expect(result.overlaps, view).toBe(0);
    expect(result.hits, view).toEqual(probes.map(([id]) => id));
  }
});
