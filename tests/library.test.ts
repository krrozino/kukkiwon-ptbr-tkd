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

  it('todas as categorias possuem itens catalogados com fontes documentais', () => {
    for (const catId of REQUIRED_CATEGORIES) {
      const items = getItemsByCategory(catId);
      expect(items.length, `Categoria ${catId} deve conter itens catalogados`).toBeGreaterThan(0);
      for (const item of items) {
        expect(item.slug).toBeTruthy();
        expect(item.name).toBeTruthy();
        expect(item.description).toBeTruthy();
        expect(item.sources.length, `Item ${item.slug} deve ter fonte`).toBeGreaterThan(0);
      }
    }
  });

  it('Matchuo Kyorugi contém sequências numeradas de Sebon (1 a 5 e até 10)', () => {
    const sebonItems = LIBRARY_ITEMS.filter(
      i => i.categoryId === 'matchuo-kyorugi' && i.subcategoryId === 'sebon'
    );
    expect(sebonItems.length).toBeGreaterThanOrEqual(5);

    const sebon1 = getItemBySlug('sebon-kyorugi-1');
    expect(sebon1).toBeDefined();
    expect(sebon1?.sequenceNumber).toBe(1);
    expect(sebon1?.steps).toBeDefined();
    expect(sebon1?.steps?.length).toBeGreaterThanOrEqual(3);

    const sebon5 = getItemBySlug('sebon-kyorugi-5');
    expect(sebon5).toBeDefined();
    expect(sebon5?.sequenceNumber).toBe(5);

    const sebon6to10 = getItemBySlug('sebon-kyorugi-6-10');
    expect(sebon6to10).toBeDefined();
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

  it('Palgwae é mantido em seção própria separada dos Taegeuk', () => {
    const palgwaeCat = getCategoryById('palgwae');
    expect(palgwaeCat).toBeDefined();
    const items = getItemsByCategory('palgwae');
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].slug).toContain('palgwae');
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

    const searchSebon = searchLibrary('Sebon', 'matchuo-kyorugi');
    expect(searchSebon.length).toBeGreaterThanOrEqual(5);
  });
});
