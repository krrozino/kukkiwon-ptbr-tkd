export type Folder = { id: string; name: string; parentId: string | null };
export type StudyItem = {
  slug: string;
  title: string;
  folderId: string | null;
  studied: boolean;
  review?: boolean;
};
export type Reference = {
  kind: "term" | "url" | "folder" | "curriculum";
  target: string;
  label: string;
};
export type StudyNote = {
  id: string;
  title: string;
  body: string;
  references: Reference[];
};
export type Studies = {
  version: 1;
  folders: Folder[];
  items: StudyItem[];
  notes: StudyNote[];
};

export type StudyTrail = {
  id: string;
  title: string;
  audience: string;
  description: string;
  folderName: string;
  items: readonly { slug: string; title: string }[];
};

export const studyTrails: readonly StudyTrail[] = [
  {
    id: "iniciante",
    title: "Sou iniciante",
    audience: "Primeiros passos",
    description: "Significado do Taekwondo, cortesia no dojang, alturas, primeiras bases, defesa baixa, soco e chute frontal.",
    folderName: "Trilha · Primeiros passos",
    items: [
      { slug: "iron-significado-taekwondo", title: "Significado de Tae · Kwon · Do" },
      { slug: "iron-espirito-cortesia-dojang", title: "Espírito do Taekwondo e cortesia no dojang" },
      { slug: "kibon-alturas-direcoes", title: "Alturas e direções (Olgul, Momtong, Arae)" },
      { slug: "ap-seogi", title: "Ap-seogi" },
      { slug: "apgubi", title: "Apgubi" },
      { slug: "naeryeo-makgi", title: "Naeryeo-makgi" },
      { slug: "jeocheo-jireugi", title: "Jeocheo-jireugi" },
      { slug: "ap-chagi", title: "Ap-chagi" },
    ],
  },
  {
    id: "chutes-balkisul",
    title: "Chutes e superfícies do pé",
    audience: "Balkisul + Atlas",
    description: "Conecte cada superfície anatômica do pé no Atlas aos principais chutes lineares, circulares e giratórios.",
    folderName: "Trilha · Chutes e pés",
    items: [
      { slug: "apchuk", title: "Apchuk" },
      { slug: "baldeung", title: "Baldeung" },
      { slug: "balnal", title: "Balnal" },
      { slug: "dwichuk", title: "Dwichuk" },
      { slug: "ap-chagi", title: "Ap-chagi" },
      { slug: "dollyeo-chagi", title: "Dollyeo-chagi" },
      { slug: "yeop-chagi", title: "Yeop-chagi" },
      { slug: "dwi-chagi", title: "Dwi-chagi" },
    ],
  },
  {
    id: "poomsae-taegeuk",
    title: "Poomsae (Série Taegeuk)",
    audience: "Formas e trigramas",
    description: "Estude os primeiros Taegeuk com trigramas, posturas de preparação e bases fundamentais.",
    folderName: "Trilha · Série Taegeuk",
    items: [
      { slug: "gibon-junbi", title: "Gibon-junbi" },
      { slug: "taegeuk-1-jang", title: "Taegeuk 1 Jang" },
      { slug: "taegeuk-2-jang", title: "Taegeuk 2 Jang" },
      { slug: "taegeuk-3-jang", title: "Taegeuk 3 Jang" },
      { slug: "taegeuk-4-jang", title: "Taegeuk 4 Jang" },
      { slug: "dwitgubi", title: "Dwitgubi" },
    ],
  },
  {
    id: "maos-sonkisul",
    title: "Mãos, punhos e defesas",
    audience: "Sonkisul + Kibon",
    description: "Relacione superfícies da mão e configurações de dedos às defesas e golpes da base técnica.",
    folderName: "Trilha · Mãos e defesas",
    items: [
      { slug: "jumeok", title: "Jumeok" },
      { slug: "sonnal", title: "Sonnal" },
      { slug: "batangson", title: "Batangson" },
      { slug: "pyeonsonkkeut", title: "Pyeonsonkkeut" },
      { slug: "an-makgi", title: "An-makgi" },
      { slug: "sonnal-makgi-familia", title: "Sonnal-bakkat-makgi" },
      { slug: "sonnal-an-chigi", title: "Sonnal-an-chigi" },
    ],
  },
  {
    id: "matchuo-escola",
    title: "Combate combinado",
    audience: "Matchuo Kyorugi",
    description: "Estruture Sebon, Dubon, Hanbon e Anjoa conforme o currículo praticado no seu dojang.",
    folderName: "Trilha · Combate combinado",
    items: [
      { slug: "matchuo-kyorugi-fundamentos", title: "Matchuo Kyorugi (Combate combinado)" },
      { slug: "sebon-kyorugi", title: "Sebon Kyorugi" },
      { slug: "dubon-kyorugi", title: "Dubon Kyorugi" },
      { slug: "hanbon-kyorugi", title: "Hanbon Kyorugi" },
      { slug: "anjoa-kyorugi", title: "Anjoa Kyorugi" },
    ],
  },
  {
    id: "teoria-terminologia",
    title: "Teoria, história e terminologia",
    audience: "Iron + Palgwae",
    description: "Compreenda a história documentada pós-1945, instituições, morfologia coreana e a coleção Palgwae.",
    folderName: "Trilha · Teoria e história",
    items: [
      { slug: "iron-historia-pos-1945", title: "Formação moderna pós-1945 e unificação" },
      { slug: "iron-instituicoes-kukkiwon-wt-cbtkd", title: "Kukkiwon, World Taekwondo e entidades esportivas" },
      { slug: "iron-morfologia-terminologia", title: "Como ler nomes técnicos em coreano" },
      { slug: "iron-padronizacao-romanizacao", title: "Romanização Revisada e variantes gráficas" },
      { slug: "palgwae-contexto-historico", title: "Coleção Palgwae" },
    ],
  },
];

export const emptyStudies = (): Studies => ({
  version: 1,
  folders: [],
  items: [],
  notes: [],
});
const validText = (v: unknown, max = 500) =>
  typeof v === "string" && v.length <= max;
export function parseStudies(raw: string): Studies {
  const s = JSON.parse(raw) as Studies;
  if (
    !s ||
    s.version !== 1 ||
    !Array.isArray(s.folders) ||
    !Array.isArray(s.items) ||
    !Array.isArray(s.notes) ||
    s.folders.length > 1000 ||
    s.items.length > 5000 ||
    s.notes.length > 1000
  )
    throw new Error("Caderno inválido.");
  if (
    s.folders.some(
      (f) =>
        !f ||
        !validText(f.id) ||
        !validText(f.name, 120) ||
        !f.name.trim() ||
        !(f.parentId === null || validText(f.parentId)),
    )
  )
    throw new Error("Pasta inválida.");
  if (new Set(s.folders.map((f) => f.id)).size !== s.folders.length)
    throw new Error("Pasta duplicada.");
  for (const f of s.folders) moveFolder(s, f.id, f.parentId);
  if (
    s.items.some(
      (i) =>
        !i ||
        !validText(i.slug, 120) ||
        !/^[a-z0-9-]+$/.test(i.slug) ||
        !validText(i.title, 200) ||
        typeof i.studied !== "boolean" ||
        (i.review !== undefined && typeof i.review !== "boolean") ||
        (i.folderId !== null && !s.folders.some((f) => f.id === i.folderId)),
    )
  )
    throw new Error("Técnica inválida.");
  if (
    s.notes.some(
      (n) =>
        !n ||
        !validText(n.id) ||
        !validText(n.title, 200) ||
        !validText(n.body, 50000) ||
        !Array.isArray(n.references) ||
        n.references.some(
          (r) =>
            !r ||
            !["term", "url", "folder", "curriculum"].includes(r.kind) ||
            !validText(r.target, 2000) ||
            !validText(r.label, 200),
        ),
    )
  )
    throw new Error("Anotação inválida.");
  for (const note of s.notes)
    for (const ref of note.references) {
      if (ref.kind === "url") {
        let target: URL;
        try {
          target = new URL(ref.target);
        } catch {
          throw new Error("Link inválido.");
        }
        if (
          !["http:", "https:"].includes(target.protocol) ||
          target.username ||
          target.password
        )
          throw new Error("Link inválido.");
      }
      if (ref.kind === "term" && !/^[a-z0-9-]{1,120}$/.test(ref.target))
        throw new Error("Referência inválida.");
    }
  return s;
}
export function moveFolder(
  s: Studies,
  id: string,
  parentId: string | null,
): Studies {
  if (!s.folders.some((f) => f.id === id))
    throw new Error("Pasta não encontrada.");
  let current = parentId;
  const visited = new Set<string>([id]);
  while (current) {
    if (visited.has(current))
      throw new Error(
        "Não mova uma pasta para si mesma ou para uma descendente.",
      );
    visited.add(current);
    const parent = s.folders.find((f) => f.id === current);
    if (!parent) throw new Error("Pasta de destino não encontrada.");
    current = parent.parentId;
  }
  return {
    ...s,
    folders: s.folders.map((f) => (f.id === id ? { ...f, parentId } : f)),
  };
}
export function removeFolder(s: Studies, id: string): Studies {
  const folder = s.folders.find((f) => f.id === id);
  if (!folder) throw new Error("Pasta não encontrada.");
  return {
    ...s,
    folders: s.folders
      .filter((f) => f.id !== id)
      .map((f) =>
        f.parentId === id ? { ...f, parentId: folder.parentId } : f,
      ),
    items: s.items.map((i) =>
      i.folderId === id ? { ...i, folderId: folder.parentId } : i,
    ),
  };
}
