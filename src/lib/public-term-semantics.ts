import { fetchPublic } from "./catalog-api";
import {
  parsePublishedTermSemantics,
  TERM_CLAIM_COLUMNS,
  TERM_SENSE_COLUMNS,
  type TermSemantics,
} from "./term-semantics";

/**
 * New semantic tables depend on BOTH migrations (research and term semantics).
 * A build without an explicit opt-in makes no requests to either table.
 */
export function canReadTermSemantics(): boolean {
  return import.meta.env.PUBLIC_CONTENT_REVIEW !== "true" &&
    import.meta.env.PUBLIC_KNOWLEDGE_SCHEMA === "true" &&
    import.meta.env.PUBLIC_TERM_SEMANTICS_SCHEMA === "true";
}
const empty = (): TermSemantics => ({ senses: [], claims: [] });
const validId = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

async function publishedRows(
  table: "term_senses" | "term_field_claims",
  columns: string,
  termId: string,
  signal?: AbortSignal,
): Promise<unknown[]> {
  const rows: unknown[] = [];
  // Capped to avoid accidentally making an unbounded number of requests.
  for (let offset = 0; offset <= 400; offset += 100) {
    const params = new URLSearchParams({
      select: columns,
      term_id: "eq." + termId,
      publication_status: "eq.published",
      order: "created_at.asc,id.asc",
      limit: "100",
      offset: String(offset),
    });
    const page = await fetchPublic<unknown>(table, params, signal);
    if (!Array.isArray(page) || page.length > 100)
      throw new Error("Resposta inválida das referências técnicas.");
    rows.push(...page);
    if (page.length < 100) return rows;
  }
  throw new Error("Limite de paginação dos significados atingido.");
}

/** Do not call until the exact schema is deployed and explicitly enabled. */
export async function fetchPublishedTermSemantics(
  termId: string,
  signal?: AbortSignal,
): Promise<TermSemantics> {
  if (!canReadTermSemantics()) return empty();
  if (!validId(termId)) throw new Error("Identificador de técnica inválido.");
  const [senses, claims] = await Promise.all([
    publishedRows("term_senses", TERM_SENSE_COLUMNS, termId, signal),
    publishedRows("term_field_claims", TERM_CLAIM_COLUMNS, termId, signal),
  ]);
  return parsePublishedTermSemantics({ senses, claims }, termId);
}
