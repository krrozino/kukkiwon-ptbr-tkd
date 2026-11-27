import { expect, test } from '@playwright/test';

const forms = [
  ...Array.from({ length: 8 }, (_, i) => 'taegeuk-' + (i + 1) + '-jang'),
  'koryo', 'keumgang', 'taebaek', 'pyongwon', 'shipjin', 'jitae', 'chonkwon', 'hansu', 'ilyeo',
];

test('as rotas privadas de Poomsae permanecem fora do site público', async ({ page, request }) => {
  await page.goto('/poomsae?forma=taegeuk-2-jang');
  await expect(page.getByRole('link', { name: /^Estudar (Taegeuk|Koryo)/ })).toHaveCount(0);
  for (const slug of forms) {
    const response = await request.get('/poomsae/' + slug);
    expect(response.status(), slug).toBe(404);
  }
});
