import type { LibraryReference } from '../lib/library';
import { sparringSource } from './kyorugi-guide';

export type KibonEntry = {
  slug: string;
  romanization: string;
  hangul: string | null;
  pronunciationPt: string | null;
  subtitlePt: string;
  kindLabel:
    | 'Bases (Seogi)'
    | 'Posturas de preparação (Junbi-jase)'
    | 'Defesas (Makgi)'
    | 'Socos e dedos (Jireugi / Jjireugi)'
    | 'Golpes (Chigi)'
    | 'Alturas e direções';
  atlasRegion: 'legs' | 'feet' | 'arms' | 'hands' | 'torso' | 'head';
  atlasLabel: string;
  summary: string;
  studyPoints: readonly string[];
  variants: readonly string[];
  acervoSlug?: string;
  moduleHref?: string;
  moduleLabel?: string;
  references: readonly {
    field: 'hangul' | 'romanization' | 'context' | 'terminology';
    reference: LibraryReference;
  }[];
  relatedLibrarySlugs: readonly string[];
};

const kukkiwon2012Ref = (locator: string): LibraryReference => ({
  institution: 'Kukkiwon',
  title: 'Taekwondo Technical Terminology',
  edition: '2011/2012',
  url: 'https://research.kukkiwon.or.kr/homepage/boardMedia/11621',
  locator,
});

const board56Ref = (boardNo: number, name: string): LibraryReference => ({
  institution: 'Kukkiwon',
  title: `Composition of Taekwondo — Sparring (${name})`,
  edition: 'Portal institucional em inglês (Board 56)',
  url: sparringSource(boardNo),
  locator: `Board 56 / article ${boardNo} (${name})`,
});

export const kibonEntries: readonly KibonEntry[] = [
  // BASES (SEOGI)
  {
    slug: 'ap-seogi',
    romanization: 'Ap-seogi',
    hangul: '앞서기',
    pronunciationPt: 'áp-só-gui',
    subtitlePt: 'Base curta de caminhada frontal',
    kindLabel: 'Bases (Seogi)',
    atlasRegion: 'legs',
    atlasLabel: 'Pernas e alinhamento de passo natural',
    summary:
      'Base fundamental de deslocamento frontal curto documentada na família Seogi da Kukkiwon. Permite avançar e recuar com naturalidade, mantendo o tronco ereto e os pés voltados predominantemente para a frente em formas iniciais como os primeiros Taegeuk.',
    studyPoints: [
      'Diferenciar o comprimento curto de Ap-seogi (passo natural firme) da passada longa e profunda de Apgubi.',
      'Evitar caminhar sobre uma única linha estreita ("corda bamba"): preserve largura funcional de quadril para estabilidade lateral.',
      'Manter a altura dos quadris constante na transição entre passos.',
    ],
    variants: ['Ap Seogi', 'Ap Sogi', 'Base curta frontal', 'Walking stance'],
    acervoSlug: 'ap-seogi',
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('§15 Seogi > Ap-seogi') },
      { field: 'romanization', reference: kukkiwon2012Ref('§15 Seogi > Ap-seogi') },
    ],
    relatedLibrarySlugs: ['apgubi', 'dwitgubi', 'taegeuk-1-jang'],
  },
  {
    slug: 'apgubi',
    romanization: 'Apgubi',
    hangul: '앞굽이',
    pronunciationPt: 'áp-gu-bi',
    subtitlePt: 'Base avançada longa com flexão do joelho dianteiro',
    kindLabel: 'Bases (Seogi)',
    atlasRegion: 'legs',
    atlasLabel: 'Joelho dianteiro flexionado e perna traseira estendida',
    summary:
      'Base longa de avanço e sustentação em que a perna dianteira flexiona firmemente recebendo maior parcela do peso, enquanto a perna traseira permanece estendida ancorando o impulso contra o solo. Presente em praticamente todos os Poomsae e em exercícios de Sebon Kyorugi.',
    studyPoints: [
      'Alinhar o joelho dianteiro sobre o eixo do pé sem deixá-lo colapsar para dentro.',
      'Manter a planta inteira do pé traseiro (inclusive o calcanhar) conectada ao solo na execução padrão.',
      'Usar a tração da perna traseira e o encaixe do quadril no momento final de defesas e socos.',
    ],
    variants: ['Ap-gubi', 'Ap Kubi', 'Apgubi-seogi', 'Base avançada longa', 'Forward stance'],
    acervoSlug: 'apgubi',
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('§15 Seogi > Apgubi') },
      { field: 'romanization', reference: kukkiwon2012Ref('§15 Seogi > Apgubi') },
    ],
    relatedLibrarySlugs: ['ap-seogi', 'dwitgubi', 'jumeok'],
  },
  {
    slug: 'dwitgubi',
    romanization: 'Dwitgubi',
    hangul: '뒷굽이',
    pronunciationPt: 'duit-gu-bi',
    subtitlePt: 'Base recuada com peso concentrado na perna de trás',
    kindLabel: 'Bases (Seogi)',
    atlasRegion: 'legs',
    atlasLabel: 'Sustentação posterior e prontidão da perna dianteira',
    summary:
      'Base defensiva e de transição em que a maior parte da massa corporal repousa sobre a perna traseira flexionada, deixando a perna dianteira mais leve para ajustes rápidos de distância ou chutes frontais/laterais. Muito frequente junto a defesas com faca da mão (Sonnal).',
    studyPoints: [
      'Formar ângulo perpendicular aproximado entre a direção dos pés ("em L"), mantendo os dois joelhos flexionados.',
      'Sentar o peso claramente sobre o quadril traseiro sem inclinar o tronco excessivamente para trás.',
      'Praticar a combinação clássica Dwitgubi + Sonnal-bakkat-makgi / Sonnal-makgi.',
    ],
    variants: ['Dwit-gubi', 'Twit Kubi', 'Dwitgubi-seogi', 'Base recuada em L', 'Back stance'],
    acervoSlug: 'dwitgubi',
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('§15 Seogi > Dwitgubi') },
      { field: 'romanization', reference: kukkiwon2012Ref('§15 Seogi > Dwitgubi') },
    ],
    relatedLibrarySlugs: ['sonnal-makgi-familia', 'sonnal', 'taegeuk-3-jang'],
  },
  {
    slug: 'juchum-seogi',
    romanization: 'Juchum-seogi',
    hangul: '주춤서기',
    pronunciationPt: 'dju-tchum-só-gui',
    subtitlePt: 'Base lateral paralela agachada (base do cavaleiro)',
    kindLabel: 'Bases (Seogi)',
    atlasRegion: 'legs',
    atlasLabel: 'Quadril baixo, coxas simétricas e pés paralelos',
    summary:
      'Base simétrica de grande estabilidade lateral em que os pés permanecem paralelos afastados além da largura dos ombros e ambos os joelhos flexionam distribuindo o peso igualmente. Essencial para treino básico de socos no tronco, séries laterais e formas como Keumgang e Jitae.',
    studyPoints: [
      'Manter as bordas dos pés paralelas voltadas para a frente, evitando abrir excessivamente as pontas dos pés para fora.',
      'Sustentar a coluna vertical com o centro de gravidade rebaixado.',
      'Distribuir o peso em 50/50 entre as duas pernas.',
    ],
    variants: ['Juchum Seogi', 'Juchum Sogi', 'Base do cavaleiro', 'Riding stance'],
    acervoSlug: 'juchum-seogi',
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('§15 Seogi > Juchum-seogi') },
      { field: 'romanization', reference: kukkiwon2012Ref('§15 Seogi > Juchum-seogi') },
    ],
    relatedLibrarySlugs: ['jeocheo-jireugi', 'keumgang', 'apgubi'],
  },
  {
    slug: 'narani-moa-seogi',
    romanization: 'Narani-seogi',
    hangul: '나란히서기',
    pronunciationPt: 'na-ra-ni-só-gui',
    subtitlePt: 'Base paralela de prontidão e relação com Moa-seogi (pés unidos)',
    kindLabel: 'Bases (Seogi)',
    atlasRegion: 'feet',
    atlasLabel: 'Alinhamento paralelo dos pés na preparação e encerramento',
    summary:
      'Narani-seogi posiciona os pés paralelos à largura aproximada de um pé de distância, servindo de fundação para a postura fundamental de preparação (Gibon-junbi). Ao lado de Moa-seogi (모아서기, pés unidos), organiza o início, a saudação e o encerramento formal da prática.',
    studyPoints: [
      'Em Moa-seogi (모아서기), tocar suavemente bordas internas dos pés mantendo postura alerta sem rigidez nos ombros.',
      'Em Narani-seogi (나란히서기), deslocar o pé esquerdo com precisão mantendo ambos os pés apontados exatamente para a frente.',
      'Tratar o início e o retorno à postura final (Baro) com a mesma concentração dedicada aos golpes.',
    ],
    variants: ['Narani Seogi', 'Moa-seogi (모아서기)', 'Charyeot / Junbi', 'Parallel stance'],
    acervoSlug: 'narani-seogi',
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('§15 Seogi > Narani-seogi') },
      { field: 'terminology', reference: kukkiwon2012Ref('§15 Seogi > Moa-seogi') },
    ],
    relatedLibrarySlugs: ['gibon-junbi', 'ap-seogi', 'iron-espirito-cortesia-dojang'],
  },
  {
    slug: 'beom-hakdari-kkoa-seogi',
    romanization: 'Beom-seogi',
    hangul: '범서기',
    pronunciationPt: 'bóm-só-gui',
    subtitlePt: 'Base curta do tigre e bases especiais (Hakdari-seogi, Kkoa-seogi)',
    kindLabel: 'Bases (Seogi)',
    atlasRegion: 'legs',
    atlasLabel: 'Equilíbrio concentrado e apoio sobre antepé (Apchuk)',
    summary:
      'Em Beom-seogi (base do tigre), o peso concentra-se intensamente na perna traseira flexionada enquanto o pé dianteiro toca levemente o solo com a bola do pé (Apchuk). Nos graus intermediários e avançados, soma-se ao estudo de Hakdari-seogi (학다리서기, base unipodal da garça) e Kkoa-seogi (꼬아서기, base cruzada).',
    studyPoints: [
      'Em Beom-seogi, manter o calcanhar dianteiro elevado com apoio controlado sobre Apchuk, pronto para chutar ou avançar.',
      'Em Hakdari-seogi (presente em Keumgang e Hansu), estabilizar tornozelo, joelho e core sem oscilar os ombros.',
      'Em Kkoa-seogi, controlar o cruzamento de transição após saltos ou deslocamentos laterais.',
    ],
    variants: [
      'Beom Seogi (base do tigre)',
      'Hakdari-seogi (학다리서기)',
      'Kkoa-seogi (꼬아서기)',
      'Tiger stance',
    ],
    acervoSlug: 'beom-seogi',
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('§15 Seogi > Beom-seogi') },
      { field: 'terminology', reference: kukkiwon2012Ref('§15 Seogi > Hakdari-seogi / Kkoa-seogi') },
    ],
    relatedLibrarySlugs: ['taegeuk-7-jang', 'keumgang', 'batangson'],
  },

  // POSTURAS DE PREPARAÇÃO (JUNBI-JASE)
  {
    slug: 'gibon-junbi',
    romanization: 'Gibon-junbi',
    hangul: '기본준비',
    pronunciationPt: 'gui-bôn-djun-bi',
    subtitlePt: 'Postura básica de preparação para fundamentos e formas iniciais',
    kindLabel: 'Posturas de preparação (Junbi-jase)',
    atlasRegion: 'hands',
    atlasLabel: 'Punhos fechados (Jumeok) alinhados diante do abdômen inferior',
    summary:
      'Postura padrão de prontidão documentada na seção Junbi-jase da Kukkiwon, executada sobre Narani-seogi com respiração coordenada e posicionamento calmo dos dois punhos fechados à frente do baixo-ventre. Marca a abertura de Taegeuk 1 a 6, Taegeuk 8 e treinos de Kibon Dongjak.',
    studyPoints: [
      'Coordenar inspiração suave ao elevar as mãos abertas à altura do plexo e expiração controlada ao fechar os punhos descendo.',
      'Manter cotovelos naturalmente relaxados, sem elevar os ombros.',
      'Fixar o olhar à frente antes de iniciar o primeiro movimento.',
    ],
    variants: ['Gibon Junbi Jase', 'Joonbi', 'Junbi Seogi'],
    acervoSlug: 'gibon-junbi',
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('§8 Junbi-jase > Gibon-junbi') },
      { field: 'romanization', reference: kukkiwon2012Ref('§8 Junbi-jase > Gibon-junbi') },
    ],
    relatedLibrarySlugs: ['narani-moa-seogi', 'jumeok', 'taegeuk-1-jang'],
  },
  {
    slug: 'tongmilgi-bojumeok-junbi',
    romanization: 'Bojumeok-junbi',
    hangul: '보주먹준비',
    pronunciationPt: 'bô-dju-mók-djun-bi',
    subtitlePt: 'Posturas especiais de preparação (Bojumeok, Tongmilgi, Dujumeok-heori e Gyeopson)',
    kindLabel: 'Posturas de preparação (Junbi-jase)',
    atlasRegion: 'hands',
    atlasLabel: 'Envolvimento do punho e configurações simétricas de mãos',
    summary:
      'Além da preparação básica, a terminologia da Kukkiwon registra posturas específicas de abertura: Bojumeok-junbi (보주먹준비, mão envolvendo o punho, presente em Taegeuk 7 e Ilyeo), Tongmilgi-junbi (통밀기준비, presente em Koryo), Dujumeok-heori-junbi (두주먹허리준비) e Gyeopson-junbi (겹손준비).',
    studyPoints: [
      'Respeitar a altura exata das mãos (diante do queixo, peito, plexo ou cintura) exigida pela forma específica.',
      'Executar o movimento em ritmo respiratório contínuo e solene.',
      'Consultar no Acervo cada uma das cinco posturas documentadas em §8 Junbi-jase.',
    ],
    variants: [
      'Bojumeok-junbi (보주먹준비)',
      'Tongmilgi-junbi (통밀기준비)',
      'Dujumeok-heori-junbi (두주먹허리준비)',
      'Gyeopson-junbi (겹손준비)',
    ],
    acervoSlug: 'bojumeok-junbi',
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('§8 Junbi-jase > Bojumeok-junbi') },
      { field: 'terminology', reference: kukkiwon2012Ref('§8 Junbi-jase > Tongmilgi-junbi / Gyeopson-junbi') },
    ],
    relatedLibrarySlugs: ['taegeuk-7-jang', 'koryo', 'ilyeo'],
  },

  // DEFESAS (MAKGI)
  {
    slug: 'naeryeo-makgi',
    romanization: 'Naeryeo-makgi',
    hangul: '내려막기',
    pronunciationPt: 'né-rió-mák-gui',
    subtitlePt: 'Defesa descendente para proteção da seção inferior (associada a Arae-makgi)',
    kindLabel: 'Defesas (Makgi)',
    atlasRegion: 'arms',
    atlasLabel: 'Antebraço externo varrendo de cima para baixo',
    summary:
      'Movimento fundamental da família Makgi em que o antebraço desce em trajetória firme protegendo a região inferior do tronco e quadril contra chutes ou ataques baixos. No ensino cotidiano e em Poomsae, quando direcionada à faixa baixa com o antebraço externo, é amplamente conhecida como Arae-makgi.',
    studyPoints: [
      'Iniciar o cruzamento preparatório junto ao ombro oposto usando o braço auxiliar como reação coordenada (puxada à cintura).',
      'Alinhar punho e antebraço sem dobrar o pulso no instante final do bloqueio.',
      'Finalizar cerca de um punho a dois punhos de distância acima da coxa dianteira.',
    ],
    variants: ['Arae-makgi', 'Arae Makki', 'Bakkatpalmok-naeryeo-makgi', 'Low block', 'Defesa baixa'],
    acervoSlug: 'naeryeo-makgi',
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('§10 Makgi > Naeryeo-makgi') },
      { field: 'context', reference: board56Ref(1365, 'Makgi') },
    ],
    relatedLibrarySlugs: ['ollyeo-makgi', 'an-makgi', 'taegeuk-1-jang'],
  },
  {
    slug: 'ollyeo-makgi',
    romanization: 'Ollyeo-makgi',
    hangul: '올려막기',
    pronunciationPt: 'ôl-lió-mák-gui',
    subtitlePt: 'Defesa ascendente para proteção superior (associada a Olgul-makgi)',
    kindLabel: 'Defesas (Makgi)',
    atlasRegion: 'head',
    atlasLabel: 'Proteção ascendente acima da testa com inclinação angular',
    summary:
      'Defesa ascendente documentada em §10 Makgi da Kukkiwon para interceptar e desviar ataques descendentes ou direcionados à cabeça. Na prática de fundamentos e Poomsae, quando protege a seção alta, corresponde ao bloqueio superior conhecido nas escolas como Olgul-makgi.',
    studyPoints: [
      'Posicionar o antebraço levemente inclinado acima da testa para desviar a força lateralmente, e não totalmente horizontal.',
      'Manter um punho de distância diante da testa sem obstruir o próprio campo de visão.',
      'Rotacionar o antebraço no final da subida conectando quadril e cintura escapular.',
    ],
    variants: ['Olgul-makgi', 'Eolgul-makgi', 'Olgul Makki', 'High rising block', 'Defesa alta'],
    acervoSlug: 'ollyeo-makgi',
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('§10 Makgi > Ollyeo-makgi') },
      { field: 'context', reference: board56Ref(1365, 'Makgi') },
    ],
    relatedLibrarySlugs: ['naeryeo-makgi', 'an-makgi', 'taegeuk-2-jang'],
  },
  {
    slug: 'an-makgi',
    romanization: 'An-makgi',
    hangul: '안막기',
    pronunciationPt: 'ân-mák-gui',
    subtitlePt: 'Defesa de fora para dentro protegendo a linha central do tronco',
    kindLabel: 'Defesas (Makgi)',
    atlasRegion: 'arms',
    atlasLabel: 'Trajetória convergente do antebraço rumo ao eixo central',
    summary:
      'Bloqueio horizontal/convergente da família Makgi que intercepta ataques diretos cruzando de fora para dentro até a linha central do corpo (Momtong). Pode ser executado com o lado interno ou externo do antebraço ou com a faca da mão (Sonnal-an-makgi).',
    studyPoints: [
      'Ajustar a altura do punho bloqueador na linha do ombro/plexo quando aplicado na seção média (Momtong).',
      'Evitar ultrapassar exageradamente a linha central para não expor o flanco externo.',
      'Diferenciar com o professor se o exercício utiliza o mesmo lado da perna avançada ou o braço oposto (Baro).',
    ],
    variants: ['Momtong-an-makgi', 'Momtong-makgi', 'An Makki', 'Inward middle block'],
    acervoSlug: 'an-makgi',
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('§10 Makgi > An-makgi') },
      { field: 'context', reference: board56Ref(1365, 'Makgi') },
    ],
    relatedLibrarySlugs: ['bakkat-makgi', 'sonnal-makgi-familia', 'kibon-alturas-direcoes'],
  },
  {
    slug: 'bakkat-makgi',
    romanization: 'Bakkat-makgi',
    hangul: '바깥막기',
    pronunciationPt: 'ba-kát-mák-gui',
    subtitlePt: 'Defesa de dentro para fora abrindo a linha de ataque',
    kindLabel: 'Defesas (Makgi)',
    atlasRegion: 'arms',
    atlasLabel: 'Expansão do antebraço do eixo interno para fora',
    summary:
      'Defesa em que o membro superior parte do interior cruzado junto ao corpo e expande-se para fora desviando o ataque adversário. Aparece tanto com antebraço interno (Anpalmok) quanto com antebraço externo (Bakkatpalmok) ou faca da mão (Sonnal-bakkat-makgi).',
    studyPoints: [
      'Identificar qual superfície do antebraço (Anpalmok ou Bakkatpalmok) realiza o impacto conforme a rotação final do pulso.',
      'Manter o cotovelo semiflexionado a distância funcional das costelas, sem esticar o braço por completo.',
      'Coordenar o giro do quadril na abertura do bloqueio.',
    ],
    variants: ['Momtong-bakkat-makgi', 'Pakkat Makki', 'Outward block', 'Defesa para fora'],
    acervoSlug: 'bakkat-makgi',
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('§10 Makgi > Bakkat-makgi') },
      { field: 'context', reference: board56Ref(1365, 'Makgi') },
    ],
    relatedLibrarySlugs: ['an-makgi', 'sonnal-makgi-familia', 'taegeuk-4-jang'],
  },
  {
    slug: 'sonnal-makgi-familia',
    romanization: 'Sonnal-bakkat-makgi',
    hangul: '손날 바깥막기',
    pronunciationPt: 'sôn-nal ba-kát-mák-gui',
    subtitlePt: 'Defesas com faca da mão (Sonnal-bakkat-makgi, Sonnal-an-makgi e Geodeureo-makgi)',
    kindLabel: 'Defesas (Makgi)',
    atlasRegion: 'hands',
    atlasLabel: 'Borda externa da mão aberta (Sonnal) e mão auxiliar de suporte',
    summary:
      'Conjunto clássico de bloqueios executados com a borda ulnar da mão aberta (Sonnal), seja com uma única mão (Hansonnal) ou com assistência protetora da segunda mão junto ao plexo solar (Sonnal-makgi / Geodeureo-makgi, 거들어막기). Documentado em §10 Makgi da Kukkiwon.',
    studyPoints: [
      'Manter os quatro dedos unidos e o polegar flexionado firme na lateral da palma (configuração correta de Sonnal no Atlas).',
      'Nas variações duplas sobre Dwitgubi, posicionar a mão auxiliar protegendo o plexo sem encostá-la colada ao peito.',
      'Conectar esta ficha ao estudo anatômico completo de Sonnal no Atlas da mão.',
    ],
    variants: [
      'Sonnal-makgi',
      'Hansonnal-makgi',
      'Sonnal-an-makgi (손날 안막기)',
      'Geodeureo-makgi (거들어막기)',
      'Knife-hand block',
    ],
    acervoSlug: 'sonnal-bakkat-makgi',
    references: [
      {
        field: 'hangul',
        reference: kukkiwon2012Ref('§10 Makgi > Bakkat-makgi > Sonnal-bakkat-makgi (páginas 44–45 do PDF)'),
      },
      {
        field: 'terminology',
        reference: kukkiwon2012Ref('§10 Makgi > An-makgi > Sonnal-an-makgi (página 43 do PDF)'),
      },
      { field: 'context', reference: board56Ref(1365, 'Makgi') },
    ],
    relatedLibrarySlugs: ['sonnal', 'dwitgubi', 'taegeuk-4-jang'],
  },

  // SOCOS E ESTOCADAS (JIREUGI / JJIREUGI)
  {
    slug: 'jeocheo-jireugi',
    romanization: 'Jeocheo-jireugi',
    hangul: '젖혀지르기',
    pronunciationPt: 'djó-tchió-dji-rư-gui',
    subtitlePt: 'Família de socos (Jireugi): soco direto padrão, vertical, lateral e ascendente',
    kindLabel: 'Socos e dedos (Jireugi / Jjireugi)',
    atlasRegion: 'hands',
    atlasLabel: 'Punho fechado (Jumeok) alinhado aos nós do indicador e médio',
    summary:
      'A família Jireugi (Board 56 / artigo 1366 e §5 Jireugi) abrange os ataques lineares e curvos executados com o punho fechado (Jumeok). Inclui o soco direto com rotação final pronada, bem como variações documentadas pela Kukkiwon como Jeocheo-jireugi (젖혀지르기, palma voltada para cima em curta distância), Sewo-jiruegi (세워지르기, punho vertical), Yeop-jireugi (옆지르기, lateral) e Chi-jireugi (치지르기, ascendente).',
    studyPoints: [
      'Concentrar o contato nos dois primeiros nós metacarpofalângicos (indicador e médio) mantendo o punho reto com o rádio/ulna.',
      'Tracionar vigorosamente o punho oposto à cintura (reação complementar) no exato instante da extensão.',
      'Adaptar a altura do alvo entre Momtong (plexo solar) e Olgul (filtro labial/queixo) sem elevar o ombro.',
    ],
    variants: [
      'Momtong-jireugi',
      'Olgul-jireugi',
      'Baro-jireugi / Bandae-jireugi',
      'Sewo-jiruegi (세워지르기)',
      'Yeop-jireugi (옆지르기)',
    ],
    acervoSlug: 'jeocheo-jireugi',
    references: [
      { field: 'context', reference: board56Ref(1366, 'Jireugi') },
      { field: 'hangul', reference: kukkiwon2012Ref('§5 Jireugi > Jeocheo-jireugi / Sewo-jiruegi / Yeop-jireugi') },
    ],
    relatedLibrarySlugs: ['jumeok', 'seun-jumeok', 'juchum-seogi'],
  },
  {
    slug: 'sewo-jjireugi',
    romanization: 'Sewo-jjireugi',
    hangul: '세워찌르기',
    pronunciationPt: 'sê-uô-tchi-rư-gui',
    subtitlePt: 'Ataques penetrantes com pontas dos dedos (Jjireugi / Pyeonsonkkeut)',
    kindLabel: 'Socos e dedos (Jireugi / Jjireugi)',
    atlasRegion: 'hands',
    atlasLabel: 'Pontas dos dedos alinhadas (Pyeonsonkkeut, Gawisonkkeut, Hansonkkeut)',
    summary:
      'Na terminologia da Kukkiwon (§6 Jjireugi), Jjireugi distingue as estocadas executadas com as pontas dos dedos (Sonkkeut) dos socos de punho fechado (Jireugi). Compreende Sewo-jjireugi (세워찌르기, palma vertical, clássico em Taegeuk 4 e Koryo), Eopeo-jjireugi (엎어찌르기, palma para baixo) e Jeocheo-jjireugi (젖혀찌르기, palma para cima).',
    studyPoints: [
      'Unir firmemente os dedos em Pyeonsonkkeut (mão em lança) com o polegar dobrado e travado para proteger as falanges.',
      'Utilizar suporte da outra mão sob o cotovelo (como em Pyeonsonkkeut-sewo-jjireugi) quando previsto na forma.',
      'Treinar estocadas de dedos apenas no ar ou em alvos macios apropriados, preservando as articulações interfalângicas.',
    ],
    variants: [
      'Pyeonsonkkeut-sewo-jjireugi',
      'Eopeo-jjireugi (엎어찌르기)',
      'Jeocheo-jjireugi (젖혀찌르기)',
      'Spear-hand thrust',
    ],
    acervoSlug: 'sewo-jjireugi',
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('§6 Jjireugi > Sewo-jjireugi / Eopeo-jjireugi') },
    ],
    relatedLibrarySlugs: ['pyeonsonkkeut', 'gawisonkkeut', 'taegeuk-4-jang'],
  },

  // GOLPES DE IMPACTO (CHIGI)
  {
    slug: 'sonnal-an-chigi',
    romanization: 'Sonnal-an-chigi',
    hangul: '손날 안치기',
    pronunciationPt: 'sôn-nal ân-tchi-gui',
    subtitlePt: 'Golpe circular para dentro com faca da mão e família Chigi de mão/punho',
    kindLabel: 'Golpes (Chigi)',
    atlasRegion: 'hands',
    atlasLabel: 'Superfícies de percussão da mão (Sonnal, Mejumeok, Deungjumeok, Ageumson)',
    summary:
      'A família Chigi (Board 56 / artigo 1367 e §2 Chigi) reúne ataques percussivos em arco ou chicoteio. Sonnal-an-chigi utiliza a borda externa da mão (Sonnal) avançando de fora para dentro na altura do pescoço/clavícula, presente já em Taegeuk 3 Jang; a mesma família abrange golpes com Deungjumeok (dorso do punho), Mejumeok (punho martelo) e Jebipum-chigi.',
    studyPoints: [
      'Gerar velocidade final de chicoteio rotacionando o antebraço apenas no último trecho da trajetória.',
      'Manter o pulso firme alinhado com a borda ulnar (Sonnal).',
      'Comparar no Atlas as superfícies Sonnal, Deungjumeok, Mejumeok e Ageumson usadas em diferentes golpes de Chigi.',
    ],
    variants: [
      'Sonnal-mok-chigi',
      'Deungjumeok-ap-chigi',
      'Mejumeok-naeryeo-chigi',
      'Jebipum-chigi (제비품치기)',
      'Knife-hand inward strike',
    ],
    acervoSlug: 'sonnal-an-chigi',
    references: [
      {
        field: 'hangul',
        reference: kukkiwon2012Ref('§2 Chigi > An-chigi > Sonnal-an-chigi (use; página 22 do PDF)'),
      },
      { field: 'context', reference: board56Ref(1367, 'Chigi') },
    ],
    relatedLibrarySlugs: ['sonnal', 'deungjumeok', 'mejumeok'],
  },
  {
    slug: 'palgup-mureup-chigi',
    romanization: 'Palgup-dollyeo-chigi',
    hangul: '팔굽 돌려치기',
    pronunciationPt: 'pál-gup dôl-lió-tchi-gui',
    subtitlePt: 'Golpes de curta distância com cotovelo (Palgup) e joelho (Mureup)',
    kindLabel: 'Golpes (Chigi)',
    atlasRegion: 'arms',
    atlasLabel: 'Cotovelo (Palgup) e joelho (Mureup) em ataques de curta distância',
    summary:
      'Dentro de §2 Chigi da Kukkiwon, os golpes de cotovelo (팔굽, Palgup) e joelho (무릎, Mureup) fornecem potência máxima em distância curta quando não há espaço para chutes longos ou extensão completa do braço — incluindo Palgup-dollyeo-chigi (circular, presente em Taegeuk 5), Palgup-ollyeo-chigi (ascendente), Palgup-pyojeok-chigi (contra mão-alvo) e Mureup-ollyeo-chigi.',
    studyPoints: [
      'Impulsionar os golpes de cotovelo (Palgup) com rotação integral do quadril e tronco, não apenas do ombro.',
      'Em golpes contra a palma oposta (Pyojeok-chigi), usar a mão aberta como referência espacial controlada sem sobrecarregar o punho.',
      'Em Mureup-chigi, tracionar os braços de cima para baixo coordenados com a elevação explosiva do joelho.',
    ],
    variants: [
      'Palgup-chigi (팔굽)',
      'Palgup-ollyeo-chigi (팔굽 올려치기)',
      'Mureup-ollyeo-chigi (무릎 올려치기)',
      'Mureup-dollyeo-chigi (무릎 돌려치기)',
      'Elbow and knee strikes',
    ],
    acervoSlug: 'palgup-dollyeo-chigi',
    references: [
      {
        field: 'hangul',
        reference: kukkiwon2012Ref('§2 Chigi > Dollyeo-chigi > Palgup-dollyeo-chigi / Mureup-dollyeo-chigi'),
      },
      { field: 'terminology', reference: kukkiwon2012Ref('Appendix > Applicable Parts of the Body > Palgup / Mureup') },
      { field: 'context', reference: board56Ref(1367, 'Chigi') },
    ],
    relatedLibrarySlugs: ['taegeuk-5-jang', 'sonnal-an-chigi', 'ppaegi-kkeokgi-aplicacoes'],
  },

  // ALTURAS E DIREÇÕES
  {
    slug: 'kibon-alturas-direcoes',
    romanization: 'Alturas e direções no Kibon Dongjak',
    hangul: null,
    pronunciationPt: null,
    subtitlePt: 'Guia prático de faixas alta, média e baixa e eixos espaciais do corpo',
    kindLabel: 'Alturas e direções',
    atlasRegion: 'torso',
    atlasLabel: 'Divisão didática de seções corporais e eixos de movimento',
    summary:
      'Todo treino de fundamentos (Kibon Dongjak) organiza o espaço ao redor do praticante em três alturas de referência — baixa (abaixo da cintura/umbigo), média (tronco e plexo solar) e alta (pescoço e cabeça) — combinadas a eixos direcionais: frontal (Ap), lateral (Yeop), circular (Dollyeo), posterior (Dwi), descendente (Naeryeo), ascendente (Ollyeo), interno (An) e externo (Bakkat).',
    studyPoints: [
      'Ajustar a altura de cada técnica usando o seu próprio corpo como espelho quando treinar sozinho no ar.',
      'Em dupla (Matchuo Kyorugi), calibrar a altura real de acordo com a estatura do parceiro de treino.',
      'Praticar no módulo interativo de Alturas e Direções antes de memorizar combinações longas.',
    ],
    variants: ['Seções Arae Momtong Olgul', 'Direções Ap Yeop Dollyeo Dwi', 'Eixos espaciais'],
    moduleHref: '/fundamentos/alturas-e-direcoes',
    moduleLabel: 'Abrir módulo interativo de Alturas e Direções',
    references: [{ field: 'terminology', reference: kukkiwon2012Ref('Estrutura direcional das seções técnicas') }],
    relatedLibrarySlugs: ['naeryeo-makgi', 'an-makgi', 'ollyeo-makgi'],
  },
];
