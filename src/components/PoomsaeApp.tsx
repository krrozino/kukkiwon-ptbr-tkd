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

// Índice educativo com nomes e simbolismo resumidos a partir das descrições
// públicas da Kukkiwon, separado do banco de sequências técnicas homologadas.
const taegeukIndex = [
  { number: 1, boardNo: 1347, symbol: "Céu", note: "Primeiros fundamentos e início da prática." },
  { number: 2, boardNo: 1349, symbol: "Lago", note: "Calma e controle da respiração e das emoções." },
  { number: 3, boardNo: 1350, symbol: "Fogo", note: "Clareza, energia e movimentos decididos." },
  { number: 4, boardNo: 1351, symbol: "Trovão", note: "Movimento e expressão dinâmica de força." },
  { number: 5, boardNo: 1352, symbol: "Vento", note: "Alternância de suavidade e intensidade." },
  { number: 6, boardNo: 1353, symbol: "Água", note: "Continuidade e adaptação do movimento." },
  { number: 7, boardNo: 1354, symbol: "Montanha", note: "Estabilidade e uso consciente das articulações." },
  { number: 8, boardNo: 1355, symbol: "Terra", note: "Integração dos fundamentos desenvolvidos nas formas anteriores." },
] as const;
const kukkiwonPoomsaeSource = "https://www.kukkiwon.or.kr/eng/board/list?boardManagementNo=55&menuLevel=3&menuNo=72";
/** Nomes e contexto histórico/simbólico: não constituem sequência de movimentos. */
const danIndex = [
  { name:"Koryo",boardNo:1356,theme:"Tradição marcial e postura de quem estuda." },
  { name:"Keumgang",boardNo:1357,theme:"Força firme associada à imagem da montanha." },
  { name:"Taebaek",boardNo:1358,theme:"Montanha luminosa, origem e tradição." },
  { name:"Pyongwon",boardNo:1359,theme:"Planície e expansão em todas as direções." },
  { name:"Shipjin",boardNo:1360,theme:"Dez símbolos tradicionais de longevidade." },
  { name:"Jitae",boardNo:1361,theme:"A pessoa e sua relação com a terra." },
  { name:"Chonkwon",boardNo:1362,theme:"Céu, forças naturais e equilíbrio." },
  { name:"Hansu",boardNo:1363,theme:"Água, continuidade e adaptabilidade." },
  { name:"Ilyeo",boardNo:1364,theme:"Unidade entre mente e corpo." },
] as const;


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
  if(!forms.length)return <div className="poomsae-index">
    <section aria-label="Introdução às formas Taegeuk">
    <div className="card">
      <p className="tag">Conteúdo educativo de referência</p>
      <h2>Conheça os oito Taegeuk</h2>
      <p>Os nomes e os temas gerais das oito formas Taegeuk podem ser estudados desde já. As sequências passo a passo e os vínculos técnicos continuarão separados até a validação documental.</p>
      <div className="grid">
        {taegeukIndex.map(form=><article key={form.number} className="card">
          <p className="tag">Forma {form.number} de 8</p>
          <h3>Taegeuk {form.number} Jang</h3>
          <p><strong>Símbolo: {form.symbol}</strong></p>
          <p>{form.note}</p>
          <a className="inline-link" target="_blank" rel="noreferrer" href={`https://www.kukkiwon.or.kr/eng/board/read?boardManagementNo=55&boardNo=${form.boardNo}&menuLevel=3&menuNo=72`}>Ler a descrição original na Kukkiwon →</a>
        </article>)}
      </div>
      <p className="fine-print">Resumo introdutório independente, baseado nas descrições públicas da Kukkiwon; não substitui ensino supervisionado nem constitui uma sequência técnica homologada neste site. <a href={kukkiwonPoomsaeSource} target="_blank" rel="noreferrer">Consultar a referência original de Poomsae</a>.</p>
    </div>
    </section>
    <section className="card section-inner" role="region" aria-label="Poomsae de graduação Dan">
      <p className="tag">Poomsae de graduação Dan</p>
      <h2>Conheça as formas de Koryo a Ilyeo</h2>
      <p>Os nove nomes e temas abaixo são apresentados pela Kukkiwon. Seus movimentos ainda precisam de documentação específica e revisão antes de aparecer como sequência aqui.</p>
      <div className="grid">
        {danIndex.map(form=><article key={form.boardNo} className="card">
          <h3>{form.name}</h3>
          <p>{form.theme}</p>
          <a className="inline-link" target="_blank" rel="noopener noreferrer"
            href={`https://www.kukkiwon.or.kr/eng/board/read?boardManagementNo=55&boardNo=${form.boardNo}&menuLevel=3&menuNo=72`}>
            Conferir nome e contexto na Kukkiwon →
          </a>
        </article>)}
      </div>
    </section>
    <div className="empty" role="status">
      <h2>Poomsae em preparação</h2>
      <p>As sequências detalhadas aparecerão após conferência das fontes e aprovação editorial de cada movimento.</p>
      <div className="actions"><a href="/catalogo">Consultar catálogo</a><a href="/curriculos">Montar currículo de estudos</a></div>
    </div>
  </div>;
  return <div><label className="field">Forma publicada<select value={selected||''} onChange={event=>{
    const id=event.target.value;setSelected(id);const item=forms.find(row=>row.term_id===id);if(item)history.replaceState(null,'','/poomsae?slug='+encodeURIComponent(item.technical_terms.slug));
  }}>{forms.map(item=><option key={item.term_id} value={item.term_id}>{item.technical_terms.romanization}</option>)}</select></label>
    {stepsLoading?<p role="status">Consultando movimentos publicados...</p>:stepError?<div role="alert"><p>{stepError}</p><button onClick={()=>setRetry(value=>value+1)}>Tentar novamente</button></div>:form&&<PoomsaeSequence form={form} steps={steps}/>}
  </div>;
}
