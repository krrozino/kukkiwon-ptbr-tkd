import { footContactReference, footDocumentCheckedOn, getPublicFootRegion } from '../../lib/public-foot';
import { libraryItemHref, type LibraryReference } from '../../lib/library';
import { safeReferenceUrl } from '../../lib/published-knowledge';
import type { BodyRegion } from '../../lib/catalog-api';
import type { View } from './BodyMap';

function DocumentLink({ reference, children }: { reference: LibraryReference; children: string }) {
  return safeReferenceUrl(reference.url)
    ? <a href={reference.url} target="_blank" rel="noopener noreferrer">{children}</a>
    : <span>{children}</span>;
}

export default function PublicFootRegionInspector({ region, view }: { region: BodyRegion; view: View }) {
  const entry = getPublicFootRegion(region.slug);
  if (!entry) return null;

  const regionView = region.detail_view;
  const outsideView = regionView !== 'both' && regionView !== view;
  const viewNotice = <small role="status" className={outsideView ? 'fine-print' : 'sr-only'}>
    {outsideView && `Região selecionada na vista ${regionView === 'front' ? 'Planta' : 'Dorso'}.`}
  </small>;

  if (entry.kind === 'illustrative') {
    return <article className="hand-term-card">
      {viewNotice}
      <p className="surface-panel-eyebrow">Região anatômica ilustrativa</p>
      <strong>{region.name_pt}</strong>
      <p>{entry.anatomy}</p>
      <small>Ilustração original — Taekwondo para Todos</small>
    </article>;
  }

  const href = libraryItemHref(entry.librarySlug);
  const { institution, title, edition, locator } = entry.terminology;
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
      <b>Uso documentado</b> · Superfície listada para chutes. <DocumentLink reference={footContactReference}>
        {footContactReference.locator}
      </DocumentLink>.
    </p>
    <p className="fine-print">
      <b>Fonte do termo e do sentido</b> · <DocumentLink reference={entry.terminology}>
        {`${institution} · ${title} (${edition}) · ${locator}`}
      </DocumentLink>
    </p>
    {href && <a className="inline-link" href={href}>Abrir ficha de {entry.romanization} na Biblioteca</a>}
    <small>
      Conferência documental em <time dateTime={footDocumentCheckedOn}>23/11/2026</time>.
    </small>
  </article>;
}
