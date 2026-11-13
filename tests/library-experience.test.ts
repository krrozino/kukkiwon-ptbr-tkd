import { describe, expect, it } from 'vitest';
import { getLibraryItem, libraryItems, searchLibrary, libraryItemHref, atlasHref } from '../src/lib/library';

describe('biblioteca reutiliza a identidade do Atlas', () => {
  it('encontra o mesmo termo por acento, Hangul composto/decomposto e pronúncia', () => {
    for (const query of ['BORDA EXTERNA', '손날', '손날'.normalize('NFD'), 'sôn-nal']) {
      expect(searchLibrary(query).some(item => item.slug === 'sonnal')).toBe(true);
    }
  });
  it('combina busca com categoria e relação geométrica sem inventar hotspots', () => {
    expect(searchLibrary('손날', 'balkisul')).toEqual([]);
    expect(searchLibrary('Sonnal', 'sonkisul').map(item => item.slug)).toContain('sonnal');
    expect(atlasHref('sonnal')).toBe('/atlas?region=sonnal&zoom=1');
    expect(atlasHref('modumsonkkeut')).toBeNull();
    expect(atlasHref('desconhecido')).toBeNull();
  });
  it('gera URLs estáveis e recusa termos desconhecidos', () => {
    expect(libraryItemHref('sonnal')).toBe('/biblioteca/sonkisul/sonnal');
    expect(libraryItemHref('desconhecido')).toBeNull();
    expect(getLibraryItem('sonnal')?.term.hangul).toBe('손날');
    expect(new Set(libraryItems.map(item => item.slug)).size).toBe(libraryItems.length);
  });
});
