import { expect, test } from '@playwright/test';

test('currículo local suporta intervalos de Sebon por graduação (1 a 5 e 1 a 10) e persiste após recarregar', async ({ page }) => {
  await page.route('**/rest/v1/**', route => route.fulfill({ json: [] }));
  await page.goto('/curriculos');
  await page.getByRole('button', { name: 'Montar currículo neste navegador', exact: true }).click();
  await page.getByLabel('Nome do currículo', { exact: true }).fill('Currículo Dojang Central');

  const firstGrade = page.locator('.grade-editor').first();
  await firstGrade.getByLabel('Nome da graduação', { exact: true }).fill('Faixa Amarela');
  await firstGrade.getByRole('button', { name: 'Adicionar conteúdo', exact: true }).click();
  await firstGrade.getByLabel('Conteúdo', { exact: true }).fill('Combate combinado inicial');
  await firstGrade.getByLabel('Tipo de requisito', { exact: true }).selectOption('matchuo-kyorugi');
  await firstGrade.getByRole('button', { name: 'Intervalo 1 a 5', exact: true }).click();

  await page.getByRole('button', { name: 'Adicionar graduação', exact: true }).click();
  const secondGrade = page.locator('.grade-editor').nth(1);
  await secondGrade.getByLabel('Nome da graduação', { exact: true }).fill('Ponta Verde');
  await secondGrade.getByRole('button', { name: 'Adicionar conteúdo', exact: true }).click();
  await secondGrade.getByLabel('Conteúdo', { exact: true }).fill('Combate combinado intermediário');
  await secondGrade.getByLabel('Tipo de requisito', { exact: true }).selectOption('matchuo-kyorugi');
  await secondGrade.getByRole('button', { name: 'Intervalo 1 a 10', exact: true }).click();

  await page.getByRole('button', { name: 'Salvar currículo neste navegador', exact: true }).click();
  await expect(page.getByText('Sebon Kyorugi · 1 a 5', { exact: true })).toBeVisible();
  await expect(page.getByText('Sebon Kyorugi · 1 a 10', { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByText('Sebon Kyorugi · 1 a 5', { exact: true })).toBeVisible();
  await expect(page.getByText('Sebon Kyorugi · 1 a 10', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Consultar Sebon Kyorugi na biblioteca', exact: true })).toHaveCount(2);
  await page.getByRole('link', { name: 'Consultar Sebon Kyorugi na biblioteca', exact: true }).first().click();
  await expect(page).toHaveURL(/\/biblioteca\/matchuo-kyorugi\/sebon-kyorugi$/);
});

test('Meu Estudo importa trilha guiada, marca item para revisão e filtra progresso', async ({ page }) => {
  await page.route('**/rest/v1/**', route => route.fulfill({ json: [] }));
  await page.goto('/estudos');
  await page.getByRole('button', { name: 'Adicionar trilha: Sou iniciante', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Trilha · Primeiros passos', exact: true })).toBeVisible();
  await expect(page.locator('.study-items li')).toHaveCount(8);

  await page.locator('.study-items li').first().getByRole('button', { name: 'Marcar revisão', exact: true }).click();
  await page.getByRole('button', { name: 'Em revisão (1)', exact: true }).click();
  await expect(page.locator('.study-items li')).toHaveCount(1);
  await expect(page.locator('.study-items li').first().getByRole('link', { name: 'Ir à biblioteca ↗' })).toHaveAttribute(
    'href',
    '/biblioteca/iron/iron-significado-taekwondo',
  );
});

test('trilhas que compartilham uma ficha preservam o conteúdo e o progresso da primeira pasta', async ({ page }) => {
  await page.route('**/rest/v1/**', route => route.fulfill({ json: [] }));
  await page.goto('/estudos');
  await page.getByRole('button', { name: 'Adicionar trilha: Sou iniciante', exact: true }).click();
  const apChagi = page.locator('.study-items li').filter({ has: page.getByRole('button', { name: 'Ap-chagi', exact: true }) });
  await apChagi.getByRole('checkbox').check();
  await apChagi.getByRole('button', { name: 'Marcar revisão', exact: true }).click();
  await page.getByText('Trilhas guiadas de estudo', { exact: false }).click();
  await page.getByRole('button', { name: 'Adicionar trilha: Chutes e superfícies do pé', exact: true }).click();
  await expect(apChagi.getByRole('checkbox')).toBeChecked();
  await expect(apChagi.getByRole('button', { name: 'Em revisão', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Trilha · Primeiros passos', exact: true }).click();
  await expect(page.locator('.study-items li')).toHaveCount(8);
  await expect(apChagi.getByRole('checkbox')).toBeChecked();
  await apChagi.getByRole('link', { name: 'Ir à biblioteca ↗' }).click();
  await expect(page).toHaveURL(/\/biblioteca\/balkisul\/ap-chagi$/);
});
