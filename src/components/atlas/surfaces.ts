// Geometria ilustrativa local, independente do conteúdo editorial. As duas
// vistas usam estas coordenadas; o grupo inteiro é espelhado no dorso.
export type Surface = {
  path: string;
  color: string;
  view: 'front' | 'back' | 'both';
  posture?: 'fist';
  anchor: [number, number];
};
export const handOutline = 'M32 125 C32 113 27 105 23 97 L9 74 C5 67 8 62 12 63 C17 64 20 72 27 77 L25 35 C25 28 32 26 34 34 L39 64 L38 17 C38 9 46 9 47 17 L50 60 L52 12 C53 5 61 7 61 15 L60 63 L66 28 C68 21 76 24 75 31 L70 83 C69 97 62 108 61 125 Z';
// Cinco dedos: hálux à esquerda na planta, à direita na vista dorsal.
export const footOutline = 'M38 129 C25 126 25 115 30 100 C35 86 35 76 29 63 C23 52 19 40 21 29 L22 20 C23 8 37 7 41 17 L44 29 L45 24 C46 15 57 16 59 25 L60 32 C64 23 73 27 74 36 C80 29 87 35 85 44 C91 41 95 49 90 57 L77 80 C70 93 70 106 67 118 C64 132 51 135 38 129 Z';
export const fistOutline = 'M26 114 L25 93 C16 85 13 74 13 61 L15 43 C16 35 27 34 30 41 C29 28 42 24 47 33 C50 22 62 23 66 33 C73 26 84 32 84 41 L85 72 C87 84 73 93 69 101 L69 114 Z';
// Fronteiras compartilhadas evitam lacunas e sobreposição de transparências.
// Os paths de partição terminam na silhueta pelo clipPath do DetailMap.
const palm = 'M40 70 H63 V98 Q49 106 34 98 V86 H40 Z';
const handBase = 'M34 98 Q49 106 63 98 V140 H32 V100 Z';
const handWeb = 'M24 70 H25 V76 L30 77 L34.846153846 70 H40 V86 H24 Z';
const heel = 'M0 110 L32 112 L48 115 L65 112 L100 110 V140 H0 Z';
export const surfaces: Record<string, Surface> = {
  sonbadak: {path:palm,color:'#d6a541',view:'front',anchor:[49,87]},
  batangson: {path:handBase,color:'#ad699b',view:'front',anchor:[48,112]},
  sonnal: {path:'M63 70 L71.25 70 L70 83 C69 97 62 108 61 125 H63 Z',color:'#258c8b',view:'both',anchor:[67,88]},
  sonnaldeung: {path:'M25 35 L32 33 L39 64 L30 77 L25 76 Z',color:'#cf7549',view:'both',anchor:[28,50]},
  ageumson: {path:handWeb,color:'#598bc0',view:'front',anchor:[31,79]},
  sondeung: {path:palm,color:'#859753',view:'back',anchor:[49,87]},
  'illustration-hand-base': {path:handBase,color:'#ad699b',view:'back',anchor:[48,112]},
  'illustration-hand-web': {path:handWeb,color:'#598bc0',view:'back',anchor:[31,79]},
  'illustration-hand-side': {path:'M0 86 H34 V98 L32 100 V140 H0 Z',color:'#c99573',view:'both',anchor:[28,96]},
  'illustration-thumb': {path:'M0 0 H24 V86 H0 Z',color:'#c88264',view:'both',anchor:[16,74]},
  'illustration-finger-index': {path:'M24 0 H37 V55.142857143 L32 33 L25 35 H24 Z',color:'#ccaa68',view:'both',anchor:[30,32]},
  'illustration-finger-middle': {path:'M37 0 H50 V70 H34.846153846 L39 64 L37 55.142857143 Z',color:'#70a398',view:'both',anchor:[44,46]},
  'illustration-finger-ring': {path:'M50 0 H64 V70 H50 Z',color:'#8c91be',view:'both',anchor:[56,45]},
  'illustration-finger-little': {path:'M64 0 H100 V70 H64 Z',color:'#b784a2',view:'both',anchor:[69,53]},
  jumeok: {path:'M0 0 H100 V56 H0 Z',color:'#cf7549',view:'both',posture:'fist',anchor:[48,44]},
  deungjumeok: {path:'M0 56 H77 V95 H0 Z',color:'#6c7eb2',view:'back',posture:'fist',anchor:[49,70]},
  mejumeok: {path:'M77 56 H100 V140 H65 V95 H77 Z',color:'#258c8b',view:'both',posture:'fist',anchor:[81,75]},
  'illustration-fist-palm': {path:'M0 56 H77 V95 H0 Z',color:'#d6a541',view:'front',posture:'fist',anchor:[49,76]},
  'illustration-fist-base': {path:'M0 95 H65 V140 H0 Z',color:'#ad699b',view:'both',posture:'fist',anchor:[47,105]},
  balbadak: {path:'M48 69 L70 67 Q67 88 65 112 L48 115 Q50 90 48 69 Z',color:'#d6a541',view:'front',anchor:[58,89]},
  apchuk: {path:'M0 42 Q50 34 100 48 L100 62 L70 67 L48 69 L35 66 L0 60 Z',color:'#258c8b',view:'front',anchor:[51,54]},
  baldeung: {path:'M0 42 Q50 34 100 48 L100 62 L70 67 Q67 88 65 112 L48 115 L32 112 Q43 86 35 66 L0 60 Z',color:'#6c7eb2',view:'back',anchor:[54,81]},
  balkkeut: {path:'M0 0 H100 V48 Q50 34 0 42 Z',color:'#cf7549',view:'both',anchor:[45,29]},
  balnal: {path:'M70 67 L100 62 V110 L65 112 Q67 88 70 67 Z',color:'#ad699b',view:'both',anchor:[74,83]},
  balnaldeung: {path:'M0 60 L35 66 Q43 86 32 112 L0 110 Z',color:'#598bc0',view:'both',anchor:[34,86]},
  'illustration-foot-arch': {path:'M35 66 L48 69 Q50 90 48 115 L32 112 Q43 86 35 66 Z',color:'#859753',view:'front',anchor:[43,92]},
  dwichuk: {path:heel,color:'#b56d64',view:'front',anchor:[49,122]},
  dwikkumchi: {path:heel,color:'#b56d64',view:'back',anchor:[49,122]},
};
// Novas divisões têm IDs ilustrativos, sem inventar terminologia técnica.
export const handSurfaceSlugs = [
  'sonbadak', 'batangson', 'sonnal', 'sonnaldeung', 'ageumson', 'sondeung',
  'illustration-hand-base', 'illustration-hand-web', 'illustration-hand-side', 'illustration-thumb',
  'illustration-finger-index', 'illustration-finger-middle',
  'illustration-finger-ring', 'illustration-finger-little',
  'jumeok', 'deungjumeok', 'mejumeok', 'illustration-fist-palm', 'illustration-fist-base',
] as const;
export const footSurfaceSlugs = [
  'balbadak', 'apchuk', 'baldeung', 'balkkeut', 'balnal', 'balnaldeung',
  'illustration-foot-arch', 'dwichuk', 'dwikkumchi',
] as const;
