import { useEffect, useState } from "react";
import KoreanExpression from './KoreanExpression';
import { fetchTermDetails, isCatalogConfigured } from "../lib/catalog-api";
import { Pronunciation } from "./TermContext";
import FavoriteButton from "./FavoriteButton";
import TermSchoolMedia from "./TermSchoolMedia";
import KnowledgeReferences from './KnowledgeReferences';
import TermSemanticsPanel from './TermSemanticsPanel';
import GlossaryKnowledgeLinks from './GlossaryKnowledgeLinks';

type Detail = NonNullable<Awaited<ReturnType<typeof fetchTermDetails>>>;

export default function FichaTecnica() {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [status, setStatus] = useState<
    "loading" | "ready" | "notfound" | "error" | "unconfigured"
  >("loading");
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("slug");
    if (!slug || !/^[a-z0-9-]{1,120}$/.test(slug)) {
      setStatus("notfound");
      return;
    }
    if (!isCatalogConfigured()) {
      setStatus("unconfigured");
      return;
    }
    const controller = new AbortController();
    fetchTermDetails(slug, controller.signal)
      .then((data) => {
        if (!data) {
          setStatus("notfound");
          return;
        }
        setDetail(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });
    return () => controller.abort();
  }, []);

  if (status !== "ready" || !detail)
    return (
      <div className="empty" role="status">
        {status === "loading"
          ? "Carregando ficha técnica..."
          : status === "unconfigured"
            ? "A conexão com o catálogo ainda não está ativa nesta prévia."
            : status === "notfound"
              ? "Técnica não encontrada ou ainda não publicada."
              : "Não foi possível consultar esta técnica."}
      </div>
    );

  const { term, sources, media, regions, relations } = detail;
  return (
    <article className="technique-detail">
      <p className="tag">{term.category}</p>
      <h1><KoreanExpression expressionId={term.slug} fallback={term.romanization} publishedTerm={term}/></h1>
      <FavoriteButton slug={term.slug} title={term.romanization} />
      {term.hangul && (
        <p lang="ko" className="hangul">
          <KoreanExpression expressionId={term.slug} script="hangul" fallback={term.hangul} publishedTerm={term}/>
        </p>
      )}
      {term.translation_pt && <p className="lead">{term.translation_pt}</p>}
      <div className="detail-grid">
        <section className="card">
          <h2>Entenda a técnica</h2>
          <p>{term.definition_pt || "Definição ainda não disponível."}</p>
          <Pronunciation term={term} />
          <p className="fine-print">
            A pronúncia em português é uma adaptação didática, não uma
            romanização oficial.
          </p>
        </section>
        <section className="card">
          <h2>Nomenclaturas relacionadas</h2>
          {(term.term_aliases || []).length === 0 ? (
            <p>Nenhum nome alternativo registrado.</p>
          ) : (
            <ul>
              {term.term_aliases!.map((alias) => (
                <li key={alias.alias + alias.alias_kind}>
                  {alias.alias}{" "}
                  <span className="fine-print">
                    ({alias.alias_kind}
                    {alias.is_official ? ", documentado" : ", uso de busca"})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      {term.publication_status === 'published' && <TermSemanticsPanel termId={term.id} />}
      <section className="section-inner">
        <h2>Referências documentais</h2>
        <p className="fine-print">
          As fontes abaixo identificam a origem do conteúdo. Verificação técnica
          e tradução são etapas editoriais distintas.
        </p>
        <KnowledgeReferences sources={sources}/>
      </section>
      {term.publication_status==='published'&&<GlossaryKnowledgeLinks slug={term.slug}/>}
      <section className="section-inner">
        <h2>Atlas e técnicas relacionadas</h2>
        {regions.filter((r) => r.body_regions).length === 0 ? (
          <p>Nenhuma região corporal publicada associada.</p>
        ) : (
          <ul>
            {regions
              .filter((r) => r.body_regions)
              .map((r) => (
                <li key={r.body_regions!.id + r.usage_context}>
                  <a
                    href={
                      "/atlas?region=" +
                      encodeURIComponent(r.body_regions!.slug)
                    }
                  >
                    {r.body_regions!.name_pt}
                  </a>
                  <span className="fine-print">
                    {" "}
                    ·{" "}
                    {r.usage_context === "surface"
                      ? "Superfície de contato"
                      : r.usage_context === "target"
                        ? "Alvo"
                        : r.usage_context === "movement"
                          ? "Movimento"
                          : "Vínculo anatômico"}
                  </span>
                </li>
              ))}
          </ul>
        )}
        {relations.filter((r) => r.technical_terms).length > 0 && (
          <ul>
            {relations
              .filter((r) => r.technical_terms)
              .map((r) => (
                <li key={r.technical_terms!.slug + r.relation_kind}>
                  {r.relation_kind === "variant_of"
                    ? "Variante de: "
                    : "Relacionada: "}
                  <a
                    href={
                      "/tecnica?slug=" +
                      encodeURIComponent(r.technical_terms!.slug)
                    }
                  >
                    {r.technical_terms!.romanization}
                  </a>
                  {r.source_locator&&r.content_sources&&<KnowledgeReferences sources={[{source_locator:r.source_locator,checked_at:r.checked_at||null,content_sources:r.content_sources}]}/>}
                </li>
              ))}
          </ul>
        )}
        {term.record_kind === "family" && (
          <a href={"/catalogo?family=" + encodeURIComponent(term.slug)}>
            Consultar variantes documentadas desta família
          </a>
        )}
      </section>
      {term.record_kind==='poomsae'&&term.publication_status==='published'&&<p><a href={'/poomsae?slug='+encodeURIComponent(term.slug)}>Consultar movimentos publicados desta forma →</a></p>}
      <section className="section-inner">
        <h2>Mídia autorizada</h2>
        <TermSchoolMedia slug={term.slug} />
        {media.length === 0 ? (
          <p>
            Vídeos e imagens serão incluídos após conferência de autoria e
            permissões.
          </p>
        ) : (
          <ul>
            {media.map((item) => (
              <li key={item.id}>
                <a
                  href={item.media_url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {item.caption_pt || item.media_kind}
                </a>
                {item.creator && " · " + item.creator}
                {item.license_name && " · " + item.license_name}
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
