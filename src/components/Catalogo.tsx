import {useEffect,useMemo,useState} from 'react';
type Term = {id:string;slug:string;category:string;hangul:string|null;romanization:string;translation_pt:string|null;definition_pt:string|null};
export default function Catalogo(){
  const [entries,setEntries]=useState<Term[]>([]);
  const [filter,setFilter]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    const controller = new AbortController();
    const base = import.meta.env.PUBLIC_SUPABASE_URL;
    const key = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if(!base || !key || base.includes('SEU-PROJETO')){setLoading(false);return;}
    const params = new URLSearchParams({select:'id,slug,category,hangul,romanization,translation_pt,definition_pt',publication_status:'eq.published',order:'romanization.asc',limit:'500'});
    fetch(base.replace(/\/$/,'')+'/rest/v1/technical_terms?'+params.toString(),{headers:{apikey:key,Accept:'application/json'},signal:controller.signal,cache:'no-store'})
      .then(async r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json() as Promise<Term[]>})
      .then(setEntries)
      .catch(e=>{if(e.name!=='AbortError')setError('Erro ao carregar catálogo.')})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false)});
    return ()=>controller.abort();
  },[]);
  const visible=useMemo(()=>entries.filter(x=>(x.romanization+' '+(x.hangul||'')+' '+(x.translation_pt||'')).toLocaleLowerCase('pt-BR').includes(filter.toLocaleLowerCase('pt-BR'))),[entries,filter]);
  return <div><label className="field">Buscar técnica, tradução ou Hangul<input type="search" value={filter} placeholder="Ex.: chagi, 차기, chute" onChange={e=>setFilter(e.target.value)} /></label>{loading?<p role="status">Carregando...</p>:error?<p role="alert">{error}</p>:visible.length===0?<div className="empty"><strong>Nenhuma técnica publicada.</strong><p>A pesquisa está em andamento. Publicaremos apenas itens verificados.</p></div>:<div className="grid" style={{marginTop:24}}>{visible.map(x=><article className="card" key={x.id}><small>{x.category}</small><h2>{x.romanization}</h2><p lang="ko">{x.hangul}</p><p>{x.translation_pt||'Tradução em revisão'}</p>{x.definition_pt&&<p>{x.definition_pt}</p>}</article>)}</div>}</div>;
}
