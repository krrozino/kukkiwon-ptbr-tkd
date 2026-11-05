import { describe, it, expect } from "vitest";
import { demoCurriculum, parseCurriculum } from "../src/lib/curriculum";
import { validateSchoolImage } from "../src/lib/school-images";
import { schoolError } from "../src/lib/school-api";

describe("piloto da escola", () => {
  it("oferece cinco requisitos editáveis de bases, chute, defesa e teoria sem depender de rascunhos", () => {
    const c = parseCurriculum(structuredClone(demoCurriculum));
    expect(c.grades[0].requirements.length).toBeGreaterThanOrEqual(5);
    expect(c.grades[0].requirements.every(r => !r.termSlug)).toBe(true);
    expect(c.grades[0].requirements.map(r => r.title).join(" ")).toMatch(/base/i);
    expect(c.grades[0].requirements.map(r => r.title).join(" ")).toMatch(/defesa/i);
    c.grades[0].requirements[0].notes = "Orientação adaptada pelo professor";
    expect(parseCurriculum(c).grades[0].requirements[0].notes).toMatch(/adaptada/);
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
