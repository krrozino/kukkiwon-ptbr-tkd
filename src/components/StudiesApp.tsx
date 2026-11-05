import { useEffect, useState } from "react";
import { useStudies } from "../lib/useStudies";
import {
  moveFolder,
  removeFolder,
  type StudyNote,
  type Reference,
} from "../lib/studies";
import TermPicker from "./TermPicker";
import TermContext from "./TermContext";
const blank = (): StudyNote => ({
  id: crypto.randomUUID(),
  title: "",
  body: "",
  references: [],
});
function NoteText({
  note,
  onPreview,
}: {
  note: StudyNote;
  onPreview: (slug: string) => void;
}) {
  const refs = note.references.filter((r) => r.kind === "term" && r.label);
  if (!refs.length) return <>{note.body}</>;
  const pattern = new RegExp(
    "(" +
      refs
        .map((r) => r.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|") +
      ")",
    "g",
  );
  return (
    <>
      {note.body.split(pattern).map((text, i) => {
        const ref = refs.find((r) => r.label === text);
        return ref ? (
          <button
            className="text-button inline-ref"
            key={i}
            onClick={() => onPreview(ref.target)}
          >
            {text} ↗
          </button>
        ) : (
          text
        );
      })}
    </>
  );
}
export default function StudiesApp() {
  const { state, ready, error, update } = useStudies();
  const [folder, setFolder] = useState<string | null>(null),
    [name, setName] = useState(""),
    [preview, setPreview] = useState<string | null>(null),
    [note, setNote] = useState<StudyNote | null>(null),
    [message, setMessage] = useState(""),
    [url, setUrl] = useState("");
  useEffect(() => {
    if (ready) {
      const id = new URLSearchParams(location.search).get("folder");
      if (id && state.folders.some((f) => f.id === id)) setFolder(id);
    }
  }, [ready]);
  const current = state.folders.find((f) => f.id === folder);
  const items = state.items.filter((i) => i.folderId === folder);
  const addRef = (r: Reference) =>
    setNote((n) =>
      n
        ? {
            ...n,
            body: n.body + (n.body ? " " : "") + r.label,
            references: [...n.references, r],
          }
        : n,
    );
  const link = () => {
    try {
      const u = new URL(url, window.location.origin);
      if (!["https:", "http:"].includes(u.protocol) || u.username || u.password)
        throw new Error();
      addRef({ kind: "url", target: u.href, label: u.href });
      setUrl("");
    } catch {
      setMessage("Insira um link HTTP ou HTTPS válido.");
    }
  };
  return (
    <div className="learning-layout">
      <aside className="card study-sidebar">
        <p className="tag">Caderno pessoal</p>
        <h2>Meus estudos</h2>
        <p className="fine-print">
          Salvo neste navegador. Não há sincronização entre aparelhos.
        </p>
        <button aria-pressed={!folder} onClick={() => setFolder(null)}>
          ★ Todos na raiz
        </button>
        <ul className="folder-list">
          {state.folders.map((f) => (
            <li key={f.id}>
              <button
                aria-pressed={folder === f.id}
                onClick={() => setFolder(f.id)}
              >
                {f.parentId ? "↳ " : ""}
                {f.name}
              </button>
            </li>
          ))}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            if (
              update((s) => ({
                ...s,
                folders: [
                  ...s.folders,
                  {
                    id: crypto.randomUUID(),
                    name: name.trim(),
                    parentId: folder,
                  },
                ],
              }))
            )
              setName("");
          }}
        >
          <label className="field">
            {folder ? "Nova subpasta" : "Nova pasta"}
            <input
              value={name}
              maxLength={120}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <button disabled={!ready}>Criar pasta</button>
        </form>
        {current && (
          <div className="stack">
            <label className="field">
              Renomear pasta
              <input
                value={current.name}
                maxLength={120}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.trim())
                    update((s) => ({
                      ...s,
                      folders: s.folders.map((f) =>
                        f.id === folder ? { ...f, name: value } : f,
                      ),
                    }));
                }}
              />
            </label>
            <label className="field">
              Mover pasta para
              <select
                value={current.parentId || ""}
                onChange={(e) =>
                  update((s) =>
                    moveFolder(s, current.id, e.target.value || null),
                  )
                }
              >
                <option value="">Raiz</option>
                {state.folders
                  .filter((f) => f.id !== folder)
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
              </select>
            </label>
            <button
              onClick={() => {
                if (update((s) => removeFolder(s, current.id)))
                  setFolder(current.parentId);
              }}
            >
              Excluir pasta e preservar conteúdos
            </button>
          </div>
        )}
      </aside>
      <section className="card">
        <h2>{current?.name || "Favoritos e aprendizado"}</h2>
        {error && <p role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}
        {!items.length && (
          <p>Salve técnicas pelo catálogo, pela ficha ou pela busca abaixo.</p>
        )}
        <TermPicker
          onPick={(t) =>
            update((s) => ({
              ...s,
              items: [
                ...s.items.filter((i) => i.slug !== t.slug),
                {
                  slug: t.slug,
                  title: t.romanization,
                  folderId: folder,
                  studied: false,
                },
              ],
            }))
          }
        />
        <ul className="study-items">
          {items.map((i) => (
            <li key={i.slug}>
              <label>
                <input
                  type="checkbox"
                  checked={i.studied}
                  onChange={(e) =>
                    update((s) => ({
                      ...s,
                      items: s.items.map((x) =>
                        x.slug === i.slug
                          ? { ...x, studied: e.target.checked }
                          : x,
                      ),
                    }))
                  }
                />
                {i.studied ? "Estudado" : "Pendente"}
              </label>
              <button
                className="text-button"
                onClick={() => setPreview(i.slug)}
              >
                {i.title}
              </button>
              <label className="field">
                Pasta de {i.title}
                <select
                  value={i.folderId || ""}
                  onChange={(e) =>
                    update((s) => ({
                      ...s,
                      items: s.items.map((x) =>
                        x.slug === i.slug
                          ? { ...x, folderId: e.target.value || null }
                          : x,
                      ),
                    }))
                  }
                >
                  <option value="">Raiz</option>
                  {state.folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                onClick={() =>
                  update((s) => ({
                    ...s,
                    items: s.items.filter((x) => x.slug !== i.slug),
                  }))
                }
              >
                Remover {i.title}
              </button>
            </li>
          ))}
        </ul>
        <div className="section-inner">
          <h2>Anotações das aulas</h2>
          <button
            onClick={() => {
              setNote(blank());
              setMessage("");
            }}
          >
            Nova anotação
          </button>
          <ul className="notes-list">
            {state.notes.map((n) => (
              <li key={n.id}>
                <button onClick={() => setNote(n)}>{n.title}</button>
                <p>
                  <NoteText note={n} onPreview={setPreview} />
                </p>
                <div className="reference-links">
                  {n.references
                    .filter(
                      (r) => r.kind !== "term" || !n.body.includes(r.label),
                    )
                    .map((r, i) =>
                      r.kind === "term" ? (
                        <button key={i} onClick={() => setPreview(r.target)}>
                          {r.label} ↗
                        </button>
                      ) : (
                        <a
                          key={i}
                          href={
                            r.kind === "folder"
                              ? "/estudos?folder=" +
                                encodeURIComponent(r.target)
                              : r.kind === "curriculum"
                                ? "/curriculo?id=" +
                                  encodeURIComponent(r.target)
                                : r.target
                          }
                          rel="noreferrer"
                        >
                          {r.label}
                        </a>
                      ),
                    )}
                </div>
              </li>
            ))}
          </ul>
          {note && (
            <div className="note-editor stack">
              <label className="field">
                Título da anotação
                <input
                  value={note.title}
                  maxLength={200}
                  onChange={(e) => setNote({ ...note, title: e.target.value })}
                />
              </label>
              <label className="field">
                Texto da anotação
                <textarea
                  value={note.body}
                  maxLength={50000}
                  rows={5}
                  onChange={(e) => setNote({ ...note, body: e.target.value })}
                />
              </label>
              <TermPicker
                onPick={(t) =>
                  addRef({
                    kind: "term",
                    target: t.slug,
                    label: t.romanization,
                  })
                }
              />
              <p className="fine-print">
                As técnicas inseridas ficam como referências clicáveis na
                anotação.
              </p>
              <div className="reference-links">
                {note.references.map((r, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      setNote({
                        ...note,
                        references: note.references.filter((_, j) => i !== j),
                      })
                    }
                  >
                    {r.label} ×
                  </button>
                ))}
              </div>
              <label className="field">
                Adicionar link
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://… ou URL interna"
                />
              </label>
              <button onClick={link}>Inserir link</button>
              <label className="field">
                Referenciar pasta
                <select
                  value=""
                  onChange={(e) => {
                    const f = state.folders.find(
                      (f) => f.id === e.target.value,
                    );
                    if (f)
                      addRef({ kind: "folder", target: f.id, label: f.name });
                  }}
                >
                  <option value="">Escolha uma pasta</option>
                  {state.folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="actions">
                <button
                  onClick={() => {
                    if (!note.title.trim()) {
                      setMessage("Dê um título à anotação.");
                      return;
                    }
                    if (
                      update((s) => ({
                        ...s,
                        notes: [
                          ...s.notes.filter((n) => n.id !== note.id),
                          note,
                        ],
                      }))
                    ) {
                      setNote(null);
                      setMessage("Anotação salva neste navegador.");
                    }
                  }}
                >
                  Salvar anotação
                </button>
                <button onClick={() => setNote(null)}>Fechar editor</button>
                {state.notes.some((n) => n.id === note.id) && (
                  <button
                    onClick={() => {
                      if (
                        update((s) => ({
                          ...s,
                          notes: s.notes.filter((n) => n.id !== note.id),
                        }))
                      )
                        setNote(null);
                    }}
                  >
                    Excluir anotação
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        {preview && (
          <TermContext
            slug={preview}
            compact
            onClose={() => setPreview(null)}
          />
        )}
      </section>
    </div>
  );
}
