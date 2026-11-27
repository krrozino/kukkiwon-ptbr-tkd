import type { LibraryReference } from '../lib/library';
import { ironContextEntries } from './iron-context';
import { wtCompetitionRulesUrl } from './kyorugi-guide';

export type IronLevel = 'basico' | 'intermediario' | 'avancado';

export type IronEntry = {
  slug: string;
  title: string;
  subtitle: string;
  level: IronLevel;
  levelLabel: 'Iron · Básico' | 'Iron · Intermediário' | 'Iron · Avançado';
  summary: string;
  topic?: string;
  sections?: readonly { title: string; text: string; reference: LibraryReference }[];
  keyTakeaways: readonly string[];
  variants: readonly string[];
  moduleHref?: string;
  moduleLabel?: string;
  references: readonly {
    field: 'context' | 'historical' | 'terminology';
    reference: LibraryReference;
  }[];
  relatedLibrarySlugs: readonly string[];
};

export type IronQuizQuestion = {
  id: string;
  level: IronLevel;
  question: string;
  options: readonly string[];
  correctIndex: number;
  explanation: string;
  relatedSlug: string;
};

const kukkiwonMeaningRef: LibraryReference = {
  institution: 'Kukkiwon',
  title: 'Meaning of Taekwondo',
  edition: 'Portal institucional em inglês (consulta em 2026-11-18)',
  url: 'https://www.kukkiwon.or.kr/eng/contents/view?contentsNo=92&menuLevel=2&menuNo=93',
  locator: 'Taekwondo > Meaning of Taekwondo (conceito, características técnicas e Suryeon)',
};

const kukkiwonHistoryRef: LibraryReference = {
  institution: 'Kukkiwon',
  title: 'History of Taekwondo',
  edition: 'Portal institucional em inglês (consulta em 2026-11-18)',
  url: 'https://www.kukkiwon.or.kr/eng/contents/view?contentsNo=93&menuLevel=2&menuNo=94',
  locator: 'Ancient/Modern roots & Modern Taekwondo History (1946–1985)',
};

const kukkiwonSpiritRef: LibraryReference = {
  institution: 'Kukkiwon',
  title: 'Spirit of Taekwondo',
  edition: 'Portal institucional em inglês (consulta em 2026-11-18)',
  url: 'https://www.kukkiwon.or.kr/eng/contents/view?contentsNo=94&menuLevel=2&menuNo=95',
  locator: 'Geukgi, Hongik e virtudes Innae, Yonggi, Yeui, Jeongui e Bongsa',
};

const kukkiwonTerminology2012Ref: LibraryReference = {
  institution: 'Kukkiwon',
  title: 'Taekwondo Technical Terminology',
  edition: '2012',
  url: 'https://research.kukkiwon.or.kr/homepage/boardMedia/11621',
  locator: 'Introdução e seções sistemáticas de terminologia técnica',
};

const kukkiwonEtymology2025Ref: LibraryReference = {
  institution: 'Kukkiwon Taekwondo Research Journal',
  title: 'Origin and meaning of inherent Taekwondo terminology',
  edition: '2025',
  url: 'https://research.kukkiwon.or.kr/board/journal/article/258899',
  locator: 'Journal article 258899 — etimologia e formação vernácula coreana',
};

const kukkiwonCurriculumRef: LibraryReference = {
  institution: 'Kukkiwon Taekwondo Research',
  title: 'Skill classification for Taekwondo curricula',
  edition: 'Journal article 55579',
  url: 'https://research.kukkiwon.or.kr/board/journal/article/55579',
  locator: 'Article 55579 — classificação de habilidades e organização curricular',
};

const kukkiwon2022CollectionRef: LibraryReference = {
  institution: 'Kukkiwon',
  title: 'Revised Taekwondo Textbook (5-volume announcement)',
  edition: '2022',
  url: 'https://m.kukkiwon.or.kr/eng/board/read?boardManagementNo=49&boardNo=1688&menuLevel=2&menuNo=91&page=11',
  locator: 'Board 49 / article 1688 — anúncio oficial dos cinco volumes revisados',
};

const wtRulesRef: LibraryReference = {
  institution: 'World Taekwondo',
  title: 'Competition Rules and Interpretation',
  edition: 'Vigência inicial em 01/06/2026',
  url: wtCompetitionRulesUrl,
  locator: 'Regras internacionais de competição de Kyorugi',
};

const cbtkdIndexRef: LibraryReference = {
  institution: 'FPETKD / CBTKD',
  title: 'Índice de regulamentos e normas técnicas nacionais',
  edition: '2026',
  url: 'https://fpetkd.org/regulamentos-e-normas/',
  locator: 'Regulamentos nacionais e estaduais no Brasil',
};

const kukkiwonPoomsaeBoardRef: LibraryReference = {
  institution: 'Kukkiwon',
  title: 'Composition of Taekwondo — Poomsae',
  edition: 'Portal institucional em inglês',
  url: 'https://www.kukkiwon.or.kr/eng/board/list?boardManagementNo=55&menuLevel=3&menuNo=72',
  locator: 'Board 55 — formas Taegeuk 1–8 e formas Dan',
};

export const ironEntries: readonly IronEntry[] = [
  // NÍVEL BÁSICO
  {
    slug: 'iron-significado-taekwondo',
    topic: 'Cultura e prática',
    title: 'Significado e finalidade do Taekwondo',
    subtitle: 'Arte marcial de mãos e pés livres, autodefesa e amadurecimento humano',
    level: 'basico',
    levelLabel: 'Iron · Básico',
    summary:
      'Na definição institucional da Kukkiwon (Meaning of Taekwondo), o Taekwondo é uma arte marcial moderna de defesa e ataque executada com mãos e pés livres, reconhecida mundialmente pela expressividade e variedade de suas técnicas de chute. Sua prática (Suryeon) une eficácia física de autodefesa e desenvolvimento ético e mental do praticante.',
    keyTakeaways: [
      'Compreender os três elementos associados ao nome Taekwondo na explicação pedagógica tradicional: técnicas de pés/pernas (Tae), técnicas de mãos/punhos (Kwon) e caminho de conduta e aperfeiçoamento (Do).',
      'Reconhecer que o treino técnico busca equilíbrio entre saúde corporal, autocontrole emocional e convivência responsável.',
      'Evitar reduzir o Taekwondo apenas à luta esportiva ou apenas a exercícios ginásticos desconectados de sentido marcial.',
    ],
    variants: ['O que é Taekwondo', 'Conceito de Taekwondo', 'Suryeon', 'Caminho dos pés e das mãos'],
    moduleHref: '/glossario',
    moduleLabel: 'Explorar o glossário interativo',
    references: [
      { field: 'context', reference: kukkiwonMeaningRef },
      { field: 'context', reference: kukkiwonSpiritRef },
    ],
    relatedLibrarySlugs: ['iron-espirito-cortesia-dojang', 'iron-graduacoes-gup-dan', 'sonnal'],
  },
  {
    slug: 'iron-espirito-cortesia-dojang',
    topic: 'Cultura e prática',
    title: 'Espírito do Taekwondo e etiqueta no Dojang',
    subtitle: 'Autossuperação (Geukgi), humanitarismo (Hongik) e virtudes da prática',
    level: 'basico',
    levelLabel: 'Iron · Básico',
    summary:
      'O documento institucional Spirit of Taekwondo da Kukkiwon fundamenta a formação moral do praticante em dois pilares — Geukgi (superar os próprios limites e impulsos) e Hongik (agir em benefício da comunidade) — desdobrados em cinco virtudes práticas: Innae (perseverança), Yonggi (coragem), Yeui (cortesia), Jeongui (justiça) e Bongsa (serviço solidário).',
    keyTakeaways: [
      'Praticar a cortesia (Yeui) desde a saudação ao entrar no Dojang, no cuidado com o uniforme (Dobok) e na cooperação segura com colegas menos experientes.',
      'Exercer autocontrole (Geukgi) durante exercícios de contato, respeitando imediatamente o limite físico do parceiro.',
      'Notar que diferentes escolas também ensinam listas tradicionais de princípios no juramento do aluno; conhecer a documentação da Kukkiwon enriquece o entendimento sem desrespeitar a tradição do seu mestre.',
    ],
    variants: ['Princípios do Taekwondo', 'Etiqueta no Dojang', 'Yeui', 'Innae', 'Geukgi e Hongik'],
    references: [{ field: 'context', reference: kukkiwonSpiritRef }],
    relatedLibrarySlugs: ['iron-significado-taekwondo', 'iron-historiografia-tradicao-fontes', 'gibon-junbi'],
  },
  {
    slug: 'iron-graduacoes-gup-dan',
    topic: 'Graduação e aprendizagem',
    title: 'Graduações Gup e Dan e autonomia das escolas',
    subtitle: 'Por que as faixas coloridas variam entre escolas e os graus Dan são unificados',
    level: 'basico',
    levelLabel: 'Iron · Básico',
    summary:
      'O sistema de graduação divide-se em graus preliminares de faixas coloridas (Gup, contados em ordem decrescente até o 1º Gup) e graus de faixa preta (Dan, ou Poom para praticantes jovens conforme regras de idade). Enquanto os exames de Dan foram unificados institucionalmente e certificados pela Kukkiwon, a sequência exata de cores intermediárias e os conteúdos de cada Gup são organizados pelo currículo da escola e de sua entidade.',
    keyTakeaways: [
      'Nunca presumir que todas as escolas usam exatamente as mesmas pontas ou faixas intermediárias na mesma ordem.',
      'Consultar sempre o currículo da sua própria escola para saber qual Poomsae, quais intervalos de Sebon/Dubon e quais perguntas teóricas pertencem ao seu próximo exame.',
      'Usar a ferramenta Currículos da plataforma para acompanhar sua graduação real.',
    ],
    variants: ['Faixas do Taekwondo', 'Gup e Dan', 'Poom e Dan', 'Ordem de faixas'],
    moduleHref: '/curriculos',
    moduleLabel: 'Abrir currículos por graduação',
    references: [
      { field: 'historical', reference: kukkiwonHistoryRef },
      { field: 'terminology', reference: kukkiwonCurriculumRef },
    ],
    relatedLibrarySlugs: ['iron-instituicoes-kukkiwon-wt-cbtkd', 'taegeuk-1-jang', 'sebon-kyorugi'],
  },
  {
    slug: 'iron-alturas-direcoes-estrutura',
    topic: 'Fundamentos técnicos',
    title: 'Alturas, direções e anatomia na leitura técnica',
    subtitle: 'Como distinguir alvo, trajetória, parte do corpo e família de movimento',
    level: 'basico',
    levelLabel: 'Iron · Básico',
    summary:
      'Para estudar Taekwondo sem decorar palavras soltas, é essencial separar quatro camadas presentes nas descrições técnicas: (1) a base de sustentação, (2) a superfície anatômica que executa ou recebe a ação, (3) a altura ou direção espacial (baixa, média, alta; frontal, lateral, circular, interna, externa) e (4) a família motora (defesa, soco, golpe, chute).',
    keyTakeaways: [
      'Altura de referência (baixa, média, alta) indica a faixa corporal visada, não o nome da superfície da mão ou do pé.',
      'Direções como para dentro (An) e para fora (Bakkat) dependem da referência anatômica descrita pela fonte técnica.',
      'Combinar a leitura do guia de Alturas e Direções com o Atlas corporal acelera a compreensão dos nomes em coreano.',
    ],
    variants: ['Arae Momtong Olgul', 'Direções no Taekwondo', 'Seções de altura'],
    moduleHref: '/fundamentos/alturas-e-direcoes',
    moduleLabel: 'Estudar alturas e direções',
    references: [{ field: 'terminology', reference: kukkiwonTerminology2012Ref }],
    relatedLibrarySlugs: ['kibon-alturas-direcoes', 'an-makgi', 'bakkat-makgi'],
  },

  // NÍVEL INTERMEDIÁRIO
  {
    slug: 'iron-historia-pos-1945',
    topic: 'História e instituições',
    title: 'História moderna documentada (1945–1985)',
    subtitle: 'Cinco Kwans, unificação associativa, fundação da Kukkiwon (1972) e expansão mundial',
    level: 'intermediario',
    levelLabel: 'Iron · Intermediário',
    summary:
      'A cronologia moderna publicada pela Kukkiwon organiza o desenvolvimento contemporâneo em três marcos: o período inicial (1946–1960), com a abertura dos Cinco Kwans após a libertação coreana e o surgimento do nome Taekwondo; o fruto da unidade (1961–1970), com a unificação associativa, exames de Dan integrados e estreia oficial no 44º Festival Nacional de Esportes (1963); e o salto internacional (1971–1985), com a fundação da Kukkiwon (1972), o 1º Campeonato Mundial e a entrada na GAISF (1973).',
    keyTakeaways: [
      'Situar historicamente os Cinco Kwans (escolas fundadoras do pós-guerra) como base organizacional da unificação do Taekwondo moderno.',
      'Reconhecer a década de 1970 como o marco de institucionalização técnica (Kukkiwon, 1972) e esportiva internacional (1973).',
      'Compreender que a inclusão no ensino público coreano e a criação de departamentos universitários impulsionaram a pesquisa acadêmica sobre o Taekwondo.',
    ],
    variants: ['Cinco Kwans', 'Fundação da Kukkiwon 1972', 'História moderna do Taekwondo'],
    references: [{ field: 'historical', reference: kukkiwonHistoryRef }],
    relatedLibrarySlugs: ['iron-instituicoes-kukkiwon-wt-cbtkd', 'iron-historiografia-tradicao-fontes', 'koryo'],
  },
  {
    slug: 'iron-instituicoes-kukkiwon-wt-cbtkd',
    topic: 'História e instituições',
    title: 'Kukkiwon, World Taekwondo e federações nacionais',
    subtitle: 'Diferença entre referência técnico-marcial, regra esportiva e administração nacional',
    level: 'intermediario',
    levelLabel: 'Iron · Intermediário',
    summary:
      'Um erro frequente entre estudantes é tratar Kukkiwon e World Taekwondo como a mesma entidade. A Kukkiwon atua como sede mundial técnico-educacional (padronização técnica, Poomsae, formação de mestres pela WTA e certificação internacional Poom/Dan), enquanto a World Taekwondo (WT, antiga WTF) governa as competições esportivas internacionais e olímpicas, articulada às confederações e federações nacionais como a CBTKD no Brasil.',
    keyTakeaways: [
      'Ao pesquisar execução marcial, nomenclatura de técnicas ou Poomsae, priorizar publicações da Kukkiwon.',
      'Ao verificar pontuação de luta, categorias de peso, faltas (Gam-jeom) ou arbitragem, consultar o regulamento vigente da World Taekwondo e da confederação nacional do evento.',
      'Lembrar que mudanças em regras olímpicas de pontuação não apagam o repertório técnico marcial do Taekwondo.',
    ],
    variants: ['Diferença Kukkiwon e WT', 'WTF vs World Taekwondo', 'CBTKD e federações estaduais'],
    moduleHref: '/kyorugi#competicao',
    moduleLabel: 'Comparar ensino marcial e regras esportivas',
    references: [
      { field: 'context', reference: kukkiwonPoomsaeBoardRef },
      { field: 'context', reference: wtRulesRef },
      { field: 'context', reference: cbtkdIndexRef },
    ],
    relatedLibrarySlugs: ['iron-evolucao-esportiva-marcial', 'matchuo-kyorugi-fundamentos', 'taegeuk-1-jang'],
  },
  {
    slug: 'iron-evolucao-poomsae',
    topic: 'Poomsae',
    title: 'Evolução e estrutura das coleções de Poomsae',
    subtitle: 'Das formas associativas dos anos 1960 aos oito Taegeuk e nove formas Dan',
    level: 'intermediario',
    levelLabel: 'Iron · Intermediário',
    summary:
      'Os Poomsae sintetizam defesas, ataques, bases, respiração e deslocamentos contra oponentes imaginários em linhas geométricas definidas. Após as primeiras formas promulgadas em nível associativo na década de 1960 (como a série histórica Palgwae), a Kukkiwon consolidou os oito Taegeuk (1 a 8 Jang, inspirados nos trigramas) para os graus Gup e nove formas superiores (Koryo a Ilyeo) para praticantes Dan.',
    keyTakeaways: [
      'Estudar em conjunto o significado filosófico do trigrama ou tema cultural e as exigências biomecânicas de cada forma.',
      'Distinguir formas vigentes no Board 55 da Kukkiwon (Taegeuk e Yudanja) de coleções históricas mantidas por tradição escolar (Palgwae).',
      'Observar a postura de preparação específica (Junbi-jase) associada a diferentes grupos de formas, como Bojumeok-junbi e Tongmilgi-junbi.',
    ],
    variants: ['História dos Poomsae', 'Taegeuk vs Palgwae', 'Yudanja Poomsae'],
    moduleHref: '/poomsae',
    moduleLabel: 'Abrir painel de Poomsae',
    references: [
      { field: 'context', reference: kukkiwonPoomsaeBoardRef },
      { field: 'historical', reference: kukkiwonHistoryRef },
    ],
    relatedLibrarySlugs: ['taegeuk-1-jang', 'koryo', 'palgwae-contexto-historico'],
  },
  {
    slug: 'iron-morfologia-terminologia',
    topic: 'Fontes e terminologia',
    title: 'Estrutura dos nomes técnicos em coreano',
    subtitle: 'Composição por parte do corpo, direção/modo e família de ação',
    level: 'intermediario',
    levelLabel: 'Iron · Intermediário',
    summary:
      'Na terminologia sistematizada pela Kukkiwon (2012) e estudada no Kukkiwon Taekwondo Research Journal (2025), a maioria das técnicas combina vocabulário coreano nativo para indicar quem age, como/para onde se move e qual família técnica é realizada: por exemplo, Sonnal (faca da mão) + An (para dentro) + Chigi (golpe) forma Sonnal-an-chigi.',
    keyTakeaways: [
      'Identificar primeiro o núcleo final da ação: Seogi (base), Makgi (defesa), Jireugi (soco), Jjireugi (estocada com dedos), Chigi (golpe), Chagi (chute), Kkeokgi (controle) ou Neomgigi (projeção).',
      'Reconhecer a superfície anatômica inicial quando especificada: Sonnal, Mejumeok, Batangson, Palgup, Mureup, Apchuk, Balnal, Dwichuk.',
      'Notar a distinção entre vocábulos coreanos vernáculos predominantes nas técnicas e termos sino-coreanos frequentes em conceitos filosóficos e nomes de formas Dan.',
    ],
    variants: ['Como ler nomes em coreano', 'Etimologia do Taekwondo', 'Estrutura de Makgi Chigi Chagi'],
    moduleHref: '/acervo',
    moduleLabel: 'Explorar exemplos reais no Acervo',
    references: [
      { field: 'terminology', reference: kukkiwonTerminology2012Ref },
      { field: 'terminology', reference: kukkiwonEtymology2025Ref },
    ],
    relatedLibrarySlugs: ['sonnal-an-chigi', 'sonnal', 'palgup-mureup-chigi'],
  },

  // NÍVEL AVANÇADO
  {
    slug: 'iron-historiografia-tradicao-fontes',
    topic: 'História e instituições',
    title: 'Historiografia: raízes culturais vs institucionalização moderna',
    subtitle: 'Como ler Subak, Taekkyeon e o pós-1945 com rigor histórico',
    level: 'avancado',
    levelLabel: 'Iron · Avançado',
    summary:
      'A própria página History of Taekwondo da Kukkiwon separa a história antiga, medieval e pré-moderna das artes marciais coreanas (como Subak/Subakhee, Kwonbeop e Taekkyeon) da história moderna iniciada após 1945 com os Cinco Kwans. Na pesquisa séria, distingue-se a herança cultural coreana — especialmente a valorização histórica de técnicas de perna inspiradas no Taekkyeon — da organização técnica e institucional efetivamente construída no século XX.',
    keyTakeaways: [
      'Evitar anacronismos: o nome "Taekwondo" e sua unificação institucional pertencem ao período moderno pós-1945, embora dialoguem com tradições marciais anteriores da Coreia.',
      'Reconhecer tanto as raízes coreanas (Taekkyeon, Subak) quanto o contexto histórico de transição do final da ocupação japonesa mencionado pela própria Kukkiwon.',
      'Comparar documentos institucionais (como as 5 virtudes de Spirit of Taekwondo) com tradições orais de cada Kwan de maneira respeitosa e metodologicamente transparente.',
    ],
    variants: ['Subak e Taekkyeon', 'Historiografia do Taekwondo', 'Tradição oral vs documento histórico'],
    references: [
      { field: 'historical', reference: kukkiwonHistoryRef },
      { field: 'context', reference: kukkiwonSpiritRef },
    ],
    relatedLibrarySlugs: ['iron-historia-pos-1945', 'iron-fontes-primarias-secundarias', 'iron-kwans-e-unificacao'],
  },
  {
    slug: 'iron-fontes-primarias-secundarias',
    topic: 'Fontes e terminologia',
    title: 'Fontes primárias, revisões editoriais e critérios de citação',
    subtitle: 'Como avaliar livros da Kukkiwon, artigos científicos e glossários da internet',
    level: 'avancado',
    levelLabel: 'Iron · Avançado',
    summary:
      'Em uma enciclopédia técnica confiável, uma afirmação vale pela qualidade e rastreabilidade de sua fonte. Publicações oficiais da Kukkiwon (como os projetos terminológicos de 2010–2012 e a coleção revisada em cinco volumes anunciada em 2022) possuem autoridade primária sobre nomenclatura técnica, enquanto apostilas informais e dicionários online servem apenas para mapear variantes populares em circulação.',
    keyTakeaways: [
      'Verificar sempre a instituição autora, o ano/edição da publicação e o localizador (capítulo, seção ou número de artigo) antes de tratar uma grafia como oficial.',
      'Lembrar que um termo presente em edição antiga não permanece automaticamente preferencial em revisões posteriores da Kukkiwon.',
      'Separar o que o documento em coreano ou inglês realmente afirma da tradução didática elaborada em português brasileiro.',
    ],
    variants: ['Metodologia de fontes', 'Textbook Kukkiwon 2022', 'Revisão documental'],
    moduleHref: '/fontes',
    moduleLabel: 'Conhecer fontes e critérios editoriais',
    references: [
      { field: 'terminology', reference: kukkiwonTerminology2012Ref },
      { field: 'context', reference: kukkiwon2022CollectionRef },
      { field: 'terminology', reference: kukkiwonEtymology2025Ref },
    ],
    relatedLibrarySlugs: ['iron-padronizacao-romanizacao', 'iron-morfologia-terminologia', 'sonnal'],
  },
  {
    slug: 'iron-padronizacao-romanizacao',
    topic: 'Fontes e terminologia',
    title: 'Padronização terminológica e sistemas de romanização',
    subtitle: 'Por que coexistem grafias como Dollyo/Dollyeo, Yop/Yeop e Kyorugi/Gyeorugi',
    level: 'avancado',
    levelLabel: 'Iron · Avançado',
    summary:
      'Grande parte das divergências de escrita no Taekwondo brasileiro decorre da coexistência histórica entre sistemas antigos de transcrição fonética (como McCune-Reischauer e adaptações lusófonas de mestres pioneiros) e a Romanização Revisada do Coreano adotada em publicações institucionais mais recentes. Vogais como ㅓ (eo, antes escrita o) e consoantes como ㄱ/ㅂ inicial (g/b vs k/p) explicam pares como Dollyeo/Dollyo e Bakkat/Pakkat.',
    keyTakeaways: [
      'Usar o Hangul como âncora invariável de identidade do termo técnico sempre que confirmado em fonte primária.',
      'Preservar grafias tradicionais brasileiras como chaves de busca ("Outras grafias") para que alunos de qualquer escola encontrem a ficha correta.',
      'Nunca inferir Hangul por engenharia reversa a partir de uma romanização ambígua sem conferência documental.',
    ],
    variants: ['Romanização Revisada do Coreano', 'Dollyo vs Dollyeo', 'Gyeorugi vs Kyorugi', 'Poomse vs Poomsae'],
    references: [
      { field: 'terminology', reference: kukkiwonTerminology2012Ref },
      { field: 'terminology', reference: kukkiwonEtymology2025Ref },
    ],
    relatedLibrarySlugs: ['iron-fontes-primarias-secundarias', 'iron-morfologia-terminologia', 'sonnaldeung'],
  },
  {
    slug: 'iron-evolucao-esportiva-marcial',
    topic: 'Modalidades e regulamentos',
    title: 'Arte marcial integral e especialização esportiva',
    subtitle: 'Como o repertório do Board 56 se relaciona com o Kyorugi olímpico moderno',
    level: 'avancado',
    levelLabel: 'Iron · Avançado',
    summary:
      'Enquanto o Kyorugi competitivo da World Taekwondo restringe alvos e superfícies permitidas para proteger a integridade dos atletas e viabilizar pontuação objetiva (coletes e capacetes eletrônicos, regras de clinch e faltas), a matriz técnica da Kukkiwon preserva nove famílias marciais completas — incluindo golpes de mão aberta e cotovelo (Chigi), saídas de pegada (Ppaegi), chaves articulares (Kkeokgi), quedas (Neomgigi) e rolamentos (Nakbeop).',
    keyTakeaways: [
      'Compreender por que certas técnicas fundamentais de Poomsae e defesa pessoal são proibidas na competição esportiva, mas essenciais na formação marcial completa.',
      'Acompanhar atualizações periódicas das regras da WT (como a edição vigente em 2026) sem confundir restrição esportiva com extinção técnica.',
      'Integrar no estudo avançado a leitura conjunta de Poomsae, Kibon Dongjak, Matchuo Kyorugi e Kyorugi competitivo.',
    ],
    variants: ['Taekwondo marcial vs olímpico', 'Nove famílias Board 56', 'Evolução das regras WT'],
    moduleHref: '/kyorugi',
    moduleLabel: 'Explorar as 9 famílias e regras em Kyorugi',
    references: [
      { field: 'context', reference: kukkiwonMeaningRef },
      { field: 'context', reference: wtRulesRef },
    ],
    relatedLibrarySlugs: ['ppaegi-kkeokgi-aplicacoes', 'iron-instituicoes-kukkiwon-wt-cbtkd', 'matchuo-kyorugi-fundamentos'],
  },
  ...ironContextEntries,
];

function quizQuestion(
  id: string,
  level: IronLevel,
  relatedSlug: string,
  question: string,
  options: readonly string[],
  correctIndex: number,
  explanation: string,
): IronQuizQuestion {
  return { id, level, relatedSlug, question, options, correctIndex, explanation };
}

export const ironQuizQuestions: readonly IronQuizQuestion[] = [
  quizQuestion('q-roles', 'basico', 'iron-instituicoes-kukkiwon-wt-cbtkd',
    'Qual instituição atua como referência mundial para padronização técnica de Poomsae e certificação internacional Dan?',
    [
      'Kukkiwon',
      'Comitê Olímpico Internacional diretamente em cada dojang',
      'Apenas o regulamento de arbitragem de cada torneio local',
    ],
    0,
    'A Kukkiwon é a referência técnico-educacional e certificadora Poom/Dan, enquanto a World Taekwondo regulamenta as competições esportivas.',
  ),
  quizQuestion('q-belts', 'basico', 'iron-graduacoes-gup-dan',
    'Sobre as faixas coloridas (Gup) e os requisitos de exame como intervalos de Sebon:',
    [
      'Existe uma única tabela idêntica obrigatória de cores e números de Sebon em todas as escolas do mundo.',
      'A organização das faixas coloridas e dos intervalos numerados varia conforme o currículo de cada escola e entidade.',
      'Faixas coloridas não estudam fundamentos nem teoria.',
    ],
    1,
    'Cada escola e federação estrutura seus graus Gup e intervalos pedagógicos; por isso a plataforma permite personalizar currículos por escola.',
  ),
  quizQuestion('q-morphology', 'intermediario', 'iron-morfologia-terminologia',
    'No termo documentado "Sonnal-an-chigi", o elemento final "chigi" indica:',
    [
      'Uma base de pernas em recuo',
      'A família técnica de golpes de impacto',
      'Um rolamento de amortecimento de queda',
    ],
    1,
    'Na terminologia Kukkiwon (2012), Sonnal identifica a faca da mão, An indica a direção para dentro e Chigi designa a família de golpes de impacto.',
  ),
  quizQuestion('q-poomsae-series', 'intermediario', 'iron-evolucao-poomsae',
    'Qual série de formas para graus Gup integra atualmente a listagem oficial ativa do Board 55 da Kukkiwon?',
    [
      'Os oito Taegeuk (Taegeuk 1 a 8 Jang)',
      'Exclusivamente a coleção histórica Palgwae',
      'Apenas sequências livres sem linha de deslocamento',
    ],
    0,
    'O Board 55 da Kukkiwon publica os oito Taegeuk e as nove formas Dan como coleção vigente; Palgwae é preservada separadamente como coleção histórica e complementar.',
  ),
  quizQuestion('q-romanization', 'avancado', 'iron-padronizacao-romanizacao',
    'Por que encontramos tanto "Dollyo Chagi" quanto "Dollyeo-chagi" em materiais sérios?',
    [
      'Porque são chutes executados com partes opostas do corpo.',
      'Porque refletem sistemas diferentes de romanização da mesma escrita coreana (돌려차기).',
      'Porque a escrita Hangul muda a cada campeonato.',
    ],
    1,
    'A vogal coreana ㅓ era transcrita frequentemente como "o" em adaptações antigas e passou a "eo" na Romanização Revisada adotada em publicações recentes da Kukkiwon.',
  ),
  quizQuestion('q-historiography', 'avancado', 'iron-historia-pos-1945',
    'Como a página institucional History of Taekwondo da Kukkiwon apresenta o surgimento das escolas modernas (Cinco Kwans)?',
    [
      'No período pós-libertação a partir de 1945/1946, culminando na unificação associativa nos anos 1960 e na fundação da Kukkiwon em 1972.',
      'Como federação olímpica já existente com regras eletrônicas no século XIX.',
      'Sem qualquer relação com mestres coreanos do século XX.',
    ],
    0,
    'A Kukkiwon distingue antecedentes culturais antigos/modernos (Subak, Taekkyeon) da organização moderna iniciada com os Cinco Kwans (1946–1960), unificação (1961–1970) e Kukkiwon (1972).',
  ),
];
