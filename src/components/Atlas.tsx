import { useEffect, useRef, useState, type ReactNode } from "react";
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
import BodyRegionMap from "./atlas/BodyRegionMap";
import TermContext from "./TermContext";
import { surfaces } from "./atlas/surfaces";
import { bodyZones } from "./atlas/zones";
import { anatomicalNeighbors } from "./atlas/anatomical-neighbors";
import AtlasRelations, {regionContextSlug} from './AtlasRelations';
import { getHandRegion, getHandRegionForTerm, getHandTerm, getHandTermForRegion,
  handAtlasRegions, handRegionDescription } from '../lib/public-hand';
import { PublicHandIndex, PublicHandRegionInspector, PublicHandTerm } from './atlas/PublicHandContent';
import { fingerAnatomyGuides } from '../data/sonkisul-finger-guide';
import { footAtlasRegions, getPublicFootRegion } from '../lib/public-foot';
import PublicFootRegionInspector from './atlas/PublicFootContent';
import { armAtlasRegions, getArmAtlasRegion } from '../lib/public-arm';
import PublicArmRegionInspector from './atlas/PublicArmContent';
import { getHeadAtlasRegion, headAtlasRegions } from '../lib/public-head';
import PublicHeadRegionInspector from './atlas/PublicHeadContent';
import { getTorsoAtlasRegion, torsoAtlasRegions } from '../lib/public-torso';
import PublicTorsoRegionInspector from './atlas/PublicTorsoContent';
import { getLegsAtlasRegion, legsAtlasRegions } from '../lib/public-legs';
import PublicLegsRegionInspector from './atlas/PublicLegsContent';
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

function parseView(value: string | null | undefined, fallback: View = "front"): View {
  if (value === "back") return "back";
  if (value === "front") return "front";
  return fallback;
}

const curatedBodyLookups: readonly {
  area: Area;
  find: (slug: string) => BodyRegion | undefined;
}[] = [
  { area: "arms", find: getArmAtlasRegion },
  { area: "head", find: getHeadAtlasRegion },
  { area: "torso", find: getTorsoAtlasRegion },
  { area: "legs", find: getLegsAtlasRegion },
];

const staticAreas = new Set<Area>(["feet", "arms", "head", "torso", "legs"]);

const publicRegionsByArea: Partial<Record<Area, BodyRegion[]>> = {
  feet: footAtlasRegions,
  arms: armAtlasRegions,
  head: headAtlasRegions,
  torso: torsoAtlasRegions,
  legs: legsAtlasRegions,
};

function resolveStaticAtlasLocation(
  region: string,
  viewParam: string | null,
  detail: string | null,
): Location | null {
  const view = parseView(viewParam);
  const detailView = parseView(detail);
  if (getHandRegion(region)) {
    return { area: "hands", region, view, zoom: true, detailView };
  }
  if (getPublicFootRegion(region)) {
    const fallbackDetail = parseView(surfaces[region]?.view);
    return { area: "feet", region, view, zoom: true, detailView: parseView(detail, fallbackDetail) };
  }
  for (const entry of curatedBodyLookups) {
    const matched = entry.find(region);
    if (matched) {
      const defaultView = parseView(matched.detail_view);
      return {
        area: entry.area,
        region: matched.slug,
        view: parseView(viewParam, defaultView),
        zoom: true,
        detailView: "front",
      };
    }
  }
  const bodyZone = bodyZones.find((z) => z.regionSlug === region);
  if (bodyZone) {
    return {
      area: bodyZone.area,
      region,
      view: bodyZone.view === "both" ? view : bodyZone.view,
      zoom: true,
      detailView,
    };
  }
  return null;
}

function CatalogAreaLinks({
  links,
  linksLoading,
  linkError,
  onPreview,
  onRetry,
}: Readonly<{
  links: RegionTerm[];
  linksLoading: boolean;
  linkError: string;
  onPreview: (slug: string | null) => void;
  onRetry: () => void;
}>) {
  if (linksLoading) return <p role="status">Carregando técnicas associadas...</p>;
  if (linkError) {
    return (
      <div role="alert">
        <p>{linkError}</p>
        <button onClick={onRetry}>Tentar novamente</button>
      </div>
    );
  }
  if (links.filter((l) => l.technical_terms).length === 0) {
    return (
      <p>
        As técnicas associadas a esta região aparecerão após a conferência das referências.
      </p>
    );
  }
  return <AtlasRelations links={links} onPreview={onPreview} />;
}

function AtlasCatalogSidebar({
  ready,
  loading,
  error,
  regions,
  selected,
  selectedRegionSlug,
  selectedContextSlug,
  links,
  linksLoading,
  linkError,
  onRetry,
  onChooseRegion,
  onPreview,
}: Readonly<{
  ready: boolean;
  loading: boolean;
  error: string;
  regions: BodyRegion[];
  selected: BodyRegion | null;
  selectedRegionSlug: string | null;
  selectedContextSlug: string | null;
  links: RegionTerm[];
  linksLoading: boolean;
  linkError: string;
  onRetry: () => void;
  onChooseRegion: (region: BodyRegion) => void;
  onPreview: (slug: string | null) => void;
}>) {
  if (!isCatalogConfigured()) {
    return (
      <div className="empty" role="status">
        Atlas ainda não conectado nesta versão. Nenhum conteúdo técnico é
        exibido sem dados publicados.
      </div>
    );
  }
  if (!ready || loading) return <p role="status">Carregando regiões publicadas...</p>;
  if (error) {
    return (
      <div role="alert">
        <p>{error}</p>
        <button onClick={onRetry}>Tentar novamente</button>
      </div>
    );
  }
  if (regions.length === 0) {
    return (
      <p>
        As nomenclaturas desta área serão adicionadas à medida que forem conferidas. Você já pode explorar as outras regiões do corpo.
      </p>
    );
  }
  return (
    <>
      <h3>Superfícies e regiões</h3>
      <ul className="region-list">
        {regions.map((r) => (
          <li key={r.id}>
            <button
              aria-pressed={selectedRegionSlug === r.slug}
              onClick={() => onChooseRegion(r)}
            >
              {r.name_pt}
            </button>
          </li>
        ))}
      </ul>
      {selected ? (
        <section aria-label="Técnicas associadas">
          {selectedContextSlug && <TermContext slug={selectedContextSlug} />}
          <h3>Relações com o catálogo</h3>
          <CatalogAreaLinks
            links={links}
            linksLoading={linksLoading}
            linkError={linkError}
            onPreview={onPreview}
            onRetry={onRetry}
          />
          <a href={"/catalogo?region=" + encodeURIComponent(selected.slug)}>
            Consultar catálogo desta região
          </a>
        </section>
      ) : (
        <p>Selecione uma região para consultar seus vínculos com técnicas.</p>
      )}
    </>
  );
}

const areaStudyLinks: Record<Exclude<Area, "hands">, readonly { href: string; label: string }[]> = {
  feet: [
    { href: "/biblioteca/balkisul", label: "Explorar superfícies do pé e chutes em Balkisul →" },
    { href: "/acervo?categoria=chute", label: "Consultar registros de chutes no Acervo →" },
  ],
  legs: [
    { href: "/biblioteca/balkisul", label: "Estudar chutes e superfícies em Balkisul →" },
    { href: "/biblioteca/kibon-dongjak", label: "Consultar bases (Seogi) em Kibon Dongjak →" },
  ],
  arms: [
    { href: "/biblioteca/kibon-dongjak", label: "Estudar defesas, socos e golpes em Kibon Dongjak →" },
    { href: "/biblioteca/sonkisul", label: "Explorar mãos e punhos em Sonkisul →" },
  ],
  head: [
    { href: "/fundamentos/alturas-e-direcoes", label: "Estudar alturas e direções nos Fundamentos →" },
    { href: "/biblioteca/kibon-dongjak/kibon-alturas-direcoes", label: "Consultar alturas e direções na Biblioteca →" },
  ],
  torso: [
    { href: "/fundamentos/alturas-e-direcoes", label: "Estudar alturas e direções nos Fundamentos →" },
    { href: "/biblioteca/kibon-dongjak", label: "Consultar defesas e ataques de tronco em Kibon Dongjak →" },
  ],
};

function AnatomicalConnections({ slug }: Readonly<{ slug: string }>) {
  const neighbors = anatomicalNeighbors[slug];
  if (!neighbors?.length) return null;
  return (
    <nav aria-label="Comparar recortes anatômicos">
      <strong>Regiões próximas</strong>
      <ul className="related-list">
        {neighbors.map(({ slug, label }) => (
          <li key={slug}><a className="inline-link" href={`/atlas?region=${slug}&zoom=1`}>{label}</a></li>
        ))}
      </ul>
    </nav>
  );
}

function renderBodyRegionInspector(area: Area, region: BodyRegion, view: View): ReactNode {
  if (area === "arms") return <PublicArmRegionInspector region={region} />;
  if (area === "head") return <PublicHeadRegionInspector region={region} view={view} />;
  if (area === "torso") return <PublicTorsoRegionInspector region={region} view={view} />;
  if (area === "legs") return <PublicLegsRegionInspector region={region} view={view} />;
  return null;
}

export default function Atlas() {
  const [location, setLocation] = useState<Location>(initial),
    [ready, setReady] = useState(false);
  const [hovered, setHovered] = useState<Area | null>(null),
    [catalogRegions, setRegions] = useState<BodyRegion[]>([]);
  const [links, setLinks] = useState<RegionTerm[]>([]),
    [loading, setLoading] = useState(false),
    [linksLoading, setLinksLoading] = useState(false);
  const [error, setError] = useState(""),
    [linkError, setLinkError] = useState(""),
    [notice, setNotice] = useState(""),
    [retry, setRetry] = useState(0);
  const [contextSlug, setContextSlug] = useState<string | null>(null);
  const [handTermSlug, setHandTermSlug] = useState<string | null>(null);
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
        setHandTermSlug(region === 'hands' && getHandTerm(p.get('term')) ? p.get('term') : null);
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
      setHandTermSlug(null);
      const detail = p.get("detail");
      const staticLoc = resolveStaticAtlasLocation(region, p.get("view"), detail);
      if ((staticLoc && staticAreas.has(staticLoc.area)) || !isCatalogConfigured()) {
        if (staticLoc) {
          setLocation(staticLoc);
        } else {
          setLocation({ ...initial, view });
          setNotice("Região não encontrada ou ainda não publicada.");
        }
        setReady(true);
        return;
      }
      try {
        const data = await fetchRegion(region, currentController.signal);
        if (currentController.signal.aborted) return;
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
          if (staticLoc) {
            setLocation(staticLoc);
          } else {
            setLocation({ ...initial, view });
            setNotice("Região não encontrada ou ainda não publicada.");
          }
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
  const navigate = (next: Location, termSlug: string | null = null) => {
    setHandTermSlug(termSlug);
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
    if (next.area === 'hands' && termSlug && getHandTerm(termSlug)) p.set('term', termSlug);
    window.history.pushState(null, "", window.location.pathname + "?" + p);
  };
  const curatedFoot = location.area === 'feet';
  const publicRegions = publicRegionsByArea[location.area];
  const regions = publicRegions ?? catalogRegions;
  useEffect(() => {
    if (!ready) return;
    if (publicRegions || !isCatalogConfigured()) {
      setRegions(location.area === 'hands' ? handAtlasRegions : []);
      setLinks([]);
      setError('');
      setLoading(false);
      return;
    }
    const c = new AbortController();
    setLoading(true);
    setError("");
    setRegions([]);
    setLinks([]);
    fetchRegions(location.area, c.signal)
      .then((data) => {
        if (!c.signal.aborted) setRegions(location.area === 'hands' && data.length === 0 ? handAtlasRegions : data);
      })
      .catch(() => {
        if (!c.signal.aborted) {
          if (location.area === 'hands') setRegions(handAtlasRegions);
          else setError("Não foi possível carregar as regiões publicadas.");
        }
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false);
      });
    return () => c.abort();
  }, [publicRegions, location.area, ready, retry]);
  const selected = regions.find((r) => r.slug === location.region) || null;
  // The existing published catalog keeps precedence when it returns real records.
  const curatedHand = location.area === 'hands' &&
    (!isCatalogConfigured() || regions.some(r => r.id.startsWith('hand-')));
  const selectedContextSlug = contextSlug || (selected ? regionContextSlug(selected.slug,links) : null);
  useEffect(() => {
    setLinks([]);
    setLinkError("");
    setLinksLoading(false);
    if (!selected || curatedHand || publicRegions) return;
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
  }, [selected?.id, curatedHand, publicRegions, retry]);
  const close = () => navigate({ ...location, zoom: false, region: null });
  const choose = (area: Area) =>
    navigate({ ...location, area, region: null, zoom: false });
  const chooseHandTerm = (termSlug: string) => {
    const region = getHandRegionForTerm(termSlug);
    if (region) {
      const bodyRegion = handAtlasRegions.find(r => r.slug === region.slug);
      if (bodyRegion) {
        chooseRegion(bodyRegion);
        return;
      }
    }
    navigate({ ...location, area: 'hands', region: null, zoom: true }, termSlug);
  };
  const chooseRegion = (region: BodyRegion) => {
    setContextSlug(null);
    const view = surfaces[region.slug]?.view || region.detail_view;
    navigate({
      ...location,
      region: region.slug,
      zoom: true,
      view:
        !["hands", "feet"].includes(location.area) && view !== "both" && view
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
  const hasCuratedBodyInspector =
    location.area === "arms" || location.area === "head" || location.area === "torso" || location.area === "legs";
  const renderBodyInspection = hasCuratedBodyInspector
    ? (region: BodyRegion) => (
        <>
          {renderBodyRegionInspector(location.area, region, location.view)}
          <AnatomicalConnections slug={region.slug} />
        </>
      )
    : undefined;
  let renderDetailInspection: ((region: BodyRegion) => ReactNode) | undefined;
  if (curatedFoot) renderDetailInspection = (region) => (
    <>
      <PublicFootRegionInspector region={region} view={location.detailView} />
      <AnatomicalConnections slug={region.slug} />
    </>
  );
  else if (curatedHand) renderDetailInspection = (region) => <PublicHandRegionInspector regionSlug={region.slug} />;
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
        {!(location.zoom && ["hands","feet"].includes(location.area)) && <div
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
        </div>}
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
              renderInspection={renderDetailInspection}
            />
          </>
        ) : location.zoom ? (
          <BodyRegionMap
            area={location.area}
            view={location.view}
            regions={regions}
            selected={location.region}
            onSelect={chooseRegion}
            renderInspection={renderBodyInspection}
          />
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
          Use a legenda colorida para encontrar uma zona, ou toque diretamente no desenho. No teclado, use Tab e Enter ou Espaço; Escape retorna ao corpo inteiro.
        </p>
      </section>
      <section
        className="card atlas-information"
        aria-label="Informações da região"
        inert={!ready}
        aria-busy={!ready || loading || linksLoading}
      >
        <p className="tag">Exploração corporal</p>
        <h2>{curatedHand || publicRegions ? area.title : selected?.name_pt || area.title}</h2>
        <p>{curatedHand ? 'Selecione uma região no desenho ou busque um termo pelo nome.' : area.summary}</p>
        {notice && <p role="status">{notice}</p>}
        {curatedHand && (
          <>
            {selected && <section className="hand-current-region" aria-label="Informações da área escolhida">
              {!getHandTermForRegion(selected.slug) && <><h3>{selected.name_pt}</h3>
                {handRegionDescription(selected.slug) && <p>{handRegionDescription(selected.slug)}</p>}
                {fingerAnatomyGuides[selected.slug] && (
                  <div className="finger-anatomy-guide">
                    <p className="fine-print">
                      <strong>Articulações:</strong> {fingerAnatomyGuides[selected.slug].jointsLabel}
                    </p>
                    <p>{fingerAnatomyGuides[selected.slug].anatomySummary}</p>
                    <p className="fine-print">
                      <strong>Configurações relacionadas na Biblioteca:</strong>
                    </p>
                    <ul className="related-list">
                      {fingerAnatomyGuides[selected.slug].relatedConfigSlugs.map((cfg) => (
                        <li key={cfg.slug}>
                          <a className="inline-link" href={`/biblioteca/sonkisul/${cfg.slug}`}>
                            {cfg.label}
                          </a>{" "}
                          — {cfg.context}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>}
              {getHandTermForRegion(selected.slug) && <PublicHandTerm term={getHandTermForRegion(selected.slug)!} />}
            </section>}
            <PublicHandIndex selectedTerm={handTermSlug || getHandTermForRegion(selected?.slug)?.slug || null}
              onSelect={chooseHandTerm} disabled={!ready}/>
          </>
        )}
        {curatedFoot && (
          <>
            <p>Selecione um recorte na planta ou no dorso para consultar a região anatômica e, quando houver, o termo da superfície de contato. Em Balkisul, as técnicas de chute (Chagi) têm um grupo próprio de fichas.</p>
            <h3>Tornozelo</h3>
            <p>O tornozelo possui recorte ilustrativo selecionável na transição entre perna e pé.</p>
            <p>
              <a className="inline-link" href="/atlas?region=legs-ankle&zoom=1">
                Abrir Tornozelo no Atlas das pernas →
              </a>
            </p>
          </>
        )}
        {!curatedHand && !curatedFoot && !publicRegions && (
          <AtlasCatalogSidebar
            ready={ready}
            loading={loading}
            error={error}
            regions={regions}
            selected={selected}
            selectedRegionSlug={location.region}
            selectedContextSlug={selectedContextSlug}
            links={links}
            linksLoading={linksLoading}
            linkError={linkError}
            onRetry={() => setRetry((n) => n + 1)}
            onChooseRegion={chooseRegion}
            onPreview={setContextSlug}
          />
        )}
        {location.area !== "hands" && (
          <div className="atlas-library-bridge">
            <h3>Estudar na Biblioteca</h3>
            <ul className="related-list">
              {areaStudyLinks[location.area].map((link) => (
                <li key={link.href}>
                  <a className="inline-link" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="fine-print">
          As áreas coloridas são ilustrações didáticas esquemáticas, independentes da Kukkiwon.
        </p>
      </section>
    </div>
  );
}
