import { expect, test } from '@playwright/test';
import { assertBodyAreaSvgGeometry, assertCuratedBodyAreaInThemes, type CuratedZoneCheck, type GeometryProbe } from './atlas-region-helpers';

const frontZones: readonly CuratedZoneCheck[] = [
  { id: 'torso-shoulders', urlSlug: 'torso-shoulders', name: 'Ombros', hangul: [] },
  { id: 'torso-chest', urlSlug: 'torso-chest', name: 'Peito', hangul: ['몸통', '가슴'] },
  { id: 'torso-solar-plexus', urlSlug: 'torso-solar-plexus', name: 'Plexo solar', hangul: ['명치'] },
  { id: 'torso-abdomen', urlSlug: 'torso-abdomen', name: 'Abdômen', hangul: ['아래'] },
  { id: 'torso-flanks', urlSlug: 'torso-flanks', name: 'Laterais do tronco', hangul: [] },
];

const backZones: readonly CuratedZoneCheck[] = [
  { id: 'torso-shoulders', urlSlug: 'torso-shoulders', name: 'Ombros', hangul: [] },
  { id: 'torso-flanks', urlSlug: 'torso-flanks', name: 'Laterais do tronco', hangul: [] },
  { id: 'torso-back', urlSlug: 'torso-back', name: 'Costas', hangul: ['등'] },
  { id: 'torso-lumbar', urlSlug: 'torso-lumbar', name: 'Lombar e cintura', hangul: ['허리'] },
];

for (const theme of ['light', 'dark'] as const) {
  test('tronco seleciona todas as regiões em frente e costas no tema ' + theme, async ({ page, isMobile }) => {
    await assertCuratedBodyAreaInThemes(page, isMobile, {
      area: 'torso',
      theme,
      views: [['Vista anterior', frontZones], ['Vista posterior', backZones]],
      async onZoneSelected(zone, inspector) {
        await expect(inspector).toContainText('Região anatômica ilustrativa');
        if (zone.id === 'torso-chest') {
          await expect(inspector).toContainText('Momtong');
          await expect(inspector).toContainText('Gaseum');
        }
        if (zone.id === 'torso-solar-plexus') {
          await expect(inspector).toContainText('Myeongchi');
        }
        if (zone.id !== 'torso-flanks') {
          for (const summary of await inspector.locator('summary').all()) {
            await summary.click();
          }
          await expect(inspector.locator('a[href^="https://research.kukkiwon.or.kr/"]').first()).toBeVisible();
        }
      },
    });
  });
}

test('tronco persiste seleção na URL, avisa vista oposta e retorna da Biblioteca', async ({ page }) => {
  await page.route('**/rest/v1/**', route => route.abort());
  await page.goto('/atlas?region=torso-lumbar&zoom=1');
  const figure = page.getByRole('region', { name: 'Explorar o mapa corporal' });
  const inspector = page.getByRole('region', { name: 'Detalhes da região selecionada' });
  await expect(figure.getByRole('button', { name: 'Vista posterior', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(figure.locator('[data-region="torso-lumbar"]')).toHaveAttribute('aria-pressed', 'true');
  await figure.getByRole('button', { name: 'Vista anterior', exact: true }).click();
  await expect(inspector.getByRole('status')).toHaveText('Região selecionada na vista posterior.');
  await page.reload();
  await expect(inspector.getByRole('status')).toHaveText('Região selecionada na vista posterior.');

  await figure.locator('[data-legend-zone="torso-chest"]').click();
  const chestUrl = page.url();
  await inspector.getByRole('link', { name: /Estudar defesa média/ }).click();
  await expect(page).toHaveURL(/\/biblioteca\/kibon-dongjak\/an-makgi\/?$/);
  await page.goBack();
  await expect(page).toHaveURL(chestUrl);
  await expect(figure.locator('[data-region="torso-chest"]')).toHaveAttribute('aria-pressed', 'true');
});

test('geometria do tronco tem sobreposição zero, âncoras válidas e limites simétricos', async ({ page }) => {
  const probesFront: readonly GeometryProbe[] = [
    ['torso-shoulders', 106, 123],
    ['torso-shoulders', 154, 123],
    ['torso-chest', 130, 150],
    ['torso-solar-plexus', 130, 178],
    ['torso-abdomen', 130, 212],
    ['torso-flanks', 98, 184],
    ['torso-flanks', 162, 184],
  ];
  const probesBack: readonly GeometryProbe[] = [
    ['torso-shoulders', 130, 124],
    ['torso-flanks', 98, 184],
    ['torso-flanks', 162, 184],
    ['torso-back', 130, 160],
    ['torso-lumbar', 130, 210],
  ];
  await assertBodyAreaSvgGeometry(page, 'torso', [['Vista anterior', probesFront], ['Vista posterior', probesBack]]);
});
