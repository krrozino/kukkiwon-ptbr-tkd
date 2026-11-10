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

export const LIBRARY_ITEMS: LibraryItem[] = [
  // ==========================================
  // 1. POOMSAE
  // ==========================================
  {
    slug: 'taegeuk-il-jang',
    categoryId: 'poomsae',
    subcategoryId: 'taegeuk',
    name: 'Taegeuk 1 Jang (Il Jang)',
    hangul: '태극 1장',
    romanization: 'Taegeuk Il Jang',
    pronunciation_pt: 'Téguk Il Djang',
    literalMeaning: 'Taegeuk número 1 — Símbolo Keon (Céu e Luz)',
    technicalMeaning: 'Primeira forma básica com 18 movimentos, enfatizando a base Ap Seogi e Ap Kubi com defesas Arae Makgi e socos Momtong Jirugi.',
    description: 'Representa o Céu (Keon), a origem de todas as coisas, a criação e a luz. É a base fundamental que todo praticante aprende ao iniciar sua caminhada no Taekwondo.',
    stances: ['ap-seogi', 'ap-kubi'],
    bodyRegions: ['palm', 'sonnal', 'apchook'],
    steps: [
      { stepNumber: 1, instruction: 'Girar 90° à esquerda em Ap Seogi, Arae Makgi com braço esquerdo.', stance: 'Ap Seogi', technique: 'Arae Makgi' },
      { stepNumber: 2, instruction: 'Avançar em Ap Seogi, Momtong Bandae Jirugi com punho direito.', stance: 'Ap Seogi', technique: 'Momtong Jirugi' },
      { stepNumber: 3, instruction: 'Girar 180° à direita em Ap Seogi, Arae Makgi com braço direito.', stance: 'Ap Seogi', technique: 'Arae Makgi' },
      { stepNumber: 4, instruction: 'Avançar em Ap Seogi, Momtong Bandae Jirugi com punho esquerdo.', stance: 'Ap Seogi', technique: 'Momtong Jirugi' },
      { stepNumber: 5, instruction: 'Girar 90° à esquerda para a frente em Ap Kubi, Arae Makgi esquerdo seguido de Momtong Baro Jirugi.', stance: 'Ap Kubi', technique: 'Arae Makgi + Momtong Jirugi' },
    ],
    sources: [
      { institution: 'Kukkiwon', title: 'Taekwondo Textbook — Poomsae', editionOrYear: '2022', locator: 'Taegeuk 1 Jang, pp. 240-249', url: 'https://www.kukkiwon.or.kr/eng/board/list?boardManagementNo=55&menuLevel=3&menuNo=72' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true, recommendedView: 'front' },
  },
  {
    slug: 'taegeuk-ee-jang',
    categoryId: 'poomsae',
    subcategoryId: 'taegeuk',
    name: 'Taegeuk 2 Jang (Ee Jang)',
    hangul: '태극 2장',
    romanization: 'Taegeuk Ee Jang',
    pronunciation_pt: 'Téguk I Djang',
    literalMeaning: 'Taegeuk número 2 — Símbolo Tae (Lago e Firmeza Interna)',
    technicalMeaning: 'Segunda forma básica com 18 movimentos, introduzindo Olgul Jirugi e chutes frontais Ap Chagi.',
    description: 'Simboliza a alegria e a calma do lago, com postura firme por dentro e flexível por fora. Desenvolve ataques na altura do rosto combinados com chutes frontais precisos.',
    stances: ['ap-seogi', 'ap-kubi'],
    bodyRegions: ['apchook', 'palm'],
    sources: [
      { institution: 'Kukkiwon', title: 'Taekwondo Textbook — Poomsae', editionOrYear: '2022', locator: 'Taegeuk 2 Jang', url: 'https://www.kukkiwon.or.kr/eng/board/list?boardManagementNo=55&menuLevel=3&menuNo=72' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
  {
    slug: 'taegeuk-sam-jang',
    categoryId: 'poomsae',
    subcategoryId: 'taegeuk',
    name: 'Taegeuk 3 Jang (Sam Jang)',
    hangul: '태극 3장',
    romanization: 'Taegeuk Sam Jang',
    pronunciation_pt: 'Téguk Sam Djang',
    literalMeaning: 'Taegeuk número 3 — Símbolo Ri (Fogo e Clareza)',
    technicalMeaning: 'Terceira forma com 20 movimentos, introduzindo a defesa e ataque com Sonnal (faca da mão) e defesas duplas.',
    description: 'Simboliza o fogo e o calor, com movimentos rápidos e decisivos alternados com momentos de estabilidade e foco.',
    stances: ['ap-seogi', 'ap-kubi', 'dwit-kubi'],
    bodyRegions: ['sonnal', 'apchook'],
    sources: [
      { institution: 'Kukkiwon', title: 'Taekwondo Textbook — Poomsae', editionOrYear: '2022', locator: 'Taegeuk 3 Jang', url: 'https://www.kukkiwon.or.kr/eng/board/list?boardManagementNo=55&menuLevel=3&menuNo=72' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
  {
    slug: 'poomsae-koryo',
    categoryId: 'poomsae',
    subcategoryId: 'superiores',
    name: 'Poomsae Koryo',
    hangul: '고려',
    romanization: 'Koryo',
    pronunciation_pt: 'Corio',
    literalMeaning: 'Dinastia Koryo (918-1392 d.C.)',
    technicalMeaning: 'Primeira forma superior para 1º Dan, com 30 movimentos, enfatizando a força inabalável e a herança histórica do povo coreano.',
    description: 'Koryo é o nome da dinastia antiga da qual se origina a palavra "Coreia". Esta forma representa o espírito marcial determinado, a defesa firme de ideais e posturas heróicas.',
    stances: ['ap-kubi', 'dwit-kubi', 'juchum-seogi'],
    bodyRegions: ['sonnal', 'batangson', 'me-jumeok', 'apchook', 'balnal'],
    sources: [
      { institution: 'Kukkiwon', title: 'Composition of Taekwondo — Poomsae', editionOrYear: '2022', locator: 'Board 55 / Artigo 1356', url: 'https://www.kukkiwon.or.kr/eng/board/read?boardManagementNo=55&boardNo=1356&menuLevel=3&menuNo=72' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },

  // ==========================================
  // 2. MATCHUO KYORUGI (Luta Combinada)
  // ==========================================
  {
    slug: 'sebon-kyorugi-1',
    categoryId: 'matchuo-kyorugi',
    subcategoryId: 'sebon',
    name: 'Sebon Kyorugi — Sequência 1',
    hangul: '세본겨루기 1',
    romanization: 'Sebon Gyeorugi 1',
    pronunciation_pt: 'Sebon Kiorugui Um',
    sequenceNumber: 1,
    literalMeaning: 'Combate combinado de três passos número 1',
    technicalMeaning: 'Ataque em três passos com Momtong Baro Jirugi; defesa em recuo com Momtong An Makgi e contra-ataque com Baro Jirugi.',
    description: 'Sequência fundamental de Sebon Kyorugi. O atacante avança três passos consecutivos desferindo socos na altura média (Momtong). O defensor recua sincronizadamente bloqueando e finaliza com contra-ataque firme.',
    steps: [
      { stepNumber: 1, instruction: 'Atacante avança em Ap Kubi desferindo Momtong Baro Jirugi direito. Defensor recua em Ap Kubi executando Momtong An Makgi esquerdo.', stance: 'Ap Kubi', target: 'Momtong' },
      { stepNumber: 2, instruction: 'Atacante avança segundo passo com Momtong Baro Jirugi esquerdo. Defensor recua com Momtong An Makgi direito.', stance: 'Ap Kubi', target: 'Momtong' },
      { stepNumber: 3, instruction: 'Atacante avança terceiro passo com Momtong Baro Jirugi direito (com Kihap). Defensor recua com Momtong An Makgi esquerdo, contra-atacando de imediato com Momtong Baro Jirugi direito ao plexo solar.', stance: 'Ap Kubi', target: 'Plexo solar' },
    ],
    sources: [
      { institution: 'CBTKD', title: 'Regulamento Geral de Exame de Faixa (Documento Histórico)', editionOrYear: '2016', locator: 'Exame de Faixa — Matcho Kyorugui', url: 'https://fetese.com.br/uploads/2016/01/14/downloads/regulamento-geral-de-exame-de-faixa-cbtkd.pdf' },
      { institution: 'Kukkiwon', title: 'WTA Master Training Course — Gyeorugi Teaching', editionOrYear: '2023', locator: 'Section 4: Matchwo Gyeorugi', url: 'https://wta.kukkiwon.or.kr/en/trainingProcess/masterCourse?lang=en&topMenuid=1072' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
  {
    slug: 'sebon-kyorugi-2',
    categoryId: 'matchuo-kyorugi',
    subcategoryId: 'sebon',
    name: 'Sebon Kyorugi — Sequência 2',
    hangul: '세본겨루기 2',
    romanization: 'Sebon Gyeorugi 2',
    pronunciation_pt: 'Sebon Kiorugui Dois',
    sequenceNumber: 2,
    literalMeaning: 'Combate combinado de três passos número 2',
    technicalMeaning: 'Ataque em três passos na altura do rosto (Olgul); defesa em recuo com Olgul Makgi e contra-ataque com soco no queixo.',
    description: 'Segunda sequência tradicional de três passos, focada na proteção da cabeça e na recuperação imediata da linha central para contra-golpear.',
    steps: [
      { stepNumber: 1, instruction: 'Atacante avança em Ap Kubi com Olgul Baro Jirugi. Defensor recua em Ap Kubi com Olgul Makgi.', stance: 'Ap Kubi', target: 'Olgul' },
      { stepNumber: 2, instruction: 'Atacante avança segundo passo com Olgul Baro Jirugi oposto. Defensor recua com Olgul Makgi oposto.', stance: 'Ap Kubi', target: 'Olgul' },
      { stepNumber: 3, instruction: 'Atacante avança terceiro passo com Kihap. Defensor recua com Olgul Makgi e contra-ataca com Baro Jirugi ao queixo ou filtrando a guarda.', stance: 'Ap Kubi', target: 'Olgul' },
    ],
    sources: [
      { institution: 'CBTKD', title: 'Regulamento Geral de Exame de Faixa (Documento Histórico)', editionOrYear: '2016', locator: 'Exame de Faixa — Matcho Kyorugui' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
  {
    slug: 'sebon-kyorugi-3',
    categoryId: 'matchuo-kyorugi',
    subcategoryId: 'sebon',
    name: 'Sebon Kyorugi — Sequência 3',
    hangul: '세본겨루기 3',
    romanization: 'Sebon Gyeorugi 3',
    pronunciation_pt: 'Sebon Kiorugui Três',
    sequenceNumber: 3,
    literalMeaning: 'Combate combinado de três passos número 3',
    technicalMeaning: 'Defesa externa com Sonnal Makgi em Dwit Kubi e contra-ataque com Sonnal Mok Chigi ao pescoço.',
    description: 'Sequência que introduz o uso da faca da mão (Sonnal) na defesa e no contra-ataque direcionado à lateral do pescoço do atacante.',
    sources: [
      { institution: 'CBTKD', title: 'Regulamento Geral de Exame de Faixa (Documento Histórico)', editionOrYear: '2016', locator: 'Matcho Kyorugui 3' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
  {
    slug: 'sebon-kyorugi-4',
    categoryId: 'matchuo-kyorugi',
    subcategoryId: 'sebon',
    name: 'Sebon Kyorugi — Sequência 4',
    hangul: '세본겨루기 4',
    romanization: 'Sebon Gyeorugi 4',
    pronunciation_pt: 'Sebon Kiorugui Quatro',
    sequenceNumber: 4,
    literalMeaning: 'Combate combinado de três passos número 4',
    technicalMeaning: 'Deslocamento angular lateral na terceira defesa e contra-ataque com Yop Chagi (chute lateral) às costelas.',
    description: 'Desenvolve a saída da linha de ataque do oponente com esquiva lateral e aplicação de chute lateral vigoroso.',
    sources: [
      { institution: 'CBTKD', title: 'Regulamento Geral de Exame de Faixa (Documento Histórico)', editionOrYear: '2016', locator: 'Matcho Kyorugui 4' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
  {
    slug: 'sebon-kyorugi-5',
    categoryId: 'matchuo-kyorugi',
    subcategoryId: 'sebon',
    name: 'Sebon Kyorugi — Sequência 5',
    hangul: '세본겨루기 5',
    romanization: 'Sebon Gyeorugi 5',
    pronunciation_pt: 'Sebon Kiorugui Cinco',
    sequenceNumber: 5,
    literalMeaning: 'Combate combinado de três passos número 5',
    technicalMeaning: 'Defesa por desvio com Batangson e contra-ataque com Ap Chagi ou soco duplo simultâneo.',
    description: 'Quinta sequência do currículo básico de Sebon, completando o conjunto comum exigido na transição de Faixa Amarela.',
    sources: [
      { institution: 'CBTKD', title: 'Regulamento Geral de Exame de Faixa (Documento Histórico)', editionOrYear: '2016', locator: 'Matcho Kyorugui 5' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
  {
    slug: 'sebon-kyorugi-6-10',
    categoryId: 'matchuo-kyorugi',
    subcategoryId: 'sebon',
    name: 'Sebon Kyorugi — Sequências 6 a 10',
    hangul: '세본겨루기 6-10',
    romanization: 'Sebon Gyeorugi 6 a 10',
    pronunciation_pt: 'Sebon Kiorugui Seis a Dez',
    sequenceNumber: 6,
    literalMeaning: 'Série intermediária de três passos (Sequências 6, 7, 8, 9 e 10)',
    technicalMeaning: 'Conjunto de sequências com alavancas articulares (Kkeokgi), contragolpes com cotovelos (Palkup) e chutes circulares (Dollyo Chagi).',
    description: 'Sequências avançadas de três passos tradicionalmente praticadas para o exame de Ponta Verde e Faixa Verde, combinando defesas complexas e arremates rápidos.',
    sources: [
      { institution: 'CBTKD', title: 'Regulamento Geral de Exame de Faixa (Documento Histórico)', editionOrYear: '2016', locator: 'Matcho Kyorugui 6 a 10' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },

  // ==========================================
  // 3. PALGWAE (Formas Históricas)
  // ==========================================
  {
    slug: 'palgwae-il-jang',
    categoryId: 'palgwae',
    subcategoryId: 'palgwae-formas',
    name: 'Palgwae 1 Jang (Il Jang)',
    hangul: '팔괘 1장',
    romanization: 'Palgwae Il Jang',
    pronunciation_pt: 'Palgué Il Djang',
    literalMeaning: 'Primeira forma Palgwae — Trigrama Keon (☰ Céu Puro)',
    technicalMeaning: 'Forma histórica criada pela KTA em 1967 com 23 movimentos, enfatizando posturas firmes em Ap Kubi e transições contínuas.',
    description: 'As formas Palgwae foram desenvolvidas pelos primeiros mestres das diversas escolas (Kwans) antes da criação dos Taegeuk. Preservam movimentos amplos e o estudo clássico dos oito trigramas.',
    stances: ['ap-kubi', 'dwit-kubi', 'ap-seogi'],
    sources: [
      { institution: 'Korea Taekwondo Association', title: 'Palgwae Poomsae Historical Records', editionOrYear: '1968', locator: 'Palgwae 1 Jang' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
  {
    slug: 'palgwae-ee-jang',
    categoryId: 'palgwae',
    subcategoryId: 'palgwae-formas',
    name: 'Palgwae 2 Jang (Ee Jang)',
    hangul: '팔괘 2장',
    romanization: 'Palgwae Ee Jang',
    pronunciation_pt: 'Palgué I Djang',
    literalMeaning: 'Segunda forma Palgwae — Trigrama Tae (☱ Lago)',
    technicalMeaning: 'Segunda forma da série Palgwae com 23 movimentos, integrando defesas com antebraço e ataques repetidos na linha média.',
    description: 'Representa a tranquilidade profunda com firmeza marcial. Caracteriza-se por cadência constante e movimentos equilibrados.',
    stances: ['ap-kubi', 'dwit-kubi'],
    sources: [
      { institution: 'Korea Taekwondo Association', title: 'Palgwae Poomsae Historical Records', editionOrYear: '1968', locator: 'Palgwae 2 Jang' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },

  // ==========================================
  // 4. IRON (Teoria, Filosofia e História)
  // ==========================================
  {
    slug: 'o-que-e-sogi',
    categoryId: 'iron',
    subcategoryId: 'terminologia-conceitos',
    name: 'O que é Sogi (Bases no Taekwondo)',
    hangul: '서기',
    romanization: 'Seogi',
    pronunciation_pt: 'Sogui',
    literalMeaning: 'Ato de ficar em pé, postura, base',
    technicalMeaning: 'Conjunto de posturas e alinhamentos corporais dos pés, pernas e centro de gravidade que sustentam qualquer movimento marcial.',
    description: 'No Taekwondo, Sogi é o alicerce de toda técnica. Sem uma base estável, a força gerada pelos quadris e pelo tronco não pode ser transmitida eficazmente. As bases regulam a distribuição de peso, a altura do centro de gravidade e a mobilidade de esquiva e avanço.',
    sources: [
      { institution: 'Kukkiwon', title: 'Taekwondo Textbook — Fundamentals', editionOrYear: '2022', locator: 'Chapter 2: Seogi (Stances)' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
  {
    slug: 'o-que-e-chagi',
    categoryId: 'iron',
    subcategoryId: 'terminologia-conceitos',
    name: 'O que é Chagi (Chutes no Taekwondo)',
    hangul: '차기',
    romanization: 'Chagi',
    pronunciation_pt: 'Tchagui',
    literalMeaning: 'Chutar, golpear com a perna/pé',
    technicalMeaning: 'Técnica de perna que utiliza o quadril, joelho e tornozelo para gerar energia cinética contra um alvo.',
    description: 'Chagi é a assinatura mais reconhecida do Taekwondo internacional. O princípio técnico envolve dobrar o joelho (recolhimento prévio), rotacionar o quadril e a perna de apoio, estender explosivamente e recolher a perna após o impacto para garantir o equilíbrio.',
    sources: [
      { institution: 'Kukkiwon', title: 'Taekwondo Textbook — Chagi', editionOrYear: '2022', locator: 'Chapter 3: Chagi (Kicking)' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
  {
    slug: 'hwarang-do-historia',
    categoryId: 'iron',
    subcategoryId: 'historia',
    name: 'Hwarang-do e o Contexto Histórico',
    hangul: '화랑도',
    romanization: 'Hwarang-do',
    pronunciation_pt: 'Huarang-dô',
    literalMeaning: 'Caminho dos Cavaleiros Floridos (Jovens nobres guerreiros de Silla)',
    technicalMeaning: 'Corpo de elite de jovens guerreiros do antigo reino de Silla (século VI d.C.) cujo código ético e treinamento influenciaram a cultura marcial coreana.',
    description: 'O Hwarang-do combinava treinamento em artes marciais, arco e flecha, equitação, poesia, filosofia budista e confucionista. O código dos cinco mandamentos de Won Gwang (Sesok O-gye) inspirou diretamente os princípios de honra, lealdade e cortesia do Taekwondo contemporâneo.',
    sources: [
      { institution: 'Kukkiwon', title: 'History of Taekwondo and Martial Traditions', editionOrYear: '2020', locator: 'Ancient Martial Origins — Silla Period' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
  {
    slug: 'principios-juramento',
    categoryId: 'iron',
    subcategoryId: 'filosofia-principios',
    name: 'Princípios Morais e Juramento do Taekwondo',
    hangul: '태권도 정신',
    romanization: 'Taekwondo Jeongshin',
    pronunciation_pt: 'Tékuondô Djongshin',
    literalMeaning: 'Espírito e princípios do Taekwondo',
    technicalMeaning: 'Os cinco princípios essenciais: Cortesia (Ye-Ui), Integridade (Yom-Chi), Perseverança (In-Nae), Autocontrole (Guk-Gi) e Espírito Indomável (Baekjul-bool-gool).',
    description: 'O Taekwondo não é apenas um sistema de combate, mas uma disciplina formativa do caráter humano. O juramento reforça o compromisso do praticante em respeitar seus mestres e colegas, nunca fazer mau uso da arte marcial e trabalhar pela construção de uma sociedade mais justa e pacífica.',
    sources: [
      { institution: 'Kukkiwon', title: 'Taekwondo Philosophy and Spirit', editionOrYear: '2022', locator: 'Philosophy of Taekwondo' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },

  // ==========================================
  // 5. KIBON DONGJAK (Fundamentos)
  // ==========================================
  {
    slug: 'ap-kubi',
    categoryId: 'kibon-dongjak',
    subcategoryId: 'bases',
    name: 'Ap Kubi (Base Frontal Avançada)',
    hangul: '앞굽이',
    romanization: 'Ap Gubi',
    pronunciation_pt: 'Ap Cubi',
    literalMeaning: 'Dobrar para a frente',
    technicalMeaning: 'Base longa e firme onde a perna da frente está flexionada a 90° e a de trás estendida, suportando dois terços do peso corporal.',
    description: 'A base mais potente para ataques frontais e deslocamentos de avanço. O pé dianteiro aponta para a frente e o pé de trás está angulado em aproximadamente 30 graus, com o tronco ereto e o quadril encaixado.',
    sources: [
      { institution: 'Kukkiwon', title: 'Taekwondo Textbook — Fundamentals', editionOrYear: '2022', locator: 'Seogi: Ap Gubi, p. 112' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
  {
    slug: 'dwit-kubi',
    categoryId: 'kibon-dongjak',
    subcategoryId: 'bases',
    name: 'Dwit Kubi (Base Traseira Defensiva)',
    hangul: '뒷굽이',
    romanization: 'Dwit Gubi',
    pronunciation_pt: 'Duit Cubi',
    literalMeaning: 'Dobrar para trás',
    technicalMeaning: 'Base defensiva em forma de "L" com 70% do peso corporal na perna de trás e 30% na perna da frente.',
    description: 'Ideal para esquivas e defesas recuadas. A perna de trás absorve o peso facilitando o contra-ataque rápido com a perna dianteira.',
    sources: [
      { institution: 'Kukkiwon', title: 'Taekwondo Textbook — Fundamentals', editionOrYear: '2022', locator: 'Seogi: Dwit Gubi, p. 116' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
  {
    slug: 'juchum-seogi',
    categoryId: 'kibon-dongjak',
    subcategoryId: 'bases',
    name: 'Juchum Seogi (Base do Cavaleiro)',
    hangul: '주춤서기',
    romanization: 'Juchum Seogi',
    pronunciation_pt: 'Djutchum Sogui',
    literalMeaning: 'Postura de montar a cavalo',
    technicalMeaning: 'Base paralela e rebaixada, duas vezes a largura dos ombros, com peso dividido igualmente entre as duas pernas.',
    description: 'Postura clássica para treinamento de socos repetidos, fortalecimento dos quadríceps e estabilização da respiração diafragmática.',
    sources: [
      { institution: 'Kukkiwon', title: 'Taekwondo Textbook — Fundamentals', editionOrYear: '2022', locator: 'Seogi: Juchum Seogi, p. 110' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
  {
    slug: 'arae-makgi',
    categoryId: 'kibon-dongjak',
    subcategoryId: 'defesas',
    name: 'Arae Makgi (Defesa Baixa)',
    hangul: '아래막기',
    romanization: 'Arae Makgi',
    pronunciation_pt: 'Aré Maqui',
    literalMeaning: 'Bloqueio para baixo',
    technicalMeaning: 'Defesa descendente executada com a parte externa do antebraço para proteger a virilha e o abdômen inferior contra ataques frontais.',
    description: 'O punho parte do ombro oposto com o dorso para fora e desliza em trajetória descendente até parar a dois punhos de distância da coxa dianteira.',
    sources: [
      { institution: 'Kukkiwon', title: 'Taekwondo Textbook — Fundamentals', editionOrYear: '2022', locator: 'Makgi: Arae Makgi, p. 142' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },

  // ==========================================
  // 6. BALKISUL (Chutes e Técnicas de Pé)
  // ==========================================
  {
    slug: 'ap-chagi',
    categoryId: 'balkisul',
    subcategoryId: 'chutes-basicos',
    name: 'Ap Chagi (Chute Frontal)',
    hangul: '앞차기',
    romanization: 'Ap Chagi',
    pronunciation_pt: 'Ap Tchagui',
    literalMeaning: 'Chute para a frente',
    technicalMeaning: 'Chute linear vertical executado com a bola do pé (Apchook) ou ponta dos dedos recolhidos.',
    description: 'O chute mais fundamental do Taekwondo. A perna é flexionada elevando o joelho ao nível do peito; a perna então se estende rapidamente atingindo o alvo frontal e recolhe imediatamente.',
    bodyRegions: ['apchook', 'baldeung'],
    sources: [
      { institution: 'Kukkiwon', title: 'Taekwondo Textbook — Chagi', editionOrYear: '2022', locator: 'Ap Chagi, pp. 180-185' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
  {
    slug: 'dollyo-chagi',
    categoryId: 'balkisul',
    subcategoryId: 'chutes-basicos',
    name: 'Dollyo Chagi (Chute Circular)',
    hangul: '돌려차기',
    romanization: 'Dollyo Chagi',
    pronunciation_pt: 'Dólio Tchagui',
    literalMeaning: 'Chute girado / circular',
    technicalMeaning: 'Chute circular executado com o peito do pé (Baldeung) ou com a bola do pé (Apchook), com rotação de quadril e apoio a 180°.',
    description: 'O chute mais utilizado em competições e treinamentos modernos. O praticante gira sobre o pé de apoio, flexiona o joelho na diagonal e chicoteia o pé contra as costelas ou têmpora do oponente.',
    bodyRegions: ['baldeung', 'apchook'],
    sources: [
      { institution: 'Kukkiwon', title: 'Taekwondo Textbook — Chagi', editionOrYear: '2022', locator: 'Dollyo Chagi, pp. 190-195' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
  {
    slug: 'yop-chagi',
    categoryId: 'balkisul',
    subcategoryId: 'chutes-basicos',
    name: 'Yop Chagi (Chute Lateral)',
    hangul: '옆차기',
    romanization: 'Yeop Chagi',
    pronunciation_pt: 'Ióp Tchagui',
    literalMeaning: 'Chute de lado',
    technicalMeaning: 'Chute linear lateral penetrante executado com a faca do pé (Balnal) ou calcanhar (Dwichook).',
    description: 'Conhecido por sua força penetrante de arrombamento. O praticante gira o corpo lateralmente, encolhe o joelho contra o peito e estende toda a perna em linha reta com o quadril.',
    bodyRegions: ['balnal', 'dwichook'],
    sources: [
      { institution: 'Kukkiwon', title: 'Taekwondo Textbook — Chagi', editionOrYear: '2022', locator: 'Yeop Chagi, pp. 186-189' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
  {
    slug: 'naeryo-chagi',
    categoryId: 'balkisul',
    subcategoryId: 'chutes-basicos',
    name: 'Naeryo Chagi (Chute Descendente / Martelo)',
    hangul: '내려차기',
    romanization: 'Naeryo Chagi',
    pronunciation_pt: 'Nério Tchagui',
    literalMeaning: 'Chute descendo',
    technicalMeaning: 'Chute elevado acima da cabeça que desce perpendicularmente com o calcanhar (Dwichook) sobre a cabeça ou clavícula.',
    description: 'Técnica de grande alcance e impacto vertical. A perna sobe relaxada e desce acelerando fortemente pela ação dos músculos abdominais e glúteos.',
    bodyRegions: ['dwichook', 'balbadak'],
    sources: [
      { institution: 'Kukkiwon', title: 'Taekwondo Textbook — Chagi', editionOrYear: '2022', locator: 'Naeryo Chagi, pp. 200-203' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
  {
    slug: 'ap-cha-oligi',
    categoryId: 'balkisul',
    subcategoryId: 'chutes-especiais',
    name: 'Ap Cha Oligi (Elevação Frontal de Perna)',
    hangul: '앞차올리기',
    romanization: 'Ap Cha Oligi',
    pronunciation_pt: 'Ap Tchá Olikí',
    literalMeaning: 'Subir a perna para a frente',
    technicalMeaning: 'Movimento de alongamento balístico com a perna estendida, sem flexionar o joelho, preparando a musculatura e a flexibilidade dinâmica.',
    description: 'Fundamental no aquecimento técnico e na verificação do alinhamento da pelve para os chutes com a bola do pé.',
    bodyRegions: ['apchook'],
    sources: [
      { institution: 'Kukkiwon', title: 'Taekwondo Textbook — Fundamentals', editionOrYear: '2022', locator: 'Stretching and Basic Kicks' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
  {
    slug: 'bitro-chagi',
    categoryId: 'balkisul',
    subcategoryId: 'chutes-especiais',
    name: 'Bitro Chagi (Chute Diagonal Torcido)',
    hangul: '비틀어차기',
    romanization: 'Biteureo Chagi',
    pronunciation_pt: 'Bitrô Tchagui',
    literalMeaning: 'Chute torcendo para fora',
    technicalMeaning: 'Chute com peito do pé projetado em trajetória diagonal reversa, desviando de bloqueios frontais.',
    description: 'Técnica sutil e enganosa onde o pé sai como um chute frontal mas gira externamente atingindo a lateral do oponente.',
    bodyRegions: ['baldeung'],
    sources: [
      { institution: 'Kukkiwon', title: 'Taekwondo Textbook — Chagi', editionOrYear: '2022', locator: 'Biteureo Chagi' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },

  // ==========================================
  // 7. SONKISUL (Técnicas de Mão e Punho)
  // ==========================================
  {
    slug: 'ap-bandae-jirugi',
    categoryId: 'sonkisul',
    subcategoryId: 'socos-jireugi',
    name: 'Bandae Jirugi (Soco Invertido)',
    hangul: '반대지르기',
    romanization: 'Bandae Jireugi',
    pronunciation_pt: 'Bandê Djirukí',
    literalMeaning: 'Soco do lado contrário',
    technicalMeaning: 'Soco direto executado com o braço oposto à perna que está avançada na base (ex: perna esquerda na frente, soco com mão direita).',
    description: 'Um dos socos mais fortes e profundos do Taekwondo, pois aproveita a rotação máxima da cintura e da bacia em base Ap Kubi.',
    bodyRegions: ['knuckles', 'palm', 'wrist'],
    sources: [
      { institution: 'Kukkiwon', title: 'Taekwondo Textbook — Hand Techniques', editionOrYear: '2022', locator: 'Jireugi: Bandae Jireugi, p. 128' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
  {
    slug: 'ap-baro-jirugi',
    categoryId: 'sonkisul',
    subcategoryId: 'socos-jireugi',
    name: 'Baro Jirugi (Soco Direto)',
    hangul: '바로지르기',
    romanization: 'Baro Jireugi',
    pronunciation_pt: 'Barô Djirukí',
    literalMeaning: 'Soco do mesmo lado / soco correto',
    technicalMeaning: 'Soco direto executado com o mesmo braço da perna dianteira (ex: perna direita na frente, soco com mão direita).',
    description: 'Soco veloz e direto com menor rotação de tronco, ideal para manter a estabilidade da postura e o tempo de reação.',
    bodyRegions: ['knuckles', 'wrist'],
    sources: [
      { institution: 'Kukkiwon', title: 'Taekwondo Textbook — Hand Techniques', editionOrYear: '2022', locator: 'Jireugi: Baro Jireugi, p. 126' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
  {
    slug: 'dollyo-jirugi',
    categoryId: 'sonkisul',
    subcategoryId: 'socos-jireugi',
    name: 'Dollyo Jirugi (Soco Circular / Gancho)',
    hangul: '돌려지르기',
    romanization: 'Dollyo Jireugi',
    pronunciation_pt: 'Dólio Djirukí',
    literalMeaning: 'Soco circular',
    technicalMeaning: 'Soco com trajetória semi-circular visando a têmpora ou as costelas flutuantes do adversário.',
    description: 'Executado com o cotovelo dobrado em ângulo de 90 graus, rotacionando o tronco para gerar impacto lateral concentrado nos nós dos dedos.',
    bodyRegions: ['knuckles'],
    sources: [
      { institution: 'Kukkiwon', title: 'Taekwondo Textbook — Hand Techniques', editionOrYear: '2022', locator: 'Jireugi: Dollyo Jireugi, p. 132' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
  {
    slug: 'chi-jirugi',
    categoryId: 'sonkisul',
    subcategoryId: 'socos-jireugi',
    name: 'Chi Jirugi (Soco Ascendente / Uppercut)',
    hangul: '치지르기',
    romanization: 'Chi Jireugi',
    pronunciation_pt: 'Tchi Djirukí',
    literalMeaning: 'Soco subindo / soco para cima',
    technicalMeaning: 'Soco vertical ascendente direcionado ao queixo ou ao plexo solar, com o punho com a palma voltada para o praticante.',
    description: 'Utilizado em combate a curta distância, subindo explosivamente através do impulso das pernas e da extensão do quadril.',
    bodyRegions: ['knuckles', 'wrist'],
    sources: [
      { institution: 'Kukkiwon', title: 'Taekwondo Textbook — Hand Techniques', editionOrYear: '2022', locator: 'Jireugi: Chi Jireugi, p. 134' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
  {
    slug: 'deung-jumeok-chigi',
    categoryId: 'sonkisul',
    subcategoryId: 'impactos-chigi',
    name: 'Deung Jumeok Chigi (Golpe com o Dorso do Punho)',
    hangul: '등주먹치기',
    romanization: 'Deung Jumeok Chigi',
    pronunciation_pt: 'Deung Djumóqui Tchigui',
    literalMeaning: 'Golpe com as costas do punho',
    technicalMeaning: 'Golpe de chicoteamento utilizando os nós dos dedos no dorso do punho, mirando o nariz ou a têmpora.',
    description: 'Movimento flexível de chicote que parte da flexão do cotovelo, aproveitando a velocidade de estalo da articulação do punho.',
    bodyRegions: ['sondeung', 'knuckles'],
    sources: [
      { institution: 'Kukkiwon', title: 'Taekwondo Textbook — Hand Techniques', editionOrYear: '2022', locator: 'Chigi: Deung Jumeok, p. 150' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
  {
    slug: 'sonnal-chigi',
    categoryId: 'sonkisul',
    subcategoryId: 'impactos-chigi',
    name: 'Sonnal Chigi (Golpe com a Faca da Mão)',
    hangul: '손날치기',
    romanization: 'Sonnal Chigi',
    pronunciation_pt: 'Sonnal Tchigui',
    literalMeaning: 'Golpe com a lâmina/faca da mão',
    technicalMeaning: 'Golpe cortante com a borda externa da mão aberta (do dedo mínimo ao pulso), visando o pescoço ou a clavícula.',
    description: 'A mão permanece aberta com os dedos firmemente unidos e o polegar dobrado rente à palma, concentrando a massa muscular na borda externa lateral.',
    bodyRegions: ['sonnal', 'palm'],
    sources: [
      { institution: 'Kukkiwon', title: 'Taekwondo Textbook — Hand Techniques', editionOrYear: '2022', locator: 'Chigi: Sonnal Chigi, p. 154' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
  {
    slug: 'batangson-chigi',
    categoryId: 'sonkisul',
    subcategoryId: 'impactos-chigi',
    name: 'Batangson Chigi (Golpe com a Base da Palma)',
    hangul: '바탕손치기',
    romanization: 'Batangson Chigi',
    pronunciation_pt: 'Batangson Tchigui',
    literalMeaning: 'Golpe com o calcanhar da mão / base da palma',
    technicalMeaning: 'Golpe com a base carnosa inferior da palma da mão com os dedos fletidos para trás, direcionado ao queixo ou peito.',
    description: 'Excelente golpe de defesa pessoal pois não expõe os ossos delicados dos dedos ou do punho a fraturas.',
    bodyRegions: ['batangson', 'palm'],
    sources: [
      { institution: 'Kukkiwon', title: 'Taekwondo Textbook — Hand Techniques', editionOrYear: '2022', locator: 'Chigi: Batangson, p. 158' },
    ],
    mediaPrepared: { hasVideoPlaceholder: true, hasPhotoPlaceholder: true },
  },
];

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
