import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
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
};
export default function DetailMap({
  area,
  view,
  regions,
  selected,
  onSelect,
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
  const { detail } = useTermDetail(hover && published.has(hover.slug) ? hover.slug : (activeSlug && published.has(activeSlug) ? activeSlug : null));
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
            {hand ? (
              fist ? (
                <path d="M31 43 L32 60 M48 36 L49 59 M65 36 L66 57 M18 62 Q33 55 48 70 L65 75 Q68 84 58 87 L35 81 M30 104 L65 103" />
              ) : view === "front" ? (
                <path d="M29 82 Q44 73 62 77 M35 99 Q52 86 64 91 M31 79 Q35 92 40 99 M33 115 L59 116 M27 44 L35 44 M39 33 L48 33 M52 31 L61 31 M65 44 L72 44 M34 87 Q44 81 50 84 M42 109 Q50 106 57 108" />
              ) : (
                <path d="M35 77 L39 107 M45 70 L47 108 M56 68 L55 107 M66 77 L60 108 M34 115 L59 115 M27 36 L33 36 M40 19 L46 19 M54 14 L60 14 M68 30 L73 30" />
              )
            ) : view === "front" ? (
                <path d="M27 34 Q34 37 41 33 M47 32 L56 33 M63 37 L70 39 M77 42 L82 44 M29 58 Q49 68 77 58 M36 77 Q44 90 37 103 M38 120 Q49 116 60 121" />
            ) : (
              <path d="M32 43 L45 104 M48 44 L52 105 M64 46 L59 105 M35 115 Q49 111 64 115 M27 27 L38 28 M48 30 L56 31 M63 36 L70 38 M77 42 L82 44" />
            )}
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
                focused?.slug === r.slug ? "surface-tooltip" : undefined
              }
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
            role="tooltip"
            className={"surface-tooltip" + (published.has(focused.slug) ? "" : " surface-tooltip-compact")}
            data-placement={placement}
          >
            {published.has(focused.slug) ? (
              <>
                <strong>{focused.name_pt}</strong>
                <span>{detail?.term.romanization || "Identificação em consulta"}</span>
                <span lang="ko">{detail?.term.hangul || "Hangul em consulta"}</span>
                <span>Pronúncia: {detail?.term.pronunciation_pt || "ainda não conferida"}</span>
                <small>{detail?.term.definition_pt?.slice(0, 160) || "Consulte os vínculos desta superfície."}</small>
                <a className="inline-link" href={`/tecnica?slug=${encodeURIComponent(focused.slug)}`}>Abrir ficha técnica →</a>
                <AtlasSourceEvidence kind="technical" sources={detail?.sources} />
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
