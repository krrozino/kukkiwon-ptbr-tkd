import { safeResearchUrl, type AuditedResearchBundle } from "./research-audit.ts";
import { researchObject, validateResearchJson } from "./research-loader.ts";

export const reviewChecklist = { source: "Fonte e página conferidas", korean: "Hangul e romanização conferidos", translation: "Tradução discutida com especialista", technique: "Execução discutida com professor", anatomy: "Contato e alvo distinguidos", duplication: "Correspondências e variantes analisadas", rights: "Direitos de mídia conferidos", curriculum: "Contexto curricular delimitado" } as const;
export type ChecklistKey = keyof typeof reviewChecklist;
export const proposalFields = ["hangul_extracted", "romanization_extracted", "name_pt_raw", "surface_raw", "target_raw", "movement_raw", "slug_provisional", "category_provisional"] as const;
export type ReviewInput = { candidate_id: string } & (
  { kind: "checklist"; key: string; checked: boolean } |
  { kind: "note"; text: string } |
  { kind: "proposal"; field: string; proposed: string; reason: string; url: string; locator: string }
);
export type ReviewEvent = { event_id: string; previous_event_id: string | null; sequence: number; candidate_id: string; kind: "checklist" | "note" | "proposal"; actor_name: string; recorded_at: string; data: Record<string, unknown> };
export type ReviewSession = { format: "taekwondo-local-review"; version: 1; identity_assurance: "self_declared_local"; bundle_fingerprint: string; pdf_sha256: string; actor_name: string; created_at: string; events: ReviewEvent[] };
const text = (v: unknown, min = 1, max = 5_000): v is string => typeof v === "string" && v.trim().length >= min && v.length <= max;
const iso = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(v) && Number.isFinite(Date.parse(v));
const uuid = (v: unknown): v is string => typeof v === "string" && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(v);
async function fingerprint(bundle: AuditedResearchBundle): Promise<string> {
  const payload = JSON.stringify({ pdf: bundle.metadata.pdf_sha256, records: bundle.records.map(r => r.original) });
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, "0")).join("");
}
export async function createReviewSession(bundle: AuditedResearchBundle, actorName: string): Promise<ReviewSession> {
  if (!text(actorName, 3, 200)) throw new Error("Informe sua identificação real para registrar observações locais.");
  return { format: "taekwondo-local-review", version: 1, identity_assurance: "self_declared_local", bundle_fingerprint: await fingerprint(bundle), pdf_sha256: bundle.metadata.pdf_sha256, actor_name: actorName.trim(), created_at: new Date().toISOString(), events: [] };
}
function reviewData(input: ReviewInput, bundle: AuditedResearchBundle): Record<string, unknown> {
  const candidate = bundle.records.find(r => r.candidate_id === input.candidate_id);
  if (!candidate) throw new Error("Candidato ausente do lote.");
  if (input.kind === "checklist" && Object.hasOwn(reviewChecklist, input.key) && typeof input.checked === "boolean") return { key: input.key, checked: input.checked };
  if (input.kind === "note" && text(input.text)) return { text: input.text.trim() };
  if (input.kind === "proposal" && proposalFields.includes(input.field as typeof proposalFields[number]) && text(input.proposed) && text(input.reason, 10) && text(input.locator) && safeResearchUrl(input.url)) {
    const original = candidate.original[input.field];
    if (typeof original !== "string") throw new Error("Campo original ausente; não inventar dados para completar a ficha.");
    return { field: input.field, original, proposed: input.proposed, reason: input.reason, url: input.url, locator: input.locator };
  }
  throw new Error("Evento inválido. O laboratório registra propostas e checklist; não possui aprovação.");
}
export function appendReviewEvent(session: ReviewSession, bundle: AuditedResearchBundle, input: ReviewInput): ReviewSession {
  if (session.events.length >= 2_000 || session.pdf_sha256 !== bundle.metadata.pdf_sha256) throw new Error("Sessão incompatível ou limite de eventos atingido.");
  validateResearchJson(input);
  const data = reviewData(input, bundle);
  const event: ReviewEvent = { event_id: crypto.randomUUID(), previous_event_id: session.events.at(-1)?.event_id || null, sequence: session.events.length + 1, candidate_id: input.candidate_id, kind: input.kind, actor_name: session.actor_name, recorded_at: new Date().toISOString(), data };
  return { ...session, events: [...session.events, event] };
}
/** Import is a portable local note history, never authenticated approval evidence. */
export async function parseReviewSession(input: unknown, bundle: AuditedResearchBundle): Promise<ReviewSession> {
  validateResearchJson(input);
  if (!researchObject(input) || input.format !== "taekwondo-local-review" || input.version !== 1 || input.identity_assurance !== "self_declared_local" || input.pdf_sha256 !== bundle.metadata.pdf_sha256 || input.bundle_fingerprint !== await fingerprint(bundle) || !text(input.actor_name, 3, 200) || !iso(input.created_at) || !Array.isArray(input.events) || Object.keys(input).some(k => !["format", "version", "identity_assurance", "bundle_fingerprint", "pdf_sha256", "actor_name", "created_at", "events"].includes(k))) throw new Error("Sessão inválida ou pertencente a outro lote. Nenhuma alteração aplicada.");
  const ids = new Set<string>();
  let previous: string | null = null;
  for (const [i, event] of input.events.entries()) {
    if (!researchObject(event) || !uuid(event.event_id) || ids.has(event.event_id) || event.previous_event_id !== previous || event.sequence !== i + 1 || event.actor_name !== input.actor_name || !iso(event.recorded_at) || !text(event.candidate_id, 1, 100) || !researchObject(event.data) || Object.keys(event).some(k => !["event_id", "previous_event_id", "sequence", "candidate_id", "kind", "actor_name", "recorded_at", "data"].includes(k))) throw new Error("Histórico de revisão inválido ou encadeamento inconsistente.");
    const reconstructed = reviewData({ ...event.data, candidate_id: event.candidate_id, kind: event.kind } as ReviewInput, bundle);
    if (JSON.stringify(reconstructed) !== JSON.stringify(event.data)) throw new Error("Proposta ou checklist adulterados.");
    ids.add(event.event_id); previous = event.event_id;
  }
  return structuredClone(input) as ReviewSession;
}
export function candidateReviewState(session: ReviewSession | null, candidateId: string) {
  const history = session?.events.filter(e => e.candidate_id === candidateId) || [];
  const checklist: Partial<Record<ChecklistKey, boolean>> = {};
  for (const e of history) if (e.kind === "checklist") checklist[e.data.key as ChecklistKey] = e.data.checked as boolean;
  return { checklist, history };
}
