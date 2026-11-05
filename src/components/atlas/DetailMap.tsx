import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { BodyRegion } from "../../lib/catalog-api";
import type { View } from "./BodyMap";
import { handOutline, footOutline, fistOutline, surfaces } from "./surfaces";
import { useTermDetail } from "../TermContext";
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
  const [hover, setHover] = useState<BodyRegion | null>(null),
    [fist, setFist] = useState(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const { detail } = useTermDetail(hover?.slug || null);
  useEffect(() => {
    if (selected) setFist(!!surfaces[selected]?.posture);
  }, [selected]);
  useEffect(() => () => clearTimeout(exitTimer.current), []);
  const visible = regions.filter((r) => {
    const s = surfaces[r.slug];
    return (
      s &&
      (s.view === view || s.view === "both") &&
      (!hand || !!s.posture === fist)
    );
  });
  const leave = () => {
    clearTimeout(exitTimer.current);
    exitTimer.current = setTimeout(() => setHover(null), 160);
  };
  const enter = (r: BodyRegion) => {
    clearTimeout(exitTimer.current);
    setHover(r);
  };
  const anchor = hover && surfaces[hover.slug]?.anchor;
  return (
    <div
      className="surface-canvas"
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
        </defs>
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
            d={hand ? (fist ? fistOutline : handOutline) : footOutline}
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
              <path d="M26 41 Q48 49 77 43 M33 63 Q45 72 39 88 M36 111 Q49 105 60 113 M36 119 Q48 115 58 121 M38 23 L45 23 M52 25 L59 26 M65 34 L71 35" />
            ) : (
              <path d="M38 43 L49 101 M50 39 L55 99 M63 42 L60 101 M35 113 Q49 109 64 113 M37 18 L45 18 M52 22 L58 23 M64 30 L71 31 M77 38 L81 40" />
            )}
          </g>
        </g>
        {visible.map((r) => {
          const s = surfaces[r.slug];
          return (
            <g
              key={r.id}
              data-region={r.slug}
              role="button"
              tabIndex={0}
              aria-label={r.name_pt}
              aria-pressed={selected === r.slug}
              aria-describedby={
                hover?.slug === r.slug ? "surface-tooltip" : undefined
              }
              className={
                "surface-cutout " + (selected === r.slug ? "selected" : "")
              }
              style={{ "--surface-color": s.color } as CSSProperties}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") enter(r);
              }}
              onFocus={() => enter(r)}
              onBlur={leave}
              onClick={() => {
                enter(r);
                onSelect(r);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  enter(r);
                  onSelect(r);
                }
              }}
            >
              <path d={s.path} />
            </g>
          );
        })}
        {anchor && (
          <path
            key={hover?.slug}
            className="surface-connector"
            d={`M${anchor[0]} ${anchor[1]} L94 ${anchor[1]} L94 136`}
            pathLength="1"
            aria-hidden="true"
          />
        )}
      </svg>
      {hover && (
        <div
          id="surface-tooltip"
          key={hover.slug}
          role="tooltip"
          className="surface-tooltip"
        >
          <strong>{hover.name_pt}</strong>
          <span>{detail?.term.romanization || hover.slug}</span>
          <span lang="ko">{detail?.term.hangul || "Consultando Hangul…"}</span>
          <span>
            Pronúncia: {detail?.term.pronunciation_pt || "ainda não conferida"}
            {detail?.term.pronunciation_pt &&
            detail.term.pronunciation_status !== "verified"
              ? " · provisória"
              : ""}
          </span>
          <small>
            {detail?.term.definition_pt?.slice(0, 140) ||
              "Consulte os dados e vínculos desta superfície."}
          </small>
          <small>Toque ou clique para explorar ↓</small>
        </div>
      )}
    </div>
  );
}
