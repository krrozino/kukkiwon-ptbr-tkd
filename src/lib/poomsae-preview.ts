import type { PoomsaeStudy } from '../data/poomsae-study';

declare const __POOMSAE_DEV_PREVIEW__: boolean;

export async function loadPoomsaePreviews(): Promise<readonly PoomsaeStudy[]> {
  if (!__POOMSAE_DEV_PREVIEW__) return [];
  const { taegeukOneStudy } = await import('../data/poomsae-study');
  return [taegeukOneStudy];
}
