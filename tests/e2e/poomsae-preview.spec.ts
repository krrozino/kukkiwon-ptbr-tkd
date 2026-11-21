import { expect, test } from '@playwright/test';

test('a prévia de estudo ainda não faz parte do site público', async ({ page }) => {
  await page.goto('/poomsae?forma=taegeuk-1-jang');
  await expect(page.getByRole('link', { name: 'Estudar Taegeuk 1 Jang' })).toHaveCount(0);
  const response = await page.goto('/poomsae/taegeuk-1-jang');
  expect(response?.status()).toBe(404);
});
