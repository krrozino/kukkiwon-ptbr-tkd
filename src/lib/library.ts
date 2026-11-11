import publicLibraryItems from '../data/library-public-items.json' with { type: 'json' };
/**
 * Biblioteca Geral do Taekwondo — Kukkiwon PT-BR
 * Organização enciclopédica do conhecimento em 7 grandes áreas:
 * 1. Poomsae (Formas oficiais)
 * 2. Matchuo Kyorugi (Luta combinada)
 * 3. Palgwae (Formas históricas)
 * 4. Iron (Teoria, filosofia e história)
 * 5. Kibon Dongjak (Fundamentos)
 * 6. Balkisul (Técnicas de perna e chutes)
 * 7. Sonkisul (Técnicas de mão e punho)
 */

export type LibraryCategoryId =
  | 'poomsae'
  | 'matchuo-kyorugi'
  | 'palgwae'
  | 'iron'
  | 'kibon-dongjak'
  | 'balkisul'
  | 'sonkisul';

export interface LibrarySubcategory {
  id: string;
  name: string;
  description: string;
}

export interface LibrarySource {
  institution: string;
  title: string;
  editionOrYear?: string;
  locator?: string;
  url?: string;
}

export interface LibraryStep {
  stepNumber: number;
  instruction: string;
  technique?: string;
  stance?: string;
  target?: string;
}

export interface LibraryItem {
  slug: string;
  categoryId: LibraryCategoryId;
  subcategoryId: string;
  name: string;
  hangul?: string;
  romanization?: string;
  pronunciation_pt?: string;
  literalMeaning?: string;
  technicalMeaning?: string;
  description: string;
  execution?: string;
  variants?: string[];
  bodyRegions?: string[]; // Slugs de regiões anatômicas vinculadas ao Atlas
  stances?: string[];    // Bases relacionadas
  sequenceNumber?: number; // Ex: 1 a 10 para Sebon 1..10
  steps?: LibraryStep[];
  sources: LibrarySource[];
  mediaPrepared?: {
    hasVideoPlaceholder: boolean;
    hasPhotoPlaceholder: boolean;
    recommendedView?: string;
  };
}

export interface LibraryCategory {
  id: LibraryCategoryId;
  name: string;
  koreanName: string;
  koreanHangul: string;
  summary: string;
  description: string;
  subcategories: LibrarySubcategory[];
}

export const LIBRARY_CATEGORIES: LibraryCategory[] = [
  {
    id: 'poomsae',
    name: 'Poomsae',
    koreanName: 'Poomsae',
    koreanHangul: '품새',
    summary: 'Formas padronizadas de movimentos de ataque e defesa contra adversários imaginários.',
    description: 'Sequências codificadas que desenvolvem equilíbrio, foco, respiração, coordenação e a filosofia do Taekwondo.',
    subcategories: [
      { id: 'taegeuk', name: 'Taegeuk (1º ao 8º Jang)', description: 'Formas básicas para graduações de faixas coloridas (Gub).' },
      { id: 'superiores', name: 'Formas Superiores (Dan)', description: 'Formas avançadas para graduações de faixa preta (Dan).' },
    ],
  },
  {
    id: 'matchuo-kyorugi',
    name: 'Matchuo Kyorugi',
    koreanName: 'Matchwo Gyeorugi',
    koreanHangul: '맞춰겨루기',
    summary: 'Luta combinada predeterminada para treino de distância, precisão e tempo de resposta.',
    description: 'Exercícios práticos de combate em passos combinados entre dois praticantes, incluindo Sebon (3 passos), Dubon (2 passos) e Anjoa (sentado).',
    subcategories: [
      { id: 'sebon', name: 'Sebon Kyorugi (3 passos)', description: 'Sequências de ataque e defesa em três passos com contra-ataques específicos.' },
      { id: 'dubon', name: 'Dubon Kyorugi (2 passos)', description: 'Sequências de combate combinado em dois passos.' },
      { id: 'anjoa', name: 'Anjoa Kyorugi (Sentado)', description: 'Defesas e contra-ataques a partir de posições sentadas ou ajoelhadas.' },
    ],
  },
  {
    id: 'palgwae',
    name: 'Palgwae',
    koreanName: 'Palgwae',
    koreanHangul: '팔괘',
    summary: 'Formas históricas baseadas nos oito trigramas do I Ching.',
    description: 'Série de oito formas criadas no final da década de 1960 que antecederam os Taegeuk, preservadas como patrimônio técnico histórico.',
    subcategories: [
      { id: 'palgwae-formas', name: 'As Oito Formas Palgwae', description: 'Palgwae 1 Jang a 8 Jang com seus respectivos trigramas e aplicações.' },
    ],
  },
  {
    id: 'iron',
    name: 'Iron (Teoria)',
    koreanName: 'Iron',
    koreanHangul: '이론',
    summary: 'Teoria, filosofia, princípios morais e história do Taekwondo.',
    description: 'Conhecimento fundamental sobre a história marcial, o código de honra dos Hwarang, a formação da Kukkiwon, mestres e terminologia.',
    subcategories: [
      { id: 'filosofia-principios', name: 'Filosofia e Princípios', description: 'Juramento, princípios morais, cortesia e valores da arte marcial.' },
      { id: 'historia', name: 'História e Organizações', description: 'Hwarang-do, os Kwans originais, fundação da Kukkiwon e evolução mundial.' },
      { id: 'terminologia-conceitos', name: 'Conceitos e Terminologia', description: 'Estrutura da escrita coreana (Hangul), noções de Sogi, Chagi e comandos.' },
    ],
  },
  {
    id: 'kibon-dongjak',
    name: 'Kibon Dongjak',
    koreanName: 'Kibon Dongjak',
    koreanHangul: '기본동작',
    summary: 'Fundamentos corporais, bases (Sogi), defesas (Makgi) e golpes básicos.',
    description: 'Os tijolos essenciais da biomecânica do Taekwondo: alinhamento postural, centro de gravidade, alturas e direções.',
    subcategories: [
      { id: 'bases', name: 'Bases (Sogi)', description: 'Posturas fundamentais de equilíbrio, avanço e recuo.' },
      { id: 'defesas', name: 'Defesas (Makgi)', description: 'Bloqueios fundamentais com braços, antebraços e mãos.' },
      { id: 'alturas-direcoes', name: 'Alturas e Direções', description: 'Linhas Olgul, Momtong, Arae e trajetórias de ataque.' },
    ],
  },
  {
    id: 'balkisul',
    name: 'Balkisul (Chutes)',
    koreanName: 'Bal Kisul',
    koreanHangul: '발기술',
    summary: 'Técnicas de chute e golpes com os membros inferiores.',
    description: 'O vasto repertório de chutes frontais, circulares, laterais, giratórios e saltados característicos do Taekwondo.',
    subcategories: [
      { id: 'chutes-basicos', name: 'Chutes Básicos', description: 'Ap Chagi, Dollyo Chagi, Yop Chagi e Naeryo Chagi.' },
      { id: 'chutes-giratorios', name: 'Chutes Giratórios', description: 'Dwi Chagi, Mondolyo Chagi e variações com rotação.' },
      { id: 'chutes-especiais', name: 'Técnicas Lineares e Balísticas', description: 'Ap Cha Oligi, Bitro Chagi e chutes em crescente.' },
    ],
  },
  {
    id: 'sonkisul',
    name: 'Sonkisul (Mãos)',
    koreanName: 'Son Kisul',
    koreanHangul: '손기술',
    summary: 'Técnicas de ataque, impacto e defesas executadas com as mãos e punhos.',
    description: 'Socos, golpes com o dorso do punho, faca da mão (Sonnal), base da palma (Batangson) e suas conexões com o Atlas anatômico.',
    subcategories: [
      { id: 'socos-jireugi', name: 'Socos (Jirugi)', description: 'Ataques diretos, circulares e ascendentes com o punho fechado.' },
      { id: 'impactos-chigi', name: 'Golpes de Impacto (Chigi)', description: 'Golpes com o dorso do punho (Deung Jumeok), martelo (Me Jumeok) e faca da mão.' },
      { id: 'defesas-manuais', name: 'Defesas Manuais', description: 'Bloqueios e aparadas com a palma, bordas e superfícies da mão.' },
    ],
  },
];

// Only visitor-safe entries are imported into the public library.
// Research-only sequences and historical candidates remain in content/research.
export const LIBRARY_ITEMS: LibraryItem[] = publicLibraryItems as LibraryItem[];

export function getCategoryById(id: string): LibraryCategory | undefined {
  return LIBRARY_CATEGORIES.find(c => c.id === id);
}

export function getItemsByCategory(categoryId: LibraryCategoryId): LibraryItem[] {
  return LIBRARY_ITEMS.filter(item => item.categoryId === categoryId);
}

export function getItemBySlug(slug: string): LibraryItem | undefined {
  return LIBRARY_ITEMS.find(item => item.slug === slug);
}

export function searchLibrary(query: string, categoryId?: LibraryCategoryId): LibraryItem[] {
  const q = query.trim().toLowerCase();
  return LIBRARY_ITEMS.filter(item => {
    if (categoryId && item.categoryId !== categoryId) return false;
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      (item.hangul && item.hangul.includes(q)) ||
      (item.romanization && item.romanization.toLowerCase().includes(q)) ||
      (item.pronunciation_pt && item.pronunciation_pt.toLowerCase().includes(q)) ||
      item.description.toLowerCase().includes(q) ||
      (item.literalMeaning && item.literalMeaning.toLowerCase().includes(q)) ||
      (item.variants && item.variants.some(v => v.toLowerCase().includes(q)))
    );
  });
}
