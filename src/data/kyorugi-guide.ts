/**
 * Índice didático de famílias citadas no portal institucional da Kukkiwon.
 * Esses cards NÃO são fichas técnicas aprovadas e a ligação com o atlas
 * indica apenas a área do corpo para navegação, não o alvo oficial.
 */
export const kukkiwonSparringIndex = "https://www.kukkiwon.or.kr/eng/board/list?boardManagementNo=56&menuLevel=3&menuNo=73";
export const sparringSource = (boardNo: number) =>
  "https://www.kukkiwon.or.kr/eng/board/read?boardManagementNo=56&boardNo=" +
  boardNo + "&menuLevel=3&menuNo=73";

export const martialFamilies = [
  {name:"Makgi",label:"Defesas e bloqueios",summary:"Uso de antebraços e superfícies da mão para interceptar ou desviar ataques.",atlas:"arms",atlasLabel:"Braços e antebraços",boardNo:1365},
  {name:"Jireugi",label:"Socos",summary:"Família de movimentos de ataque executados com o punho.",atlas:"hands",atlasLabel:"Mãos e punhos",boardNo:1366},
  {name:"Chigi",label:"Golpes de impacto",summary:"Movimentos executados com superfícies como mão, cotovelo e joelho.",atlas:"arms",atlasLabel:"Braços e cotovelos",boardNo:1367},
  {name:"Chagi",label:"Chutes",summary:"Técnicas de perna que utilizam diferentes superfícies de contato do pé.",atlas:"feet",atlasLabel:"Pés e superfícies",boardNo:1368},
  {name:"Ppaegi",label:"Saída de pegadas",summary:"Ações de libertação após uma parte do corpo ser agarrada.",atlas:"arms",atlasLabel:"Braços e punhos",boardNo:1369},
  {name:"Kkeokgi",label:"Controles articulares",summary:"Família de controles que exploram movimentos e alavancas articulares.",atlas:"arms",atlasLabel:"Braços e articulações",boardNo:1370},
  {name:"Pihagi",label:"Esquivas",summary:"Ações para evitar o contato de um ataque por deslocamento corporal.",atlas:"torso",atlasLabel:"Tronco e deslocamento",boardNo:1371},
  {name:"Neomgigi",label:"Desequilíbrios e quedas",summary:"Técnicas de desequilíbrio e projeção com uso do corpo e dos membros.",atlas:"legs",atlasLabel:"Pernas e equilíbrio",boardNo:1372},
  {name:"Nakbeop",label:"Amortecimento de quedas",summary:"Movimentos de proteção do corpo durante quedas.",atlas:"torso",atlasLabel:"Tronco e proteção",boardNo:1373},
] as const;

export const competitionReferences = [
  {
    id:"wt",
    name:"World Taekwondo",
    label:"Regras internacionais de competição",
    description:"As regras esportivas de Kyorugi tratam de pontuação, condutas, arbitragem e condições de competição. Consultar sempre a edição aplicável ao evento.",
    source:"https://www.worldtaekwondo.org/att_file/documents/WT%20Competition%20Rules%20and%20Interpretation%20%28September%2030%2C%202024%29.pdf",
    notice:"Documento histórico de 2024; conferir atualizações de 2026 antes de utilizar em campeonatos."
  },
  {
    id:"cbtkd",
    name:"CBTKD — Brasil",
    label:"Regulamento técnico nacional",
    description:"Os regulamentos nacionais complementam as regras internacionais e podem acrescentar exigências próprias dos eventos brasileiros.",
    source:"https://fpetkd.org/regulamentos-e-normas/",
    notice:"A federação estadual disponibiliza o regulamento CBTKD 2026 e atualizações de Kyorugi; a página é um índice, não uma regra isolada."
  }
] as const;
