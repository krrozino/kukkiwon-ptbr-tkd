import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fixture from "./fixtures/term-semantics.json";
import { canReadTermSemantics, fetchPublishedTermSemantics } from "../src/lib/public-term-semantics";
import { TermSemanticsDetails } from "../src/components/TermSemanticsPanel";
import { parsePublishedTermSemantics } from "../src/lib/term-semantics";

const api = vi.hoisted(() => ({ fetchPublic: vi.fn() }));
vi.mock("../src/lib/catalog-api", () => ({ fetchPublic: api.fetchPublic }));

const termId = "42000000-0000-4000-8000-000000000001";

function dataForTerm() {
  const data = structuredClone(fixture.data);
  data.senses = data.senses.filter(s => s.term_id === termId);
  data.claims = data.claims.filter(c => c.term_id === termId);
  for (const row of [...data.senses, ...data.claims])
    Object.assign(row, {
      editorial_status: "technical_reviewed",
      publication_status: "published",
      checked_at: "2026-11-06T12:00:00Z",
      approved_at: "2026-11-06T13:00:00Z",
    });
  return data;
}

beforeEach(() => {
  vi.stubEnv("PUBLIC_CONTENT_REVIEW", "false");
  vi.stubEnv("PUBLIC_KNOWLEDGE_SCHEMA", "false");
  vi.stubEnv("PUBLIC_TERM_SEMANTICS_SCHEMA", "false");
  api.fetchPublic.mockReset();
});
afterEach(() => vi.unstubAllEnvs());

describe("ficha semântica com fonte individual", () => {
  it("não consulta as novas tabelas enquanto qualquer flag de schema estiver inativa", async () => {
    vi.stubEnv("PUBLIC_TERM_SEMANTICS_SCHEMA", "true");
    expect(canReadTermSemantics()).toBe(false);
    expect(await fetchPublishedTermSemantics(termId)).toEqual({ senses: [], claims: [] });
    vi.stubEnv("PUBLIC_KNOWLEDGE_SCHEMA", "true");
    vi.stubEnv("PUBLIC_CONTENT_REVIEW", "true");
    expect(canReadTermSemantics()).toBe(false);
    expect(await fetchPublishedTermSemantics(termId)).toEqual({ senses: [], claims: [] });
    expect(api.fetchPublic).not.toHaveBeenCalled();
  });

  it("consulta somente publicação elegível, com projeções explícitas e sem dados privados", async () => {
    vi.stubEnv("PUBLIC_KNOWLEDGE_SCHEMA", "true");
    vi.stubEnv("PUBLIC_TERM_SEMANTICS_SCHEMA", "true");
    const data = dataForTerm();
    api.fetchPublic.mockImplementation(async (table, params) => {
      expect(params.get("term_id")).toBe("eq." + termId);
      expect(params.get("publication_status")).toBe("eq.published");
      expect(params.get("select")).not.toContain("approved_by");
      expect(params.get("select")).not.toContain("evidence_id");
      return table === "term_senses" ? data.senses : data.claims;
    });
    const result = await fetchPublishedTermSemantics(termId);
    expect(result.senses).toHaveLength(1);
    expect(result.claims.length).toBeGreaterThan(1);
    expect(api.fetchPublic).toHaveBeenCalledTimes(2);
  });

  it("não aceita draft, referência insegura nem ID arbitrário", async () => {
    vi.stubEnv("PUBLIC_KNOWLEDGE_SCHEMA", "true");
    vi.stubEnv("PUBLIC_TERM_SEMANTICS_SCHEMA", "true");
    await expect(fetchPublishedTermSemantics("script")).rejects.toThrow("Identificador");
    const data = dataForTerm();
    data.senses[0].publication_status = "draft";
    api.fetchPublic.mockImplementation(async table => table === "term_senses" ? data.senses : data.claims);
    await expect(fetchPublishedTermSemantics(termId)).rejects.toThrow(/não publicado/);
    data.senses[0].publication_status = "published";
    data.senses[0].source_snapshot.official_url = "javascript:alert(1)";
    await expect(fetchPublishedTermSemantics(termId)).rejects.toThrow(/Referência documental/);
  });

  it("exibe cada sentido e variante com link e localizador próprios", () => {
    const html = renderToStaticMarkup(createElement(TermSemanticsDetails, { data: parsePublishedTermSemantics(dataForTerm(), termId) }));
    expect(html).toContain("Significado técnico");
    expect(html).toContain("Base com peso atrás");
    expect(html).toContain("Dwitgubi");
    expect(html).toContain("Duit kubi");
    expect(html).toContain("§15 Seogi");
    expect(html).toContain("https://research.kukkiwon.or.kr/");
    expect(html).toContain('lang="ko"');
    expect(html).not.toContain("evidence_id");
    expect(html).not.toContain("approved_by");
  });

  it("não cria conteúdo nem fontes quando a resposta publicada está vazia", () => {
    const html = renderToStaticMarkup(createElement(TermSemanticsDetails, {data: { senses: [], claims: [] }}));
    expect(html).toBe("");
  });
});
