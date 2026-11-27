import type { LibraryReference } from '../lib/library';
import type { IronEntry, IronLevel } from './iron-guide';
import { wtCompetitionRulesUrl } from './kyorugi-guide';
import { kukkiwonTerminologyReference } from './movement-sources';

const labels = {
  basico: 'Iron · Básico',
  intermediario: 'Iron · Intermediário',
  avancado: 'Iron · Avançado',
} as const;

function source(institution: string, title: string, edition: string, url: string, locator: string): LibraryReference {
  return { institution, title, edition, url, locator, checkedOn: '2026-11-26' };
}

const kukkiwonPortal = (title: string, content: number, menu: number, locator: string) =>
  source('Kukkiwon', title, 'Portal institucional em inglês', `https://kukkiwon.or.kr/eng/contents/view?contentsNo=${content}&menuLevel=2&menuNo=${menu}`, locator);

const modernHistory = kukkiwonPortal('History of Taekwondo', 93, 94, 'Modern Taekwondo History');
const origin = kukkiwonPortal('Introduction', 78, 80, 'Apresentação institucional e fundação');
const academy = kukkiwonPortal('Kukkiwon Training', 87, 85, 'World Taekwondo Academy');
const practice = kukkiwonPortal('Meaning of Taekwondo', 92, 93, 'Meaning of Taekwondo e Suryeon');
const spirit = kukkiwonPortal('Spirit of Taekwondo', 94, 95, 'Geukgi, Hongik e virtudes práticas');

const olympic = source('Comitê Olímpico Internacional', 'History of Taekwondo at the Olympic Games', 'Ficha histórica, 2017',
  'https://stillmed.olympics.com/media/Document%20Library/OlympicOrg/Factsheets-Reference-Documents/Games/OG/History-of-sports/Reference-document-Taekwondo-History-at-the-OG.pdf',
  'p. 1 · Introdução e marcos olímpicos');
const olympicProgram = { ...olympic, locator: 'Quadro de provas do programa olímpico' };
const statutes = source('World Taekwondo', 'World Taekwondo Statutes', 'Em vigor a partir de 27/01/2023',
  'https://www.worldtaekwondo.org/att_file/documents/World%20Taekwondo%20Statutes%20%28as%20of%20January%2027%2C%202023%29.pdf',
  'Preâmbulo · fundação e reconhecimento institucional');
const certification = source('Kukkiwon', 'Poom and Dan Promotion Test', 'Portal institucional em inglês',
  'https://m.kukkiwon.or.kr/eng/contents/view?contentsNo=83&menuLevel=3&menuNo=67',
  'Finalidade do exame e certificação Poom e Dan');
const wtaCourses = source('World Taekwondo Academy', 'Training Programs', 'Catálogo institucional em inglês',
  'https://wta.kukkiwon.or.kr/en/trainingProcess/list',
  'International Instructor Course e Examiner for Poom·Dan Promotion Test Course');
const donga = source('Dong-A University', 'Guia GEN008 de Taekwondo', 'Guia curricular coreano',
  'https://dms.donga.ac.kr/sites/cle/download/class1/GEN008%20%EA%B5%90%EC%96%91%ED%95%84%EC%88%98%20%EA%B0%95%EC%9D%98%EC%A7%80%EC%B9%A8%EC%84%9C%28%ED%83%9C%EA%B6%8C%EB%8F%84%29%20-%20%EC%98%88%EC%B2%B4%EB%8A%A5%EA%B3%84%EC%97%B4.pdf',
  'Semana 2 · Dobok, faixas e etiqueta');
const dongaStudy = { ...donga, locator: 'Semanas 4–7 · Figuras 4–7 e objetivos de estudo' };
const dongaPractice = { ...donga, locator: 'Semanas 14 e 15 · Revisão e critérios da disciplina' };

const textbook = source('Kukkiwon', 'Kukkiwon to Publish Taekwondo Textbooks', 'Comunicado de 28/01/2022',
  'https://m.kukkiwon.or.kr/eng/board/read?boardManagementNo=49&boardNo=1688&menuLevel=2&menuNo=91&page=11',
  'Board 49 nº 1688 · Histórico das edições e escopo dos volumes');
const textbookEnglish = source('Kukkiwon', 'Kukkiwon Publishes English Version of Taekwondo Textbook', 'Comunicado de 2022',
  'https://www.kukkiwon.or.kr/eng/board/read?boardManagementNo=49&boardNo=1701&menuLevel=2&menuNo=91&page=9',
  'Board 49 nº 1701 · Estrutura da edição em inglês e tradução');
const textbookAbridged = source('Kukkiwon', 'Abridged Version of Taekwondo Textbook', 'Comunicado de 13/09/2022',
  'https://www.kukkiwon.or.kr/eng/board/read?boardManagementNo=49&boardNo=1703&menuLevel=2&menuNo=91&page=10',
  'Board 49 nº 1703 · Recursos gráficos da edição abreviada');
const directions = source('Lee Jae-don e Park Jeong-ho · Taekwondo Journal of Kukkiwon',
  'Proposta de melhoria da linha e descrição de Poomsae no manual Kukkiwon', 'Vol. 4, n. 2, 2013',
  'https://research.kukkiwon.or.kr/board/notice/article/55574', 'Resumo · perspectiva do diagrama e campos da tabela sinóptica');
const daegu = source('Associação de Taekwondo de Daegu', 'Taekwondo prático', 'Página institucional em coreano',
  'https://daegutkd.net/taekwondo/skill.php', 'Tabela 공인품새 · colunas 품 e 동작수');
const rules = source('World Taekwondo', 'Poomsae Competition Rules and Interpretation', 'Edição com vigência inicial em 30/09/2024',
  'https://www.worldtaekwondo.org/att_file/documents/Poomsae%20Competition%20Rules%20and%20Interpretation%20%28In%20force%20as%20of%20September%2030%202024%29.pdf',
  'Art. 15 §1 · critérios de Poomsae reconhecido');
const categories = { ...rules, locator: 'Arts. 5 e 9 · modalidades e Poomsae livre' };
const scoreMethod = { ...rules, locator: 'Art. 16 §1 · método de pontuação em Poomsae reconhecido' };
const concussion = source('Centers for Disease Control and Prevention', 'Responding to a Sports-related Concussion',
  'HEADS UP · orientação a treinadores e responsáveis', 'https://www.cdc.gov/heads-up/response/index.html',
  'Steps to take e Return to sports');

const brazil = source('Secretaria Municipal de Educação de Goiânia', 'Educação Física: Taekwondo',
  'Conexão Escola · material didático', 'https://sme.goiania.go.gov.br/conexaoescola/eaja/educacao-fisica-taekwondo/',
  'Seção sobre a chegada ao Brasil');
const regional = source('Fundação Catarinense de Esporte', 'Taekwondo agora é modalidade oficial nos Joguinhos',
  'Comunicado institucional, 2019', 'https://www.fesporte.sc.gov.br/eventos/joguinhos/item/3417-taekwondo-esteia-como-modalidade-oficial-dos-joguinhos',
  'Ingresso nos Joguinhos Abertos e nota histórica');
const training = source('Organização Mundial da Saúde', 'WHO guidelines on physical activity and sedentary behaviour: at a glance',
  '2020', 'https://www.who.int/publications/i/item/9789240014886', 'Visão geral das recomendações por grupos populacionais');
const equipment = source('World Taekwondo', 'Competition Rules & Interpretation',
  'Edição com vigência inicial em 30/09/2024',
  'https://www.worldtaekwondo.org/att_file/documents/WT%20Competition%20Rules%20and%20Interpretation%20%28September%2030%2C%202024%29.pdf',
  'Art. 4 §2 · uniforme e equipamentos de competição');
const wtJune = source('World Taekwondo', 'Competition Rules & Interpretation', 'Vigência inicial em 01/06/2026',
  wtCompetitionRulesUrl, 'Arts. 4, 10 e 16 · participação, procedimento e resultado');
const hanmadang = source('Comitê organizador · World Taekwondo Hanmadang', '2024 Mungyeong World Taekwondo Hanmadang Contest Outline',
  'Regulamento específico da edição de 2024',
  'https://hanmadang.kukkiwon.or.kr/pdfjs/web/viewer.html?file=%2FguideDownload.do%3Fseq%3D16&is_kor=N&mid=1&sid=2',
  'Contest rules §6 · Breaking Targets and Breaking board holder');
const breakingTerminology = kukkiwonTerminologyReference('Apêndice Gyeokpa, pp. 76–79 do PDF · Creative Break, Power Break e modalidades de salto');
const koreanIndex = source('Kukkiwon', 'Índice coreano de Poomsae', 'Board 37',
  'https://www.kukkiwon.or.kr/base/board/list?boardManagementNo=37&menuLevel=3&menuNo=62',
  'Artigos de Taegeuk e formas Dan');
const stances = { ...daegu, locator: '태권도 기본서기의 정의 e 기본서기 자세의 종류 · bases e apoio' };

type ContextEntry = Omit<IronEntry, 'levelLabel' | 'references'> & {
  topic: string;
  level: IronLevel;
  sections: NonNullable<IronEntry['sections']>;
};

function entry(card: ContextEntry): IronEntry {
  return {
    ...card,
    levelLabel: labels[card.level],
    references: card.sections.map(({ reference }) => ({ field: 'context', reference })),
  };
}

export const ironContextEntries = [
  entry({
    slug: 'iron-uniforme-etiqueta',
    title: 'Dobok, faixa e etiqueta no dojang',
    subtitle: 'Como ler convenções de aula e de competição',
    level: 'basico',
    topic: 'Cultura e prática',
    summary: 'Uniforme, faixa e cumprimento ajudam a organizar a aula. A função de cada elemento depende do contexto em que é usado.',
    sections: [
      { title: 'O uniforme na aula', text: 'O guia da Dong-A University reúne uniforme, faixa e etiqueta na segunda semana do curso. É um exemplo de como se ensinam normas de convivência ao introduzir a prática. Para conhecer a rotina de um dojang, confirme com o professor como entrar, cumprimentar e preparar a área de treino.', reference: donga },
      { title: 'O uniforme no torneio', text: 'A World Taekwondo define requisitos próprios de uniforme para campeonatos de Poomsae que promove. Uma peça aceita no treino pode ter requisitos diferentes no evento. Consulte a edição do regulamento e as instruções de inscrição antes de escolher o uniforme.', reference: { ...rules, locator: 'Art. 4 §2 · uniforme de competição' } },
    ],
    keyTakeaways: ['Confirme o protocolo da sua turma antes da primeira aula.', 'Leia a regra do evento ao preparar o uniforme de competição.'],
    variants: ['Vestimenta', 'Uniforme', 'Dobok', 'Cumprimento'],
    relatedLibrarySlugs: ['iron-espirito-cortesia-dojang', 'iron-graduacoes-gup-dan'],
  }),
  entry({
    slug: 'iron-autocontrole-convivencia',
    title: 'Autocontrole e responsabilidade na prática',
    subtitle: 'Leitura didática de Geukgi e Hongik',
    level: 'basico',
    topic: 'Cultura e prática',
    summary: 'A Kukkiwon organiza sua apresentação do espírito do Taekwondo em torno da superação de si e da contribuição para os outros.',
    sections: [
      { title: 'Autocontrole como tarefa de aprendizagem', text: 'Na apresentação da Kukkiwon, Geukgi orienta a superação de dificuldades na prática. Uma forma de aplicar a ideia na aula é escolher um objetivo observável, ouvir a correção e voltar ao exercício com atenção ao detalhe apontado. O progresso fica mais fácil de acompanhar quando o objetivo é concreto.', reference: spirit },
      { title: 'Responsabilidade com quem treina junto', text: 'Hongik amplia o foco para o bem dos outros. No dojang, uma aplicação didática é combinar o objetivo do exercício com a dupla, respeitar a intensidade indicada pelo professor e interromper para esclarecer uma dúvida. A cortesia pode ser observada nesses acordos do dia a dia.', reference: spirit },
    ],
    keyTakeaways: ['Use uma correção observável como meta de estudo.', 'Confirme com a dupla o objetivo do exercício.'],
    variants: ['Cortesia', 'Disciplina', 'Respeito', 'Geukgi', 'Hongik'],
    relatedLibrarySlugs: ['iron-espirito-cortesia-dojang', 'iron-uniforme-etiqueta'],
  }),
  entry({
    slug: 'iron-finalidades-do-treino',
    title: 'O que se aprende em cada parte do treino',
    subtitle: 'Teoria, fundamentos, formas e prática acompanhada',
    level: 'basico',
    topic: 'Cultura e prática',
    summary: 'A estrutura do manual da Kukkiwon ajuda a reconhecer que uma aula pode trabalhar objetivos diferentes em momentos distintos.',
    sections: [
      { title: 'Diferentes tarefas de uma mesma prática', text: 'A edição da Kukkiwon anunciada em 2022 dedica volumes distintos à compreensão da modalidade, aos fundamentos, às formas, ao combate esportivo e à quebra e demonstração. Essa divisão ajuda a identificar que tipo de material consultar para esclarecer a dúvida de uma aula.', reference: textbook },
      { title: 'Transformar a dúvida em pergunta', text: 'A apresentação institucional descreve o treinamento como parte do próprio significado do Taekwondo. Depois de uma aula, anote se a dúvida veio do nome de um movimento, da passagem entre dois momentos ou de uma regra de evento. Esse registro ajuda a levar ao professor uma pergunta que ele consegue observar e responder.', reference: practice },
    ],
    keyTakeaways: ['Nomeie o assunto da dúvida antes de escolher a referência.', 'Registre em qual exercício a dúvida apareceu.'],
    variants: ['Fundamentos do treino', 'Objetivos da aula', 'Suryeon'],
    relatedLibrarySlugs: ['iron-significado-taekwondo', 'iron-colecao-kukkiwon-2022'],
  }),
  entry({
    slug: 'iron-curriculo-na-pratica',
    title: 'Como ler o currículo da sua escola',
    subtitle: 'Requisitos de faixa, estudo e material de consulta',
    level: 'basico',
    topic: 'Graduação e aprendizagem',
    summary: 'Um currículo explica o que será estudado e avaliado em um contexto. Identificar quem o definiu evita confundir exemplos de ensino com requisitos de outra escola.',
    sections: [
      { title: 'Ler a finalidade do documento', text: 'O guia GEN008 mostra um currículo universitário que organiza formas, teoria e valores em semanas e inclui critérios próprios de avaliação. Use esse tipo de documento como exemplo de planejamento: identifique o público, a duração e o objetivo antes de comparar seu conteúdo com o da sua escola.', reference: dongaPractice },
      { title: 'Confirmar o alcance de um requisito de graduação', text: 'A Kukkiwon descreve a avaliação de Poom e Dan como verificação da formação do praticante. Ao consultar o professor, separe o que pertence à avaliação interna da escola, o que vem da entidade certificadora e o que serve de material complementar. Registre as três informações no currículo de estudo.', reference: certification },
    ],
    keyTakeaways: ['Anote a Escola ou instituição responsável pelo requisito.', 'Confirme a versão do currículo antes de definir sua lista de estudo.'],
    variants: ['Plano de estudo', 'Currículo escolar', 'Exame de faixa'],
    relatedLibrarySlugs: ['iron-graduacoes-gup-dan', 'sebon-kyorugi', 'dubon-kyorugi', 'anjoa-kyorugi'],
    moduleHref: '/curriculos',
    moduleLabel: 'Consultar currículos',
  }),
  entry({
    slug: 'iron-leitura-de-poomsae',
    title: 'Como estudar uma forma por etapas',
    subtitle: 'Organize percurso, posição, base e ações de cada movimento',
    level: 'basico',
    topic: 'Poomsae',
    summary: 'A numeração ajuda a encontrar a passagem estudada. A tabela, o diagrama e o quadro respondem a perguntas diferentes sobre aquela passagem.',
    sections: [
      { title: 'Escolher o ponto de partida', text: 'O guia de Taekwondo da Dong-A University apresenta, nas primeiras formas, diagramas de percurso junto a tabelas de etapas. Comece localizando a preparação e marque o número da passagem que quer discutir. Em seguida, compare os campos da tabela com o desenho para formular uma pergunta sobre a mudança observada.', reference: dongaStudy },
      { title: 'Evitar a troca de referencial', text: 'O estudo de Lee e Park descreve tabelas que registram separadamente ordem, olhar, posição e base. Ao tomar notas, reserve um campo para onde a pessoa está e outro para onde olha. Use o número da etapa e o documento consultado para reconstruir a dúvida com o professor.', reference: directions },
    ],
    keyTakeaways: ['Identifique o início e mantenha o referencial durante a leitura.', 'Anote o número antes de procurar a técnica na Biblioteca.'],
    variants: ['Passo a passo', 'Percurso', 'Interpretação de diagramas'],
    relatedLibrarySlugs: ['taegeuk-1-jang', 'taegeuk-2-jang', 'iron-convencoes-de-contagem'],
    moduleHref: '/poomsae',
    moduleLabel: 'Consultar formas',
  }),
  entry({
    slug: 'iron-seguranca-impacto',
    title: 'Como interromper o treino após um impacto',
    subtitle: 'Comunicar uma suspeita de concussão ao responsável',
    level: 'basico',
    topic: 'Cultura e prática',
    summary: 'Uma suspeita de concussão pede a interrupção da participação e encaminhamento para avaliação de saúde.',
    sections: [
      { title: 'A primeira resposta na aula', text: 'O programa HEADS UP, dos CDC, orienta retirar o atleta da atividade quando houver suspeita de concussão após um impacto. Informe o professor ou responsável e descreva o que aconteceu. Em caso de sinais de emergência, acione o atendimento de urgência indicado no local.', reference: concussion },
      { title: 'Quem decide sobre o retorno', text: 'Os CDC indicam que a decisão sobre voltar ao esporte cabe ao profissional de saúde. O relato da aula pode registrar o momento do impacto e as mudanças percebidas para ajudar no encaminhamento. O praticante e a equipe de treino devem seguir a orientação recebida.', reference: concussion },
    ],
    keyTakeaways: ['Pare a participação se houver suspeita.', 'Informe o responsável pela aula e siga a orientação de saúde.'],
    variants: ['Segurança', 'Concussão', 'Treino de contato', 'Lesão'],
    relatedLibrarySlugs: ['iron-autocontrole-convivencia', 'matchuo-kyorugi-fundamentos'],
  }),
  entry({
    slug: 'iron-kwans-e-unificacao',
    title: 'Dos Kwans à unificação associativa',
    subtitle: 'Como situar escolas fundadoras e associações na história moderna',
    level: 'intermediario',
    topic: 'História e instituições',
    summary: 'A cronologia da Kukkiwon trata a abertura dos Kwans no pós-guerra e a organização associativa como etapas do desenvolvimento moderno.',
    sections: [
      { title: 'Escolas e organização coletiva', text: 'A história institucional situa o surgimento dos Kwans no período que se seguiu à libertação coreana e distingue essa etapa do processo de coordenação nacional nos anos 1960. Organize uma linha do tempo com duas faixas, uma para escolas e outra para associações, para acompanhar mudanças que ocorreram em ritmos diferentes.', reference: modernHistory },
      { title: 'A institucionalização na década seguinte', text: 'A fundação da Kukkiwon em 1972 é um marco posterior na própria cronologia. Ao comparar relatos, observe se a data refere-se à abertura de um dojang, à criação de uma associação ou ao início de uma instituição técnica. Cada marco documenta uma unidade histórica diferente.', reference: origin },
    ],
    keyTakeaways: ['Identifique a entidade a que cada data se refere.', 'Consulte a cronologia junto de relatos históricos quando a origem for disputada.'],
    variants: ['Kwans', 'Escolas fundadoras', 'Unificação do Taekwondo'],
    relatedLibrarySlugs: ['iron-historia-pos-1945', 'iron-historiografia-tradicao-fontes'],
  }),
  entry({
    slug: 'iron-kukkiwon-1972',
    title: 'A fundação da Kukkiwon',
    subtitle: 'O que a instituição registra sobre sua origem e missão',
    level: 'intermediario',
    topic: 'História e instituições',
    summary: 'A Kukkiwon data sua fundação em 30 de novembro de 1972 e apresenta preservação, desenvolvimento e formação como parte de sua atuação.',
    sections: [
      { title: 'O marco de 1972', text: 'Na apresentação oficial, a abertura em Seul é descrita como parte do esforço de desenvolver e difundir a prática. Ao usar essa data numa ficha, atribua-a à Kukkiwon e identifique a natureza da fonte, que apresenta a visão da própria instituição.', reference: origin },
      { title: 'Como a missão aparece em documentos', text: 'O anúncio da revisão de 2022 mostra um exemplo concreto da atividade educacional: uma coleção que abrange teoria, fundamentos e disciplinas da prática. Já a descrição de Poom e Dan documenta uma função de certificação. Essas funções podem ser verificadas consultando os documentos produzidos para cada finalidade.', reference: textbook },
    ],
    keyTakeaways: ['Identifique a instituição autora de cada documento.', 'Consulte a fonte específica para ensino, certificação ou competição.'],
    variants: ['História da Kukkiwon', 'Sede mundial', 'Fundação de 1972'],
    relatedLibrarySlugs: ['iron-instituicoes-kukkiwon-wt-cbtkd', 'iron-colecao-kukkiwon-2022', 'iron-certificacao-poom-dan'],
  }),
  entry({
    slug: 'iron-origem-world-taekwondo',
    title: 'Da World Taekwondo Federation à World Taekwondo',
    subtitle: 'História e função de uma federação esportiva internacional',
    level: 'intermediario',
    topic: 'História e instituições',
    summary: 'Os estatutos da World Taekwondo situam sua fundação em 1973 e documentam o nome anteriormente usado pela federação.',
    sections: [
      { title: 'Ler a sigla em contexto', text: 'Documentos de épocas distintas podem usar World Taekwondo Federation (WTF) ou World Taekwondo (WT). O preâmbulo do estatuto de 2023 permite reconhecer as duas referências na história da federação. Registre o nome que aparece no documento e a data da edição.', reference: statutes },
      { title: 'Identificar um documento esportivo', text: 'O regulamento de Poomsae da federação descreve categorias de competição e sua organização. Quando uma turma usar um regulamento para estudar um evento, leia primeiro os artigos de aplicação e confira o aviso da organização. A edição do documento ajuda a contextualizar relatos de torneios anteriores.', reference: categories },
    ],
    keyTakeaways: ['Preserve o nome e a data escritos na referência histórica.', 'Verifique a entidade indicada no regulamento usado pelo evento.'],
    variants: ['WTF', 'WT', 'Federação mundial', '1973'],
    relatedLibrarySlugs: ['iron-instituicoes-kukkiwon-wt-cbtkd', 'iron-taekwondo-olimpico', 'iron-poomsae-reconhecido-livre'],
  }),
  entry({
    slug: 'iron-taekwondo-olimpico',
    title: 'Seul, Barcelona e a estreia olímpica em Sydney',
    subtitle: 'Demonstração e entrada no programa de medalhas',
    level: 'intermediario',
    topic: 'História e instituições',
    summary: 'O histórico do COI registra participações de demonstração em 1988 e 1992 e a entrada no programa olímpico de medalhas em 2000.',
    sections: [
      { title: 'Três marcos com papéis distintos', text: 'Seul 1988 e Barcelona 1992 aparecem no histórico olímpico como edições de demonstração. Sydney 2000 marca a presença da modalidade no programa de medalhas. Guarde a condição de cada edição ao registrar a data para que uma linha do tempo preserve o tipo de participação.', reference: olympic },
      { title: 'Reconhecer as provas registradas', text: 'A ficha do COI apresenta as provas olímpicas em categorias de peso. Esse recorte esportivo orienta a leitura de resultados e da programação dos Jogos. Para estudar formas e seus formatos competitivos, consulte os documentos próprios de Poomsae.', reference: olympicProgram },
    ],
    keyTakeaways: ['Registre Seul 1988 e Barcelona 1992 como demonstrações.', 'Use Sydney 2000 como marco do programa de medalhas.'],
    variants: ['Olimpíadas', 'Jogos Olímpicos', 'Sydney 2000', 'Seul 1988', 'Barcelona 1992'],
    relatedLibrarySlugs: ['iron-origem-world-taekwondo', 'iron-evolucao-esportiva-marcial'],
  }),
  entry({
    slug: 'iron-certificacao-poom-dan',
    title: 'O que documenta uma certificação Poom ou Dan',
    subtitle: 'Exame, certificado e exigências de cada contexto',
    level: 'intermediario',
    topic: 'Graduação e aprendizagem',
    summary: 'A Kukkiwon apresenta os exames Poom e Dan como avaliações do nível de formação e prática alcançado.',
    sections: [
      { title: 'Avaliação e registro de graduação', text: 'O exame avalia o nível de formação segundo o processo indicado pela instituição. O certificado registra a graduação concedida nesse sistema. Ao conferir um documento, identifique a entidade emissora, a graduação registrada e a finalidade para a qual precisa usá-lo.', reference: certification },
      { title: 'Exigências para participar de competições', text: 'A World Taekwondo explicita condições para os participantes dos campeonatos que regulamenta. Compare o artigo pertinente com o edital do evento específico. Uma lista de requisitos competitivos responde a uma pergunta diferente da lista de conteúdos que a escola usa para ensinar.', reference: { ...rules, locator: 'Art. 4 §1 · requisitos para participantes' } },
    ],
    keyTakeaways: ['Identifique a entidade emissora do certificado.', 'Consulte os requisitos do exame e do evento em seus documentos próprios.'],
    variants: ['Certificado Dan', 'Certificação Poom', 'Exame de graduação'],
    relatedLibrarySlugs: ['iron-graduacoes-gup-dan', 'iron-formacao-instrutores'],
  }),
  entry({
    slug: 'iron-formacao-instrutores',
    title: 'Formação de instrutores e examinadores',
    subtitle: 'Papéis educacionais no catálogo da World Taekwondo Academy',
    level: 'intermediario',
    topic: 'Graduação e aprendizagem',
    summary: 'A World Taekwondo Academy lista cursos distintos para instrução e atuação em exames Poom e Dan.',
    sections: [
      { title: 'O papel da academia', text: 'A Kukkiwon registra que criou o centro que deu origem à World Taekwondo Academy em 1982 para formar lideranças na modalidade. A atividade educacional inclui cursos que atendem a diferentes responsabilidades de ensino e avaliação.', reference: academy },
      { title: 'O que procurar no programa do curso', text: 'O catálogo identifica a formação de instrutores e a formação para examinadores de Poom e Dan com objetivos e condições próprios. Para avaliar uma formação, confira a finalidade do curso, a instituição que o oferece e os pré-requisitos da turma anunciada.', reference: wtaCourses },
    ],
    keyTakeaways: ['Leia o nome completo do curso e sua finalidade.', 'Confirme os pré-requisitos na oferta que pretende consultar.'],
    variants: ['WTA', 'Curso de mestre', 'Instrutor', 'Examinador'],
    relatedLibrarySlugs: ['iron-certificacao-poom-dan', 'iron-instituicoes-kukkiwon-wt-cbtkd'],
  }),
  entry({
    slug: 'iron-gyeokpa-demonstracao',
    title: 'Gyeokpa e demonstração no repertório de estudo',
    subtitle: 'Onde localizar quebra e demonstração na documentação',
    level: 'intermediario',
    topic: 'Modalidades e regulamentos',
    summary: 'A edição de 2022 da Kukkiwon trata Gyeokpa e demonstração em um volume dedicado, com escopo próprio.',
    sections: [
      { title: 'Lugar na coleção técnica', text: 'O anúncio do conjunto revisado reserva o volume 5 a Gyeokpa e demonstração. Para localizar um assunto, comece pelo volume correspondente ao objetivo da consulta e confira no exemplar o capítulo que descreve a atividade.', reference: textbook },
      { title: 'Consulta em outro idioma', text: 'O comunicado da edição inglesa dá destaque à tradução de métodos e estratégias nos volumes de competição e demonstração. Em uma ficha bilíngue, indique o volume, a edição e o idioma de cada termo citado. Preserve diferenças de nomenclatura para conferência em aula.', reference: textbookEnglish },
    ],
    keyTakeaways: ['Use o volume 5 como ponto de partida documental.', 'Registre o idioma e a edição no localizador de uma ficha de leitura.'],
    variants: ['Quebra', 'Quebramento', 'Breaking', 'Demonstração'],
    relatedLibrarySlugs: ['iron-colecao-kukkiwon-2022', 'iron-finalidades-do-treino'],
  }),
  entry({
    slug: 'iron-poomsae-reconhecido-livre',
    title: 'Poomsae reconhecido, livre e formato misto',
    subtitle: 'Como a WT distingue formatos de competição',
    level: 'intermediario',
    topic: 'Modalidades e regulamentos',
    summary: 'Os formatos de competição da World Taekwondo têm critérios próprios e podem ser combinados conforme o regulamento.',
    sections: [
      { title: 'Identificar o formato', text: 'No regulamento com vigência inicial em setembro de 2024, a World Taekwondo trata Poomsae reconhecido e livre como modalidades distintas. Na competição mista descrita no artigo 5, o participante demonstra primeiro uma forma reconhecida e depois uma apresentação livre.', reference: categories },
      { title: 'Ler o critério correspondente', text: 'O artigo 15 distribui os critérios de forma diferente nas duas modalidades. Para comparar duas apresentações, confirme primeiro se pertencem ao mesmo formato. Para uma competição futura, a organização deve indicar qual edição e categorias serão aplicadas.', reference: { ...rules, locator: 'Art. 15 §§1–2 · distribuição de critérios por modalidade' } },
    ],
    keyTakeaways: ['Confirme o formato antes de comparar notas.', 'Consulte a regra do evento para saber quais formas serão avaliadas.'],
    variants: ['Poomsae de competição', 'Freestyle', 'Free Style', 'Formato misto'],
    relatedLibrarySlugs: ['iron-evolucao-poomsae', 'iron-precisao-e-apresentacao', 'taegeuk-8-jang'],
    moduleHref: '/poomsae',
    moduleLabel: 'Consultar o índice de Poomsae',
  }),
  entry({
    slug: 'iron-precisao-e-apresentacao',
    title: 'Precisão e apresentação no Poomsae reconhecido',
    subtitle: 'Como interpretar a nota na edição WT de setembro de 2024',
    level: 'avancado',
    topic: 'Modalidades e regulamentos',
    summary: 'Na edição consultada, a nota de Poomsae reconhecido reúne até quatro pontos de precisão e até seis de apresentação.',
    sections: [
      { title: 'O que cada parte da nota observa', text: 'A parcela de precisão reúne movimentos básicos, detalhes da forma e equilíbrio. A apresentação considera velocidade e força, ritmo e expressão de energia. Separar os critérios ajuda a entender se uma observação do árbitro se refere à execução de uma etapa ou à apresentação do conjunto.', reference: rules },
      { title: 'Usar o comentário para voltar ao estudo', text: 'O artigo seguinte explica o método de pontuação e apresenta exemplos de ocorrências de precisão. Ao rever um comentário recebido, localize a etapa, a edição do regulamento e o critério citado. Isso ajuda a conversar com o instrutor sobre uma correção identificável.', reference: scoreMethod },
    ],
    keyTakeaways: ['Atribua os valores de nota à edição consultada.', 'Distinga o critério de apresentação da precisão de uma etapa.'],
    variants: ['Arbitragem', 'Pontuação de Poomsae', 'Ritmo', 'Equilíbrio'],
    relatedLibrarySlugs: ['iron-poomsae-reconhecido-livre', 'iron-leitura-de-poomsae'],
  }),
  entry({
    slug: 'iron-convencoes-de-contagem',
    title: 'Etapa, ação e quadro na contagem de Poomsae',
    subtitle: 'Como comparar números de fontes diferentes',
    level: 'avancado',
    topic: 'Poomsae',
    summary: 'Uma tabela pode contar etapas numeradas e ações em colunas diferentes. Uma imagem adicional pode documentar uma ação já registrada de outro ângulo.',
    sections: [
      { title: 'Ler as duas colunas antes de comparar', text: 'A tabela da Associação de Taekwondo de Daegu atribui ao Taegeuk 2 dezoito unidades na coluna 품 e vinte e três na coluna 동작수. Nesta enciclopédia, a primeira contagem identifica etapas numeradas e a segunda identifica ações individuais. Os valores devem acompanhar a convenção da referência citada.', reference: daegu },
      { title: 'Descrever o que está sendo registrado', text: 'O guia da Dong-A University apresenta a preparação e o retorno junto à série numerada, com rótulos próprios. Ao registrar uma passagem, anote a etapa, cada ação e o localizador do quadro. Uma vista lateral complementar pode receber outra referência dentro da mesma ação.', reference: { ...donga, locator: 'Semana 5, p. 9, figura 5 · Taegeuk 2' } },
    ],
    keyTakeaways: ['Guarde o nome das colunas da fonte.', 'Separe preparação e retorno da contagem numerada quando assim estiverem documentados.'],
    variants: ['Contagem de passos', 'Movimento composto', 'Poom', 'Dongjak'],
    relatedLibrarySlugs: ['taegeuk-2-jang', 'iron-leitura-de-poomsae', 'iron-perspectiva-no-percurso'],
  }),
  entry({
    slug: 'iron-perspectiva-no-percurso',
    title: 'Perspectiva, olhar e posição no percurso',
    subtitle: 'Um método para interpretar diagramas de Poomsae',
    level: 'avancado',
    topic: 'Poomsae',
    summary: 'O ponto de vista do praticante é uma escolha explícita de leitura. Confirme a legenda da edição antes de transpor as setas para o espaço de treino.',
    sections: [
      { title: 'Fixar a referência na preparação', text: 'Lee e Park descrevem as dificuldades produzidas por diagramas cuja orientação parece invertida para o leitor. A proposta dos autores trata a direção do olhar e a mudança de posição como informações separadas. Comece por localizar onde a pessoa está na preparação e para onde ela olha.', reference: directions },
      { title: 'Comparar diagramas campo a campo', text: 'A edição abreviada anunciada pela Kukkiwon acrescenta marcas de direção e eixos de rotação para facilitar a leitura. Ao comparar dois materiais, registre a edição, o código de direção e a posição inicial. Isso permite verificar se a diferença está no desenho, na convenção ou na descrição da etapa.', reference: textbookAbridged },
    ],
    keyTakeaways: ['Confirme o referencial antes de comparar esquemas.', 'Mantenha posição, orientação e rotação em campos próprios.'],
    variants: ['Direção absoluta', 'Ponto de vista', 'Rotação', 'Trajetória'],
    relatedLibrarySlugs: ['iron-convencoes-de-contagem', 'taegeuk-1-jang', 'kibon-alturas-direcoes'],
    moduleHref: '/fundamentos/alturas-e-direcoes',
    moduleLabel: 'Consultar direções e alturas',
  }),
  entry({
    slug: 'iron-colecao-kukkiwon-2022',
    title: 'Como citar a coleção de manuais Kukkiwon de 2022',
    subtitle: 'Edição, idioma, volume e página na referência',
    level: 'avancado',
    topic: 'Fontes e terminologia',
    summary: 'A coleção revisada de 2022 tem cinco volumes. A identificação do idioma e do tipo de edição ajuda a localizar a mesma afirmação.',
    sections: [
      { title: 'Distinguir as edições', text: 'O anúncio da Kukkiwon identifica um manual inicial de 1987, uma edição suplementar de 2005 e a coleção revisada de 2022. A distribuição do conteúdo mudou com a divisão em volumes. Quando uma ficha apontar apenas para o título, procure o ano e o volume antes de procurar o trecho.', reference: textbook },
      { title: 'Citar o exemplar efetivamente consultado', text: 'A versão abreviada anunciada em setembro de 2022 inclui escolhas próprias de apresentação gráfica. Registre se o material é integral ou abreviado e em que idioma está. Informe a página ou seção do exemplar examinado, sobretudo quando um quadro ou localizador divergir de outra edição.', reference: textbookAbridged },
    ],
    keyTakeaways: ['Registre ano, volume, idioma e página na mesma referência.', 'Marque uma divergência de edição para conferência docente.'],
    variants: ['Taekwondo Textbook', 'Cinco volumes', 'Edição abreviada', 'Proveniência'],
    relatedLibrarySlugs: ['iron-fontes-primarias-secundarias', 'iron-perspectiva-no-percurso'],
    moduleHref: '/fontes',
    moduleLabel: 'Consultar critérios de citação',
  }),
  entry({
    slug: 'iron-taekwondo-no-brasil',
    title: 'A difusão do Taekwondo no Brasil',
    subtitle: 'Um marco de chegada e um exemplo de organização regional',
    level: 'intermediario',
    topic: 'História e instituições',
    summary: 'Materiais de órgãos públicos registram a chegada a São Paulo por volta de 1970 e mostram como eventos regionais vieram a incluir a modalidade.',
    sections: [
      { title: 'São Paulo como marco documentado', text: 'O material didático da Secretaria de Educação de Goiânia liga a introdução da modalidade no país, por volta de 1970, à chegada de Sang Min Cho a São Paulo. Trate esse ponto como marco da difusão. Uma história de determinada escola também precisa de fontes sobre a atuação local e as pessoas envolvidas.', reference: brazil },
      { title: 'Um exemplo de difusão pelo esporte', text: 'A Fundação Catarinense de Esporte documentou a entrada do Taekwondo como modalidade oficial nos Joguinhos Abertos de Santa Catarina. Esse registro permite estudar a presença em um evento estadual, com lugar e época definidos. Compare-o com registros de outras regiões antes de traçar uma cronologia nacional.', reference: regional },
    ],
    keyTakeaways: ['Distinga a chegada ao país da organização em cada estado.', 'Associe cada marco a um lugar e a uma fonte.'],
    variants: ['História brasileira', 'Sang Min Cho', 'Taekwondo em São Paulo', 'Difusão no Brasil'],
    relatedLibrarySlugs: ['iron-historia-pos-1945', 'iron-taekwondo-olimpico', 'iron-instituicoes-kukkiwon-wt-cbtkd'],
  }),
  entry({
    slug: 'iron-preparacao-fisica-geral',
    title: 'Preparação física geral e prática de Taekwondo',
    subtitle: 'Como ler recomendações populacionais de atividade física',
    level: 'basico',
    topic: 'Cultura e prática',
    summary: 'A orientação geral de atividade física ajuda a pensar a rotina. O planejamento de treinamento depende da pessoa e do contexto da aula.',
    sections: [
      { title: 'O alcance das recomendações', text: 'A OMS publica orientações de atividade física e comportamento sedentário por grupos populacionais, considerando frequência, intensidade e duração. Essa estrutura ajuda a reconhecer que a rotina envolve atividades além da técnica de Taekwondo. Confira a faixa etária e o grupo abordado antes de usar os dados como referência.', reference: training },
      { title: 'Planejar a pergunta para o professor', text: 'A Kukkiwon publica a parte de fundamentos em volume distinto das formas e da competição. Organize suas dúvidas de preparação por objetivo, como sustentar a atenção durante a aula ou acompanhar a exigência de um exercício. Leve ao professor o contexto e a dificuldade observada para discutir a progressão da turma.', reference: textbook },
    ],
    keyTakeaways: ['Leia para qual população a orientação foi escrita.', 'Discuta a exigência da aula e sua progressão com o professor.'],
    variants: ['Atividade física', 'Condicionamento geral', 'Preparação física'],
    relatedLibrarySlugs: ['iron-finalidades-do-treino', 'iron-seguranca-impacto'],
  }),
  entry({
    slug: 'iron-bases-e-equilibrio',
    title: 'Como observar bases e equilíbrio',
    subtitle: 'Apoio, posição final e mudança de base',
    level: 'basico',
    topic: 'Fundamentos técnicos',
    summary: 'Uma base pode ser observada pela posição dos apoios. A transição entre bases exige localizar o que mudou de uma etapa para a seguinte.',
    sections: [
      { title: 'Descrever a base', text: 'A Associação de Taekwondo de Daegu apresenta as bases a partir da sustentação pelos pés e classifica diferentes posições de apoio. Para comparar duas fichas, identifique a posição relativa dos pés e o nome empregado no material. Uma observação em aula pode registrar quem estava à frente e qual quadro documenta a base.', reference: stances },
      { title: 'Observar a transição', text: 'A tabela sinóptica estudada por Lee e Park usa campos próprios para posição, olhar e base. Em um exercício de leitura, compare apenas dois momentos consecutivos e anote o que mudou em cada campo. Leve a dúvida sobre a passagem ao professor com o número da etapa e o localizador.', reference: directions },
    ],
    keyTakeaways: ['Compare posição dos pés e nome da base na mesma referência.', 'Anote em separado a mudança entre duas bases.'],
    variants: ['Base', 'Seogi', 'Apoio', 'Equilíbrio'],
    relatedLibrarySlugs: ['ap-seogi', 'apgubi', 'juchum-seogi', 'iron-perspectiva-no-percurso'],
  }),
  entry({
    slug: 'iron-equipamento-competicao-kyorugi',
    title: 'Equipamento de proteção no Kyorugi esportivo',
    subtitle: 'Como ler a lista de um evento de combate esportivo',
    level: 'intermediario',
    topic: 'Modalidades e regulamentos',
    summary: 'A lista de equipamentos depende da competição. Identifique a edição da regra, o que o evento fornece e o que o atleta deve levar.',
    sections: [
      { title: 'Encontrar a lista de referência', text: 'O artigo 4 da edição de setembro de 2024 das regras da WT reúne exigências sobre uniforme e proteção. Comece por essa seção ao consultar a lista daquela edição e compare com o boletim do torneio. O documento também prevê especificações para os equipamentos, além da lista de peças.', reference: equipment },
      { title: 'Combinar proteção e resposta a impactos', text: 'A conferência dos equipamentos faz parte da preparação. Se houver suspeita de concussão durante a prática, o protocolo descrito pelos CDC orienta afastar o atleta da atividade e encaminhar para avaliação. Informe imediatamente o responsável pelo treino ou evento.', reference: concussion },
    ],
    keyTakeaways: ['Confira o regulamento em vigor no evento.', 'Combine com o professor quem inspeciona e quem fornece cada peça.'],
    variants: ['Proteção', 'Protetores no Taekwondo', 'Equipamento de competição'],
    relatedLibrarySlugs: ['iron-seguranca-impacto', 'iron-evolucao-esportiva-marcial'],
    moduleHref: '/kyorugi#competicao',
    moduleLabel: 'Consultar o guia de Kyorugi esportivo',
  }),
  entry({
    slug: 'iron-registro-de-revisao',
    title: 'Como revisar uma sequência com o professor',
    subtitle: 'Registro de observações, referências e decisões',
    level: 'avancado',
    topic: 'Graduação e aprendizagem',
    summary: 'Uma revisão docente fica reproduzível quando indica a passagem, o campo observado e a referência usada.',
    sections: [
      { title: 'Transformar um comentário em registro', text: 'O guia da Dong-A University apresenta critérios de avaliação separados para precisão e apresentação. Ao aplicar uma correção, registre qual categoria motivou o comentário, qual etapa foi observada e o que o professor indicou. Esses campos ajudam a reencontrar a correção antes da próxima aula.', reference: dongaPractice },
      { title: 'Registrar uma divergência entre edições', text: 'O trabalho de Lee e Park mostra que orientação do diagrama e organização da tabela podem mudar conforme a proposta editorial. Preserve os dois localizadores se as fontes discordarem. Indique qual campo está em dúvida e solicite ao professor uma decisão sobre aquele ponto específico.', reference: directions },
    ],
    keyTakeaways: ['Registre o número da etapa e o campo corrigido.', 'Preserve as fontes de uma divergência até a decisão docente.'],
    variants: ['Ficha docente', 'Aprendizagem', 'Correção técnica', 'Revisão de Poomsae'],
    relatedLibrarySlugs: ['iron-leitura-de-poomsae', 'iron-precisao-e-apresentacao', 'iron-convencoes-de-contagem'],
  }),
  entry({
    slug: 'iron-gyeokpa-classificacao',
    title: 'Categorias de Gyeokpa no manual de terminologia',
    subtitle: 'Como reconhecer modalidade, variante e finalidade demonstrativa',
    level: 'intermediario',
    topic: 'Modalidades e regulamentos',
    summary: 'O apêndice da Kukkiwon apresenta Gyeokpa como demonstração de habilidades com materiais de quebra e documenta denominações como quebra criativa, de potência e em salto.',
    sections: [
      { title: 'Ler a categoria', text: 'No apêndice, a quebra criativa é identificada pela composição inédita, enquanto as modalidades em salto são subdivididas por critérios como altura ou distância. Registre primeiro qual aspecto dá nome à categoria.', reference: breakingTerminology },
      { title: 'Ler o programa de um evento', text: 'O programa do Hanmadang reúne provas e exigências próprias. Use o nome da prova, a edição e o local da competição ao comparar uma descrição de demonstração com esse regulamento.', reference: { ...hanmadang, locator: 'Informações gerais e lista de modalidades do evento' } },
    ],
    keyTakeaways: ['Compare as categorias pelo critério registrado na fonte.', 'Indique edição e modalidade ao anotar a regra de avaliação.'],
    variants: ['Gyeokpa', 'Quebra criativa', 'Quebra demonstrativa', 'Power Break'],
    relatedLibrarySlugs: ['iron-gyeokpa-demonstracao', 'iron-gyeokpa-materiais', 'ttwieo-ap-chagi', 'sonnal'],
  }),
  entry({
    slug: 'iron-gyeokpa-materiais',
    title: 'Materiais e supervisão no Gyeokpa',
    subtitle: 'Leitura da regra de evento e organização de demonstração',
    level: 'basico',
    topic: 'Modalidades e regulamentos',
    summary: 'O regulamento do Hanmadang 2024 identifica materiais aprovados e a função dos suportes. O professor responsável organiza a prática e a preparação da área de demonstração.',
    sections: [
      { title: 'Verificar a especificação', text: 'A seção 6 do regulamento lista materiais autorizados para aquela edição e trata separadamente o suporte. Localize a prova antes de ler a lista e confira com a organização do evento o equipamento que ela fornece.', reference: hanmadang },
      { title: 'Diferenciar finalidade e superfície', text: 'O manual reúne Gyeokpa em um apêndice e descreve as superfícies anatômicas em outro. Ao consultar os dois, registre a modalidade, a superfície citada e o material autorizado em campos próprios. Na prática, essas decisões ficam com o professor e a organização.', reference: breakingTerminology },
    ],
    keyTakeaways: ['Confirme materiais e suportes com a organização do evento.', 'Reserve a demonstração ao ambiente preparado e supervisionado pelo professor.'],
    variants: ['Materiais de quebramento', 'Placas de demonstração', 'Segurança em Gyeokpa'],
    relatedLibrarySlugs: ['iron-gyeokpa-classificacao', 'iron-gyeokpa-demonstracao', 'sonnal', 'dwichuk'],
  }),
  entry({
    slug: 'iron-ler-regra-de-kyorugi',
    title: 'Da convocação ao artigo de Kyorugi',
    subtitle: 'Como localizar participação, procedimento e resultado',
    level: 'basico',
    topic: 'Modalidades e regulamentos',
    summary: 'Uma consulta de regra esportiva parte da edição indicada e do tipo de dúvida. A edição de junho de 2026 tem artigos diferentes para participação, andamento e resultado.',
    sections: [
      { title: 'Identificar edição e contexto', text: 'A capa do regulamento indica o início da vigência. Na sua anotação registre a data e a organização do evento. Localize o artigo 4 quando a dúvida for sobre participação ou equipamento.', reference: { ...wtJune, locator: 'Capa e art. 4 · vigência e participantes' } },
      { title: 'Perguntar com um localizador', text: 'O artigo 10 descreve o procedimento da luta. Para discutir uma situação observada, anote em qual momento ela ocorreu e consulte o artigo correspondente com a equipe de arbitragem.', reference: { ...wtJune, locator: 'Art. 10 · Procedure of the Contest' } },
    ],
    keyTakeaways: ['Anote data da vigência e artigo consultado.', 'Confira convocação e categoria antes de interpretar uma exigência.'],
    variants: ['Regras de torneio', 'Boletim de Kyorugi'],
    moduleHref: '/kyorugi#competicao',
    moduleLabel: 'Abrir o guia de competição',
    relatedLibrarySlugs: ['kyorugi-competicao-2026', 'iron-equipamento-competicao-kyorugi'],
  }),
  entry({
    slug: 'iron-glossario-e-ficha',
    title: 'Como ler componentes de um nome técnico',
    subtitle: 'Termo simples, expressão composta e uso em verbete',
    level: 'intermediario',
    topic: 'Fontes e terminologia',
    summary: 'A terminologia da Kukkiwon registra um título de família e exemplos de uso abaixo do verbete. O nome completo ajuda a identificar qual exemplo foi citado.',
    sections: [
      { title: 'Ler direção e superfície separadamente', text: 'Na seção de defesas, An-makgi tem exemplos com superfícies diferentes. Uma ficha sobre Batangson-an-makgi deve citar o uso específico e identificar Batangson como a superfície na expressão.', reference: kukkiwonTerminologyReference('§10 Makgi > An-makgi, p. 44 do PDF') },
      { title: 'Registrar a equivalência no seu alcance', text: 'A seção Naeryeo-makgi associa Arae-makgi a um uso com o antebraço externo. Guarde essa condição junto da equivalência e confira a legenda quando a defesa baixa aparecer em uma forma.', reference: kukkiwonTerminologyReference('§10 Makgi > Naeryeo-makgi > Arae-makgi, p. 50 do PDF') },
    ],
    keyTakeaways: ['Guarde o título da família e o uso específico no localizador.', 'Use a ficha da superfície para aprofundar a leitura de uma expressão.'],
    variants: ['Glossário de técnicas', 'Expressão técnica', 'Família e variante'],
    moduleHref: '/glossario',
    moduleLabel: 'Consultar o Glossário',
    relatedLibrarySlugs: ['batangson', 'an-makgi', 'arae-makgi', 'iron-morfologia-terminologia'],
  }),
  entry({
    slug: 'iron-comparacao-de-bases',
    title: 'Apoio anterior, posterior e unipodal',
    subtitle: 'Leitura comparativa de três famílias de base',
    level: 'basico',
    topic: 'Fundamentos técnicos',
    summary: 'A classificação em Seogi distingue a distribuição dos pés e o apoio do corpo. O lado indicado na base merece sua própria anotação.',
    sections: [
      { title: 'Apoio posterior e base do tigre', text: 'Dwitgubi e Beom-seogi aparecem em verbetes diferentes. Compare como cada verbete descreve o contato anterior e a distribuição do apoio antes de associar as duas bases a quadros de uma forma.', reference: kukkiwonTerminologyReference('§15 Seogi · Beom-seogi e Dwitgubi, pp. 61–62 do PDF') },
      { title: 'Apoio único', text: 'O verbete Hakdari-seogi descreve uma base unipodal. Em uma ficha de leitura, use um campo para o apoio e outro para a ação executada. A forma Keumgang fornece contexto para esse tipo de base.', reference: kukkiwonTerminologyReference('§15 Seogi · Hakdari-seogi, p. 63 do PDF') },
    ],
    keyTakeaways: ['Registre lado do apoio e ação como campos próprios.', 'Use a definição da base para conferir o quadro.'],
    variants: ['Base do tigre', 'Base posterior', 'Base da garça', 'Apoio unipodal'],
    relatedLibrarySlugs: ['dwitgubi', 'beom-seogi', 'hakdari-seogi', 'keumgang'],
  }),
  entry({
    slug: 'iron-preparacao-nas-formas',
    title: 'Preparação, base e retorno em Poomsae',
    subtitle: 'Como comparar os campos de uma postura inicial',
    level: 'intermediario',
    topic: 'Poomsae',
    summary: 'A seção Junbi-jase reúne posturas identificadas pela disposição das mãos. Para estudar uma forma, leia ainda a base, a posição e a orientação inicial.',
    sections: [
      { title: 'Nome da preparação', text: 'O manual coloca Tongmilgi-junbi e Gyeopson-junbi na mesma seção com verbetes próprios. Anote configuração, base e nome da forma em campos distintos quando consultar uma descrição de preparação.', reference: kukkiwonTerminologyReference('§8 Junbi-jase, pp. 40–42 do PDF') },
      { title: 'Quadros fora da numeração', text: 'Use o quadro de abertura e o de retorno como referências independentes da lista numerada. Ao conferir a tabela de Daegu, registre a convenção que a fonte usa para as etapas e as ações.', reference: daegu },
    ],
    keyTakeaways: ['Compare preparação e retorno por posição e orientação.', 'Confira o nome completo em Junbi-jase.'],
    variants: ['Postura inicial', 'Junbi-jase', 'Baro'],
    relatedLibrarySlugs: ['gibon-junbi', 'tongmilgi-junbi', 'gyeopson-junbi', 'iron-convencoes-de-contagem'],
  }),
  entry({
    slug: 'iron-indice-coreano-poomsae',
    title: 'Como confirmar o nome coreano de uma forma',
    subtitle: 'Pesquisa por identidade e localização institucional',
    level: 'avancado',
    topic: 'Fontes e terminologia',
    summary: 'A Kukkiwon oferece um índice coreano de Poomsae com os nomes das formas. É possível comparar o verbete com as apresentações em outros idiomas.',
    sections: [
      { title: 'Usar o nome no idioma da fonte', text: 'Comece pela família e localize o título em coreano. Registre o número do artigo ou o nome do verbete antes de comparar a romanização de uma apresentação em outra língua.', reference: koreanIndex },
      { title: 'Conservar o título e a variante', text: 'Para uma forma Dan, preserve a grafia coreana como identidade documental e indique qual versão do portal fornece cada romanização. O título é uma referência de identidade. A discussão de execução usa o material específico de cada quadro.', reference: koreanIndex },
    ],
    keyTakeaways: ['Localize o verbete pelo título em Hangul.', 'Guarde o identificador da página junto da romanização consultada.'],
    variants: ['Nomes em Hangul', 'Board 37', 'Índice Taegeuk coreano'],
    relatedLibrarySlugs: ['taegeuk-3-jang', 'koryo', 'keumgang', 'iron-padronizacao-romanizacao'],
  }),
  entry({
    slug: 'iron-edicao-e-localizador',
    title: 'Como citar uma página de manual',
    subtitle: 'Edição, idioma e localização de um campo técnico',
    level: 'avancado',
    topic: 'Fontes e terminologia',
    summary: 'Uma referência reproduzível identifica a edição, o volume e o localizador. Se a numeração impressa divergir da página do PDF, indique qual das duas está usando.',
    sections: [
      { title: 'Identificar o exemplar', text: 'A Kukkiwon anunciou versões separadas do manual revisado em coreano e inglês. Em uma comparação, inclua idioma, título e volume junto da seção ou página. Os anúncios permitem identificar o conjunto.', reference: textbookEnglish },
      { title: 'Citar no nível do campo', text: 'Ao revisar uma denominação, cite o título ou o uso correspondente na seção do manual. Para uma publicação digital, indique a página física se for o número usado no visualizador. O localizador permite a um revisor repetir a conferência.', reference: kukkiwonTerminologyReference('Introductory remarks §5 · Standardizing the Names of Techniques') },
    ],
    keyTakeaways: ['Registre volume, idioma, edição e página.', 'Anote o localizador ao lado do campo que ele sustenta.'],
    variants: ['Como citar manual', 'Página física do PDF', 'Edição técnica'],
    relatedLibrarySlugs: ['iron-fontes-primarias-secundarias', 'iron-colecao-kukkiwon-2022', 'iron-registro-de-revisao'],
  }),
  entry({
    slug: 'iron-forma-linha-e-simbolo',
    title: 'Linha de movimento e símbolo em Poomsae',
    subtitle: 'Trigrama, orientação e representação do percurso',
    level: 'intermediario',
    topic: 'Poomsae',
    summary: 'A explicação simbólica da Kukkiwon e a tabela de movimentação são duas leituras da mesma forma. Cada leitura responde a perguntas diferentes de estudo.',
    sections: [
      { title: 'Ler a identidade simbólica', text: 'O verbete coreano do Taegeuk 3 associa a forma a Ri. Para situar a forma, registre a associação simbólica e o nome do verbete institucional em sua ficha.', reference: { ...koreanIndex, locator: 'Board 37, artigo 982 · Taegeuk 3 e simbolismo de Ri', url: 'https://www.kukkiwon.or.kr/base/board/read?boardManagementNo=37&boardNo=982&menuLevel=3&menuNo=62' } },
      { title: 'Ler a representação espacial', text: 'A proposta de Lee e Park trata perspectiva e diagrama como decisões de representação. Em leitura de percurso, identifique a posição inicial e a referência de frente antes de interpretar as linhas.', reference: directions },
    ],
    keyTakeaways: ['Registre o símbolo com sua fonte institucional.', 'Declare a perspectiva usada no percurso.'],
    variants: ['Linha de Poomsae', 'Trigrama de Poomsae', 'Percurso e simbologia'],
    relatedLibrarySlugs: ['iron-perspectiva-no-percurso', 'taegeuk-3-jang', 'keumgang'],
  }),
  entry({
    slug: 'iron-pratica-cooperativa',
    title: 'Rotina de estudo em pares no dojang',
    subtitle: 'Comunicação, controle e leitura do currículo escolar',
    level: 'basico',
    topic: 'Cultura e prática',
    summary: 'A cortesia e o autocontrole descritos pela Kukkiwon podem orientar a rotina de aprendizagem com colegas e a organização da aula.',
    sections: [
      { title: 'Acordos antes da prática', text: 'Cortesia e autocontrole fazem parte da formação moral descrita pela Kukkiwon. Em um exercício da escola, confirme com a turma os papéis e o sinal de pausa antes de começar.', reference: spirit },
      { title: 'Registrar o objetivo da aula', text: 'O guia curricular de Dong-A reúne etiqueta e conteúdo técnico em semanas distintas. Para acompanhar uma aula em pares, registre a proposta do professor, a graduação e o objetivo de aprendizagem.', reference: donga },
    ],
    keyTakeaways: ['Confirme papéis, objetivo e sinal de pausa.', 'Identifique o currículo da escola em cada registro.'],
    variants: ['Estudo em pares', 'Cortesia com o parceiro', 'Acordos de aula'],
    moduleHref: '/curriculos',
    moduleLabel: 'Organizar o currículo da escola',
    relatedLibrarySlugs: ['matchuo-registro-escola', 'iron-espirito-cortesia-dojang', 'iron-autocontrole-convivencia'],
  }),
  entry({
    slug: 'iron-emissao-e-formacao',
    title: 'Graduação, instrução e avaliação',
    subtitle: 'Como ler o papel de certificados e cursos da WTA',
    level: 'intermediario',
    topic: 'Graduação e aprendizagem',
    summary: 'O portal da Kukkiwon trata da promoção Poom e Dan. O catálogo da World Taekwondo Academy apresenta cursos de instrução e de examinador.',
    sections: [
      { title: 'Registro de graduação', text: 'A página de promoção descreve a finalidade de exames e certificação. Ao consultar uma graduação, identifique a modalidade de registro e as instruções publicadas pelo órgão responsável.', reference: certification },
      { title: 'Formação de profissionais', text: 'O catálogo WTA apresenta cursos com objetivos diferentes, entre eles formação de instrutores e formação de examinadores. Confira a descrição e os requisitos da oferta antes de atribuir a habilitação.', reference: wtaCourses },
    ],
    keyTakeaways: ['Identifique se o documento é de graduação ou de curso.', 'Cite a página do programa ao descrever uma habilitação.'],
    variants: ['Curso de examinador', 'Qualificação de instrutor', 'Certificação e curso'],
    relatedLibrarySlugs: ['iron-formacao-instrutores', 'iron-certificacao-poom-dan', 'iron-graduacoes-gup-dan'],
  }),
  entry({
    slug: 'iron-registro-historico-brasil',
    title: 'Como situar fontes sobre o Taekwondo no Brasil',
    subtitle: 'Comparação entre material didático nacional e registro regional',
    level: 'avancado',
    topic: 'História e instituições',
    summary: 'A chegada ao Brasil e o reconhecimento em um programa estadual são marcos diferentes. Registre o recorte geográfico e o tipo de documento antes de reuni-los em uma cronologia.',
    sections: [
      { title: 'Uma referência para o recorte nacional', text: 'O material didático da Secretaria Municipal de Educação de Goiânia inclui uma seção sobre a chegada ao Brasil. Use a seção como referência de divulgação e mantenha a instituição e o tipo de documento na nota.', reference: brazil },
      { title: 'A notícia institucional regional', text: 'A Fesporte registra o ingresso da modalidade nos Joguinhos Abertos de Santa Catarina. Na linha do tempo, identifique o local e o programa para preservar o alcance regional da notícia.', reference: regional },
    ],
    keyTakeaways: ['Identifique local e tipo de evidência.', 'Confirme a correspondência entre data e evento ao montar uma cronologia.'],
    variants: ['História regional', 'Joguinhos Abertos', 'Fontes brasileiras'],
    relatedLibrarySlugs: ['iron-taekwondo-no-brasil', 'iron-historiografia-tradicao-fontes'],
  }),
  entry({
    slug: 'iron-mudancas-na-competicao',
    title: 'Como comparar duas edições de regulamento',
    subtitle: 'Controle de versão para perguntas de arbitragem',
    level: 'avancado',
    topic: 'Modalidades e regulamentos',
    summary: 'Uma comparação entre edições começa por modalidade, data de vigência e artigo. Esse procedimento ajuda a registrar mudanças sem atribuir a uma edição a regra da outra.',
    sections: [
      { title: 'Fixar a edição e o artigo', text: 'A edição internacional de junho de 2026 identifica na capa a data inicial de vigência. Registre essa data e indique o artigo consultado junto da interpretação.', reference: wtJune },
      { title: 'Recolocar uma fonte antiga no contexto', text: 'A edição de setembro de 2024 serve como registro histórico. Quando uma antiga ficha citar seu artigo de equipamento, conserve o localizador e consulte a edição aplicável para responder à dúvida atual.', reference: equipment },
    ],
    keyTakeaways: ['Compare o mesmo assunto por artigo entre edições.', 'Identifique a vigência da fonte usada para responder à dúvida.'],
    variants: ['Versão de regulamento', 'Atualização de arbitragem', 'Vigência WT'],
    relatedLibrarySlugs: ['iron-ler-regra-de-kyorugi', 'kyorugi-competicao-2026', 'iron-equipamento-competicao-kyorugi'],
  }),
  entry({
    slug: 'iron-ler-uma-tabela-de-formas',
    title: 'Como registrar divergências em contagens de formas',
    subtitle: 'Etapa, ação e vista de referência em uma ficha de estudo',
    level: 'avancado',
    topic: 'Poomsae',
    summary: 'Uma etapa pode conter vários registros. Quando fontes agrupam os movimentos de modos diferentes, registre a convenção de cada uma.',
    sections: [
      { title: 'Estabelecer a unidade', text: 'A tabela de Daegu apresenta colunas de contagem diferentes. Ao comparar duas fichas, anote se a unidade em debate é uma etapa numerada, uma ação ou um quadro visual.', reference: daegu },
      { title: 'Localizar o ponto de divergência', text: 'Lee e Park tratam a organização da representação do percurso e da tabela como parte da leitura do manual. Identifique a etapa e o quadro relacionados a uma diferença de contagem antes de pedir a revisão.', reference: directions },
    ],
    keyTakeaways: ['Declare a unidade de cada contagem.', 'Localize o quadro e a etapa quando houver diferença.'],
    variants: ['Quadro repetido', 'Contagem e numeração', 'Divergência documental'],
    relatedLibrarySlugs: ['iron-convencoes-de-contagem', 'iron-registro-de-revisao', 'taegeuk-7-jang', 'taegeuk-8-jang'],
  }),
];
