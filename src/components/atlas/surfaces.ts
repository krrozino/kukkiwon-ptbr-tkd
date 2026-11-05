// Recortes editoriais de contato: em coordenadas da mesma silhueta da mão/pé.
// Bordas internas adjacentes partilham pontos; o clipPath do atlas corta qualquer
// extrapolação pela silhueta. Diagramas didáticos originais, não anatomia oficial.
export type Surface={path:string;color:string;view:'front'|'back'|'both';posture?:'fist';anchor:[number,number]};
export const handOutline='M32 125 C32 113 27 105 23 97 L9 74 C5 67 8 62 12 63 C17 64 20 72 27 77 L25 35 C25 28 32 26 34 34 L39 64 L38 17 C38 9 46 9 47 17 L50 60 L52 12 C53 5 61 7 61 15 L60 63 L66 28 C68 21 76 24 75 31 L70 83 C69 97 62 108 61 125 Z';
export const footOutline='M36 128 C25 124 25 114 30 99 C34 86 36 78 30 64 C24 52 18 43 20 31 C20 22 29 19 34 26 L34 16 C35 7 45 6 47 16 L48 24 L49 18 C51 11 59 13 60 21 L61 28 C66 19 73 23 73 33 C79 28 85 34 83 42 C89 39 92 47 88 55 L76 79 C69 92 69 104 66 116 C63 130 50 133 36 128 Z';
export const fistOutline='M26 114 L25 93 C16 85 13 74 13 61 L15 43 C16 35 27 34 30 41 C29 28 42 24 47 33 C50 22 62 23 66 33 C73 26 84 32 84 41 L85 72 C87 84 73 93 69 101 L69 114 Z';
export const surfaces:Record<string,Surface>={
 sonbadak:{path:'M29 73 Q47 64 67 73 L64 99 Q49 109 34 100 L30 84 Z',color:'#d6a541',view:'front',anchor:[48,86]},
 batangson:{path:'M34 100 Q49 109 64 99 L61 125 L32 125 Z',color:'#ad699b',view:'front',anchor:[49,107]},
 sonnal:{path:'M63 50 L75 38 L71 83 Q70 99 62 114 L55 108 Q63 93 62 78 Z',color:'#258c8b',view:'both',anchor:[69,88]},
 sonnaldeung:{path:'M25 35 L32 33 L39 64 L30 77 L25 76 Z',color:'#cf7549',view:'both',anchor:[32,64]},
 ageumson:{path:'M9 65 Q18 65 27 77 L39 64 L44 71 L30 87 L23 84 Z',color:'#598bc0',view:'front',anchor:[28,80]},
 sondeung:{path:'M29 73 Q49 63 67 73 L64 99 Q50 108 34 100 Z',color:'#859753',view:'back',anchor:[49,86]},
 jumeok:{path:'M15 42 Q21 36 30 42 Q34 30 47 34 Q53 27 65 33 Q76 30 84 42 L85 56 L14 56 Z',color:'#cf7549',view:'both',posture:'fist',anchor:[48,44]},
 deungjumeok:{path:'M14 55 L85 55 L84 73 Q58 90 25 76 Z',color:'#6c7eb2',view:'back',posture:'fist',anchor:[53,65]},
 mejumeok:{path:'M77 50 L85 50 L85 73 Q82 89 69 100 L65 91 Q77 77 77 65 Z',color:'#258c8b',view:'both',posture:'fist',anchor:[81,75]},
 balbadak:{path:'M29 55 Q53 64 78 55 L70 82 Q63 97 65 113 Q49 125 31 113 Q39 88 29 55 Z',color:'#d6a541',view:'front',anchor:[52,82]},
 apchuk:{path:'M20 35 Q45 43 83 38 L87 51 Q57 69 27 55 Z',color:'#258c8b',view:'front',anchor:[51,49]},
 baldeung:{path:'M28 46 Q51 39 80 47 L71 79 L65 103 Q47 113 34 100 Q42 77 28 46 Z',color:'#6c7eb2',view:'back',anchor:[55,71]},
 balkkeut:{path:'M21 31 Q21 21 33 26 L34 16 Q40 7 46 15 L49 23 Q53 11 59 20 L62 29 Q68 21 73 32 Q82 29 83 41 L86 47 L78 49 Q48 32 22 38 Z',color:'#cf7549',view:'both',anchor:[50,27]},
 balnal:{path:'M83 50 L89 53 L76 79 Q68 94 66 117 L60 119 Q63 93 69 76 Z',color:'#ad699b',view:'both',anchor:[74,83]},
 balnaldeung:{path:'M27 54 L33 55 Q43 76 39 88 L34 102 L29 99 Q37 79 27 62 Z',color:'#598bc0',view:'both',anchor:[35,78]},
 dwichuk:{path:'M30 108 Q49 121 65 108 L65 121 Q57 133 37 128 Q27 123 30 108 Z',color:'#b56d64',view:'front',anchor:[49,123]},
 dwikkumchi:{path:'M30 114 Q49 124 65 114 L64 124 Q51 135 36 128 Z',color:'#b56d64',view:'back',anchor:[48,126]},
};
