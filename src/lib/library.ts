import { handTerms, getHandRegionForTerm } from './public-hand';
import { allPoomsaeGuides } from '../data/poomsae-guide';
import { palgwaeEntries } from '../data/palgwae-guide';
import { matchuoEntries } from '../data/matchuo-kyorugi-guide';

export type LibraryReference = {
  title: string;
  institution: string;
  edition: string;
  url: string;
  locator: string;
};

export type LibraryTerm = {
  slug: string;
  name: string;
  hangul: string | null;
  romanization: string | null;
  pronunciation: string | null;
  description: string | null;
  meanings: {
    kind: string;
    language: string;
    value: string;
    reference?: LibraryReference | null;
  }[];
  variants: { value: string }[];
  related: {
    name: string;
    reference?: LibraryReference | null;
  }[];
  evidence: {
    field: string;
    reference: LibraryReference;
  }[];
};

/** Product navigation, not a new technical classification or Korean dictionary. */
export const libraryCategories = [
  {
    id: 'poomsae',
    label: 'Poomsae',
    title: 'Formas e sequências',
    description: 'Estude os oito Taegeuk e as nove formas Dan com trigramas, linhas e fontes.',
    href: '/poomsae',
    destination: 'Explorar Poomsae',
    number: '01',
  },
  {
    id: 'matchuo-kyorugi',
    label: 'Matchuo Kyorugi',
    title: 'Combate combinado',
    description: 'Organize Sebon, Dubon, Anjoa e sequências ensinadas na sua escola.',
    href: '/kyorugi#combinado',
    destination: 'Explorar combate combinado',
    number: '02',
  },
  {
    id: 'palgwae',
    label: 'Palgwae',
    title: 'Coleção Palgwae',
    description: 'Contexto histórico pré-Taegeuk, trigramas e registro nos currículos escolares.',
    href: '/fontes',
    destination: 'Conhecer as fontes',
    number: '03',
  },
  {
    id: 'iron',
    label: 'Iron',
    title: 'Teoria e terminologia',
    description: 'Fundamentos conceituais, história documentada, espírito do Taekwondo e glossário.',
    href: '/glossario',
    destination: 'Abrir o glossário',
    number: '04',
  },
  {
    id: 'kibon-dongjak',
    label: 'Kibon Dongjak',
    title: 'Fundamentos',
    description: 'Bases, defesas, socos, golpes, alturas e direções para estruturar a técnica.',
    href: '/fundamentos/alturas-e-direcoes',
    destination: 'Estudar fundamentos',
    number: '05',
  },
  {
    id: 'balkisul',
    label: 'Balkisul',
    title: 'Pés e pernas',
    description: 'Superfícies de contato do pé no Atlas e famílias de chutes do Taekwondo.',
    href: '/atlas?region=feet&zoom=1',
    destination: 'Explorar pés no Atlas',
    number: '06',
  },
  {
    id: 'sonkisul',
    label: 'Sonkisul',
    title: 'Mãos e punhos',
    description: 'Consulte superfícies, dedos e configurações com acesso direto ao Atlas.',
    href: '/atlas?region=hands&zoom=1',
    destination: 'Explorar a mão no Atlas',
    number: '07',
  },
] as const;

export type LibraryCategoryId = (typeof libraryCategories)[number]['id'];

export const categoryResources: Record<LibraryCategoryId, { title: string; description: string; href: string }[]> = {
  poomsae: [
    {
      title: 'Painel interativo de Poomsae',
      description: 'Explore os oito Taegeuk, as formas Dan, trigramas e dossiês de estudo.',
      href: '/poomsae',
    },
    {
      title: 'Posturas de preparação no Acervo',
      description: 'Consulte Gibon-junbi, Tongmilgi-junbi e Bojumeok-junbi em revisão documental.',
      href: '/acervo?categoria=poomsae',
    },
  ],
  'matchuo-kyorugi': [
    {
      title: 'Guia de Kyorugi e combate combinado',
      description: 'Diferencie famílias marciais, combate combinado e regras esportivas.',
      href: '/kyorugi#combinado',
    },
    {
      title: 'Conteúdos da sua escola',
      description: 'Organize os exercícios e intervalos realmente ensinados pelo professor.',
      href: '/curriculos',
    },
  ],
  palgwae: [
    {
      title: 'Poomsae atuais (série Taegeuk)',
      description: 'Compare o contexto histórico Palgwae com as formas Taegeuk descritas pela Kukkiwon.',
      href: '/poomsae',
    },
    {
      title: 'Referências e metodologia',
      description: 'Encontre as fontes da biblioteca e os critérios de documentação histórica.',
      href: '/fontes',
    },
  ],
  iron: [
    {
      title: 'Glossário de consulta',
      description: 'Pesquise palavras e expressões nos materiais do projeto.',
      href: '/glossario',
    },
    {
      title: 'Fontes e critérios',
      description: 'Conheça a origem das informações e as diferenças entre referências.',
      href: '/fontes',
    },
  ],
  'kibon-dongjak': [
    {
      title: 'Alturas e direções',
      description: 'Acesse o material de alturas (alta, média, baixa) e direções.',
      href: '/fundamentos/alturas-e-direcoes',
    },
    {
      title: 'Bases e defesas no Acervo',
      description: 'Consulte registros provisórios de Seogi, Makgi, Jireugi e Chigi com fonte.',
      href: '/acervo',
    },
  ],
  balkisul: [
    {
      title: 'Pés no Atlas',
      description: 'Explore o desenho original e as regiões selecionáveis do pé.',
      href: '/atlas?region=feet&zoom=1',
    },
    {
      title: 'Materiais de combate e chutes',
      description: 'Consulte a família Chagi e o acervo provisório de chutes.',
      href: '/kyorugi',
    },
  ],
  sonkisul: [
    {
      title: 'Mão no Atlas',
      description: 'Consulte os termos junto ao desenho interativo de palma e dorso.',
      href: '/atlas?region=hands&zoom=1',
    },
  ],
};

export type LibrarySortMode = 'default' | 'az' | 'hangul' | 'atlas';

export type LibraryItem = {
  slug: string;
  categoryId: LibraryCategoryId;
  kindLabel: string;
  term: LibraryTerm;
  atlasZone?: string | null;
  illustrativeBodyArea?: {
    region: 'head' | 'torso' | 'arms' | 'legs' | 'hands' | 'feet';
    label: string;
    note: string;
  };
  acervoLink?: {
    href: string;
    label: string;
    note: string;
  };
  moduleLink?: {
    href: string;
    label: string;
  };
  studyPoints?: readonly string[];
  scopeNotice?: string;
  poomsaeSlug?: string;
  relatedLibrarySlugs?: readonly string[];
};

const sonkisulItems: LibraryItem[] = handTerms.map((term) => ({
  slug: term.slug,
  categoryId: 'sonkisul',
  kindLabel: 'Superfícies e configurações',
  term,
}));

const poomsaeItems: LibraryItem[] = allPoomsaeGuides.map((guide) => ({
  slug: guide.slug,
  categoryId: 'poomsae',
  kindLabel: guide.kind === 'taegeuk' ? 'Forma Taegeuk' : 'Forma Yudanja (Dan)',
  poomsaeSlug: guide.slug,
  illustrativeBodyArea: {
    region: guide.bodyCorrespondence.atlasRegion,
    label: guide.bodyCorrespondence.label,
    note: guide.bodyCorrespondence.summary,
  },
  acervoLink: {
    href: `/acervo#${guide.relatedAcervoJunbi.slug}`,
    label: `Postura ${guide.relatedAcervoJunbi.romanization} no Acervo`,
    note: guide.relatedAcervoJunbi.note,
  },
  moduleLink: {
    href: `/poomsae?forma=${guide.slug}#dossie-poomsae`,
    label: 'Abrir no painel interativo de Poomsae',
  },
  studyPoints: guide.practiceFocus,
  scopeNotice:
    'Síntese didática independente fundamentada no artigo institucional da Kukkiwon. A associação a faixas depende do currículo de cada escola e a sequência passo a passo permanece separada até revisão documental de cada movimento.',
  relatedLibrarySlugs:
    guide.kind === 'taegeuk'
      ? ['sonnal', 'jumeok', guide.number < 8 ? `taegeuk-${guide.number + 1}-jang` : 'koryo']
      : ['sonnal', 'ageumson', guide.slug === 'koryo' ? 'keumgang' : 'koryo'],
  term: {
    slug: guide.slug,
    name:
      guide.kind === 'taegeuk'
        ? `Forma ${guide.number} da série Taegeuk · Símbolo: ${guide.symbol} (${guide.trigram.romanization})`
        : `Forma de graduação Dan · ${guide.theme}`,
    hangul: null,
    romanization: guide.name,
    pronunciation: null,
    description: `${guide.philosophySummary} ${
      guide.kind === 'taegeuk'
        ? guide.trigram.polaritySummary
        : guide.poomsaeLine
          ? guide.poomsaeLine.meaningPt
          : ''
    }`.trim(),
    meanings: [
      {
        kind: 'symbolic',
        language: 'pt-BR',
        value:
          guide.kind === 'taegeuk'
            ? `Trigrama ${guide.trigram.romanization}: ${guide.trigram.symbolPt}`
            : guide.poomsaeLine
              ? `${guide.theme} · Linha documentada: ${guide.poomsaeLine.character}`
              : guide.theme,
        reference: {
          title: guide.evidence.document,
          institution: guide.evidence.institution,
          edition: `Consulta ${guide.evidence.sourceCheckedAt}`,
          url: guide.evidence.url,
          locator: guide.evidence.locator,
        },
      },
    ],
    variants:
      guide.kind === 'taegeuk'
        ? [
            { value: `Taegeuk ${guide.number}` },
            { value: `Trigrama ${guide.trigram.romanization}` },
          ]
        : [],
    related: [
      {
        name: `${guide.relatedAcervoJunbi.romanization} (postura de preparação relacionada)`,
        reference: {
          title: 'Taekwondo Technical Terminology',
          institution: 'Kukkiwon',
          edition: '2011/2012',
          url: 'https://research.kukkiwon.or.kr/homepage/boardMedia/11621',
          locator: `§8 Junbi-jase > ${guide.relatedAcervoJunbi.romanization}`,
        },
      },
    ],
    evidence: [
      {
        field: 'romanization',
        reference: {
          title: guide.evidence.document,
          institution: guide.evidence.institution,
          edition: `Consulta ${guide.evidence.sourceCheckedAt}`,
          url: guide.evidence.url,
          locator: guide.evidence.locator,
        },
      },
      {
        field: 'context',
        reference: {
          title: guide.evidence.document,
          institution: guide.evidence.institution,
          edition: `Consulta ${guide.evidence.sourceCheckedAt}`,
          url: guide.evidence.url,
          locator: `${guide.evidence.locator} (simbolismo e foco corporal)`,
        },
      },
    ],
  },
}));

const palgwaeItems: LibraryItem[] = palgwaeEntries.map((entry) => ({
  slug: entry.slug,
  categoryId: 'palgwae',
  kindLabel: entry.kind === 'context' ? 'Contexto histórico' : 'Forma histórica Palgwae',
  moduleLink: {
    href: `/biblioteca/poomsae/${entry.relatedTaegeukSlug}`,
    label: `Comparar com ${entry.relatedTaegeukLabel} (coleção vigente)`,
  },
  studyPoints: entry.studyPoints,
  scopeNotice:
    'Registro histórico e curricular independente. O portal atual de Poomsae da Kukkiwon (Board 55) lista a série Taegeuk e as formas Dan como coleção vigente; sequências e faixas de Palgwae dependem da linhagem de cada escola.',
  relatedLibrarySlugs:
    entry.kind === 'context'
      ? ['palgwae-1-jang', 'palgwae-2-jang', 'taegeuk-1-jang']
      : [
          entry.relatedTaegeukSlug,
          'palgwae-contexto-historico',
          entry.number && entry.number < 8 ? `palgwae-${entry.number + 1}-jang` : 'palgwae-1-jang',
        ],
  term: {
    slug: entry.slug,
    name: entry.subtitle,
    hangul: null,
    romanization: entry.title,
    pronunciation: null,
    description: `${entry.summary} ${entry.historicalContext}`,
    meanings: [
      {
        kind: 'historical',
        language: 'pt-BR',
        value: entry.historicalContext,
        reference: entry.references[0]?.reference ?? null,
      },
    ],
    variants: entry.variants.map((value) => ({ value })),
    related: [
      {
        name: `${entry.relatedTaegeukLabel} (forma vigente correspondente em numeração na série Taegeuk)`,
        reference: entry.references[1]?.reference ?? null,
      },
    ],
    evidence: entry.references.map((row) => ({
      field: row.field,
      reference: row.reference,
    })),
  },
}));

const matchuoItems: LibraryItem[] = matchuoEntries.map((entry) => ({
  slug: entry.slug,
  categoryId: 'matchuo-kyorugi',
  kindLabel: entry.kindLabel,
  illustrativeBodyArea: {
    region: entry.atlasRegion,
    label: entry.atlasLabel,
    note: 'Ligação ilustrativa para explorar a anatomia relacionada no Atlas corporal; não define alvo regulamentar único.',
  },
  acervoLink:
    entry.acervoHref && entry.acervoLabel
      ? {
          href: entry.acervoHref,
          label: entry.acervoLabel,
          note: 'Registros provisórios da família técnica na base Kukkiwon 2011/2012.',
        }
      : undefined,
  moduleLink: {
    href: '/kyorugi#combinado',
    label: 'Abrir guia e organizador de combate combinado',
  },
  studyPoints: entry.pedagogicalFocus,
  scopeNotice:
    'Síntese pedagógica independente. As famílias marciais (Makgi, Jireugi, Chigi, Chagi, Pihagi, Ppaegi, Kkeokgi, Neomgigi, Nakbeop) são documentadas pela Kukkiwon (Board 56), enquanto a numeração de Sebon, Dubon, Hanbon e Anjoa pertence ao currículo de cada escola.',
  relatedLibrarySlugs: entry.relatedLibrarySlugs,
  term: {
    slug: entry.slug,
    name: entry.subtitle,
    hangul: null,
    romanization: entry.title,
    pronunciation: null,
    description: entry.summary,
    meanings: entry.stepCountLabel
      ? [
          {
            kind: 'technical',
            language: 'pt-BR',
            value: `${entry.stepCountLabel} — estrutura organizada pelo professor conforme a faixa na escola.`,
            reference: entry.references[0]?.reference ?? null,
          },
        ]
      : [],
    variants: entry.variants.map((value) => ({ value })),
    related: entry.references.slice(0, 2).map((row) => ({
      name: `${row.reference.title} (${row.reference.locator})`,
      reference: row.reference,
    })),
    evidence: entry.references.map((row) => ({
      field: row.field,
      reference: row.reference,
    })),
  },
}));

// One identity, verified institutional sources only: zero raw Argon/Gemini research leakage.
export const libraryItems: LibraryItem[] = [
  ...sonkisulItems,
  ...poomsaeItems,
  ...palgwaeItems,
  ...matchuoItems,
];

export const getLibraryItem = (slug: string) => libraryItems.find((item) => item.slug === slug);
export const getLibraryCategory = (id: string) => libraryCategories.find((category) => category.id === id);

export function libraryItemHref(slug: string) {
  const item = getLibraryItem(slug);
  return item ? `/biblioteca/${item.categoryId}/${item.slug}` : null;
}

export function atlasHref(slug: string) {
  const region = getHandRegionForTerm(slug);
  if (region) return `/atlas?region=${region.slug}&zoom=1`;
  const item = getLibraryItem(slug);
  if (item?.atlasZone) return `/atlas?region=${item.atlasZone}&zoom=1`;
  return null;
}

export function getLibraryKinds(categoryId?: string): string[] {
  const scoped = categoryId ? libraryItems.filter((item) => item.categoryId === categoryId) : libraryItems;
  return [...new Set(scoped.map((item) => item.kindLabel))];
}

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[-_]/g, ' ');
}

export function searchLibrary(
  query: string,
  categoryId?: string,
  onlyAtlas = false,
  kindFilter?: string,
  sortBy: LibrarySortMode = 'default',
) {
  const words = normalize(query.trim()).split(/\s+/).filter(Boolean);
  const filtered = libraryItems.filter((item) => {
    if (categoryId && item.categoryId !== categoryId) return false;
    if (onlyAtlas && !atlasHref(item.slug)) return false;
    if (kindFilter && item.kindLabel !== kindFilter) return false;
    if (!words.length) return true;
    const { term } = item;
    const text = normalize(
      [
        term.slug,
        term.name,
        term.romanization,
        term.hangul,
        term.pronunciation,
        term.description,
        item.kindLabel,
        ...(item.studyPoints || []),
        ...term.meanings.map((meaning) => meaning.value),
        ...term.variants.map((variant) => variant.value),
      ]
        .filter(Boolean)
        .join(' '),
    );
    return words.every((word) => text.includes(word));
  });

  if (sortBy === 'az') {
    return [...filtered].sort((a, b) =>
      (a.term.romanization || a.term.name).localeCompare(b.term.romanization || b.term.name, 'pt-BR'),
    );
  }
  if (sortBy === 'hangul') {
    return [...filtered].sort((a, b) => {
      if (Boolean(a.term.hangul) !== Boolean(b.term.hangul)) return a.term.hangul ? -1 : 1;
      return (a.term.romanization || a.term.name).localeCompare(b.term.romanization || b.term.name, 'pt-BR');
    });
  }
  if (sortBy === 'atlas') {
    return [...filtered].sort((a, b) => {
      if (Boolean(atlasHref(a.slug)) !== Boolean(atlasHref(b.slug))) return atlasHref(a.slug) ? -1 : 1;
      return (a.term.romanization || a.term.name).localeCompare(b.term.romanization || b.term.name, 'pt-BR');
    });
  }
  return filtered;
}
