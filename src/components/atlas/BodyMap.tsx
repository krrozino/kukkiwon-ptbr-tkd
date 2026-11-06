import BodyIllustration from "./BodyIllustration";
import {areaViewBoxes,bodyZones} from "./zones";
import type { KeyboardEvent, PointerEvent } from "react";
import type { BodyRegion } from "../../lib/catalog-api";
export const areas = [
  {
    id: "head",
    title: "Cabeça e pescoço",
    summary: "Explore as regiões publicadas da cabeça.",
  },
  {
    id: "torso",
    title: "Tronco",
    summary: "Explore as regiões publicadas do tronco.",
  },
  {
    id: "arms",
    title: "Braços",
    summary: "Explore braços, antebraços e cotovelos.",
  },
  {
    id: "hands",
    title: "Mãos",
    summary:
      "Amplie para consultar superfícies e configurações de mão publicadas.",
  },
  {
    id: "legs",
    title: "Pernas",
    summary: "Explore as regiões publicadas das pernas e dos joelhos.",
  },
  {
    id: "feet",
    title: "Pés",
    summary: "Amplie para consultar superfícies do pé publicadas.",
  },
] as const;
export type Area = (typeof areas)[number]["id"];
export type View = "front" | "back";
export const isArea = (value: string): value is Area =>
  areas.some((a) => a.id === value);

type Props = {
  view: View;
  selected: Area;
  hovered: Area | null;
  zoom: boolean;
  onSelect: (a: Area) => void;
  onHover: (a: Area | null) => void;
  regions?: BodyRegion[];
  selectedRegion?: string | null;
  onSelectRegion?: (r: BodyRegion) => void;
};
const contactShapes:Record<string,string>=Object.fromEntries(bodyZones.filter(z=>z.regionSlug).map(z=>[z.regionSlug!,z.path]));
export default function BodyMap({
  view,
  selected,
  hovered,
  zoom,
  onSelect,
  onHover,
  regions = [],
  selectedRegion,
  onSelectRegion,
}: Props) {
  const active = hovered || selected;
  const interaction = (id: Area) => ({
    role: "button",
    tabIndex: 0,
    "aria-label":
      areas.find((a) => a.id === id)!.title + " — selecionar região",
    "aria-pressed": selected === id,
    className: "atlas-zone " + (active === id ? "active" : ""),
    onClick: () => onSelect(id),
    onKeyDown: (e: KeyboardEvent<SVGGElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(id);
      }
    },
    onPointerEnter: (e: PointerEvent<SVGGElement>) => {
      if (e.pointerType === "mouse") onHover(id);
    },
    onPointerLeave: () => onHover(null),
    onFocus: () => onHover(id),
    onBlur: () => onHover(null),
  });
  return (
    <svg
      viewBox={zoom ? areaViewBoxes[selected] : "0 0 260 480"}
      className="body-svg"
      role="group"
      aria-label="Mapa corporal interativo"
    >
      <defs>
        <linearGradient id="dobok-fabric" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffffff"/>
          <stop offset=".52" stopColor="#f1f4f3"/>
          <stop offset="1" stopColor="#e2e6e5"/>
        </linearGradient>
        <linearGradient id="dobok-shadow" x1="0" y1="0" x2=".9" y2="1">
          <stop stopColor="#f7faf9"/>
          <stop offset="1" stopColor="#d9e3e2"/>
        </linearGradient>
      </defs>
      <BodyIllustration view={view} />
      <g {...interaction("head")}>
        <ellipse cx="130" cy="53" rx="32" ry="41" />
      </g>
      <g {...interaction("torso")}>
        <path d="M98 114 Q130 101 162 114 L169 241 Q130 255 91 241 Z" />
      </g>
      <g {...interaction("arms")}>
        <path d="M89 120 Q72 119 64 152 L42 270 L60 275 L84 175 L96 148 Z" />
        <path d="M171 120 Q188 119 196 152 L218 270 L200 275 L176 175 L164 148 Z" />
      </g>
      <g {...interaction("legs")}>
        <path d="M92 247 L126 254 L116 392 L82 392 Z" />
        <path d="M168 247 L134 254 L144 392 L178 392 Z" />
      </g>
      <g {...interaction("hands")}>
        <path d="M42 274 L59 278 L65 294 L62 321 Q48 333 38 316 L32 295 Z" />
        <path d="M218 274 L201 278 L195 294 L198 321 Q212 333 222 316 L228 295 Z" />
      </g>
      <g {...interaction("feet")}>
        <path d="M82 397 L116 397 L113 444 Q95 456 66 445 L69 429 Z" />
        <path d="M144 397 L178 397 L191 429 L194 445 Q165 456 147 444 Z" />
      </g>
      <g className="body-markings" aria-hidden="true">
        {view === "front" ? (
          <>
            <path d="M118 49 h3 M139 49 h3 M124 73 Q130 77 136 73 M130 122 v95 M105 131 Q118 141 128 136 M132 136 Q142 141 155 131" />
          </>
        ) : (
          <>
            <path d="M130 114 v119 M102 132 Q108 162 124 166 M158 132 Q152 162 136 166 M99 222 Q130 212 161 222" />
          </>
        )}
      </g>
      <g className="body-markings" aria-hidden="true">
        <path d="M79 150 Q71 162 70 177 M181 150 Q189 162 190 177 M63 198 L55 247 M197 198 L205 247 M98 265 Q109 299 103 320 M162 265 Q151 299 157 320 M90 333 Q99 341 110 333 M150 333 Q161 341 170 333 M91 354 L89 384 M169 354 L171 384" />
      </g>
      {regions
        .filter(
          (r) =>
            contactShapes[r.slug] &&
            (r.detail_view === view || r.detail_view === "both"),
        )
        .map((r) => (
          <g
            key={r.id}
            role="button"
            tabIndex={0}
            aria-label={r.name_pt}
            aria-pressed={selectedRegion === r.slug}
            className={
              "surface-cutout " + (selectedRegion === r.slug ? "selected" : "")
            }
            style={{ "--surface-color": "#258c8b" } as React.CSSProperties}
            onClick={() => onSelectRegion?.(r)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelectRegion?.(r);
              }
            }}
          >
            <path d={contactShapes[r.slug]} />
          </g>
        ))}
    </svg>
  );
}
