import { useEffect, useState } from "react";
import { fetchTermDetails } from "../lib/catalog-api";
import FavoriteButton from "./FavoriteButton";
export type TermDetail = NonNullable<
  Awaited<ReturnType<typeof fetchTermDetails>>
>;
export function useTermDetail(slug: string | null) {
  const [detail, setDetail] = useState<TermDetail | null>(null),
    [error, setError] = useState(false);
  useEffect(() => {
    setDetail(null);
    setError(false);
    if (!slug) return;
    const c = new AbortController();
    fetchTermDetails(slug, c.signal)
      .then((d) => {
        if (!c.signal.aborted) {
          setDetail(d);
          if (!d) setError(true);
        }
      })
      .catch(() => {
        if (!c.signal.aborted) setError(true);
      });
    return () => c.abort();
  }, [slug]);
  return { detail, error };
}
export function Pronunciation({ term }: { term: TermDetail["term"] }) {
  return (
    <div className="pronunciation">
      <span className="fine-print">Pronúncia didática PT-BR</span>
      <p>
        {term.pronunciation_pt || "Ainda não conferida."}
        {term.pronunciation_pt && term.pronunciation_status !== "verified" && (
          <small> · Provisória, não verificada</small>
        )}
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
            ? "Ficha indisponível ou ainda não publicada."
            : `Consultando ${slug}…`}
        </p>
      ) : (
        <>
          <p className="tag">
            {detail.term.category} ·{" "}
            {detail.term.publication_status === "draft"
              ? "Conteúdo provisório"
              : "Catálogo"}
          </p>
          {detail.term.publication_status === "draft" && (
            <p className="review-label">
              Rascunho não validado · tradução e execução aguardam revisão.
            </p>
          )}
          <h3>{detail.term.romanization}</h3>
          <p lang="ko" className="hangul">
            {detail.term.hangul}
          </p>
          <p>
            <strong>{detail.term.translation_pt}</strong>
          </p>
          <Pronunciation term={detail.term} />
          <p>
            {detail.term.definition_pt || "Descrição ainda não disponível."}
          </p>
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
              <h4>Fonte documental</h4>
              {detail.sources.map((s, i) => (
                <p className="fine-print" key={i}>
                  <a
                    href={s.content_sources?.official_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {s.content_sources?.title || "Documento"}
                  </a>{" "}
                  · {s.source_locator}
                </p>
              ))}
              <h4>Imagens, vídeos e áudio</h4>
              {detail.media.length === 0 ? (
                <p className="fine-print">
                  Nenhuma mídia autorizada disponível para este termo.
                </p>
              ) : (
                detail.media.map((m) => (
                  <p key={m.id}>
                    <a href={m.media_url} target="_blank" rel="noreferrer">
                      {m.caption_pt || m.media_kind}
                    </a>
                  </p>
                ))
              )}
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
