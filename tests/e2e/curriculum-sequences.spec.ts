import { expect, test } from '@playwright/test';

test('currículo escolar permite Sebon 1–5 e 1–10 em graduações diferentes', async ({page}) => {
  await page.goto('/curriculos');
  await page.getByRole('button',{name:'Montar currículo neste navegador'}).click();
  await page.getByLabel('Nome da graduação').first().fill('Faixa Amarela');
  await page.getByRole('button',{name:'Adicionar conteúdo'}).first().click();
  await page.getByLabel('Área / Tipo de requisito').first().selectOption('matchuo-kyorugi');
  await page.locator('.grade-editor').first().getByRole('button',{name:/faixa amarela · Sebon 1 a 5/}).click();
  await expect(page.getByText('Sebon 1 a 5').first()).toBeVisible();
  await page.getByRole('button',{name:'Adicionar graduação'}).click();
  await page.getByLabel('Nome da graduação').nth(1).fill('Ponta Verde');
  await page.getByRole('button',{name:'Adicionar conteúdo'}).nth(1).click();
  await page.getByLabel('Área / Tipo de requisito').nth(1).selectOption('matchuo-kyorugi');
  await page.locator('.grade-editor').nth(1).getByRole('button',{name:/ponta verde · Sebon 1 a 10/}).click();
  await page.getByRole('button',{name:'Salvar currículo neste navegador'}).click();
  await expect(page.getByRole('status')).toContainText('Currículo salvo neste navegador');
  await expect(page.getByText('Sebon 1 a 5').first()).toBeVisible();
  await expect(page.getByText('Sebon 1 a 10').first()).toBeVisible();
  await page.reload();
  await expect(page.getByText('Sebon 1 a 5').first()).toBeVisible();
  await expect(page.getByText('Sebon 1 a 10').first()).toBeVisible();
});

test('intervalo incompleto não é salvo silenciosamente', async ({page}) => {
  await page.goto('/curriculos');
  await page.getByRole('button',{name:'Montar currículo neste navegador'}).click();
  await page.getByRole('button',{name:'Adicionar conteúdo'}).click();
  await page.getByLabel('Área / Tipo de requisito').selectOption('matchuo-kyorugi');
  await page.getByLabel('Do nº').fill('8');
  await page.getByRole('button',{name:'Salvar currículo neste navegador'}).click();
  await expect(page.getByRole('status')).toContainText('Requisito inválido');
});
