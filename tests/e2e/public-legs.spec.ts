import { expect, test } from '@playwright/test';
import { assertBodyAreaSvgGeometry, assertCuratedBodyAreaInThemes, type CuratedZoneCheck, type GeometryProbe } from './atlas-region-helpers';

const frontZones: readonly CuratedZoneCheck[] = [
  { id: 'legs-hip', urlSlug: 'legs-hip', name: 'Quadril e transição pélvica', hangul: ['아래'] },
  { id: 'legs-thigh', urlSlug: 'legs-thigh', name: 'Coxa', hangul: [] },
  { id: 'legs-knee', urlSlug: 'mureup', name: 'Joelho', hangul: ['무릎'] },
  { id: 'legs-shin', urlSlug: 'jeonggangi', name: 'Canela', hangul: ['정강이'] },
  { id: 'legs-ankle', urlSlug: 'legs-ankle', name: 'Tornozelo (transição perna–pé)', hangul: ['발목'] },
];

const backZones: readonly CuratedZoneCheck[] = [
  { id: 'legs-hip', urlSlug: 'legs-hip', name: 'Quadril e transição pélvica', hangul: ['아래'] },
  { id: 'legs-thigh', urlSlug: 'legs-thigh', name: 'Coxa', hangul: [] },
  { id: 'legs-knee-back', urlSlug: 'legs-knee-back', name: 'Posterior do joelho', hangul: ['오금'] },
  { id: 'legs-calf', urlSlug: 'legs-calf', name: 'Panturrilha', hangul: [] },
  { id: 'legs-ankle', urlSlug: 'legs-ankle', name: 'Tornozelo (transição perna–pé)', hangul: ['발목'] },
];

for (const theme of ['light', 'dark'] as const) {
  test('pernas e tornozelo selecionam todas as regiões sem catálogo remoto no tema ' + theme, async ({ page, isMobile }) => {
    await assertCuratedBodyAreaInThemes(page, isMobile, {
      area: 'legs',
      theme,
      views: [['Vista anterior', frontZones], ['Vista posterior', backZones]],
      async onZoneSelected(zone, inspector) {
        if (zone.id === 'legs-knee' || zone.id === 'legs-shin') {
          await expect(inspector).toContainText('Superfície técnica de contato');
        } else {
          await expect(inspector).toContainText('Região anatômica ilustrativa');
        }
        if (zone.id === 'legs-ankle') {
          await expect(inspector).not.toContainText('Superfície técnica de contato');
          await expect(inspector.getByRole('link', { name: /Abrir detalhe das superfícies do pé/ })).toHaveAttribute('href', '/atlas?region=feet&zoom=1');
        }
      },
    });
  });
}

test('joelho (Mureup), tornozelo e vista posterior preservam URL, fontes e retorno da Biblioteca', async ({ page }) => {
  await page.route('**/rest/v1/**', route => route.abort());
  await page.goto('/atlas?region=mureup&zoom=1');
  const figure = page.getByRole('region', { name: 'Explorar o mapa corporal' });
  const inspector = page.getByRole('region', { name: 'Detalhes da região selecionada' });
  await expect(figure.locator('[data-region="legs-knee"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(inspector).toContainText('Mureup');
  await inspector.locator('summary').click();
  await expect(inspector.getByRole('link', { name: /Applicable Parts of the Body > Mureup/ })).toHaveAttribute(
    'href',
    'https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=73',
  );

  await figure.getByRole('button', { name: 'Vista posterior', exact: true }).click();
  await expect(inspector.getByRole('status')).toHaveText('Região selecionada na vista anterior.');
  await page.reload();
  await expect(inspector.getByRole('status')).toHaveText('Região selecionada na vista anterior.');

  const mureupUrl = page.url();
  await inspector.getByRole('link', { name: /Abrir ficha de golpes com cotovelo e joelho/ }).click();
  await expect(page).toHaveURL(/\/biblioteca\/kibon-dongjak\/palgup-mureup-chigi\/?$/);
  await page.goBack();
  await expect(page).toHaveURL(mureupUrl);

  await figure.locator('[data-legend-zone="legs-ankle"]').click();
  await expect(page).toHaveURL(/region=legs-ankle/);
  await inspector.getByRole('link', { name: /Abrir detalhe das superfícies do pé/ }).click();
  await expect(page).toHaveURL(/\/atlas\?region=feet&zoom=1$/);
});

test('geometria de pernas e tornozelo tem sobreposição zero, âncoras válidas e simetria bilateral', async ({ page }) => {
  const probesFront: readonly GeometryProbe[] = [
    ['legs-hip', 130, 256],
    ['legs-thigh', 103, 292],
    ['legs-thigh', 157, 292],
    ['legs-knee', 101, 331],
    ['legs-knee', 159, 331],
    ['legs-shin', 100, 370],
    ['legs-shin', 160, 370],
    ['legs-ankle', 98, 407],
    ['legs-ankle', 162, 407],
  ];
  const probesBack: readonly GeometryProbe[] = [
    ['legs-hip', 130, 256],
    ['legs-thigh', 103, 292],
    ['legs-thigh', 157, 292],
    ['legs-knee-back', 101, 330],
    ['legs-knee-back', 159, 330],
    ['legs-calf', 100, 369],
    ['legs-calf', 160, 369],
    ['legs-ankle', 98, 407],
    ['legs-ankle', 162, 407],
  ];
  await assertBodyAreaSvgGeometry(page, 'legs', [['Vista anterior', probesFront], ['Vista posterior', probesBack]]);
});
