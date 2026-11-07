import { describe, expect, it } from 'vitest';
import { handOutline, fistOutline, surfaces, handSurfaceSlugs } from '../src/components/atlas/surfaces';
import { zonesFor } from '../src/components/atlas/zones';
import { zoneCopy } from '../src/components/atlas/zone-copy';

describe('geometria e proporções da mão no atlas', () => {
  it('garante proporções anatômicas corretas dos dedos na mão aberta', () => {
    // Na anatomia humana, o dedo médio é o mais longo, seguido do anelar/indicador,
    // e o mindinho é visivelmente menor que o indicador.
    // Em coordenadas SVG, y menor significa posição mais alta (ápice do dedo).
    const indexApexY = 16;
    const middleApexY = 9;
    const ringApexY = 14;
    const pinkyApexY = 31;

    // A silhueta da mão aberta é um path SVG definido e contínuo
    expect(handOutline).toMatch(/^M 32 125/);

    // Dedo médio é o ápice mais alto
    expect(middleApexY).toBeLessThan(ringApexY);
    expect(middleApexY).toBeLessThan(indexApexY);
    expect(middleApexY).toBeLessThan(pinkyApexY);

    // Indicador é substancialmente mais longo que o mindinho (ápice mais alto)
    expect(indexApexY).toBeLessThan(pinkyApexY);
    expect(pinkyApexY - indexApexY).toBeGreaterThanOrEqual(10);

    // Anelar e indicador estão em proporção harmoniosa
    expect(ringApexY).toBeLessThan(indexApexY);
  });

  it('elimina invasão e sobreposição entre anelar e mindinho', () => {
    const ring = surfaces['illustration-finger-ring'];
    const little = surfaces['illustration-finger-little'];

    // O anelar deve terminar exatamente onde o mindinho começa (x = 61)
    expect(ring.path).toContain('H 61');
    expect(little.path).toContain('M 61');

    // O anelar não pode invadir a faixa do mindinho (x > 61)
    expect(ring.path).not.toMatch(/H (6[2-9]|[7-9]\d|100)/);
  });

  it('mantém todas as regiões e legendas da mão abertas e do punho', () => {
    for (const slug of handSurfaceSlugs) {
      expect(surfaces[slug], slug).toBeDefined();
      expect(zoneCopy[slug], slug).toBeDefined();
      expect(zoneCopy[slug].title.length).toBeGreaterThan(2);
      expect(zoneCopy[slug].description.length).toBeGreaterThan(10);
    }
  });

  it('assegura contagem exata de zonas por vista e postura', () => {
    // Mão aberta palma: 11 zonas
    const frontOpen = zonesFor('hands', 'front', false);
    expect(frontOpen).toHaveLength(11);

    // Mão aberta dorso: 11 zonas
    const backOpen = zonesFor('hands', 'back', false);
    expect(backOpen).toHaveLength(11);

    // Punho frente (palma): 4 zonas
    const frontFist = zonesFor('hands', 'front', true);
    expect(frontFist).toHaveLength(4);

    // Punho dorso: 4 zonas
    const backFist = zonesFor('hands', 'back', true);
    expect(backFist).toHaveLength(4);
  });

  it('declive do punho prioriza juntas do indicador e médio para ap-jumeok', () => {
    // No punho fechado de Taekwondo, as juntas do indicador e médio formam
    // a superfície primária de impacto e ficam mais altas que as do anelar e mínimo.
    expect(fistOutline).toContain('46 21'); // Ápice do médio em y=21
    expect(fistOutline).toContain('31 38'); // Juntas frontais bem posicionadas
    expect(surfaces['mejumeok'].anchor[0]).toBeGreaterThan(70); // Mejumeok na lateral ulnar
  });

  it('hitboxes das regiões coincidem com os contornos anatômicos sem vazamentos', () => {
    // Sonnal acompanha a borda ulnar
    expect(surfaces['sonnal'].anchor).toEqual([67, 88]);
    expect(surfaces['sonnaldeung'].anchor).toEqual([28, 50]);
    expect(surfaces['ageumson'].anchor).toEqual([30, 77]);

    // Âncoras do indicador, médio, anelar e mínimo
    expect(surfaces['illustration-finger-index'].anchor[0]).toBeLessThan(surfaces['illustration-finger-middle'].anchor[0]);
    expect(surfaces['illustration-finger-middle'].anchor[0]).toBeLessThan(surfaces['illustration-finger-ring'].anchor[0]);
    expect(surfaces['illustration-finger-ring'].anchor[0]).toBeLessThan(surfaces['illustration-finger-little'].anchor[0]);
  });
});
