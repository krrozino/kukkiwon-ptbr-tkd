import { safeReferenceUrl } from './published-knowledge.ts';
import { researchCsvCell } from './research-reports.ts';

/** Portable research keys resolve to existing DB identities; these are not DB rows. */
export type HandField = 'hangul' | 'romanization' | 'pronunciation_pt' | 'translation_pt' |
  'definition_pt' | 'literal_meaning' | 'technical_meaning' | 'context' | 'variant' | 'distinction' | 'region';
export type HandSource = {
  source_id: string; institution: string; title: string; edition: string | null;
  publication_year: number | null; official_url: string;
  authority: 'primary' | 'historical' | 'complementary' | 'editorial';
  sha256: string | null; pdf_pages: number | null; access_note: string;
};
type Evidence = {
  term_slug: string; field_name: string; observed_value: string;
  source_id: string; source_locator: string;
};
type Basis = { source_id: string; source_locator: string };
type Documented = {
  term_slug: string; language_tag: string; usage_context: string;
  source_id: string; source_locator: string;
  evidence_kind: HandSource['authority']; evidence: Evidence; basis: Basis[];
  editorial_status: 'research' | 'document_checked'; publication_status: 'draft';
  checked_at: string | null; approved_at: null; note: string;
};
export type HandClaim = Documented & {
  claim_key: string; sense_key: string | null; field_name: HandField; value: string;
  variant_kind: 'documented_spelling' | 'historical_romanization' | 'regional_translation' | 'synonym' | null;
  related_term_slug: string | null; region_slug: string | null;
  region_usage_context: 'surface' | 'target' | 'movement' | 'other' | null;
};
export type HandSense = Documented & {
  sense_key: string; sense_kind: 'literal' | 'technical' | 'contextual' | 'historical' | 'regional'; meaning: string;
};
export type HandTerm = {
  slug: string; existing_term_slug: string | null; record_kind: 'surface' | 'anatomy';
  geometry_status: 'mapped' | 'pending';
  research_gaps: { field_name: string; reason: string }[];
};
export type HandRegion = {
  slug: string; name_pt: string; atlas_area: 'hands';
  region_kind: 'technical_surface' | 'illustrative_anatomy';
  geometry_status: 'existing'; note: string;
};
export type HandRegionTerm = Basis & {
  region_slug: string; term_slug: string; usage_context: 'surface'; anatomical_role: 'surface';
  claim_key: string; editorial_status: 'research'; publication_status: 'draft';
};
export type HandRelation = Basis & {
  term_slug: string; related_term_slug: string; relation_kind: 'related';
  editorial_status: 'document_checked'; publication_status: 'draft'; checked_at: string;
};
export type HandMatrix = {
  format: 'taekwondo-atlas-hand-research'; schema_version: 1; version: string; created_at: string;
  publish_to_site: false; human_review: 'pending'; editorial_author: string;
  content_sources: HandSource[]; technical_terms: HandTerm[];
  term_senses: HandSense[]; term_field_claims: HandClaim[];
  body_regions: HandRegion[]; body_region_terms: HandRegionTerm[]; term_relations: HandRelation[];
};

const fields = ['hangul','romanization','pronunciation_pt','translation_pt','definition_pt',
  'literal_meaning','technical_meaning','context','variant','distinction','region'];
const kinds = ['primary','historical','complementary','editorial'];
function requireValue(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error('Matriz da mão: ' + message);
}
const object = (v: unknown): v is Record<string, any> => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
const nonempty = (v: unknown): v is string => typeof v === 'string' && Boolean(v.trim());
const slug = (v: unknown): v is string => typeof v === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v) && v.length <= 120;
const date = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v && Date.parse(v) <= Date.now();
function unique<T>(rows: T[], key: (row: T) => string, label: string) {
  const map = new Map<string, T>();
  for (const row of rows) {
    const id = key(row);
    requireValue(nonempty(id) && !map.has(id), label + ' ausente ou duplicado: ' + id);
    map.set(id, row);
  }
  return map;
}

/** Fail closed: validates research, never confers human approval or public visibility. */
export function validateHandMatrix(value: unknown, catalog?: readonly { slug: string }[]): HandMatrix {
  requireValue(object(value), 'raiz inválida');
  requireValue(value.format === 'taekwondo-atlas-hand-research' && value.schema_version === 1 &&
    nonempty(value.version) && date(value.created_at) && value.publish_to_site === false &&
    value.human_review === 'pending' && nonempty(value.editorial_author), 'versão ou autorização inválida');
  for (const key of ['content_sources','technical_terms','term_senses','term_field_claims','body_regions','body_region_terms','term_relations'])
    requireValue(Array.isArray(value[key]) && value[key].every(object), 'coleção inválida: ' + key);
  const data = value as HandMatrix;
  requireValue(data.content_sources.length && data.technical_terms.length, 'inventário vazio');
  const sources = unique(data.content_sources, r => r.source_id, 'fonte');
  const terms = unique(data.technical_terms, r => r.slug, 'termo');
  const senses = unique(data.term_senses, r => r.sense_key, 'sentido');
  const claims = unique(data.term_field_claims, r => r.claim_key, 'afirmação');
  const regions = unique(data.body_regions, r => r.slug, 'região');
  for (const source of sources.values()) {
    requireValue(nonempty(source.institution) && nonempty(source.title) && safeReferenceUrl(source.official_url) &&
      (source.edition === null || nonempty(source.edition)) && kinds.includes(source.authority) &&
      (source.publication_year === null || (Number.isInteger(source.publication_year) && source.publication_year >= 1 && source.publication_year <= 9999)) &&
      (source.sha256 === null || /^[a-f0-9]{64}$/.test(source.sha256)) &&
      (source.pdf_pages === null || (Number.isInteger(source.pdf_pages) && source.pdf_pages > 0)) &&
      nonempty(source.access_note), 'bibliografia inválida: ' + source.source_id);
  }
  function reference(row: Basis) {
    requireValue(sources.has(row.source_id) && nonempty(row.source_locator), 'fonte/localizador ausente');
    const source = sources.get(row.source_id)!;
    // These PDFs have no reliable printed appendix page numbers. Validate physical PDF locators.
    if (source.pdf_pages !== null) {
      const match = row.source_locator.match(/PDF pp?\. (\d+)(?:-(\d+))?/);
      requireValue(match && Number(match[1]) >= 1 && Number(match[2] ?? match[1]) >= Number(match[1]) &&
        Number(match[2] ?? match[1]) <= source.pdf_pages, 'página PDF inválida');
    }
  }
  function documented(row: Documented, field: string, observed: string) {
    reference(row);
    requireValue(terms.has(row.term_slug) && nonempty(observed) && observed === observed.normalize('NFC') &&
      nonempty(row.usage_context) && typeof row.language_tag === 'string' && /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(row.language_tag) &&
      typeof row.note === 'string' && row.publication_status === 'draft' && row.approved_at === null &&
      !('approved_by' in row) && !('evidence_id' in row), 'identidade/estado inválido');
    requireValue(['research','document_checked'].includes(row.editorial_status) && kinds.includes(row.evidence_kind), 'revisão inválida');
    requireValue(row.evidence_kind === sources.get(row.source_id)!.authority, 'autoridade divergente');
    requireValue(row.checked_at === null || date(row.checked_at), 'data inválida');
    requireValue(row.editorial_status !== 'document_checked' || row.checked_at !== null, 'conferência ausente');
    requireValue(row.evidence_kind !== 'editorial' || (row.editorial_status === 'research' && row.checked_at === null), 'adaptação editorial não é conferência documental');
    requireValue(object(row.evidence) && row.evidence.term_slug === row.term_slug && row.evidence.field_name === field &&
      row.evidence.observed_value === observed && row.evidence.source_id === row.source_id &&
      row.evidence.source_locator === row.source_locator, 'evidência deve corresponder a termo, campo e valor exatos');
    requireValue(Array.isArray(row.basis) && row.basis.every(object), 'fundamentação inválida');
    row.basis.forEach(reference);
    requireValue(row.evidence_kind !== 'editorial' || row.basis.length > 0, 'adaptação sem fundamentação');
  }
  for (const term of terms.values()) {
    requireValue(slug(term.slug) && (term.existing_term_slug === null || term.existing_term_slug === term.slug) &&
      ['surface','anatomy'].includes(term.record_kind) && ['mapped','pending'].includes(term.geometry_status) &&
      Array.isArray(term.research_gaps) && term.research_gaps.every(g => object(g) && nonempty(g.field_name) && nonempty(g.reason)), 'termo inválido');
  }
  for (const region of regions.values()) {
    requireValue(slug(region.slug) && nonempty(region.name_pt) && region.atlas_area === 'hands' &&
      region.geometry_status === 'existing' && ['technical_surface','illustrative_anatomy'].includes(region.region_kind) &&
      nonempty(region.note) && (region.slug.startsWith('illustration-') === (region.region_kind === 'illustrative_anatomy')), 'região inválida');
  }
  for (const sense of senses.values()) {
    requireValue(['literal','technical','contextual','historical','regional'].includes(sense.sense_kind), 'tipo de sentido inválido');
    documented(sense, sense.sense_kind + '_meaning', sense.meaning);
  }
  for (const claim of claims.values()) {
    requireValue(fields.includes(claim.field_name), 'campo inválido');
    documented(claim, claim.field_name, claim.value);
    requireValue(claim.sense_key === null || senses.get(claim.sense_key)?.term_slug === claim.term_slug, 'sentido ausente ou de outro termo');
    requireValue(claim.variant_kind === null || (['romanization','translation_pt','variant'].includes(claim.field_name) &&
      ['documented_spelling','historical_romanization','regional_translation','synonym'].includes(claim.variant_kind)), 'variante inválida');
    requireValue(claim.related_term_slug === null || (claim.field_name === 'distinction' &&
      terms.has(claim.related_term_slug) && claim.related_term_slug !== claim.term_slug), 'distinção inválida');
    requireValue((claim.region_slug === null) === (claim.region_usage_context === null) &&
      (claim.region_slug === null || (claim.field_name === 'region' && regions.has(claim.region_slug) &&
        ['surface','target','movement','other'].includes(claim.region_usage_context!))), 'vínculo de região inválido');
    if (claim.field_name === 'hangul') requireValue(/[가-힣]/.test(claim.value) && claim.language_tag === 'ko', 'Hangul inválido');
    if (claim.field_name === 'pronunciation_pt') requireValue(claim.evidence_kind === 'editorial' && claim.language_tag === 'pt-BR', 'pronúncia deve ser adaptação editorial');
  }
  unique(data.body_region_terms, r => r.region_slug + ':' + r.term_slug + ':' + r.usage_context, 'vínculo');
  for (const link of data.body_region_terms) {
    reference(link);
    requireValue(!('approved_by' in link) && !('approved_at' in link), 'vínculo de pesquisa não aceita assinatura humana');
    const claim = claims.get(link.claim_key);
    requireValue(regions.get(link.region_slug)?.region_kind === 'technical_surface' && terms.has(link.term_slug) &&
      link.usage_context === 'surface' && link.anatomical_role === 'surface' &&
      link.publication_status === 'draft' && link.editorial_status === 'research' && claim &&
      claim.field_name === 'region' && claim.term_slug === link.term_slug && claim.region_slug === link.region_slug &&
      claim.region_usage_context === link.usage_context && claim.source_id === link.source_id &&
      claim.source_locator === link.source_locator, 'vínculo sem evidência própria ou região ilustrativa');
  }
  for (const term of terms.values()) {
    requireValue(data.term_field_claims.some(c => c.term_slug === term.slug && c.field_name === 'hangul'), 'termo sem Hangul documentado');
    requireValue(data.term_senses.some(s => s.term_slug === term.slug), 'termo sem sentido');
    requireValue((term.geometry_status === 'mapped') === data.body_region_terms.some(r => r.term_slug === term.slug), 'cobertura geométrica inconsistente');
  }
  for (const claim of data.term_field_claims.filter(c => c.region_slug !== null))
    requireValue(data.body_region_terms.some(r => r.claim_key === claim.claim_key), 'afirmação de região sem vínculo');
  unique(data.term_relations, r => r.term_slug + ':' + r.related_term_slug + ':' + r.relation_kind, 'relação');
  for (const relation of data.term_relations) {
    reference(relation);
    requireValue(!('approved_by' in relation) && !('approved_at' in relation), 'relação de pesquisa não aceita assinatura humana');
    requireValue(slug(relation.term_slug) && terms.has(relation.related_term_slug) && relation.term_slug !== relation.related_term_slug &&
      relation.relation_kind === 'related' && relation.editorial_status === 'document_checked' &&
      relation.publication_status === 'draft' && date(relation.checked_at), 'relação inválida');
  }
  // Subjects live in the existing technique catalog, outside this hand-only matrix.
  // A structural parse alone cannot establish their identity. The audit always supplies it.
  if (catalog !== undefined) {
    requireValue(Array.isArray(catalog) && catalog.every(t => object(t) && slug(t.slug)), 'catálogo inválido');
    const existing = new Set(catalog.map(t => t.slug));
    for (const term of terms.values())
      requireValue(term.existing_term_slug === (existing.has(term.slug) ? term.slug : null), 'correspondência divergente do catálogo: ' + term.slug);
    for (const relation of data.term_relations)
      requireValue(existing.has(relation.term_slug), 'técnica ausente do catálogo: ' + relation.term_slug);
  }
  return data;
}

/** Matrix is supplied explicitly. No research JSON is imported by a public route. */
export function handTermDocumentation(matrix: HandMatrix, termSlug: string) {
  validateHandMatrix(matrix);
  const term = matrix.technical_terms.find(t => t.slug === termSlug);
  if (!term) return null;
  const citation = <T extends Basis>(row: T) => ({ ...row,
    reference: matrix.content_sources.find(s => s.source_id === row.source_id)!,
    basis: 'basis' in row ? (row.basis as Basis[]).map(b => ({...b, reference: matrix.content_sources.find(s => s.source_id === b.source_id)!})) : [],
  });
  return {
    term,
    claims: matrix.term_field_claims.filter(c => c.term_slug === termSlug).map(citation),
    senses: matrix.term_senses.filter(s => s.term_slug === termSlug).map(citation),
    regions: matrix.body_region_terms.filter(r => r.term_slug === termSlug).map(citation),
    techniques: matrix.term_relations.filter(r => r.related_term_slug === termSlug).map(citation),
  };
}

export function handRegionDocumentation(matrix: HandMatrix, regionSlug: string) {
  validateHandMatrix(matrix);
  const region = matrix.body_regions.find(r => r.slug === regionSlug);
  if (!region) return null;
  return { region, terms: matrix.body_region_terms.filter(r => r.region_slug === regionSlug)
    .map(r => handTermDocumentation(matrix, r.term_slug)!) };
}

/** Portable proposal for #42; trusted import must resolve slugs, insert evidence, and validate again. */
export function handSemanticsProposal(matrix: HandMatrix, termSlug: string) {
  const detail = handTermDocumentation(matrix, termSlug);
  if (!detail) return null;
  const senses = matrix.term_senses.filter(s => s.term_slug === termSlug);
  const claims = matrix.term_field_claims.filter(c => c.term_slug === termSlug);
  return { term_slug: termSlug, term_senses: senses, term_field_claims: claims,
    field_evidence: [...senses, ...claims].map(row => ({ ...row.evidence,
      source_snapshot: matrix.content_sources.find(s => s.source_id === row.source_id)!,
    })),
  };
}

/** One CSV row per field/sense, with its own source and state. */
export function handMatrixCsv(matrix: HandMatrix) {
  validateHandMatrix(matrix);
  const rows = [...matrix.term_senses.map(s => ({ ...s, key: s.sense_key, field: s.sense_kind + '_meaning', value: s.meaning })),
    ...matrix.term_field_claims.map(c => ({...c, key: c.claim_key, field: c.field_name}))];
  const header = ['term_slug','key','field','value','language_tag','usage_context','evidence_kind','editorial_status','publication_status',
    'source_id','institution','document','edition','year','url','locator','checked_at','basis','note'];
  return [header, ...rows.map(r => {
    const source = matrix.content_sources.find(s => s.source_id === r.source_id)!;
    return [r.term_slug,r.key,r.field,r.value,r.language_tag,r.usage_context,r.evidence_kind,r.editorial_status,r.publication_status,
      r.source_id,source.institution,source.title,source.edition ?? '',String(source.publication_year ?? ''),source.official_url,
      r.source_locator,r.checked_at ?? '',r.basis.map(b => b.source_id + ': ' + b.source_locator).join(' | '),r.note];
  })].map(row => row.map(researchCsvCell).join(',')).join('\r\n') + '\r\n';
}
