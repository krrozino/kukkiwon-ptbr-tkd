// SVGs originais, esquemáticos; não são ilustrações anatômicas oficiais.
export type Surface={path:string;color:string;view:'front'|'back'|'both';posture?:'fist';anchor:[number,number]};
export const handOutline='M32 125 C32 113 27 105 23 97 L9 74 C5 67 8 62 12 63 C17 64 20 72 27 77 L25 35 C25 28 32 26 34 34 L39 64 L38 17 C38 9 46 9 47 17 L50 60 L52 12 C53 5 61 7 61 15 L60 63 L66 28 C68 21 76 24 75 31 L70 83 C69 97 62 108 61 125 Z';
export const footOutline='M36 128 C25 124 25 114 30 99 C34 86 36 78 30 64 C24 52 18 43 20 31 C20 22 29 19 34 26 L34 16 C35 7 45 6 47 16 L48 24 L49 18 C51 11 59 13 60 21 L61 28 C66 19 73 23 73 33 C79 28 85 34 83 42 C89 39 92 47 88 55 L76 79 C69 92 69 104 66 116 C63 130 50 133 36 128 Z';
export const fistOutline='M26 114 L25 93 C16 85 13 74 13 61 L15 43 C16 35 27 34 30 41 C29 28 42 24 47 33 C50 22 62 23 66 33 C73 26 84 32 84 41 L85 72 C87 84 73 93 69 101 L69 114 Z';
export const surfaces:Record<string,Surface>={
 sonbadak:{path:'M30 72 Q47 64 68 73 L66 94 Q52 108 34 99 Z',color:'#d6a541',view:'front',anchor:[48,86]},
 batangson:{path:'M31 100 Q47 106 64 98 L61 114 Q45 118 33 111 Z',color:'#ad699b',view:'front',anchor:[49,107]},
 sonnal:{path:'M67 63 L73 44 L70 83 Q69 98 62 107 L60 99 Q65 85 64 74 Z',color:'#258c8b',view:'both',anchor:[69,88]},
 sonnaldeung:{path:'M26 41 L34 40 L39 65 L30 77 L26 71 Z',color:'#cf7549',view:'both',anchor:[32,64]},
 ageumson:{path:'M13 66 Q19 66 28 78 L39 66 L43 72 L30 87 L23 81 Z',color:'#598bc0',view:'front',anchor:[28,80]},
 sondeung:{path:'M30 72 Q50 64 67 73 L64 99 Q47 108 33 98 Z',color:'#859753',view:'back',anchor:[49,86]},
 jumeok:{path:'M17 43 Q25 36 31 43 L32 37 Q40 29 48 37 Q55 29 65 37 Q76 31 83 41 L82 53 L18 54 Z',color:'#cf7549',view:'both',posture:'fist',anchor:[48,44]},
 deungjumeok:{path:'M23 53 L80 52 L81 72 Q56 87 25 75 Z',color:'#6c7eb2',view:'back',posture:'fist',anchor:[53,65]},
 mejumeok:{path:'M77 51 L85 51 L85 74 Q82 87 69 98 L65 90 Q76 78 77 65 Z',color:'#258c8b',view:'both',posture:'fist',anchor:[81,75]},
 balbadak:{path:'M29 56 Q48 64 77 55 L70 80 Q60 94 64 110 Q48 122 31 112 Q40 85 29 56 Z',color:'#d6a541',view:'front',anchor:[52,82]},
 apchuk:{path:'M22 36 Q44 42 81 37 L85 50 Q60 68 28 55 Z',color:'#258c8b',view:'front',anchor:[51,49]},
 baldeung:{path:'M29 48 Q51 40 80 48 L71 77 L65 103 Q47 112 34 98 Q42 77 29 48 Z',color:'#6c7eb2',view:'back',anchor:[55,71]},
 balkkeut:{path:'M21 31 Q21 21 33 27 L35 14 Q40 7 46 15 L49 23 Q53 11 59 21 L62 29 Q68 21 73 33 Q82 29 83 41 L86 47 L77 49 Q48 33 22 38 Z',color:'#cf7549',view:'both',anchor:[50,27]},
 balnal:{path:'M83 50 L88 54 L76 79 Q68 94 66 116 L60 118 Q63 93 69 77 Z',color:'#ad699b',view:'both',anchor:[74,83]},
 balnaldeung:{path:'M27 55 L33 55 Q43 76 39 88 L34 102 L29 99 Q37 79 27 62 Z',color:'#598bc0',view:'both',anchor:[35,78]},
 dwichuk:{path:'M30 108 Q48 118 65 108 L64 121 Q57 132 37 127 Q27 123 30 108 Z',color:'#b56d64',view:'front',anchor:[49,123]},
 dwikkumchi:{path:'M31 116 Q47 123 65 115 L63 124 Q51 135 36 127 Z',color:'#b56d64',view:'back',anchor:[48,126]},
};
