import { expect, test } from '@playwright/test';

const frontZones = [
  ['head-face', 'Face', ['얼굴', '인중']],
  ['head-forehead', 'Testa', []],
  ['head-temples', 'Têmporas', []],
  ['head-chin', 'Queixo', ['턱']],
  ['head-neck', 'Pescoço', ['목']],
] as const;
const backZones = [
  ['head-occiput', 'Nuca e região posterior da cabeça', []],
  ['head-neck', 'Pescoço', ['목']],
] as const;

for (const theme of ['light', 'dark'] as const) {
  test('cabeça e pescoço selecionam seis regiões com evidência local em tema ' + theme, async ({ page, isMobile }) => {
    const catalogRequests: string[] = [];
    await page.route('**/rest/v1/**', route => {
      catalogRequests.push(route.request().url());
      return route.abort();
    });
    await page.emulateMedia({ colorScheme: theme });
    await page.goto('/atlas?region=head&zoom=1');
    const figure = page.getByRole('region', { name: 'Explorar o mapa corporal' });
    const inspector = page.getByRole('region', { name: 'Detalhes da região selecionada' });
    const legend = figure.getByRole('navigation', { name: 'Selecionar zona ilustrada' });

    for (const [view, zones] of [['Vista anterior', frontZones], ['Vista posterior', backZones]] as const) {
      await figure.getByRole('button', { name: view }).click();
      await expect(legend.getByRole('button')).toHaveCount(zones.length);
      for (const [id, name, hangul] of zones) {
        const hotspot = figure.locator('[data-region="' + id + '"]');
        if (isMobile) {
          await hotspot.scrollIntoViewIfNeeded();
          const point = await hotspot.evaluate(node => {
            const x = Number(node.getAttribute('data-anchor-x'));
            const y = Number(node.getAttribute('data-anchor-y'));
            return new DOMPoint(x, y).matrixTransform((node as SVGGraphicsElement).getScreenCTM()!).toJSON();
          });
          await page.touchscreen.tap(point.x, point.y);
        } else {
          await hotspot.focus();
          await hotspot.press('Space');
        }
        await expect(hotspot).toHaveAttribute('aria-pressed', 'true');
        await expect(legend.getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'true');
        await expect(page).toHaveURL(new RegExp('region=' + id + '(&|$)'));
        await expect(inspector).toContainText('Região anatômica ilustrativa');
        await expect(inspector).toContainText(name);
        await expect(inspector.locator('[lang="ko"]')).toHaveText([...hangul]);
        if (id === 'head-face') {
          await expect(inspector).toContainText('Área-alvo geral');
          await expect(inspector).toContainText('Injung');
          await expect(inspector).toContainText('sem recorte próprio');
        }
        if (id === 'head-face' || id === 'head-chin' || id === 'head-neck' || id === 'head-temples') {
          await expect(inspector).toContainText('Alvo detalhado documentado');
          for (const summary of await inspector.locator('summary').all()) {
            if (isMobile) await summary.tap();
            else {
              await summary.focus();
              await summary.press('Enter');
            }
          }
          await expect(inspector.getByRole('link', { name: /Kukkiwon.*§10/ }))
            .toHaveCount(id === 'head-face' ? 2 : 1);
          await expect(inspector.getByRole('link', { name: /Dicionário Básico de Coreano/ }))
            .toHaveCount(hangul.length);
          for (const link of await inspector.getByRole('link', { name: /Kukkiwon.*§10/ }).all()) {
            await expect(link).toHaveAttribute('href', 'https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=10');
            await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
          }
          await expect(inspector.getByRole('link', { name: /Kukkiwon.*§10/ }).first()).toBeVisible();
        } else {
          await expect(inspector).not.toContainText('Alvo detalhado documentado');
        }
        if (id === 'head-chin' || id === 'head-neck') {
          await expect(inspector.getByRole('link', { name: /Romanização do coreano/ }))
            .toHaveAttribute('href', 'https://www.korean.go.kr/front_eng/roman/roman_01.do');
        }
        const panel = inspector.locator('.surface-tooltip');
        expect(await panel.evaluate(node => node.scrollHeight <= node.clientHeight + 1)).toBe(true);
      }
    }
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(catalogRequests).toEqual([]);
  });
}

test('a ficha persiste fora da vista, na URL e no retorno da Biblioteca', async ({ page }) => {
  const requests: string[] = [];
  await page.route('**/rest/v1/**', route => {
    requests.push(route.request().url());
    return route.abort();
  });
  await page.goto('/atlas?region=head-occiput&zoom=1');
  const figure = page.getByRole('region', { name: 'Explorar o mapa corporal' });
  const inspector = page.getByRole('region', { name: 'Detalhes da região selecionada' });
  const legend = figure.getByRole('navigation', { name: 'Selecionar zona ilustrada' });
  await expect(figure.getByRole('button', { name: 'Vista posterior' })).toHaveAttribute('aria-pressed', 'true');
  await expect(figure.locator('[data-region="head-occiput"]')).toHaveAttribute('aria-pressed', 'true');
  await figure.getByRole('button', { name: 'Vista anterior' }).click();
  await expect(figure.locator('[data-region="head-occiput"]')).toHaveCount(0);
  await legend.getByRole('button', { name: 'Testa', exact: true }).focus();
  await expect(inspector).toContainText('Nuca e região posterior da cabeça');
  await expect(inspector.getByRole('status')).toHaveText('Região selecionada na vista posterior.');
  await expect(page).toHaveURL(/region=head-occiput.*view=front/);
  await page.reload();
  await expect(inspector.getByRole('status')).toHaveText('Região selecionada na vista posterior.');
  await legend.getByRole('button', { name: 'Face', exact: true }).click();
  await figure.getByRole('button', { name: 'Vista posterior' }).click();
  await expect(inspector.getByRole('status')).toHaveText('Região selecionada na vista anterior.');
  const selectedUrl = page.url();

  await page.getByRole('link', { name: /Estudar alturas e direções/ }).click();
  await expect(page).toHaveURL(/\/fundamentos\/alturas-e-direcoes\/?$/);
  await page.goBack();
  await expect(page).toHaveURL(selectedUrl);
  await page.getByRole('link', { name: /Consultar alturas e direções na Biblioteca/ }).click();
  await expect(page).toHaveURL(/\/biblioteca\/kibon-dongjak\/kibon-alturas-direcoes\/?$/);
  await page.goBack();
  await expect(page).toHaveURL(selectedUrl);
  await expect(inspector.getByRole('status')).toHaveText('Região selecionada na vista anterior.');
  await figure.getByRole('button', { name: 'Vista anterior' }).click();
  await expect(figure.locator('[data-region="head-face"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(inspector.getByRole('status')).toBeEmpty();
  expect(requests).toEqual([]);
});
