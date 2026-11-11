import { describe, it, expect } from 'vitest';
import {
  LIBRARY_CATEGORIES,
  LIBRARY_ITEMS,
  getCategoryById,
  getItemsByCategory,
  getItemBySlug,
  searchLibrary,
  type LibraryCategoryId,
} from '../src/lib/library';

describe('Issue #65 — Fundação da Biblioteca Geral (7 Categorias)', () => {
  const REQUIRED_CATEGORIES: LibraryCategoryId[] = [
    'poomsae',
    'matchuo-kyorugi',
    'palgwae',
    'iron',
    'kibon-dongjak',
    'balkisul',
    'sonkisul',
  ];

  it('possui exatamente as sete grandes categorias fundamentadas', () => {
    const ids = LIBRARY_CATEGORIES.map(c => c.id);
    for (const req of REQUIRED_CATEGORIES) {
      expect(ids).toContain(req);
    }
    expect(LIBRARY_CATEGORIES).toHaveLength(7);
  });

  it('cada categoria possui identificador, nome em português, Hangul e subcategorias', () => {
    for (const cat of LIBRARY_CATEGORIES) {
      expect(cat.id).toBeTruthy();
      expect(cat.name).toBeTruthy();
      expect(cat.koreanHangul).toBeTruthy();
      expect(cat.summary).toBeTruthy();
      expect(cat.subcategories.length).toBeGreaterThan(0);
    }
  });

  it('itens públicos presentes têm identidade e fonte; categorias podem aguardar conteúdo próprio', () => {
    for (const catId of REQUIRED_CATEGORIES) {
      const items = getItemsByCategory(catId);
      for (const item of items) {
        expect(item.slug).toBeTruthy();
        expect(item.name).toBeTruthy();
        expect(item.description).toBeTruthy();
        expect(item.sources.length, `Item ${item.slug} deve ter fonte`).toBeGreaterThan(0);
      }
    }
  });

  it('não expõe sequências locais Sebon com passos sem fonte específica de execução', () => {
    expect(getCategoryById('matchuo-kyorugi')).toBeDefined();
    expect(getItemsByCategory('matchuo-kyorugi')).toEqual([]);
    expect(getItemBySlug('sebon-kyorugi-1')).toBeUndefined();
    expect(LIBRARY_ITEMS.some(i => i.categoryId === 'matchuo-kyorugi' && i.steps?.length)).toBe(false);
  });

  it('Poomsae contém Taegeuk documentados e formas superiores', () => {
    const taegeuk1 = getItemBySlug('taegeuk-il-jang');
    expect(taegeuk1).toBeDefined();
    expect(taegeuk1?.hangul).toBe('태극 1장');
    expect(taegeuk1?.stances).toContain('ap-kubi');

    const koryo = getItemBySlug('poomsae-koryo');
    expect(koryo).toBeDefined();
    expect(koryo?.hangul).toBe('고려');
  });

  it('mantém Palgwae como categoria própria sem declarar contagens de movimentos não comprovadas', () => {
    expect(getCategoryById('palgwae')).toBeDefined();
    expect(getItemsByCategory('palgwae')).toEqual([]);
    expect(getItemBySlug('palgwae-il-jang')).toBeUndefined();
  });

  it('Iron aborda teoria, bases, chutes, princípios e Hwarang-do', () => {
    const sogi = getItemBySlug('o-que-e-sogi');
    expect(sogi).toBeDefined();
    expect(sogi?.hangul).toBe('서기');

    const chagi = getItemBySlug('o-que-e-chagi');
    expect(chagi).toBeDefined();
    expect(chagi?.hangul).toBe('차기');

    const hwarang = getItemBySlug('hwarang-do-historia');
    expect(hwarang).toBeDefined();

    const principios = getItemBySlug('principios-juramento');
    expect(principios).toBeDefined();
  });

  it('Balkisul e Sonkisul possuem conexões com as superfícies anatômicas do Atlas', () => {
    const apChagi = getItemBySlug('ap-chagi');
    expect(apChagi?.bodyRegions).toContain('apchook');

    const dollyoChagi = getItemBySlug('dollyo-chagi');
    expect(dollyoChagi?.bodyRegions).toContain('baldeung');

    const sonnalChigi = getItemBySlug('sonnal-chigi');
    expect(sonnalChigi?.bodyRegions).toContain('sonnal');

    const batangson = getItemBySlug('batangson-chigi');
    expect(batangson?.bodyRegions).toContain('batangson');
  });

  it('a busca da biblioteca localiza por português, Hangul e romanização', () => {
    const searchHangul = searchLibrary('태극');
    expect(searchHangul.length).toBeGreaterThan(0);

    const searchRoman = searchLibrary('Dollyo');
    expect(searchRoman.length).toBeGreaterThan(0);

    const searchPT = searchLibrary('frontal');
    expect(searchPT.length).toBeGreaterThan(0);

    expect(searchLibrary('Sebon', 'matchuo-kyorugi')).toEqual([]);
  });
});
