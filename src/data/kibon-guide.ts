import type { LibraryReference } from '../lib/library';
import cards from './kibon-cards.json';
import { kukkiwonSparringReference, kukkiwonTerminologyReference } from './movement-sources';

export type KibonEntry = {
  slug: string;
  romanization: string;
  hangul: string | null;
  pronunciationPt: string | null;
  subtitlePt: string;
  kindLabel:
    | 'Bases (Seogi)'
    | 'Posturas de preparação (Junbi-jase)'
    | 'Defesas (Makgi)'
    | 'Socos e dedos (Jireugi / Jjireugi)'
    | 'Golpes (Chigi)'
    | 'Alturas e direções';
  atlasRegion: 'legs' | 'feet' | 'arms' | 'hands' | 'torso' | 'head';
  atlasLabel: string;
  summary: string;
  studyPoints: readonly string[];
  variants: readonly string[];
  acervoSlug?: string;
  libraryArea?: 'sonkisul';
  moduleHref?: string;
  moduleLabel?: string;
  references: readonly {
    field: 'hangul' | 'romanization' | 'context' | 'terminology';
    reference: LibraryReference;
  }[];
  relatedLibrarySlugs: readonly string[];
};

const families: Record<keyof typeof cards, KibonEntry['kindLabel']> = {
  stances: 'Bases (Seogi)',
  readyPostures: 'Posturas de preparação (Junbi-jase)',
  blocks: 'Defesas (Makgi)',
  punchesAndThrusts: 'Socos e dedos (Jireugi / Jjireugi)',
  strikes: 'Golpes (Chigi)',
  levelsAndDirections: 'Alturas e direções',
};
const atlasRegions: readonly KibonEntry['atlasRegion'][] = ['legs', 'feet', 'arms', 'hands', 'torso', 'head'];
const sparringReferences: Partial<Record<number, LibraryReference>> = {
  1365: kukkiwonSparringReference(1365, 'Makgi'),
  1366: kukkiwonSparringReference(1366, 'Jireugi'),
  1367: kukkiwonSparringReference(1367, 'Chigi'),
};
type EvidenceField = KibonEntry['references'][number]['field'];
type Card = Omit<KibonEntry, 'kindLabel' | 'atlasRegion' | 'references' | 'acervoSlug' | 'libraryArea'> & {
  acervoSlug?: string | null;
  libraryArea?: string;
  atlasRegion: string;
  evidence: Partial<Record<EvidenceField, string | number>>;
};

function toKibonEntry({ atlasRegion, acervoSlug, libraryArea, evidence, ...card }: Card, kindLabel: KibonEntry['kindLabel']): KibonEntry {
  const region = atlasRegions.find((candidate) => candidate === atlasRegion);
  if (!region) throw new Error(`Região inválida em ${card.slug}: ${atlasRegion}`);
  const references = (Object.entries(evidence) as [EvidenceField, string | number][]).map(([field, locator]) => {
    const reference = typeof locator === 'string' ? kukkiwonTerminologyReference(locator) : sparringReferences[locator];
    if (!reference) throw new Error(`Fonte inválida em ${card.slug}: ${locator}`);
    return { field, reference };
  });
  return {
    ...card,
    kindLabel,
    atlasRegion: region,
    ...(libraryArea === 'sonkisul' ? { libraryArea } : {}),
    ...(kindLabel !== 'Alturas e direções' && acervoSlug !== null ? { acervoSlug: acervoSlug ?? card.slug } : {}),
    references,
  };
}

export const kibonEntries: readonly KibonEntry[] = (Object.keys(families) as (keyof typeof cards)[]).flatMap(
  (family) => cards[family].map((card) => toKibonEntry(card, families[family])),
);
