import { bodyZones } from '../components/atlas/zones';
import { zoneCopy } from '../components/atlas/zone-copy';
import { kukkiwonTerminologyReference } from '../data/movement-sources';
import type { BodyRegion } from './catalog-api';
import type { LibraryReference } from './library';

export type LegsEntry = Readonly<{
  classification: 'surface' | 'target_joint' | 'contextual_anatomy' | 'illustrative_only';
  romanization?: string;
  hangul?: string;
  meaningPt: string;
  gapNote?: string;
  reference?: LibraryReference;
  extraReference?: LibraryReference;
  libraryLink?: Readonly<{ href: string; label: string }>;
  atlasLink?: Readonly<{ href: string; label: string }>;
}>;

export const legsDocumentReview = {
  state: 'document_checked',
  checkedOn: '2026-11-24',
} as const;

function pdfReference(locator: string, page: number): LibraryReference {
  const base = kukkiwonTerminologyReference(locator);
  return { ...base, url: `${base.url}#page=${page}` };
}

const legsEntries: Readonly<Record<string, LegsEntry>> = {
  'legs-hip': {
    classification: 'contextual_anatomy',
    romanization: 'Arae',
    hangul: '아래',
    meaningPt: 'Transição entre tronco e coxas; no §10, a faixa abaixo da cintura corresponde à área geral Arae (parte inferior).',
    gapNote: 'O quadril não consta como superfície isolada no apêndice de partes aplicáveis consultado.',
    reference: pdfReference('Introductory remarks §10, p. 10 do PDF · Target areas · Arae (Lower Body)', 10),
    libraryLink: {
      href: '/biblioteca/kibon-dongjak/juchum-seogi',
      label: 'Estudar bases e altura do quadril (Juchum-seogi) na Biblioteca',
    },
  },
  'legs-thigh': {
    classification: 'illustrative_only',
    meaningPt: 'Segmento entre quadril e joelho; citado descritivamente como "upper leg" na definição de Mureup.',
    gapNote: 'Sem termo coreano próprio listado no apêndice de partes aplicáveis ou no §10 consultados.',
    reference: pdfReference('Appendix > Applicable Parts of the Body > Mureup (menção descritiva a upper leg)', 73),
    libraryLink: {
      href: '/biblioteca/kibon-dongjak/apgubi',
      label: 'Consultar bases (Apgubi) na Biblioteca',
    },
  },
  mureup: {
    classification: 'surface',
    romanization: 'Mureup',
    hangul: '무릎',
    meaningPt: 'Região da patela entre a parte superior e a inferior da perna, usada em golpes de curta distância e citada como alvo detalhado.',
    reference: pdfReference('Appendix > Applicable Parts of the Body > Mureup', 73),
    extraReference: pdfReference('§2 Chigi > Dollyeo-chigi > Mureup-dollyeo-chigi (p. 25) e §10 Detailed Target · knee (p. 10)', 25),
    libraryLink: {
      href: '/biblioteca/kibon-dongjak/palgup-mureup-chigi',
      label: 'Abrir ficha de golpes com joelho (Mureup) na Biblioteca',
    },
  },
  'legs-knee-back': {
    classification: 'contextual_anatomy',
    romanization: 'Ogeum',
    hangul: '오금',
    meaningPt: 'Dobra posterior do joelho (fossa poplítea), traduzida na edição inglesa como "Inner Knee" em projeções e na base Ogeum-seogi.',
    gapNote: 'Não integra o apêndice de superfícies de impacto; registrado no corpo do manual em técnicas de projeção e postura.',
    reference: pdfReference('§12 Neomgigi > Ogeum-deureo-neomgigi / Ogeum-georeo-neomgigi (p. 56 e índice p. 91)', 56),
    extraReference: pdfReference('§8 Description of the Left and Right Side > Ogeum-seogi', 8),
  },
  jeonggangi: {
    classification: 'surface',
    romanization: 'Jeonggangi',
    hangul: '정강이',
    meaningPt: 'Região frontal da perna onde ficam os ossos tibiais, documentada para bloqueios absorventes (Junggangi-badamakgi).',
    gapNote: 'O apêndice grafa Jeonggangi (p. 72); o uso em §10 Makgi (p. 45) grafa Junggangi-badamakgi.',
    reference: pdfReference('Appendix > Applicable Parts of the Body > Jeonggangi', 72),
    extraReference: pdfReference('§10 Makgi > Bada-makgi > Junggangi-badamakgi (p. 45 e §5 p. 6)', 45),
    libraryLink: {
      href: '/biblioteca/kibon-dongjak/an-makgi',
      label: 'Explorar família de defesas (Makgi) na Biblioteca',
    },
  },
  'legs-calf': {
    classification: 'illustrative_only',
    meaningPt: 'Região muscular posterior da perna entre a dobra posterior do joelho e o tornozelo.',
    gapNote: 'Sem entrada própria no apêndice de superfícies aplicáveis ou na lista de alvos detalhados consultada.',
    libraryLink: {
      href: '/biblioteca/balkisul/dwichuk',
      label: 'Explorar chutes e calcanhar em Balkisul',
    },
  },
  'legs-ankle': {
    classification: 'target_joint',
    romanization: 'Balmok',
    hangul: '발목',
    meaningPt: 'Articulação de transição entre a perna e o pé. Listada como alvo detalhado (§10) e em chaves/rasteiras (§9, §12).',
    gapNote: 'Não é classificada como superfície de contato no apêndice consultado; mantém-se como região anatômica ilustrativa e articular.',
    reference: pdfReference('Introductory remarks §10, p. 10 do PDF · Detailed Target · ankle (e §9 Kkeokgi p. 43)', 10),
    extraReference: pdfReference('§12 Neomgigi > Georeo-neomgigi > Balmok-georeo-neomgigi (p. 56 e índice p. 88)', 56),
    atlasLink: {
      href: '/atlas?region=feet&zoom=1',
      label: 'Abrir detalhe das superfícies do pé no Atlas',
    },
    libraryLink: {
      href: '/biblioteca/balkisul',
      label: 'Consultar superfícies do pé e chutes em Balkisul',
    },
  },
};

export const legsAtlasRegions: BodyRegion[] = bodyZones
  .filter(zone => zone.area === 'legs')
  .map(zone => ({
    id: zone.id,
    slug: zone.regionSlug ?? zone.id,
    name_pt: zoneCopy[zone.id].title,
    atlas_area: 'legs',
    region_group: 'legs',
    detail_view: zone.view,
    detail_x: null,
    detail_y: null,
  }));

export function getLegsAtlasRegion(slug: string) {
  return legsAtlasRegions.find(region => region.slug === slug || region.id === slug);
}

export function getLegsEntry(slug: string) {
  return Object.hasOwn(legsEntries, slug) ? legsEntries[slug] : undefined;
}
