import {useEffect,useId,useRef,useState,type CSSProperties,type ReactNode} from 'react';
import type {BodyRegion} from '../../lib/catalog-api';
import type {Area,View} from './BodyMap';
import BodyIllustration,{bodySilhouettePath,HeadFeatureOverlay,headSilhouetteParts} from './BodyIllustration';
import {areaViewBoxes,zonesFor,type AtlasZone} from './zones';
import {zoneCopy} from './zone-copy';
import {useTermDetail} from '../TermContext';
import AtlasSourceEvidence from './AtlasSourceEvidence';

type Props={
  area:Area;view:View;regions:BodyRegion[];selected:string|null;onSelect:(r:BodyRegion)=>void;
  renderInspection?:(region:BodyRegion)=>ReactNode;
};
export default function BodyRegionMap({area,view,regions,selected,onSelect,renderInspection}:Props){
  const zones=zonesFor(area,view),clip=useId().replace(/:/g,'')+'-body';
  const inspectorId=clip+'-inspector';
  const [visual,setVisual]=useState<string|null>(null),[hover,setHover]=useState<string|null>(null);
  const [side,setSide]=useState(false);const canvas=useRef<HTMLDivElement>(null);
  const regionSlug=(zone:AtlasZone)=>zone.regionSlug??(renderInspection?zone.id:undefined);
  const regionForZone=(zone:AtlasZone)=>regions.find(region=>region.slug===regionSlug(zone));
  const active=visual||zones.find(z=>regionSlug(z)===selected)?.id||null;
  const focused=zones.find(z=>z.id===((renderInspection&&active)||hover||active));
  const lastSelection=renderInspection&&selected?regions.find(region=>region.slug===selected):undefined;
  const record=lastSelection??(focused&&regionForZone(focused));
  const illustration=focused?zoneCopy[focused.id]:undefined;
  const {detail}=useTermDetail(renderInspection?null:record?.slug||null);
  // A seleção pode mudar antes do efeito da consulta; nunca mostrar fonte de outra ficha.
  const inspectedDetail=record&&detail?.term.slug===record.slug?detail:null;
  useEffect(()=>{setVisual(null);setHover(null);},[area,view,selected]);
  useEffect(()=>{
    const update=()=>setSide((canvas.current?.clientWidth||0)>=720&&innerWidth>=1080);
    const observer=new ResizeObserver(update);if(canvas.current)observer.observe(canvas.current);update();
    return ()=>observer.disconnect();
  },[]);
  const choose=(zone:AtlasZone)=>{
    setHover(zone.id);const record=regionForZone(zone);
    if(record){setVisual(null);onSelect(record);}else setVisual(zone.id);
  };
  const label=(zone:AtlasZone)=>regionForZone(zone)?.name_pt||zoneCopy[zone.id]?.title||'Região anatômica ilustrativa';
  return <div ref={canvas} data-atlas-area={area} className={'surface-canvas body-detail placement-'+(side?'side':'below')} onPointerLeave={()=>setHover(null)}>
    <svg className="detail-svg" viewBox={areaViewBoxes[area]} role="group" aria-label="Recortes do corpo interativos">
      <defs>
        <linearGradient id="dobok-fabric"><stop stopColor="#fff"/><stop offset="1" stopColor="#e2e6e5"/></linearGradient>
        <linearGradient id="dobok-shadow"><stop stopColor="#f7faf9"/><stop offset="1" stopColor="#d9e3e2"/></linearGradient>
        <clipPath id={clip}>
          {/* Separate paths keep the head and neck overlap inside the silhouette. */}
          {area==='head'?headSilhouetteParts(view).map(path=><path key={path} d={path}/>):<path d={bodySilhouettePath}/>}
        </clipPath>
      </defs>
      <BodyIllustration view={view}/>
      <g clipPath={`url(#${clip})`}>
        {zones.map(zone=>{
          const zonePath=view==='back'&&zone.backPath?zone.backPath:zone.path;
          const [anchorX,anchorY]=view==='back'&&zone.backAnchor?zone.backAnchor:zone.anchor;
          return <g key={zone.id} data-region={zone.id} data-anchor-x={anchorX} data-anchor-y={anchorY} role="button" tabIndex={0}
          aria-label={label(zone)} aria-pressed={active===zone.id}
          aria-controls={renderInspection?inspectorId:undefined}
          className={'surface-cutout '+(active===zone.id?'selected':'')}
          style={{'--surface-color':zone.color} as CSSProperties}
          onPointerEnter={e=>{if(e.pointerType==='mouse')setHover(zone.id);}}
          onPointerDown={e=>{if(e.pointerType==='touch'||e.pointerType==='pen'){
            setHover(zone.id);if(!regionForZone(zone))setVisual(zone.id);
          }}}
          onFocus={()=>{if(!active)setHover(zone.id);else setHover(null);}}
          onBlur={()=>setHover(null)} onClick={()=>choose(zone)}
          onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(zone);}}}>
          <path d={zonePath} pointerEvents={renderInspection?'fill':undefined}/>
        </g>;})}
      </g>
      {area==='head'&&<HeadFeatureOverlay view={view}/>}
    </svg>
    <section id={renderInspection?inspectorId:undefined} className="surface-inspector" aria-label="Detalhes da região selecionada">
      {focused||lastSelection?<div role={renderInspection&&record?undefined:'tooltip'} className={'surface-tooltip'+(record?'':' surface-tooltip-compact')} key={lastSelection?.id??focused?.id}>
        {renderInspection&&record?renderInspection(record):record?<><strong>{record.name_pt}</strong><span>{inspectedDetail?.term.romanization||'Identificação em consulta'}</span>
          <span lang="ko">{inspectedDetail?.term.hangul||'Hangul em consulta'}</span>
          <span>Pronúncia: {inspectedDetail?.term.pronunciation_pt||'ainda não conferida'}</span>
          <small>{inspectedDetail?.term.definition_pt?.slice(0,160)||'Consulte as referências desta região.'}</small>
          <a className="inline-link" href={'/tecnica?slug='+encodeURIComponent(record.slug)}>Abrir ficha técnica →</a>
          <AtlasSourceEvidence kind="technical" sources={inspectedDetail?.sources}/>
        </>:<><strong>{illustration?.title||'Região anatômica ilustrativa'}</strong><span>{illustration?.description||'Região selecionada na ilustração.'}</span><small>Descrição anatômica para estudo; a nomenclatura técnica ainda exige conferência.</small><AtlasSourceEvidence kind="illustrative"/></>}
      </div>:<div className="surface-placeholder" aria-hidden="true"><span className="surface-placeholder-icon">◎</span><strong>Explore as áreas coloridas</strong><small>Selecione uma zona no desenho ou na legenda.</small></div>}
    </section>
    <nav className="surface-legend" aria-label="Selecionar zona ilustrada">
      <div className="surface-legend-heading"><strong>Mapa das áreas</strong><small>{zones.length} zonas nesta vista</small></div>
      <div className="surface-legend-items">{zones.map(z=><button key={z.id} data-legend-zone={z.id}
        className={'surface-legend-button'+(active===z.id?' selected':'')} aria-label={label(z)} aria-pressed={active===z.id}
        aria-controls={renderInspection?inspectorId:undefined}
        onFocus={()=>{if(!active)setHover(z.id);else setHover(null);}} onMouseEnter={()=>setHover(z.id)} onClick={()=>choose(z)}>
        <span className="surface-swatch" aria-hidden="true" style={{backgroundColor:z.color}}/><span>{label(z)}</span>
      </button>)}</div>
    </nav>
  </div>;
}
