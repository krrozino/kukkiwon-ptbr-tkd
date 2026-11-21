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

const trailItemTitles = {
  "iron-significado-taekwondo": "Significado de Tae · Kwon · Do",
  "iron-espirito-cortesia-dojang": "Espírito do Taekwondo e cortesia no dojang",
  "kibon-alturas-direcoes": "Alturas e direções (Olgul, Momtong, Arae)",
  "ap-seogi": "Ap-seogi",
  "apgubi": "Apgubi",
  "naeryeo-makgi": "Naeryeo-makgi",
  "jeocheo-jireugi": "Jeocheo-jireugi",
  "ap-chagi": "Ap-chagi",
  "apchuk": "Apchuk",
  "baldeung": "Baldeung",
  "balnal": "Balnal",
  "dwichuk": "Dwichuk",
  "dollyeo-chagi": "Dollyeo-chagi",
  "yeop-chagi": "Yeop-chagi",
  "dwi-chagi": "Dwi-chagi",
  "gibon-junbi": "Gibon-junbi",
  "taegeuk-1-jang": "Taegeuk 1 Jang",
  "taegeuk-2-jang": "Taegeuk 2 Jang",
  "taegeuk-3-jang": "Taegeuk 3 Jang",
  "taegeuk-4-jang": "Taegeuk 4 Jang",
  "dwitgubi": "Dwitgubi",
  "jumeok": "Jumeok",
  "sonnal": "Sonnal",
  "batangson": "Batangson",
  "pyeonsonkkeut": "Pyeonsonkkeut",
  "an-makgi": "An-makgi",
  "sonnal-makgi-familia": "Sonnal-bakkat-makgi",
  "sonnal-an-chigi": "Sonnal-an-chigi",
  "matchuo-kyorugi-fundamentos": "Matchuo Kyorugi (Combate combinado)",
  "sebon-kyorugi": "Sebon Kyorugi",
  "dubon-kyorugi": "Dubon Kyorugi",
  "hanbon-kyorugi": "Hanbon Kyorugi",
  "anjoa-kyorugi": "Anjoa Kyorugi",
  "iron-historia-pos-1945": "Formação moderna pós-1945 e unificação",
  "iron-instituicoes-kukkiwon-wt-cbtkd": "Kukkiwon, World Taekwondo e entidades esportivas",
  "iron-morfologia-terminologia": "Como ler nomes técnicos em coreano",
  "iron-padronizacao-romanizacao": "Romanização Revisada e variantes gráficas",
  "palgwae-contexto-historico": "Coleção Palgwae",
};

function studyTrail(
  id: string,
  title: string,
  audience: string,
  description: string,
  folderName: string,
  slugs: readonly (keyof typeof trailItemTitles)[],
): StudyTrail {
  return { id, title, audience, description, folderName, items: slugs.map((slug) => ({ slug, title: trailItemTitles[slug] })) };
}

export const studyTrails: readonly StudyTrail[] = [
  studyTrail("iniciante", "Sou iniciante", "Primeiros passos",
    "Significado do Taekwondo, cortesia no dojang, alturas, primeiras bases, defesa baixa, soco e chute frontal.",
    "Trilha · Primeiros passos", [
      "iron-significado-taekwondo", "iron-espirito-cortesia-dojang", "kibon-alturas-direcoes", "ap-seogi", "apgubi", "naeryeo-makgi", "jeocheo-jireugi", "ap-chagi",
    ],
  ),
  studyTrail("chutes-balkisul", "Chutes e superfícies do pé", "Balkisul + Atlas",
    "Conecte cada superfície anatômica do pé no Atlas aos principais chutes lineares, circulares e giratórios.",
    "Trilha · Chutes e pés", [
      "apchuk", "baldeung", "balnal", "dwichuk", "ap-chagi", "dollyeo-chagi", "yeop-chagi", "dwi-chagi",
    ],
  ),
  studyTrail("poomsae-taegeuk", "Poomsae (Série Taegeuk)", "Formas e trigramas",
    "Estude os primeiros Taegeuk com trigramas, posturas de preparação e bases fundamentais.",
    "Trilha · Série Taegeuk", [
      "gibon-junbi", "taegeuk-1-jang", "taegeuk-2-jang", "taegeuk-3-jang", "taegeuk-4-jang", "dwitgubi",
    ],
  ),
  studyTrail("maos-sonkisul", "Mãos, punhos e defesas", "Sonkisul + Kibon",
    "Relacione superfícies da mão e configurações de dedos às defesas e golpes da base técnica.",
    "Trilha · Mãos e defesas", [
      "jumeok", "sonnal", "batangson", "pyeonsonkkeut", "an-makgi", "sonnal-makgi-familia", "sonnal-an-chigi",
    ],
  ),
  studyTrail("matchuo-escola", "Combate combinado", "Matchuo Kyorugi",
    "Estruture Sebon, Dubon, Hanbon e Anjoa conforme o currículo praticado no seu dojang.",
    "Trilha · Combate combinado", [
      "matchuo-kyorugi-fundamentos", "sebon-kyorugi", "dubon-kyorugi", "hanbon-kyorugi", "anjoa-kyorugi",
    ],
  ),
  studyTrail("teoria-terminologia", "Teoria, história e terminologia", "Iron + Palgwae",
    "Compreenda a história documentada pós-1945, instituições, morfologia coreana e a coleção Palgwae.",
    "Trilha · Teoria e história", [
      "iron-historia-pos-1945", "iron-instituicoes-kukkiwon-wt-cbtkd", "iron-morfologia-terminologia", "iron-padronizacao-romanizacao", "palgwae-contexto-historico",
    ],
  ),
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
export function addStudyItems(
  state: Studies,
  folderId: string | null,
  entries: readonly Pick<StudyItem, "slug" | "title">[],
): Studies {
  const saved = new Map(state.items.map((item) => [item.slug, item]));
  const inFolder = new Set(state.items.filter((item) => item.folderId === folderId).map((item) => item.slug));
  const items = [...state.items];
  for (const entry of entries) {
    if (inFolder.has(entry.slug)) continue;
    const previous = saved.get(entry.slug);
    items.push({ studied: false, ...entry, ...previous, folderId });
    inFolder.add(entry.slug);
  }
  return { ...state, items };
}

function moveStudyItems(
  items: StudyItem[],
  folderId: string | null,
  matches: (item: StudyItem) => boolean,
): StudyItem[] {
  const atDestination = new Set(items.filter((item) => item.folderId === folderId && !matches(item)).map((item) => item.slug));
  return items.flatMap((item) => {
    if (!matches(item)) return [item];
    if (atDestination.has(item.slug)) return [];
    atDestination.add(item.slug);
    return [{ ...item, folderId }];
  });
}

export function moveStudyItem(state: Studies, item: StudyItem, folderId: string | null): Studies {
  return {
    ...state,
    items: moveStudyItems(state.items, folderId, (candidate) =>
      candidate.slug === item.slug && candidate.folderId === item.folderId,
    ),
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
    items: moveStudyItems(s.items, folder.parentId, (item) => item.folderId === id),
  };
}
