import {surfaces,handSurfaceSlugs,footSurfaceSlugs} from './surfaces';
import type {Area,View} from './BodyMap';

export type AtlasZone = {
  id:string; area:Area; view:View|'both'; path:string; color:string;
  anchor:[number,number]; regionSlug?:string; posture?:'fist';
  backPath?:string; backAnchor?:[number,number];
};
export const areaViewBoxes:Record<Area,string>={
  head:'90 10 80 102',torso:'65 95 130 150',arms:'25 112 210 165',
  legs:'72 234 116 194',hands:'10 255 240 90',feet:'55 385 150 85',
};
const palette=['#d6a541','#258c8b','#cf7549','#ad699b','#598bc0','#859753'];
const body=(area:Area,id:string,view:AtlasZone['view'],path:string,anchor:[number,number],color:number,regionSlug?:string,
  back?:{backPath?:string;backAnchor?:[number,number]}):AtlasZone=>
  ({id,area,view,path,anchor,color:palette[color],...(regionSlug?{regionSlug}:{}),...back});

// Espelhar geometria em torno do eixo x=130 preserva simetria bilateral nas malhas do corpo.
function bilateralPath(left: string) {
  const right = left.replace(/(\d+(?:\.\d+)?) (\d+(?:\.\d+)?)/g, (_, x, y) => `${260 - Number(x)} ${y}`);
  return `${left} ${right}`;
}
const elbowTop = 'M49 169 C64 177 79 178 94 172';
const forearmTop = 'M45 195 C57 202 73 202 84 197';
const medialContactEdge = 'Q66 225 63 232 C61 239 59 245 58 249';
// O inventário Argon lê os slugs nas chamadas body(), sem avaliar TypeScript.
const armPaths = {
  upper: bilateralPath(`${elbowTop} C96 154 97 132 94 113 Q82 116 75 126 L58 147 Z`),
  elbow: bilateralPath(`${elbowTop} L84 197 C73 202 57 202 45 195 Z`),
  forearm: bilateralPath(`${forearmTop} L74 225 ${medialContactEdge} Q54 251 49 249 C50 244 51 237 49 232 Q46 225 37 228 Z`),
  wrist: bilateralPath('M35 245 Q42 250 49 249 Q54 251 58 249 Q62 249 67 247 L60 266 Q51 270 37 262 Z'),
  innerForearm: bilateralPath(`M74 225 ${medialContactEdge} Q62 249 67 247 Z`),
  outerForearm: bilateralPath('M37 228 Q46 225 49 232 C51 237 50 244 49 249 Q42 250 35 245 Z'),
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

  body('torso','torso-shoulders','both',bilateralPath('M114 103 Q105 107 96 111 Q85 115 78 126 L89 138 Q95 137 102 137 Q114 133 126 131 Z'),[106,123],0,undefined,{
    backPath:'M114 103 Q105 107 96 111 Q85 115 78 126 L89 138 Q95 137 102 137 Q116 132 130 132 Q144 132 158 137 Q165 137 171 138 L182 126 Q175 115 164 111 Q155 107 146 103 Q130 116 114 103 Z',
    backAnchor:[130,124],
  }),
  body('torso','torso-chest','front','M102 137 Q114 133 126 131 L130 133 L134 131 Q146 133 158 137 L158 176 Q149 178 143 178 Q142 170 130 165 Q118 170 117 178 Q111 178 102 176 Z',[130,150],1),
  body('torso','torso-solar-plexus','front','M117 178 Q118 170 130 165 Q142 170 143 178 Q142 188 130 192 Q118 188 117 178 Z',[130,178],4),
  body('torso','torso-abdomen','front','M102 176 Q111 178 117 178 Q118 188 130 192 Q142 188 143 178 Q149 178 158 176 L158 231 Q130 240 102 231 Z',[130,212],2),
  body('torso','torso-flanks','both',bilateralPath('M89 138 Q95 137 102 137 L102 231 Q95 230 92 228 L92 174 Z'),[98,184],3),
  body('torso','torso-back','back','M102 137 Q116 132 130 132 Q144 132 158 137 L158 186 Q130 192 102 186 Z',[130,160],4),
  body('torso','torso-lumbar','back','M102 186 Q130 192 158 186 L158 231 Q130 240 102 231 Z',[130,210],5),

  body('arms','arms-upper','both',armPaths.upper,[76,150],0),
  body('arms','arms-elbow','both',armPaths.elbow,[68,185],1,'palgup'),
  body('arms','arms-forearm','both',armPaths.forearm,[57,219],2),
  body('arms','arms-wrist','both',armPaths.wrist,[50,260],3),
  body('arms','arms-inner-forearm','both',armPaths.innerForearm,[63,237],4,'anpalmok'),
  body('arms','arms-outer-forearm','both',armPaths.outerForearm,[45,237],5,'bakkatpalmok'),

  body('legs','legs-hip','both','M90 239 Q130 248 170 239 Q177 253 176 268 Q154 263 130 271 Q106 263 84 268 Q83 253 90 239 Z',[130,256],3),
  body('legs','legs-thigh','both',bilateralPath('M84 268 Q106 263 130 271 L128 296 L121 316 Q102 321 82 316 Q81 292 84 268 Z'),[103,292],0),
  body('legs','legs-knee','front',bilateralPath('M82 316 Q102 321 121 316 L119 343 Q100 348 82 343 Z'),[101,331],1,'mureup'),
  body('legs','legs-knee-back','back',bilateralPath('M82 316 Q102 321 121 316 L119 342 Q100 347 82 342 Z'),[101,330],1),
  body('legs','legs-shin','front',bilateralPath('M82 343 Q100 348 119 343 L116 394 Q100 396 82 394 Z'),[100,370],2,'jeonggangi'),
  body('legs','legs-calf','back',bilateralPath('M82 342 Q100 347 119 342 L116 394 Q100 396 82 394 Z'),[100,369],4),
  body('legs','legs-ankle','both',bilateralPath('M82 394 Q100 396 116 394 L115 419 Q100 422 76 416 Z'),[98,407],5),
];
const detailZones=(area:'hands'|'feet',ids:readonly string[]):AtlasZone[]=>ids.map(id=>({
  ...surfaces[id],id,area,...(!id.startsWith('illustration-')?{regionSlug:id}:{}),
}));
export const atlasZones:AtlasZone[]=[...bodyZones,...detailZones('hands',handSurfaceSlugs),...detailZones('feet',footSurfaceSlugs)];
export const zonesFor=(area:Area,view:View,fist=false)=>atlasZones.filter(z=>
  z.area===area&&(z.view===view||z.view==='both')&&(area!=='hands'||Boolean(z.posture)===fist));
