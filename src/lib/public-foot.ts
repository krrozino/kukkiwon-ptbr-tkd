import { footSurfaceSlugs, surfaces } from '../components/atlas/surfaces';
import { zoneCopy } from '../components/atlas/zone-copy';
import { balkisulEntries } from '../data/balkisul-guide';
import { kukkiwonTerminologyReference } from '../data/movement-sources';
import type { BodyRegion } from './catalog-api';
import type { LibraryReference } from './library';

type FootRegion = BodyRegion & { slug: (typeof footSurfaceSlugs)[number] };
type PublicFootRegion = {
  anatomy: string;
  kind: 'illustrative';
} | {
  kind: 'technical';
  romanization: string;
  hangul: string;
  meaningPt: string;
  terminology: LibraryReference;
  librarySlug: string;
};

export const footContactReference = kukkiwonTerminologyReference(
  '§5 > Chagi (Kicking)',
);
export const footDocumentCheckedOn = '2026-11-23';

/** Join the original drawing to the curated Balkisul records. Research files, broader
 * study notes and unreviewed PT-BR pronunciation are outside this projection. */
const publicFootRegions = new Map<string, PublicFootRegion>();
export const footAtlasRegions: FootRegion[] = footSurfaceSlugs.map((slug) => {
  const zone = zoneCopy[slug];
  if (slug === 'illustration-foot-arch') {
    publicFootRegions.set(slug, { kind: 'illustrative', anatomy: zone.description });
  } else {
    const entry = balkisulEntries.find((card) => card.atlasZone === slug);
    const terminology = entry?.references.find(({ field }) => field === 'hangul')?.reference;
    if (!entry || !terminology?.locator) throw new Error(`Superfície do pé sem ficha ou fonte: ${slug}`);
    publicFootRegions.set(slug, {
      kind: 'technical',
      romanization: entry.romanization,
      hangul: entry.hangul,
      meaningPt: entry.subtitlePt,
      terminology,
      librarySlug: entry.slug,
    });
  }
  return {
    id: `foot-${slug}`,
    slug,
    name_pt: zone.title,
    region_group: 'feet',
    atlas_area: 'feet',
    detail_view: surfaces[slug].view,
    detail_x: null,
    detail_y: null,
  };
});

export function getPublicFootRegion(slug: string) {
  return publicFootRegions.get(slug);
}
