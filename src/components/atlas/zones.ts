import {surfaces,handSurfaceSlugs,footSurfaceSlugs} from './surfaces';
import type {Area,View} from './BodyMap';

export type AtlasZone = {
  id:string; area:Area; view:View|'both'; path:string; color:string;
  anchor:[number,number]; regionSlug?:string; posture?:'fist';
};
export const areaViewBoxes:Record<Area,string>={
  head:'90 10 80 102',torso:'65 95 130 150',arms:'25 112 210 165',
  legs:'70 240 120 162',hands:'10 255 240 90',feet:'55 385 150 85',
};
const palette=['#d6a541','#258c8b','#cf7549','#ad699b','#598bc0','#859753'];
const body=(area:Area,id:string,view:AtlasZone['view'],path:string,anchor:[number,number],color:number,regionSlug?:string):AtlasZone=>
  ({id,area,view,path,anchor,color:palette[color],...(regionSlug?{regionSlug}:{})});

// Os recortes do braço usam pares absolutos x/y na malha de 260 unidades.
// Espelhar a geometria em torno de x=130 mantém a borda medial junto ao tronco.
const bilateralArmPath = (left: string) =>
  `${left} ${left.replace(/(\d+) (\d+)/g, (_, x, y) => `${260 - Number(x)} ${y}`)}`;
const elbowTop = 'M49 169 C64 177 79 178 94 172';
const forearmTop = 'M45 195 C57 202 73 202 84 197';
const medialContactEdge = 'Q66 225 63 232 C61 239 59 245 58 249';

export const bodyZones:AtlasZone[]=[
  // A figura possui 260x480 unidades. Partição planar sem sobreposição que acompanha
  // o contorno orgânico do rosto, dobok, articulações e calça; o clipPath limita as
  // marcas às partes do corpo. Não são áreas técnicas certificadas.
  body('head','head-face','front','M114 51 Q130 47 146 51 L146 75 Q130 79 114 75 Z',[130,63],0),
  body('head','head-forehead','front','M111 36 Q130 28 149 36 L148 49 Q130 45 112 49 Z',[130,42],1),
  body('head','head-temples','front','M106 50 Q109 49 113 51 L113 73 Q108 70 106 61 Z M147 51 Q151 49 155 50 Q154 61 153 70 L147 73 Z',[110,61],2),
  body('head','head-chin','front','M114 77 Q130 81 146 77 Q144 88 131 92 Q117 88 114 77 Z',[130,84],3),
  body('head','head-occiput','back','M106 46 Q108 21 130 18 Q152 21 154 46 L152 72 Q146 86 131 91 Q115 86 108 72 Z',[130,54],4),
  body('head','head-neck','both','M116 93 Q130 96 144 93 L145 103 Q130 112 115 103 Z',[130,100],5),

  body('torso','torso-shoulders','both','M95 111 Q105 107 115 104 L126 131 L102 137 L92 131 Z M145 104 Q155 107 165 111 L168 131 L158 137 L134 131 Z',[106,122],0),
  body('torso','torso-chest','front','M103 139 Q130 132 157 139 L157 175 Q130 181 103 175 Z',[130,156],1),
  body('torso','torso-abdomen','front','M103 179 Q130 185 157 179 L157 232 Q130 239 103 232 Z',[130,205],2),
  body('torso','torso-flanks','both','M93 139 L102 139 L102 226 L95 229 Q92 190 93 139 Z M158 139 L167 139 Q168 190 165 229 L158 226 Z',[98,182],3),
  body('torso','torso-back','back','M103 139 Q130 133 157 139 L157 183 Q130 189 103 183 Z',[130,160],4),
  body('torso','torso-lumbar','back','M103 187 Q130 193 157 187 L157 232 Q130 239 103 232 Z',[130,208],5),

  body('arms','arms-upper','both',
    bilateralArmPath(`${elbowTop} C96 154 97 132 94 113 Q82 116 75 126 L58 147 Z`),[76,150],0),
  body('arms','arms-elbow','both',
    bilateralArmPath(`${elbowTop} L84 197 C73 202 57 202 45 195 Z`),[68,185],1,'palgup'),
  body('arms','arms-forearm','both',
    bilateralArmPath(`${forearmTop} L74 225 ${medialContactEdge} Q54 251 49 249 C50 244 51 237 49 232 Q46 225 37 228 Z`),[57,219],2),
  body('arms','arms-wrist','both',
    bilateralArmPath('M35 245 Q42 250 49 249 Q54 251 58 249 Q62 249 67 247 L60 266 Q51 270 37 262 Z'),[50,260],3),
  body('arms','arms-inner-forearm','both',
    bilateralArmPath(`M74 225 ${medialContactEdge} Q62 249 67 247 Z`),[63,237],4,'anpalmok'),
  body('arms','arms-outer-forearm','both',
    bilateralArmPath('M37 228 Q46 225 49 232 C51 237 50 244 49 249 Q42 250 35 245 Z'),[45,237],5,'bakkatpalmok'),

  body('legs','legs-thigh','both','M91 243 Q109 249 127 253 L121 315 Q102 320 83 314 Q81 274 91 243 Z M169 243 Q151 249 133 253 L139 315 Q158 320 177 314 Q179 274 169 243 Z',[102,282],0),
  body('legs','legs-knee','front','M83 317 Q102 322 120 318 L118 344 Q100 349 83 344 Z M177 317 Q158 322 140 318 L142 344 Q160 349 177 344 Z',[100,331],1,'mureup'),
  body('legs','legs-shin','front','M83 346 Q100 351 118 346 L115 395 L83 394 Z M177 346 Q160 351 142 346 L145 395 L176 394 Z',[99,371],2),
  body('legs','legs-calf','back','M83 317 Q102 323 120 318 L115 395 L83 394 Z M177 317 Q158 323 140 318 L145 395 L176 394 Z',[100,354],4),
];
const detailZones=(area:'hands'|'feet',ids:readonly string[]):AtlasZone[]=>ids.map(id=>({
  ...surfaces[id],id,area,...(!id.startsWith('illustration-')?{regionSlug:id}:{}),
}));
export const atlasZones:AtlasZone[]=[...bodyZones,...detailZones('hands',handSurfaceSlugs),...detailZones('feet',footSurfaceSlugs)];
export const zonesFor=(area:Area,view:View,fist=false)=>atlasZones.filter(z=>
  z.area===area&&(z.view===view||z.view==='both')&&(area!=='hands'||Boolean(z.posture)===fist));
