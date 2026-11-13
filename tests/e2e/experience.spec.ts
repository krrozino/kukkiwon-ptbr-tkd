import { expect, test } from '@playwright/test';

test('um aluno encontra Sonnal, consulta fontes e chega ao Atlas', async ({ page }) => {
  await page.route('**/rest/v1/**', route => route.fulfill({ json: [] }));
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'O que você quer estudar?' }).fill('손날');
  await page.getByRole('button', { name: 'Buscar na biblioteca' }).click();
  const item = page.getByRole('link', { name: 'Sonnal', exact: true });
  await expect(item).toBeVisible();
  await item.click();
  await expect(page.getByRole('heading', { name: 'Sonnal', exact: true })).toBeVisible();
  await expect(page.locator('main [lang="ko"]').first()).toContainText('손날');
  await expect(page.locator('main a[href^="https://research.kukkiwon.or.kr/"]').first()).toBeVisible();
  await page.getByRole('link', { name: 'Ver no Atlas' }).click();
  await expect(page).toHaveURL(/region=sonnal/);
  await expect(page.locator('.hand-current-region')).toContainText('Sonnal');
  await expect(page.getByRole('link', { name: 'Abrir ficha na biblioteca' }).first()).toBeVisible();
});

test('busca tem filtros, vazio útil e histórico reproduzível', async ({ page }) => {
  await page.goto('/biblioteca?q=palma');
  await expect(page.locator('.library-results a')).not.toHaveCount(0);
  await page.getByLabel('Área de estudo', { exact: true }).selectOption('balkisul');
  await expect(page.getByText('Nenhuma ficha encontrada')).toBeVisible();
  await page.getByRole('button', { name: 'Limpar filtros' }).click();
  await expect(page.locator('.library-results a')).toHaveCount(23);
  await page.getByRole('searchbox', { name: 'Buscar na biblioteca', exact: true }).fill('손날');
  await expect(page.locator('.library-results a')).toHaveCount(2);
  await page.reload();
  await expect(page.locator('.library-results a')).toHaveCount(2);
});

test('professor vincula a biblioteca ao currículo local e o aluno reabre a ficha', async ({ page }) => {
  await page.route('**/rest/v1/**', route => route.fulfill({ json: [] }));
  await page.goto('/curriculos');
  await page.getByRole('button', { name: 'Montar currículo neste navegador', exact: true }).click();
  await page.getByRole('button', { name: 'Adicionar conteúdo', exact: true }).click();
  await page.getByRole('button', { name: 'Vincular técnica do catálogo', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Buscar técnica para inserir', exact: true }).fill('sonnal');
  await page.getByRole('button', { name: 'Sonnal · Borda externa da mão (mão em faca)', exact: true }).click();
  await page.getByRole('button', { name: 'Salvar currículo neste navegador', exact: true }).click();
  await page.reload();
  await page.getByRole('link', { name: 'Consultar Sonnal na biblioteca', exact: true }).click();
  await expect(page).toHaveURL(/\/biblioteca\/sonkisul\/sonnal/);
});

test('favorito da biblioteca continua acessível no caderno de estudos', async ({ page }) => {
  await page.goto('/biblioteca/sonkisul/sonnal');
  await page.getByRole('button', { name: /Salvar nos estudos/ }).click();
  await page.goto('/estudos');
  await page.locator('.study-items').getByRole('button', { name: 'Sonnal', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Ficha contextual' })).toContainText('손날');
  await expect(page.getByRole('link', { name: 'Abrir ficha completa' })).toHaveAttribute('href', '/biblioteca/sonkisul/sonnal');
});

test('menu móvel funciona com teclado e atalho pula para o conteúdo', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  const menu = page.getByRole('button', { name: 'Menu', exact: true });
  await menu.focus();
  await page.keyboard.press('Enter');
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#primary-links').getByRole('link', { name: 'Biblioteca' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
  await menu.click();
  await page.locator('#primary-links').getByRole('link', { name: 'Biblioteca' }).click();
  await expect(page).toHaveURL(/\/biblioteca/);
});

for (const width of [375, 768, 1440]) {
  for (const theme of ['light', 'dark'] as const) {
    test(`fluxo cabe em ${width}px no tema ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: theme });
      await page.route('**/rest/v1/**', route => route.fulfill({ json: [] }));
      for (const route of ['/', '/biblioteca', '/biblioteca/sonkisul/sonnal', '/atlas?region=sonnal&zoom=1', '/curriculos', '/estudos', '/escolas']) {
        await page.goto(route);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
        expect(await page.evaluate(() => document.documentElement.scrollWidth), route).toBeLessThanOrEqual(width);
      }
    });
  }
}
