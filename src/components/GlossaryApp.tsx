import {useState} from 'react';
import {glossaryReviewMode,normalizeGlossary,useGlossary,matchesGlossaryExpression} from '../lib/glossary';
import KoreanExpression from './KoreanExpression';
export default function GlossaryApp({fundamentals=false}:{fundamentals?:boolean}){
 const data=useGlossary(),[query,setQuery]=useState(''),needle=normalizeGlossary(query);
 const words=data.words.filter(w=>[w.romanization,w.hangul,w.meaning_pt,...w.aliases].some(v=>normalizeGlossary(v).includes(needle)));
 return <div className="glossary-app">
  {glossaryReviewMode&&<aside className="glossary-review-banner" data-review-batch={data.batchId}>Prévia local de conteúdo em revisão</aside>}
  {fundamentals?<>
   <div className="height-grid">{[['alta','eolgul','Alta'],['média','momtong','Média'],['baixa','arae','Baixa']].map(([label,id,title],i)=><section className={'height-card height-'+i} aria-label={'Referência '+label} key={id}>
    <p className="tag">Referência {label}</p><h2>{title}</h2>
    {data.words.some(w=>w.id===id)?<><p><KoreanExpression wordId={id}/></p><p className="hangul"><KoreanExpression wordId={id} script="hangul"/></p></>:<p>Termo coreano disponível após revisão.</p>}
   </section>)}</div>
   <h2>Direções para compreender os nomes</h2><div className="glossary-grid">{[['ap','Frente','↑'],['dwi','Trás','↓'],['an','Dentro','→ ←'],['bakkat','Fora','← →']].map(([id,label,arrow])=><section key={id} className="card direction-card"><span className="direction-arrow" aria-hidden="true">{arrow}</span><h3>{label}</h3>{data.words.some(w=>w.id===id)&&<p><KoreanExpression wordId={id}/> · <KoreanExpression wordId={id} script="hangul"/></p>}</section>)}</div>
  </>:<>
   <label className="field glossary-search">Buscar palavra ou expressão<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Busque em português, coreano ou romanização"/></label>
   {data.words.length===0?<div className="empty"><h2>Uma palavra de cada vez</h2><p>Os termos serão disponibilizados após conferência das fontes e revisão. Você já pode explorar o atlas e conhecer as alturas e direções.</p><a className="inline-link" href="/fundamentos/alturas-e-direcoes">Conhecer os fundamentos →</a></div>:<>
    <p className="fine-print" role="status">{words.length} palavras encontradas</p><div className="glossary-grid">{words.map(w=><article key={w.id} className="card glossary-card" data-word-card={w.id}>
     <h2><KoreanExpression wordId={w.id}/></h2><p className="hangul"><KoreanExpression wordId={w.id} script="hangul"/></p><p>{w.meaning_pt}</p>
     {w.aliases.length>0&&<small className="fine-print">Também encontrado na busca: {w.aliases.join(', ')}</small>}
    </article>)}</div>
   </>}
  </>}
  {data.expressions.length>0&&<section className="section-inner"><p className="tag">Palavra e contexto</p><h2>Entenda o nome completo</h2><div className="glossary-grid">{data.expressions.filter(e=>matchesGlossaryExpression(e,data,needle)).map(e=><article key={e.id} className="card">
   <h3><KoreanExpression expressionId={e.id}/></h3><p className="hangul"><KoreanExpression expressionId={e.id} script="hangul"/></p><p>{e.translation_pt}</p>
  </article>)}</div></section>}
 </div>;
}
