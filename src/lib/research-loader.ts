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
function object(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
/** Fail closed: never treat imported research as approved/public content. */
export function parseResearchBundle(value: unknown): ResearchBundle {
  if (!object(value) || !object(value.metadata) || !Array.isArray(value.records)) {
    throw new Error("Selecione o arquivo tecnicas_rascunho.json do pacote de auditoria.");
  }
  const metadata = value.metadata;
  if (metadata.bundle !== "taekwondo-gemini-deep-research-audit" ||
    typeof metadata.pdf_sha256 !== "string" ||
    !/^[0-9a-f]{64}$/i.test(metadata.pdf_sha256) ||
    !Number.isInteger(metadata.pdf_pages) ||
    !Number.isInteger(metadata.technical_candidates) ||
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
      typeof r.slug_provisional !== "string" ||
      typeof r.hangul_extracted !== "string" ||
      typeof r.romanization_extracted !== "string" ||
      typeof r.category_provisional !== "string" ||
      !Array.isArray(r.pdf_pages) ||
      !r.pdf_pages.every((p: unknown) => Number.isInteger(p) && Number(p) >= 1 && Number(p) <= Number(metadata.pdf_pages)) ||
      !Array.isArray(r.normalization_issues) ||
      !r.normalization_issues.every((s: unknown) => typeof s === "string") ||
      !Array.isArray(r.raw_columns) ||
      !r.raw_columns.every((s: unknown) => typeof s === "string") ||
      r.editorial_status !== "research" ||
      r.publication_status !== "draft" ||
      r.eligible_for_public_site !== false ||
      r.institutional_source_verified_individually !== false) {
      throw new Error("Registro inválido ou com status público: a importação foi bloqueada.");
    }
    ids.add(r.candidate_id);
  }
  return value as ResearchBundle;
}