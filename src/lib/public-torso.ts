import { bodyZones } from '../components/atlas/zones';
import { zoneCopy } from '../components/atlas/zone-copy';
import { kukkiwonTerminologyReference } from '../data/movement-sources';
import type { BodyRegion } from './catalog-api';
import type { LibraryReference } from './library';

export type TorsoTermEntry = Readonly<{
  kind: 'target_area_general' | 'detailed_target' | 'contextual_reference';
  namePt: string;
  description: string;
  reference: LibraryReference;
  korean?: Readonly<{
    romanization: string;
    hangul?: string;
    sourceNote?: string;
  }>;
  extraReference?: LibraryReference;
}>;

export type TorsoLibraryLink = Readonly<{
  href: string;
  label: string;
}>;

export const torsoDocumentReview = {
  state: 'document_checked',
  checkedOn: '2026-11-24',
} as const;

function pdfReference(locator: string, page: number): LibraryReference {
  const base = kukkiwonTerminologyReference(locator);
  return { ...base, url: `${base.url}#page=${page}` };
}

export const torsoRomanizationReference: LibraryReference = {
  institution: 'Instituto Nacional da Língua Coreana',
  title: 'Romanização do coreano',
  edition: 'norma revisada de 2000',
  locator: 'Cap. 2 · vogais e consoantes',
  url: 'https://www.korean.go.kr/front_eng/roman/roman_01.do',
};

const targetList = 'Introductory remarks §10, p. 10 do PDF';

const torsoEntries: Readonly<Partial<Record<string, readonly TorsoTermEntry[]>>> = {
  'torso-shoulders': [
    {
      kind: 'detailed_target',
      namePt: 'Ombro',
      description: 'O manual inglês inclui o ombro na lista de alvos detalhados e em técnicas de chave, sem registrar Hangul ou romanização nessa passagem.',
      reference: pdfReference(`${targetList} · Detailed Target · shoulder`, 10),
    },
  ],
  'torso-chest': [
    {
      kind: 'target_area_general',
      namePt: 'Tronco / faixa média',
      description: 'Uma das três áreas gerais usadas pelo manual para indicar a altura média em defesas, socos e chutes.',
      reference: pdfReference(`${targetList} · Target areas · Momtong (Trunk)`, 10),
      korean: {
        romanization: 'Momtong',
        hangul: '몸통',
        sourceNote: 'Romanização no §10 inglês; grafia Hangul conferida no léxico coreano e lotes do projeto.',
      },
      extraReference: torsoRomanizationReference,
    },
    {
      kind: 'contextual_reference',
      namePt: 'Peito (quebramento)',
      description: 'Termo coreano documentado em saltos de quebramento sobre o peito de um apoiador.',
      reference: pdfReference('§11 > Gyeokpa > Gaseum-balkko-ap-chagi (p. 77 e índice p. 82)', 77),
      korean: {
        romanization: 'Gaseum',
        hangul: '가슴',
      },
    },
  ],
  'torso-solar-plexus': [
    {
      kind: 'detailed_target',
      namePt: 'Plexo solar',
      description: 'Alvo detalhado central citado em §10, em golpes ascendentes (§2) e como referência de altura em posturas de preparação (§8).',
      reference: pdfReference(`${targetList} · Detailed Target · solar plexus (myeongchi)`, 10),
      korean: {
        romanization: 'Myeongchi',
        hangul: '명치',
        sourceNote: 'Romanizado como myeongchi no §10 inglês; Hangul lexical conferido e sujeito à conferência em edição coreana.',
      },
      extraReference: pdfReference('§8 Junbi-jase > Gibon-junbi / Gyeorugi-junbi', 41),
    },
  ],
  'torso-abdomen': [
    {
      kind: 'target_area_general',
      namePt: 'Seção inferior / baixo-ventre',
      description: 'A porção abaixo da cintura integra a faixa geral Arae (parte inferior); nas posturas de preparação (§8), o baixo-ventre é referido como Danjeon.',
      reference: pdfReference(`${targetList} · Target areas · Arae (Lower Body)`, 10),
      korean: {
        romanization: 'Arae',
        hangul: '아래',
        sourceNote: 'Romanização no §10 inglês; Hangul 아래 conferido no glossário de alturas do projeto.',
      },
      extraReference: pdfReference('§8 Junbi-jase > Gibon-junbi / Bojumeok-junbi (Danjeon)', 41),
    },
  ],
  'torso-back': [
    {
      kind: 'detailed_target',
      namePt: 'Costas',
      description: 'Listadas como alvo detalhado em §10 e registradas em coreano no índice e nas técnicas de salto por cima das costas.',
      reference: pdfReference(`${targetList} · Detailed Target · back`, 10),
      korean: {
        romanization: 'Deung',
        hangul: '등',
      },
      extraReference: pdfReference('§11 > Gyeokpa > Deung-balgo-ap-chagi-se-dangye (p. 78 e índice p. 85)', 78),
    },
  ],
  'torso-lumbar': [
    {
      kind: 'detailed_target',
      namePt: 'Cintura e região lombar',
      description: 'A cintura consta como alvo detalhado em §10 e aparece com termo coreano na postura de punhos na cintura (§8).',
      reference: pdfReference(`${targetList} · Detailed Target · waist`, 10),
      korean: {
        romanization: 'Heori',
        hangul: '허리',
      },
      extraReference: pdfReference('§8 Junbi-jase > Dujumeok-heori-junbi (p. 40 e índice p. 85)', 40),
    },
  ],
};

const torsoLinks: Readonly<Partial<Record<string, readonly TorsoLibraryLink[]>>> = {
  'torso-chest': [
    { href: '/biblioteca/kibon-dongjak/an-makgi', label: 'Estudar defesa média (An-makgi) na Biblioteca' },
    { href: '/fundamentos/alturas-e-direcoes', label: 'Consultar alturas Momtong e Arae nos Fundamentos' },
  ],
  'torso-solar-plexus': [
    { href: '/biblioteca/kibon-dongjak/jeocheo-jireugi', label: 'Consultar socos no eixo médio (Jireugi) na Biblioteca' },
    { href: '/biblioteca/kibon-dongjak/kibon-alturas-direcoes', label: 'Ver guia de alturas na Biblioteca' },
  ],
  'torso-abdomen': [
    { href: '/biblioteca/kibon-dongjak/gibon-junbi', label: 'Consultar postura Gibon-junbi (Danjeon) na Biblioteca' },
    { href: '/biblioteca/kibon-dongjak/naeryeo-makgi', label: 'Estudar defesa baixa (Naeryeo-makgi) na Biblioteca' },
  ],
  'torso-lumbar': [
    { href: '/biblioteca/kibon-dongjak/tongmilgi-bojumeok-junbi', label: 'Consultar posturas de preparação (Dujumeok-heori-junbi)' },
    { href: '/acervo#dujumeok-heori-junbi', label: 'Ver registro Dujumeok-heori-junbi no Acervo' },
  ],
};

export const torsoAtlasRegions: BodyRegion[] = bodyZones
  .filter(zone => zone.area === 'torso')
  .map(({ id, view }) => ({
    id,
    slug: id,
    name_pt: zoneCopy[id].title,
    atlas_area: 'torso',
    region_group: 'torso',
    detail_view: view,
    detail_x: null,
    detail_y: null,
  }));

export function getTorsoAtlasRegion(slug: string) {
  return torsoAtlasRegions.find(region => region.slug === slug || region.id === slug);
}

export function getTorsoEntries(slug: string) {
  return Object.hasOwn(torsoEntries, slug) ? torsoEntries[slug] : undefined;
}

export function getTorsoLibraryLinks(slug: string) {
  return Object.hasOwn(torsoLinks, slug) ? torsoLinks[slug] : undefined;
}
