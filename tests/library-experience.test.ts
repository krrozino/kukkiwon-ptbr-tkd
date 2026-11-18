import { describe, expect, it } from 'vitest';
import { getLibraryItem, getLibraryKinds, libraryItems, searchLibrary, libraryItemHref, atlasHref } from '../src/lib/library';
import { allPoomsaeGuides, danForms, getPoomsaeGuide, taegeukForms } from '../src/data/poomsae-guide';
import { findSchoolGradesForPoomsae } from '../src/components/poomsae/PoomsaeVisuals';

describe('biblioteca reutiliza a identidade do Atlas e integra Poomsae com fontes', () => {
  it('encontra o mesmo termo por acento, Hangul composto/decomposto e pronúncia', () => {
    for (const query of ['BORDA EXTERNA', '손날', '손날'.normalize('NFD'), 'sôn-nal']) {
      expect(searchLibrary(query).some((item) => item.slug === 'sonnal')).toBe(true);
    }
  });

  it('combina busca com categoria, subdivisão, ordenação e relação geométrica sem inventar hotspots', () => {
    expect(searchLibrary('손날', 'balkisul')).toEqual([]);
    expect(searchLibrary('Sonnal', 'sonkisul').map((item) => item.slug)).toContain('sonnal');
    expect(searchLibrary('Lago sereno', 'poomsae').map((item) => item.slug)).toEqual(['taegeuk-2-jang']);
    expect(searchLibrary('Keon', 'poomsae').map((item) => item.slug)).toContain('taegeuk-1-jang');
    expect(searchLibrary('', 'poomsae', false, 'Forma Taegeuk')).toHaveLength(8);
    expect(searchLibrary('', 'poomsae', false, 'Forma Yudanja (Dan)')).toHaveLength(9);
    const az = searchLibrary('', 'poomsae', false, undefined, 'az');
    expect(az[0]?.slug).toBe('chonkwon');
    expect(getLibraryKinds('poomsae')).toEqual(['Forma Taegeuk', 'Forma Yudanja (Dan)']);
    expect(atlasHref('sonnal')).toBe('/atlas?region=sonnal&zoom=1');
    expect(atlasHref('modumsonkkeut')).toBeNull();
    expect(atlasHref('taegeuk-1-jang')).toBeNull();
    expect(atlasHref('desconhecido')).toBeNull();
  });

  it('gera URLs estáveis e recusa termos desconhecidos', () => {
    expect(libraryItemHref('sonnal')).toBe('/biblioteca/sonkisul/sonnal');
    expect(libraryItemHref('taegeuk-5-jang')).toBe('/biblioteca/poomsae/taegeuk-5-jang');
    expect(libraryItemHref('koryo')).toBe('/biblioteca/poomsae/koryo');
    expect(libraryItemHref('desconhecido')).toBeNull();
    expect(getLibraryItem('sonnal')?.term.hangul).toBe('손날');
    expect(new Set(libraryItems.map((item) => item.slug)).size).toBe(libraryItems.length);
  });

  it('documenta os oito Taegeuk e nove formas Dan apenas com dados verificados na Kukkiwon', () => {
    expect(taegeukForms).toHaveLength(8);
    expect(danForms).toHaveLength(9);
    expect(allPoomsaeGuides).toHaveLength(17);
    expect(new Set(allPoomsaeGuides.map((g) => g.boardNo)).size).toBe(17);
    const keumgang = getPoomsaeGuide('keumgang');
    const koryo = getPoomsaeGuide('koryo');
    expect(keumgang?.kind === 'dan' ? keumgang.poomsaeLine?.character : null).toBe('山');
    expect(koryo?.kind === 'dan' ? koryo.poomsaeLine : undefined).toBeNull();
  });

  it('associa a forma às graduações configuradas no currículo local sem impor regra universal', () => {
    const sample = JSON.stringify({
      title: 'Currículo Escola Sul',
      description: 'Currículo próprio',
      grades: [
        {
          id: 'amarela',
          name: 'Faixa amarela (8º Gup)',
          requirements: [
            { id: 'r1', title: 'Taegeuk 1 Jang', kind: 'poomsae', termSlug: 'taegeuk-1-jang', notes: '', mediaId: '' },
          ],
        },
      ],
    });
    expect(findSchoolGradesForPoomsae(sample, 'taegeuk-1-jang', 'Taegeuk 1 Jang')).toEqual(['Faixa amarela (8º Gup)']);
    expect(findSchoolGradesForPoomsae(sample, 'taegeuk-2-jang', 'Taegeuk 2 Jang')).toEqual([]);
    expect(findSchoolGradesForPoomsae(null, 'taegeuk-1-jang', 'Taegeuk 1 Jang')).toEqual([]);
  });
});
