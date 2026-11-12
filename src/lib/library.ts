import publicLibraryItems from '../data/library-public-items.json' with { type: 'json' };
import categoryDefinitions from '../data/library-categories.json' with { type: 'json' };
import { handTerms, getHandRegionForTerm } from './public-hand';
/**
 * Biblioteca Geral do Taekwondo — Kukkiwon PT-BR
 * Organização enciclopédica do conhecimento em 7 grandes áreas:
 * 1. Poomsae (Formas oficiais)
 * 2. Matchuo Kyorugi (Luta combinada)
 * 3. Palgwae (Formas históricas)
 * 4. Iron (Teoria, filosofia e história)
 * 5. Kibon Dongjak (Fundamentos)
 * 6. Balkisul (Técnicas de perna e chutes)
 * 7. Sonkisul (Técnicas de mão e punho)
 */

export type LibraryCategoryId =
  | 'poomsae'
  | 'matchuo-kyorugi'
  | 'palgwae'
  | 'iron'
  | 'kibon-dongjak'
  | 'balkisul'
  | 'sonkisul';

export interface LibrarySubcategory {
  id: string;
  name: string;
  description: string;
}

export interface LibrarySource {
  institution: string;
  title: string;
  editionOrYear?: string;
  locator?: string;
  url?: string;
}

export interface LibraryStep {
  stepNumber: number;
  instruction: string;
  technique?: string;
  stance?: string;
  target?: string;
}

export interface LibraryItem {
  slug: string;
  categoryId: LibraryCategoryId;
  subcategoryId: string;
  name: string;
  hangul?: string;
  romanization?: string;
  pronunciation_pt?: string;
  literalMeaning?: string;
  technicalMeaning?: string;
  description: string;
  execution?: string;
  variants?: string[];
  bodyRegions?: string[]; // Slugs de regiões anatômicas vinculadas ao Atlas
  stances?: string[];    // Bases relacionadas
  sequenceNumber?: number; // Ex: 1 a 10 para Sebon 1..10
  steps?: LibraryStep[];
  sources: LibrarySource[];
  mediaPrepared?: {
    hasVideoPlaceholder: boolean;
    hasPhotoPlaceholder: boolean;
    recommendedView?: string;
  };
}

export interface LibraryCategory {
  id: LibraryCategoryId;
  name: string;
  koreanName: string;
  koreanHangul: string;
  summary: string;
  description: string;
  subcategories: LibrarySubcategory[];
}

// Taxonomy is content, not duplicated logic; edit the structured file to add areas.
export const LIBRARY_CATEGORIES: LibraryCategory[] = categoryDefinitions as LibraryCategory[];

// Only visitor-safe entries are imported into the public library.
// Research-only sequences and historical candidates remain in content/research.
const handLibraryItems: LibraryItem[] = handTerms.map(term => {
  const region = getHandRegionForTerm(term.slug);
  const sources: LibrarySource[] = [];
  const seen = new Set<string>();
  for (const claim of term.evidence) {
    const ref = claim.reference;
    if (!ref?.url || !/^https:\/\//i.test(ref.url)) continue;
    const key = ref.url + '|' + ref.locator;
    if (seen.has(key)) continue;
    seen.add(key);
    sources.push({ institution: ref.institution, title: ref.title,
      editionOrYear: ref.edition || undefined,
      locator: ref.locator || undefined, url: ref.url });
  }
  return {
    slug: term.slug,
    categoryId: 'sonkisul',
    subcategoryId: 'superficies-configuracoes',
    name: term.name,
    hangul: term.hangul || undefined,
    romanization: term.romanization || undefined,
    pronunciation_pt: term.pronunciation || undefined,
    description: term.description || term.meanings.map(m => m.value).filter(Boolean).join(' · ') || term.name,
    variants: term.variants.map(v => v.value),
    bodyRegions: region ? [region.slug] : [],
    sources,
  };
});
export const LIBRARY_ITEMS: LibraryItem[] = [...(publicLibraryItems as LibraryItem[]), ...handLibraryItems];

export function getCategoryById(id: string): LibraryCategory | undefined {
  return LIBRARY_CATEGORIES.find(c => c.id === id);
}

export function getItemsByCategory(categoryId: LibraryCategoryId): LibraryItem[] {
  return LIBRARY_ITEMS.filter(item => item.categoryId === categoryId);
}

export function getItemBySlug(slug: string): LibraryItem | undefined {
  return LIBRARY_ITEMS.find(item => item.slug === slug);
}

export function searchLibrary(query: string, categoryId?: LibraryCategoryId): LibraryItem[] {
  const q = query.trim().toLowerCase();
  return LIBRARY_ITEMS.filter(item => {
    if (categoryId && item.categoryId !== categoryId) return false;
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      (item.hangul && item.hangul.includes(q)) ||
      (item.romanization && item.romanization.toLowerCase().includes(q)) ||
      (item.pronunciation_pt && item.pronunciation_pt.toLowerCase().includes(q)) ||
      item.description.toLowerCase().includes(q) ||
      (item.literalMeaning && item.literalMeaning.toLowerCase().includes(q)) ||
      (item.variants && item.variants.some(v => v.toLowerCase().includes(q)))
    );
  });
}
