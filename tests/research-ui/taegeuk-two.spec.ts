import { expect, test } from '@playwright/test';

test('a disponibilidade local do segundo piloto acompanha a presença do dossiê', async ({ page, request }) => {
  await page.goto('/poomsae');
  await expect(page.getByRole('link', { name: 'Estudar Taegeuk 1 Jang' })).toBeVisible();
  const route = await request.get('/poomsae/taegeuk-2-jang');
  const link = page.getByRole('link', { name: 'Estudar Taegeuk 2 Jang' });
  if (!process.env.POOMSAE_RESEARCH_DIR || process.env.POOMSAE_RESEARCH_FILE) expect(route.status()).toBe(200);
  if (route.ok()) await expect(link).toBeVisible();
  else {
    expect(route.status()).toBe(404);
    await expect(link).toHaveCount(0);
  }
});

for (const scheme of ['light', 'dark'] as const) {
  test('estuda o Taegeuk 2 no tema ' + scheme, async ({ page, request }, testInfo) => {
    const width = testInfo.project.name === 'mobile' ? 375 : 1440;
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme: scheme });
    await page.addInitScript(() => {
      localStorage.setItem('tkd:curriculum-draft', JSON.stringify({
        title: 'Currículo de teste',
        description: '',
        grades: [{
          id: 'escola', name: 'Faixa da escola de teste',
          requirements: [{
            id: 'segunda-forma', title: 'Segunda forma', kind: 'poomsae',
            termSlug: 'taegeuk-2-jang', notes: '', mediaId: '',
          }],
        }],
      }));
    });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/poomsae');
    const link = page.getByRole('link', { name: 'Estudar Taegeuk 2 Jang' });
    if (!process.env.POOMSAE_RESEARCH_FILE && process.env.POOMSAE_RESEARCH_DIR && !(await link.count())) {
      expect((await request.get('/poomsae/taegeuk-2-jang')).status()).toBe(404);
      return;
    }
    await link.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
    await expect(page.getByRole('heading', { name: 'Taegeuk 2 Jang', exact: true })).toBeVisible();
    await expect(page.getByText('태극 2장', { exact: true })).toBeVisible();
    await expect(page.getByText(/Faixa da escola de teste/)).toBeVisible();
    await expect(page.getByRole('img', { name: /Na e Ga formam o eixo central/ })).toBeVisible();
    if (!process.env.POOMSAE_RESEARCH_FILE && !process.env.POOMSAE_RESEARCH_DIR) {
      await expect(page.getByText(/Dados sintéticos de teste/)).toBeVisible();
      await expect(page.getByText(/Cobertura parcial/)).toBeVisible();
      await page.getByRole('button', { name: 'Passo a passo' }).click();
      const movement = page.getByRole('region', { name: 'Movimento selecionado' });
      await expect(movement.getByRole('status')).toHaveText('Movimento 1 de 2');
      await movement.getByRole('button', { name: 'Próximo' }).click();
      await expect(movement.getByRole('status')).toHaveText('Movimento 2 de 2');
      await expect(movement.getByRole('list', { name: 'Ações da etapa' }).getByRole('listitem')).toHaveCount(2);
      await expect(movement.getByRole('list', { name: 'Transições documentadas' })).toContainText('Transição sintética entre quadros');
      await expect(movement.getByText('Documentado na etapa')).toBeVisible();
      await expect(movement.getByRole('button', { name: 'Próximo' })).toBeDisabled();
      await expect(page).toHaveURL(/movimento=2/);
      await page.reload();
      await expect(movement.getByRole('status')).toHaveText('Movimento 2 de 2');
      await page.getByRole('button', { name: 'Ficha de revisão' }).click();
      await expect(page.getByRole('region', { name: 'Ficha de revisão docente' }).locator('.study-review-card')).toHaveCount(2);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      expect(errors).toEqual([]);
      await page.goto('/poomsae/koryo?movimento=1');
      await expect(page.getByText(/Dados sintéticos de teste/)).toBeVisible();
      await expect(page.getByRole('img', { name: /Na e Ga formam o eixo central/ })).toHaveCount(0);
      await expect(page.getByRole('region', { name: 'Movimento selecionado' })).toContainText('Marco lateral de teste');
      return;
    }
    await expect(page.getByRole('heading', { name: 'Tae 태' })).toBeVisible();
    await expect(page.getByText('18 etapas numeradas · 23 ações')).toBeVisible();
    await expect(page.getByText('Retorno à preparação', { exact: true })).toBeVisible();
    const overview = page.getByRole('button', { name: /^Movimento \d+:/ });
    await expect(overview).toHaveCount(18);
    await expect(page.getByText('2 quadros', { exact: true })).toHaveCount(5);
    await overview.first().click();
    const movement = page.getByRole('region', { name: 'Movimento selecionado' });
    await expect(movement.getByRole('status')).toHaveText('Movimento 1 de 18');
    await expect(movement.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    const links = new Set<string>();
    let actionCount = 0;
    for (let n = 1; n <= 18; n += 1) {
      await movement.getByRole('button', { name: `Ir para movimento ${n}`, exact: true }).click();
      await expect(movement.getByRole('status')).toHaveText(`Movimento ${n} de 18`);
      const stageReferences = movement.getByRole('list', { name: 'Referências da etapa' });
      await expect(stageReferences.getByRole('link', { name: /Education Media Center/ })).toBeVisible();
      const frames = movement.getByRole('list', { name: 'Ações da etapa' }).getByRole('listitem');
      const count = await frames.count();
      actionCount += count;
      if (count === 2) await expect(movement.getByText('Base final', { exact: true })).toBeVisible();
      for (const frame of await frames.all()) {
        await expect(frame.locator('[lang="ko"]')).toBeVisible();
        const sources = frame.getByRole('link', { name: /Education Media Center/ });
        await expect(sources.first()).toBeVisible();
        for (const source of await sources.all()) await expect(source).toHaveAttribute('href', /#page=\d+$/);
      }
      for (const href of await movement.locator('a[href^="/biblioteca/"]').evaluateAll(
        (anchors) => anchors.map((node) => node.getAttribute('href')!),
      )) links.add(href);
    }
    expect(actionCount).toBe(23);
    expect(links).toContain('/biblioteca/balkisul/ap-chagi');
    expect(links).toContain('/biblioteca/kibon-dongjak/apgubi');
    for (const href of links) expect((await request.get(href)).status()).toBe(200);
    await expect(movement.getByRole('button', { name: 'Próximo' })).toBeDisabled();
    await page.keyboard.press('ArrowLeft');
    await expect(movement.getByRole('status')).toHaveText('Movimento 17 de 18');
    await movement.getByRole('button', { name: 'Ir para movimento 14', exact: true }).click();
    await expect(movement.getByText(/Deslocamento em revisão docente/)).toBeVisible();
    await expect(movement.getByText(/Divergência entre fontes/)).toBeVisible();
    await expect(movement.getByText(/deslocamento pequeno do pé direito/)).toBeVisible();
    await expect(movement.getByText(/dois pés permanecendo no lugar/)).toBeVisible();
    await movement.getByRole('button', { name: 'Ir para movimento 2', exact: true }).click();
    await expect(movement.getByRole('link', { name: 'Família Jireugi no Acervo' })).toHaveAttribute('href', '/acervo?categoria=soco');
    await expect(movement.locator('svg animate, svg animateMotion, svg animateTransform')).toHaveCount(0);
    await expect(page.locator('iframe')).toHaveCount(0);
    await page.getByRole('button', { name: 'Ficha de revisão' }).click();
    const reviewRegion = page.getByRole('region', { name: 'Ficha de revisão docente' });
    await expect(reviewRegion.locator('.study-review-card')).toHaveCount(18);
    await expect(reviewRegion.getByText('Pontos para confirmação docente')).toHaveCount(18);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    expect(errors).toEqual([]);
    const formLink = page.getByRole('link', { name: 'Ficha da forma na Biblioteca' });
    await formLink.click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Taegeuk 2 Jang');
  });
}
