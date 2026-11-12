import { expect, test } from '@playwright/test';

test('Atlas público mostra regiões, Hangul, pronúncia e fontes sem registros Supabase', async ({ page }) => {
  await page.route('**/rest/v1/**', route => route.fulfill({json: []}));
  await page.goto('/atlas?region=hands&zoom=1');
  const region = page.locator('[data-legend-zone="sonnal"]');
  await expect(region).toBeVisible();
  await region.click();
  await expect(page.locator('.hand-current-region')).toContainText('Sonnal');
  await expect(page.locator('.hand-current-region [lang="ko"]')).toContainText('손날');
  await expect(page.locator('.hand-current-region')).toContainText('sôn-nal');
  await page.locator('.hand-current-region summary').click();
  await expect(page.locator('.hand-current-region .hand-term-sources a[href^="https://research.kukkiwon.or.kr/"]')).toHaveCount(2);
  await expect(page.locator('[data-hand-region="sonnal"]')).toBeVisible();
  await expect(page.getByText('Revisão humana pendente')).toHaveCount(0);
});
test('os 23 termos são pesquisáveis mesmo sem hotspot geométrico', async ({ page }) => {
  await page.route('**/rest/v1/**', route => route.fulfill({json: []}));
  await page.goto('/atlas?region=hands&zoom=1');
  const search=page.getByRole('searchbox',{name:'Buscar nome, Hangul ou romanização'});
  await expect(page.getByText('23 de 23 termos')).toBeVisible();
  await search.fill('손날');
  await expect(page.getByText('2 de 23 termos')).toBeVisible();
  await search.fill('Modumsonkkeut');
  await page.getByRole('button',{name:/Modumsonkkeut/}).click();
  await expect(page).toHaveURL(/term=modumsonkkeut/);
  await expect(page.locator('.hand-term-selected')).toContainText('모둠손끝');
  await page.reload();
  await expect(page.locator('.hand-term-selected')).toContainText('Modumsonkkeut');
});
test('regiões ilustrativas têm nomes e descrições, sem Hangul inventado', async ({ page }) => {
  await page.route('**/rest/v1/**', route => route.fulfill({json: []}));
  await page.goto('/atlas?region=hands&zoom=1');
  await page.locator('[data-legend-zone="illustration-finger-index"]').click();
  const panel=page.locator('[data-hand-region="illustration-finger-index"]');
  await expect(panel).toContainText('Indicador');
  await expect(panel.locator('[lang="ko"]')).toHaveCount(0);
  await expect(page.locator('.hand-current-region')).not.toContainText('Sonnal');
});
