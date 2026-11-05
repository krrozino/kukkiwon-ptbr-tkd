import { describe, expect, it } from "vitest";
import { readFileSync, existsSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import {
  createReviewEntries,
  escapeSpreadsheetCell,
  serializeReviewCsv,
  parseReviewOptions,
} from "../scripts/review-export.mjs";

const load = (name) =>
  JSON.parse(
    readFileSync(new URL("../content/review/" + name, import.meta.url), "utf8"),
  );
const batches = [
  load("kukkiwon-2012-first20.json"),
  load("kukkiwon-2012-expansion.json"),
  load("sprint02-sonnal-variants.json"),
];

describe("Pacote de revisão editorial", () => {
  it("gera fila completa de 108 fichas, sem promover rascunhos", () => {
    const entries = createReviewEntries(batches);
    expect(entries).toHaveLength(108);
    expect(
      entries.filter((r) => r.estado_documental_atual === "research"),
    ).toHaveLength(88);
    expect(
      entries.filter((r) => r.estado_documental_atual === "document_checked"),
    ).toHaveLength(20);
    expect(entries.every((r) => r.decisao_final === "pendente")).toBe(true);
    expect(
      entries.every((r) => r.revisor === "" && r.link_evidencia_revisao === ""),
    ).toBe(true);
    expect(entries.every((r) => r.revisao_humana_comprovada === "nao")).toBe(
      true,
    );
  });
  it("filtra por categoria e lote sem perder seção e URL de fonte", () => {
    const entries = createReviewEntries(batches, {
      batch: "kukkiwon-2012-expansion",
      category: "chute",
    });
    expect(entries).toHaveLength(12);
    expect(entries.every((r) => r.categoria === "chute")).toBe(true);
    expect(
      entries.every((r) =>
        r.fonte_url.startsWith("https://research.kukkiwon.or.kr/"),
      ),
    ).toBe(true);
    expect(entries.every((r) => r.localizador_exato.length > 7)).toBe(true);
  });
  it("preserva as observações de grafia que precisam de conferência visual", () => {
    const entries = createReviewEntries(batches);
    for (const slug of ["jebipum-chigi", "sewo-jiruegi", "biteureo-makgi"]) {
      expect(
        entries.find((r) => r.slug === slug).observacoes_preexistentes.length,
      ).toBeGreaterThan(0);
    }
  });
  it("não interpreta URLs, traduções ou notas como fórmulas no Excel", () => {
    expect(escapeSpreadsheetCell('=HYPERLINK("https://evil.test")')).toBe(
      '"\'=HYPERLINK(""https://evil.test"")"',
    );
    expect(escapeSpreadsheetCell("  +SUM(A1:A2)")).toBe('"\'  +SUM(A1:A2)"');
    expect(escapeSpreadsheetCell('Texto "normal"; com ponto e vírgula')).toBe(
      '"Texto ""normal""; com ponto e vírgula"',
    );
    const csv = serializeReviewCsv(
      createReviewEntries(batches, {
        batch: "kukkiwon-2012-first20",
      }),
    );
    expect(csv.startsWith("\ufeff")).toBe(true);
    expect(csv.split("\r\n")).toHaveLength(22); // cabeçalho + 20 + linha final
    expect(csv).toContain('"revisar_hangul_romanizacao"');
  });
  it("bloqueia exportação de dados que não passam pela validação editorial", () => {
    const invalid = structuredClone(batches);
    invalid[1].records[0].publication_status = "published";
    expect(() => createReviewEntries(invalid)).toThrow(/exportação bloqueada/i);
    expect(() =>
      createReviewEntries(batches, { category: "categoria-inexistente" }),
    ).toThrow();
  });
  it("rejeita parâmetros inválidos e tentativas de escapar da pasta de saída", () => {
    expect(
      parseReviewOptions([
        "--batch",
        "kukkiwon-2012-expansion",
        "--output",
        "chutes.csv",
      ]),
    ).toEqual({ batch: "kukkiwon-2012-expansion", output: "chutes.csv" });
    expect(() => parseReviewOptions(["--output", "../segredos.csv"])).toThrow();
    expect(() => parseReviewOptions(["--output", "planilha.xlsx"])).toThrow();
    expect(() =>
      parseReviewOptions(["--output", "x.csv", "--output", "y.csv"]),
    ).toThrow();
    expect(() => parseReviewOptions(["--invalid", "x"])).toThrow();
  });
  it("CLI cria o CSV e recusa sobrescrever respostas existentes no disco", () => {
    const name = "test-review-" + randomUUID() + ".csv";
    const destination = resolve("review-output", name);
    const run = () =>
      spawnSync(
        process.execPath,
        ["scripts/review-export.mjs", "--output", name],
        {
          cwd: resolve("."),
          encoding: "utf8",
          windowsHide: true,
        },
      );
    try {
      const first = run();
      expect(first.status, first.stderr).toBe(0);
      const original = readFileSync(destination, "utf8");
      expect(original.startsWith("\ufeff")).toBe(true);
      expect(first.stdout).toContain("108 registros");
      const second = run();
      expect(second.status).toBe(1);
      expect(readFileSync(destination, "utf8")).toBe(original);
      expect(second.stderr).toMatch(/EEXIST/);
    } finally {
      if (existsSync(destination)) unlinkSync(destination);
    }
  });
});
