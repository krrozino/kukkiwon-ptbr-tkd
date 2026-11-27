import type { LibraryReference } from '../lib/library';
import cards from './balkisul-cards.json';
import { kukkiwonSparringReference, kukkiwonTerminologyReference } from './movement-sources';

export type BalkisulEntry = {
  slug: string;
  romanization: string;
  hangul: string;
  pronunciationPt: string | null;
  subtitlePt: string;
  kindLabel: 'Superfícies do pé' | 'Família de chutes (Chagi)';
  atlasZone?:
    | 'apchuk'
    | 'balbadak'
    | 'baldeung'
    | 'balkkeut'
    | 'balnal'
    | 'balnaldeung'
    | 'dwichuk'
    | 'dwikkumchi';
  acervoSlug?: string;
  summary: string;
  studyPoints: readonly string[];
  variants: readonly string[];
  references: readonly {
    field: 'hangul' | 'romanization' | 'context' | 'terminology';
    reference: LibraryReference;
  }[];
  relatedLibrarySlugs: readonly string[];
};

type FootAtlasZone = NonNullable<BalkisulEntry['atlasZone']>;
const footAtlasZones: readonly FootAtlasZone[] = [
  'apchuk', 'balbadak', 'baldeung', 'balkkeut', 'balnal', 'balnaldeung', 'dwichuk', 'dwikkumchi',
];
const chagiReference = kukkiwonSparringReference(1368, 'Chagi');

export const balkisulEntries: readonly BalkisulEntry[] = [
  ...cards.footSurfaces.map(({ locator, ...card }): BalkisulEntry => {
    const atlasZone = footAtlasZones.find((zone) => zone === card.slug);
    if (!atlasZone) throw new Error(`Zona do pé inválida: ${card.slug}`);
    const reference = kukkiwonTerminologyReference(locator);
    return {
      ...card,
      kindLabel: 'Superfícies do pé',
      atlasZone,
      acervoSlug: card.slug,
      references: [
        { field: 'hangul', reference },
        { field: 'romanization', reference },
      ],
    };
  }),
  ...cards.kicks.map(({ locator, acervoSlug, ...card }): BalkisulEntry => ({
    ...card,
    kindLabel: 'Família de chutes (Chagi)',
    acervoSlug: acervoSlug === null ? undefined : acervoSlug ?? card.slug,
    references: [
      { field: 'hangul', reference: kukkiwonTerminologyReference(locator) },
      { field: 'context', reference: chagiReference },
    ],
  })),
];
