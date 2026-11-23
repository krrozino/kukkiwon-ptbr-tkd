import { bodyZones } from '../components/atlas/zones';
import { zoneCopy } from '../components/atlas/zone-copy';
import { kukkiwonTerminologyReference } from '../data/movement-sources';
import type { BodyRegion } from './catalog-api';
import type { LibraryReference } from './library';

type ArmTerm = {
  romanization: string;
  hangul: string;
  meaningPt: string;
  reference: LibraryReference;
  mapNote?: string;
} & (
  | { kind: 'surface'; example: { librarySlug: string; reference: LibraryReference } }
  | { kind: 'context'; example?: never }
);

const appendix = 'Appendix > Applicable Parts of the Body';
const forearmNote = 'A marca colorida localiza a borda no desenho esquemático.';
export const armDocumentCheckedOn = '2026-11-23';

// A Biblioteca possui fichas de técnicas. O localizador do exemplo vincula cada
// técnica ao termo desta região sem transformar a superfície em uma técnica.
const armTerms: Record<string, ArmTerm | undefined> = {
  palgup: {
    kind: 'surface',
    romanization: 'Palgup',
    hangul: '팔굽',
    meaningPt: 'Parte externa da articulação entre o braço e o antebraço.',
    reference: kukkiwonTerminologyReference(`${appendix} > Palgup`),
    mapNote: 'O recorte localiza o cotovelo no desenho esquemático.',
    example: {
      librarySlug: 'palgup-mureup-chigi',
      reference: kukkiwonTerminologyReference('§2 Chigi > Dollyeo-chigi > Palgup-dollyeo-chigi'),
    },
  },
  anpalmok: {
    kind: 'surface',
    romanization: 'Anpalmok',
    hangul: '안팔목',
    meaningPt: 'Borda interna da região do punho.',
    reference: kukkiwonTerminologyReference(`${appendix} > Anpalmok`),
    mapNote: forearmNote,
    example: {
      librarySlug: 'bakkat-makgi',
      reference: kukkiwonTerminologyReference('§10 Makgi > Bakkat-makgi > Anpalmok-bakkat-makgi'),
    },
  },
  bakkatpalmok: {
    kind: 'surface',
    romanization: 'Bakkatpalmok',
    hangul: '바깥팔목',
    meaningPt: 'Borda externa da região do punho.',
    reference: kukkiwonTerminologyReference(`${appendix} > Bakkatpalmok`),
    mapNote: forearmNote,
    example: {
      librarySlug: 'naeryeo-makgi',
      reference: kukkiwonTerminologyReference('§10 Makgi > Naeryeo-makgi > Bakkatpalmok-naeryeo-makgi'),
    },
  },
  'arms-wrist': {
    kind: 'context',
    romanization: 'Palmok',
    hangul: '팔목',
    meaningPt: 'Região ao redor da articulação, descrita no manual como uma faixa de quatro dedos a partir da base da mão.',
    reference: kukkiwonTerminologyReference(`${appendix} > Palmok`),
  },
};

export const armAtlasRegions: BodyRegion[] = bodyZones
  .filter(zone => zone.area === 'arms')
  .map(zone => ({
    id: zone.id,
    slug: zone.regionSlug ?? zone.id,
    name_pt: zoneCopy[zone.id].title,
    region_group: 'arms',
    atlas_area: 'arms',
    detail_view: zone.view,
    detail_x: null,
    detail_y: null,
  }));

export function getArmAtlasRegion(slug: string) {
  return armAtlasRegions.find(region => region.slug === slug || region.id === slug);
}

export function getArmTerm(slug: string) {
  return armTerms[slug];
}
