import { expect, test } from '@playwright/test';

for (const scheme of ['light', 'dark'] as const) {
  test('estuda o Taegeuk 1 e consulta as fichas no tema ' + scheme, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: testInfo.project.name === 'mobile' ? 375 : 1440, height: 900 });
    await page.emulateMedia({ colorScheme: scheme });
    await page.addInitScript(() => {
      localStorage.setItem('tkd:curriculum-draft', JSON.stringify({
        title: 'Currículo de teste',
        description: '',
        grades: [{
          id: 'azul-escola',
          name: 'Faixa azul da escola',
          requirements: [{
            id: 'primeira-forma',
            title: 'Primeira forma',
            kind: 'poomsae',
            termSlug: 'taegeuk-1-jang',
            notes: '',
            mediaId: '',
          }],
        }],
      }));
    });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/poomsae?forma=taegeuk-1-jang');
    await page.getByRole('link', { name: 'Estudar Taegeuk 1 Jang' }).click();
    await expect(page.getByRole('heading', { name: 'Taegeuk 1 Jang', exact: true })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
    await expect(page.getByText('태극 1장', { exact: true })).toBeVisible();
    await expect(page.getByText(/Faixa azul da escola/)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Galeria de estudo' })).toBeVisible();
    await expect(page.getByRole('img', { name: /Na e Ga formam o eixo central/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Aula da Kukkiwon no YouTube' })).toBeVisible();

    await expect(page.locator('iframe')).toHaveCount(0);
    await page.route('https://www.youtube-nocookie.com/embed/T6J2C1QJLts', (route) => route.fulfill({
      contentType: 'text/html',
      body: '<title>Player de teste</title>',
    }));
    await page.getByRole('button', { name: 'Carregar demonstração do YouTube' }).click();
    await expect(page.locator('iframe')).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/T6J2C1QJLts');

    await page.getByRole('button', { name: 'Movimento 14: Chute frontal e soco médio' }).click();
    const movement = page.getByRole('region', { name: 'Movimento selecionado' });
    await expect(movement.getByRole('status')).toHaveText('Movimento 14 de 18');
    await expect(movement.getByRole('link', { name: 'Ap-chagi' })).toHaveAttribute('href', '/biblioteca/balkisul/ap-chagi');
    await expect(movement.getByRole('link', { name: 'Ap-seogi' })).toHaveAttribute('href', '/biblioteca/kibon-dongjak/ap-seogi');
    await expect(movement.getByRole('link', { name: /Kukkiwon.*p. 60/ })).toHaveAttribute('href', /#page=60$/);
    await page.keyboard.press('ArrowRight');
    await expect(movement.getByRole('status')).toHaveText('Movimento 15 de 18');
    await movement.getByRole('button', { name: 'Anterior' }).click();
    await expect(movement.getByRole('status')).toHaveText('Movimento 14 de 18');

    await page.getByRole('button', { name: 'Visão geral' }).click();
    await page.getByRole('button', { name: 'Movimento 18: Soco médio com kihap' }).click();
    await expect(movement.getByRole('button', { name: 'Próximo' })).toBeDisabled();
    await page.getByRole('button', { name: 'Ficha de revisão' }).click();
    const reviewRegion = page.getByRole('region', { name: 'Ficha de revisão docente' });
    await expect(reviewRegion.locator('.study-review-card')).toHaveCount(18);
    await expect(reviewRegion.getByText('Pontos para confirmação docente')).toHaveCount(18);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      page.viewportSize()!.width,
    );
    expect(errors).toEqual([]);
    await page.getByRole('link', { name: 'Ficha da forma na Biblioteca' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Taegeuk 1 Jang');
  });
}
