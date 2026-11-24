import { expect, test } from '@playwright/test';

const frontZones = [
  ['torso-shoulders', 'Ombros', []],
  ['torso-chest', 'Peito', ['몸통', '가슴']],
  ['torso-solar-plexus', 'Plexo solar', ['명치']],
  ['torso-abdomen', 'Abdômen', ['아래']],
  ['torso-flanks', 'Laterais do tronco', []],
] as const;

const backZones = [
  ['torso-shoulders', 'Ombros', []],
  ['torso-flanks', 'Laterais do tronco', []],
  ['torso-back', 'Costas', ['등']],
  ['torso-lumbar', 'Lombar e cintura', ['허리']],
] as const;

for (const theme of ['light', 'dark'] as const) {
  test('tronco seleciona todas as regiões em frente e costas no tema ' + theme, async ({ page, isMobile }) => {
    const catalogRequests: string[] = [];
    await page.route('**/rest/v1/**', route => {
      catalogRequests.push(route.request().url());
      return route.abort();
    });
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/atlas?region=torso&zoom=1');
    const figure = page.getByRole('region', { name: 'Explorar o mapa corporal' });
    const inspector = page.getByRole('region', { name: 'Detalhes da região selecionada' });
    const legend = figure.getByRole('navigation', { name: 'Selecionar zona ilustrada' });

    for (const [view, zones] of [['Vista anterior', frontZones], ['Vista posterior', backZones]] as const) {
      await figure.getByRole('button', { name: view, exact: true }).click();
      await expect(legend.getByRole('button')).toHaveCount(zones.length);
      for (const [id, name, hangul] of zones) {
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
          await hotspot.press('Space');
        }
        await expect(hotspot).toHaveAttribute('aria-pressed', 'true');
        await expect(legend.getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'true');
        await expect(page).toHaveURL(new RegExp(`region=${id}(&|$)`));
        await expect(inspector).toContainText('Região anatômica ilustrativa');
        await expect(inspector).toContainText(name);
        await expect(inspector.locator('[lang="ko"]')).toHaveText([...hangul]);
        if (id === 'torso-chest') {
          await expect(inspector).toContainText('Momtong');
          await expect(inspector).toContainText('Gaseum');
        }
        if (id === 'torso-solar-plexus') {
          await expect(inspector).toContainText('Myeongchi');
        }
        if (id !== 'torso-flanks') {
          for (const summary of await inspector.locator('summary').all()) {
            await summary.click();
          }
          await expect(inspector.locator('a[href^="https://research.kukkiwon.or.kr/"]').first()).toBeVisible();
        }
      }
    }
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(catalogRequests).toEqual([]);
  });
}

test('tronco persiste seleção na URL, avisa vista oposta e retorna da Biblioteca', async ({ page }) => {
  await page.route('**/rest/v1/**', route => route.abort());
  await page.goto('/atlas?region=torso-lumbar&zoom=1');
  const figure = page.getByRole('region', { name: 'Explorar o mapa corporal' });
  const inspector = page.getByRole('region', { name: 'Detalhes da região selecionada' });
  await expect(figure.getByRole('button', { name: 'Vista posterior', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(figure.locator('[data-region="torso-lumbar"]')).toHaveAttribute('aria-pressed', 'true');
  await figure.getByRole('button', { name: 'Vista anterior', exact: true }).click();
  await expect(inspector.getByRole('status')).toHaveText('Região selecionada na vista posterior.');
  await page.reload();
  await expect(inspector.getByRole('status')).toHaveText('Região selecionada na vista posterior.');

  await figure.locator('[data-legend-zone="torso-chest"]').click();
  const chestUrl = page.url();
  await inspector.getByRole('link', { name: /Estudar defesa média/ }).click();
  await expect(page).toHaveURL(/\/biblioteca\/kibon-dongjak\/an-makgi\/?$/);
  await page.goBack();
  await expect(page).toHaveURL(chestUrl);
  await expect(figure.locator('[data-region="torso-chest"]')).toHaveAttribute('aria-pressed', 'true');
});

test('geometria do tronco tem sobreposição zero, âncoras válidas e limites simétricos', async ({ page }) => {
  await page.route('**/rest/v1/**', route => route.abort());
  await page.goto('/atlas?region=torso&zoom=1');
  const svg = page.locator('.body-detail .detail-svg');
  const probesFront = [
    ['torso-shoulders', 106, 123],
    ['torso-shoulders', 154, 123],
    ['torso-chest', 130, 150],
    ['torso-solar-plexus', 130, 178],
    ['torso-abdomen', 130, 212],
    ['torso-flanks', 98, 184],
    ['torso-flanks', 162, 184],
  ] as const;
  const probesBack = [
    ['torso-shoulders', 130, 124],
    ['torso-flanks', 98, 184],
    ['torso-flanks', 162, 184],
    ['torso-back', 130, 160],
    ['torso-lumbar', 130, 210],
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
