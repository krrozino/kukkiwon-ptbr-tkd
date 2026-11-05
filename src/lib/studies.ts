export type Folder = { id: string; name: string; parentId: string | null };
export type StudyItem = {
  slug: string;
  title: string;
  folderId: string | null;
  studied: boolean;
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
