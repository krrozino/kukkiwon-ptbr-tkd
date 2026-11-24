import {surfaces,handSurfaceSlugs,footSurfaceSlugs} from './surfaces';
import type {Area,View} from './BodyMap';

export type AtlasZone = {
  id:string; area:Area; view:View|'both'; path:string; color:string;
  anchor:[number,number]; regionSlug?:string; posture?:'fist';
  backPath?:string; backAnchor?:[number,number];
};
export const areaViewBoxes:Record<Area,string>={
  head:'90 10 80 102',torso:'65 95 130 150',arms:'25 112 210 165',
  legs:'70 240 120 162',hands:'10 255 240 90',feet:'55 385 150 85',
};
const palette=['#d6a541','#258c8b','#cf7549','#ad699b','#598bc0','#859753'];
const body=(area:Area,id:string,view:AtlasZone['view'],path:string,anchor:[number,number],color:number,regionSlug?:string,
  back?:{backPath?:string;backAnchor?:[number,number]}):AtlasZone=>
  ({id,area,view,path,anchor,color:palette[color],...(regionSlug?{regionSlug}:{}),...back});

// Os recortes do braço usam pares inteiros absolutos x/y na malha de 260 unidades.
// Espelhar a geometria em torno de x=130 mantém a borda medial junto ao tronco.
function bilateralArmPath(left: string) {
  const right = left.replace(/(\d{1,3}) (\d{1,3})/g, (_, x, y) => `${260 - Number(x)} ${y}`);
  return `${left} ${right}`;
}
const elbowTop = 'M49 169 C64 177 79 178 94 172';
const forearmTop = 'M45 195 C57 202 73 202 84 197';
const medialContactEdge = 'Q66 225 63 232 C61 239 59 245 58 249';
// O inventário Argon lê os slugs nas chamadas body(), sem avaliar TypeScript.
const armPaths = {
  upper: bilateralArmPath(`${elbowTop} C96 154 97 132 94 113 Q82 116 75 126 L58 147 Z`),
  elbow: bilateralArmPath(`${elbowTop} L84 197 C73 202 57 202 45 195 Z`),
  forearm: bilateralArmPath(`${forearmTop} L74 225 ${medialContactEdge} Q54 251 49 249 C50 244 51 237 49 232 Q46 225 37 228 Z`),
  wrist: bilateralArmPath('M35 245 Q42 250 49 249 Q54 251 58 249 Q62 249 67 247 L60 266 Q51 270 37 262 Z'),
  innerForearm: bilateralArmPath(`M74 225 ${medialContactEdge} Q62 249 67 247 Z`),
  outerForearm: bilateralArmPath('M37 228 Q46 225 49 232 C51 237 50 244 49 249 Q42 250 35 245 Z'),
};

export const bodyZones:AtlasZone[]=[
  // A figura possui 260x480 unidades. Partição planar sem sobreposição que acompanha
  // o contorno orgânico do rosto, dobok, articulações e calça; o clipPath limita as
  // marcas às partes do corpo. Não são áreas técnicas certificadas.
  body('head','head-face','front','M113.5 49.5 Q130 46.5 146.5 49.5 L146.5 58.5 Q151.5 60.5 151.5 67.5 Q150.5 73.5 146.5 76.5 Q130 85 113.5 76.5 Q109.5 73.5 108.5 67.5 Q108.5 60.5 113.5 58.5 Z',[130,64],0),
  body('head','head-forehead','front','M111 41 Q113.5 34.5 117.5 31 Q132.5 37 147.5 32.5 Q149 36.5 149.5 41 L146.5 48 Q130 45 113.5 48 Z',[130,41],1),
  body('head','head-temples','front','M106.5 47 Q108 43.5 110.2 45 L112 50 Q112.5 54 111.8 58 Q108.5 58 106.5 55 Z M153.5 47 Q152 43.5 149.8 45 L148 50 Q147.5 54 148.2 58 Q151.5 58 153.5 55 Z',[109.5,51.5],2),
  body('head','head-chin','front','M110.5 77.5 Q130 87 149.5 77.5 Q145 89 131 92.5 Q117 89 110.5 77.5 Z',[130,87],3),
  body('head','head-occiput','back','M106 47 Q106 21 130 18 Q154 21 154 47 L150 67 Q148 76 130 78 Q112 76 110 67 Z',[130,50],4),
  body('head','head-neck','both','M116 87 Q130 100 144 87 Q144 96 146 104 Q130 114 114 104 Q116 96 116 87 Z',[130,100],5,undefined,{
    backPath:'M115.5 77 Q130 81 144.5 77 Q143.5 91 146 104 Q130 114 114 104 Q116.5 91 115.5 77 Z',
    backAnchor:[130,94],
  }),

  body('torso','torso-shoulders','both','M95 111 Q105 107 115 104 L126 131 L102 137 L92 131 Z M145 104 Q155 107 165 111 L168 131 L158 137 L134 131 Z',[106,122],0),
  body('torso','torso-chest','front','M103 139 Q130 132 157 139 L157 175 Q130 181 103 175 Z',[130,156],1),
  body('torso','torso-abdomen','front','M103 179 Q130 185 157 179 L157 232 Q130 239 103 232 Z',[130,205],2),
  body('torso','torso-flanks','both','M93 139 L102 139 L102 226 L95 229 Q92 190 93 139 Z M158 139 L167 139 Q168 190 165 229 L158 226 Z',[98,182],3),
  body('torso','torso-back','back','M103 139 Q130 133 157 139 L157 183 Q130 189 103 183 Z',[130,160],4),
  body('torso','torso-lumbar','back','M103 187 Q130 193 157 187 L157 232 Q130 239 103 232 Z',[130,208],5),

  body('arms','arms-upper','both',armPaths.upper,[76,150],0),
  body('arms','arms-elbow','both',armPaths.elbow,[68,185],1,'palgup'),
  body('arms','arms-forearm','both',armPaths.forearm,[57,219],2),
  body('arms','arms-wrist','both',armPaths.wrist,[50,260],3),
  body('arms','arms-inner-forearm','both',armPaths.innerForearm,[63,237],4,'anpalmok'),
  body('arms','arms-outer-forearm','both',armPaths.outerForearm,[45,237],5,'bakkatpalmok'),

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
