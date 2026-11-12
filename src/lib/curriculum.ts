export type RequirementKind =
  | "tecnica"
  | "poomsae"
  | "teoria"
  | "material"
  | "matchuo-kyorugi"
  | "palgwae"
  | "iron"
  | "kibon-dongjak"
  | "balkisul"
  | "sonkisul";

export type Requirement = {
  id: string;
  title: string;
  kind: RequirementKind;
  termSlug: string;
  notes: string;
  mediaId: string;
  schoolTermId?: string;
  sequenceStart?: number;
  sequenceEnd?: number;
  sequenceType?: string;
  libraryCategory?: string;
};
export type Grade = { id: string; name: string; requirements: Requirement[] };
export type Curriculum = {
  title: string;
  description: string;
  grades: Grade[];
};
const VALID_KINDS: RequirementKind[] = [
  "tecnica",
  "poomsae",
  "teoria",
  "material",
  "matchuo-kyorugi",
  "palgwae",
  "iron",
  "kibon-dongjak",
  "balkisul",
  "sonkisul",
];

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
        !VALID_KINDS.includes(r.kind) ||
        !text(r.termSlug, 120) ||
        (r.termSlug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.termSlug)) ||
        !text(r.notes, 3000) ||
        !text(r.mediaId, 100) ||
        ((r.sequenceStart === undefined) !== (r.sequenceEnd === undefined)) ||
        (r.sequenceStart !== undefined && (!Number.isSafeInteger(r.sequenceStart) || r.sequenceStart < 1 || r.sequenceStart > 100)) ||
        (r.sequenceEnd !== undefined && (!Number.isSafeInteger(r.sequenceEnd) || r.sequenceEnd < (r.sequenceStart ?? 1) || r.sequenceEnd > 100)) ||
        (r.sequenceType !== undefined && (!['sebon','dubon','anjoa','sequência'].includes(r.sequenceType) ||
          r.sequenceStart === undefined || r.sequenceEnd === undefined)) ||
        (r.libraryCategory !== undefined && (!text(r.libraryCategory, 50) || !VALID_KINDS.includes(r.libraryCategory as RequirementKind)))
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
/** Intervalos são definidos pelo currículo de cada escola, sem sequência universal. */
export function sequenceLabel(r: Pick<Requirement, 'sequenceType'|'sequenceStart'|'sequenceEnd'>): string | null {
  if (r.sequenceStart === undefined || r.sequenceEnd === undefined) return null;
  const types: Record<string,string> = { sebon:'Sebon', dubon:'Dubon', anjoa:'Anjoa', 'sequência':'Sequência' };
  return ((r.sequenceType && types[r.sequenceType]) || 'Sequência') + ' ' + r.sequenceStart + ' a ' + r.sequenceEnd;
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
