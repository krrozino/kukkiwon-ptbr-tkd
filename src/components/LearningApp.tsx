import {useEffect,useState} from 'react';
import {fetchCatalogPage,fetchTermDetails,isCatalogConfigured} from '../lib/catalog-api';
import {useGlossary} from '../lib/glossary';
import {buildLearningDeck,buildTranslationQuiz,type LearningCard} from '../lib/published-knowledge';
import KnowledgeReferences from './KnowledgeReferences';

export function LearningDeck({cards}:{cards:LearningCard[]}) {
  const [index,setIndex]=useState(0),[revealed,setRevealed]=useState(false),[choice,setChoice]=useState<string|null>(null);
  const card=cards[index],quiz=buildTranslationQuiz(cards).find(item=>item.cardId===card?.id);
  if(!card)return null;
  return <div>
    <section className="card" aria-label="Cartão de estudo">
      <p className="tag">Cartão {index+1} de {cards.length}</p><h2>{card.prompt}</h2>
      {card.hangul&&<p className="hangul" lang="ko">{card.hangul}</p>}
      <button aria-expanded={revealed} onClick={()=>setRevealed(value=>!value)}>{revealed?'Ocultar resposta':'Mostrar resposta'}</button>
      {revealed&&<div><p className="lead">{card.answer}</p>{card.context&&<p>{card.context}</p>}<KnowledgeReferences sources={card.sources}/><a href={card.href}>Consultar ficha completa</a>
        {card.glossaryExpressionIds.map(id=><p key={id}><a href={'/glossario#expressao-'+encodeURIComponent(id)}>Entender a expressão no glossário</a></p>)}
      </div>}
      {cards.length>1&&<div className="actions"><button disabled={index===0} onClick={()=>{setIndex(index-1);setRevealed(false);setChoice(null);}}>Cartão anterior</button><button disabled={index===cards.length-1} onClick={()=>{setIndex(index+1);setRevealed(false);setChoice(null);}}>Próximo cartão</button></div>}
    </section>
    {quiz&&<section className="card section-inner" aria-label="Exercício de tradução"><h2>Quiz de tradução</h2><p>Qual tradução está registrada para <strong>{quiz.prompt}</strong>?</p>
      <div className="actions">{quiz.choices.map(answer=><button key={answer} aria-pressed={choice===answer} onClick={()=>setChoice(answer)}>{answer}</button>)}</div>
      {choice&&<p role="status">{choice===quiz.answer?'Resposta de acordo com a ficha publicada.':'Consulte a ficha e tente novamente.'} <a href={card.href}>Rever referência</a></p>}
    </section>}
  </div>;
}

export default function LearningApp() {
  const glossary=useGlossary(),[details,setDetails]=useState<NonNullable<Awaited<ReturnType<typeof fetchTermDetails>>>[]>([]);
  const [loading,setLoading]=useState(true),[error,setError]=useState(''),[retry,setRetry]=useState(0);
  useEffect(()=>{
    if(!isCatalogConfigured()){setLoading(false);return;}
    const controller=new AbortController();setLoading(true);setError('');
    // A bounded page avoids downloading the full catalogue to assemble a study session.
    fetchCatalogPage({page:1,pageSize:24},controller.signal).then(async page=>{
      const rows=await Promise.all(page.items.filter(term=>term.publication_status==='published').map(term=>fetchTermDetails(term.slug,controller.signal)));
      if(!controller.signal.aborted)setDetails(rows.filter((row):row is NonNullable<typeof row>=>row!==null));
    }).catch(()=>{if(!controller.signal.aborted)setError('Não foi possível preparar a sessão de estudo.');})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return()=>controller.abort();
  },[retry]);
  const cards=buildLearningDeck(details,glossary);
  if(loading)return <p role="status">Preparando cartões a partir das fichas publicadas...</p>;
  if(error)return <div role="alert"><p>{error}</p><button onClick={()=>setRetry(value=>value+1)}>Tentar novamente</button></div>;
  if(!cards.length)return <div className="empty" role="status"><h2>Exercícios em preparação</h2><p>Os cartões e quizzes serão formados com traduções de fichas publicadas que tenham referências conferidas.</p><div className="actions"><a href="/glossario">Explorar o glossário</a><a href="/catalogo">Consultar catálogo</a></div></div>;
  return <><p className="fine-print">Esta sessão usa até 24 fichas da primeira página do catálogo. Cada resposta pode ser consultada na fonte da ficha.</p><LearningDeck key={cards.map(card=>card.id).join(',')} cards={cards}/></>;
}
