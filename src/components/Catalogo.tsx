import { useEffect, useRef, useState } from "react";
import {
  fetchCatalogPage,
  fetchCatalogFacets,
  isCatalogConfigured,
  type CatalogPage,
  type CatalogFacets,
} from "../lib/catalog-api";
// Famílias introdutórias: apresentação pedagógica, não fichas técnicas publicadas.
const movementGroups = [
  { title: "Chutes", name: "Chagi", description: "Movimentos realizados com as pernas e os pés." },
  { title: "Defesas", name: "Makgi", description: "Movimentos para interceptar ou desviar ações de ataque." },
  { title: "Golpes de punho", name: "Jireugi", description: "Movimentos de ataque executados com o punho." },
  { title: "Posições", name: "Seogi", description: "Bases do corpo utilizadas para equilíbrio e deslocamento." },
] as const;
const movementSource = "https://research.kukkiwon.or.kr/society/researchKukkiwon/homepage/boardMedia/11584";

const emptyFacets: CatalogFacets = {
  categories: [],
  regions: [],
  families: [],
};
const readFilters = () => {
  const p = new URLSearchParams(window.location.search),
    n = Number(p.get("page"));
  return {
    query: (p.get("q") || "").slice(0, 200),
    category: p.get("category") || "",
    region: p.get("region") || "",
    family: p.get("family") || "",
    page: Number.isSafeInteger(n) && n > 0 ? n : 1,
  };
};
export default function Catalogo() {
  const [filters, setFilters] = useState({
    query: "",
    category: "",
    region: "",
    family: "",
    page: 1,
  });
  const [ready, setReady] = useState(false),
    [facets, setFacets] = useState(emptyFacets),
    [facetError, setFacetError] = useState(false);
  const [result, setResult] = useState<CatalogPage>({ items: [], total: 0 });
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  const resultsRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const sync = () => setFilters(readFilters());
    sync();
    setReady(true);
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  useEffect(() => {
    if (!isCatalogConfigured()) return;
    const c = new AbortController();
    setFacetError(false);
    fetchCatalogFacets(c.signal)
      .then((data) => {
        if (!c.signal.aborted) setFacets(data);
      })
      .catch(() => {
        if (!c.signal.aborted) setFacetError(true);
      });
    return () => c.abort();
  }, [retry]);
  useEffect(() => {
    if (!ready || !isCatalogConfigured()) return;
    const c = new AbortController();
    setLoading(true);
    setError("");
    const timer = window.setTimeout(() => {
      const p = new URLSearchParams();
      if (filters.query) p.set("q", filters.query);
      if (filters.category) p.set("category", filters.category);
      if (filters.region) p.set("region", filters.region);
      if (filters.family) p.set("family", filters.family);
      if (filters.page > 1) p.set("page", String(filters.page));
      window.history.replaceState(
        null,
        "",
        window.location.pathname + (p.size ? "?" + p : ""),
      );
      fetchCatalogPage(filters, c.signal)
        .then((data) => {
          if (!c.signal.aborted) setResult(data);
        })
        .catch((e) => {
          if (!c.signal.aborted)
            setError(e instanceof Error ? e.message : "Falha de conexão.");
        })
        .finally(() => {
          if (!c.signal.aborted) setLoading(false);
        });
    }, 250);
    return () => {
      c.abort();
      window.clearTimeout(timer);
    };
  }, [filters, ready, retry]);
  const change = (
    field: "query" | "category" | "region" | "family",
    value: string,
  ) => setFilters((f) => ({ ...f, [field]: value, page: 1 }));
  const pages = Math.max(1, Math.ceil(result.total / 24));
  const move = (page: number) => {
    setFilters((f) => ({ ...f, page }));
    resultsRef.current?.focus();
  };
  return (
    <div className="catalog">
      <div className="catalog-filters">
        <label className="field">
          Buscar por nome, Hangul ou nome alternativo
          <input
            type="search"
          disabled={!ready}
            maxLength={200}
            value={filters.query}
            onChange={(e) => change("query", e.target.value)}
            placeholder="Nome da técnica, coreano ou tradução"
            autoComplete="off"
          />
        </label>
        <label className="field">
          Categoria
          <select
            disabled={!ready}
            value={filters.category}
            onChange={(e) => change("category", e.target.value)}
          >
            <option value="">Todas as categorias</option>
            {facets.categories.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
            {filters.category &&
              !facets.categories.includes(filters.category) && (
                <option value={filters.category}>{filters.category}</option>
              )}
          </select>
        </label>
        <label className="field">
          Região corporal
          <select
            disabled={!ready}
            value={filters.region}
            onChange={(e) => change("region", e.target.value)}
          >
            <option value="">Todas as regiões</option>
            {facets.regions.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.name_pt}
              </option>
            ))}
            {filters.region &&
              !facets.regions.some((r) => r.slug === filters.region) && (
                <option value={filters.region}>{filters.region}</option>
              )}
          </select>
        </label>
        <label className="field">
          Família técnica
          <select
            disabled={!ready}
            value={filters.family}
            onChange={(e) => change("family", e.target.value)}
          >
            <option value="">Todas as famílias</option>
            {facets.families.map((f) => (
              <option key={f.slug} value={f.slug}>
                {f.romanization}
              </option>
            ))}
            {filters.family &&
              !facets.families.some((f) => f.slug === filters.family) && (
                <option value={filters.family}>{filters.family}</option>
              )}
          </select>
        </label>
      </div>
      {!isCatalogConfigured() ? (
        <div className="empty" role="status">
          <strong>Catálogo ainda não conectado nesta versão.</strong>
          <p>
            Os registros publicados aparecerão quando a conexão pública estiver
            configurada.
          </p>
        </div>
      ) : (
        <>
          {facetError && (
            <p role="alert">
              Os filtros não puderam ser carregados.{" "}
              <button onClick={() => setRetry((n) => n + 1)}>
                Tentar novamente
              </button>
            </p>
          )}
          <p
            ref={resultsRef}
            tabIndex={-1}
            role="status"
            className="results-count"
          >
            {loading
              ? "Consultando registros publicados..."
              : error
                ? "Consulta interrompida."
                : `${result.total} registro(s) encontrado(s). Página ${filters.page} de ${pages}.`}
          </p>
          {error ? (
            <div className="empty" role="alert">
              <strong>Não foi possível carregar o catálogo.</strong>
              <p>{error}</p>
              <button onClick={() => setRetry((n) => n + 1)}>
                Tentar novamente
              </button>
            </div>
          ) : !loading && result.items.length === 0 ? (
            <div className="empty">
              <strong>
                {filters.query ||
                filters.category ||
                filters.region ||
                filters.family
                  ? "Nenhum resultado para os filtros escolhidos."
                  : "Conheça as famílias técnicas."}
              </strong>
              <p>Explore o atlas corporal ou os currículos compartilhados pelas escolas para conhecer outros conteúdos.</p>
              <div className="actions">
                <a href="/atlas" className="inline-link">Explorar atlas corporal →</a>
                <a href="/curriculos" className="inline-link">Consultar currículos →</a>
              </div>
              {!filters.query && !filters.category && !filters.region && !filters.family && (
                <section className="section-inner" aria-label="Introdução às famílias de movimentos">
                  <h3>Entenda os grupos de movimentos</h3>
                  <p>Conheça a organização geral dos movimentos do Taekwondo.</p>
                  <div className="grid">
                    {movementGroups.map(group=><article className="card" key={group.name}>
                      <p className="tag">{group.name}</p>
                      <h4>{group.title}</h4>
                      <p>{group.description}</p>
                    </article>)}
                  </div>
                  <p className="fine-print">Panorama das famílias de movimentos do Taekwondo. <a href={movementSource} target="_blank" rel="noreferrer">Fonte de referência: publicação de pesquisa da Kukkiwon</a>.</p>
                  <a href="/fundamentos/alturas-e-direcoes" className="inline-link">Estudar alturas e direções →</a>
                </section>
              )}
              {filters.page > 1 && (
                <button onClick={() => move(1)}>
                  Voltar à primeira página
                </button>
              )}
            </div>
          ) : (
            !loading && (
              <div className="grid" aria-label="Resultados do catálogo">
                {result.items.map((t) => (
                  <a
                    className="card term-card"
                    key={t.id}
                    href={"/tecnica?slug=" + encodeURIComponent(t.slug)}
                  >
                    <small>
                      {t.category}
                    </small>
                    <h2>{t.romanization}</h2>
                    {t.hangul && <p lang="ko">{t.hangul}</p>}
                    {t.translation_pt && <p>{t.translation_pt}</p>}
                    <span className="inline-link">
                      Consultar ficha e fontes →
                    </span>
                  </a>
                ))}
              </div>
            )
          )}
          {!error && result.total > 24 && (
            <nav className="pagination" aria-label="Paginação do catálogo">
              <button
                disabled={loading || filters.page <= 1}
                onClick={() => move(filters.page - 1)}
              >
                Página anterior
              </button>
              <span>
                Página {filters.page} de {pages}
              </span>
              <button
                disabled={loading || filters.page >= pages}
                onClick={() => move(filters.page + 1)}
              >
                Próxima página
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
