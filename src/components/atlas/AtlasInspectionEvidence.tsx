import type { BodyRegion } from '../../lib/catalog-api';
import type { LibraryReference } from '../../lib/library';
import { safeReferenceUrl } from '../../lib/published-knowledge';
import type { View } from './BodyMap';

export function AtlasDocumentLink({ reference, children }: Readonly<{ reference: LibraryReference; children: string }>) {
  return safeReferenceUrl(reference.url)
    ? <a href={reference.url} target="_blank" rel="noopener noreferrer">{children}</a>
    : <span>{children}</span>;
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
