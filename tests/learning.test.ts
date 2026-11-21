import { describe, it, expect } from "vitest";
import {
  emptyStudies,
  moveFolder,
  removeFolder,
  parseStudies,
  studyTrails,
} from "../src/lib/studies";
import {
  formatRequirementSequence,
  parseCurriculum,
  requirementKinds,
  safeMediaUrl,
} from "../src/lib/curriculum";
import { getLibraryItem } from "../src/lib/library";
describe("organização pessoal", () => {
  it("impede ciclos e mantém técnicas ao excluir uma pasta", () => {
    const state = {
      ...emptyStudies(),
      folders: [
        { id: "a", name: "Chutes", parentId: null },
        { id: "b", name: "Básicos", parentId: "a" },
      ],
      items: [
        { slug: "ap-chagi", title: "Ap Chagi", folderId: "b", studied: true, review: true },
      ],
      notes: [],
    };
    expect(() => moveFolder(state, "a", "b")).toThrow(/descendente/);
    const result = removeFolder(state, "b");
    expect(result.items[0].folderId).toBe("a");
    expect(result.items[0].studied).toBe(true);
    expect(parseStudies(JSON.stringify(result)).items[0].review).toBe(true);
  });
  it("recusa armazenamento corrompido e restaura um caderno válido", () => {
    expect(() => parseStudies("{")).toThrow();
    expect(() =>
      parseStudies('{"version":1,"folders":[],"items":[{}],"notes":[]}'),
    ).toThrow();
    expect(() =>
      parseStudies('{"version":1,"folders":[],"items":[{"slug":"sonnal","title":"Sonnal","folderId":null,"studied":false,"review":"sim"}],"notes":[]}'),
    ).toThrow();
    expect(parseStudies(JSON.stringify(emptyStudies())).folders).toEqual([]);
    const s=emptyStudies();s.notes=[{id:'n',title:'Teste',body:'Link',references:[{kind:'url',target:'javascript:alert(1)',label:'Link'}]}];
    expect(()=>parseStudies(JSON.stringify(s))).toThrow();
  });
  it("mantém todas as trilhas guiadas apontando para fichas reais da Biblioteca", () => {
    expect(studyTrails).toHaveLength(6);
    for (const trail of studyTrails) {
      expect(trail.items.length, trail.id).toBeGreaterThanOrEqual(5);
      for (const item of trail.items) {
        expect(getLibraryItem(item.slug), `${trail.id}:${item.slug}`).toBeDefined();
      }
    }
  });
});
describe("currículo e mídia", () => {
  it("valida currículos antes de persistir, aceita as 7 áreas e valida intervalos de sequência por escola", () => {
    const c = parseCurriculum({
      title: "Escola",
      description: "Exemplo",
      grades: [
        {
          id: "g1",
          name: "Faixa Amarela",
          requirements: [
            {
              id: "r1",
              title: "Combate de três passos",
              kind: "matchuo-kyorugi",
              termSlug: "sebon-kyorugi",
              notes: "Sequências da escola",
              mediaId: "",
              sequenceType: "sebon",
              sequenceStart: 1,
              sequenceEnd: 5,
            },
          ],
        },
        {
          id: "g2",
          name: "Ponta Verde",
          requirements: [
            {
              id: "r2",
              title: "Combate de três passos ampliado",
              kind: "matchuo-kyorugi",
              termSlug: "sebon-kyorugi",
              notes: "Sequências 1 a 10",
              mediaId: "",
              sequenceType: "sebon",
              sequenceStart: 1,
              sequenceEnd: 10,
            },
          ],
        },
      ],
    });
    expect(formatRequirementSequence(c.grades[0].requirements[0])).toBe("Sebon Kyorugi · 1 a 5");
    expect(formatRequirementSequence(c.grades[1].requirements[0])).toBe("Sebon Kyorugi · 1 a 10");
    expect(formatRequirementSequence({ sequenceType: "anjoa", sequenceStart: 3, sequenceEnd: 3 })).toBe("Anjoa Kyorugi · nº 3");

    for (const kind of requirementKinds) {
      expect(() =>
        parseCurriculum({
          title: "Teste",
          description: "",
          grades: [{ id: "g", name: "Branca", requirements: [{ id: "r", title: "Item", kind, termSlug: "", notes: "", mediaId: "" }] }],
        }),
      ).not.toThrow();
    }

    expect(() =>
      parseCurriculum({
        title: "Teste",
        description: "",
        grades: [{ id: "g", name: "Branca", requirements: [{ id: "r", title: "Inválido", kind: "matchuo-kyorugi", termSlug: "", notes: "", mediaId: "", sequenceType: "sebon", sequenceStart: 8, sequenceEnd: 4 }] }],
      }),
    ).toThrow(/sequência/i);

    expect(() =>
      parseCurriculum({
        title: "Teste",
        description: "",
        grades: [{ id: "g", name: "Branca", requirements: [{ id: "r", title: "Inválido", kind: "matchuo-kyorugi", termSlug: "", notes: "", mediaId: "", sequenceType: "sebon", sequenceStart: 101 }] }],
      }),
    ).toThrow(/sequência/i);

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

