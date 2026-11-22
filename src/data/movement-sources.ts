import type { LibraryReference } from '../lib/library';
import { sparringSource } from './kyorugi-guide';

export function kukkiwonTerminologyReference(locator: string): LibraryReference {
  return {
    institution: 'Kukkiwon',
    title: 'Taekwondo Technical Terminology',
    edition: '2011/2012',
    url: 'https://research.kukkiwon.or.kr/homepage/boardMedia/11621',
    locator,
  };
}

export function kukkiwonSparringReference(boardNo: number, family: string): LibraryReference {
  return {
    institution: 'Kukkiwon',
    title: `Composition of Taekwondo — Sparring (${family})`,
    edition: 'Portal institucional em inglês (Board 56)',
    url: sparringSource(boardNo),
    locator: `Board 56 / article ${boardNo} (${family})`,
  };
}
