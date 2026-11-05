import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { validateBatches, generateImportSql } from "../scripts/content.mjs";
const expansion = JSON.parse(
  readFileSync(
    new URL("../content/review/kukkiwon-2012-expansion.json", import.meta.url),
  ),
);
const first = JSON.parse(
  readFileSync(
    new URL("../content/review/kukkiwon-2012-first20.json", import.meta.url),
  ),
);
const sonnal = JSON.parse(
  readFileSync(
    new URL("../content/review/sprint02-sonnal-variants.json", import.meta.url),
  ),
);
describe("barreira editorial de pesquisa", () => {
  it("valida os lotes versionados sem promover extração automatizada", () => {
    const result = validateBatches([first, expansion, sonnal]);
    expect(result.errors).toEqual([]);
    expect(result.records).toBe(108);
    expect(result.research).toBe(88);
    expect(result.document_checked).toBe(20);
  });
  it.each([
    [
      "publicação",
      (r) => {
        r.publication_status = "published";
      },
    ],
    [
      "fonte sem localizador",
      (r) => {
        r.source_locator = "";
      },
    ],
    [
      "conferência humana inexistente",
      (r) => {
        r.editorial_status = "document_checked";
      },
    ],
    [
      "sinônimo genérico falso",
      (r) => {
        r.slug = "an-makgi";
        r.aliases = [
          {
            alias: "Momtong-makgi",
            alias_kind: "search",
            source_locator: "§10",
          },
        ];
      },
    ],
  ])("rejeita %s", (_, mutate) => {
    const batch = structuredClone(expansion);
    mutate(batch.records[0]);
    expect(validateBatches([batch]).errors.length).toBeGreaterThan(0);
  });
  it("rejeita duplicatas entre arquivos e URL não institucional", () => {
    expect(
      validateBatches([expansion, expansion]).errors.some((e) =>
        e.includes("duplicado"),
      ),
    ).toBe(true);
    const batch = structuredClone(expansion);
    batch.source.url = "https://example.com/book";
    expect(validateBatches([batch]).errors.length).toBeGreaterThan(0);
  });
  it("gera SQL somente após validação e escapa apóstrofos", () => {
    const batch = structuredClone(expansion);
    batch.records = [batch.records[0]];
    batch.records[0].translation_pt = "Teste d'água";
    const sql = generateImportSql(batch);
    expect(sql).toContain("Teste d''água");
    batch.records[0].publication_status = "published";
    expect(() => generateImportSql(batch)).toThrow();
  });
});
