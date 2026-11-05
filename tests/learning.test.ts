import { describe, it, expect } from "vitest";
import {
  emptyStudies,
  moveFolder,
  removeFolder,
  parseStudies,
} from "../src/lib/studies";
import { parseCurriculum, safeMediaUrl } from "../src/lib/curriculum";
describe("organização pessoal", () => {
  it("impede ciclos e mantém técnicas ao excluir uma pasta", () => {
    const state = {
      ...emptyStudies(),
      folders: [
        { id: "a", name: "Chutes", parentId: null },
        { id: "b", name: "Básicos", parentId: "a" },
      ],
      items: [
        { slug: "ap-chagi", title: "Ap Chagi", folderId: "b", studied: true },
      ],
      notes: [],
    };
    expect(() => moveFolder(state, "a", "b")).toThrow(/descendente/);
    const result = removeFolder(state, "b");
    expect(result.items[0].folderId).toBe("a");
    expect(result.items[0].studied).toBe(true);
  });
  it("recusa armazenamento corrompido e restaura um caderno válido", () => {
    expect(() => parseStudies("{")).toThrow();
    expect(() =>
      parseStudies('{"version":1,"folders":[],"items":[{}],"notes":[]}'),
    ).toThrow();
    expect(parseStudies(JSON.stringify(emptyStudies())).folders).toEqual([]);
    const s=emptyStudies();s.notes=[{id:'n',title:'Teste',body:'Link',references:[{kind:'url',target:'javascript:alert(1)',label:'Link'}]}];
    expect(()=>parseStudies(JSON.stringify(s))).toThrow();
  });
});
describe("currículo e mídia", () => {
  it("valida currículos antes de persistir e preserva ordem de graduações", () => {
    const c = parseCurriculum({
      title: "Escola",
      description: "Exemplo",
      grades: [
        {
          id: "g",
          name: "Branca",
          requirements: [
            {
              id: "r",
              title: "Estudar",
              kind: "tecnica",
              termSlug: "ap-chagi",
              notes: "Rever com professor",
              mediaId: "",
            },
          ],
        },
      ],
    });
    expect(c.grades[0].requirements[0].termSlug).toBe("ap-chagi");
    expect(() =>
      parseCurriculum({
        ...c,
        grades: [{ id: "g", name: "", requirements: [] }],
      }),
    ).toThrow();
  });
  it("rejeita mídia executável, credenciais e endereços sem HTTPS", () => {
    for (const s of [
      "javascript:alert(1)",
      "http://example.org/x",
      "https://user:pass@example.org/x",
    ])
      expect(safeMediaUrl(s)).toBeNull();
    expect(safeMediaUrl("https://example.org/a.mp4")).toBe(
      "https://example.org/a.mp4",
    );
  });
});
