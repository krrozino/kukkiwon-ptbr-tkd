import { expect, test } from '@playwright/test';

test('a prévia de estudo ainda não faz parte do site público', async ({ page }) => {
  await page.goto('/poomsae');
  await expect(page.getByRole('link', { name: /Estudar Taegeuk [12] Jang/ })).toHaveCount(0);

  for (const number of [1, 2]) {
    const response = await page.goto(`/poomsae/taegeuk-${number}-jang`);
    expect(response?.status()).toBe(404);
  }
});
