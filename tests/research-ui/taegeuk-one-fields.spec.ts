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

test('mantém o foco no movimento ao usar os controles nos limites da sequência', async ({ page }) => {
  await page.goto('/poomsae/taegeuk-1-jang');
  await expect(page.locator('astro-island[ssr]').filter({ has: page.locator('#sequencia') })).toHaveCount(0);
  await page.getByRole('button', { name: /^Movimento 17:/ }).click();

  const movement = page.getByRole('region', { name: 'Movimento selecionado' });
  const heading = movement.getByRole('heading', { level: 3 });
  const status = movement.getByRole('status');

  await movement.getByRole('button', { name: 'Próximo' }).press('Enter');
  await expect(status).toHaveText('Movimento 18 de 18');
  await expect(heading).toBeFocused();
  await expect(heading).toBeInViewport();
  await page.keyboard.press('ArrowLeft');
  await expect(status).toHaveText('Movimento 17 de 18');

  await movement.getByRole('button', { name: 'Ir para movimento 2' }).click();
  await movement.getByRole('button', { name: 'Anterior' }).press('Enter');
  await expect(status).toHaveText('Movimento 1 de 18');
  await expect(heading).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(status).toHaveText('Movimento 2 de 18');
});

for (const scheme of ['light', 'dark'] as const) {
  test('orienta os 18 movimentos pelo referencial inicial no tema ' + scheme, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: testInfo.project.name === 'mobile' ? 375 : 1440, height: 900 });
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('/poomsae/taegeuk-1-jang');

    const sequence = page.locator('#sequencia');
    await expect(sequence).toBeVisible();
    await expect(page.locator('astro-island[ssr]').filter({ has: sequence })).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);

    const course = page.getByRole('img', { name: /Na e Ga formam o eixo central/ });
    const diagram = await course.locator('text').evaluateAll((labels) =>
      Object.fromEntries(labels.map((label) => [label.textContent, {
        x: Number(label.getAttribute('x')),
        y: Number(label.getAttribute('y')),
      }])),
    );
    await expect(course.getByText('Frente (Ga)', { exact: true })).toBeVisible();
    await expect(course.getByText('Início (Na)', { exact: true })).toBeVisible();
    expect(diagram['Frente (Ga)'].y).toBeLessThan(diagram['Início (Na)'].y);
    for (const [line, leftSteps, rightSteps] of [[1, '1–2', '3–4'], [2, '9–10', '7–8'], [3, '13–14', '15–16']] as const) {
      const left = diagram['Da ' + line];
      const right = diagram['Ra ' + line];
      expect(left.x).toBeLessThan(right.x);
      expect(left.y).toBe(right.y);
      expect(diagram[leftSteps]).toEqual({ x: left.x, y: left.y + 31 });
      expect(diagram[rightSteps]).toEqual({ x: right.x, y: right.y + 31 });
    }
    expect(diagram['Da 1'].y).toBeGreaterThan(diagram['Da 2'].y);
    expect(diagram['Da 2'].y).toBeGreaterThan(diagram['Da 3'].y);

    const steps = [
      ['Esquerda (Da 1)', 180], ['Esquerda (Da 1)', 180],
      ['Direita (Ra 1)', 0], ['Direita (Ra 1)', 0],
      ['Frente (Ga)', -90], ['Frente (Ga)', -90],
      ['Direita (Ra 2)', 0], ['Direita (Ra 2)', 0],
      ['Esquerda (Da 2)', 180], ['Esquerda (Da 2)', 180],
      ['Frente (Ga)', -90], ['Frente (Ga)', -90],
      ['Esquerda (Da 3)', 180], ['Esquerda (Da 3)', 180],
      ['Direita (Ra 3)', 0], ['Direita (Ra 3)', 0],
      ['Trás (Na)', 90], ['Trás (Na)', 90],
    ] as const;

    await expect(sequence.getByRole('button', { name: /^Movimento 1:/ })).toContainText('Esquerda (Da 1)');
    await expect(sequence.getByRole('button', { name: /^Movimento 5:/ })).toContainText('Frente (Ga)');
    await sequence.getByRole('button', { name: /^Movimento 1:/ }).click();

    const movement = page.getByRole('region', { name: 'Movimento selecionado' });
    for (const [index, [direction, angle]] of steps.entries()) {
      await expect(movement.getByRole('status')).toHaveText('Movimento ' + (index + 1) + ' de 18');
      const marker = movement.getByRole('img', { name: direction + ' na orientação inicial' });
      await expect(marker.locator('path[transform]')).toHaveAttribute('transform', 'rotate(' + angle + ' 88 54)');
      await expect(movement.locator('figcaption')).toHaveText(direction + ' · orientação inicial');
      await expect(movement.locator('dt').filter({ hasText: 'Direção no diagrama' }).locator('+ dd')).toContainText(direction);
      if (index < steps.length - 1) await page.keyboard.press('ArrowRight');
    }
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      page.viewportSize()!.width,
    );
  });
}
