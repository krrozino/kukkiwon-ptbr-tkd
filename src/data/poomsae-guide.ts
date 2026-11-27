export const kukkiwonPoomsaeSource =
  'https://www.kukkiwon.or.kr/eng/board/list?boardManagementNo=55&menuLevel=3&menuNo=72';

export const kukkiwonTaegeukVideosNotice =
  'https://kukkiwon.or.kr/eng/board/read?boardManagementNo=49&boardNo=3515&menuLevel=2&menuNo=91';

export const poomsaeBoardUrl = (boardNo: number) =>
  `https://www.kukkiwon.or.kr/eng/board/read?boardManagementNo=55&boardNo=${boardNo}&menuLevel=3&menuNo=72`;

export type TrigramBar = 0 | 1; // 1 = linha contínua (Yang), 0 = linha partida (Yin), de cima para baixo

export type TaegeukFormGuide = {
  kind: 'taegeuk';
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  slug: string;
  name: string;
  boardNo: number;
  symbol: string;
  note: string;
  trigram: {
    romanization: string;
    symbolPt: string;
    bars: readonly [TrigramBar, TrigramBar, TrigramBar];
    polaritySummary: string;
  };
  philosophySummary: string;
  bodyCorrespondence: {
    label: string;
    atlasRegion: 'head' | 'torso' | 'feet' | 'arms' | 'legs' | 'hands';
    summary: string;
  };
  practiceFocus: readonly string[];
  relatedAcervoJunbi: {
    slug: string;
    romanization: string;
    note: string;
  };
  evidence: {
    institution: 'Kukkiwon';
    document: 'Composition of Taekwondo — Poomsae';
    locator: string;
    url: string;
    sourceCheckedAt: string;
  };
};

export type PoomsaeLineKind = 'sa' | 'san' | 'gong' | 'ship' | 'o' | 'u' | 'su';

export type DanFormGuide = {
  kind: 'dan';
  order: number;
  slug: string;
  name: string;
  boardNo: number;
  theme: string;
  philosophySummary: string;
  poomsaeLine: {
    character: string;
    kind: PoomsaeLineKind;
    meaningPt: string;
  } | null;
  bodyCorrespondence: {
    label: string;
    atlasRegion: 'head' | 'torso' | 'feet' | 'arms' | 'legs' | 'hands';
    summary: string;
  };
  practiceFocus: readonly string[];
  relatedAcervoJunbi: {
    slug: string;
    romanization: string;
    note: string;
  };
  evidence: {
    institution: 'Kukkiwon';
    document: 'Composition of Taekwondo — Poomsae';
    locator: string;
    url: string;
    sourceCheckedAt: string;
  };
};

export type PoomsaeFormGuide = TaegeukFormGuide | DanFormGuide;

export const taegeukForms: readonly TaegeukFormGuide[] = [
  {
    kind: 'taegeuk',
    number: 1,
    slug: 'taegeuk-1-jang',
    name: 'Taegeuk 1 Jang',
    boardNo: 1347,
    symbol: 'Céu',
    note: 'Primeiros fundamentos e início da prática.',
    trigram: {
      romanization: 'Keon',
      symbolPt: 'Céu e luz',
      bars: [1, 1, 1],
      polaritySummary: 'Três linhas contínuas (Yang): princípio criador e ponto de partida de todas as coisas.',
    },
    philosophySummary:
      'Representa o trigrama Keon, associado ao céu, à luz e à energia inicial na relação complementar entre Yin e Yang. Marca o primeiro contato estruturado com o Poomsae.',
    bodyCorrespondence: {
      label: 'Cabeça e compreensão inicial',
      atlasRegion: 'head',
      summary:
        'Na descrição institucional da Kukkiwon, Keon relaciona-se à cabeça no corpo humano, indicando compreensão consciente das bases e dos fundamentos iniciais.',
    },
    practiceFocus: [
      'Compreensão clara das direções básicas de deslocamento e transição.',
      'Estabilidade nas primeiras bases de caminhada e postura ereta.',
      'Coordenação elementar entre bloqueios básicos, socos e chute frontal.',
    ],
    relatedAcervoJunbi: {
      slug: 'gibon-junbi',
      romanization: 'Gibon-junbi',
      note: 'Postura básica de preparação registrada no acervo provisório (Kukkiwon 2012, §8 Junbi-jase).',
    },
    evidence: {
      institution: 'Kukkiwon',
      document: 'Composition of Taekwondo — Poomsae',
      locator: 'Board 55 / artigo 1347',
      url: poomsaeBoardUrl(1347),
      sourceCheckedAt: '2026-11-18',
    },
  },
  {
    kind: 'taegeuk',
    number: 2,
    slug: 'taegeuk-2-jang',
    name: 'Taegeuk 2 Jang',
    boardNo: 1349,
    symbol: 'Lago',
    note: 'Calma e controle da respiração e das emoções.',
    trigram: {
      romanization: 'Tae',
      symbolPt: 'Lago sereno',
      bars: [0, 1, 1],
      polaritySummary: 'Linha superior partida sobre duas linhas contínuas: serenidade visível sustentada por firmeza interna.',
    },
    philosophySummary:
      'Simboliza Tae, um lago de superfície calma com profundidade interior. Destaca que a técnica precisa depende do equilíbrio emocional e da respiração controlada.',
    bodyCorrespondence: {
      label: 'Respiração e abdome inferior',
      atlasRegion: 'torso',
      summary:
        'A Kukkiwon associa esta etapa à concentração da energia no abdome inferior, evitando dispersão durante os deslocamentos, defesas e ataques.',
    },
    practiceFocus: [
      'Manutenção da respiração estável sem rigidez excessiva nos ombros.',
      'Firmeza interna combinada a transições calmas ("punho firme sob superfície serena").',
      'Precisão de altura entre alvos médios e altos conforme orientação do professor.',
    ],
    relatedAcervoJunbi: {
      slug: 'gibon-junbi',
      romanization: 'Gibon-junbi',
      note: 'Postura básica de preparação consultável no acervo provisório (Kukkiwon 2012, §8 Junbi-jase).',
    },
    evidence: {
      institution: 'Kukkiwon',
      document: 'Composition of Taekwondo — Poomsae',
      locator: 'Board 55 / artigo 1349',
      url: poomsaeBoardUrl(1349),
      sourceCheckedAt: '2026-11-18',
    },
  },
  {
    kind: 'taegeuk',
    number: 3,
    slug: 'taegeuk-3-jang',
    name: 'Taegeuk 3 Jang',
    boardNo: 1350,
    symbol: 'Fogo',
    note: 'Clareza, energia e movimentos decididos.',
    trigram: {
      romanization: 'Ri',
      symbolPt: 'Fogo e clareza',
      bars: [1, 0, 1],
      polaritySummary: 'Linhas contínuas externa e inferior com centro partido: brilho, discernimento e calor controlado.',
    },
    philosophySummary:
      'Representa Ri, associado ao fogo, ao sol e à clareza mental. Ensina que a chama útil exige direção e controle — força dispersa sem foco não constrói prática marcial.',
    bodyCorrespondence: {
      label: 'Coração e atitude corajosa',
      atlasRegion: 'torso',
      summary:
        'Corresponde ao coração na leitura simbólica da Kukkiwon, apontando para o cultivo de coragem lúcida e conexão viva entre defesa e contra-ataque.',
    },
    practiceFocus: [
      'Encadeamento decidido entre ações defensivas e respostas ofensivas.',
      'Variação rítmica consciente em vez de pressa descontrolada.',
      'Uso coordenado da borda da mão (Sonnal) e do tronco nas transições.',
    ],
    relatedAcervoJunbi: {
      slug: 'gibon-junbi',
      romanization: 'Gibon-junbi',
      note: 'Postura básica de preparação consultável no acervo provisório (Kukkiwon 2012, §8 Junbi-jase).',
    },
    evidence: {
      institution: 'Kukkiwon',
      document: 'Composition of Taekwondo — Poomsae',
      locator: 'Board 55 / artigo 1350',
      url: poomsaeBoardUrl(1350),
      sourceCheckedAt: '2026-11-18',
    },
  },
  {
    kind: 'taegeuk',
    number: 4,
    slug: 'taegeuk-4-jang',
    name: 'Taegeuk 4 Jang',
    boardNo: 1351,
    symbol: 'Trovão',
    note: 'Movimento e expressão dinâmica de força.',
    trigram: {
      romanization: 'Jin',
      symbolPt: 'Trovão e relâmpago',
      bars: [0, 0, 1],
      polaritySummary: 'Duas linhas partidas superiores sobre base contínua: impulso súbito que irrompe com vigor e compostura.',
    },
    philosophySummary:
      'Representa Jin, o trovão repentino e o relâmpago. Enfatiza agilidade, leitura de distância e capacidade de girar o corpo para mudar de direção com prontidão.',
    bodyCorrespondence: {
      label: 'Mobilidade dos dois pés',
      atlasRegion: 'feet',
      summary:
        'Na explicação da Kukkiwon, Jin corresponde à mobilidade de ambos os pés, base para deslocamentos velozes, giros corporais e chutes potentes.',
    },
    practiceFocus: [
      'Equilíbrio dinâmico sobre os pés durante mudanças rápidas de direção.',
      'Controle de distância ao conectar defesas duplas e chutes laterais ou frontais.',
      'Estabilidade de base antes e imediatamente após cada técnica de perna.',
    ],
    relatedAcervoJunbi: {
      slug: 'gibon-junbi',
      romanization: 'Gibon-junbi',
      note: 'Postura básica de preparação consultável no acervo provisório (Kukkiwon 2012, §8 Junbi-jase).',
    },
    evidence: {
      institution: 'Kukkiwon',
      document: 'Composition of Taekwondo — Poomsae',
      locator: 'Board 55 / artigo 1351',
      url: poomsaeBoardUrl(1351),
      sourceCheckedAt: '2026-11-18',
    },
  },
  {
    kind: 'taegeuk',
    number: 5,
    slug: 'taegeuk-5-jang',
    name: 'Taegeuk 5 Jang',
    boardNo: 1352,
    symbol: 'Vento',
    note: 'Alternância de suavidade e intensidade.',
    trigram: {
      romanization: 'Son',
      symbolPt: 'Vento e tufão',
      bars: [1, 1, 0],
      polaritySummary: 'Duas linhas contínuas superiores sobre linha partida: brisa flexível capaz de converter-se em força intensa.',
    },
    philosophySummary:
      'Representa Son, o vento que sopra suavemente, mas pode transformar-se subitamente em tufão. Trabalha a alternância entre relaxamento e potência concentrada.',
    bodyCorrespondence: {
      label: 'Pelve e articulação do quadril',
      atlasRegion: 'legs',
      summary:
        'A Kukkiwon relaciona Son à pelve e às articulações do quadril: base que sustenta a coluna vertebral e origina força rotacional e chutes estáveis.',
    },
    practiceFocus: [
      'Relaxamento ativo da musculatura pélvica para gerar rotação eficiente.',
      'Contraste claro entre transições flexíveis e impactos firmes (como Me-jumeok e Palgup).',
      'Alinhamento entre coluna e quadril em bases longas e cruzadas.',
    ],
    relatedAcervoJunbi: {
      slug: 'gibon-junbi',
      romanization: 'Gibon-junbi',
      note: 'Postura básica de preparação consultável no acervo provisório (Kukkiwon 2012, §8 Junbi-jase).',
    },
    evidence: {
      institution: 'Kukkiwon',
      document: 'Composition of Taekwondo — Poomsae',
      locator: 'Board 55 / artigo 1352',
      url: poomsaeBoardUrl(1352),
      sourceCheckedAt: '2026-11-18',
    },
  },
  {
    kind: 'taegeuk',
    number: 6,
    slug: 'taegeuk-6-jang',
    name: 'Taegeuk 6 Jang',
    boardNo: 1353,
    symbol: 'Água',
    note: 'Continuidade e adaptação do movimento.',
    trigram: {
      romanization: 'Gam',
      symbolPt: 'Água corrente',
      bars: [0, 1, 0],
      polaritySummary: 'Linha contínua central entre duas linhas partidas: fluxo constante que contorna obstáculos sem perder consistência.',
    },
    philosophySummary:
      'Representa Gam, a água corrente que se adapta ao caminho sem interromper seu curso e, quando necessário, precipita-se com a energia de uma cachoeira.',
    bodyCorrespondence: {
      label: 'Ouvido, percepção e fluidez',
      atlasRegion: 'head',
      summary:
        'Na leitura da Kukkiwon, Gam associa-se ao ouvido e à sensibilidade para perceber firmeza e suavidade ao redor, desviando a força adversária com continuidade.',
    },
    practiceFocus: [
      'Conexão contínua entre movimentos sem pausas bruscas artificiais.',
      'Desvio de força e contra-ataque fluido após bloqueios circulares.',
      'Equilíbrio controlado após chutes circulares altos ou médios.',
    ],
    relatedAcervoJunbi: {
      slug: 'gibon-junbi',
      romanization: 'Gibon-junbi',
      note: 'Postura básica de preparação consultável no acervo provisório (Kukkiwon 2012, §8 Junbi-jase).',
    },
    evidence: {
      institution: 'Kukkiwon',
      document: 'Composition of Taekwondo — Poomsae',
      locator: 'Board 55 / artigo 1353',
      url: poomsaeBoardUrl(1353),
      sourceCheckedAt: '2026-11-18',
    },
  },
  {
    kind: 'taegeuk',
    number: 7,
    slug: 'taegeuk-7-jang',
    name: 'Taegeuk 7 Jang',
    boardNo: 1354,
    symbol: 'Montanha',
    note: 'Estabilidade e uso consciente das articulações.',
    trigram: {
      romanization: 'Gan',
      symbolPt: 'Cordilheira e ponderação',
      bars: [1, 0, 0],
      polaritySummary: 'Linha contínua no topo sobre duas linhas partidas: cume estável, saber avançar no momento certo e parar com firmeza.',
    },
    philosophySummary:
      'Representa Gan, uma cadeia de montanhas conectadas onde solo, rochas e água subterrânea sustentam a vida. Ensina solidez estrutural e domínio consciente do movimento.',
    bodyCorrespondence: {
      label: 'Coluna vertebral, músculos e articulações',
      atlasRegion: 'arms',
      summary:
        'A Kukkiwon relaciona Gan à coluna vertebral e à flexão e extensão eficiente de vértebras, articulações e músculos durante a emissão de força.',
    },
    practiceFocus: [
      'Precisão articular em bases curtas como Beom-seogi (base de tigre).',
      'Coordenação de flexão e extensão sem comprometer o eixo da coluna.',
      'Domínio de paradas firmes e técnicas executadas com a palma e o punho.',
    ],
    relatedAcervoJunbi: {
      slug: 'gibon-junbi',
      romanization: 'Gibon-junbi',
      note: 'Postura básica de preparação consultável no acervo provisório (Kukkiwon 2012, §8 Junbi-jase).',
    },
    evidence: {
      institution: 'Kukkiwon',
      document: 'Composition of Taekwondo — Poomsae',
      locator: 'Board 55 / artigo 1354',
      url: poomsaeBoardUrl(1354),
      sourceCheckedAt: '2026-11-18',
    },
  },
  {
    kind: 'taegeuk',
    number: 8,
    slug: 'taegeuk-8-jang',
    name: 'Taegeuk 8 Jang',
    boardNo: 1355,
    symbol: 'Terra',
    note: 'Integração dos fundamentos desenvolvidos nas formas anteriores.',
    trigram: {
      romanization: 'Gon',
      symbolPt: 'Terra receptiva',
      bars: [0, 0, 0],
      polaritySummary: 'Três linhas partidas (Yin): solo fértil onde tudo cria raízes, amadurece e conclui o ciclo das oito forças.',
    },
    philosophySummary:
      'Representa Gon, a terra receptiva onde os seres enraízam e frutificam. Enquanto Keon (1 Jang) simboliza o início, Gon consolida e integra os sete estágios anteriores antes da transição para Dan.',
    bodyCorrespondence: {
      label: 'Abdome e integração corporal completa',
      atlasRegion: 'torso',
      summary:
        'Na descrição da Kukkiwon, Gon representa o abdome que protege os órgãos internos e conecta organicamente membros superiores e inferiores, inclusive em ações aéreas.',
    },
    practiceFocus: [
      'Engajamento do centro abdominal como elo entre base e técnica de braço.',
      'Integração madura de bases estáveis, defesas apoiadas e técnicas em salto.',
      'Revisão global dos princípios trabalhados de Taegeuk 1 a 7 Jang.',
    ],
    relatedAcervoJunbi: {
      slug: 'gibon-junbi',
      romanization: 'Gibon-junbi',
      note: 'Postura básica de preparação consultável no acervo provisório (Kukkiwon 2012, §8 Junbi-jase).',
    },
    evidence: {
      institution: 'Kukkiwon',
      document: 'Composition of Taekwondo — Poomsae',
      locator: 'Board 55 / artigo 1355',
      url: poomsaeBoardUrl(1355),
      sourceCheckedAt: '2026-11-18',
    },
  },
] as const;

export const danForms: readonly DanFormGuide[] = [
  {
    kind: 'dan',
    order: 1,
    slug: 'koryo',
    name: 'Koryo',
    boardNo: 1356,
    theme: 'Tradição marcial e postura de quem estuda.',
    philosophySummary:
      'Koryo remete ao espírito Seonbae herdado de Goguryeo, Balhae e Koryo: firmeza marcial aliada à retidão ética e intelectual. Marca a entrada nas formas Yudanja (Dan), integrando corpo (Jeong), energia (Ki) e consciência (Shin).',
    poomsaeLine: {
      character: '士',
      kind: 'sa',
      meaningPt: 'O artigo coreano 988 associa a linha 士 à figura de quem estuda (Seonbae). O esquema mostra a forma da linha.',
    },
    bodyCorrespondence: {
      label: 'Integração entre corpo, energia e foco',
      atlasRegion: 'torso',
      summary:
        'A Kukkiwon destaca nesta etapa a união consciente entre estrutura corporal, respiração energética e presença mental.',
    },
    practiceFocus: [
      'Postura digna e domínio de ritmo após concluir a série Taegeuk.',
      'Equilíbrio técnico em chutes duplos ou laterais e ações com arco da mão (Ageumson) e faca da mão (Sonnal).',
      'Concentração mental sustentada do preparo inicial ao encerramento.',
    ],
    relatedAcervoJunbi: {
      slug: 'tongmilgi-junbi',
      romanization: 'Tongmilgi-junbi',
      note: 'Postura de preparação registrada no acervo provisório (Kukkiwon 2012, §8 Junbi-jase); sequência completa aguarda homologação.',
    },
    evidence: {
      institution: 'Kukkiwon',
      document: 'Composition of Taekwondo — Poomsae',
      locator: 'Board 55 / artigo 1356',
      url: poomsaeBoardUrl(1356),
      sourceCheckedAt: '2026-11-18',
    },
  },
  {
    kind: 'dan',
    order: 2,
    slug: 'keumgang',
    name: 'Keumgang',
    boardNo: 1357,
    theme: 'Força firme associada à imagem da montanha.',
    philosophySummary:
      'Evoca o Monte Keumgang e a imagem de Keumgang Yeoksa — firmeza indestrutível, ponderação e luz que irradia sem hesitação nem precipitação.',
    poomsaeLine: {
      character: '山',
      kind: 'san',
      meaningPt:
        'Trajetória em formato de montanha (山), documentada no artigo 1357: o eixo central representa a coluna vertebral e os traços laterais expressam a força rotacional para esquerda e direita.',
    },
    bodyCorrespondence: {
      label: 'Eixo central da coluna e rotação simétrica',
      atlasRegion: 'torso',
      summary:
        'A fonte institucional enfatiza coordenação simétrica entre esquerda/direita e parte superior/inferior em torno da linha central da coluna.',
    },
    practiceFocus: [
      'Estabilidade firme em apoios unipodais (como Hakdari-seogi) sem inclinar o eixo.',
      'Geração de potência rotacional preservando compostura e centro estável.',
      'Execução decidida de bloqueios pesados como Geumgang-makgi e Santeul-makgi.',
    ],
    relatedAcervoJunbi: {
      slug: 'gibon-junbi',
      romanization: 'Gibon-junbi',
      note: 'Consulte as posturas Junbi-jase no acervo provisório (Kukkiwon 2012, §8).',
    },
    evidence: {
      institution: 'Kukkiwon',
      document: 'Composition of Taekwondo — Poomsae',
      locator: 'Board 55 / artigo 1357',
      url: poomsaeBoardUrl(1357),
      sourceCheckedAt: '2026-11-18',
    },
  },
  {
    kind: 'dan',
    order: 3,
    slug: 'taebaek',
    name: 'Taebaek',
    boardNo: 1358,
    theme: 'Montanha luminosa, origem e tradição.',
    philosophySummary:
      'Significa montanha luminosa, remetendo às raízes históricas coreanas (Asadal / Monte Baekdu) e ao ideal humanitário Hongik Ingan.',
    poomsaeLine: {
      character: '工',
      kind: 'gong',
      meaningPt:
        'Trajetória correspondente ao caractere 工, registrada no artigo 1358, simbolizando conexão entre céu, terra e prática humana.',
    },
    bodyCorrespondence: {
      label: 'Alternância intencional entre tensão e fluidez',
      atlasRegion: 'legs',
      summary:
        'Representa o praticante capaz de alternar intencionalmente entre expansão e recolhimento com velocidade e precisão.',
    },
    practiceFocus: [
      'Transições ágeis e limpas ao longo dos eixos horizontais e central.',
      'Precisão em defesas em tesoura (Gawi-makgi) e golpes rápidos.',
      'Clareza de ritmo entre aceleração explosiva e estabilização imediata.',
    ],
    relatedAcervoJunbi: {
      slug: 'gibon-junbi',
      romanization: 'Gibon-junbi',
      note: 'Consulte as posturas Junbi-jase no acervo provisório (Kukkiwon 2012, §8).',
    },
    evidence: {
      institution: 'Kukkiwon',
      document: 'Composition of Taekwondo — Poomsae',
      locator: 'Board 55 / artigo 1358',
      url: poomsaeBoardUrl(1358),
      sourceCheckedAt: '2026-11-18',
    },
  },
  {
    kind: 'dan',
    order: 4,
    slug: 'pyongwon',
    name: 'Pyongwon',
    boardNo: 1359,
    theme: 'Planície e expansão em todas as direções.',
    philosophySummary:
      'Significa vasta planície aberta em todas as direções, fundamento da vida humana e equilíbrio entre paz e autodefesa segundo estrutura (Bon) e aplicação (Yong).',
    poomsaeLine: null,
    bodyCorrespondence: {
      label: 'Retorno ao estado calmo após movimentos intensos',
      atlasRegion: 'torso',
      summary:
        'Na descrição da Kukkiwon, marca a passagem da técnica isolada à arte integrada: o corpo atua livremente e retorna à serenidade sem agitação.',
    },
    practiceFocus: [
      'Expansão lateral ampla mantendo centro de gravidade sereno.',
      'Harmonia entre movimentos lentos respirados e descargas rápidas.',
      'Estabilidade de retorno após giros e projeções de energia.',
    ],
    relatedAcervoJunbi: {
      slug: 'gyeopson-junbi',
      romanization: 'Gyeopson-junbi',
      note: 'Postura com mãos sobrepostas documentada no acervo provisório (Kukkiwon 2012, §8 Junbi-jase).',
    },
    evidence: {
      institution: 'Kukkiwon',
      document: 'Composition of Taekwondo — Poomsae',
      locator: 'Board 55 / artigo 1359',
      url: poomsaeBoardUrl(1359),
      sourceCheckedAt: '2026-11-18',
    },
  },
  {
    kind: 'dan',
    order: 5,
    slug: 'shipjin',
    name: 'Shipjin',
    boardNo: 1360,
    theme: 'Dez símbolos tradicionais de longevidade.',
    philosophySummary:
      'Inspira-se nos dez elementos tradicionais de longevidade (sol, lua, montanha, água, pedra, pinheiro, erva perene, tartaruga, cervo e grou) e na expansão decimal ordenada.',
    poomsaeLine: {
      character: '十',
      kind: 'ship',
      meaningPt:
        'Trajetória em cruz (十), documentada no artigo 1360: exige preservar o eixo entre pescoço e cóccix independentemente do deslocamento frontal, recuado ou lateral.',
    },
    bodyCorrespondence: {
      label: 'Alinhamento axial entre pescoço e base da coluna',
      atlasRegion: 'torso',
      summary:
        'A Kukkiwon enfatiza manter o eixo vertical reto em todas as quatro direções da linha em cruz.',
    },
    practiceFocus: [
      'Preservação rigorosa da linha central ao avançar, recuar ou deslocar-se aos lados.',
      'Solidez em defesas complexas como Hwangso-makgi e Santeul-makgi.',
      'Estabilidade postural em mudanças simétricas de direção.',
    ],
    relatedAcervoJunbi: {
      slug: 'gibon-junbi',
      romanization: 'Gibon-junbi',
      note: 'Consulte as posturas Junbi-jase no acervo provisório (Kukkiwon 2012, §8).',
    },
    evidence: {
      institution: 'Kukkiwon',
      document: 'Composition of Taekwondo — Poomsae',
      locator: 'Board 55 / artigo 1360',
      url: poomsaeBoardUrl(1360),
      sourceCheckedAt: '2026-11-18',
    },
  },
  {
    kind: 'dan',
    order: 6,
    slug: 'jitae',
    name: 'Jitae',
    boardNo: 1361,
    theme: 'A pessoa e sua relação com a terra.',
    philosophySummary:
      'Representa o ser humano apoiado com os dois pés sobre a terra — caminhando, saltando, chutando e superando os desafios da existência.',
    poomsaeLine: {
      character: 'ㅗ',
      kind: 'o',
      meaningPt:
        'Trajetória ㅗ documentada no artigo 1361: o traço horizontal inferior simboliza a terra e o traço vertical ascendente representa a pessoa erguendo-se rumo ao céu.',
    },
    bodyCorrespondence: {
      label: 'Enraizamento plantar e resposta integrada',
      atlasRegion: 'feet',
      summary:
        'Destaca o enraizamento dos pés no solo aliado à prontidão natural de corpo e mente.',
    },
    practiceFocus: [
      'Sensação firme de apoio plantar antes de elevações e chutes.',
      'Transição orgânica entre defesas ascendentes e ataques decididos.',
      'Equilíbrio entre base terrena sólida e projeção vertical.',
    ],
    relatedAcervoJunbi: {
      slug: 'gibon-junbi',
      romanization: 'Gibon-junbi',
      note: 'Consulte as posturas Junbi-jase no acervo provisório (Kukkiwon 2012, §8).',
    },
    evidence: {
      institution: 'Kukkiwon',
      document: 'Composition of Taekwondo — Poomsae',
      locator: 'Board 55 / artigo 1361',
      url: poomsaeBoardUrl(1361),
      sourceCheckedAt: '2026-11-18',
    },
  },
  {
    kind: 'dan',
    order: 7,
    slug: 'chonkwon',
    name: 'Chonkwon',
    boardNo: 1362,
    theme: 'Céu, forças naturais e equilíbrio.',
    philosophySummary:
      'Simboliza a vastidão do céu e as leis constantes da natureza, convidando o praticante a agir com retidão mental e equilíbrio entre forças centrífugas e centrípetas.',
    poomsaeLine: {
      character: 'ㅜ',
      kind: 'u',
      meaningPt:
        'Trajetória ㅜ registrada no artigo 1362: o traço superior representa a amplitude do céu e a linha vertical simboliza a luz que alcança a terra.',
    },
    bodyCorrespondence: {
      label: 'Equilíbrio entre expansão e recolhimento',
      atlasRegion: 'arms',
      summary:
        'Relaciona-se à coordenação de arcos amplos e circulares com retorno equilibrado ao eixo corporal.',
    },
    practiceFocus: [
      'Controle de trajetórias circulares amplas sem perda do eixo.',
      'Harmonia entre forças de expansão (ataque) e absorção/recolhimento (defesa).',
      'Fluidez respiratória em movimentos suaves e giros completos.',
    ],
    relatedAcervoJunbi: {
      slug: 'gibon-junbi',
      romanization: 'Gibon-junbi',
      note: 'Consulte as posturas Junbi-jase no acervo provisório (Kukkiwon 2012, §8).',
    },
    evidence: {
      institution: 'Kukkiwon',
      document: 'Composition of Taekwondo — Poomsae',
      locator: 'Board 55 / artigo 1362',
      url: poomsaeBoardUrl(1362),
      sourceCheckedAt: '2026-11-18',
    },
  },
  {
    kind: 'dan',
    order: 8,
    slug: 'hansu',
    name: 'Hansu',
    boardNo: 1363,
    theme: 'Água, continuidade e adaptabilidade.',
    philosophySummary:
      'Refere-se à grande água — fonte da vida, impossível de ser quebrada ou cortada, capaz de unir suavidade, tolerância, adaptação e força concentrada.',
    poomsaeLine: {
      character: '水',
      kind: 'su',
      meaningPt:
        'Trajetória correspondente ao caractere 水 (água), documentada no artigo 1363, simbolizando fluxo vital e crescimento contínuo.',
    },
    bodyCorrespondence: {
      label: 'Fluidez articular e adaptabilidade contínua',
      atlasRegion: 'hands',
      summary:
        'Aplica a natureza adaptável da água à transição ininterrupta entre superfícies da mão, braços e deslocamentos.',
    },
    practiceFocus: [
      'Encadeamento contínuo sem rigidez mecânica entre técnicas.',
      'Uso preciso de superfícies variadas da mão como Sonnal e Anpalmok.',
      'Adaptação fluida entre defesa absorvente e resposta imediata.',
    ],
    relatedAcervoJunbi: {
      slug: 'gyeopson-junbi',
      romanization: 'Gyeopson-junbi',
      note: 'Preparação com punho coberto registrada no acervo provisório (Kukkiwon 2012, §8 Junbi-jase).',
    },
    evidence: {
      institution: 'Kukkiwon',
      document: 'Composition of Taekwondo — Poomsae',
      locator: 'Board 55 / artigo 1363',
      url: poomsaeBoardUrl(1363),
      sourceCheckedAt: '2026-11-18',
    },
  },
  {
    kind: 'dan',
    order: 9,
    slug: 'ilyeo',
    name: 'Ilyeo',
    boardNo: 1364,
    theme: 'Unidade entre mente e corpo.',
    philosophySummary:
      'Expressa o conceito de unidade (oneness) associado ao pensamento do mestre Wonhyo do período Silla: pontos, linhas e círculos integram-se, e mente e corpo tornam-se um só.',
    poomsaeLine: null,
    bodyCorrespondence: {
      label: 'Unidade entre mente, respiração e movimento',
      atlasRegion: 'head',
      summary:
        'Síntese superior do estudo de Poomsae: técnicas distintas concluem-se com naturalidade e desapego de artifícios.',
    },
    practiceFocus: [
      'Unificação madura de ponto (foco), linha (trajetória) e círculo (transição).',
      'Equilíbrio sereno em posturas exigentes e apoios elevados.',
      'Execução natural em que atenção mental e ação corporal não se separam.',
    ],
    relatedAcervoJunbi: {
      slug: 'gyeopson-junbi',
      romanization: 'Gyeopson-junbi',
      note: 'Preparação com mãos sobrepostas nas lâminas EMC reproduzidas na p. 414 do v20. O termo tem verbete no §8 Junbi-jase.',
    },
    evidence: {
      institution: 'Kukkiwon',
      document: 'Composition of Taekwondo — Poomsae',
      locator: 'Board 55 / artigo 1364',
      url: poomsaeBoardUrl(1364),
      sourceCheckedAt: '2026-11-18',
    },
  },
] as const;

export const allPoomsaeGuides: readonly PoomsaeFormGuide[] = [
  ...taegeukForms,
  ...danForms,
];

export function getPoomsaeGuide(slug: string): PoomsaeFormGuide | null {
  return allPoomsaeGuides.find((item) => item.slug === slug) ?? null;
}


const koreanFormNames: Readonly<Record<string, string>> = {
  'taegeuk-1-jang': '태극 1장',
  'taegeuk-2-jang': '태극 2장',
  'taegeuk-3-jang': '태극 3장',
  'taegeuk-4-jang': '태극 4장',
  'taegeuk-5-jang': '태극 5장',
  'taegeuk-6-jang': '태극 6장',
  'taegeuk-7-jang': '태극 7장',
  'taegeuk-8-jang': '태극 8장',
  koryo: '고려',
  keumgang: '금강',
  taebaek: '태백',
  pyongwon: '평원',
  shipjin: '십진',
  jitae: '지태',
  chonkwon: '천권',
  hansu: '한수',
  ilyeo: '일여',
};

const kukkiwonKoreanIndex =
  'https://www.kukkiwon.or.kr/base/board/list?boardManagementNo=37&menuLevel=3&menuNo=62';

export function getPoomsaeKoreanIdentity(guide: PoomsaeFormGuide) {
  return {
    hangul: koreanFormNames[guide.slug],
    url: guide.slug === 'koryo'
      ? 'https://www.kukkiwon.or.kr/base/board/read?boardManagementNo=37&boardNo=988&menuLevel=3&menuNo=62'
      : kukkiwonKoreanIndex + (guide.kind === 'taegeuk' && guide.number <= 6 ? '&page=2' : ''),
  };
}
