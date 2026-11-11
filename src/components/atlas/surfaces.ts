// Geometria ilustrativa local, independente do conteúdo editorial. As duas
// vistas usam estas coordenadas; o grupo inteiro é espelhado no dorso.
export type Surface = {
  path: string;
  color: string;
  view: 'front' | 'back' | 'both';
  posture?: 'fist';
  anchor: [number, number];
};
// Mão aberta com proporções anatômicas: dedo médio mais longo, anelar e indicador
// equilibrados, mínimo proporcionalmente menor na altura da falange distal do anelar,
// polegar abduzido com espaço interdigital (ageumson) bem definido.
export const handOutline = 'M 32 125 C 31 119 29 113 26.5 106 C 24 99 21.5 92 20 86 C 14.5 78 9 70 8 63 C 7 57 11 54 15 57 C 19 60 22 66 25 72 C 25 63 25.2 52 25.5 42 C 25.8 29 28 16 32 16 C 36 16 37.8 28 38 58 C 38.4 25 40.2 9 44.2 9 C 48.2 9 49.6 25 50 57 C 50.4 27 52 13.5 55.8 13.5 C 59.5 13.5 60.8 28 61 62 C 61.5 43 63.8 30 67.2 30 C 70.6 30 72.2 43 71.5 67 C 71 84 67.5 106 62 125 Z';
// Cinco dedos: hálux à esquerda na planta, à direita na vista dorsal.
export const footOutline = 'M38 129 C25 126 25 115 30 100 C35 86 35 76 29 63 C23 52 19 40 21 29 L22 20 C23 8 37 7 41 17 L44 29 L45 24 C46 15 57 16 59 25 L60 32 C64 23 73 27 74 36 C80 29 87 35 85 44 C91 41 95 49 90 57 L77 80 C70 93 70 106 67 118 C64 132 51 135 38 129 Z';
// Punho fechado com relevo das cabeças metacarpais (indicador e médio proeminentes
// e declive natural ao anelar e mínimo) e almofada ulnar (mejumeok) definida.
export const fistOutline = 'M 28 114 C 27.5 108 27 102 26 96 C 20 85 16 73 15 62 C 14.5 58 14.6 55.5 15 53 C 15.5 47.5 16.8 42.5 18.5 39 C 20.5 33 24 31 27.5 31.5 C 29.8 32 31 33 32 34 C 34.5 28 38 26 42 26 C 46 26 48.5 28.5 50 31 C 52.5 29.5 55.5 29 58.5 29.8 C 61.5 30.6 63.5 32.8 65 35 C 67.5 34 71 34.2 74 36 C 77 37.8 78.8 41 79.5 45 C 80.5 47.5 81.2 50 81.5 53 C 83 65 80 82 73 96 C 71.5 102 70.5 108 70 114 Z';
// Partição planar exata: fronteiras internas compartilhadas e contornos externos
// idênticos às silhuetas eliminam sobreposições, lacunas e áreas clicáveis invisíveis.
const palm = 'M 31 62 L 38 58 L 50 57 L 61 62 L 63.5 65 L 62.5 98 Q 48.5 104 34.5 98 L 35 86 L 36 66 Z';
const handBase = 'M 34.5 98 Q 48.5 104 62.5 98 C 62 105 61 112 59.5 125 L 34 125 L 34.5 98 Z';
const handWeb = 'M 20 86 L 25 72 L 29 72 L 31 62 L 36 66 L 35 86 Z';
const fistBody = 'M 15 53 Q 42 56 70 54 C 69.5 68 67 82 64 96 Q 45 99 26 96 C 20 85 16 73 15 62 C 14.5 58 14.6 55.5 15 53 Z';
const heel = 'M0 110 L32 112 L48 115 L65 112 L100 110 V140 H0 Z';
export const surfaces: Record<string, Surface> = {
  sonbadak: {path:palm,color:'#d6a541',view:'front',anchor:[49,82]},
  batangson: {path:handBase,color:'#ad699b',view:'front',anchor:[48,112]},
  sonnal: {path:'M 63.5 65 L 71.5 67 C 71 84 67.5 106 62 125 L 59.5 125 C 61 112 62 105 62.5 98 Z',color:'#258c8b',view:'both',anchor:[66.5,88]},
  sonnaldeung: {path:'M 25 72 C 25 63 25.2 52 25.5 42 L 30.5 42 L 31 62 L 29 72 Z',color:'#cf7549',view:'both',anchor:[28,55]},
  ageumson: {path:handWeb,color:'#598bc0',view:'front',anchor:[28,77]},
  sondeung: {path:palm,color:'#859753',view:'back',anchor:[49,82]},
  'illustration-hand-base': {path:handBase,color:'#ad699b',view:'back',anchor:[48,112]},
  'illustration-hand-web': {path:handWeb,color:'#598bc0',view:'back',anchor:[28,77]},
  'illustration-hand-side': {path:'M 20 86 L 35 86 L 34.5 98 L 34 125 L 32 125 C 31 119 29 113 26.5 106 C 24 99 21.5 92 20 86 Z',color:'#c99573',view:'both',anchor:[29,98]},
  'illustration-thumb': {path:'M 20 86 C 14.5 78 9 70 8 63 C 7 57 11 54 15 57 C 19 60 22 66 25 72 Z',color:'#c88264',view:'both',anchor:[16,69]},
  'illustration-finger-index': {path:'M 25.5 42 C 25.8 29 28 16 32 16 C 36 16 37.8 28 38 58 L 31 62 L 30.5 42 Z',color:'#ccaa68',view:'both',anchor:[32,34]},
  'illustration-finger-middle': {path:'M 38 58 C 38.4 25 40.2 9 44.2 9 C 48.2 9 49.6 25 50 57 Z',color:'#70a398',view:'both',anchor:[44,32]},
  'illustration-finger-ring': {path:'M 50 57 C 50.4 27 52 13.5 55.8 13.5 C 59.5 13.5 60.8 28 61 62 Z',color:'#8c91be',view:'both',anchor:[55.5,36]},
  'illustration-finger-little': {path:'M 61 62 C 61.5 43 63.8 30 67.2 30 C 70.6 30 72.2 43 71.5 67 L 63.5 65 Z',color:'#b784a2',view:'both',anchor:[66.5,48]},
  jumeok: {path:'M 15 53 C 15.5 47.5 16.8 42.5 18.5 39 C 20.5 33 24 31 27.5 31.5 C 29.8 32 31 33 32 34 C 34.5 28 38 26 42 26 C 46 26 48.5 28.5 50 31 C 52.5 29.5 55.5 29 58.5 29.8 C 61.5 30.6 63.5 32.8 65 35 C 67.5 34 71 34.2 74 36 C 77 37.8 78.8 41 79.5 45 C 80.5 47.5 81.2 50 81.5 53 L 70 54 Q 42 56 15 53 Z',color:'#cf7549',view:'both',posture:'fist',anchor:[46,42]},
  deungjumeok: {path:fistBody,color:'#6c7eb2',view:'back',posture:'fist',anchor:[44,75]},
  mejumeok: {path:'M 70 54 L 81.5 53 C 83 65 80 82 73 96 L 64 96 C 67 82 69.5 68 70 54 Z',color:'#258c8b',view:'both',posture:'fist',anchor:[74.5,74]},
  'illustration-fist-palm': {path:fistBody,color:'#d6a541',view:'front',posture:'fist',anchor:[44,75]},
  'illustration-fist-base': {path:'M 26 96 Q 45 99 64 96 L 73 96 C 71.5 102 70.5 108 70 114 L 28 114 C 27.5 108 27 102 26 96 Z',color:'#ad699b',view:'both',posture:'fist',anchor:[48,106]},
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
