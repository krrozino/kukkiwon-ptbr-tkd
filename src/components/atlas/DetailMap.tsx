import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { BodyRegion } from "../../lib/catalog-api";
import type { View } from "./BodyMap";
import { handOutline, footOutline, fistOutline, surfaces } from "./surfaces";
import { zonesFor } from "./zones";
import { zoneCopy } from "./zone-copy";
import { useTermDetail } from "../TermContext";
import AtlasSourceEvidence from "./AtlasSourceEvidence";
type Props = {
  area: "hands" | "feet";
  view: View;
  regions: BodyRegion[];
  selected: string | null;
  onSelect: (r: BodyRegion) => void;
  /** An isolated consumer may supply its own inspector without changing geometry/public data. */
  renderInspection?: (region: BodyRegion) => ReactNode;
};
function anatomyLinesPath(hand: boolean, fist: boolean, view: View): string {
  if (!hand) {
    return view === "front"
      ? "M27 34 Q34 37 41 33 M47 32 L56 33 M63 37 L70 39 M77 42 L82 44 M29 58 Q49 68 77 58 M36 77 Q44 90 37 103 M38 120 Q49 116 60 121"
      : "M32 43 L45 104 M48 44 L52 105 M64 46 L59 105 M35 115 Q49 111 64 115 M27 27 L38 28 M48 30 L56 31 M63 36 L70 38 M77 42 L82 44";
  }
  if (fist) {
    return view === "front"
      ? "M 32 34 L 32 67 M 50 31 L 49 69 M 65 35 L 63 71 M 19 52 Q 46 55 77 52 M 16 64 Q 32 57 52 67 Q 59 71 57 79 Q 54 85 42 83 L 22 79 M 38 64 Q 36 72 38 80 M 30 96 Q 48 99 66 96 M 30 106 Q 49 108 68 106"
      : "M 21 41 Q 26 37 31 41 M 34 36 Q 41 31 48 36 M 51 37 Q 57.5 33.5 64 38 M 66 41 Q 72 38 77 43 M 27 44 L 35 94 M 41 39 L 44 95 M 57 41 L 53 95 M 71 46 L 62 94 M 29 105 Q 49 103 68 105";
  }
  return view === "front"
    ? "M 27.5 29 Q 32 28.2 36.5 29 M 27 43 Q 32 42.2 37 43 M 39.8 23 Q 44.2 22.2 48.6 23 M 39.2 39 Q 44.2 38.2 49.2 39 M 51.5 27 Q 55.8 26.2 60 27 M 51 42 Q 55.8 41.2 60.2 42 M 63 41.5 Q 67 41 70.5 42 M 62.2 52.5 Q 66.5 52 70.8 53 M 11.5 66 Q 15 64 18.5 65.5 M 39 74 Q 51 71 62 76 M 32 70 Q 45 77 58 84 M 31 68 Q 39 81 38 96 M 35 112 Q 48 114 60 112 M 35 117 Q 48 119 59 117"
    : "M 29 23 C 29 18.5 35 18.5 35 23 Q 32 24 29 23 M 41.2 16 C 41.2 11.5 47.2 11.5 47.2 16 Q 44.2 17 41.2 16 M 52.8 20.5 C 52.8 16 58.8 16 58.8 20.5 Q 55.8 21.5 52.8 20.5 M 64.5 36.5 C 64.5 32.5 69.8 32.5 69.8 36.5 Q 67.2 37.3 64.5 36.5 M 10 62 C 9.2 58 12.8 56.2 14.8 59.5 Q 12.5 61.5 10 62 M 28 30 Q 32 29 36 30 M 27.5 43 Q 32 42 36.5 43 M 40 24 Q 44.2 23 48.4 24 M 39.5 39 Q 44.2 38 49 39 M 51.8 28 Q 55.8 27 59.8 28 M 51.2 42 Q 55.8 41 60 42 M 63.2 42.5 Q 67 41.8 70.2 42.8 M 62.5 53 Q 66.5 52.2 70.5 53.2 M 34 64 L 40 102 M 44.2 61 L 46.5 102 M 55 63 L 52.5 102 M 65 68 L 58 102 M 35 114 Q 48 112 59 114";
}
export default function DetailMap({
  area,
  view,
  regions,
  selected,
  onSelect,
  renderInspection,
}: Props) {
  const hand = area === "hands";
  const clipId = useId().replace(/:/g, "") + "-anatomy";
  const canvasRef=useRef<HTMLDivElement>(null);
  const [placement,setPlacement]=useState<"side"|"below">("below");
  const [hover, setHover] = useState<BodyRegion | null>(null),
    [visualSelection, setVisualSelection] = useState<string | null>(null),
    [fist, setFist] = useState(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const published = new Set(regions.map(r => r.slug));
  // Only public records can resolve official/technical text.
  const activeSlug = visualSelection || selected;
  // Keep the panel visible after tapping: mouse hover only changes the preview.
  const catalogSlug = renderInspection ? null : hover && published.has(hover.slug)
    ? hover.slug : (activeSlug && published.has(activeSlug) ? activeSlug : null);
  const { detail } = useTermDetail(catalogSlug);
  useEffect(() => {
    setVisualSelection(null);
    if (selected) setFist(!!surfaces[selected]?.posture);
  }, [selected]);
  useEffect(() => () => clearTimeout(exitTimer.current), []);
  useEffect(() => {
    setHover(null);
    setVisualSelection(null);
  }, [area, view]);
  // Reserve a separate region for the tooltip: never cover the anatomical surface.
  useEffect(()=>{
    const update=()=>{
      const width=canvasRef.current?.getBoundingClientRect().width ?? 0;
      setPlacement(width>=720 && window.innerWidth>=1080 ? "side" : "below");
    };
    update();
    const observer=typeof ResizeObserver!=="undefined" ? new ResizeObserver(update) : null;
    if(canvasRef.current)observer?.observe(canvasRef.current);
    window.addEventListener("resize",update);
    return ()=>{observer?.disconnect();window.removeEventListener("resize",update);};
  },[]);
  // Always draw the original colored anatomical zones, regardless of the
  // editorial status of the related term. Unpublished zones are illustrative
  // only: no Hangul, romanization, translation or technical ficha is exposed.
  const visible = zonesFor(area,view,fist).map(z=>z.id)
    .map(slug => regions.find(r => r.slug === slug) ?? ({
      id: "illustration-" + slug,
      slug,
      region_group: area,
      atlas_area: area,
      name_pt: "Recorte anatômico ilustrativo",
      detail_view: surfaces[slug].view,
      detail_x: null,
      detail_y: null,
    } satisfies BodyRegion))
    ;
  const leave = () => {
    clearTimeout(exitTimer.current);
    exitTimer.current = setTimeout(() => setHover(null), 160);
  };
  const enter = (r: BodyRegion) => {
    clearTimeout(exitTimer.current);
    setHover(r);
  };
  const previewOnFocus = (r: BodyRegion) => {
    // Tab must not replace a selected ficha before its link can receive focus.
    if (activeSlug) setHover(null);
    else enter(r);
  };
  const focused = hover || visible.find(r => r.slug === activeSlug) || null;
  const inspectedDetail = focused && detail?.term.slug === focused.slug ? detail : null;
  const anchor = focused && surfaces[focused.slug]?.anchor;
  const anchorX = anchor && (view === "back" ? 100 - anchor[0] : anchor[0]);
  const silhouette = hand ? (fist ? fistOutline : handOutline) : footOutline;
  const chooseSurface = (r: BodyRegion) => {
    enter(r);
    if (published.has(r.slug)) {
      setVisualSelection(null);
      onSelect(r);
    }
    else setVisualSelection(r.slug);
  };
  const focusName = (r: BodyRegion, index: number) =>
    published.has(r.slug) ? r.name_pt : zoneCopy[r.slug]?.title || `Região anatômica ${index + 1}`;
  return (
    <div
      ref={canvasRef}
      className={"surface-canvas placement-"+placement}
      onPointerLeave={leave}
      onPointerEnter={() => clearTimeout(exitTimer.current)}
    >
      {hand && (
        <div
          className="atlas-controls posture-switch"
          aria-label="Configuração da mão"
        >
          <button
            aria-pressed={!fist}
            onClick={() => {
              setFist(false);
              setHover(null);
            }}
          >
            Mão aberta
          </button>
          <button
            aria-pressed={fist}
            onClick={() => {
              setFist(true);
              setHover(null);
            }}
          >
            Punho
          </button>
        </div>
      )}
      <svg
        viewBox="0 0 100 140"
        className="detail-svg"
        role="group"
        aria-label="Recortes anatômicos interativos"
      >
        <defs>
          <linearGradient id={"skin-" + area} x1="0" y1="0" x2="1" y2=".7">
            <stop stopColor="#faf1e7" />
            <stop offset=".55" stopColor="#e9d9cc" />
            <stop offset="1" stopColor="#f8eee4" />
          </linearGradient>
          <clipPath id={clipId}><path d={silhouette} /></clipPath>
        </defs>
        <g className="anatomy-geometry" transform={view === "back" ? "translate(100 0) scale(-1 1)" : undefined}>
        <g
          role="img"
          aria-label={
            hand
              ? "Detalhe original da mão — " +
                (view === "front" ? "palma" : "dorso")
              : "Detalhe original do pé — " +
                (view === "front" ? "planta" : "dorso")
          }
        >
          <path
            d={silhouette}
            className="anatomy-outline"
            fill={"url(#skin-" + area + ")"}
          />
          <g className="anatomy-lines" aria-hidden="true">
            <path d={anatomyLinesPath(hand, fist, view)} />
          </g>
        </g>
        <g className="anatomy-cutouts" clipPath={`url(#${clipId})`}>
        {visible.map((r) => {
          const s = surfaces[r.slug];
          return (
            <g
              key={r.id}
              data-region={r.slug}
              role="button"
              tabIndex={0}
              aria-label={focusName(r, visible.indexOf(r))}
              aria-pressed={activeSlug === r.slug}
              aria-describedby={
                !renderInspection && focused?.slug === r.slug ? "surface-tooltip" : undefined
              }
              aria-controls={renderInspection ? "surface-tooltip" : undefined}
              className={
                "surface-cutout " + (activeSlug === r.slug ? "selected" : "")
              }
              style={{ "--surface-color": s.color } as CSSProperties}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") enter(r);
              }}
              onPointerDown={(e) => {
                // Select before the mobile browser dispatches click or scroll anchoring.
                // Do not prevent default: touch scrolling must continue working.
                if (e.pointerType === "touch" || e.pointerType === "pen") {
                  enter(r);
                  if (!published.has(r.slug)) setVisualSelection(r.slug);
                }
              }}
              onFocus={() => previewOnFocus(r)}
              onBlur={leave}
              onClick={() => chooseSurface(r)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  chooseSurface(r);
                }
              }}
            >
              <path d={s.path} />
            </g>
          );
        })}
        </g>
        <path d={silhouette} className="anatomy-edge" aria-hidden="true" />
        </g>
        {anchor && (
          <path
            key={hover?.slug}
            className="surface-connector"
            d={placement==="side"
              ? `M82 ${anchor[1]} L99 ${anchor[1]}`
              : `M${anchorX} 132 L${anchorX} 139`}
            pathLength="1"
            aria-hidden="true"
          />
        )}
      </svg>
      <section className="surface-inspector" aria-label="Detalhes da região selecionada">
        {focused ? (
          <div
            id="surface-tooltip"
            key={focused.slug}
            role={renderInspection ? "region" : "tooltip"}
            aria-label={renderInspection ? "Informações da região" : undefined}
            className={"surface-tooltip" + (published.has(focused.slug) ? "" : " surface-tooltip-compact")}
            data-placement={placement}
          >
            {renderInspection ? renderInspection(focused) : published.has(focused.slug) ? (
              <>
                <strong>{focused.name_pt}</strong>
                <span>{inspectedDetail?.term.romanization || "Identificação em consulta"}</span>
                <span lang="ko">{inspectedDetail?.term.hangul || "Hangul em consulta"}</span>
                {inspectedDetail?.term.pronunciation_pt && <span>Pronúncia: {inspectedDetail.term.pronunciation_pt}</span>}
                <small>{inspectedDetail?.term.definition_pt?.slice(0, 160) || "Consulte os vínculos desta superfície."}</small>
                <a className="inline-link" href={`/tecnica?slug=${encodeURIComponent(focused.slug)}`}>Abrir ficha técnica →</a>
                <AtlasSourceEvidence kind="technical" sources={inspectedDetail?.sources} />
              </>
            ) : (
              <>
                <strong>{zoneCopy[focused.slug]?.title || "Região anatômica ilustrativa"}</strong>
                <span>{zoneCopy[focused.slug]?.description || "Região selecionada no desenho."}</span>
                <small>Descrição anatômica para estudo. A nomenclatura técnica exige conferência documental.</small>
                <AtlasSourceEvidence kind="illustrative" />
              </>
            )}
          </div>
        ) : (
          <div className="surface-placeholder" aria-hidden="true">
            <span className="surface-placeholder-icon">◎</span>
            <strong>Explore as áreas coloridas</strong>
            <small>Passe o mouse ou selecione uma zona. No celular, um toque basta.</small>
          </div>
        )}
      </section>
      <nav className="surface-legend" aria-label="Selecionar zona ilustrada">
        <div className="surface-legend-heading">
          <strong>Mapa das áreas</strong>
          <small>{visible.length} zonas nesta vista</small>
        </div>
        <div className="surface-legend-items">
          {visible.map((r, index) => (
            <button
              type="button"
              key={r.id}
              data-legend-zone={r.slug}
              className={"surface-legend-button" + (activeSlug === r.slug ? " selected" : "")}
              aria-label={focusName(r, index)}
              aria-pressed={activeSlug === r.slug}
              onMouseEnter={() => enter(r)}
              onFocus={() => previewOnFocus(r)}
              onClick={() => chooseSurface(r)}
            >
              <span aria-hidden="true" className="surface-swatch" style={{ backgroundColor: surfaces[r.slug].color }} />
              <span>{focusName(r, index)}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
