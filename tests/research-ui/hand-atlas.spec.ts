import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';

test.beforeEach(async ({ page }) => {
  await page.route('https://**/*', route => route.abort());
  await page.goto('/atlas-mao-local');
  await expect(page.getByRole('heading', { name: 'Consulta documental da mão', exact: true })).toBeVisible();
  await expect(page.locator('astro-island[component-url*="HandAtlasWorkbench"]')).not.toHaveAttribute('ssr', '');
});

test('seleção no SVG, toque e teclado mostram a documentação da região exata', async ({ page, isMobile }) => {
  const errors: string[] = [];
  const remote: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.url().includes('/rest/v1/')) remote.push(request.url()); });
  const region = page.locator('[data-region="sonbadak"]');
  await region.scrollIntoViewIfNeeded();
  if (isMobile) await region.locator('path').tap();
  else await region.locator('path').click();
  await expect(region).toHaveAttribute('aria-pressed', 'true');
  const panel = page.locator('.surface-inspector');
  await expect(panel.locator('[data-region-documentation]')).toHaveAttribute('data-region-documentation', 'sonbadak');
  await expect(panel).toContainText('손바닥');
  await expect(panel).toContainText('Mapeamento editorial proposto');
  await expect(panel).toContainText('Revisão humana pendente');
  const height = await panel.evaluate(element => element.getBoundingClientRect().height);
  const scroll = await page.evaluate(() => ({ top: scrollY, height: document.documentElement.scrollHeight }));
  const finger = page.locator('[data-region="illustration-finger-index"]');
  await finger.focus();
  await page.keyboard.press('Enter');
  await expect(panel).toContainText('Sem terminologia técnica vinculada');
  await expect(panel.locator('[lang="ko"]')).toHaveCount(0);
  expect(await panel.evaluate(element => element.getBoundingClientRect().height)).toBe(height);
  const after = await page.evaluate(() => ({ top: scrollY, height: document.documentElement.scrollHeight }));
  expect(after.height).toBe(scroll.height);
  expect(Math.abs(after.top - scroll.top)).toBeLessThan(8);
  const edge = page.locator('[data-legend-zone="sonnal"]');
  await edge.focus();
  await page.keyboard.press('Space');
  await expect(panel.locator('[data-region-documentation]')).toHaveAttribute('data-region-documentation', 'sonnal');
  const evidence = panel.locator('[data-evidence-key="sonnal-hangul-1"]');
  await expect(evidence).toContainText('PDF pp. 74-75');
  const link = evidence.getByRole('link');
  await expect(link).toHaveAttribute('href', 'https://research.kukkiwon.or.kr/homepage/boardMedia/11621');
  await link.focus();
  await expect(link).toBeFocused();
  await expect(panel.locator('[data-region-documentation]')).toHaveAttribute('data-region-documentation', 'sonnal');
  expect(remote).toEqual([]);
  expect(errors).toEqual([]);
});

test('busca todas as 14 configurações sem desenho e deixa lacunas explícitas', async ({ page }) => {
  await page.getByLabel('Somente configurações sem geometria').check();
  await expect(page.getByRole('button', { name: /^Consultar termo / })).toHaveCount(14);
  await page.getByLabel('Buscar documentação da mão').fill('세운편주먹');
  const result = page.getByRole('button', { name: 'Consultar termo seun-pyeonjumeok', exact: true });
  await expect(result).toBeVisible();
  await result.click();
  const detail = page.locator('[data-term-documentation="seun-pyeonjumeok"]');
  await expect(detail).toContainText('세운편주먹');
  await expect(detail).toContainText('Sem geometria correspondente');
  await expect(detail.locator('[data-pending="romanization"]')).toContainText('Pendente');
  await expect(detail.locator('[data-pending="pronunciation_pt"]')).toContainText('Pendente');
  await expect(page.locator('[data-region="seun-pyeonjumeok"]')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Documentação do termo selecionado' })).toBeFocused();
  await page.getByLabel('Buscar documentação da mão').fill('nada-encontrado-xyz');
  await expect(page.getByRole('status')).toContainText('Nenhum termo encontrado');
});

for (const width of [375, 1280]) for (const theme of ['light', 'dark']) {
  test(`palma, dorso e punho responsivos — ${width}px / ${theme}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme: theme === 'light' ? 'dark' : 'light' });
    await page.getByRole('button', { name: theme === 'light' ? 'Ativar tema claro' : 'Ativar tema escuro', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    for (const [view, posture, slug] of [
      ['Palma', 'Mão aberta', 'sonbadak'], ['Dorso', 'Mão aberta', 'sondeung'], ['Dorso', 'Punho', 'deungjumeok'],
    ]) {
      await page.getByRole('button', { name: view, exact: true }).click();
      await page.getByRole('button', { name: posture, exact: true }).click();
      await page.locator(`[data-legend-zone="${slug}"]`).click();
      await expect(page.locator('.surface-inspector [data-region-documentation]')).toHaveAttribute('data-region-documentation', slug);
      const dimensions = await page.locator('.surface-inspector').evaluate(panel => ({
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        height: panel.clientHeight,
        background: getComputedStyle(panel.querySelector('.surface-tooltip')!).backgroundColor,
      }));
      expect(dimensions.overflow).toBe(false);
      expect(dimensions.height).toBeGreaterThanOrEqual(440);
      expect(dimensions.background).toBe(theme === 'dark' ? 'rgb(28, 44, 60)' : 'rgb(255, 255, 255)');
      mkdirSync('review-output/atlas-a3', { recursive: true });
      await page.screenshot({ path: `review-output/atlas-a3/${testInfo.project.name}-${width}-${theme}-${slug}.png`, fullPage: true });
    }
  });
}
