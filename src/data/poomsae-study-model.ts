// Cada forma escolhe sua convenção de direção. A grade Ga/Na/Da/Ra pertence aos pilotos Taegeuk.
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
  year?: number;
};

export type StudyFrame = {
  id: string;
  label: string;
  hangul?: string;
  romanization?: string;
  kind?: string;
  executor?: string;
  reviewState?: string;
  reference: StudyReference;
  additionalReferences?: readonly StudyReference[];
  link?: StudyLink;
};

export type StudyMovement<Direction extends string> = {
  number: number;
  title: string;
  direction: Direction;
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
  transitions?: readonly { description: string; reference: StudyReference }[];
  frames: readonly StudyFrame[];
  references?: readonly StudyReference[];
  transitionPending?: boolean;
  discrepancy?: { note?: string; variants: readonly { summary: string; reference: StudyReference }[] };
  reviewPoints?: readonly string[];
};

export type StudyBoundary<Direction extends string> = {
  title: string;
  direction: Direction;
  position?: Direction;
  displacement?: string;
  base: StudyTerm;
  stance?: StudyTerm;
  citation: { page: number; locator: string };
};

export type PoomsaeStudy<Direction extends string> = {
  slug: string;
  hangul: string;
  meaning: string;
  identityUrl: string;
  identityLocator: string;
  trigramHangul?: string;
  family?: string;
  romanization?: string;
  context?: readonly { title: string; description: string; reference: StudyReference }[];
  references?: readonly StudyReference[];
  demonstration?: {
    description: string;
    recording: StudyLink;
    lesson: StudyLink & { credit: string };
    embed: { url: string; title: string };
  };
  movements: readonly StudyMovement<Direction>[];
  readingNote: string;
  source: {
    institution: string;
    title: string;
    edition: string;
    url: string;
    sourceCheckedAt: string;
    reviewState: string;
  };
  start: StudyBoundary<Direction>;
  finish: StudyBoundary<Direction>;
  closure?: StudyBoundary<Direction>;
};
