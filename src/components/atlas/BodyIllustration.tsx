const outlineParts = [
  'M116 74 Q117 91 114 104 Q130 114 146 104 Q143 91 144 74 Z',
  'M106 47 Q102 31 116 24 Q130 16 145 25 Q159 34 155 53 L153 72 Q148 88 131 93 Q114 89 109 74 Z',
  'M96 111 Q85 115 77 127 L61 150 L45 213 L39 262 L58 270 L78 210 L93 174 L96 229 Q130 240 164 229 L167 174 L183 210 L202 270 L221 262 L215 213 L199 150 L183 127 Q175 115 164 111 Q155 107 146 103 Q130 114 114 103 Q105 107 96 111 Z',
  'M91 239 Q129 248 169 239 Q181 270 175 311 L176 394 L143 396 Q137 346 129 296 Q120 349 115 396 L83 394 L83 311 Q81 269 91 239 Z',
  'M40 262 Q38 273 34 284 L28 299 Q28 311 34 313 Q36 321 41 321 Q46 326 50 320 Q56 322 60 314 L63 295 L58 267 Z',
  'M220 262 Q222 273 226 284 L232 299 Q232 311 226 313 Q224 321 219 321 Q214 326 210 320 Q204 322 200 314 L197 295 L202 267 Z',
  'M84 393 L115 393 L115 421 Q110 431 108 440 Q92 452 66 450 L64 440 Q66 425 78 413 Z',
  'M145 393 L176 393 L182 413 Q194 425 196 440 L194 450 Q168 452 152 440 Q148 431 145 421 Z',
] as const;
const backHeadPart = 'M106 47 Q102 31 116 24 Q130 16 145 25 Q159 34 155 53 L152 72 Q130 81 109 72 Z';
export { outlineParts as bodySilhouetteParts };
export const bodySilhouettePath = outlineParts.join(" ");
import type {Area, View} from "./BodyMap";
export function headSilhouetteParts(view: View) {
  return view === "front" ? outlineParts : ([outlineParts[0], backHeadPart, ...outlineParts.slice(2)] as const);
}
export function HeadFeatureOverlay({view}:{view:View}) {
  return (
    <g aria-hidden="true" className="body-illustration head-feature-overlay">
      {view==="front" ? (
        <path className="figure-face-overlay" d="M115 54 Q121 51 125 54 M136 54 Q142 51 146 54 M130 57 L127 67 Q130 71 133 67 M122 77 Q130 81 138 77"/>
      ) : (
        <path className="figure-hair-lines-overlay" d="M115 46 Q130 49 145 46 M130 47 L130 65 M118 74 Q130 78 142 74"/>
      )}
    </g>
  );
}
export function BodyAreaFeatureOverlay({area,view}:{area:Area;view:View}) {
  if (area === "head") return <HeadFeatureOverlay view={view}/>;
  if (area === "torso") {
    return (
      <g aria-hidden="true" className="body-illustration body-feature-overlay">
        {view==="front" ? (
          <>
            <path className="figure-anatomy-overlay" d="M114 104 L130 133 L146 104 M113 111 L130 142 L109 189 M147 111 L130 143 L152 193 M121 178 Q130 171 139 178"/>
            <path className="figure-belt-overlay" d="M93 220 Q130 227 167 220 M92 234 Q130 241 168 234 M122 224 L138 224 L136 238 L124 238 Z"/>
          </>
        ) : (
          <>
            <path className="figure-anatomy-overlay" d="M112 110 Q130 123 148 110 M130 132 L130 218"/>
            <path className="figure-belt-overlay" d="M93 220 Q130 227 167 220 M92 234 Q130 241 168 234"/>
          </>
        )}
      </g>
    );
  }
  if (area === "legs") {
    return (
      <g aria-hidden="true" className="body-illustration body-feature-overlay">
        <path className="figure-anatomy-overlay" d={view==="front"
          ? "M84 394 L115 395 M145 395 L176 394 M93 324 Q101 319 110 324 M94 338 Q101 342 108 338 M150 324 Q159 319 167 324 M152 338 Q159 342 166 338 M86 406 Q92 409 92 404 M109 406 Q113 409 113 404 M147 404 Q147 409 151 406 M168 404 Q168 409 174 406"
          : "M84 394 L115 395 M145 395 L176 394 M89 329 Q101 333 113 329 M147 329 Q159 333 171 329 M99 396 L99 415 M161 396 L161 415"
        }/>
      </g>
    );
  }
  return null;
}
export default function BodyIllustration({view}:{view:View}) {
  return (
      <g role="img" aria-label={"Corpo humano — vista "+(view==="front"?"anterior":"posterior")}
        className="body-illustration">
        {/* Figura corporal original em posição neutra, com dobok e articulações proporcionais. */}
        <path className="figure-neck" d={outlineParts[0]}/>
        <path className="figure-skin" d={view==="front"?outlineParts[1]:backHeadPart}/>
        <path className="figure-ear" d="M106 55 Q99 51 101 61 Q103 69 109 67 M155 55 Q162 51 159 62 Q157 68 152 67"/>
        {view==="front"?<>
          <path className="figure-hair" d="M105 53 Q99 28 110 22 Q127 9 143 20 Q157 21 156 51 Q150 45 148 32 Q133 37 117 30 Q111 40 105 53 Z"/>
          <g className="figure-face">
            <path d="M115 54 Q121 51 125 54 M136 54 Q142 51 146 54 M130 57 L127 67 Q130 71 133 67 M122 77 Q130 81 138 77"/>
          </g>
        </>:<>
          <path className="figure-hair" d="M104 54 Q97 29 112 20 Q134 10 148 24 Q160 31 155 57 L150 73 Q130 81 111 73 Z"/>
          <path className="figure-hair-lines" d="M115 46 Q130 49 145 46 M130 47 L130 65 M118 74 Q130 78 142 74"/>
        </>}
        {/* Dobok: mangas articuladas, casaco sobreposto, faixa e calças de tecido. */}
        <path className="figure-gi" d={outlineParts[2]}/>
        <path className="figure-shadow" d="M86 124 Q73 149 66 189 L55 256 L46 259 L65 168 L75 139 Z M175 122 Q189 148 199 189 L213 260 L203 260 L190 180 L180 145 Z"/>
        <path className="figure-lapel" d={view==="front"
          ?"M114 104 L130 133 L146 104 L153 111 L134 144 L157 201 L130 218 L103 200 L126 144 L107 112 Z"
          :"M110 108 Q130 123 150 108 L144 117 Q130 127 116 117 Z"}/>
        {view==="front"&&<path className="figure-lapel-seam" d="M113 111 L131 142 L109 189 M147 111 L131 143 L152 193"/>}
        <path className="figure-seam" d="M94 157 Q89 182 94 204 M166 156 Q171 185 165 204 M60 205 Q66 199 74 203 M186 203 Q194 200 201 205"/>
        <path className="figure-belt" d="M93 220 Q130 227 167 220 L169 235 Q130 241 91 235 Z"/>
        <path className="figure-belt-knot" d="M121 223 L138 223 L136 238 L125 239 Z M126 238 L137 238 L145 285 L134 288 Z M127 238 L121 280 L111 278 L123 238 Z"/>
        <path className="figure-foot" d={outlineParts[6]}/>
        <path className="figure-foot" d={outlineParts[7]}/>
        <path className="figure-foot-detail" d="M70 439 Q90 443 108 435 M152 435 Q170 443 190 439 M80 416 Q94 422 108 417 M152 417 Q166 422 180 416"/>
        <path className="figure-pants" d={outlineParts[3]}/>
        <path className="figure-pants-lines" d="M99 254 Q113 289 105 330 M159 255 Q147 286 157 334 M87 365 L112 372 M148 373 L172 365 M130 251 L129 296"/>
        <path className="figure-skin" d={outlineParts[4]}/>
        <path className="figure-skin" d={outlineParts[5]}/>
        <path className="figure-hand-lines" d="M35 293 L34 311 M41 296 L41 317 M48 293 L49 317 M55 289 L56 311 M225 293 L226 311 M219 296 L219 317 M212 293 L211 317 M205 289 L204 311"/>
      </g>
  );
}
