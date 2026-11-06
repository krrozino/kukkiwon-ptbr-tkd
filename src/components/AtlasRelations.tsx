import type { RegionTerm } from '../lib/catalog-api';
import KnowledgeReferences from './KnowledgeReferences';

const groups = [['surface','Superfícies de contato'],['target','Alvos'],['movement','Movimentos'],['anatomy','Partes anatômicas'],['other','Outros vínculos']] as const;
export function regionContextSlug(regionSlug:string,links:RegionTerm[]):string|null {
  return links.find(link=>link.technical_terms?.slug===regionSlug)?.technical_terms?.slug||null;
}
export default function AtlasRelations({links,onPreview}:{links:RegionTerm[];onPreview:(slug:string)=>void}) {
  return <>{groups.map(([role,label])=>{
    const records=links.filter(link=>(link.anatomical_role||link.usage_context)===role&&link.technical_terms);
    if(!records.length)return null;
    return <section key={role} aria-label={label}><h4>{label}</h4><ul>{records.map(record=>{
      const term=record.technical_terms!;
      return <li key={record.term_id+record.usage_context}>
        <a href={'/tecnica?slug='+encodeURIComponent(term.slug)}>{term.romanization}</a>
        <button className="context-link" onClick={()=>onPreview(term.slug)}>Ver aqui: {term.romanization}</button>
        {term.translation_pt&&' — '+term.translation_pt}
        {record.source_locator&&(record.content_sources
          ? <KnowledgeReferences sources={[{source_locator:record.source_locator,checked_at:null,content_sources:record.content_sources}]}/>
          : <p className="fine-print">Localizador documental: {record.source_locator}</p>)}
      </li>;
    })}</ul></section>;
  })}</>;
}
