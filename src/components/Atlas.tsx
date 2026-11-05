import { useEffect, useRef, useState } from "react";
import {
  fetchRegion,
  fetchRegions,
  fetchRegionTerms,
  isCatalogConfigured,
  type BodyRegion,
  type RegionTerm,
} from "../lib/catalog-api";
import BodyMap, { areas, isArea, type Area, type View } from "./atlas/BodyMap";
import DetailMap from "./atlas/DetailMap";
import TermContext from "./TermContext";
import { surfaces } from "./atlas/surfaces";
type Location = {
  area: Area;
  region: string | null;
  view: View;
  detailView: View;
  zoom: boolean;
};
const initial: Location = {
  area: "hands",
  region: null,
  view: "front",
  detailView: "front",
  zoom: false,
};
const relationLabels = {
  surface: "Superfície de contato",
  target: "Alvo",
  movement: "Movimento",
  anatomy: "Parte anatômica",
  other: "Outro vínculo",
};
export default function Atlas() {
  const [location, setLocation] = useState<Location>(initial),
    [ready, setReady] = useState(false);
  const [hovered, setHovered] = useState<Area | null>(null),
    [regions, setRegions] = useState<BodyRegion[]>([]);
  const [links, setLinks] = useState<RegionTerm[]>([]),
    [loading, setLoading] = useState(false),
    [linksLoading, setLinksLoading] = useState(false);
  const [error, setError] = useState(""),
    [linkError, setLinkError] = useState(""),
    [notice, setNotice] = useState(""),
    [retry, setRetry] = useState(0);
  const [contextSlug, setContextSlug] = useState<string | null>(null);
  const zoomButton = useRef<HTMLButtonElement>(null);
  const previousZoom = useRef(false);
  useEffect(() => {
    if (previousZoom.current && !location.zoom) zoomButton.current?.focus();
    previousZoom.current = location.zoom;
  }, [location.zoom]);
  useEffect(() => {
    let controller: AbortController;
    async function sync() {
      setContextSlug(null);
      controller?.abort();
      const currentController = new AbortController();
      controller = currentController;
      const p = new URLSearchParams(window.location.search),
        region = p.get("region"),
        view = p.get("view") === "back" ? "back" : "front";
      setNotice("");
      setReady(false);
      if (!region || isArea(region)) {
        setLocation({
          ...initial,
          area: region && isArea(region) ? region : "hands",
          view,
          zoom: p.get("zoom") === "1",
          detailView: p.get("detail") === "back" ? "back" : "front",
        });
        setReady(true);
        return;
      }
      if (!isCatalogConfigured()) {
        setLocation({ ...initial, view });
        setNotice("Região não encontrada ou ainda não publicada.");
        setReady(true);
        return;
      }
      try {
        const data = await fetchRegion(region, currentController.signal);
        if (currentController.signal.aborted) return;
        const detail = p.get("detail");
        if (data && isArea(data.atlas_area))
          setLocation({
            area: data.atlas_area,
            region: data.slug,
            view,
            zoom: true,
            detailView:
              detail === "front" || detail === "back"
                ? detail
                : data.detail_view === "back"
                  ? "back"
                  : "front",
          });
        else {
          setLocation({ ...initial, view });
          setNotice("Região não encontrada ou ainda não publicada.");
        }
      } catch {
        if (!currentController.signal.aborted) {
          setLocation({ ...initial, view });
          setNotice("Não foi possível carregar o link da região.");
        }
      } finally {
        if (!currentController.signal.aborted) setReady(true);
      }
    }
    void sync();
    window.addEventListener("popstate", sync);
    return () => {
      controller?.abort();
      window.removeEventListener("popstate", sync);
    };
  }, [retry]);
  const navigate = (next: Location) => {
    setLocation(next);
    setHovered(null);
    setNotice("");
    const p = new URLSearchParams({
      region: next.region || next.area,
      view: next.view,
    });
    if (next.zoom) {
      p.set("zoom", "1");
      p.set("detail", next.detailView);
    }
    window.history.pushState(null, "", window.location.pathname + "?" + p);
  };
  useEffect(() => {
    if (!ready || !isCatalogConfigured()) return;
    const c = new AbortController();
    setLoading(true);
    setError("");
    setRegions([]);
    setLinks([]);
    fetchRegions(location.area, c.signal)
      .then((data) => {
        if (!c.signal.aborted) setRegions(data);
      })
      .catch(() => {
        if (!c.signal.aborted)
          setError("Não foi possível carregar as regiões publicadas.");
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false);
      });
    return () => c.abort();
  }, [location.area, ready, retry]);
  const selected = regions.find((r) => r.slug === location.region) || null;
  useEffect(() => {
    setLinks([]);
    setLinkError("");
    setLinksLoading(false);
    if (!selected) return;
    const c = new AbortController();
    setLinksLoading(true);
    fetchRegionTerms(selected.id, c.signal)
      .then((data) => {
        if (!c.signal.aborted) setLinks(data);
      })
      .catch(() => {
        if (!c.signal.aborted)
          setLinkError("Não foi possível carregar as técnicas associadas.");
      })
      .finally(() => {
        if (!c.signal.aborted) setLinksLoading(false);
      });
    return () => c.abort();
  }, [selected?.id, retry]);
  const close = () => navigate({ ...location, zoom: false, region: null });
  const choose = (area: Area) =>
    navigate({ ...location, area, region: null, zoom: false });
  const chooseRegion = (region: BodyRegion) => {
    setContextSlug(null);
    const view = surfaces[region.slug]?.view || region.detail_view;
    navigate({
      ...location,
      region: region.slug,
      zoom: true,
      view:
        ["arms", "legs"].includes(location.area) && view !== "both" && view
          ? view
          : location.view,
      detailView:
        view === "back"
          ? "back"
          : view === "front"
            ? "front"
            : location.detailView,
    });
  };
  const area = areas.find((a) => a.id === location.area)!;
  const preview = areas.find((a) => a.id === (hovered || location.area))!;
  return (
    <div
      className="atlas-layout"
      onKeyDown={(e) => {
        if (e.key === "Escape" && (location.zoom || location.region)) {
          e.preventDefault();
          close();
        }
      }}
    >
      <section
        className="card atlas-figure"
        aria-label="Explorar o mapa corporal"
        inert={!ready}
        aria-busy={!ready}
      >
        <div
          className="atlas-controls"
          role="group"
          aria-label="Vista do corpo"
        >
          <button
            aria-label="Vista anterior"
            aria-pressed={location.view === "front"}
            onClick={() => navigate({ ...location, view: "front" })}
          >
            Frente
          </button>
          <button
            aria-label="Vista posterior"
            aria-pressed={location.view === "back"}
            onClick={() => navigate({ ...location, view: "back" })}
          >
            Costas
          </button>
        </div>
        <p className="fine-print">
          Ilustração esquemática original · orientação didática
        </p>
        {location.zoom &&
        (location.area === "hands" || location.area === "feet") ? (
          <>
            <div
              className="atlas-controls"
              role="group"
              aria-label="Vista do detalhe"
            >
              <button
                aria-pressed={location.detailView === "front"}
                onClick={() => navigate({ ...location, detailView: "front" })}
              >
                {location.area === "hands" ? "Palma" : "Planta"}
              </button>
              <button
                aria-pressed={location.detailView === "back"}
                onClick={() => navigate({ ...location, detailView: "back" })}
              >
                Dorso
              </button>
            </div>
            <DetailMap
              area={location.area}
              view={location.detailView}
              regions={regions}
              selected={location.region}
              onSelect={chooseRegion}
            />
          </>
        ) : (
          <BodyMap
            view={location.view}
            selected={location.area}
            hovered={hovered}
            zoom={location.zoom}
            onSelect={choose}
            onHover={setHovered}
            regions={regions}
            selectedRegion={location.region}
            onSelectRegion={chooseRegion}
          />
        )}
        <p className="atlas-preview" aria-live="polite">
          <strong>{preview.title}</strong> · {preview.summary}
        </p>
        <div className="atlas-controls" role="group" aria-label="Ampliação">
          <button
            ref={zoomButton}
            onClick={() => navigate({ ...location, zoom: true })}
            hidden={location.zoom}
          >
            Ampliar região
          </button>
          {location.zoom && (
            <button onClick={close}>Voltar ao corpo inteiro</button>
          )}
        </div>
        <div
          className="atlas-controls area-list"
          role="group"
          aria-label="Escolher área do corpo"
        >
          {areas.map((a) => (
            <button
              key={a.id}
              aria-pressed={location.area === a.id}
              onClick={() => choose(a.id)}
            >
              {a.title}
            </button>
          ))}
        </div>
        <p className="fine-print">
          Tab navega; Enter ou Espaço selecionam. Escape retorna ao corpo
          inteiro. No celular, toque nas áreas ou nos botões.
        </p>
      </section>
      <section
        className="card atlas-information"
        aria-label="Informações da região"
        aria-busy={loading || linksLoading}
      >
        <p className="tag">Exploração corporal</p>
        <h2>{selected?.name_pt || area.title}</h2>
        <p>{area.summary}</p>
        {notice && <p role="status">{notice}</p>}
        {!isCatalogConfigured() ? (
          <div className="empty" role="status">
            Atlas ainda não conectado nesta versão. Nenhum conteúdo técnico é
            exibido sem dados publicados.
          </div>
        ) : !ready || loading ? (
          <p role="status">Carregando regiões publicadas...</p>
        ) : error ? (
          <div role="alert">
            <p>{error}</p>
            <button onClick={() => setRetry((n) => n + 1)}>
              Tentar novamente
            </button>
          </div>
        ) : regions.length === 0 ? (
          <p>Nenhuma região técnica validada e publicada nesta área ainda.</p>
        ) : (
          <>
            <h3>Superfícies e regiões</h3>
            <ul className="region-list">
              {regions.map((r) => (
                <li key={r.id}>
                  <button
                    aria-pressed={location.region === r.slug}
                    onClick={() => chooseRegion(r)}
                  >
                    {r.name_pt}
                  </button>
                </li>
              ))}
            </ul>
            {selected ? (
              <section aria-label="Técnicas associadas">
                <TermContext slug={contextSlug || selected.slug} />
                <h3>Relações com o catálogo</h3>
                {linksLoading ? (
                  <p role="status">Carregando técnicas associadas...</p>
                ) : linkError ? (
                  <div role="alert">
                    <p>{linkError}</p>
                    <button onClick={() => setRetry((n) => n + 1)}>
                      Tentar novamente
                    </button>
                  </div>
                ) : links.filter((l) => l.technical_terms).length === 0 ? (
                  <p>
                    Nenhuma técnica publicada associada a esta região ainda.
                  </p>
                ) : (
                  <ul>
                    {links
                      .filter((l) => l.technical_terms)
                      .map((l) => (
                        <li key={l.term_id + l.usage_context}>
                          <a
                            href={
                              "/tecnica?slug=" +
                              encodeURIComponent(l.technical_terms!.slug)
                            }
                          >
                            {l.technical_terms!.romanization}
                          </a>
                          <button
                            className="context-link"
                            onClick={() =>
                              setContextSlug(l.technical_terms!.slug)
                            }
                          >
                            Ver aqui: {l.technical_terms!.romanization}
                          </button>
                          {l.technical_terms!.translation_pt &&
                            " — " + l.technical_terms!.translation_pt}
                          <span className="relationship-label">
                            {
                              relationLabels[
                                l.anatomical_role || l.usage_context
                              ]
                            }
                          </span>
                        </li>
                      ))}
                  </ul>
                )}
                <a
                  href={"/catalogo?region=" + encodeURIComponent(selected.slug)}
                >
                  Consultar catálogo desta região
                </a>
              </section>
            ) : (
              <p>
                Selecione uma região para consultar seus vínculos com técnicas.
              </p>
            )}
          </>
        )}
        <p className="fine-print">
          Os nomes técnicos vêm do catálogo publicado. Áreas sem revisão
          permanecem vazias. A posição gráfica é aproximada e não representa uma
          ilustração oficial da Kukkiwon.
        </p>
      </section>
    </div>
  );
}
