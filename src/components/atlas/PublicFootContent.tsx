import { footContactReference, footDocumentCheckedOn, getPublicFootRegion } from '../../lib/public-foot';
import { libraryItemHref } from '../../lib/library';
import type { BodyRegion } from '../../lib/catalog-api';
import { AtlasIllustrativeCredit, AtlasReviewStamp, AtlasSourceCitation, AtlasViewNotice } from './AtlasInspectionEvidence';
import type { View } from './BodyMap';

const viewLabels = { front: 'Planta', back: 'Dorso' };

export default function PublicFootRegionInspector({ region, view }: { region: BodyRegion; view: View }) {
  const entry = getPublicFootRegion(region.slug);
  if (!entry) return null;

  const viewNotice = <AtlasViewNotice regionView={region.detail_view} view={view} labels={viewLabels} />;

  if (entry.kind === 'illustrative') {
    return <article className="hand-term-card">
      {viewNotice}
      <p className="surface-panel-eyebrow">Região anatômica ilustrativa</p>
      <strong>{region.name_pt}</strong>
      <p>{entry.anatomy}</p>
      <AtlasIllustrativeCredit />
    </article>;
  }

  const href = libraryItemHref(entry.librarySlug);
  return <article className="hand-term-card">
    {viewNotice}
    <p className="surface-panel-eyebrow">Superfície técnica de contato</p>
    <strong>{region.name_pt}</strong>
    <p><span className="hand-term-romanization">{entry.romanization}</span> · <span lang="ko">{entry.hangul}</span></p>
    <p>
      <b>Sentido técnico em português</b> · {entry.meaningPt}.
      {region.slug === 'balbadak' && ' A marca no centro representa a planta inteira.'}
    </p>
    <p>
      <b>Uso documentado</b> · Superfície listada para chutes. <AtlasSourceCitation reference={footContactReference} short />.
    </p>
    <p className="fine-print">
      <b>Fonte do termo e do sentido</b> · <AtlasSourceCitation reference={entry.terminology} />
    </p>
    {href && <a className="inline-link" href={href}>Abrir ficha de {entry.romanization} na Biblioteca</a>}
    <AtlasReviewStamp date={footDocumentCheckedOn} />
  </article>;
}
