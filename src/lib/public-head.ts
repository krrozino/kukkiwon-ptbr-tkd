import { bodyZones } from '../components/atlas/zones';
import { zoneCopy } from '../components/atlas/zone-copy';
import { kukkiwonTerminologyReference } from '../data/movement-sources';
import type { BodyRegion } from './catalog-api';
import type { LibraryReference } from './library';

type HeadTarget = Readonly<{
  kind: 'target_area_general' | 'detailed_target';
  namePt: string;
  description: string;
  targetReference: LibraryReference;
  spelling?: Readonly<{
    romanization: string;
    hangul: string;
    dictionary: LibraryReference;
    revisedRomanization?: true;
  }>;
}>;

export const headDocumentReview = {
  state: 'document_checked',
  checkedOn: '2026-11-23',
} as const;

const targetList = 'Introductory remarks §10, p. 10 do PDF';
function targetReference(list: 'Target areas' | 'Detailed Target', entry: string): LibraryReference {
  const reference = kukkiwonTerminologyReference(`${targetList} · ${list} · ${entry}`);
  return { ...reference, edition: 'ed. inglesa de 2012', url: `${reference.url}#page=10` };
}

function dictionaryReference(entry: string, word: number, sense: string, language: 'eng' | 'kor' = 'eng'): LibraryReference {
  const languageQuery = language === 'eng' ? '&nation=eng' : '';
  return {
    institution: 'Instituto Nacional da Língua Coreana',
    title: 'Dicionário Básico de Coreano',
    edition: 'online',
    locator: `Verbete ${entry} · ${sense}`,
    url: `https://krdict.korean.go.kr/${language}/dicSearch/SearchView?ParaWordNo=${word}${languageQuery}`,
  };
}

export const headRomanizationReference: LibraryReference = {
  institution: 'Instituto Nacional da Língua Coreana',
  title: 'Romanização do coreano',
  edition: 'norma revisada de 2000',
  locator: 'Cap. 2 · §§1–2, vogais e consoantes',
  url: 'https://www.korean.go.kr/front_eng/roman/roman_01.do',
};

const headTargets: Readonly<Partial<Record<string, readonly HeadTarget[]>>> = {
  'head-face': [
    {
      kind: 'target_area_general',
      namePt: 'Rosto',
      description: 'Uma das três áreas gerais usadas pelo manual para descrever ataque e defesa.',
      targetReference: targetReference('Target areas', 'Eolgul (Face)'),
      spelling: {
        romanization: 'Eolgul',
        hangul: '얼굴',
        dictionary: dictionaryReference('얼굴', 17183, 'acepção 1'),
      },
    },
    {
      kind: 'detailed_target',
      namePt: 'Filtro labial',
      description: 'Sulco entre o nariz e o lábio superior, sem recorte próprio nesta ilustração.',
      targetReference: targetReference('Detailed Target', 'Philtrum (Injung)'),
      spelling: {
        romanization: 'Injung',
        hangul: '인중',
        dictionary: dictionaryReference('인중', 72623, 'definição', 'kor'),
      },
    },
  ],
  'head-temples': [
    {
      kind: 'detailed_target',
      namePt: 'Têmpora',
      description: 'O manual inclui a têmpora na lista de alvos detalhados da edição inglesa.',
      targetReference: targetReference('Detailed Target', 'temple'),
    },
  ],
  'head-chin': [
    {
      kind: 'detailed_target',
      namePt: 'Queixo',
      description: 'O manual cita o queixo e a região sob a mandíbula como entradas distintas.',
      targetReference: targetReference('Detailed Target', 'chin'),
      spelling: {
        romanization: 'Teok',
        hangul: '턱',
        dictionary: dictionaryReference('턱', 71475, 'acepção 1'),
        revisedRomanization: true,
      },
    },
  ],
  'head-neck': [
    {
      kind: 'detailed_target',
      namePt: 'Pescoço',
      description: 'O manual inclui o pescoço na lista de alvos detalhados. O desenho indica a região nas duas vistas.',
      targetReference: targetReference('Detailed Target', 'neck'),
      spelling: {
        romanization: 'Mok',
        hangul: '목',
        dictionary: dictionaryReference('목', 89861, 'acepção 1'),
        revisedRomanization: true,
      },
    },
  ],
};

export const headAtlasRegions: BodyRegion[] = bodyZones
  .filter(zone => zone.area === 'head')
  .map(({ id, view }) => ({
    id,
    slug: id,
    name_pt: zoneCopy[id].title,
    atlas_area: 'head',
    region_group: 'head',
    detail_view: view,
    detail_x: null,
    detail_y: null,
  }));

export function getHeadAtlasRegion(slug: string) {
  return headAtlasRegions.find(region => region.slug === slug);
}

export function getHeadTargets(slug: string) {
  return Object.hasOwn(headTargets, slug) ? headTargets[slug] : undefined;
}
