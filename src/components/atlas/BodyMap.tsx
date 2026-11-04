import type { KeyboardEvent, PointerEvent } from 'react';
export const areas = [
  {id:'head',title:'Cabeça',summary:'Explore as regiões publicadas da cabeça.'},
  {id:'torso',title:'Tronco',summary:'Explore as regiões publicadas do tronco.'},
  {id:'arms',title:'Braços',summary:'Explore braços, antebraços e cotovelos.'},
  {id:'hands',title:'Mãos',summary:'Amplie para consultar superfícies e configurações de mão publicadas.'},
  {id:'legs',title:'Pernas',summary:'Explore as regiões publicadas das pernas e dos joelhos.'},
  {id:'feet',title:'Pés',summary:'Amplie para consultar superfícies do pé publicadas.'},
] as const;
export type Area = typeof areas[number]['id'];
export type View = 'front'|'back';
export const isArea = (value:string):value is Area => areas.some(a=>a.id===value);
const crops:Record<Area,string>={head:'80 0 100 115',torso:'65 90 130 180',arms:'15 95 230 220',hands:'10 255 240 90',legs:'65 245 130 170',feet:'55 385 150 85'};
type Props={view:View;selected:Area;hovered:Area|null;zoom:boolean;onSelect:(a:Area)=>void;onHover:(a:Area|null)=>void};
export default function BodyMap({view,selected,hovered,zoom,onSelect,onHover}:Props) {
  const active=hovered||selected;
  const interaction=(id:Area)=>({
    role:'button',tabIndex:0,'aria-label':areas.find(a=>a.id===id)!.title+' — selecionar região',
    'aria-pressed':selected===id,
    className:'atlas-zone '+(active===id?'active':''),
    onClick:()=>onSelect(id),
    onKeyDown:(e:KeyboardEvent<SVGGElement>)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(id);}},
    onPointerEnter:(e:PointerEvent<SVGGElement>)=>{if(e.pointerType==='mouse')onHover(id);},
    onPointerLeave:()=>onHover(null),onFocus:()=>onHover(id),onBlur:()=>onHover(null),
  });
  return <svg viewBox={zoom?crops[selected]:'0 0 260 480'} className="body-svg" role="group" aria-label="Mapa corporal interativo">
    <g role="img" aria-label={'Corpo humano — vista '+(view==='front'?'anterior':'posterior')} className="body-outline">
      <path d="M115 86 L115 109 L88 119 L66 150 L43 274 L60 279 L91 181 L91 242 L80 391 L114 399 L130 277 L146 399 L180 391 L169 242 L169 181 L200 279 L217 274 L194 150 L172 119 L145 109 L145 86 Z"/>
    </g>
    <g {...interaction('head')}><ellipse cx="130" cy="53" rx="32" ry="41"/></g>
    <g {...interaction('torso')}><path d="M98 114 Q130 101 162 114 L169 241 Q130 255 91 241 Z"/></g>
    <g {...interaction('arms')}>
      <path d="M89 120 Q72 119 64 152 L42 270 L60 275 L84 175 L96 148 Z"/>
      <path d="M171 120 Q188 119 196 152 L218 270 L200 275 L176 175 L164 148 Z"/>
    </g>
    <g {...interaction('legs')}>
      <path d="M92 247 L126 254 L116 392 L82 392 Z"/>
      <path d="M168 247 L134 254 L144 392 L178 392 Z"/>
    </g>
    <g {...interaction('hands')}>
      <path d="M42 274 L59 278 L65 294 L62 321 Q48 333 38 316 L32 295 Z"/>
      <path d="M218 274 L201 278 L195 294 L198 321 Q212 333 222 316 L228 295 Z"/>
    </g>
    <g {...interaction('feet')}>
      <path d="M82 397 L116 397 L113 444 Q95 456 66 445 L69 429 Z"/>
      <path d="M144 397 L178 397 L191 429 L194 445 Q165 456 147 444 Z"/>
    </g>
    <g className="body-markings" aria-hidden="true">
      {view==='front'?<>
        <path d="M118 49 h3 M139 49 h3 M124 73 Q130 77 136 73 M130 122 v95 M105 131 Q118 141 128 136 M132 136 Q142 141 155 131"/>
      </>:<>
        <path d="M130 114 v119 M102 132 Q108 162 124 166 M158 132 Q152 162 136 166 M99 222 Q130 212 161 222"/>
      </>}
    </g>
  </svg>;
}
