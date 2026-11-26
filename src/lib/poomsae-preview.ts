import { readFile } from 'node:fs/promises';
import type { PoomsaeStudy, StudyLink } from '../data/poomsae-study';
import { getLibraryItem, libraryItemHref } from './library';
import { parseTaegeukTwoDossier } from './poomsae-dossier';

declare const __POOMSAE_DEV_PREVIEW__: boolean;

function techniqueLink(techniqueId: string): StudyLink | undefined {
  if (techniqueId === 'momtong-bandae-jireugi' || techniqueId === 'olgul-bandae-jireugi') {
    return { href: '/acervo?categoria=soco', label: 'Família Jireugi no Acervo' };
  }
  const item = getLibraryItem(techniqueId);
  if (!item) return undefined;

  const href = libraryItemHref(item.slug);
  if (!href) return undefined;

  return {
    href,
    label: item.term.romanization || item.term.name,
  };
}

export function parseTaegeukTwoStudy(input: unknown): PoomsaeStudy {
  return parseTaegeukTwoDossier(input, { term: libraryItemHref, technique: techniqueLink });
}

export async function loadPoomsaePreviews(): Promise<readonly PoomsaeStudy[]> {
  // The Astro command is authoritative even when a build uses NODE_ENV=development.
  if (typeof __POOMSAE_DEV_PREVIEW__ === 'undefined' || !__POOMSAE_DEV_PREVIEW__) return [];

  const { taegeukOneStudy } = await import('../data/poomsae-study');
  const path = process.env.POOMSAE_RESEARCH_FILE;
  if (!path) return [taegeukOneStudy];

  try {
    const content = await readFile(path, 'utf8');
    return [taegeukOneStudy, parseTaegeukTwoStudy(JSON.parse(content))];
  } catch {
    console.warn('Taegeuk 2 indisponível na prévia local. Confira o arquivo indicado em POOMSAE_RESEARCH_FILE.');
    return [taegeukOneStudy];
  }
}
