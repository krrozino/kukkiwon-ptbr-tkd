import { expect, test } from '@playwright/test';

const anatomy = [
  ['arms-upper', 'Braço'],
  ['arms-forearm', 'Antebraço'],
  ['arms-wrist', 'Punho (articulação)'],
] as const;

const surfaces = [
  ['arms-elbow', 'palgup', 'Palgup', '팔굽', 'palgup-mureup-chigi', 'Palgup-dollyeo-chigi'],
  ['arms-inner-forearm', 'anpalmok', 'Anpalmok', '안팔목', 'bakkat-makgi', 'Anpalmok-bakkat-makgi'],
  ['arms-outer-forearm', 'bakkatpalmok', 'Bakkatpalmok', '바깥팔목', 'naeryeo-makgi', 'Bakkatpalmok-naeryeo-makgi'],
] as const;

const manual = 'https://research.kukkiwon.or.kr/homepage/boardMedia/11621';

test('braço tem seis recortes locais e vínculos documentados em frente e costas', async ({ page, request, isMobile }) => {
  test.setTimeout(60_000);
  const catalogRequests: string[] = [];
  await page.route('**/rest/v1/**', route => {
    catalogRequests.push(route.request().url());
    return route.abort();
  });
  await page.goto('/atlas?region=arms&zoom=1');
  const inspector = page.getByRole('region', { name: 'Detalhes da região selecionada' });
  const legend = page.getByRole('navigation', { name: 'Selecionar zona ilustrada' });
  for (const view of ['Vista anterior', 'Vista posterior']) {
    await page.getByRole('button', { name: view, exact: true }).click();
    await expect(legend.getByRole('button')).toHaveCount(6);
    for (const [id, slug, romanization, hangul, librarySlug, example] of surfaces) {
      const button = legend.locator(`[data-legend-zone="${id}"]`);
      if (isMobile) await button.tap();
      else {
        await button.focus();
        await button.press('Enter');
      }
      await expect(page).toHaveURL(new RegExp(`region=${slug}(&|$)`));
      await expect(page.locator(`.detail-svg [data-region="${id}"]`)).toHaveAttribute('aria-pressed', 'true');
      await expect(inspector).toContainText('Superfície técnica de contato');
      await expect(inspector).toContainText(romanization);
      await expect(inspector.locator('[lang="ko"]')).toHaveText(hangul);
      await expect(inspector).not.toContainText(/pronúncia|revisão editorial/i);
      const reference = inspector.getByRole('link', { name: new RegExp(`Applicable Parts of the Body.*${romanization}`) });
      await expect(reference).toHaveAttribute('href', manual);
      await expect(reference).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(inspector.getByRole('link', { name: new RegExp(example) })).toHaveAttribute('href', manual);
      const href = `/biblioteca/kibon-dongjak/${librarySlug}`;
      await expect(inspector.getByRole('link', { name: /Abrir ficha.*na Biblioteca/ })).toHaveAttribute('href', href);
      expect((await request.get(href)).ok()).toBe(true);
    }
    for (const [id, name] of anatomy) {
      await legend.locator(`[data-legend-zone="${id}"]`).click();
      await expect(page).toHaveURL(new RegExp(`region=${id}(&|$)`));
      await expect(inspector).toContainText('Região anatômica ilustrativa');
      await expect(inspector).toContainText(name);
      await expect(inspector.getByRole('link', { name: /Abrir ficha.*na Biblioteca/ })).toHaveCount(0);
      if (id === 'arms-wrist') {
        await expect(inspector).toContainText('Palmok');
        await expect(inspector.locator('[lang="ko"]')).toHaveText('팔목');
        await expect(inspector.getByRole('link', { name: /Applicable Parts of the Body.*Palmok/ })).toHaveAttribute('href', manual);
      } else await expect(inspector.locator('[lang="ko"]')).toHaveCount(0);
    }
  }
  expect(catalogRequests).toEqual([]);
});

test('braço preserva o recorte ao trocar de vista e recarregar um link direto', async ({ page }) => {
  await page.route('**/rest/v1/**', route => route.abort());
  await page.goto('/atlas?region=palgup&view=back&zoom=1');
  const elbow = page.locator('.body-detail [data-region="arms-elbow"]');
  const inspector = page.getByRole('region', { name: 'Detalhes da região selecionada' });
  await expect(elbow).toHaveAttribute('aria-pressed', 'true');
  await expect(inspector).toContainText('Palgup');
  await page.getByRole('button', { name: 'Vista anterior', exact: true }).click();
  await page.reload();
  await expect(elbow).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Vista anterior', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await inspector.getByRole('link', { name: /Abrir ficha.*na Biblioteca/ }).click();
  await expect(page).toHaveURL(/\/biblioteca\/kibon-dongjak\/palgup-mureup-chigi\/?$/);
  await page.goBack();
  await expect(elbow).toHaveAttribute('aria-pressed', 'true');
});

test('braço mantém o antebraço central e as duas bordas selecionáveis sem cruzar os preenchimentos', async ({ page, isMobile }) => {
  await page.goto('/atlas?region=arms&zoom=1');
  const svg = page.locator('.body-detail .detail-svg');
  const probes = [
    ['arms-outer-forearm', 49, 223], ['arms-forearm', 58, 224], ['arms-inner-forearm', 68, 225],
    ['arms-inner-forearm', 192, 225], ['arms-forearm', 202, 224], ['arms-outer-forearm', 211, 223],
  ] as const;
  for (const view of ['Vista anterior', 'Vista posterior']) {
    await page.getByRole('button', { name: view, exact: true }).click();
    await svg.scrollIntoViewIfNeeded();
    const result = await svg.evaluate((node, probes) => {
      const svg = node as SVGSVGElement;
      const outline = svg.querySelector<SVGPathElement>('clipPath path')!;
      const paths = [...svg.querySelectorAll<SVGPathElement>('.surface-cutout path')];
      const matrix = svg.getScreenCTM()!;
      const hit = (point: DOMPoint) => {
        const screen = point.matrixTransform(matrix);
        return document.elementFromPoint(screen.x, screen.y)?.closest('[data-region]')?.getAttribute('data-region') ?? null;
      };
      let overlaps = 0;
      let outside = 0;
      const bounds = svg.viewBox.baseVal;
      for (let x = bounds.x + 0.371; x < bounds.x + bounds.width; x += 2) {
        for (let y = bounds.y + 0.277; y < bounds.y + bounds.height; y += 2) {
          const point = new DOMPoint(x, y);
          if (paths.filter(path => path.isPointInFill(point)).length > 1) overlaps++;
          if (!outline.isPointInFill(point) && hit(point)) outside++;
        }
      }
      return {
        overlaps, outside,
        hits: probes.map(([, x, y]) => {
          const point = new DOMPoint(x, y);
          const screen = point.matrixTransform(matrix);
          return { id: hit(point), x: screen.x, y: screen.y };
        }),
      };
    }, probes);
    expect(result.overlaps).toBe(0);
    expect(result.outside).toBe(0);
    expect(result.hits.map(({ id }) => id)).toEqual(probes.map(([id]) => id));
    for (const { id, x, y } of result.hits.slice(0, 3)) {
      if (isMobile) await page.touchscreen.tap(x, y);
      else await page.mouse.click(x, y);
      await expect(svg.locator(`[data-region="${id}"]`)).toHaveAttribute('aria-pressed', 'true');
    }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
