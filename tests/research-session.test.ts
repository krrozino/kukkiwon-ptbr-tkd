import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { auditResearch, searchResearchRecord } from "../src/lib/research-audit";
import { createReviewSession, appendReviewEvent, parseReviewSession, candidateReviewState } from "../src/lib/research-session";
import { researchCsvCell } from "../src/lib/research-reports";
const bundle = auditResearch(JSON.parse(readFileSync("content/research/gemini-2026-11-06/original/tecnicas_rascunho.json", "utf8")), []);

describe("Sessão editorial local sem aprovação", () => {
  it("exige identificação fornecida explicitamente e não inventa revisor", async () => {
    await expect(createReviewSession(bundle, "")).rejects.toThrow(/identifica/i);
    const s = await createReviewSession(bundle, "Pessoa em teste isolado");
    expect(s.identity_assurance).toBe("self_declared_local");
    expect(s.events).toEqual([]);
  });
  it("registra checklist e observação como eventos sem alterar pesquisa", async () => {
    const initial = await createReviewSession(bundle, "Pessoa em teste isolado");
    const s = appendReviewEvent(initial, bundle, { candidate_id: "TC-CHA-001", kind: "checklist", key: "source", checked: true });
    const s2 = appendReviewEvent(s, bundle, { candidate_id: "TC-CHA-001", kind: "note", text: "Conferir fonte e execução com professor." });
    expect(initial.events).toEqual([]); expect(s2.events).toHaveLength(2);
    expect(s2.events[1].previous_event_id).toBe(s2.events[0].event_id);
    expect(candidateReviewState(s2, "TC-CHA-001").checklist.source).toBe(true);
    expect(bundle.records[0].original.editorial_status).toBe("research");
    expect(await parseReviewSession(JSON.parse(JSON.stringify(s2)), bundle)).toEqual(s2);
  });
  it("proposta técnica preserva original e exige evidência", async () => {
    const initial = await createReviewSession(bundle, "Pessoa em teste isolado");
    const input = { candidate_id: "TC-CHA-001", kind: "proposal" as const, field: "hangul_extracted", proposed: "원문", reason: "Verificar divergência no cabeçalho do documento.", url: "https://example.org/fixture", locator: "§1 > fixture" };
    const s = appendReviewEvent(initial, bundle, input);
    expect(s.events[0].data.original).toBe("앞차기");
    expect(bundle.records[0].original.hangul_extracted).toBe("앞차기");
    expect(() => appendReviewEvent(initial, bundle, { ...input, url: "javascript:alert(1)" })).toThrow();
    expect(() => appendReviewEvent(initial, bundle, { ...input, reason: "" })).toThrow();
  });
  it("recusa aprovação, evento fora do lote e encadeamento adulterado", async () => {
    const s = await createReviewSession(bundle, "Pessoa em teste isolado");
    expect(() => appendReviewEvent(s, bundle, { candidate_id: "TC-CHA-001", kind: "approve" } as any)).toThrow();
    expect(() => appendReviewEvent(s, bundle, { candidate_id: "TC-CHA-999", kind: "note", text: "Obs." })).toThrow();
    const edited = appendReviewEvent(s, bundle, { candidate_id: "TC-CHA-001", kind: "note", text: "Obs." });
    edited.events[0].previous_event_id = "injected";
    await expect(parseReviewSession(edited, bundle)).rejects.toThrow();
  });
  it("sessão de outro conteúdo é rejeitada mesmo com hash de PDF igual", async () => {
    const s = await createReviewSession(bundle, "Pessoa em teste isolado");
    const modified = structuredClone(bundle); modified.records[0].original.name_pt_raw = "Outra extração";
    await expect(parseReviewSession(s, modified)).rejects.toThrow(/lote/i);
  });
  it("busca português fragmentado, Hangul decomposto e romanização", () => {
    expect(searchResearchRecord(bundle.records[0], "Chute Frontal1")).toBe(true);
    expect(searchResearchRecord(bundle.records[0], "앞차기".normalize("NFD"))).toBe(true);
    expect(searchResearchRecord(bundle.records[0], "AP CHAGI")).toBe(true);
  });
  it.each(["=HYPERLINK(\"https://example.org\")", "+SUM(A1)", "@cmd", "  -formula", "\tformula"])("neutraliza fórmula CSV: %s", value => {
    expect(researchCsvCell(value).startsWith('"\'')).toBe(true);
  });
});
