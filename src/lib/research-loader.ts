/**
 * Offline-only research reader. Not a public catalogue importer.
 * All data must remain draft and requires human technical/language/source review.
 */
export type ResearchCandidate = {
  candidate_id: string;
  pdf_id_observed: string;
  category_provisional: string;
  slug_provisional: string;
  hangul_extracted: string;
  romanization_extracted: string;
  pdf_pages: number[];
  compare_existing_repo: string;
  existing_slug_or_variant_candidate: string | null;
  normalization_issues: string[];
  raw_columns: string[];
  editorial_status: "research";
  publication_status: "draft";
  eligible_for_public_site: false;
  institutional_source_verified_individually: false;
  [key: string]: unknown;
};
export type ResearchBundle = {
  metadata: {
    bundle: string;
    pdf_pages: number;
    technical_candidates: number;
    pdf_sha256: string;
    [key: string]: unknown;
  };
  records: ResearchCandidate[];
};
export function researchObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
const object = researchObject;
export function validateResearchJson(value: unknown, depth = 0): void {
  if (depth > 20) throw new Error("Estrutura de pesquisa excessivamente profunda.");
  if (typeof value === "string" && value.length > 50_000) throw new Error("Campo de pesquisa excessivamente longo.");
  if (Array.isArray(value)) {
    if (value.length > 2_000) throw new Error("Lista de pesquisa excessivamente longa.");
    value.forEach(item => validateResearchJson(item, depth + 1));
  } else if (object(value)) {
    for (const [key, item] of Object.entries(value)) {
      if (["__proto__", "constructor", "prototype"].includes(key)) throw new Error("Chave de pesquisa não permitida.");
      validateResearchJson(item, depth + 1);
    }
  } else if (value !== null && !["string", "boolean", "number"].includes(typeof value)) {
    throw new Error("Valor de pesquisa não serializável.");
  }
}
const text = (value: unknown, max = 500) => typeof value === "string" && value.length <= max;
/** Fail closed: never treat imported research as approved/public content. */
export function parseResearchBundle(value: unknown): ResearchBundle {
  validateResearchJson(value);
  if (!object(value) || !object(value.metadata) || !Array.isArray(value.records)) {
    throw new Error("Selecione o arquivo tecnicas_rascunho.json do pacote de auditoria.");
  }
  const metadata = value.metadata;
  if (metadata.bundle !== "taekwondo-gemini-deep-research-audit" ||
    typeof metadata.pdf_sha256 !== "string" ||
    !/^[0-9a-f]{64}$/i.test(metadata.pdf_sha256) ||
    !Number.isInteger(metadata.pdf_pages) ||
    Number(metadata.pdf_pages) < 1 || Number(metadata.pdf_pages) > 2_000 ||
    !Number.isInteger(metadata.technical_candidates) ||
    Number(metadata.technical_candidates) > 2_000 ||
    value.records.length === 0 ||
    value.records.length !== metadata.technical_candidates) {
    throw new Error("Manifesto de pesquisa inválido ou contagem inconsistente.");
  }
  const ids = new Set<string>();
  for (const r of value.records) {
    if (!object(r) ||
      typeof r.candidate_id !== "string" ||
      !/^TC-[A-Z]+-\d{3}$/.test(r.candidate_id) ||
      ids.has(r.candidate_id) ||
      !text(r.pdf_id_observed) ||
      !text(r.slug_provisional, 200) || !String(r.slug_provisional).trim() ||
      !text(r.hangul_extracted) ||
      !text(r.romanization_extracted) ||
      !text(r.category_provisional, 100) ||
      !["exact_slug", "normalized_slug", "possible_variant_review", "not_found_in_repo_review_batches"].includes(String(r.compare_existing_repo)) ||
      !(r.existing_slug_or_variant_candidate === null || text(r.existing_slug_or_variant_candidate, 200)) ||
      !Array.isArray(r.pdf_pages) ||
      !r.pdf_pages.length || new Set(r.pdf_pages).size !== r.pdf_pages.length ||
      !r.pdf_pages.every((p: unknown) => Number.isInteger(p) && Number(p) >= 1 && Number(p) <= Number(metadata.pdf_pages)) ||
      !Array.isArray(r.normalization_issues) ||
      r.normalization_issues.length > 100 ||
      !r.normalization_issues.every((s: unknown) => typeof s === "string") ||
      !Array.isArray(r.raw_columns) ||
      r.raw_columns.length > 32 ||
      !r.raw_columns.every((s: unknown) => typeof s === "string") ||
      r.editorial_status !== "research" ||
      r.publication_status !== "draft" ||
      r.eligible_for_public_site !== false ||
      r.institutional_source_verified_individually !== false ||
      ["translation_review", "technical_review", "korean_review"].some(key => r[key] !== undefined && r[key] !== "pending") ||
      (r.source_locator_verified !== undefined && r.source_locator_verified !== false) ||
      ["approved_by", "approved_at", "published_at", "reviewed_by"].some(key => r[key] != null)) {
      throw new Error("Registro inválido ou com status público: a importação foi bloqueada.");
    }
    ids.add(r.candidate_id);
  }
  return value as ResearchBundle;
}
