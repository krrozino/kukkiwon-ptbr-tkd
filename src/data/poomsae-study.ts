export type StudyDirection = 'ga' | 'na' | 'da1' | 'ra1' | 'da2' | 'ra2' | 'da3' | 'ra3';

const initialHeadings = {
  left: { heading: 'Esquerda', arrow: '←', angle: 180 },
  right: { heading: 'Direita', arrow: '→', angle: 0 },
  front: { heading: 'Frente', arrow: '↑', angle: -90 },
  back: { heading: 'Trás', arrow: '↓', angle: 90 },
} as const;

// Quadro de preparação, p. 53: a posição inicial é Na, olhando para Ga.
// Os códigos permanecem os das lâminas; as setas usam essa orientação inicial.
export const studyDirections = {
  ga: { label: 'Ga', ...initialHeadings.front },
  na: { label: 'Na', ...initialHeadings.back },
  da1: { label: 'Da 1', ...initialHeadings.left },
  ra1: { label: 'Ra 1', ...initialHeadings.right },
  da2: { label: 'Da 2', ...initialHeadings.left },
  ra2: { label: 'Ra 2', ...initialHeadings.right },
  da3: { label: 'Da 3', ...initialHeadings.left },
  ra3: { label: 'Ra 3', ...initialHeadings.right },
} satisfies Record<StudyDirection, { label: string } & typeof initialHeadings[keyof typeof initialHeadings]>;

export function studyDirectionLabel(direction: StudyDirection) {
  const { heading, label } = studyDirections[direction];
  return heading + ' (' + label + ')';
}

export type StudyLink = { label: string; href: string };
export type StudyTerm = { label: string; href: string | null; hangul?: string };

export type StudyReference = {
  institution: string;
  title: string;
  url: string;
  locator: string;
  page?: number;
  edition?: string;
  sourceCheckedAt?: string;
};

export type StudyFrame = {
  id: string;
  label: string;
  hangul?: string;
  romanization?: string;
  kind?: string;
  executor?: string;
  reference: StudyReference;
  additionalReferences?: readonly StudyReference[];
  link?: StudyLink;
};

const body = '/biblioteca/kibon-dongjak/';
const ready = { label: 'Gibon-junbi', href: body + 'gibon-junbi' };
const walking = { label: 'Ap-seogi', href: body + 'ap-seogi' };
const long = { label: 'Apgubi', href: body + 'apgubi' };
const frontKick = { label: 'Ap-chagi', href: '/biblioteca/balkisul/ap-chagi' };
const fist = { label: 'Superfície relacionada · Jumeok', href: '/biblioteca/sonkisul/jumeok' };

const studySource = {
  institution: 'Kukkiwon · Education Media Center',
  title: 'Taegeuk 1 Jang',
  edition: 'Lâminas reproduzidas em Taekwondo — Vocabulario Completo, v20',
  url: 'https://www.santafemarcial.com.ar/taekwondo/tkd-vocabulario-completo-v20.pdf',
  sourceCheckedAt: '2026-11-22',
  reviewState: 'Revisão docente pendente',
} as const;

const techniques = {
  lowBlock: { label: 'Defesa baixa', romanization: 'Arae-makgi', hangul: '아래막기', kind: 'Defesa' },
  innerBlock: { label: 'Defesa média para dentro', romanization: 'Momtong-an-makgi', hangul: '몸통안막기', kind: 'Defesa' },
  highBlock: { label: 'Defesa alta', romanization: 'Olgul-makgi', hangul: '얼굴막기', kind: 'Defesa' },
  bandae: { label: 'Soco médio', romanization: 'Momtong-bandae-jireugi', hangul: '몸통반대지르기', kind: 'Ataque', link: fist },
  baro: { label: 'Soco médio', romanization: 'Momtong-baro-jireugi', hangul: '몸통바로지르기', kind: 'Ataque', link: fist },
  kick: { label: 'Chute frontal', romanization: 'Ap-chagi', hangul: '앞차기', kind: 'Ataque', link: frontKick },
} as const;

function frame(id: string, page: number, technique: keyof typeof techniques, executor: string): StudyFrame {
  const { institution, title, url } = studySource;
  return {
    id,
    ...techniques[technique],
    executor,
    reference: { institution, title, url, page, locator: 'quadro ' + id },
  };
}

export type StudyMovement = {
  number: number;
  title: string;
  direction: StudyDirection;
  displacement?: string;
  description?: string | null;
  base?: StudyTerm;
  baseSide?: 'Esquerda' | 'Direita';
  leadFoot?: 'Esquerdo' | 'Direito';
  initialPosition?: string;
  bodyOrientation?: string;
  rotation?: string;
  finalPosition?: string;
  kihap?: boolean;
  frames: readonly StudyFrame[];
  references?: readonly StudyReference[];
  transitionPending?: boolean;
  discrepancy?: { note?: string; variants: readonly { summary: string; reference: StudyReference }[] };
  reviewPoints?: readonly string[];
};

type StudyBoundary = {
  title: string;
  direction: StudyDirection;
  position?: StudyDirection;
  displacement?: string;
  base: StudyTerm;
  stance?: StudyTerm;
  citation: { page: number; locator: string };
};

export type PoomsaeStudy = {
  slug: string;
  hangul: string;
  meaning: string;
  identityUrl: string;
  identityLocator: string;
  trigramHangul: string;
  family?: string;
  romanization?: string;
  references?: readonly StudyReference[];
  demonstration?: {
    description: string;
    recording: StudyLink;
    lesson: StudyLink & { credit: string };
    embed: { url: string; title: string };
  };
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
  family: 'Taegeuk',
  identityLocator: 'Board 37, nº 980',
  trigramHangul: '건',
  demonstration: {
    description: 'Assista à forma completa da Enciclopédia Digital da Kukkiwon, publicada pela Mookas TV em 2019.',
    recording: { label: 'Demonstração completa na Mookas TV', href: 'https://www.mookas.com/news/17083' },
    lesson: {
      label: 'Aula da Kukkiwon no YouTube', href: 'https://www.youtube.com/watch?v=__4pltpaPJo',
      credit: 'Kukkiwon / World Taekwondo Academy, 2025',
    },
    embed: {
      url: 'https://www.youtube-nocookie.com/embed/T6J2C1QJLts',
      title: 'Taegeuk 1 Jang — demonstração completa da Enciclopédia Digital da Kukkiwon',
    },
  },
  source: studySource,
  readingNote: 'Os dois quadros dos movimentos 14 e 16 aparecem juntos na contagem da fonte.',
  hangul: '태극 1장',
  meaning: 'Primeira forma da série Taegeuk',
  identityUrl: 'https://www.kukkiwon.or.kr/base/board/read?boardManagementNo=37&boardNo=980&menuLevel=3&menuNo=62&page=2',
  start: {
    title: 'Preparação', position: 'na', direction: 'ga', base: ready,
    citation: { page: 53, locator: '준비' },
  },
  finish: {
    title: 'Retorno à preparação', position: 'na', direction: 'ga', base: ready,
    displacement: 'Mantém o pé direito no lugar e recolhe o esquerdo, girando para a esquerda.',
    citation: { page: 64, locator: '바로' },
  },
  movements: [
    {
      number: 1, title: 'Defesa baixa', direction: 'da1',
      description: 'A primeira linha lateral se abre com Arae-makgi.',
      displacement: 'Avança o pé esquerdo em direção a Da 1.',
      base: walking, baseSide: 'Esquerda', leadFoot: 'Esquerdo',
      frames: [frame('1', 53, 'lowBlock', 'Braço esquerdo')],
    },
    {
      number: 2, title: 'Soco médio', direction: 'da1',
      description: 'O avanço continua na mesma linha com Momtong-bandae-jireugi.',
      displacement: 'Avança o pé direito em direção a Da 1.',
      base: walking, baseSide: 'Direita', leadFoot: 'Direito',
      frames: [frame('2', 54, 'bandae', 'Punho direito')],
    },
    {
      number: 3, title: 'Defesa baixa', direction: 'ra1',
      description: 'A sequência muda para o outro lado da primeira linha com Arae-makgi.',
      displacement: 'Avança o pé direito em direção a Ra 1.',
      base: walking, baseSide: 'Direita', leadFoot: 'Direito',
      frames: [frame('3', 54, 'lowBlock', 'Braço direito')],
    },
    {
      number: 4, title: 'Soco médio', direction: 'ra1',
      description: 'Momtong-bandae-jireugi completa a primeira linha lateral.',
      displacement: 'Avança o pé esquerdo em direção a Ra 1.',
      base: walking, baseSide: 'Esquerda', leadFoot: 'Esquerdo',
      frames: [frame('4', 55, 'bandae', 'Punho esquerdo')],
    },
    {
      number: 5, title: 'Defesa baixa', direction: 'ga',
      description: 'A forma volta ao eixo central e passa à base Apgubi com Arae-makgi.',
      displacement: 'Move o pé esquerdo em direção a Ga e gira para essa direção.',
      base: long, baseSide: 'Esquerda', leadFoot: 'Esquerdo',
      frames: [frame('5', 55, 'lowBlock', 'Braço esquerdo')],
    },
    {
      number: 6, title: 'Soco médio', direction: 'ga',
      description: 'Momtong-baro-jireugi segue na mesma base, com os pés no lugar.',
      displacement: 'Ambos os pés permanecem no lugar.',
      base: long, baseSide: 'Esquerda', leadFoot: 'Esquerdo',
      frames: [frame('6', 56, 'baro', 'Punho direito')],
    },
    {
      number: 7, title: 'Defesa média para dentro', direction: 'ra2',
      description: 'Momtong-an-makgi abre a segunda linha lateral.',
      displacement: 'Leva o pé direito em direção a Ra 2 e apoia-o no chão.',
      base: walking, baseSide: 'Direita', leadFoot: 'Direito',
      frames: [frame('7', 56, 'innerBlock', 'Braço esquerdo')],
    },
    {
      number: 8, title: 'Soco médio', direction: 'ra2',
      description: 'O avanço segue na mesma direção com Momtong-baro-jireugi.',
      displacement: 'Avança o pé esquerdo em direção a Ra 2.',
      base: walking, baseSide: 'Esquerda', leadFoot: 'Esquerdo',
      frames: [frame('8', 57, 'baro', 'Punho direito')],
    },
    {
      number: 9, title: 'Defesa média para dentro', direction: 'da2',
      description: 'A forma muda de lado na segunda linha com Momtong-an-makgi.',
      displacement: 'Move o pé esquerdo em direção a Da 2 e gira para trás.',
      base: walking, baseSide: 'Esquerda', leadFoot: 'Esquerdo',
      frames: [frame('9', 57, 'innerBlock', 'Braço direito')],
    },
    {
      number: 10, title: 'Soco médio', direction: 'da2',
      description: 'Momtong-baro-jireugi fecha a segunda linha lateral.',
      displacement: 'Avança o pé direito em direção a Da 2.',
      base: walking, baseSide: 'Direita', leadFoot: 'Direito',
      frames: [frame('10', 58, 'baro', 'Punho esquerdo')],
    },
    {
      number: 11, title: 'Defesa baixa', direction: 'ga',
      description: 'O eixo central volta a aparecer com Arae-makgi em Apgubi.',
      displacement: 'Move o pé direito em direção a Ga e gira para essa direção.',
      base: long, baseSide: 'Direita', leadFoot: 'Direito',
      frames: [frame('11', 58, 'lowBlock', 'Braço direito')],
    },
    {
      number: 12, title: 'Soco médio', direction: 'ga',
      description: 'Momtong-baro-jireugi segue com a base e a direção do movimento 11.',
      displacement: 'Ambos os pés permanecem no lugar.',
      base: long, baseSide: 'Direita', leadFoot: 'Direito',
      frames: [frame('12', 59, 'baro', 'Punho esquerdo')],
    },
    {
      number: 13, title: 'Defesa alta', direction: 'da3',
      description: 'Olgul-makgi abre a terceira linha lateral.',
      displacement: 'Leva o pé esquerdo em direção a Da 3 e apoia-o no chão.',
      base: walking, baseSide: 'Esquerda', leadFoot: 'Esquerdo',
      frames: [frame('13', 59, 'highBlock', 'Braço esquerdo')],
    },
    {
      number: 14, title: 'Chute frontal e soco médio', direction: 'da3',
      description: 'O quadro 14-1 mostra o Ap-chagi com a perna direita. No 14-2, o pé direito está à frente em Ap-seogi e o Momtong-bandae-jireugi é com o punho direito.',
      displacement: 'Após o chute, apoia o pé direito à frente, em direção a Da 3.',
      base: walking, baseSide: 'Direita', leadFoot: 'Direito',
      frames: [
        frame('14-1', 60, 'kick', 'Perna direita'),
        frame('14-2', 60, 'bandae', 'Punho direito'),
      ],
    },
    {
      number: 15, title: 'Defesa alta', direction: 'ra3',
      description: 'Olgul-makgi reaparece do outro lado da terceira linha.',
      displacement: 'Move o pé direito em direção a Ra 3 e gira para trás.',
      base: walking, baseSide: 'Direita', leadFoot: 'Direito',
      frames: [frame('15', 61, 'highBlock', 'Braço direito')],
    },
    {
      number: 16, title: 'Chute frontal e soco médio', direction: 'ra3',
      description: 'O quadro 16-1 mostra o Ap-chagi com a perna esquerda. No 16-2, o pé esquerdo está à frente em Ap-seogi e o Momtong-bandae-jireugi é com o punho esquerdo.',
      displacement: 'Após o chute, apoia o pé esquerdo à frente, em direção a Ra 3.',
      base: walking, baseSide: 'Esquerda', leadFoot: 'Esquerdo',
      frames: [
        frame('16-1', 61, 'kick', 'Perna esquerda'),
        frame('16-2', 62, 'bandae', 'Punho esquerdo'),
      ],
    },
    {
      number: 17, title: 'Defesa baixa', direction: 'na',
      description: 'O retorno pelo eixo central começa com Arae-makgi em Apgubi.',
      displacement: 'Move o pé esquerdo em direção a Na e gira pela frente.',
      base: long, baseSide: 'Esquerda', leadFoot: 'Esquerdo',
      frames: [frame('17', 62, 'lowBlock', 'Braço esquerdo')],
      references: [{ ...studySource, page: 63, locator: 'quadro 17, vista lateral' }],
    },
    {
      number: 18, title: 'Soco médio com kihap', direction: 'na', kihap: true,
      description: 'Momtong-bandae-jireugi com kihap encerra a contagem, antes do retorno à preparação.',
      displacement: 'Avança o pé direito em direção a Na.',
      base: long, baseSide: 'Direita', leadFoot: 'Direito',
      frames: [frame('18', 63, 'bandae', 'Punho direito')],
      references: [{ ...studySource, page: 64, locator: 'quadro 18, vista lateral' }],
    },
  ],
} satisfies PoomsaeStudy;
