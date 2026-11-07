import { safeReferenceUrl } from './published-knowledge';

export type SenseKind = 'literal' | 'technical' | 'contextual' | 'historical' | 'regional';
export type EditorialStatus = 'research' | 'document_checked' | 'technical_reviewed';
export type PublicationStatus = 'draft' | 'published' | 'retired';
export type ClaimField = 'hangul' | 'romanization' | 'pronunciation_pt' | 'translation_pt' |
  'definition_pt' | 'literal_meaning' | 'technical_meaning' | 'context' | 'variant' | 'distinction' | 'region';
export type VariantKind = 'documented_spelling' | 'historical_romanization' | 'regional_translation' | 'synonym';
export type RegionUsageContext = 'surface' | 'target' | 'movement' | 'other';
export type SourceSnapshot = {
  institution: string; title: string; edition: string | null;
  publication_year: number | null; official_url: string;
};
type DocumentedRow = {
  id: string; term_id: string; language_tag: string; usage_context: string;
  source_id: string; source_locator: string; source_snapshot: SourceSnapshot;
  editorial_status: EditorialStatus; publication_status: PublicationStatus;
  checked_at: string | null; approved_at: string | null; created_at: string;
};
export type TermSense = DocumentedRow & { sense_kind: SenseKind; meaning: string };
export type TermFieldClaim = DocumentedRow & {
  sense_id: string | null; field_name: ClaimField; value: string; variant_kind: VariantKind | null;
  related_term_id: string | null; region_id: string | null; region_usage_context: RegionUsageContext | null;
};
export type TermSemantics = { senses: TermSense[]; claims: TermFieldClaim[] };

const commonColumns = 'id,term_id,language_tag,usage_context,source_id,source_locator,source_snapshot,editorial_status,publication_status,checked_at,approved_at,created_at';
/** Deliberately omit private evidence_id and approved_by; SELECT * is forbidden. */
export const TERM_SENSE_COLUMNS = commonColumns + ',sense_kind,meaning';
export const TERM_CLAIM_COLUMNS = commonColumns + ',sense_id,field_name,value,variant_kind,related_term_id,region_id,region_usage_context';

const object = (v: unknown): v is Record<string, unknown> => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown, max: number): v is string => typeof v === 'string' && v.trim().length > 0 && Array.from(v).length <= max;
const uuid = (v: unknown): v is string => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
const date = (v: unknown): v is string => typeof v === 'string' && Number.isFinite(Date.parse(v)) && Date.parse(v) <= Date.now();
const nullableUuid = (v: unknown) => v === null || uuid(v);
const member = (v: unknown, choices: readonly string[]) => typeof v === 'string' && choices.includes(v);
function exactColumns(row: Record<string, unknown>, columns: string) {
  const keys = columns.split(',');
  if (Object.keys(row).length !== keys.length || keys.some(key => !Object.hasOwn(row, key)))
    throw new Error('Projeção inválida: campos ausentes ou privados.');
}
function documented(value: unknown, columns: string): asserts value is DocumentedRow & Record<string, unknown> {
  if (!object(value)) throw new Error('Afirmação inválida.');
  exactColumns(value, columns);
  const source = value.source_snapshot;
  if (!object(source) || !text(source.institution, 4000) || !text(source.title, 4000) ||
    !(source.edition === null || text(source.edition, 4000)) ||
    !(source.publication_year === null || (Number.isInteger(source.publication_year) &&
      (source.publication_year as number) >= 1 && (source.publication_year as number) <= 9999)) ||
    !safeReferenceUrl(source.official_url) || !text(value.source_locator, 2000))
    throw new Error('Referência documental inválida.');
  exactColumns(source, 'institution,title,edition,publication_year,official_url');
  if (!uuid(value.id) || !uuid(value.term_id) || !uuid(value.source_id) ||
    !text(value.language_tag, 63) || !/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(value.language_tag) ||
    !text(value.usage_context, 2000) || !date(value.created_at) ||
    !member(value.editorial_status, ['research', 'document_checked', 'technical_reviewed']) ||
    !member(value.publication_status, ['draft', 'published', 'retired']) ||
    !(value.checked_at === null || date(value.checked_at)) || !(value.approved_at === null || date(value.approved_at)) ||
    (value.editorial_status !== 'research' && value.checked_at === null) ||
    ((value.editorial_status === 'technical_reviewed') !== (value.approved_at !== null)) ||
    (value.publication_status === 'published' && value.editorial_status !== 'technical_reviewed'))
    throw new Error('Identidade, contexto ou estado editorial inválido.');
}

/** Offline validation accepts research rows. It grants no editorial authorization. */
export function validateTermSemantics(value: unknown): TermSemantics {
  if (!object(value) || !Array.isArray(value.senses) || !Array.isArray(value.claims))
    throw new Error('Modelo de sentidos inválido.');
  const senses = new Map<string, TermSense>();
  for (const row of value.senses) {
    documented(row, TERM_SENSE_COLUMNS);
    if (!member(row.sense_kind, ['literal','technical','contextual','historical','regional']) ||
      !text(row.meaning, 4000) || senses.has(row.id)) throw new Error('Sentido inválido ou duplicado.');
    senses.set(row.id, row as TermSense);
  }
  const claims = new Set<string>();
  for (const row of value.claims) {
    documented(row, TERM_CLAIM_COLUMNS);
    if (!text(row.value, 4000) || !member(row.field_name, ['hangul','romanization','pronunciation_pt','translation_pt',
      'definition_pt','literal_meaning','technical_meaning','context','variant','distinction','region']) ||
      !nullableUuid(row.sense_id) || !nullableUuid(row.related_term_id) || !nullableUuid(row.region_id) ||
      !(row.variant_kind === null || member(row.variant_kind, ['documented_spelling','historical_romanization','regional_translation','synonym'])) ||
      !(row.region_usage_context === null || member(row.region_usage_context, ['surface','target','movement','other'])) ||
      (row.region_id === null) !== (row.region_usage_context === null) ||
      (row.region_id !== null && row.field_name !== 'region') ||
      (row.related_term_id !== null && (row.field_name !== 'distinction' || row.related_term_id === row.term_id)) ||
      (row.variant_kind !== null && !member(row.field_name, ['romanization','translation_pt','variant'])) || claims.has(row.id))
      throw new Error('Afirmação, variante ou vínculo inválido.');
    if (row.sense_id !== null && senses.get(row.sense_id as string)?.term_id !== row.term_id)
      throw new Error('Afirmação aponta a sentido ausente ou de outro termo.');
    claims.add(row.id);
  }
  return value as TermSemantics;
}

/** Decode a public response only after the DB/RLS has resolved parent visibility. */
export function parsePublishedTermSemantics(value: unknown, termId: string): TermSemantics {
  if (!uuid(termId)) throw new Error('Identificador de termo inválido.');
  const result = validateTermSemantics(value);
  if ([...result.senses, ...result.claims].some(row => row.publication_status !== 'published'))
    throw new Error('Resposta contém conteúdo não publicado.');
  if ([...result.senses, ...result.claims].some(row => row.term_id !== termId))
    throw new Error('Resposta contém conteúdo de outro termo.');
  return result;
}
