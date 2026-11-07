import {useEffect,useId,useRef,useState,type CSSProperties} from 'react';
import type {BodyRegion} from '../../lib/catalog-api';
import type {Area,View} from './BodyMap';
import BodyIllustration,{bodySilhouettePath} from './BodyIllustration';
import {areaViewBoxes,zonesFor} from './zones';
import {zoneCopy} from './zone-copy';
import {useTermDetail} from '../TermContext';
import AtlasSourceEvidence from './AtlasSourceEvidence';

type Props={area:Area;view:View;regions:BodyRegion[];selected:string|null;onSelect:(r:BodyRegion)=>void};
export default function BodyRegionMap({area,view,regions,selected,onSelect}:Props){
  const zones=zonesFor(area,view),clip=useId().replace(/:/g,'')+'-body';
  const [visual,setVisual]=useState<string|null>(null),[hover,setHover]=useState<string|null>(null);
  const [side,setSide]=useState(false);const canvas=useRef<HTMLDivElement>(null);
  const published=(id:string)=>{const zone=zones.find(z=>z.id===id);return zone?.regionSlug?regions.find(r=>r.slug===zone.regionSlug):undefined;};
  const active=visual||zones.find(z=>z.regionSlug===selected)?.id||null;
  const focused=zones.find(z=>z.id===(hover||active)),record=focused&&published(focused.id);
  const {detail}=useTermDetail(record?.slug||null);
  useEffect(()=>{setVisual(null);setHover(null);},[area,view,selected]);
  useEffect(()=>{
    const update=()=>setSide((canvas.current?.clientWidth||0)>=435&&innerWidth>=1000);
    const observer=new ResizeObserver(update);if(canvas.current)observer.observe(canvas.current);update();
    return ()=>observer.disconnect();
  },[]);
  const choose=(id:string)=>{
    setHover(id);const record=published(id);
    if(record){setVisual(null);onSelect(record);}else setVisual(id);
  };
  const label=(id:string)=>published(id)?.name_pt||zoneCopy[id]?.title||'Região anatômica ilustrativa';
  return <div ref={canvas} className={'surface-canvas body-detail placement-'+(side?'side':'below')} onPointerLeave={()=>setHover(null)}>
    <svg className="detail-svg" viewBox={areaViewBoxes[area]} role="group" aria-label="Recortes do corpo interativos">
      <defs>
        <linearGradient id="dobok-fabric"><stop stopColor="#fff"/><stop offset="1" stopColor="#e2e6e5"/></linearGradient>
        <linearGradient id="dobok-shadow"><stop stopColor="#f7faf9"/><stop offset="1" stopColor="#d9e3e2"/></linearGradient>
        <clipPath id={clip}><path d={bodySilhouettePath}/></clipPath>
      </defs>
      <BodyIllustration view={view}/>
      <g clipPath={`url(#${clip})`}>
        {zones.map(zone=><g key={zone.id} data-region={zone.id} data-anchor-x={zone.anchor[0]} data-anchor-y={zone.anchor[1]} role="button" tabIndex={0}
          aria-label={label(zone.id)} aria-pressed={active===zone.id}
          className={'surface-cutout '+(active===zone.id?'selected':'')}
          style={{'--surface-color':zone.color} as CSSProperties}
          onPointerEnter={e=>{if(e.pointerType==='mouse')setHover(zone.id);}}
          onPointerDown={e=>{if(e.pointerType==='touch'||e.pointerType==='pen'){
            setHover(zone.id);if(!published(zone.id))setVisual(zone.id);
          }}}
          onFocus={()=>{if(!active)setHover(zone.id);else setHover(null);}}
          onBlur={()=>setHover(null)} onClick={()=>choose(zone.id)}
          onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(zone.id);}}}>
          <path d={zone.path}/>
        </g>)}
      </g>
    </svg>
    <section className="surface-inspector" aria-label="Detalhes da região selecionada">
      {focused?<div role="tooltip" className={'surface-tooltip'+(record?'':' surface-tooltip-compact')} key={focused.id}>
        {record?<><strong>{record.name_pt}</strong><span>{detail?.term.romanization||'Identificação em consulta'}</span>
          <span lang="ko">{detail?.term.hangul||'Hangul em consulta'}</span>
          <span>Pronúncia: {detail?.term.pronunciation_pt||'ainda não conferida'}</span>
          <small>{detail?.term.definition_pt?.slice(0,160)||'Consulte as referências desta região.'}</small>
          <a className="inline-link" href={'/tecnica?slug='+encodeURIComponent(record.slug)}>Abrir ficha técnica →</a>
          <AtlasSourceEvidence kind="technical" sources={detail?.sources}/>
        </>:<><strong>{zoneCopy[focused.id]?.title||'Região anatômica ilustrativa'}</strong><span>{zoneCopy[focused.id]?.description||'Região selecionada na ilustração.'}</span><small>Descrição anatômica para estudo; a nomenclatura técnica ainda exige conferência.</small><AtlasSourceEvidence kind="illustrative"/></>}
      </div>:<div className="surface-placeholder" aria-hidden="true"><span className="surface-placeholder-icon">◎</span><strong>Explore as áreas coloridas</strong><small>Selecione uma zona no desenho ou na legenda.</small></div>}
    </section>
    <nav className="surface-legend" aria-label="Selecionar zona ilustrada">
      <div className="surface-legend-heading"><strong>Mapa das áreas</strong><small>{zones.length} zonas nesta vista</small></div>
      <div className="surface-legend-items">{zones.map(z=><button key={z.id} data-legend-zone={z.id}
        className={'surface-legend-button'+(active===z.id?' selected':'')} aria-label={label(z.id)} aria-pressed={active===z.id}
        onFocus={()=>{if(!active)setHover(z.id);else setHover(null);}} onMouseEnter={()=>setHover(z.id)} onClick={()=>choose(z.id)}>
        <span className="surface-swatch" aria-hidden="true" style={{backgroundColor:z.color}}/><span>{label(z.id)}</span>
      </button>)}</div>
    </nav>
  </div>;
}
