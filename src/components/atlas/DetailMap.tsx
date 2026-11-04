import type { KeyboardEvent } from 'react';
import type { BodyRegion } from '../../lib/catalog-api';
import type { View } from './BodyMap';
type Props={area:'hands'|'feet';view:View;regions:BodyRegion[];selected:string|null;onSelect:(r:BodyRegion)=>void};
export default function DetailMap({area,view,regions,selected,onSelect}:Props) {
  const hand=area==='hands';
  const visible=regions.filter(r=>(r.detail_view===view||r.detail_view==='both')&&r.detail_x!=null&&r.detail_y!=null);
  return <svg viewBox="0 0 100 120" className="detail-svg" role="group" aria-label="Regiões técnicas publicadas no detalhe">
    <g role="img" aria-label={hand?'Detalhe original da mão — '+(view==='front'?'palma':'dorso'):'Detalhe original do pé — '+(view==='front'?'planta':'dorso')} className="detail-outline">
      {hand?<path d="M30 111 L28 86 Q18 73 13 60 Q10 51 16 50 Q21 49 27 61 L29 64 L27 28 Q27 19 32 20 Q37 20 37 28 L39 49 L38 14 Q38 7 43 7 Q48 7 48 15 L49 46 L50 18 Q50 10 55 11 Q60 11 59 20 L59 49 L63 30 Q65 23 69 25 Q74 26 72 34 L68 71 Q67 84 61 91 L60 111 Z"/>:
        <path d="M35 108 Q23 104 25 89 L31 65 Q32 52 23 40 Q17 28 21 18 Q23 12 29 15 Q28 5 35 6 Q40 6 41 13 Q43 4 48 6 L54 15 Q58 8 63 12 L68 23 Q74 20 76 27 Q83 46 72 65 L65 88 Q65 105 54 109 Z"/>}
      <g className="body-markings" aria-hidden="true">{hand?<path d={view==='front'?'M32 71 Q46 54 62 66 M34 82 Q48 75 59 82':'M39 51 L37 83 M49 49 L48 85 M59 52 L57 83'}/>:<path d={view==='front'?'M29 36 Q49 27 71 36 M34 87 Q46 80 59 87':'M34 38 L38 72 M48 35 L49 76 M62 38 L57 74'}/>}</g>
    </g>
    {visible.map((r,index)=><g key={r.id} role="button" tabIndex={0} aria-label={r.name_pt} aria-pressed={selected===r.slug}
      className={'detail-hotspot '+(selected===r.slug?'active':'')} transform={'translate('+r.detail_x+' '+r.detail_y+')'}
      onClick={()=>onSelect(r)} onKeyDown={(e:KeyboardEvent<SVGGElement>)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(r);}}}>
      <circle r="6"/><text textAnchor="middle" dominantBaseline="central" aria-hidden="true">{index+1}</text>
    </g>)}
  </svg>;
}
