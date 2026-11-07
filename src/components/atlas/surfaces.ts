// Geometria ilustrativa local, independente do conteúdo editorial. As duas
// vistas usam estas coordenadas; o grupo inteiro é espelhado no dorso.
export type Surface = {
  path: string;
  color: string;
  view: 'front' | 'back' | 'both';
  posture?: 'fist';
  anchor: [number, number];
};
// Mão aberta com anatomia proporcional: dedo médio mais alto, anelar e indicador
// harmonizados e mindinho proporcionalmente menor, sem sobreposições.
export const handOutline = 'M 32 125 C 32 113 26 105 22 95 C 17 84 11 76 8 68 C 5 61 8 57 13 58 C 18 59 22 66 26 73 L 26 34 C 26 23 31 16 33.5 16 C 36 16 38 23 38 34 L 38 58 L 38.5 24 C 39 15 42 9 44.5 9 C 47 9 49.5 15 49.5 24 L 50 57 L 50.5 28 C 51 19 54 14 56 14 C 58.5 14 60.5 20 60.5 30 L 61 62 L 62 44 C 63 36 65 31 67.5 31 C 70 31 72 36 71.5 45 L 70.5 80 C 70 95 66 109 62 125 Z';
// Cinco dedos: hálux à esquerda na planta, à direita na vista dorsal.
export const footOutline = 'M38 129 C25 126 25 115 30 100 C35 86 35 76 29 63 C23 52 19 40 21 29 L22 20 C23 8 37 7 41 17 L44 29 L45 24 C46 15 57 16 59 25 L60 32 C64 23 73 27 74 36 C80 29 87 35 85 44 C91 41 95 49 90 57 L77 80 C70 93 70 106 67 118 C64 132 51 135 38 129 Z';
// Punho cerrado com articulações de golpe proeminentes (indicador e médio) e declive natural ao mínimo.
export const fistOutline = 'M 28 114 C 27 96 20 85 16 72 C 13 62 14 48 18 40 C 21 33 27 31 31 38 C 34 26 42 21 46 21 C 52 21 59 24 61 31 C 65 26 72 28 75 34 C 79 38 82 48 83 60 C 84 75 80 88 74 99 L 70 114 Z';
// Fronteiras compartilhadas evitam lacunas e sobreposição de transparências.
// Os paths de partição terminam na silhueta pelo clipPath do DetailMap.
const palm = 'M 36 68 H 63 V 98 Q 49 106 34 98 V 86 H 36 Z';
const handBase = 'M 32 98 Q 49 106 63 98 V 125 H 32 Z';
const handWeb = 'M 24 68 H 36 V 86 H 24 Z';
const heel = 'M0 110 L32 112 L48 115 L65 112 L100 110 V140 H0 Z';
export const surfaces: Record<string, Surface> = {
  sonbadak: {path:palm,color:'#d6a541',view:'front',anchor:[49,84]},
  batangson: {path:handBase,color:'#ad699b',view:'front',anchor:[48,112]},
  sonnal: {path:'M 63 68 L 72 68 L 70.5 80 C 70 95 66 109 62 125 H 63 Z',color:'#258c8b',view:'both',anchor:[67,88]},
  sonnaldeung: {path:'M 24 35 L 30 33 L 34 55 L 28 73 L 24 73 Z',color:'#cf7549',view:'both',anchor:[28,50]},
  ageumson: {path:handWeb,color:'#598bc0',view:'front',anchor:[30,77]},
  sondeung: {path:palm,color:'#859753',view:'back',anchor:[49,84]},
  'illustration-hand-base': {path:handBase,color:'#ad699b',view:'back',anchor:[48,112]},
  'illustration-hand-web': {path:handWeb,color:'#598bc0',view:'back',anchor:[30,77]},
  'illustration-hand-side': {path:'M 18 86 H 34 V 98 L 32 100 V 125 H 26 Z',color:'#c99573',view:'both',anchor:[28,96]},
  'illustration-thumb': {path:'M 4 56 H 26 V 86 H 4 Z',color:'#c88264',view:'both',anchor:[16,68]},
  'illustration-finger-index': {path:'M 24 0 H 38 V 68 H 28 L 34 55 L 30 33 L 24 35 Z',color:'#ccaa68',view:'both',anchor:[32,36]},
  'illustration-finger-middle': {path:'M 38 0 H 50 V 68 H 38 Z',color:'#70a398',view:'both',anchor:[44,34]},
  'illustration-finger-ring': {path:'M 50 0 H 61 V 68 H 50 Z',color:'#8c91be',view:'both',anchor:[56,36]},
  'illustration-finger-little': {path:'M 61 0 H 75 V 68 H 61 Z',color:'#b784a2',view:'both',anchor:[67,48]},
  jumeok: {path:'M 15 20 H 83 V 50 H 15 Z',color:'#cf7549',view:'both',posture:'fist',anchor:[46,30]},
  deungjumeok: {path:'M 15 50 H 74 V 95 H 15 Z',color:'#6c7eb2',view:'back',posture:'fist',anchor:[46,72]},
  mejumeok: {path:'M 74 45 L 83 60 C 84 75 80 88 74 99 L 70 114 H 65 V 95 H 74 Z',color:'#258c8b',view:'both',posture:'fist',anchor:[78,74]},
  'illustration-fist-palm': {path:'M 15 50 H 74 V 95 H 15 Z',color:'#d6a541',view:'front',posture:'fist',anchor:[46,72]},
  'illustration-fist-base': {path:'M 25 95 H 70 V 114 H 25 Z',color:'#ad699b',view:'both',posture:'fist',anchor:[46,105]},
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
