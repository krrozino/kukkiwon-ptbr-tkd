import { expect, test } from '@playwright/test';

const surfacesByView = {
  Planta: [
    ['apchuk', 'Apchuk', '앞축'],
    ['balbadak', 'Balbadak', '발바닥'],
    ['balkkeut', 'Balkkeut', '발끝'],
    ['balnal', 'Balnal', '발날'],
    ['balnaldeung', 'Balnaldeung', '발날등'],
    ['dwichuk', 'Dwichuk', '뒤축'],
  ],
  Dorso: [
    ['baldeung', 'Baldeung', '발등'],
    ['balkkeut', 'Balkkeut', '발끝'],
    ['balnal', 'Balnal', '발날'],
    ['balnaldeung', 'Balnaldeung', '발날등'],
    ['dwikkumchi', 'Dwikkumchi', '뒤꿈치'],
  ],
} as const;

const source = 'https://research.kukkiwon.or.kr/homepage/boardMedia/11621';

test('pé abre fichas e fontes nas duas vistas sem consultar o catálogo remoto', async ({ page, request, isMobile }) => {
  test.setTimeout(60_000);
  const remoteRequests: string[] = [];
  await page.route('**/rest/v1/**', route => {
    remoteRequests.push(route.request().url());
    return route.abort();
  });
  await page.goto('/atlas?region=feet&zoom=1');
  const inspector = page.getByRole('region', { name: 'Detalhes da região selecionada' });
  const checkedLibraryLinks = new Set<string>();
  for (const view of ['Planta', 'Dorso'] as const) {
    await page.getByRole('button', { name: view, exact: true }).click();
    const zones = page.locator('.detail-svg [data-region]');
    await expect(zones).toHaveCount(view === 'Planta' ? 7 : 5);
    for (const [slug, romanization, hangul] of surfacesByView[view]) {
      const legend = page.locator(`[data-legend-zone="${slug}"]`);
      if (isMobile) await legend.tap();
      else {
        await legend.focus();
        await legend.press('Enter');
      }
      await expect(page).toHaveURL(new RegExp(`region=${slug}(&|$)`));
      await expect(page.locator(`.detail-svg [data-region="${slug}"]`)).toHaveAttribute('aria-pressed', 'true');
      await expect(inspector).toContainText('Superfície técnica de contato');
      await expect(inspector).toContainText(romanization);
      await expect(inspector.locator('[lang="ko"]')).toHaveText(hangul);
      await expect(inspector).toContainText('Sentido técnico em português');
      await expect(inspector).toContainText('Chagi');
      await expect(inspector).not.toContainText(/revisão editorial|pronúncia/i);
      const terminology = inspector.getByRole('link', { name: /Kukkiwon.*Applicable Parts of the Body/ });
      await expect(terminology).toHaveAttribute('href', source);
      await expect(terminology).toContainText(romanization);
      await expect(terminology).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(inspector.getByRole('link', { name: /§5.*Chagi/ })).toHaveAttribute('href', source);
      const library = inspector.getByRole('link', { name: /Abrir ficha.*na Biblioteca/ });
      const href = `/biblioteca/balkisul/${slug}`;
      await expect(library).toHaveAttribute('href', href);
      if (!checkedLibraryLinks.has(href)) {
        const response = await request.get(href);
        expect(response.ok()).toBe(true);
        checkedLibraryLinks.add(href);
      }
    }
  }
  expect(checkedLibraryLinks.size).toBe(8);
  expect(remoteRequests).toEqual([]);
});

test('o arco é ilustrativo e o tornozelo tem lacuna explícita no mapa', async ({ page, isMobile }) => {
  await page.goto('/atlas?region=feet&zoom=1');
  const arch = page.locator('.detail-svg [data-region="illustration-foot-arch"]');
  const inspector = page.getByRole('region', { name: 'Detalhes da região selecionada' });
  if (isMobile) await arch.locator('path').tap();
  else {
    await arch.focus();
    await arch.press('Space');
  }
  await expect(arch).toHaveAttribute('aria-pressed', 'true');
  await expect(inspector).toContainText('Região anatômica ilustrativa');
  await expect(inspector).toContainText('Arco da planta do pé');
  await expect(inspector).toContainText('Ilustração original');
  await expect(inspector.locator('[lang="ko"], a[href*="kukkiwon.or.kr"], a[href^="/biblioteca/"]')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Tornozelo' })).toBeVisible();
  await expect(page.getByText(/tornozelo ainda está sem recorte selecionável/i)).toBeVisible();
  await page.reload();
  await expect(arch).toHaveAttribute('aria-pressed', 'true');
});

test('a seleção persiste ao trocar a vista, recarregar e voltar da Biblioteca', async ({ page, isMobile }) => {
  await page.goto('/atlas?region=feet&zoom=1');
  const inspector = page.getByRole('region', { name: 'Detalhes da região selecionada' });
  const apchuk = page.locator('.detail-svg [data-region="apchuk"]');
  if (isMobile) await apchuk.locator('path').tap();
  else await apchuk.locator('path').click();
  await expect(apchuk).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Dorso', exact: true }).click();
  await expect(apchuk).toHaveCount(0);
  await expect(inspector).toContainText('Apchuk');
  await expect(inspector.getByRole('status')).toHaveText('Região selecionada na vista Planta.');
  await expect(page.locator('.surface-connector')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Dorso', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(inspector).toContainText('Apchuk');
  await expect(inspector.getByRole('status')).toHaveText('Região selecionada na vista Planta.');
  await inspector.getByRole('link', { name: /Abrir ficha.*na Biblioteca/ }).click();
  await expect(page).toHaveURL(/\/biblioteca\/balkisul\/apchuk\/?$/);
  await page.getByRole('link', { name: 'Localizar no Atlas', exact: true }).click();
  await expect(apchuk).toHaveAttribute('aria-pressed', 'true');
  await expect(inspector.getByRole('status')).toBeEmpty();
  await page.getByRole('button', { name: 'Dorso', exact: true }).click();
  await page.locator('[data-legend-zone="dwikkumchi"]').click();
  await page.getByRole('button', { name: 'Planta', exact: true }).click();
  await expect(inspector.getByRole('status')).toHaveText('Região selecionada na vista Dorso.');
  await expect(page).toHaveURL(/region=dwikkumchi.*detail=front/);
  await page.goBack();
  await expect(page.locator('.detail-svg [data-region="dwikkumchi"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(inspector.getByRole('status')).toBeEmpty();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('cada ponto da silhueta recebe o recorte visível, incluindo as cinco pontas', async ({ page, isMobile }) => {
  await page.goto('/atlas?region=feet&zoom=1');
  const svg = page.locator('.detail-svg');
  for (const view of ['Planta', 'Dorso'] as const) {
    await page.getByRole('button', { name: view, exact: true }).click();
    await svg.scrollIntoViewIfNeeded();
    const { gaps, overlaps, outside, wrong, toes, heel, hits } = await svg.evaluate(node => {
      const outline = node.querySelector<SVGPathElement>('.anatomy-outline')!;
      const matrix = node.querySelector<SVGGElement>('.anatomy-geometry')!.getScreenCTM()!;
      const paths = [...node.querySelectorAll<SVGPathElement>('.surface-cutout path')];
      const slug = (element: Element | null) => element?.closest('[data-region]')?.getAttribute('data-region') ?? null;
      const hit = (point: DOMPoint) => {
        const screen = point.matrixTransform(matrix);
        return slug(document.elementFromPoint(screen.x, screen.y));
      };
      let gaps = 0;
      let overlaps = 0;
      let outside = 0;
      let wrong = 0;
      for (let x = 0.371; x < 100; x += 0.75) {
        for (let y = 0.277; y < 140; y += 0.75) {
          const point = new DOMPoint(x, y);
          const dom = hit(point);
          if (outline.isPointInFill(point)) {
            const fills = paths.filter(path => path.isPointInFill(point));
            if (!fills.length) gaps++;
            if (fills.length > 1) overlaps++;
            if (fills.length === 1 && dom !== slug(fills[0])) wrong++;
          } else if (dom) outside++;
        }
      }
      const heelPoint = new DOMPoint(49, 126);
      const hits = [new DOMPoint(92, 44), heelPoint].map(point => {
        const position = point.matrixTransform(matrix);
        return { x: position.x, y: position.y };
      });
      return {
        gaps, overlaps, outside, wrong,
        toes: [[31, 18], [52, 24], [66, 31], [80, 38], [92, 44]].map(([x, y]) => hit(new DOMPoint(x, y))),
        heel: [hit(new DOMPoint(49, 117)), hit(heelPoint)],
        hits,
      };
    });
    expect({ gaps, overlaps, outside, wrong }).toEqual({ gaps: 0, overlaps: 0, outside: 0, wrong: 0 });
    expect(toes).toEqual(Array(5).fill('balkkeut'));
    expect(heel).toEqual(view === 'Planta' ? ['dwichuk', 'dwichuk'] : ['baldeung', 'dwikkumchi']);
    const heelSlug = view === 'Planta' ? 'dwichuk' : 'dwikkumchi';
    for (const [i, slug] of ['balkkeut', heelSlug].entries()) {
      const { x, y } = hits[i];
      if (isMobile) await page.touchscreen.tap(x, y);
      else await page.mouse.click(x, y);
      await expect(svg.locator(`[data-region="${slug}"]`)).toHaveAttribute('aria-pressed', 'true');
    }
  }
});
