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
export const bodyZones:AtlasZone[]=[
  // A figura possui 260x480 unidades. Estas faixas seguem o contorno
  // orgânico do rosto, dobok, articulações e calça; o clipPath limita as
  // marcas às partes do corpo. Não são áreas técnicas certificadas.
  body('head','head-face','front','M116 53 Q130 48 145 53 L149 71 Q144 81 131 83 Q119 81 113 71 Z',[130,65],0),
  body('head','head-forehead','front','M113 37 Q128 31 148 37 L148 51 Q130 47 113 52 Z',[130,43],1),
  body('head','head-temples','front','M107 51 Q110 49 115 52 L114 74 Q109 71 107 63 Z M147 52 Q151 49 155 52 L153 70 L147 74 Z',[111,60],2),
  body('head','head-chin','front','M115 77 Q130 86 146 77 Q145 88 131 93 Q120 90 115 77 Z',[130,83],3),
  body('head','head-occiput','back','M108 45 Q109 22 130 19 Q153 22 155 45 L152 71 Q146 85 131 91 Q115 85 109 72 Z',[130,54],4),
  body('head','head-neck','both','M117 90 Q130 96 143 90 L145 103 Q130 112 115 103 Z',[130,101],5),

  body('torso','torso-shoulders','both','M95 113 Q104 108 114 105 L121 123 L101 143 L89 134 Z M146 105 Q156 108 165 113 L171 134 L159 143 L139 123 Z',[106,123],0),
  body('torso','torso-chest','front','M104 140 Q130 132 156 140 L160 174 Q130 182 100 174 Z',[130,154],1),
  body('torso','torso-abdomen','front','M101 176 Q130 183 159 176 L163 218 Q131 228 97 218 Z',[130,196],2),
  body('torso','torso-flanks','both','M95 142 L105 141 L102 178 L99 219 L94 226 Q91 196 95 142 Z M155 141 L165 142 Q169 197 166 226 L161 219 L158 178 Z',[98,183],3),
  body('torso','torso-back','back','M103 139 Q130 134 157 139 L160 185 Q130 193 100 185 Z',[130,160],4),
  body('torso','torso-lumbar','back','M100 186 Q130 192 160 186 L164 219 Q130 230 96 219 Z',[130,204],5),

  body('arms','arms-upper','both','M77 127 Q84 119 95 116 L96 147 L78 183 L62 175 Q66 150 77 127 Z M183 127 Q176 119 165 116 L164 147 L182 183 L198 175 Q194 150 183 127 Z',[78,155],0),
  body('arms','arms-elbow','both','M61 174 Q69 179 78 179 L76 199 Q66 206 56 198 Z M199 174 Q191 179 182 179 L184 199 Q194 206 204 198 Z',[68,185],1,'palgup'),
  body('arms','arms-forearm','both','M57 199 Q65 204 75 204 L61 247 Q52 249 43 242 Z M203 199 Q195 204 185 204 L199 247 Q208 249 217 242 Z',[59,224],2),
  body('arms','arms-wrist','both','M44 243 Q52 250 61 249 L58 270 L39 263 Z M216 243 Q208 250 199 249 L202 270 L221 263 Z',[50,257],3),
  body('arms','arms-inner-forearm','both','M49 227 Q55 232 63 233 L57 266 L43 263 Z',[52,244],4,'anpalmok'),
  body('arms','arms-outer-forearm','both','M197 233 Q205 232 212 227 L217 263 L203 266 Z',[211,244],5,'bakkatpalmok'),

  body('legs','legs-thigh','both','M91 245 Q107 251 124 256 L117 319 Q100 325 83 316 Z M169 245 Q153 251 136 256 L143 319 Q160 325 177 316 Z',[101,284],0),
  body('legs','legs-knee','front','M83 317 Q100 323 116 320 L114 346 Q99 351 84 345 Z M177 317 Q160 323 144 320 L146 346 Q161 351 176 345 Z',[99,334],1,'mureup'),
  body('legs','legs-shin','front','M84 347 Q98 352 114 348 L114 391 Q98 397 83 392 Z M176 347 Q162 352 146 348 L146 391 Q162 397 177 392 Z',[99,370],2),
  body('legs','legs-calf','back','M83 322 Q99 330 116 322 L113 363 L114 391 Q99 399 83 393 Z M177 322 Q161 330 144 322 L147 363 L146 391 Q161 399 177 393 Z',[100,351],4),
];
const detailZones=(area:'hands'|'feet',ids:readonly string[]):AtlasZone[]=>ids.map(id=>({
  ...surfaces[id],id,area,...(!id.startsWith('illustration-')?{regionSlug:id}:{}),
}));
export const atlasZones:AtlasZone[]=[...bodyZones,...detailZones('hands',handSurfaceSlugs),...detailZones('feet',footSurfaceSlugs)];
export const zonesFor=(area:Area,view:View,fist=false)=>atlasZones.filter(z=>
  z.area===area&&(z.view===view||z.view==='both')&&(area!=='hands'||Boolean(z.posture)===fist));
