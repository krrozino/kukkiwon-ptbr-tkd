import { getPoomsaeGuide } from '../data/poomsae-guide';
import type { PoomsaeStudy, StudyLink } from '../data/poomsae-study-model';
import { getLibraryItem, libraryItemHref } from './library';
import { parsePoomsaeDossier } from './poomsae-dossier';
import { readLocalPoomsaeDossiers } from './poomsae-local-files';

declare const __POOMSAE_DEV_PREVIEW__: boolean;

const techniqueFamilies: Readonly<Partial<Record<string, string>>> = {
  'sonnal-makgi': 'sonnal-makgi-familia',
  'sonnal-momtong-makgi': 'sonnal-makgi-familia',
  'momtong-an-makgi': 'an-makgi',
  'momtong-bakkat-makgi': 'bakkat-makgi',
  'momtong-hechyeo-makgi': 'hechyeo-makgi',
  'arae-hechyeo-makgi': 'hechyeo-makgi',
};

function techniqueLink(techniqueId: string): StudyLink | undefined {
  if (techniqueId === 'momtong-bandae-jireugi' || techniqueId === 'olgul-bandae-jireugi') {
    return { href: '/acervo?categoria=soco', label: 'Família Jireugi no Acervo' };
  }
  const family = techniqueFamilies[techniqueId];
  const item = getLibraryItem(family ?? techniqueId);
  if (!item) return undefined;

  const href = libraryItemHref(item.slug);
  if (!href) return undefined;

  return {
    href,
    label: family ? `Família ${item.term.romanization || item.term.name}` : item.term.romanization || item.term.name,
  };
}

export function parseLocalPoomsaeStudy(input: unknown): PoomsaeStudy<string> {
  const study = parsePoomsaeDossier(input, { term: libraryItemHref, technique: techniqueLink });
  const guide = getPoomsaeGuide(study.slug);
  if (!guide || guide.kind !== (study.family === 'Dan' ? 'dan' : 'taegeuk')) {
    throw new Error('Identidade incompatível com o índice de Poomsae.');
  }
  return study;
}

export async function loadPoomsaePreviews(): Promise<readonly PoomsaeStudy<string>[]> {
  // The Astro command is authoritative even when a build uses NODE_ENV=development.
  if (typeof __POOMSAE_DEV_PREVIEW__ === 'undefined' || !__POOMSAE_DEV_PREVIEW__) return [];

  const { taegeukOneStudy } = await import('../data/poomsae-study');
  const dossiers = await readLocalPoomsaeDossiers(parseLocalPoomsaeStudy, { reserved: [taegeukOneStudy.slug] });
  return [taegeukOneStudy, ...dossiers];
}
