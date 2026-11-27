import {useGlossary,type GlossaryExpression} from '../lib/glossary';
import {approvedGlossaryItem,glossaryLinksForTerm,hasCheckedSource} from '../lib/published-knowledge';
import {libraryItemHref} from '../lib/library';
import {useTermDetail} from '../lib/use-term-detail';

export function GlossaryTechniqueLink({expression}:{expression:GlossaryExpression}) {
  const slug = approvedGlossaryItem(expression) ? expression.technicalSlug : null;
  const { detail } = useTermDetail(slug);
  const libraryHref = slug ? libraryItemHref(slug) : null;
  const published = detail?.term.publication_status === 'published' && detail.sources.some(hasCheckedSource);
  if (!libraryHref && !published) return null;

  return (
    <div className="actions">
      {libraryHref && <a href={libraryHref}>Abrir ficha na Biblioteca →</a>}
      {published && <a href={'/tecnica?slug=' + encodeURIComponent(detail.term.slug)}>Consultar ficha técnica e fontes →</a>}
    </div>
  );
}

export default function GlossaryKnowledgeLinks({slug}:{slug:string}) {
  const data=useGlossary(),links=glossaryLinksForTerm(slug,data);
  if(!links.expressions.length)return null;
  return <section className="section-inner" aria-label="Glossário relacionado"><h2>Palavras e expressões desta ficha</h2>
    <ul>{links.expressions.map(expression=><li key={expression.id}><a href={'/glossario#expressao-'+encodeURIComponent(expression.id)}>{expression.romanization}</a> — {expression.translation_pt}</li>)}</ul>
    {links.words.length>0&&<p>Palavras: {links.words.map((word,index)=><span key={word.id}>{index>0?' · ':''}<a href={'/glossario#palavra-'+encodeURIComponent(word.id)}>{word.romanization}</a></span>)}</p>}
  </section>;
}
