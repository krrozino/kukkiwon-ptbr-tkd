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
  body('head','head-face','front','M115 52 H145 V76 H115 Z',[130,65],0),
  body('head','head-forehead','front','M113 36 Q130 30 150 36 L148 52 H112 Z',[130,43],1),
  body('head','head-temples','front','M108 51 H115 V72 L110 70 Z M145 51 H153 L151 70 L145 72 Z',[111,60],2),
  body('head','head-chin','front','M115 76 H147 Q145 87 131 92 Q120 87 115 76 Z',[130,83],3),
  body('head','head-occiput','back','M111 27 Q130 16 148 29 L153 54 L149 77 Q130 85 112 76 L107 53 Z',[130,54],4),
  body('head','head-neck','both','M118 91 Q130 97 142 91 L144 102 Q130 110 116 102 Z',[130,101],5),
  body('torso','torso-shoulders','both','M96 113 L113 106 L121 125 L99 139 L90 133 Z M147 106 L164 113 L170 133 L161 139 L139 125 Z',[106,123],0),
  body('torso','torso-chest','front','M102 139 H158 L160 173 H100 Z',[130,154],1),
  body('torso','torso-abdomen','front','M100 173 H160 L161 219 Q130 225 99 219 Z',[130,196],2),
  body('torso','torso-flanks','both','M94 145 L102 143 L100 173 L99 219 L95 218 Z M158 143 L166 145 L165 218 L161 219 L160 173 Z',[98,183],3),
  body('torso','torso-back','back','M102 139 H158 L160 185 H100 Z',[130,160],4),
  body('torso','torso-lumbar','back','M100 185 H160 L161 219 Q130 225 99 219 Z',[130,204],5),
  body('arms','arms-upper','both','M79 133 L91 140 L79 174 L65 171 Z M181 133 L169 140 L181 174 L195 171 Z',[78,155],0),
  body('arms','arms-elbow','both','M65 174 L78 178 L74 198 L59 195 Z M195 174 L182 178 L186 198 L201 195 Z',[68,185],1,'palgup'),
  body('arms','arms-forearm','both','M58 199 L73 203 L61 246 L45 242 Z M202 199 L187 203 L199 246 L215 242 Z',[59,224],2),
  body('arms','arms-wrist','both','M45 246 L60 250 L56 267 L41 263 Z M215 246 L200 250 L204 267 L219 263 Z',[50,257],3),
  // Preservar as geometrias técnicas existentes do antebraço, sem renomeá-las.
  body('arms','arms-inner-forearm','both','M47 230 L61 233 L55 265 L44 262 Z',[52,244],4,'anpalmok'),
  body('arms','arms-outer-forearm','both','M202 230 L214 228 L219 261 L205 266 Z',[211,244],5,'bakkatpalmok'),
  body('legs','legs-thigh','both','M91 251 L124 257 L115 318 L84 316 Z M169 251 L136 257 L145 318 L176 316 Z',[101,284],0),
  body('legs','legs-knee','front','M84 322 L115 324 L113 345 L84 343 Z M176 322 L145 324 L147 345 L176 343 Z',[99,334],1,'mureup'),
  body('legs','legs-shin','front','M85 349 L113 351 L110 391 L85 390 Z M175 349 L147 351 L150 391 L175 390 Z',[99,370],2),
  body('legs','legs-calf','back','M85 323 L115 326 L112 371 L109 391 L85 390 Z M175 323 L145 326 L148 371 L151 391 L175 390 Z',[100,351],4),
];
const detailZones=(area:'hands'|'feet',ids:readonly string[]):AtlasZone[]=>ids.map(id=>({
  ...surfaces[id],id,area,...(!id.startsWith('illustration-')?{regionSlug:id}:{}),
}));
export const atlasZones:AtlasZone[]=[...bodyZones,...detailZones('hands',handSurfaceSlugs),...detailZones('feet',footSurfaceSlugs)];
export const zonesFor=(area:Area,view:View,fist=false)=>atlasZones.filter(z=>
  z.area===area&&(z.view===view||z.view==='both')&&(area!=='hands'||Boolean(z.posture)===fist));
