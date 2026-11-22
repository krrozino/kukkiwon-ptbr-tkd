import type { LibraryReference } from '../lib/library';

export type PalgwaeEntry = {
  slug: string;
  title: string;
  subtitle: string;
  kind: 'context' | 'form';
  number?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  relatedTaegeukSlug: string;
  relatedTaegeukLabel: string;
  summary: string;
  historicalContext: string;
  studyPoints: readonly string[];
  variants: readonly string[];
  references: readonly {
    field: 'historical' | 'context' | 'terminology';
    reference: LibraryReference;
  }[];
};

const kukkiwonHistoryRef: LibraryReference = {
  institution: 'Kukkiwon',
  title: 'History of Taekwondo — Modern Taekwondo History',
  edition: 'Portal institucional em inglês (consulta em 2026-11-18)',
  url: 'https://www.kukkiwon.or.kr/eng/contents/view?contentsNo=93&menuLevel=2&menuNo=94',
  locator: 'The fruit of unity (1961–1970) — associação unificada e promulgação inicial de Poomsae',
};

const kukkiwonPoomsaeBoardRef: LibraryReference = {
  institution: 'Kukkiwon',
  title: 'Composition of Taekwondo — Poomsae',
  edition: 'Portal institucional em inglês (consulta em 2026-11-18)',
  url: 'https://www.kukkiwon.or.kr/eng/board/list?boardManagementNo=55&menuLevel=3&menuNo=72',
  locator: 'Board 55 — coleção institucional vigente (Taegeuk 1–8 Jang e formas Dan)',
};

const kukkiwonCurriculumRef: LibraryReference = {
  institution: 'Kukkiwon Taekwondo Research',
  title: 'Skill classification for Taekwondo curricula',
  edition: 'Journal article 55579',
  url: 'https://research.kukkiwon.or.kr/board/journal/article/55579',
  locator: 'Article 55579 — organização curricular por escolas',
};

const formNumbers = [1, 2, 3, 4, 5, 6, 7, 8] as const;

const ordinalNames: Record<(typeof formNumbers)[number], { kr: string; pt: string }> = {
  1: { kr: 'Il', pt: 'Primeira forma histórica da coleção Palgwae' },
  2: { kr: 'I', pt: 'Segunda forma histórica da coleção Palgwae' },
  3: { kr: 'Sam', pt: 'Terceira forma histórica da coleção Palgwae' },
  4: { kr: 'Sa', pt: 'Quarta forma histórica da coleção Palgwae' },
  5: { kr: 'O', pt: 'Quinta forma histórica da coleção Palgwae' },
  6: { kr: 'Yuk', pt: 'Sexta forma histórica da coleção Palgwae' },
  7: { kr: 'Chil', pt: 'Sétima forma histórica da coleção Palgwae' },
  8: { kr: 'Pal', pt: 'Oitava forma histórica da coleção Palgwae' },
};

export const palgwaeEntries: readonly PalgwaeEntry[] = [
  {
    slug: 'palgwae-contexto-historico',
    title: 'Coleção Palgwae',
    subtitle: 'Contexto histórico pré-Taegeuk e uso complementar em escolas',
    kind: 'context',
    relatedTaegeukSlug: 'taegeuk-1-jang',
    relatedTaegeukLabel: 'Taegeuk 1 Jang',
    summary:
      'A série Palgwae integra a história da sistematização de formas no Taekwondo antes da consolidação definitiva da série Taegeuk pela Kukkiwon. Na história institucional (1961–1970), a Kukkiwon registra a promulgação inicial de Poomsae em nível associativo para exames unificados; hoje, porém, o portal oficial de Poomsae da Kukkiwon publica como coleção vigente os oito Taegeuk (1–8 Jang) e as nove formas Dan (Koryo a Ilyeo).',
    historicalContext:
      'Diversas escolas e mestres preservam o ensino de Palgwae 1 a 8 como patrimônio técnico-histórico ou requisito complementar de graduação. Por não integrar a listagem vigente do Board 55 da Kukkiwon e por apresentar variações de transmissão entre linhagens, a plataforma separa Palgwae da coleção Taegeuk e não inventa contagens universais de passos.',
    studyPoints: [
      'Diferenciar em exames e estudos a série vigente Taegeuk (padronizada no Board 55 da Kukkiwon) da coleção histórica Palgwae.',
      'Confirmar com o professor se a sua escola adota Palgwae como conteúdo obrigatório, complementar ou apenas histórico.',
      'Usar o editor de Currículos para registrar exatamente em qual faixa cada forma Palgwae é cobrada na escola, sem assumir tabela universal.',
    ],
    variants: ['Palgwae Poomsae', 'Palgwe', 'Pal Gwae', 'Formas históricas pré-Taegeuk'],
    references: [
      { field: 'historical', reference: kukkiwonHistoryRef },
      { field: 'context', reference: kukkiwonPoomsaeBoardRef },
      { field: 'terminology', reference: kukkiwonCurriculumRef },
    ],
  },
  ...formNumbers.map((n): PalgwaeEntry => {
    const ord = ordinalNames[n];
    return {
      slug: `palgwae-${n}-jang`,
      title: `Palgwae ${n} Jang`,
      subtitle: `${ord.pt} · transmissão histórica em currículos escolares`,
      kind: 'form',
      number: n,
      relatedTaegeukSlug: `taegeuk-${n}-jang`,
      relatedTaegeukLabel: `Taegeuk ${n} Jang`,
      summary: `Palgwae ${n} Jang pertence à coleção histórica de oito formas desenvolvida na fase associativa anterior à consolidação atual dos oito Taegeuk pela Kukkiwon. Em escolas que preservam a série Palgwae, esta forma é estudada de acordo com a linhagem técnica do mestre e vinculada à graduação definida pelo dojang.`,
      historicalContext: `O portal institucional atual da Kukkiwon (Board 55) lista Taegeuk ${n} Jang na coleção vigente de graduações coloridas e não publica diagrama ou sequência oficial para Palgwae ${n} Jang. Por fidelidade documental, esta ficha registra o contexto histórico e apoia a organização curricular da escola sem atribuir passos padronizados à Kukkiwon.`,
      studyPoints: [
        `Não confundir a abertura, o ritmo e as direções de Palgwae ${n} Jang com a sequência de Taegeuk ${n} Jang.`,
        'Registrar no caderno de Meu Estudo as observações de base, altura de defesa e kihap transmitidas pelo seu professor.',
        'Caso a sua escola cobre esta forma em exame de faixa, consulte no currículo escolar a graduação correspondente e eventuais variações de linhagem.',
      ],
      variants: [
        `Palgwae ${n}`,
        `Palgwae ${ord.kr} Jang`,
        `Palgwe ${n} Jang`,
        `Pal Gwae ${n}`,
      ],
      references: [
        { field: 'historical', reference: kukkiwonHistoryRef },
        { field: 'context', reference: kukkiwonPoomsaeBoardRef },
      ],
    };
  }),
];

export function getPalgwaeEntry(slug: string): PalgwaeEntry | undefined {
  return palgwaeEntries.find((entry) => entry.slug === slug);
}
