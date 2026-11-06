import { describe, expect, it } from "vitest";
import { parseResearchBundle } from "../src/lib/research-loader";

const valid = () => ({
  metadata: { bundle: "taekwondo-gemini-deep-research-audit", pdf_sha256: "a".repeat(64), pdf_pages: 89, technical_candidates: 1 },
  records: [{
    candidate_id: "TC-CHA-001", pdf_id_observed: "TC-CHA-001", category_provisional: "chute",
    slug_provisional: "ap-chagi", hangul_extracted: "앞차기", romanization_extracted: "Ap-chagi",
    pdf_pages: [19], compare_existing_repo: "exact_slug", existing_slug_or_variant_candidate: "ap-chagi",
    normalization_issues: [], raw_columns: ["A", "B"],
    editorial_status: "research", publication_status: "draft",
    eligible_for_public_site: false, institutional_source_verified_individually: false
  }]
});
describe("Pesquisa externa: entrada sempre isolada", () => {
  it("aceita lote íntegro somente como pesquisa", () => {
    const x = parseResearchBundle(valid());
    expect(x.records[0].eligible_for_public_site).toBe(false);
  });
  it.each([
    ["publicação", (x: ReturnType<typeof valid>) => { x.records[0].publication_status = "published" as "draft"; }],
    ["aprovação", (x: ReturnType<typeof valid>) => { x.records[0].editorial_status = "approved" as "research"; }],
    ["permissão de publicação", (x: ReturnType<typeof valid>) => { x.records[0].eligible_for_public_site = true as false; }],
    ["evidência falsa", (x: ReturnType<typeof valid>) => { x.records[0].institutional_source_verified_individually = true as false; }],
    ["contagem errada", (x: ReturnType<typeof valid>) => { x.metadata.technical_candidates = 2; }],
    ["página inválida", (x: ReturnType<typeof valid>) => { x.records[0].pdf_pages = [90]; }],
    ["ID duplicado", (x: ReturnType<typeof valid>) => { x.records.push({ ...x.records[0] }); }],
  ])("bloqueia %s", (_, change) => {
    const x = valid(); change(x);
    expect(() => parseResearchBundle(x)).toThrow();
  });
  it("bloqueia arquivos sem manifesto", () => {
    expect(() => parseResearchBundle([{ slug: "ap-chagi" }])).toThrow();
  });
  it.each([
    ["metadados negativos", (x: any) => { x.metadata.pdf_pages = -1; x.records[0].pdf_pages = []; }],
    ["página ausente", (x: any) => { x.records[0].pdf_pages = []; }],
    ["comparação inválida", (x: any) => { x.records[0].compare_existing_repo = { injected: true }; }],
    ["identidade observada inválida", (x: any) => { x.records[0].pdf_id_observed = null; }],
    ["revisão técnica forjada", (x: any) => { x.records[0].technical_review = "approved"; }],
    ["chave perigosa", (x: any) => { x.records[0].extra = JSON.parse('{"__proto__":{"approved":true}}'); }],
    ["campo sem limite", (x: any) => { x.records[0].romanization_extracted = "x".repeat(50_001); }],
  ])("rejeita integralmente %s", (_, change) => {
    const x = valid(); change(x);
    expect(() => parseResearchBundle(x)).toThrow();
  });
  it("rejeita falha no último registro sem alterar entrada", () => {
    const x = valid();
    x.metadata.technical_candidates = 2;
    x.records.push({ ...x.records[0], candidate_id: "TC-CHA-002", raw_columns: null as any });
    const before = JSON.stringify(x);
    expect(() => parseResearchBundle(x)).toThrow();
    expect(JSON.stringify(x)).toBe(before);
  });
});
