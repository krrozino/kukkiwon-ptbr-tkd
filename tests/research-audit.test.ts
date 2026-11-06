import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { auditResearch, parseAuditFile, normalizeObserved, type ExistingResearchTerm } from "../src/lib/research-audit";
import type { ResearchBundle } from "../src/lib/research-loader";

const original = JSON.parse(readFileSync("content/research/gemini-2026-11-06/original/tecnicas_rascunho.json", "utf8")) as ResearchBundle;
const one = () => ({ metadata: { ...original.metadata, technical_candidates: 1 }, records: [structuredClone(original.records[0])] });
const existing = (): ExistingResearchTerm[] => [{ slug: "ap-chagi", hangul: "앞차기", romanization: "Ap-chagi", category: "chute", translation_pt: "Chute frontal", definition_pt: "Texto editorial existente", record_kind: "technique", source_locator: "§1 Chagi > Ap-chagi", batch: "first20" }];

describe("Pipeline de pesquisa sem promoção", () => {
  it("preserva originais e não modifica os lotes existentes", () => {
    const b = one(), e = existing(), before = JSON.stringify([b, e]);
    const result = auditResearch(b, e);
    expect(JSON.stringify([b, e])).toBe(before);
    expect(result.records[0].original).toEqual(b.records[0]);
    expect(result.records[0].audit_status).toBe("insufficient_evidence");
    expect(result.records[0].original.publication_status).toBe("draft");
    expect(result.records[0].matches[0].kind).toBe("exact_slug");
  });
  it("normaliza somente NFC, CRLF e bordas, sem juntar fragmentos nem retirar números", () => {
    expect(normalizeObserved("  ac\u0327a\u0303o\r\nFronta\nl1  ")).toBe("ação\nFronta\nl1");
    const x = normalizeObserved("앞차기".normalize("NFD"));
    expect(x).toBe("앞차기"); expect(normalizeObserved(x)).toBe(x);
  });
  it("mesmo slug com Hangul divergente é conflito explícito", () => {
    const e = existing(); e[0].hangul = "뒤차기";
    const r = auditResearch(one(), e).records[0];
    expect(r.matches[0].conflicts).toContain("hangul");
    expect(r.original.hangul_extracted).toBe("앞차기");
    expect(r.matches[0].existing.hangul).toBe("뒤차기");
  });
  it("não transforma sugestão de variante em sinônimo confirmado", () => {
    const b = one(); b.records[0].slug_provisional = "twieo-ap-chagi";
    b.records[0].hangul_extracted = "뛰어앞차기"; b.records[0].romanization_extracted = "Twieo-ap-chagi";
    const r = auditResearch(b, existing()).records[0];
    expect(r.matches[0].kind).toBe("possible_variant_review");
    expect(r.matches[0].requires_human_resolution).toBe(true);
  });
  it("não considera um candidato sem correspondência uma técnica nova", () => {
    const r = auditResearch(one(), []).records[0];
    expect(r.matches).toEqual([]); expect(r.resolution).toBe("unmatched_review");
  });
  it("sinaliza duplicatas internas sem remover registros", () => {
    const b = one(); b.metadata.technical_candidates = 2;
    b.records.push({ ...b.records[0], candidate_id: "TC-CHA-002" });
    const r = auditResearch(b, existing());
    expect(r.records).toHaveLength(2);
    expect(r.records[0].duplicate_candidate_ids).toEqual(["TC-CHA-002"]);
  });
  it("rejeita identidades existentes duplicadas antes de comparar", () => {
    expect(() => auditResearch(one(), [...existing(), ...existing()])).toThrow(/duplicad/);
  });
  it("é idempotente e conserva A1 apenas como rótulo da pesquisa", () => {
    const a = auditResearch(original, existing());
    expect(a).toEqual(auditResearch(original, existing()));
    expect(a.records[0].audit_status).not.toBe("verified_primary");
    expect(parseAuditFile(JSON.parse(JSON.stringify(a)))).toEqual(a);
  });
  it("rejeita relatório com referência quebrada ou verificação sem fonte acessada", () => {
    const a = auditResearch(one(), existing());
    a.records[0].audit_status = "verified_primary";
    expect(() => parseAuditFile(a)).toThrow(/evidência|fonte/i);
  });
  it("não usa o rótulo de uma fonte primária para citar outra URL", () => {
    const documentary = JSON.parse(readFileSync("content/research/gemini-2026-11-06/document-audit.json", "utf8"));
    documentary.records[0].evidence[0].url = "https://example.org/unrelated";
    expect(() => auditResearch(original, [], documentary)).toThrow(/URL|fonte/i);
  });
  it.each(["URL divergente", "verificação vazia"])("valida também entidades complementares: %s", kind => {
    const documentary = JSON.parse(readFileSync("content/research/gemini-2026-11-06/document-audit.json", "utf8"));
    if (kind === "URL divergente") documentary.other_entities[0].evidence[0].url = "https://example.org/unrelated";
    else { documentary.other_entities[0].audit_status = "verified_primary"; documentary.other_entities[0].evidence = []; }
    expect(() => auditResearch(original, [], documentary)).toThrow(/URL|fonte|evidência/i);
  });
  it("rejeita normalização adulterada em relatório externo", () => {
    const a = auditResearch(one(), existing()); a.records[0].normalized.hangul = "뒤차기";
    expect(() => parseAuditFile(a)).toThrow(/normaliza/i);
  });
  it("processa todos os 115 candidatos sem promover nenhum", () => {
    const r = auditResearch(original, []);
    expect(r.records).toHaveLength(115);
    expect(r.records.every(x => x.original.eligible_for_public_site === false)).toBe(true);
    expect(new Set(r.records.map(x => x.candidate_id)).size).toBe(115);
  });
});
