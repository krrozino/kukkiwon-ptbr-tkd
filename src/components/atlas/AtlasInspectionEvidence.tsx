import type { BodyRegion } from '../../lib/catalog-api';
import type { LibraryReference } from '../../lib/library';
import { safeReferenceUrl } from '../../lib/published-knowledge';
import type { View } from './BodyMap';

export function AtlasDocumentLink({ reference, children }: Readonly<{ reference: LibraryReference; children: string }>) {
  return safeReferenceUrl(reference.url)
    ? <a href={reference.url} target="_blank" rel="noopener noreferrer">{children}</a>
    : <span>{children}</span>;
}

export function AtlasSourceCitation({
  reference,
  short = false,
}: Readonly<{ reference: LibraryReference; short?: boolean }>) {
  const { institution, title, edition, locator } = reference;
  const label = short ? locator : `${institution} · ${title} (${edition}) · ${locator}`;
  return <AtlasDocumentLink reference={reference}>{label}</AtlasDocumentLink>;
}

export function AtlasReviewStamp({ date }: Readonly<{ date: string }>) {
  const [year, month, day] = date.split('-');
  const display = year && month && day ? `${day}/${month}/${year}` : date;
  return (
    <small>
      Conferência documental em <time dateTime={date}>{display}</time>.
    </small>
  );
}

export function AtlasIllustrativeCredit() {
  return <small>Ilustração original — Taekwondo para Todos</small>;
}

export function AtlasViewNotice({ regionView, view, labels }: Readonly<{
  regionView: BodyRegion['detail_view'];
  view: View;
  labels: Readonly<Record<View, string>>;
}>) {
  const outsideView = regionView && regionView !== 'both' && regionView !== view;
  return <output className={outsideView ? 'fine-print' : 'sr-only'}>
    {outsideView && `Região selecionada na vista ${labels[regionView]}.`}
  </output>;
}
