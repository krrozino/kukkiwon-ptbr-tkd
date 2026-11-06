import {useEffect,useId,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import {useGlossary,glossaryReviewMode,type GlossaryWord,type GlossaryExpression} from '../lib/glossary';
import {useTermDetail} from '../lib/use-term-detail';

type Props={wordId?:string;expressionId?:string;script?:'romanization'|'hangul';fallback?:string|null;publishedTerm?:{slug:string;publication_status:string}};
type Open={kind:'word';id:string}|{kind:'expression';id:string};
export default function KoreanExpression({wordId,expressionId,script='romanization',fallback,publishedTerm}:Props){
 const data=useGlossary(),id=useId(),root=useRef<HTMLSpanElement>(null),trigger=useRef<HTMLButtonElement|null>(null),floating=useRef<HTMLDivElement>(null);
 const [hover,setHover]=useState<string|null>(null),[open,setOpen]=useState<Open|null>(null);
 const [position,setPosition]=useState<CSSProperties>({left:12,top:12});
 const expression=data.expressions.find(e=>e.id===expressionId),single=data.words.find(w=>w.id===wordId);
 const focusedWord=data.words.find(w=>w.id===(open?.kind==='word'?open.id:hover));
 const focusedExpression=open?.kind==='expression'?data.expressions.find(e=>e.id===open.id):null;
 const linkedSlug=focusedExpression?.technicalSlug||null;
 const {detail}=useTermDetail(open?.kind==='expression'&&!publishedTerm?linkedSlug:null);
 const ficha=publishedTerm?.publication_status==='published'?publishedTerm.slug:
  detail?.term.publication_status==='published'&&detail.term.slug===linkedSlug?linkedSlug:null;
 const close=(restore=true)=>{setOpen(null);setHover(null);if(restore)trigger.current?.focus({preventScroll:true});};
 useEffect(()=>{
  const other=(e:Event)=>{if((e as CustomEvent).detail!==id){setOpen(null);setHover(null);}};
  window.addEventListener('glossary-open',other);return()=>window.removeEventListener('glossary-open',other);
 },[id]);
 useEffect(()=>{
  if(!open&&!hover)return;
  const update=()=>{
   const rect=trigger.current?.getBoundingClientRect(),box=floating.current?.getBoundingClientRect();if(!rect||!box)return;
   const left=Math.max(12,Math.min(rect.left,innerWidth-box.width-12));
   const below=rect.bottom+8;const top=Math.max(12,Math.min(below+box.height<=innerHeight-12?below:rect.top-box.height-8,innerHeight-box.height-12));
   setPosition({left,top});
  };
  update();window.addEventListener('resize',update);window.addEventListener('scroll',update,true);
  return()=>{window.removeEventListener('resize',update);window.removeEventListener('scroll',update,true);};
 },[open,hover]);
 useEffect(()=>{
  if(!open&&!hover)return;
  if(open)floating.current?.focus({preventScroll:true});
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close(Boolean(open));}};
  const outside=(e:PointerEvent)=>{if(!floating.current?.contains(e.target as Node)&&!root.current?.contains(e.target as Node))close(false);};
  document.addEventListener('keydown',key,true);document.addEventListener('pointerdown',outside);
  return()=>{document.removeEventListener('keydown',key,true);document.removeEventListener('pointerdown',outside);};
 },[open,hover]);
 useEffect(()=>{setOpen(null);setHover(null);},[wordId,expressionId,script]);
 const show=(value:Open,button:HTMLButtonElement)=>{
  trigger.current=button;window.dispatchEvent(new CustomEvent('glossary-open',{detail:id}));setHover(null);setOpen(value);
 };
 const renderWord=(word:GlossaryWord,text:string,key:string)=><button key={key} type="button" className="korean-word" aria-label={text+': significado'}
  aria-describedby={hover===word.id&&!open?id+'-tip':undefined} aria-haspopup="dialog"
  onPointerEnter={e=>{if(e.pointerType==='mouse'&&!open){trigger.current=e.currentTarget;setHover(word.id);}}}
  onPointerLeave={()=>setHover(null)} onFocus={e=>{if(!open){trigger.current=e.currentTarget;setHover(word.id);}}}
  onBlur={()=>setHover(null)} onClick={e=>show({kind:'word',id:word.id},e.currentTarget)}>{text}</button>;
 const sourceList=(item:GlossaryWord|GlossaryExpression)=><div className="glossary-sources"><strong>Referências</strong>{item.sources.map((s,i)=><p key={i}><a href={s.url} target="_blank" rel="noreferrer">{s.institution} · {s.title}</a><br/>{s.edition} · {s.locator}</p>)}</div>;
 const popup=(open||hover)&&typeof document!=='undefined'?createPortal(
  open?<div ref={floating} style={position} role="dialog" tabIndex={-1} aria-labelledby={id+'-title'} className="glossary-popover">
   <button className="glossary-close" aria-label="Fechar explicação" onClick={()=>close()}>×</button>
   {glossaryReviewMode&&<p className="tag">Conteúdo em revisão</p>}
   {focusedWord?<>
    <h2 id={id+'-title'}>Significado de {focusedWord.romanization}</h2>
    <p lang="ko" className="hangul">{focusedWord.hangul}</p>
    <p><strong>{focusedWord.meaning_pt}</strong></p><h3>No contexto</h3><p>{focusedWord.context_pt}</p>
    <p className="fine-print">Pronúncia: {focusedWord.pronunciation_pt||'ainda não conferida'}</p>{sourceList(focusedWord)}
   </>:focusedExpression?<>
    <p className="tag">Expressão completa</p><h2 id={id+'-title'}>{focusedExpression.romanization}</h2>
    <p className="hangul" lang="ko">{focusedExpression.hangul}</p><p><strong>{focusedExpression.translation_pt}</strong></p>
    <p>{focusedExpression.context_pt}</p>{ficha&&<a className="inline-link" href={'/tecnica?slug='+encodeURIComponent(ficha)}>Abrir ficha técnica →</a>}{sourceList(focusedExpression)}
   </>:<h2 id={id+'-title'}>Explicação indisponível</h2>}
  </div>:focusedWord?<div ref={floating} role="tooltip" id={id+'-tip'} style={position} className="glossary-tip">{focusedWord.meaning_pt}</div>:null,
  document.body):null;
 if(!expression&&!single)return <span>{fallback||''}</span>;
 return <span ref={root} className="korean-expression" data-expression={expression?.id} data-word={single?.id} data-script={script} lang={script==='hangul'?'ko':undefined}>
  {expression?expression.segments.map((segment,i)=>{
   const word=data.words.find(w=>w.id===segment.wordId);
   return <span key={i}>{i>0&&script==='romanization'?'-':''}{word?renderWord(word,segment[script],String(i)):segment[script]}</span>;
  }):single&&renderWord(single,single[script],'single')}
  {expression&&<button type="button" className="expression-info" aria-label={'Entender '+expression.romanization+' por inteiro'} onClick={e=>show({kind:'expression',id:expression.id},e.currentTarget)}>ⓘ</button>}
  {popup}
 </span>;
}
