import {useEffect,useState} from 'react';
import {isCatalogConfigured} from '../lib/catalog-api';
import {fetchPublishedPoomsae,fetchPoomsaeSteps,isKnowledgeSchemaEnabled,type PoomsaeForm,type PoomsaeStep} from '../lib/poomsae';
import KnowledgeReferences from './KnowledgeReferences';

export function PoomsaeSequence({form,steps}:{form:PoomsaeForm;steps:PoomsaeStep[]}) {
  return <article className="section-inner" aria-label={'Sequência de '+form.technical_terms.romanization}>
    <h2>{form.technical_terms.romanization}</h2>
    {form.technical_terms.hangul&&<p lang="ko">{form.technical_terms.hangul}</p>}
    <p>{form.technical_terms.translation_pt}</p>
    <p className="fine-print">Versão documental: {form.sequence_version}. A numeração segue os registros publicados.</p>
    <a href={'/tecnica?slug='+encodeURIComponent(form.technical_terms.slug)}>Consultar ficha e referências da forma</a>
    <KnowledgeReferences sources={[form]}/>
    {!steps.length?<p>Nenhum movimento publicado para esta versão.</p>:<ol>{steps.map(step=><li key={step.id} value={step.step_number} className="card">
      <h3>Movimento {step.step_number}: <a href={'/tecnica?slug='+encodeURIComponent(step.technical_terms.slug)}>{step.technical_terms.romanization}</a></h3>
      {step.technical_terms.hangul&&<p lang="ko">{step.technical_terms.hangul}</p>}
      {step.instruction_pt&&<p>{step.instruction_pt}</p>}
      <KnowledgeReferences sources={[step]}/>
    </li>)}</ol>}
  </article>;
}

export default function PoomsaeApp() {
  const enabled=isKnowledgeSchemaEnabled()&&isCatalogConfigured();
  const [forms,setForms]=useState<PoomsaeForm[]>([]),[selected,setSelected]=useState<string|null>(null);
  const [steps,setSteps]=useState<PoomsaeStep[]>([]),[loading,setLoading]=useState(enabled),[stepsLoading,setStepsLoading]=useState(false);
  const [error,setError]=useState(''),[stepError,setStepError]=useState(''),[retry,setRetry]=useState(0);
  useEffect(()=>{
    if(!enabled)return;
    const controller=new AbortController();setLoading(true);setError('');
    fetchPublishedPoomsae(controller.signal).then(rows=>{if(!controller.signal.aborted){setForms(rows);const slug=new URLSearchParams(window.location.search).get('slug');setSelected(rows.find(row=>row.technical_terms.slug===slug)?.term_id||rows[0]?.term_id||null);}})
      .catch(()=>{if(!controller.signal.aborted)setError('Não foi possível consultar as formas publicadas.');})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return()=>controller.abort();
  },[enabled,retry]);
  useEffect(()=>{
    setSteps([]);setStepError('');if(!selected)return;
    const controller=new AbortController();setStepsLoading(true);
    fetchPoomsaeSteps(selected,controller.signal).then(rows=>{if(!controller.signal.aborted)setSteps(rows);})
      .catch(()=>{if(!controller.signal.aborted)setStepError('Não foi possível consultar os movimentos desta forma.');})
      .finally(()=>{if(!controller.signal.aborted)setStepsLoading(false);});
    return()=>controller.abort();
  },[selected,retry]);
  const form=forms.find(item=>item.term_id===selected);
  if(loading)return <p role="status">Consultando Poomsae publicados...</p>;
  if(error)return <div role="alert"><p>{error}</p><button onClick={()=>setRetry(value=>value+1)}>Tentar novamente</button></div>;
  if(!forms.length)return <div className="empty" role="status"><h2>Poomsae em preparação</h2><p>As formas e seus movimentos aparecerão após conferência das fontes e aprovação editorial de cada registro.</p><div className="actions"><a href="/catalogo">Consultar catálogo</a><a href="/atlas">Explorar atlas corporal</a></div></div>;
  return <div><label className="field">Forma publicada<select value={selected||''} onChange={event=>{
    const id=event.target.value;setSelected(id);const item=forms.find(row=>row.term_id===id);if(item)history.replaceState(null,'','/poomsae?slug='+encodeURIComponent(item.technical_terms.slug));
  }}>{forms.map(item=><option key={item.term_id} value={item.term_id}>{item.technical_terms.romanization}</option>)}</select></label>
    {stepsLoading?<p role="status">Consultando movimentos publicados...</p>:stepError?<div role="alert"><p>{stepError}</p><button onClick={()=>setRetry(value=>value+1)}>Tentar novamente</button></div>:form&&<PoomsaeSequence form={form} steps={steps}/>}
  </div>;
}
