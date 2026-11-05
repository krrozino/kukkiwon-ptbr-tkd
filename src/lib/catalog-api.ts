export type TermAlias = { alias: string; alias_kind: string; is_official: boolean };
export type TechnicalTerm = {
  id: string; slug: string; category: string; hangul: string | null;
  romanization: string; translation_pt: string | null; pronunciation_pt: string | null;
  definition_pt: string | null; publication_status: 'published';
  term_aliases?: TermAlias[];
};
export type TermSource = {
  source_locator: string; checked_at: string | null;
  content_sources: {
    institution: string; title: string; edition: string | null;
    publication_year: number | null; official_url: string;
  } | null;
};
export type TermMedia = {
  id: string; media_kind: 'image' | 'video' | 'audio';
  media_url: string; caption_pt: string | null;
};
export type BodyRegion = {
  id: string; slug: string; region_group: string; name_pt: string;
  body_region_terms?: {
    usage_context: string;
    technical_terms: { slug: string; romanization: string; translation_pt: string | null } | null;
  }[];
};

const base = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const key = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export function isCatalogConfigured() {
  return Boolean(base && key && base.startsWith('https://') && !base.includes('SEU-PROJETO'));
}
export async function fetchPublic<T>(table: string, params: URLSearchParams, signal?: AbortSignal): Promise<T> {
  if (!isCatalogConfigured()) throw new Error('Configuração pública do Supabase ausente.');
  const root = new URL(base!);
  if (root.protocol !== 'https:') throw new Error('A API deve utilizar HTTPS.');
  const target = new URL('/rest/v1/' + table + '?' + params.toString(), root);
  const response = await fetch(target, {
    headers: { apikey: key!, Accept: 'application/json' }, signal
  });
  if (!response.ok) throw new Error('Não foi possível acessar o catálogo (' + response.status + ').');
  return response.json() as Promise<T>;
}
export function fetchPublishedTerms(signal?: AbortSignal) {
  return fetchPublic<TechnicalTerm[]>('technical_terms', new URLSearchParams({
    select: 'id,slug,category,hangul,romanization,translation_pt,pronunciation_pt,definition_pt,publication_status,term_aliases(alias,alias_kind,is_official)',
    publication_status: 'eq.published',
    order: 'romanization.asc',
    limit: '500'
  }), signal);
}
export async function fetchTermDetails(slug: string, signal?: AbortSignal) {
  const records = await fetchPublic<TechnicalTerm[]>('technical_terms', new URLSearchParams({
    select: 'id,slug,category,hangul,romanization,translation_pt,pronunciation_pt,definition_pt,publication_status,term_aliases(alias,alias_kind,is_official)',
    publication_status: 'eq.published', slug: 'eq.' + slug, limit: '1'
  }), signal);
  if (records.length === 0) return null;
  const term = records[0];
  const [sources, media] = await Promise.all([
    fetchPublic<TermSource[]>('term_sources', new URLSearchParams({
      select: 'source_locator,checked_at,content_sources(institution,title,edition,publication_year,official_url)',
      term_id: 'eq.' + term.id
    }), signal),
    fetchPublic<TermMedia[]>('term_media', new URLSearchParams({
      select: 'id,media_kind,media_url,caption_pt',
      term_id: 'eq.' + term.id, publication_status: 'eq.published'
    }), signal)
  ]);
  return { term, sources, media };
}
export function fetchRegions(group: string, signal?: AbortSignal) {
  return fetchPublic<BodyRegion[]>('body_regions', new URLSearchParams({
    select: 'id,slug,region_group,name_pt,body_region_terms(usage_context,technical_terms(slug,romanization,translation_pt))',
    region_group: 'eq.' + group, publication_status: 'eq.published',
    order: 'name_pt.asc', limit: '200'
  }), signal);
}
