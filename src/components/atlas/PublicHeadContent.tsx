import type { BodyRegion } from '../../lib/catalog-api';
import type { LibraryReference } from '../../lib/library';
import { getHeadTargets, headDocumentReview, headRomanizationReference } from '../../lib/public-head';
import { AtlasDocumentLink, AtlasViewNotice } from './AtlasInspectionEvidence';
import type { View } from './BodyMap';
import { zoneCopy } from './zone-copy';

const viewLabels = { front: 'anterior', back: 'posterior' };

function SourceLink({ reference }: Readonly<{ reference: LibraryReference }>) {
  const { institution, title, edition, locator } = reference;
  return <AtlasDocumentLink reference={reference}>{`${institution} · ${title} (${edition}) · ${locator}`}</AtlasDocumentLink>;
}

export default function PublicHeadRegionInspector({ region, view }: Readonly<{ region: BodyRegion; view: View }>) {
  const targets = getHeadTargets(region.slug);
  return <article className="hand-term-card">
    <AtlasViewNotice regionView={region.detail_view} view={view} labels={viewLabels} />
    <p className="surface-panel-eyebrow">Região anatômica ilustrativa</p>
    <strong>{region.name_pt}</strong>
    <p>{zoneCopy[region.id].description}</p>
    {targets?.map(({ kind, namePt, description, targetReference, spelling }) => (
      <section key={namePt} className="hand-term-card">
        <p className="surface-panel-eyebrow">
          {kind === 'target_area_general' ? 'Área-alvo geral' : 'Alvo detalhado documentado'}
        </p>
        <strong>{namePt}</strong>
        {spelling && <p>
          <span className="hand-term-romanization">{spelling.romanization}</span> · <span lang="ko">{spelling.hangul}</span>
          {spelling.revisedRomanization && <> · Romanização revisada</>}
        </p>}
        <p>{description}</p>
        <details className="hand-term-sources">
          <summary>Fontes de {namePt.toLocaleLowerCase('pt-BR')}</summary>
          <ul className="fine-print">
            <li><b>{spelling && !spelling.revisedRomanization ? 'Área, sentido e romanização' : 'Área e sentido'}</b> · <SourceLink reference={targetReference} /></li>
            {spelling && <li><b>Hangul e sentido da palavra</b> · <SourceLink reference={spelling.dictionary} /></li>}
            {spelling?.revisedRomanization && <li><b>Norma de romanização</b> · <SourceLink reference={headRomanizationReference} /></li>}
          </ul>
        </details>
      </section>
    ))}
    {targets && <small>Conferência documental em <time dateTime={headDocumentReview.checkedOn}>23/11/2026</time>.</small>}
    <small>Ilustração original — Taekwondo para Todos</small>
  </article>;
}
