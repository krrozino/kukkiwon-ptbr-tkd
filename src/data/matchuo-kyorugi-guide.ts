import type { LibraryReference } from '../lib/library';
import { kukkiwonSparringReference } from './movement-sources';

export type MatchuoEntry = {
  slug: string;
  title: string;
  subtitle: string;
  kindLabel: string;
  modalityKey?: 'sebon' | 'dubon' | 'hanbon' | 'anjoa';
  stepCountLabel?: string;
  atlasRegion: 'arms' | 'hands' | 'feet' | 'legs' | 'torso';
  atlasLabel: string;
  summary: string;
  pedagogicalFocus: readonly string[];
  variants: readonly string[];
  acervoHref?: string;
  acervoLabel?: string;
  references: readonly {
    field: 'context' | 'historical' | 'terminology';
    reference: LibraryReference;
  }[];
  relatedLibrarySlugs: readonly string[];
};

const wtaMasterCourseRef: LibraryReference = {
  institution: 'World Taekwondo Academy (Kukkiwon)',
  title: 'Master Course Training Process — Gyeorugi',
  edition: 'Portal institucional WTA (consulta em 2026-11-18)',
  url: 'https://wta.kukkiwon.or.kr/en/trainingProcess/masterCourse?lang=en&topMenuid=1072',
  locator: 'Training Process > Master Course — ensino de Gyeorugi distinto de regulamento esportivo',
};

const cbtkdHistoricalExamRef: LibraryReference = {
  institution: 'CBTKD (registro histórico)',
  title: 'Regulamento Geral de Exame de Faixa',
  edition: 'Documento histórico arquivado (2016)',
  url: 'https://fetese.com.br/uploads/2016/01/14/downloads/regulamento-geral-de-exame-de-faixa-cbtkd.pdf',
  locator: 'Exame prático — menção histórica à grafia "Matcho Kyorugui"',
};

const kukkiwonCurriculumRef: LibraryReference = {
  institution: 'Kukkiwon Taekwondo Research',
  title: 'Skill classification for Taekwondo curricula',
  edition: 'Journal article 55579',
  url: 'https://research.kukkiwon.or.kr/board/journal/article/55579',
  locator: 'Article 55579 — organização progressiva de habilidades no currículo escolar',
};

function stepModality(card: Omit<MatchuoEntry, 'kindLabel'>): MatchuoEntry {
  return { ...card, kindLabel: 'Modalidade em passos' };
}

export const matchuoEntries: readonly MatchuoEntry[] = [
  {
    slug: 'matchuo-kyorugi-fundamentos',
    title: 'Matchuo Kyorugi',
    subtitle: 'Combate combinado predefinido — método de estudo entre parceiros',
    kindLabel: 'Conceito e método',
    atlasRegion: 'torso',
    atlasLabel: 'Tronco, distância e alturas de alvo',
    summary:
      'O combate combinado reúne exercícios predefinidos entre atacante e defensor para desenvolver distância, tempo de reação, precisão de alvo (Arae, Momtong, Olgul) e controle antes da luta livre. Diferencia-se do Kyorugi esportivo porque prioriza cooperação técnica, segurança e progressão pedagógica definida pelo currículo de cada escola.',
    pedagogicalFocus: [
      'Estabelecer distância segura (medida inicial) e sinal claro de preparação antes do primeiro ataque.',
      'Separar o objetivo marcial do exercício predefinido das regras de pontuação do Kyorugi competitivo da World Taekwondo.',
      'Respeitar a nomenclatura e a numeração adotadas pelo professor: a Kukkiwon documenta as famílias técnicas (Makgi, Jireugi, Chigi, Chagi, Pihagi, Kkeokgi), enquanto cada escola organiza suas sequências numeradas.',
    ],
    variants: [
      'Matchwo Gyeorugi',
      'Matcho Kyorugui',
      'Machuo Kyorugi',
      'Combate combinado',
      'Luta combinada predefinida',
    ],
    references: [
      { field: 'context', reference: wtaMasterCourseRef },
      { field: 'historical', reference: cbtkdHistoricalExamRef },
      { field: 'terminology', reference: kukkiwonCurriculumRef },
    ],
    relatedLibrarySlugs: ['sebon-kyorugi', 'dubon-kyorugi', 'hanbon-kyorugi'],
  },
  stepModality({
    slug: 'sebon-kyorugi',
    title: 'Sebon Kyorugi',
    subtitle: 'Combate combinado em três passos — cadência, recuo e contra-ataque',
    modalityKey: 'sebon',
    stepCountLabel: '3 tempos de ataque e defesa',
    atlasRegion: 'arms',
    atlasLabel: 'Antebraços e punhos em defesas e contra-ataques',
    summary:
      'Modalidade didática em que o atacante avança em três ações sucessivas combinadas e o defensor recua ou desloca-se bloqueando cada tempo antes de executar o contra-ataque final. É amplamente utilizada nas graduações iniciais e intermediárias para consolidar bases (Seogi), alturas de bloqueio (Makgi) e sincronismo entre parceiros.',
    pedagogicalFocus: [
      'Manter comprimento e estabilidade da base nos três recuos, evitando cruzar os pés ou perder o alinhamento do tronco.',
      'Calibrar a altura real de cada ataque e bloqueio (alta, média ou baixa) antes de acelerar o ritmo.',
      'Organizar os intervalos numerados conforme a sua escola (por exemplo, Sebon 1 a 5 em uma faixa e Sebon 1 a 10 em outra), sem assumir sequência única universal.',
    ],
    variants: [
      'Sebon Gyeorugi',
      'Sambo Kyorugi',
      'Sambo Daeryeon',
      'Luta combinada de 3 passos',
    ],
    acervoHref: '/acervo?categoria=defesa',
    acervoLabel: 'Consultar defesas (Makgi) em revisão no Acervo',
    references: [
      { field: 'context', reference: kukkiwonSparringReference(1365, 'Makgi') },
      { field: 'context', reference: kukkiwonSparringReference(1366, 'Jireugi') },
      { field: 'historical', reference: cbtkdHistoricalExamRef },
    ],
    relatedLibrarySlugs: ['matchuo-kyorugi-fundamentos', 'dubon-kyorugi', 'jumeok'],
  }),
  stepModality({
    slug: 'dubon-kyorugi',
    title: 'Dubon Kyorugi',
    subtitle: 'Combate combinado em dois passos — transição rítmica e resposta rápida',
    modalityKey: 'dubon',
    stepCountLabel: '2 tempos de ataque e defesa',
    atlasRegion: 'feet',
    atlasLabel: 'Pés e pernas na transição para contra-ataques',
    summary:
      'Modalidade combinada em dois ataques consecutivos que reduz o tempo de leitura entre o deslocamento inicial e o contra-ataque. Em currículos escolares, costuma suceder ou complementar o Sebon Kyorugi, aproximando o praticante da fluidez exigida em combinações de mãos e chutes.',
    pedagogicalFocus: [
      'Conectar o primeiro bloqueio imediatamente à transição para o segundo tempo, sem pausas artificiais.',
      'Integrar superfícies de mão (Sonkisul) e chutes (Chagi) conforme os exercícios numerados pelo professor.',
      'Preservar controle de distância na finalização para demonstrar precisão técnica sem impacto excessivo.',
    ],
    variants: [
      'Dubon Gyeorugi',
      'Ibo Kyorugi',
      'Ibo Daeryeon',
      'Luta combinada de 2 passos',
    ],
    acervoHref: '/acervo?categoria=chute',
    acervoLabel: 'Consultar família de chutes (Chagi) no Acervo',
    references: [
      { field: 'context', reference: kukkiwonSparringReference(1365, 'Makgi') },
      { field: 'context', reference: kukkiwonSparringReference(1368, 'Chagi') },
      { field: 'context', reference: wtaMasterCourseRef },
    ],
    relatedLibrarySlugs: ['sebon-kyorugi', 'hanbon-kyorugi', 'sonnal'],
  }),
  stepModality({
    slug: 'hanbon-kyorugi',
    title: 'Hanbon Kyorugi',
    subtitle: 'Combate combinado em um passo — esquiva, precisão e resposta imediata',
    modalityKey: 'hanbon',
    stepCountLabel: '1 ataque e resposta imediata',
    atlasRegion: 'hands',
    atlasLabel: 'Mãos, punhos e superfícies de precisão',
    summary:
      'Modalidade predefinida de um único ataque na qual o defensor reage imediatamente com saída de linha (Pihagi), bloqueio (Makgi), golpe de precisão (Chigi / Jireugi), chute (Chagi) ou controle articular (Kkeokgi). Exige domínio agudo de tempo, ângulo de esquiva e escolha da superfície anatômica adequada.',
    pedagogicalFocus: [
      'Sair da linha central de ataque com deslocamento econômico (Pihagi) em vez de depender apenas de força de impacto no bloqueio.',
      'Selecionar com clareza a superfície anatômica do contra-ataque (por exemplo, Sonnal, Batangson, Pyojuk ou Apchuk) conforme a orientação do mestre.',
      'Finalizar com equilíbrio postural e distância controlada.',
    ],
    variants: [
      'Hanbon Gyeorugi',
      'Ilbo Kyorugi',
      'Ilbo Daeryeon',
      'One-step sparring',
      'Luta combinada de 1 passo',
    ],
    acervoHref: '/acervo?categoria=chigi',
    acervoLabel: 'Consultar golpes (Chigi) em revisão no Acervo',
    references: [
      { field: 'context', reference: kukkiwonSparringReference(1371, 'Pihagi') },
      { field: 'context', reference: kukkiwonSparringReference(1367, 'Chigi') },
      { field: 'context', reference: kukkiwonSparringReference(1370, 'Kkeokgi') },
    ],
    relatedLibrarySlugs: ['dubon-kyorugi', 'sonnal', 'batangson'],
  }),
  {
    slug: 'anjoa-kyorugi',
    title: 'Anjoa Kyorugi',
    subtitle: 'Combate combinado sentado ou em postura baixa nos currículos escolares',
    kindLabel: 'Modalidade adaptada',
    modalityKey: 'anjoa',
    stepCountLabel: 'Defesa e resposta a partir de base baixa / sentada',
    atlasRegion: 'arms',
    atlasLabel: 'Braços, rotação de tronco e alavancas curtas',
    summary:
      'Prática complementar adotada em diversos currículos escolares na qual um ou ambos os parceiros iniciam o exercício em postura sentada ou ajoelhada. Trabalha geração de força em curta distância, rotação de quadril e tronco, defesas angulares e transições rápidas para controle ou levantamento seguro.',
    pedagogicalFocus: [
      'Proteger joelhos e tornozelos durante giros e levantamentos em postura baixa, respeitando a mobilidade de cada aluno.',
      'Usar rotação do eixo corporal e alinhamento do punho/faca da mão quando não há impulso completo de passada.',
      'Seguir estritamente a numeração e as adaptações de segurança ensinadas pelo professor da sua escola.',
    ],
    variants: [
      'Anja Kyorugi',
      'Anjoa Gyeorugi',
      'Combate combinado sentado',
      'Defesa sentada predefinida',
    ],
    references: [
      { field: 'context', reference: kukkiwonSparringReference(1365, 'Makgi') },
      { field: 'context', reference: kukkiwonSparringReference(1370, 'Kkeokgi') },
      { field: 'terminology', reference: kukkiwonCurriculumRef },
    ],
    relatedLibrarySlugs: ['sebon-kyorugi', 'ppaegi-kkeokgi-aplicacoes', 'batangson'],
  },
  {
    slug: 'ppaegi-kkeokgi-aplicacoes',
    title: 'Ppaegi, Kkeokgi e Neomgigi',
    subtitle: 'Saída de pegadas, controles articulares e desequilíbrios nas famílias Kukkiwon',
    kindLabel: 'Transição para defesa pessoal',
    atlasRegion: 'arms',
    atlasLabel: 'Punhos, cotovelos e alavancas articulares',
    summary:
      'Além de bloqueios, socos e chutes, a classificação institucional de técnicas de combate da Kukkiwon (Board 56) descreve famílias específicas para saída de agarramentos (Ppaegi), controles articulares (Kkeokgi), projeções/desequilíbrios (Neomgigi) e amortecimento de quedas (Nakbeop), frequentemente treinadas de modo predefinido em dupla.',
    pedagogicalFocus: [
      'Aplicar controles articulares (Kkeokgi) de forma progressiva e cooperativa, respeitando o sinal imediato do parceiro.',
      'Associar treinos de desequilíbrio (Neomgigi) ao domínio prévio de amortecimento de quedas (Nakbeop) sobre tatame adequado.',
      'Compreender a direção anatômica do polegar e do punho nas saídas de pegada (Ppaegi) usando o Atlas da mão como apoio.',
    ],
    variants: [
      'Ppaegi (saída de pegada)',
      'Kkeokgi (controle articular)',
      'Neomgigi (desequilíbrio e projeção)',
      'Nakbeop (queda segura)',
      'Hosinsul (defesa pessoal no ensino)',
    ],
    acervoHref: '/acervo',
    acervoLabel: 'Consultar controles e projeções provisórios no Acervo',
    references: [
      { field: 'context', reference: kukkiwonSparringReference(1369, 'Ppaegi') },
      { field: 'context', reference: kukkiwonSparringReference(1370, 'Kkeokgi') },
      { field: 'context', reference: kukkiwonSparringReference(1372, 'Neomgigi') },
      { field: 'context', reference: kukkiwonSparringReference(1373, 'Nakbeop') },
    ],
    relatedLibrarySlugs: ['matchuo-kyorugi-fundamentos', 'ageumson', 'sonnal'],
  },
];

export function getMatchuoEntry(slug: string): MatchuoEntry | undefined {
  return matchuoEntries.find((entry) => entry.slug === slug);
}
