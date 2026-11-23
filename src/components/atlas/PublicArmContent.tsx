import { armDocumentCheckedOn, getArmTerm } from '../../lib/public-arm';
import { libraryItemHref, type LibraryReference } from '../../lib/library';
import { safeReferenceUrl } from '../../lib/published-knowledge';
import type { BodyRegion } from '../../lib/catalog-api';
import { zoneCopy } from './zone-copy';

function SourceLink({ reference, short = false }: { reference: LibraryReference; short?: boolean }) {
  const { institution, title, edition, locator, url } = reference;
  const label = short ? locator : `${institution} · ${title} (${edition}) · ${locator}`;
  return safeReferenceUrl(url)
    ? <a href={url} target="_blank" rel="noopener noreferrer">{label}</a>
    : <span>{label}</span>;
}

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
        <b>Fonte do termo e do sentido</b> · <SourceLink reference={term.reference} />
      </p>
    </>}
    {example && <p className="fine-print">
      <b>Exemplo documentado</b> · <SourceLink reference={example.reference} short />
    </p>}
    {href && <a className="inline-link" href={href}>Abrir ficha da técnica na Biblioteca</a>}
    {term && <small>Conferência documental em <time dateTime={armDocumentCheckedOn}>23/11/2026</time>.</small>}
    {!isContact && <small>Ilustração original — Taekwondo para Todos</small>}
  </article>;
}
