import { useEffect, useState } from 'react';
import { fetchRegions, isCatalogConfigured, type BodyRegion } from '../lib/catalog-api';

type Zone = { id: string; title: string; help: string };
const zones: Zone[] = [
  { id: 'hands', title: 'Mãos', help: 'Passe o mouse ou toque na mão para ampliar a região.' },
  { id: 'feet', title: 'Pés', help: 'Toque nos pés para explorar as regiões que serão catalogadas.' },
  { id: 'head', title: 'Cabeça', help: 'Selecione a cabeça para consultar os termos publicados.' },
  { id: 'torso', title: 'Tronco', help: 'Selecione o tronco para consultar os termos publicados.' }
];

export default function Atlas() {
  const [chosen, setChosen] = useState('hands');
  const [hovered, setHovered] = useState<string | null>(null);
  const current = hovered || chosen;
  const [regions, setRegions] = useState<BodyRegion[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!isCatalogConfigured()) return;
    const controller = new AbortController();
    setLoading(true); setFailed(false);
    fetchRegions(current, controller.signal).then(setRegions)
      .catch(() => { if (!controller.signal.aborted) setFailed(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [current]);
  const active = zones.find(zone => zone.id === current) || zones[0];
  const interactive = (id: string) => ({
    onMouseEnter: () => setHovered(id),
    onMouseLeave: () => setHovered(null),
    onClick: () => { setChosen(id); setHovered(null); }
  });
  return <div className="atlas-layout">
    <div className="card atlas-figure">
      <p className="fine-print">Mapa conceitual 2D · regiões gerais do corpo, não uma ilustração anatômica oficial</p>
      <svg viewBox="0 0 260 480" className="body-svg" aria-label="Corpo humano esquemático com áreas clicáveis">
        <g {...interactive('head')} className={'atlas-zone ' + (current === 'head' ? 'active' : '')}>
          <ellipse cx="130" cy="57" rx="37" ry="42" />
        </g>
        <g {...interactive('torso')} className={'atlas-zone ' + (current === 'torso' ? 'active' : '')}>
          <path d="M92 111 L168 111 L180 240 L80 240 Z" />
          <path d="M90 245 L129 245 L122 395 L82 395 Z" />
          <path d="M132 245 L170 245 L179 395 L137 395 Z" />
        </g>
        <g className="body-limb" aria-hidden="true"><path d="M83 126 L58 272" /><path d="M176 126 L201 272" /></g>
        <g {...interactive('hands')} className={'atlas-zone ' + (current === 'hands' ? 'active' : '')}>
          <ellipse cx="52" cy="298" rx="17" ry="28" transform="rotate(12 52 298)" />
          <ellipse cx="209" cy="298" rx="17" ry="28" transform="rotate(-12 209 298)" />
        </g>
        <g {...interactive('feet')} className={'atlas-zone ' + (current === 'feet' ? 'active' : '')}>
          <path d="M82 389 L121 389 L117 450 L64 450 Z" />
          <path d="M139 389 L179 389 L197 450 L145 450 Z" />
        </g>
      </svg>
      <div className="atlas-controls" role="group" aria-label="Escolher região do corpo">
        {zones.map(zone => <button type="button" aria-pressed={chosen === zone.id} className={chosen === zone.id ? 'selected' : ''}
          key={zone.id} onClick={() => { setChosen(zone.id); setHovered(null); }}>{zone.title}</button>)}
      </div>
    </div>
    <section className="card atlas-information">
      <p className="tag">Exploração corporal</p>
      <h2>{active.title}</h2>
      <p>{active.help}</p>
      <div className={'atlas-zoom atlas-zoom-' + current} aria-hidden="true">
        <div className="zoom-symbol">{current === 'hands' ? '✋' : current === 'feet' ? '◁' : current === 'head' ? '◯' : '▣'}</div>
        <span>Área em destaque</span>
      </div>
      <h3>Regiões e termos técnicos</h3>
      {!isCatalogConfigured() ? <p>O atlas será conectado ao banco na publicação definitiva.</p>
        : loading ? <p role="status">Consultando...</p>
        : failed ? <p role="alert">Não foi possível carregar os registros.</p>
        : regions.length === 0 ? <p>Nenhum termo corporal validado e publicado nesta área ainda.</p>
        : <ul>{regions.map(region => <li key={region.id}><strong>{region.name_pt}</strong>
          <ul>{(region.body_region_terms || []).filter(link => link.technical_terms).map(link =>
            <li key={link.technical_terms!.slug}>
              <a href={'/tecnica?slug=' + encodeURIComponent(link.technical_terms!.slug)}>
                {link.technical_terms!.romanization}</a>
              {link.technical_terms!.translation_pt && ' — ' + link.technical_terms!.translation_pt}
            </li>)}</ul></li>)}</ul>}
      <p className="fine-print">Os nomes técnicos e suas partes específicas só serão exibidos após revisão documental. Esta silhueta é uma representação de interface.</p>
    </section>
  </div>;
}
