import { expect, test } from '@playwright/test';

for (const number of [1, 2]) {
  test(`a prévia do Taegeuk ${number} permanece fora do site público`, async ({ page }) => {
    await page.goto(`/poomsae?forma=taegeuk-${number}-jang`);
    await expect(page.getByRole('link', { name: `Estudar Taegeuk ${number} Jang` })).toHaveCount(0);
    const response = await page.goto(`/poomsae/taegeuk-${number}-jang`);
    expect(response?.status()).toBe(404);
  });
}
