import type { KeyboardEvent, PointerEvent } from "react";
import type { BodyRegion } from "../../lib/catalog-api";
export const areas = [
  {
    id: "head",
    title: "Cabeça",
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
const crops: Record<Area, string> = {
  head: "80 0 100 115",
  torso: "65 90 130 180",
  arms: "15 95 230 220",
  hands: "10 255 240 90",
  legs: "65 245 130 170",
  feet: "55 385 150 85",
};
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
const contactShapes: Record<string, string> = {
  anpalmok: "M47 230 L61 233 L55 265 L44 262 Z",
  bakkatpalmok: "M202 230 L214 228 L219 261 L205 266 Z",
  palgup: "M62 178 Q70 171 78 180 L72 197 Q62 200 59 189 Z",
  mureup: "M86 324 Q99 317 114 326 L112 344 Q100 352 85 342 Z",
};
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
      viewBox={zoom ? crops[selected] : "0 0 260 480"}
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
      <g role="img" aria-label={"Corpo humano — vista "+(view==="front"?"anterior":"posterior")}
        className="body-illustration">
        {/* Figura corporal original em posição neutra, com dobok e articulações proporcionais. */}
        <path className="figure-neck" d="M117 83 L115 102 Q130 112 145 102 L143 83 Z"/>
        <path className="figure-skin" d="M106 47 Q102 31 116 24 Q130 16 145 25 Q159 34 155 53 L153 72 Q148 88 131 93 Q114 89 109 74 Z"/>
        <path className="figure-ear" d="M106 55 Q99 51 101 61 Q103 69 109 67 M155 55 Q162 51 159 62 Q157 68 152 67"/>
        {view==="front"?<>
          <path className="figure-hair" d="M105 53 Q99 28 110 22 Q127 9 143 20 Q157 21 156 51 Q150 45 148 32 Q133 37 117 30 Q111 40 105 53 Z"/>
          <g className="figure-face">
            <path d="M115 54 Q121 51 125 54 M136 54 Q142 51 146 54 M130 57 L127 67 Q130 71 133 67 M122 77 Q130 81 138 77"/>
          </g>
        </>:<>
          <path className="figure-hair" d="M104 54 Q97 29 112 20 Q134 10 148 24 Q160 31 155 57 L150 75 Q130 83 111 75 Z"/>
          <path className="figure-hair-lines" d="M115 46 Q130 49 145 46 M130 47 L130 66"/>
        </>}
        {/* Dobok: mangas articuladas, casaco sobreposto, faixa e calças de tecido. */}
        <path className="figure-gi" d="M96 111 Q85 115 77 127 L61 150 L45 213 L39 262 L58 270 L78 210 L93 174 L96 229 Q130 240 164 229 L167 174 L183 210 L202 270 L221 262 L215 213 L199 150 L183 127 Q175 115 164 111 L146 103 Q130 115 114 103 Z"/>
        <path className="figure-shadow" d="M86 124 Q73 149 66 189 L55 256 L46 259 L65 168 L75 139 Z M175 122 Q189 148 199 189 L213 260 L203 260 L190 180 L180 145 Z"/>
        <path className="figure-lapel" d={view==="front"
          ?"M114 104 L130 133 L146 104 L153 111 L134 144 L157 201 L130 218 L103 200 L126 144 L107 112 Z"
          :"M110 108 Q130 123 150 108 L144 117 Q130 127 116 117 Z"}/>
        {view==="front"&&<path className="figure-lapel-seam" d="M113 111 L131 142 L109 189 M147 111 L131 143 L152 193"/>}
        <path className="figure-seam" d="M94 157 Q89 182 94 204 M166 156 Q171 185 165 204 M60 205 Q66 199 74 203 M186 203 Q194 200 201 205"/>
        <path className="figure-belt" d="M93 220 Q130 227 167 220 L169 235 Q130 241 91 235 Z"/>
        <path className="figure-belt-knot" d="M121 223 L138 223 L136 238 L125 239 Z M126 238 L137 238 L145 285 L134 288 Z M127 238 L121 280 L111 278 L123 238 Z"/>
        <path className="figure-pants" d="M91 239 Q129 248 169 239 Q181 270 175 311 L176 394 L143 396 Q137 346 129 296 Q120 349 115 396 L83 394 L83 311 Q81 269 91 239 Z"/>
        <path className="figure-pants-lines" d="M99 254 Q113 289 105 330 M159 255 Q147 286 157 334 M87 365 L112 372 M148 373 L172 365 M130 251 L129 296"/>
        <path className="figure-skin" d="M40 262 Q38 273 34 284 L28 299 Q28 311 34 313 Q36 321 41 321 Q46 326 50 320 Q56 322 60 314 L63 295 L58 267 Z"/>
        <path className="figure-skin" d="M220 262 Q222 273 226 284 L232 299 Q232 311 226 313 Q224 321 219 321 Q214 326 210 320 Q204 322 200 314 L197 295 L202 267 Z"/>
        <path className="figure-hand-lines" d="M35 293 L34 311 M41 296 L41 317 M48 293 L49 317 M55 289 L56 311 M225 293 L226 311 M219 296 L219 317 M212 293 L211 317 M205 289 L204 311"/>
        <path className="figure-foot" d="M84 395 L115 395 L115 421 Q110 431 108 440 Q92 452 66 450 L64 440 Q66 425 78 413 Z"/>
        <path className="figure-foot" d="M145 395 L176 395 L182 413 Q194 425 196 440 L194 450 Q168 452 152 440 Q148 431 145 421 Z"/>
        <path className="figure-foot-detail" d="M70 439 Q90 443 108 435 M152 435 Q170 443 190 439 M80 416 Q94 422 108 417 M152 417 Q166 422 180 416"/>
      </g>
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
