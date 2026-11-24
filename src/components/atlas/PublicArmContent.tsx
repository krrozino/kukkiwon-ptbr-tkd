import { armDocumentCheckedOn, getArmTerm } from '../../lib/public-arm';
import { libraryItemHref } from '../../lib/library';
import type { BodyRegion } from '../../lib/catalog-api';
import { AtlasIllustrativeCredit, AtlasReviewStamp, AtlasSourceCitation } from './AtlasInspectionEvidence';
import { zoneCopy } from './zone-copy';

export default function PublicArmRegionInspector({ region }: { region: BodyRegion }) {
  const term = getArmTerm(region.slug);
  const isContact = term?.kind === 'surface';
  const example = term?.example;
  const anatomy = zoneCopy[region.id].description;
  const href = example && libraryItemHref(example.librarySlug);
  return <article className="hand-term-card">
    <p className="surface-panel-eyebrow">
      {isContact ? 'Superfície técnica de contato' : 'Região anatômica ilustrativa'}
    </p>
    <strong>{region.name_pt}</strong>
    {!isContact && <p>{anatomy}</p>}
    {term && <>
      <p>
        {!isContact && <>Termo de referência · </>}
        <span className="hand-term-romanization">{term.romanization}</span> · <span lang="ko">{term.hangul}</span>
      </p>
      <p>{term.meaningPt}</p>
      {term.mapNote && <p className="fine-print">{term.mapNote}</p>}
      <p className="fine-print">
        <b>Fonte do termo e do sentido</b> · <AtlasSourceCitation reference={term.reference} />
      </p>
    </>}
    {example && <p className="fine-print">
      <b>Exemplo documentado</b> · <AtlasSourceCitation reference={example.reference} short />
    </p>}
    {href && <a className="inline-link" href={href}>Abrir ficha da técnica na Biblioteca</a>}
    {term && <AtlasReviewStamp date={armDocumentCheckedOn} />}
    {!isContact && <AtlasIllustrativeCredit />}
  </article>;
}
