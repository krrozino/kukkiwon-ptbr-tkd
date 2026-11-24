import type { BodyRegion } from '../../lib/catalog-api';
import { getLegsEntry, legsDocumentReview } from '../../lib/public-legs';
import { AtlasIllustrativeCredit, AtlasReviewStamp, AtlasSourceCitation, AtlasViewNotice } from './AtlasInspectionEvidence';
import type { View } from './BodyMap';

const viewLabels = { front: 'anterior', back: 'posterior' };
const eyebrows = {
  surface: 'Superfície técnica de contato',
  target_joint: 'Região anatômica ilustrativa · alvo e articulação',
  contextual_anatomy: 'Região anatômica ilustrativa · termo contextual',
  illustrative_only: 'Região anatômica ilustrativa',
} as const;

export default function PublicLegsRegionInspector({ region, view }: Readonly<{ region: BodyRegion; view: View }>) {
  const entry = getLegsEntry(region.slug);
  if (!entry) return null;
  const isSurface = entry.classification === 'surface';
  return <article className="hand-term-card">
    <AtlasViewNotice regionView={region.detail_view} view={view} labels={viewLabels} />
    <p className="surface-panel-eyebrow">{eyebrows[entry.classification]}</p>
    <strong>{region.name_pt}</strong>
    {entry.romanization && (
      <p>
        {!isSurface && <>Termo documentado · </>}
        <span className="hand-term-romanization">{entry.romanization}</span>
        {entry.hangul && <> · <span lang="ko">{entry.hangul}</span></>}
      </p>
    )}
    <p>{entry.meaningPt}</p>
    {entry.gapNote && <p className="fine-print">{entry.gapNote}</p>}
    {entry.reference && (
      <details className="hand-term-sources">
        <summary>Fontes de {region.name_pt.toLocaleLowerCase('pt-BR')}</summary>
        <ul className="fine-print">
          <li><b>Referência principal</b> · <AtlasSourceCitation reference={entry.reference} /></li>
          {entry.extraReference && <li><b>Uso e contexto</b> · <AtlasSourceCitation reference={entry.extraReference} /></li>}
        </ul>
      </details>
    )}
    {entry.atlasLink && <a className="inline-link" href={entry.atlasLink.href}>{entry.atlasLink.label}</a>}
    {entry.libraryLink && <a className="inline-link" href={entry.libraryLink.href}>{entry.libraryLink.label}</a>}
    {entry.reference && <AtlasReviewStamp date={legsDocumentReview.checkedOn} />}
    {!isSurface && <AtlasIllustrativeCredit />}
  </article>;
}
