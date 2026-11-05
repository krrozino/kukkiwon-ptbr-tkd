export type Requirement = {
  id: string;
  title: string;
  kind: "tecnica" | "poomsae" | "teoria" | "material";
  termSlug: string;
  notes: string;
  mediaId: string;
  schoolTermId?: string;
};
export type Grade = { id: string; name: string; requirements: Requirement[] };
export type Curriculum = {
  title: string;
  description: string;
  grades: Grade[];
};
const text = (v: unknown, max = 1000): v is string =>
  typeof v === "string" && v.length <= max;
export function parseCurriculum(v: unknown): Curriculum {
  if (!v || typeof v !== "object") throw new Error("Currículo inválido.");
  const c = v as Curriculum;
  if (
    !text(c.title, 120) ||
    !c.title.trim() ||
    !text(c.description, 5000) ||
    !Array.isArray(c.grades) ||
    c.grades.length > 50
  )
    throw new Error("Preencha o nome e a descrição do currículo.");
  const ids = new Set<string>();
  for (const g of c.grades) {
    if (
      !g ||
      !text(g.id, 100) ||
      ids.has(g.id) ||
      !text(g.name, 120) ||
      !g.name.trim() ||
      !Array.isArray(g.requirements) ||
      g.requirements.length > 200
    )
      throw new Error("Graduação inválida.");
    ids.add(g.id);
    const rids = new Set<string>();
    for (const r of g.requirements) {
      if (
        !r ||
        !text(r.id, 100) ||
        rids.has(r.id) ||
        !text(r.title, 200) ||
        !r.title.trim() ||
        !["tecnica", "poomsae", "teoria", "material"].includes(r.kind) ||
        !text(r.termSlug, 120) ||
        (r.termSlug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.termSlug)) ||
        !text(r.notes, 3000) ||
        !text(r.mediaId, 100)
      )
        throw new Error("Requisito inválido.");
      rids.add(r.id);
    }
  }
  for (const g of c.grades)
    for (const r of g.requirements)
      if (
        r.schoolTermId !== undefined &&
        !/^[0-9a-f-]{36}$/i.test(r.schoolTermId)
      )
        throw new Error("Técnica própria inválida.");
  return c;
}
export function safeMediaUrl(input: string): string | null {
  try {
    const u = new URL(input);
    return u.protocol === "https:" && !u.username && !u.password
      ? u.href
      : null;
  } catch {
    return null;
  }
}
export const demoCurriculum: Curriculum = {
  title: "Primeiros passos · faixa branca",
  description:
    "Exemplo didático independente. Requisitos demonstrativos; o professor define o currículo da escola. Não representa graduação oficial da Kukkiwon.",
  grades: [
    {
      id: "white",
      name: "Faixa branca · exemplo",
      requirements: [
        {
          id: "etiquette",
          title: "Combinar regras de convivência e segurança com o professor",
          kind: "teoria",
          termSlug: "",
          notes:
            "Conheça o espaço, respeite os colegas e siga a orientação presencial.",
          mediaId: "",
        },
        {
          id: "sonnal",
          title: "Explorar superfícies da mão",
          kind: "tecnica",
          termSlug: "",
          notes:
            "Requisito demonstrativo da escola: reconhecer a posição das mãos com orientação do professor.",
          mediaId: "",
        },
        {
          id: "ap-chagi",
          title: "Conhecer o chute frontal",
          kind: "tecnica",
          termSlug: "",
          notes: "Requisito demonstrativo da escola: praticar o movimento sem contato, com apoio e supervisão. O professor adapta a prática ao nível do aluno.",
          mediaId: "",
        },
        {
          id: "base",
          title: "Reconhecer a base e o equilíbrio",
          kind: "tecnica",
          termSlug: "",
          notes: "Requisito demonstrativo da escola: experimentar uma base confortável, com joelhos alinhados e deslocamento controlado, sob orientação presencial.",
          mediaId: "",
        },
        {
          id: "defense",
          title: "Introduzir uma defesa básica sem contato",
          kind: "tecnica",
          termSlug: "",
          notes: "Requisito demonstrativo da escola: reconhecer a trajetória indicada pelo professor, sem impacto e respeitando os limites do aluno.",
          mediaId: "",
        },
      ],
    },
  ],
};
