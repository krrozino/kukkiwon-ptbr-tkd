import data from '../data/public-hand-v1.json';
import type { BodyRegion } from './catalog-api';
import { zoneCopy } from '../components/atlas/zone-copy';

/** Curated visitor data; never import content/research from a public module. */
export type HandTerm = (typeof data.publicTerms)[number];
export type HandRegion = (typeof data.publicRegions)[number];
export const handTerms: HandTerm[] = data.publicTerms;
export const handRegions: HandRegion[] = data.publicRegions;
const byTerm = new Map(handTerms.map(term => [term.slug, term]));
const byRegion = new Map(handRegions.map(region => [region.slug, region]));

export function getHandTerm(slug: string | null | undefined) {
  return slug ? byTerm.get(slug) ?? null : null;
}
export function getHandRegion(slug: string | null | undefined) {
  return slug ? byRegion.get(slug) ?? null : null;
}
export function getHandTermForRegion(regionSlug: string | null | undefined) {
  const region = getHandRegion(regionSlug);
  return getHandTerm(region?.termSlug);
}
export function getHandRegionForTerm(termSlug: string) {
  return handRegions.find(region => region.termSlug === termSlug) ?? null;
}
export const handAtlasRegions: BodyRegion[] = handRegions.map(region => ({
  id: 'hand-' + region.slug,
  slug: region.slug,
  name_pt: region.name,
  region_group: 'hands',
  atlas_area: 'hands',
  detail_view: 'both',
  detail_x: null,
  detail_y: null,
}));
export function handRegionDescription(slug: string) {
  const term = getHandTermForRegion(slug);
  return term?.description || zoneCopy[slug]?.description || '';
}
export function searchHandTerms(query: string) {
  const normalize = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  const text = normalize(query.trim());
  if (!text) return handTerms;
  return handTerms.filter(term => normalize([
    term.name, term.slug, term.romanization || '', term.hangul || '', term.pronunciation || '', term.description || '',
    ...term.variants.map(variant => variant.value),
  ].join(' ')).includes(text));
}
