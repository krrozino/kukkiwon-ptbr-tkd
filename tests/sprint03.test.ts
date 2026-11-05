import { describe, it, expect } from "vitest";
import { initialCurriculum, parseCurriculum } from "../src/lib/curriculum";
import { validateSchoolImage } from "../src/lib/school-images";
import { schoolError } from "../src/lib/school-api";

describe("piloto da escola", () => {
  it("inicia com currículo editável sem inventar requisitos ou graduações homologadas", () => {
    const c = parseCurriculum(structuredClone(initialCurriculum));
    expect(c.grades).toHaveLength(1);
    expect(c.grades[0].requirements).toHaveLength(0);
    c.grades[0].name = "Faixa inicial da escola";
    c.grades[0].requirements.push({
      id: "pratica", title: "Prática definida pelo professor",
      kind: "tecnica", termSlug: "", mediaId: "",
      notes: "Orientação adaptada pelo professor",
    });
    expect(parseCurriculum(c).grades[0].requirements[0].notes).toMatch(/adaptada/);
    expect(parseCurriculum(initialCurriculum).grades[0].requirements).toHaveLength(0);
  });
  it("recusa arquivos vazios, vídeo, SVG, conteúdo incompatível e imagem acima de 5 MiB", async () => {
    for (const file of [
      new File([], "vazia.png", { type: "image/png" }),
      new File(["video"], "filme.mp4", { type: "video/mp4" }),
      new File(["<svg/>"], "vetor.svg", { type: "image/svg+xml" }),
      new File(["<html>"], "falsa.png", { type: "image/png" }),
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], "grande.png", { type: "image/png" }),
    ]) await expect(validateSchoolImage(file)).rejects.toThrow();
    const png = new File([new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,0])], "foto.png", { type: "image/png" });
    expect(await validateSchoolImage(png)).toBe("png");
  });
  it("explica confirmação, sessão expirada e limite de email sem mostrar dados do provedor", () => {
    expect(schoolError({code:"email_not_confirmed"})).toMatch(/confirm/i);
    expect(schoolError({code:"over_email_send_rate_limit"})).toMatch(/aguarde/i);
    expect(schoolError({code:"refresh_token_not_found"})).toMatch(/entre novamente/i);
    expect(schoolError({code:"invalid_credentials"})).toMatch(/email ou senha/i);
  });
});
