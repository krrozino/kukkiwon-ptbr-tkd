import { useEffect, useState } from 'react';
import { filterProvisionalAcervo, type ProvisionalEntry, type ProvisionalEvidence } from '../lib/provisional-acervo';

const fieldLabels={romanization:'Romanização documentada',hangul:'Hangul documentado',translation_pt:'Tradução proposta',definition_pt:'Descrição proposta'};
const gapLabels:Record<string,string>={romanization:'Romanização',hangul:'Hangul',translation_pt:'Tradução',definition_pt:'Descrição',pronunciation_pt:'Pronúncia em português',literal_meaning:'Significado literal',human_review:'Revisão humana',anatomical_links:'Relações corporais'};
const roleLabels:Record<string,string>={surface:'Superfície usada',target:'Região alvo',movement:'Região em movimento',anatomy:'Referência anatômica'};
const kindLabels:Record<string,string>={family:'Família',variant:'Variante',surface:'Superfície',anatomy:'Referência anatômica',technique:'Técnica'};
function Evidence({evidence}:{evidence:ProvisionalEvidence}) {
  const {source}=evidence;
  return <small className="acervo-evidence"><a href={source.url} target="_blank" rel="noopener noreferrer">{source.institution} · {source.title}</a>
    <span>{[source.edition,source.year].filter(Boolean).join(' · ')} · {evidence.locator}</span>
    <span>Consulta documental: {evidence.accessedAt||'data não registrada no lote'} · revisão humana pendente</span>
  </small>;
}
export default function ProvisionalAcervo({entries}:{entries:ProvisionalEntry[]}) {
  const [query,setQuery]=useState(''),[category,setCategory]=useState(''),[region,setRegion]=useState('');
  useEffect(()=>{
    const sync=()=>{
      const params=new URLSearchParams(window.location.search);
      setQuery((params.get('q')||'').slice(0,200));setCategory(params.get('categoria')||'');setRegion(params.get('regiao')||'');
    };
    sync();window.addEventListener('popstate',sync);
    return ()=>window.removeEventListener('popstate',sync);
  },[]);
  const categories=[...new Set(entries.map(entry=>entry.category))].sort();
  const regions=[...new Map(entries.flatMap(entry=>entry.relations.map(link=>[link.regionSlug,link.regionName] as const))).entries()].sort((a,b)=>a[1].localeCompare(b[1],'pt-BR'));
  const visible=filterProvisionalAcervo(entries,{query,category,region});
  const update=(field:'q'|'categoria'|'regiao',value:string)=>{
    const params=new URLSearchParams(window.location.search);if(value)params.set(field,value);else params.delete(field);
    history.replaceState(null,'','/acervo'+(params.size?'?'+params.toString():''));
    if(field==='q')setQuery(value);else if(field==='categoria')setCategory(value);else setRegion(value);
  };
  return <div className="acervo-browser">
    <div className="acervo-filters">
      <label className="field">Buscar no acervo<input type="search" maxLength={200} value={query} onChange={e=>update('q',e.target.value)} placeholder="Nome, Hangul ou tradução"/></label>
      <label className="field">Categoria<select value={category} onChange={e=>update('categoria',e.target.value)}><option value="">Todas</option>{categories.map(value=><option key={value}>{value}</option>)}</select></label>
      <label className="field">Região relacionada<select value={region} onChange={e=>update('regiao',e.target.value)}><option value="">Todas</option>{regions.map(([slug,name])=><option key={slug} value={slug}>{name}</option>)}</select></label>
      <button type="button" onClick={()=>{history.replaceState(null,'','/acervo');setQuery('');setCategory('');setRegion('');}}>Limpar filtros</button>
    </div>
    <p role="status" aria-live="polite">{visible.length} de {entries.length} registros provisórios</p>
    {!visible.length&&<p className="empty">Nenhum registro corresponde aos filtros. Tente outro termo ou limpe os filtros.</p>}
    <div className="acervo-grid">{visible.map(entry=><article key={entry.slug} id={entry.slug} className="card acervo-entry">
      <p className="tag">Provisório · revisão pendente</p>
      <h2><a href={'#'+entry.slug}>{entry.fields.romanization?.value}</a></h2>
      <p className="fine-print">{entry.category} · {kindLabels[entry.kind]||'Registro de estudo'}</p>
      <dl>{Object.entries(entry.fields).map(([field,claim])=><div key={field} className="acervo-claim">
        <dt>{fieldLabels[field as keyof typeof fieldLabels]}</dt><dd><span lang={field==='hangul'?'ko':undefined}>{claim.value}</span><Evidence evidence={claim.evidence}/></dd>
      </div>)}</dl>
      {entry.relations.length>0&&<div className="acervo-relations"><h3>Relações com o corpo · em revisão</h3><ul>{entry.relations.map((link,index)=><li key={link.regionSlug+link.role+index}>
        <strong>{roleLabels[link.role]}: </strong><a href={'/acervo?regiao='+encodeURIComponent(link.regionSlug)}>{link.regionName} · ver registros relacionados</a>
        {link.atlasArea&&<> · <a href={'/atlas?region='+link.atlasArea+'&zoom=1'}>Explorar área ilustrativa no atlas</a></>}
        <Evidence evidence={link.evidence}/>
      </li>)}</ul></div>}
      {entry.atlasArea&&<p><a href={'/atlas?region='+entry.atlasArea+'&zoom=1'}>Explorar área ilustrativa no atlas</a></p>}
      <details><summary>Pendências desta ficha ({entry.gaps.length})</summary><ul>{entry.gaps.map(gap=><li key={gap}>{gapLabels[gap]||gap}</li>)}</ul></details>
      <a className="inline-link" href={'https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/new?template=content_review.yml&title='+encodeURIComponent('[Revisão] '+entry.slug)}>Sinalizar correção ou retirada</a>
    </article>)}</div>
  </div>;
}
