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
  await page.reload();
  await expect(page.getByRole('button', { name: 'Dorso', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(inspector).toContainText('Apchuk');
  await inspector.getByRole('link', { name: /Abrir ficha.*na Biblioteca/ }).click();
  await expect(page).toHaveURL(/\/biblioteca\/balkisul\/apchuk\/?$/);
  await page.getByRole('link', { name: 'Localizar no Atlas', exact: true }).click();
  await expect(apchuk).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
