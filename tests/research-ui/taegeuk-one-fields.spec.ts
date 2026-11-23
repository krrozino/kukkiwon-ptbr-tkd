import { expect, test } from '@playwright/test';

test('percorre as 18 etapas e confere os campos documentais', async ({ page }) => {
  await page.goto('/poomsae/taegeuk-1-jang');
  await expect(page.getByText('18 etapas numeradas · 20 ações')).toBeVisible();
  await expect(page.getByText('Preparação', { exact: true })).toBeVisible();
  await expect(page.getByText('Retorno à preparação', { exact: true })).toBeVisible();
  await expect(page.locator('astro-island[ssr]').filter({ has: page.locator('#sequencia') })).toHaveCount(0);
  await page.getByRole('button', { name: /^Movimento 1:/ }).click();

  const movement = page.getByRole('region', { name: 'Movimento selecionado' });
  await expect(movement.getByRole('button', { name: 'Anterior' })).toBeDisabled();
  for (let number = 1; number <= 18; number++) {
    await expect(movement.getByRole('status')).toHaveText('Movimento ' + number + ' de 18');
    await expect(movement.getByText('Direção no diagrama')).toBeVisible();
    await expect(movement.getByText('Deslocamento dos pés')).toBeVisible();
    await expect(movement.getByText('Lado da base')).toBeVisible();
    await expect(movement.getByText('Pé da frente')).toBeVisible();
    await expect(movement.getByText('Membro executante').first()).toBeVisible();
    await expect(movement.locator('.study-frames [lang=ko]')).toHaveCount([14, 16].includes(number) ? 2 : 1);
    await expect(movement.locator('a[href*="naeryeo-makgi"], a[href*="jeocheo-jireugi"], a[href*="ollyeo-makgi"]')).toHaveCount(0);

    if (number === 6) {
      await expect(movement.getByText('Ambos os pés permanecem no lugar.')).toBeVisible();
      await expect(movement.getByText('Punho direito', { exact: true })).toBeVisible();
    }
    if (number === 16) {
      await expect(movement.getByRole('link', { name: /p\. 61.*16-1/ })).toBeVisible();
      await expect(movement.getByRole('link', { name: /p\. 62.*16-2/ })).toBeVisible();
    }
    if (number < 18) await page.keyboard.press('ArrowRight');
  }
  await expect(movement.getByRole('button', { name: 'Próximo' })).toBeDisabled();
  await page.keyboard.press('ArrowLeft');
  await expect(movement.getByRole('status')).toHaveText('Movimento 17 de 18');

  await page.getByRole('button', { name: 'Ficha de revisão' }).click();
  const review = page.getByRole('region', { name: 'Ficha de revisão docente' });
  await expect(review.getByText('Pontos para confirmação docente')).toHaveCount(18);
  await review.getByRole('button', { name: 'Estudar passo 6', exact: true }).click();
  await expect(movement.getByRole('status')).toHaveText('Movimento 6 de 18');
});
