import { describe, expect, it } from 'vitest';
import {
  getItemsReferencingSlug,
  getLibraryItem,
  getLibraryKinds,
  libraryCategories,
  libraryItems,
  searchLibrary,
  libraryItemHref,
  atlasHref,
} from '../src/lib/library';
import { allPoomsaeGuides, danForms, getPoomsaeGuide, taegeukForms } from '../src/data/poomsae-guide';
import { fingerAnatomyGuides, multiFingerCareNotes } from '../src/data/sonkisul-finger-guide';
import { findSchoolGradesForPoomsae } from '../src/components/poomsae/PoomsaeVisuals';

describe('biblioteca reutiliza a identidade do Atlas e integra Poomsae com fontes', () => {
  it('encontra o mesmo termo por acento, Hangul composto/decomposto e pronúncia', () => {
    for (const query of ['BORDA EXTERNA', '손날', '손날'.normalize('NFD'), 'sôn-nal']) {
      expect(searchLibrary(query).some((item) => item.slug === 'sonnal')).toBe(true);
    }
  });

  it('combina busca com categoria, subdivisão, ordenação e relação geométrica sem inventar hotspots', () => {
    expect(searchLibrary('손날', 'balkisul')).toEqual([]);
    expect(searchLibrary('palma', 'balkisul')).toEqual([]);
    expect(searchLibrary('Sonnal', 'sonkisul').map((item) => item.slug)).toContain('sonnal');
    expect(searchLibrary('Lago sereno', 'poomsae').map((item) => item.slug)).toEqual(['taegeuk-2-jang']);
    expect(searchLibrary('Keon', 'poomsae').map((item) => item.slug)).toContain('taegeuk-1-jang');
    expect(searchLibrary('', 'poomsae', false, 'Forma Taegeuk')).toHaveLength(8);
    expect(searchLibrary('', 'poomsae', false, 'Forma Yudanja (Dan)')).toHaveLength(9);
    const az = searchLibrary('', 'poomsae', false, undefined, 'az');
    expect(az[0]?.slug).toBe('chonkwon');
    expect(getLibraryKinds('poomsae')).toEqual(['Forma Taegeuk', 'Forma Yudanja (Dan)']);
    expect(atlasHref('sonnal')).toBe('/atlas?region=sonnal&zoom=1');
    expect(atlasHref('apchuk')).toBe('/atlas?region=apchuk&zoom=1');
    expect(atlasHref('dwikkumchi')).toBe('/atlas?region=dwikkumchi&zoom=1');
    expect(atlasHref('ap-chagi')).toBeNull();
    expect(atlasHref('modumsonkkeut')).toBeNull();
    expect(atlasHref('taegeuk-1-jang')).toBeNull();
    expect(atlasHref('desconhecido')).toBeNull();
  });

  it('gera URLs estáveis e recusa termos desconhecidos', () => {
    expect(libraryItemHref('sonnal')).toBe('/biblioteca/sonkisul/sonnal');
    expect(libraryItemHref('apchuk')).toBe('/biblioteca/balkisul/apchuk');
    expect(libraryItemHref('ap-chagi')).toBe('/biblioteca/balkisul/ap-chagi');
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

  it('separa Palgwae da coleção Taegeuk e organiza Matchuo Kyorugi sem passos inventados', () => {
    const palgwae = searchLibrary('', 'palgwae');
    expect(palgwae).toHaveLength(9);
    expect(palgwae.every((item) => item.term.hangul === null)).toBe(true);
    expect(libraryItemHref('palgwae-1-jang')).toBe('/biblioteca/palgwae/palgwae-1-jang');
    expect(searchLibrary('Palgwae', 'poomsae')).toEqual([]);

    const matchuo = searchLibrary('', 'matchuo-kyorugi');
    expect(matchuo).toHaveLength(6);
    expect(searchLibrary('Sebon', 'matchuo-kyorugi').map((item) => item.slug)).toContain('sebon-kyorugi');
    expect(searchLibrary('Anjoa', 'matchuo-kyorugi').map((item) => item.slug)).toContain('anjoa-kyorugi');
    expect(libraryItemHref('sebon-kyorugi')).toBe('/biblioteca/matchuo-kyorugi/sebon-kyorugi');
  });

  it('organiza Iron em três níveis progressivos e Kibon Dongjak em famílias com Hangul verificado', () => {
    expect(searchLibrary('', 'iron')).toHaveLength(12);
    expect(searchLibrary('', 'iron', false, 'Iron · Básico')).toHaveLength(4);
    expect(searchLibrary('', 'iron', false, 'Iron · Intermediário')).toHaveLength(4);
    expect(searchLibrary('', 'iron', false, 'Iron · Avançado')).toHaveLength(4);

    const kibon = searchLibrary('', 'kibon-dongjak');
    expect(kibon).toHaveLength(18);
    expect(searchLibrary('앞굽이', 'kibon-dongjak').map((item) => item.slug)).toEqual(['apgubi']);
    expect(searchLibrary('Arae-makgi', 'kibon-dongjak').map((item) => item.slug)).toContain('naeryeo-makgi');
    expect(getLibraryItem('apgubi')?.acervoLink?.href).toBe('/acervo#apgubi');
  });

  it('popula as sete áreas da biblioteca com Balkisul (pés e chutes), dedos anatômicos e conexões bidirecionais', () => {
    for (const cat of libraryCategories) {
      expect(searchLibrary('', cat.id).length, cat.id).toBeGreaterThan(0);
    }
    expect(libraryItems).toHaveLength(105);
    expect(searchLibrary('', 'balkisul', false, 'Superfícies do pé')).toHaveLength(8);
    expect(searchLibrary('', 'balkisul', false, 'Família de chutes (Chagi)')).toHaveLength(12);
    expect(searchLibrary('', 'balkisul', true)).toHaveLength(8);

    const usingApchuk = getItemsReferencingSlug('apchuk').map((item) => item.slug);
    expect(usingApchuk).toContain('ap-chagi');
    expect(usingApchuk).toContain('dollyeo-chagi');

    const usingSonnal = getItemsReferencingSlug('sonnal').map((item) => item.slug);
    expect(usingSonnal).toContain('sonnal-makgi-familia');
    expect(usingSonnal).toContain('sonnal-an-chigi');

    expect(Object.keys(fingerAnatomyGuides)).toHaveLength(5);
    for (const guide of Object.values(fingerAnatomyGuides)) {
      for (const rel of guide.relatedConfigSlugs) {
        expect(getLibraryItem(rel.slug), rel.slug).toBeDefined();
      }
    }
    expect(multiFingerCareNotes.gawisonkkeut).toMatch(/pendentes de confirmação documental/);
  });
});
