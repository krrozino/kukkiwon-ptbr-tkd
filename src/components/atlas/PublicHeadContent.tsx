import type { BodyRegion } from '../../lib/catalog-api';
import { getHeadTargets, headDocumentReview, headRomanizationReference } from '../../lib/public-head';
import { AtlasIllustrativeCredit, AtlasReviewStamp, AtlasSourceCitation, AtlasViewNotice } from './AtlasInspectionEvidence';
import type { View } from './BodyMap';
import { zoneCopy } from './zone-copy';

const viewLabels = { front: 'anterior', back: 'posterior' };

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
            <li><b>{spelling && !spelling.revisedRomanization ? 'Área, sentido e romanização' : 'Área e sentido'}</b> · <AtlasSourceCitation reference={targetReference} /></li>
            {spelling && <li><b>Hangul e sentido da palavra</b> · <AtlasSourceCitation reference={spelling.dictionary} /></li>}
            {spelling?.revisedRomanization && <li><b>Norma de romanização</b> · <AtlasSourceCitation reference={headRomanizationReference} /></li>}
          </ul>
        </details>
      </section>
    ))}
    {targets && <AtlasReviewStamp date={headDocumentReview.checkedOn} />}
    <AtlasIllustrativeCredit />
  </article>;
}
