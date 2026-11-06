import { parseResearchBundle, researchObject, validateResearchJson, type ResearchBundle, type ResearchCandidate } from "./research-loader.ts";

export const auditStatuses = ["verified_primary", "verified_secondary", "conflicting", "insufficient_evidence", "extraction_error", "pending_review"] as const;
export type AuditStatus = typeof auditStatuses[number];
export type ExistingResearchTerm = {
  slug: string; hangul: string; romanization: string; category: string; translation_pt: string;
  definition_pt: string; record_kind: string; source_locator: string; batch: string;
  aliases?: { alias: string; alias_kind: string }[];
};
export type ResearchEvidence = { source_id: string; url: string; locator: string; fields: string[]; finding: string };
export type ResearchCorrection = { field: string; original: string; proposed: string; reason: string; source_id: string; locator: string };
export type DocumentaryRecord = { candidate_id: string; audit_status: AuditStatus; summary: string; evidence: ResearchEvidence[]; proposed_corrections: ResearchCorrection[] };
export type DocumentaryAudit = {
  version: number; audited_on: string; pdf_sha256: string;
  source_checks: { id: string; url: string; access_status: string; source_kind: string; title: string; locator: string; notes: string }[];
  records: DocumentaryRecord[]; [key: string]: unknown;
};
export type ResearchMatch = { kind: "exact_slug" | "normalized_slug" | "explicit_alias" | "same_identity" | "possible_variant_review"; existing: ExistingResearchTerm; conflicts: string[]; requires_human_resolution: true };
export type AuditedResearchRecord = {
  candidate_id: string; original: ResearchCandidate;
  normalized: { slug: string; hangul: string; romanization: string; category: string; name_pt: string };
  objective_changes: { field: string; original: string; normalized: string; reason: string }[];
  matches: ResearchMatch[]; resolution: "matched_review" | "unmatched_review";
  duplicate_candidate_ids: string[]; incomplete_fields: string[];
  audit_status: AuditStatus; summary: string; evidence: ResearchEvidence[]; proposed_corrections: ResearchCorrection[];
};
export type AuditedResearchBundle = {
  format: "taekwondo-research-audit"; version: 1; metadata: ResearchBundle["metadata"];
  existing_terms: ExistingResearchTerm[]; documentary: DocumentaryAudit | null; records: AuditedResearchRecord[];
};
/** No dehyphenation, footnote removal, inferred Hangul or technical rewriting. */
export const normalizeObserved = (value: string) => value.normalize("NFC").replace(/\r\n?/g, "\n").trim();
const identity = (value: string) => normalizeObserved(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").normalize("NFC").toLowerCase().replace(/[\s‐‑–—_-]/gu, "");
export function safeResearchUrl(value: string): boolean {
  try { const u = new URL(value); return u.protocol === "https:" && !u.username && !u.password; } catch { return false; }
}
const nonempty = (v: unknown): v is string => typeof v === "string" && !!v.trim();
function validateExisting(value: unknown): asserts value is ExistingResearchTerm[] {
  if (!Array.isArray(value) || value.length > 2_000) throw new Error("Inventário existente inválido.");
  const slugs = new Set<string>();
  for (const entry of value) {
    if (!researchObject(entry) || !["slug", "hangul", "romanization", "category", "translation_pt", "definition_pt", "record_kind", "source_locator", "batch"].every(k => typeof entry[k] === "string") ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(entry.slug)) ||
      (entry.aliases !== undefined && (!Array.isArray(entry.aliases) || !entry.aliases.every(a => researchObject(a) && nonempty(a.alias) && nonempty(a.alias_kind))))) throw new Error("Registro existente inválido.");
    if (slugs.has(String(entry.slug))) throw new Error("Slug duplicado no inventário existente.");
    slugs.add(String(entry.slug));
  }
}
function checkDocumentary(value: unknown, bundle: ResearchBundle): asserts value is DocumentaryAudit {
  if (!researchObject(value) || value.version !== 1 || value.pdf_sha256 !== bundle.metadata.pdf_sha256 || !nonempty(value.audited_on) || !Array.isArray(value.source_checks) || !Array.isArray(value.records)) throw new Error("Auditoria documental incompatível com o PDF.");
  const sources = new Map<string, Record<string, unknown>>();
  for (const s of value.source_checks) {
    if (!researchObject(s) || !nonempty(s.id) || sources.has(s.id) || !nonempty(s.url) || !safeResearchUrl(s.url) || !["primary", "secondary"].includes(String(s.source_kind)) || !["accessed", "blocked", "not_located"].includes(String(s.access_status))) throw new Error("Fonte documental inválida ou duplicada.");
    sources.set(s.id, s);
  }
  const verifyEvidence = (record: Record<string, unknown>) => {
    if (!Array.isArray(record.evidence)) throw new Error("Lista de evidências inválida.");
    for (const e of record.evidence) {
      if (!researchObject(e) || !nonempty(e.source_id) || !sources.has(e.source_id) || !nonempty(e.url) || !safeResearchUrl(e.url) || sources.get(e.source_id)?.access_status !== "accessed" || !nonempty(e.locator) || !nonempty(e.finding) || !Array.isArray(e.fields) || !e.fields.length || !e.fields.every(nonempty)) throw new Error("Evidência sem fonte acessada, campos ou localizador.");
      if (new URL(e.url).href !== new URL(String(sources.get(e.source_id)?.url)).href) throw new Error("URL da evidência não corresponde à fonte registrada.");
    }
    const verifiedKind = record.audit_status === "verified_primary" ? "primary" : record.audit_status === "verified_secondary" ? "secondary" : null;
    if (verifiedKind && !record.evidence.some(e => researchObject(e) && sources.get(String(e.source_id))?.source_kind === verifiedKind)) throw new Error("Verificação documental exige evidência da fonte correspondente.");
  };
  const candidates = new Map(bundle.records.map(r => [r.candidate_id, r]));
  const ids = new Set<string>();
  for (const r of value.records) {
    if (!researchObject(r) || !nonempty(r.candidate_id) || !candidates.has(r.candidate_id) || ids.has(r.candidate_id) || !auditStatuses.includes(r.audit_status as AuditStatus) || !nonempty(r.summary) || !Array.isArray(r.evidence) || !Array.isArray(r.proposed_corrections)) throw new Error("Registro de auditoria inválido ou referência de candidato quebrada.");
    ids.add(r.candidate_id);
    verifyEvidence(r);
    for (const p of r.proposed_corrections) {
      if (!researchObject(p) || !["field", "original", "proposed", "reason", "source_id", "locator"].every(k => nonempty(p[k])) || !sources.has(String(p.source_id)) || sources.get(String(p.source_id))?.access_status !== "accessed") throw new Error("Proposta sem justificativa e fonte consultada.");
      const raw = candidates.get(r.candidate_id)!;
      const column = /^raw_columns\[(\d+)\]$/.exec(String(p.field));
      const observed = column ? raw.raw_columns[Number(column[1])] : raw[String(p.field)];
      if (observed !== p.original) throw new Error("Proposta não preserva o valor original.");
    }
  }
  if (value.other_entities !== undefined) {
    if (!Array.isArray(value.other_entities)) throw new Error("Entidades complementares inválidas.");
    const otherIds = new Set<string>();
    for (const r of value.other_entities) {
      if (!researchObject(r) || !nonempty(r.id) || otherIds.has(r.id) || !nonempty(r.kind) || !auditStatuses.includes(r.audit_status as AuditStatus) || !nonempty(r.summary)) throw new Error("Entidade complementar inválida ou duplicada.");
      otherIds.add(r.id); verifyEvidence(r);
    }
  }
}
function normalizedRecord(r: ResearchCandidate) {
  return { slug: normalizeObserved(r.slug_provisional), hangul: normalizeObserved(r.hangul_extracted), romanization: normalizeObserved(r.romanization_extracted), category: normalizeObserved(r.category_provisional), name_pt: normalizeObserved(typeof r.name_pt_raw === "string" ? r.name_pt_raw : "") };
}
const normalizedFields = { slug: "slug_provisional", hangul: "hangul_extracted", romanization: "romanization_extracted", category: "category_provisional", name_pt: "name_pt_raw" } as const;
function compare(r: ResearchCandidate, existing: ExistingResearchTerm[]): ResearchMatch[] {
  const n = normalizedRecord(r);
  const matches: ResearchMatch[] = [];
  for (const e of existing) {
    let kind: ResearchMatch["kind"] | null = null;
    if (e.slug === n.slug) kind = "exact_slug";
    else if (identity(e.slug) === identity(n.slug)) kind = "normalized_slug";
    else if (e.aliases?.some(a => identity(a.alias) === identity(n.romanization) || identity(a.alias) === identity(n.slug))) kind = "explicit_alias";
    else if (n.hangul && identity(e.hangul) === identity(n.hangul) && identity(e.romanization) === identity(n.romanization)) kind = "same_identity";
    else if (e.slug === r.existing_slug_or_variant_candidate || (n.slug !== e.slug && (n.slug.endsWith("-" + e.slug) || e.slug.endsWith("-" + n.slug)))) kind = "possible_variant_review";
    if (!kind) continue;
    const conflicts = kind === "possible_variant_review" ? [] : (["hangul", "romanization", "category"] as const).filter(k => identity(e[k]) !== identity(n[k]));
    matches.push({ kind, existing: structuredClone(e), conflicts, requires_human_resolution: true });
  }
  const ranks = ["exact_slug", "normalized_slug", "explicit_alias", "same_identity", "possible_variant_review"];
  return matches.sort((a, b) => ranks.indexOf(a.kind) - ranks.indexOf(b.kind) || a.existing.slug.localeCompare(b.existing.slug));
}
/** Pure operation. No catalog mutation, persistence, approval or publication. */
export function auditResearch(input: unknown, existingInput: unknown, documentaryInput: unknown = null): AuditedResearchBundle {
  const bundle = parseResearchBundle(input);
  validateResearchJson(existingInput); validateExisting(existingInput);
  if (documentaryInput !== null) { validateResearchJson(documentaryInput); checkDocumentary(documentaryInput, bundle); }
  const documentary = documentaryInput as DocumentaryAudit | null;
  const documents = new Map(documentary?.records.map(r => [r.candidate_id, r]) || []);
  const records = bundle.records.map(r => {
    const normalized = normalizedRecord(r), matches = compare(r, existingInput);
    const doc = documents.get(r.candidate_id);
    const objective_changes = Object.entries(normalizedFields).flatMap(([field, rawField]) => {
      const observed = r[rawField], value = normalized[field as keyof typeof normalized];
      return typeof observed === "string" && value !== observed ? [{ field, original: observed, normalized: value, reason: "Unicode NFC, LF e espaços nas bordas; significado preservado." }] : [];
    });
    const duplicate_candidate_ids = bundle.records.filter(other => other.candidate_id !== r.candidate_id && (identity(other.slug_provisional) === identity(r.slug_provisional) || (r.hangul_extracted.trim() && identity(other.hangul_extracted) === identity(r.hangul_extracted) && identity(other.romanization_extracted) === identity(r.romanization_extracted)))).map(other => other.candidate_id);
    const incomplete_fields = ["hangul_extracted", "romanization_extracted", "name_pt_raw", "surface_raw", "target_raw", "movement_raw"].filter(key => !nonempty(r[key]));
    return {
      candidate_id: r.candidate_id, original: structuredClone(r), normalized, objective_changes, matches,
      resolution: matches.length ? "matched_review" as const : "unmatched_review" as const,
      duplicate_candidate_ids, incomplete_fields,
      audit_status: doc?.audit_status || (r.normalization_issues.includes("id_pdf_fragmented_or_inconsistent") ? "extraction_error" : "insufficient_evidence"),
      summary: doc?.summary || "Sem conferência documental individual nesta entrada. A1 é apenas o rótulo do PDF; tradução e execução aguardam revisão humana.",
      evidence: structuredClone(doc?.evidence || []), proposed_corrections: structuredClone(doc?.proposed_corrections || []),
    };
  });
  return { format: "taekwondo-research-audit", version: 1, metadata: structuredClone(bundle.metadata), existing_terms: structuredClone(existingInput), documentary: structuredClone(documentary), records };
}
/** Re-derive every comparison/normalization; reject an edited or partially valid report. */
export function parseAuditFile(input: unknown): AuditedResearchBundle {
  validateResearchJson(input);
  if (!researchObject(input) || input.format !== "taekwondo-research-audit" || input.version !== 1 || !Array.isArray(input.records)) throw new Error("Relatório de auditoria inválido.");
  const originals = input.records.map(r => researchObject(r) ? r.original : null);
  const result = auditResearch({ metadata: input.metadata, records: originals }, input.existing_terms, input.documentary);
  for (let i = 0; i < result.records.length; i++) {
    if (JSON.stringify(input.records[i]) !== JSON.stringify(result.records[i])) throw new Error("Normalização, evidência ou comparação adulterada no relatório; gere novamente pelo pipeline.");
  }
  return result;
}
export function searchResearchRecord(r: AuditedResearchRecord, query: string): boolean {
  const haystack = [r.candidate_id, ...Object.values(r.normalized), ...r.original.raw_columns, ...r.matches.flatMap(m => [m.existing.slug, m.existing.romanization, m.existing.translation_pt])].join(" ");
  return identity(haystack).includes(identity(query));
}
