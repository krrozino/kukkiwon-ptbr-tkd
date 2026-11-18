export const requirementKinds = [
  "tecnica",
  "poomsae",
  "matchuo-kyorugi",
  "palgwae",
  "iron",
  "kibon-dongjak",
  "balkisul",
  "sonkisul",
  "teoria",
  "material",
] as const;

export type RequirementKind = (typeof requirementKinds)[number];

export const requirementKindLabels: Record<RequirementKind, string> = {
  tecnica: "Técnica",
  poomsae: "Poomsae",
  "matchuo-kyorugi": "Matchuo Kyorugi",
  palgwae: "Palgwae",
  iron: "Iron (Teoria)",
  "kibon-dongjak": "Kibon Dongjak",
  balkisul: "Balkisul",
  sonkisul: "Sonkisul",
  teoria: "Conhecimento teórico",
  material: "Material de estudo",
};

export const sequenceTypes = [
  "sebon",
  "dubon",
  "hanbon",
  "anjoa",
  "sequencia",
] as const;

export type SequenceType = (typeof sequenceTypes)[number];

export const sequenceTypeLabels: Record<SequenceType, string> = {
  sebon: "Sebon Kyorugi",
  dubon: "Dubon Kyorugi",
  hanbon: "Hanbon Kyorugi",
  anjoa: "Anjoa Kyorugi",
  sequencia: "Sequência da escola",
};

export type Requirement = {
  id: string;
  title: string;
  kind: RequirementKind;
  termSlug: string;
  notes: string;
  mediaId: string;
  schoolTermId?: string;
  sequenceType?: SequenceType;
  sequenceStart?: number;
  sequenceEnd?: number;
};
export type Grade = { id: string; name: string; requirements: Requirement[] };
export type Curriculum = {
  title: string;
  description: string;
  grades: Grade[];
};

export function formatRequirementSequence(
  r: Pick<Requirement, "sequenceType" | "sequenceStart" | "sequenceEnd">,
): string | null {
  if (!r.sequenceType || r.sequenceStart === undefined) return null;
  const label = sequenceTypeLabels[r.sequenceType] || "Sequência";
  const end = r.sequenceEnd ?? r.sequenceStart;
  return end === r.sequenceStart
    ? `${label} · nº ${r.sequenceStart}`
    : `${label} · ${r.sequenceStart} a ${end}`;
}

const text = (v: unknown, max = 1000): v is string =>
  typeof v === "string" && v.length <= max;
const validSeqInt = (v: unknown): v is number =>
  typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 100;

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
        !(requirementKinds as readonly string[]).includes(r.kind) ||
        !text(r.termSlug, 120) ||
        (r.termSlug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.termSlug)) ||
        !text(r.notes, 3000) ||
        !text(r.mediaId, 100)
      )
        throw new Error("Requisito inválido.");
      if (
        r.sequenceType !== undefined ||
        r.sequenceStart !== undefined ||
        r.sequenceEnd !== undefined
      ) {
        if (
          !r.sequenceType ||
          !(sequenceTypes as readonly string[]).includes(r.sequenceType) ||
          !validSeqInt(r.sequenceStart) ||
          (r.sequenceEnd !== undefined &&
            (!validSeqInt(r.sequenceEnd) || r.sequenceEnd < r.sequenceStart))
        ) {
          throw new Error("Intervalo de sequência inválido (use números inteiros entre 1 e 100).");
        }
      }
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
export const initialCurriculum: Curriculum = {
  title: "Currículo da escola",
  description: "Conteúdos e critérios definidos pelo professor responsável.",
  grades: [
    {
      id: "primeira-graduacao",
      name: "Primeira graduação",
      requirements: [],
    },
  ],
};
