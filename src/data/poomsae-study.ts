export type StudyDirection = 'ga' | 'na' | 'da1' | 'ra1' | 'da2' | 'ra2' | 'da3' | 'ra3';

export const studyDirections: Record<StudyDirection, { label: string; arrow: string; angle: number }> = {
  ga: { label: 'Ga', arrow: '↓', angle: 90 },
  na: { label: 'Na', arrow: '↑', angle: -90 },
  da1: { label: 'Da 1', arrow: '→', angle: 0 },
  ra1: { label: 'Ra 1', arrow: '←', angle: 180 },
  da2: { label: 'Da 2', arrow: '→', angle: 0 },
  ra2: { label: 'Ra 2', arrow: '←', angle: 180 },
  da3: { label: 'Da 3', arrow: '→', angle: 0 },
  ra3: { label: 'Ra 3', arrow: '←', angle: 180 },
};

export type StudyLink = { label: string; href: string };

const body = '/biblioteca/kibon-dongjak/';
const ready = { label: 'Gibon-junbi', href: body + 'gibon-junbi' };
const walking = { label: 'Ap-seogi', href: body + 'ap-seogi' };
const long = { label: 'Apgubi', href: body + 'apgubi' };
const frontKick = { label: 'Ap-chagi', href: '/biblioteca/balkisul/ap-chagi' };
const lowBlock = { label: 'Defesa descendente · Naeryeo-makgi', href: body + 'naeryeo-makgi' };
const innerBlock = { label: 'Defesa para dentro · An-makgi', href: body + 'an-makgi' };
const highBlock = { label: 'Defesa ascendente · Ollyeo-makgi', href: body + 'ollyeo-makgi' };
const fist = { label: 'Punho · Jumeok', href: '/biblioteca/sonkisul/jumeok' };

const studySource = {
  institution: 'Kukkiwon · Education Media Center',
  title: 'Taegeuk 1 Jang',
  edition: 'Lâminas reproduzidas em Taekwondo — Vocabulario Completo, v20',
  url: 'https://www.santafemarcial.com.ar/taekwondo/tkd-vocabulario-completo-v20.pdf',
  sourceCheckedAt: '2026-11-21',
  reviewState: 'Revisão docente pendente',
} as const;

export type StudyMovement = {
  number: number;
  title: string;
  direction: StudyDirection;
  description: string;
  base: StudyLink;
  lead: 'Esquerda' | 'Direita';
  related: readonly StudyLink[];
  citation: { page: number; locator: string };
};

type StudyBoundary = {
  title: string;
  direction: StudyDirection;
  base: StudyLink;
  citation: StudyMovement['citation'];
};

export type PoomsaeStudy = {
  slug: string;
  hangul: string;
  meaning: string;
  identityUrl: string;
  movements: readonly StudyMovement[];
  readingNote: string;
  source: {
    institution: string;
    title: string;
    edition: string;
    url: string;
    sourceCheckedAt: string;
    reviewState: string;
  };
  start: StudyBoundary;
  finish: StudyBoundary;
};

export const taegeukOneStudy = {
  slug: 'taegeuk-1-jang',
  source: studySource,
  readingNote: 'Os dois quadros dos movimentos 14 e 16 aparecem juntos na contagem da fonte.',
  hangul: '태극 1장',
  meaning: 'Primeira forma da série Taegeuk',
  identityUrl: 'https://www.kukkiwon.or.kr/base/board/read?boardManagementNo=37&boardNo=980&menuLevel=3&menuNo=62&page=2',
  start: { title: 'Preparação', direction: 'ga', base: ready, citation: { page: 53, locator: '준비' } },
  finish: { title: 'Retorno à preparação', direction: 'ga', base: ready, citation: { page: 64, locator: '바로' } },
  movements: [
    {
      number: 1, title: 'Defesa baixa', direction: 'da1',
      description: 'A primeira linha lateral se abre com Arae-makgi.',
      base: walking, lead: 'Esquerda', related: [lowBlock], citation: { page: 53, locator: '1' },
    },
    {
      number: 2, title: 'Soco médio', direction: 'da1',
      description: 'O avanço continua na mesma linha com Momtong-bandae-jireugi.',
      base: walking, lead: 'Direita', related: [fist], citation: { page: 54, locator: '2' },
    },
    {
      number: 3, title: 'Defesa baixa', direction: 'ra1',
      description: 'A sequência muda para o outro lado da primeira linha com Arae-makgi.',
      base: walking, lead: 'Direita', related: [lowBlock], citation: { page: 54, locator: '3' },
    },
    {
      number: 4, title: 'Soco médio', direction: 'ra1',
      description: 'Momtong-bandae-jireugi completa a primeira linha lateral.',
      base: walking, lead: 'Esquerda', related: [fist], citation: { page: 55, locator: '4' },
    },
    {
      number: 5, title: 'Defesa baixa', direction: 'ga',
      description: 'A forma volta ao eixo central e passa à base Apgubi com Arae-makgi.',
      base: long, lead: 'Esquerda', related: [lowBlock], citation: { page: 55, locator: '5' },
    },
    {
      number: 6, title: 'Soco médio', direction: 'ga',
      description: 'Momtong-baro-jireugi segue na mesma base, com os pés no lugar.',
      base: long, lead: 'Esquerda', related: [fist], citation: { page: 56, locator: '6' },
    },
    {
      number: 7, title: 'Defesa média para dentro', direction: 'ra2',
      description: 'Momtong-an-makgi abre a segunda linha lateral.',
      base: walking, lead: 'Direita', related: [innerBlock], citation: { page: 56, locator: '7' },
    },
    {
      number: 8, title: 'Soco médio', direction: 'ra2',
      description: 'O avanço segue na mesma direção com Momtong-baro-jireugi.',
      base: walking, lead: 'Esquerda', related: [fist], citation: { page: 57, locator: '8' },
    },
    {
      number: 9, title: 'Defesa média para dentro', direction: 'da2',
      description: 'A forma muda de lado na segunda linha com Momtong-an-makgi.',
      base: walking, lead: 'Esquerda', related: [innerBlock], citation: { page: 57, locator: '9' },
    },
    {
      number: 10, title: 'Soco médio', direction: 'da2',
      description: 'Momtong-baro-jireugi fecha a segunda linha lateral.',
      base: walking, lead: 'Direita', related: [fist], citation: { page: 58, locator: '10' },
    },
    {
      number: 11, title: 'Defesa baixa', direction: 'ga',
      description: 'O eixo central volta a aparecer com Arae-makgi em Apgubi.',
      base: long, lead: 'Direita', related: [lowBlock], citation: { page: 58, locator: '11' },
    },
    {
      number: 12, title: 'Soco médio', direction: 'ga',
      description: 'Momtong-baro-jireugi segue com a base e a direção do movimento 11.',
      base: long, lead: 'Direita', related: [fist], citation: { page: 59, locator: '12' },
    },
    {
      number: 13, title: 'Defesa alta', direction: 'da3',
      description: 'Olgul-makgi abre a terceira linha lateral.',
      base: walking, lead: 'Esquerda', related: [highBlock], citation: { page: 59, locator: '13' },
    },
    {
      number: 14, title: 'Chute frontal e soco médio', direction: 'da3',
      description: 'O quadro 14-1 mostra o Ap-chagi com a perna direita. No 14-2, o pé direito está à frente em Ap-seogi e o Momtong-bandae-jireugi é com o punho direito.',
      base: walking, lead: 'Direita', related: [frontKick, fist], citation: { page: 60, locator: '14-1 e 14-2' },
    },
    {
      number: 15, title: 'Defesa alta', direction: 'ra3',
      description: 'Olgul-makgi reaparece do outro lado da terceira linha.',
      base: walking, lead: 'Direita', related: [highBlock], citation: { page: 61, locator: '15' },
    },
    {
      number: 16, title: 'Chute frontal e soco médio', direction: 'ra3',
      description: 'O quadro 16-1 mostra o Ap-chagi com a perna esquerda. No 16-2, o pé esquerdo está à frente em Ap-seogi e o Momtong-bandae-jireugi é com o punho esquerdo.',
      base: walking, lead: 'Esquerda', related: [frontKick, fist], citation: { page: 61, locator: '16-1 (16-2 na p. 62)' },
    },
    {
      number: 17, title: 'Defesa baixa', direction: 'na',
      description: 'O retorno pelo eixo central começa com Arae-makgi em Apgubi.',
      base: long, lead: 'Esquerda', related: [lowBlock], citation: { page: 62, locator: '17 (vista lateral na p. 63)' },
    },
    {
      number: 18, title: 'Soco médio com kihap', direction: 'na',
      description: 'Momtong-bandae-jireugi com kihap encerra a contagem, antes do retorno à preparação.',
      base: long, lead: 'Direita', related: [fist], citation: { page: 63, locator: '18 (vista lateral na p. 64)' },
    },
  ],
} satisfies PoomsaeStudy;
