import FavoriteButton from "./FavoriteButton";
import {useTermDetail,type TermDetail} from '../lib/use-term-detail';
export {useTermDetail} from '../lib/use-term-detail';
export type {TermDetail} from '../lib/use-term-detail';
import KoreanExpression from './KoreanExpression';
import KnowledgeReferences from './KnowledgeReferences';
import TermSemanticsPanel from './TermSemanticsPanel';
export function Pronunciation({ term }: { term: TermDetail["term"] }) {
  if (!term.pronunciation_pt && !term.pronunciation_notes && !term.pronunciation_audio_url) return null;
  return (
    <div className="pronunciation">
      <span className="fine-print">Pronúncia didática PT-BR</span>
      <p>
        {term.pronunciation_pt}
      </p>
      {term.pronunciation_notes && (
        <p className="fine-print">{term.pronunciation_notes}</p>
      )}
      {term.pronunciation_audio_url?.startsWith("https://") && (
        <>
          <audio
            controls
            preload="none"
            src={term.pronunciation_audio_url}
            aria-label={"Ouvir " + term.romanization}
          />
          <small>
            {term.pronunciation_audio_kind === "synthetic"
              ? "Voz sintética"
              : "Gravação humana"}
          </small>
        </>
      )}
    </div>
  );
}
export default function TermContext({
  slug,
  compact = false,
  onClose,
}: {
  slug: string;
  compact?: boolean;
  onClose?: () => void;
}) {
  const { detail, error } = useTermDetail(slug);
  return (
    <section
      className={"term-context " + (compact ? "compact" : "")}
      aria-label="Ficha contextual"
      aria-busy={!detail && !error}
    >
      {onClose && (
        <button
          className="context-close"
          onClick={onClose}
          aria-label="Fechar prévia"
        >
          ×
        </button>
      )}
      {!detail ? (
        <p role="status">
          {error
            ? "Não foi possível consultar esta ficha."
            : `Consultando ${slug}…`}
        </p>
      ) : (
        <>
          <p className="tag">{detail.term.category}</p>
          <h3><KoreanExpression expressionId={detail.term.slug} fallback={detail.term.romanization} publishedTerm={detail.term}/></h3>
          <p lang="ko" className="hangul">
            <KoreanExpression expressionId={detail.term.slug} script="hangul" fallback={detail.term.hangul} publishedTerm={detail.term}/>
          </p>
          <p>
            <strong>{detail.term.translation_pt}</strong>
          </p>
          <Pronunciation term={detail.term} />
          {detail.term.definition_pt && <p>{detail.term.definition_pt}</p>}
          {!compact && (
            <>
              <h4>Superfície e uso</h4>
              <ul>
                {detail.regions
                  .filter((r) => r.body_regions)
                  .map((r) => (
                    <li key={r.body_regions!.slug + r.usage_context}>
                      {r.body_regions!.name_pt} ·{" "}
                      {r.usage_context === "surface"
                        ? "Superfície de contato"
                        : r.usage_context}
                    </li>
                  ))}
              </ul>
              {detail.relations.length > 0 && (
                <ul>
                  {detail.relations
                    .filter((r) => r.technical_terms)
                    .map((r) => (
                      <li key={r.technical_terms!.slug}>
                        <a href={"/tecnica?slug=" + r.technical_terms!.slug}>
                          {r.technical_terms!.romanization}
                        </a>
                      </li>
                    ))}
                </ul>
              )}
              {detail.term.publication_status === 'published' && <TermSemanticsPanel termId={detail.term.id} />}
              <h4>Fonte documental</h4>
              <KnowledgeReferences sources={detail.sources}/>
              {detail.media.length > 0 && <h4>Imagens, vídeos e áudio</h4>}
              {detail.media.length > 0 && detail.media.map((m) => (
                  <p key={m.id}>
                    <a href={m.media_url} target="_blank" rel="noreferrer">
                      {m.caption_pt || m.media_kind}
                    </a>
                  </p>
                ))}
            </>
          )}
          <div className="actions">
            <FavoriteButton slug={slug} title={detail.term.romanization} />
            <a
              className="inline-link"
              href={"/tecnica?slug=" + encodeURIComponent(slug)}
            >
              Abrir ficha completa →
            </a>
          </div>
        </>
      )}
    </section>
  );
}
