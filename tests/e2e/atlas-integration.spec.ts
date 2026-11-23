import { expect, test, type Locator } from '@playwright/test';

test('mão, pé e braço coexistem no Atlas e preservam a navegação com a Biblioteca', async ({
  baseURL, isMobile, page,
}) => {
  const origin = new URL(baseURL!).origin;
  const handRequests: URL[] = [];
  const unexpectedRequests: string[] = [];
  await page.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === origin || !['fetch', 'xhr'].includes(request.resourceType())) {
      return route.continue();
    }
    const region = new URL(request.frame().url()).searchParams.get('region');
    const handLookup = request.method() === 'GET' && url.pathname === '/rest/v1/body_regions' && (
      ((region === 'hands' || region === 'sonnal') && url.searchParams.get('atlas_area') === 'eq.hands') ||
      (region === 'sonnal' && url.searchParams.get('slug') === 'eq.sonnal')
    );
    if (handLookup) {
      handRequests.push(url);
      return route.fulfill({ json: [] });
    }
    unexpectedRequests.push(url.href);
    return route.abort();
  });

  const figure = page.getByRole('region', { name: 'Explorar o mapa corporal' });
  const inspector = page.getByRole('region', { name: 'Detalhes da região selecionada' });
  const chooseZone = async (zone: Locator) => {
    if (isMobile) await zone.tap();
    else {
      await zone.focus();
      await zone.press('Space');
    }
  };
  const zoomArea = async (name: string) => {
    await figure.getByRole('button', { name, exact: true }).click();
    await figure.getByRole('button', { name: 'Ampliar região' }).click();
  };

  await page.goto('/atlas?region=hands&zoom=1');
  await chooseZone(figure.locator('[data-legend-zone="sonnal"]'));
  const hand = page.locator('.hand-current-region');
  await expect(hand).toContainText('손날');
  await figure.getByRole('button', { name: 'Dorso', exact: true }).click();
  await expect(page).toHaveURL(/region=sonnal.*detail=back/);
  await expect(hand).toContainText('Sonnal');
  await hand.getByText('Fontes e referências', { exact: true }).click();
  await expect(hand.locator('.hand-term-sources a').first())
    .toHaveAttribute('href', /^https:\/\/research\.kukkiwon\.or\.kr\//);
  await hand.getByRole('link', { name: /Abrir ficha na biblioteca/i }).click();
  await expect(page).toHaveURL(/\/biblioteca\/sonkisul\/sonnal\/?$/);
  await page.getByRole('link', { name: /Ver no Atlas/ }).click();
  await expect(hand).toContainText('손날');

  await zoomArea('Pés');
  await figure.getByRole('button', { name: 'Planta', exact: true }).click();
  await chooseZone(figure.locator('[data-legend-zone="apchuk"]'));
  await expect(inspector).toContainText('Apchuk');
  await figure.getByRole('button', { name: 'Dorso', exact: true }).click();
  await expect(inspector.getByRole('status')).toHaveText('Região selecionada na vista Planta.');
  await expect(inspector.locator('a[href^="https://research.kukkiwon.or.kr/"]').first()).toBeVisible();
  await inspector.getByRole('link', { name: /Abrir ficha de Apchuk/ }).click();
  await expect(page).toHaveURL(/\/biblioteca\/balkisul\/apchuk\/?$/);
  await page.getByRole('link', { name: /Ver no Atlas/ }).click();
  await expect(figure.locator('[data-region="apchuk"]')).toHaveAttribute('aria-pressed', 'true');

  await zoomArea('Braços');
  await chooseZone(figure.locator('[data-legend-zone="arms-elbow"]'));
  await expect(inspector).toContainText('팔굽');
  await figure.getByRole('button', { name: 'Vista posterior' }).click();
  await expect(page).toHaveURL(/region=palgup.*view=back/);
  await expect(inspector.getByRole('link', { name: /Applicable Parts of the Body.*Palgup/ }))
    .toHaveAttribute('href', 'https://research.kukkiwon.or.kr/homepage/boardMedia/11621');
  await inspector.getByRole('link', { name: /Abrir ficha.*na Biblioteca/ }).click();
  await expect(page).toHaveURL(/\/biblioteca\/kibon-dongjak\/palgup-mureup-chigi\/?$/);
  await page.goBack();
  await expect(figure.locator('[data-region="arms-elbow"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(figure.getByRole('button', { name: 'Vista posterior' })).toHaveAttribute('aria-pressed', 'true');

  await zoomArea('Mãos');
  await figure.getByRole('button', { name: 'Palma', exact: true }).click();
  await expect(figure.locator('[data-legend-zone="sonnal"]')).toBeVisible();
  expect(unexpectedRequests).toEqual([]);
  if (process.env.ATLAS_INTEGRATION_NO_CATALOG === '1') expect(handRequests).toHaveLength(0);
  else expect(handRequests.length).toBeGreaterThan(0);
});
