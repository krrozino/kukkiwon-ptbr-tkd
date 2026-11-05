import { useEffect, useState, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import {
  schoolClient,
  schoolConfigured,
  schoolError,
  saveSchoolCurriculum,
  mediaFields,
  type School,
  type SavedCurriculum,
  type SchoolTerm,
} from "../lib/school-api";
import {
  demoCurriculum,
  parseCurriculum,
  safeMediaUrl,
  type Curriculum,
} from "../lib/curriculum";
import CurriculumEditor from "./CurriculumEditor";
import CurriculumView from "./CurriculumView";
import type { SchoolMedia } from "./MediaPlayer";
import TermPicker from "./TermPicker";
export default function SchoolApp() {
  const sessionUser = useRef<string | null>(null);
  const [user, setUser] = useState<User | null>(null),
    [authReady, setAuthReady] = useState(false),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState("");
  const [schools, setSchools] = useState<School[]>([]),
    [school, setSchool] = useState<School | null>(null),
    [name, setName] = useState(""),
    [slug, setSlug] = useState("");
  const [curricula, setCurricula] = useState<SavedCurriculum[]>([]),
    [saved, setSaved] = useState<SavedCurriculum | null>(null),
    [value, setValue] = useState<Curriculum>(demoCurriculum),
    [visibility, setVisibility] = useState<"private" | "public">("private"),
    [editing, setEditing] = useState(true);
  const [media, setMedia] = useState<SchoolMedia[]>([]),
    [terms, setTerms] = useState<SchoolTerm[]>([]),
    [termName, setTermName] = useState(""),
    [termDescription, setTermDescription] = useState("");
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [reload, setReload] = useState(0);
  const [m, setM] = useState({
    title: "",
    description: "",
    term_slug: "",
    creator: "",
    media_kind: "video",
    media_url: "",
    caption: "",
    credits: "",
    permission_note: "",
    visibility: "private",
    rights_confirmed: false,
    consent_confirmed: false,
  });
  useEffect(() => {
    if (!schoolConfigured()) {
      setAuthReady(true);
      return;
    }
    let live = true;
    const db = schoolClient();
    db.auth.getSession().then(({ data, error }) => {
      if (live) {
        sessionUser.current = data.session?.user.id || null;
        setUser(data.session?.user || null);
        if (error) setMessage(schoolError(error));
        setAuthReady(true);
      }
    });
    const { data } = db.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      const nextId = session?.user.id || null;
      if (event !== "SIGNED_OUT" && nextId === sessionUser.current) return;
      sessionUser.current = nextId;
      setSchool(null);
      setSchools([]);
      setCurricula([]);
      setMedia([]);
      setTerms([]);
      setSaved(null);
      setValue(demoCurriculum);
    });
    return () => {
      live = false;
      data.subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (!user) return;
    let live = true;
    schoolClient()
      .from("schools")
      .select("id,name,slug")
      .eq("owner_user_id", user.id)
      .order("name")
      .then(({ data, error }) => {
        if (live) {
          if (error) setMessage(schoolError(error));
          else setSchools(data || []);
        }
      });
    return () => {
      live = false;
    };
  }, [user?.id, reload]);
  useEffect(() => {
    if (!school || !user) return;
    let live = true;
    const db = schoolClient();
    Promise.all([
      db
        .from("school_curricula")
        .select("id,school_id,title,content,visibility,updated_at")
        .eq("school_id", school.id)
        .eq("owner_user_id", user.id)
        .order("updated_at", { ascending: false }),
      db
        .from("school_media")
        .select(mediaFields)
        .eq("school_id", school.id)
        .eq("owner_user_id", user.id),
      db
        .from("school_terms")
        .select("id,title,description,hangul,romanization,visibility")
        .eq("school_id", school.id)
        .eq("owner_user_id", user.id),
    ]).then(([c, m, t]) => {
      if (!live) return;
      const error = c.error || m.error || t.error;
      if (error) setMessage(schoolError(error));
      else {
        setCurricula(c.data as SavedCurriculum[]);
        setMedia(m.data as SchoolMedia[]);
        setTerms(t.data as SchoolTerm[]);
      }
    });
    return () => {
      live = false;
    };
  }, [school?.id, user?.id, reload]);
  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setMessage(schoolError(e));
    } finally {
      setBusy(false);
    }
  }
  const login = (signup = false) =>
    run(async () => {
      const db = schoolClient();
      const { data, error } = signup
        ? await db.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: location.origin + "/escolas" },
          })
        : await db.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setPassword("");
      setMessage(
        signup && !data.session
          ? "Confira seu email para confirmar a conta."
          : "Acesso realizado.",
      );
    });
  const choose = (s: School) => {
    setCurricula([]);
    setMedia([]);
    setTerms([]);
    setSchool(s);
    setSaved(null);
    setValue(demoCurriculum);
    setVisibility("private");
    setEditing(true);
  };
  if (!schoolConfigured())
    return (
      <div className="notice">
        <h2>Acesso da escola</h2>
        <p>
          Esta versão ainda não tem configuração pública do Supabase Auth. O
          atlas e os estudos locais continuam disponíveis.
        </p>
        <a href="/curriculos">Testar o editor demonstrativo</a>
      </div>
    );
  if (!authReady) return <p role="status">Verificando acesso…</p>;
  return (
    <div className="school-app">
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      {!user ? (
        <form
          className="card auth-form stack"
          onSubmit={(e) => {
            e.preventDefault();
            void login();
          }}
        >
          <h2>Entre para organizar sua escola</h2>
          <label className="field">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label className="field">
            Senha
            <input
              type="password"
              value={password}
              minLength={8}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <div className="actions">
            <button disabled={busy}>Entrar</button>
            <button
              type="button"
              disabled={busy || !email || password.length < 8}
              onClick={() => void login(true)}
            >
              Criar conta de responsável
            </button>
          </div>
          <p className="fine-print">
            Uma conta permite criar sua própria escola. Acesso editorial ao
            catálogo exige autorização separada.
          </p>
        </form>
      ) : (
        <>
          <div className="actions">
            <p>Responsável conectado: {user.email}</p>
            <button
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  const { error } = await schoolClient().auth.signOut();
                  if (error) throw error;
                })
              }
            >
              Sair
            </button>
          </div>
          <div className="learning-layout">
            <aside className="card stack">
              <h2>Minhas escolas</h2>
              {schools.map((s) => (
                <button
                  key={s.id}
                  disabled={busy}
                  aria-pressed={school?.id === s.id}
                  onClick={() => choose(s)}
                >
                  {s.name}
                </button>
              ))}
              <form
                className="stack"
                onSubmit={(e) => {
                  e.preventDefault();
                  void run(async () => {
                    const { data, error } = await schoolClient()
                      .from("schools")
                      .insert({ name, slug })
                      .select("id,name,slug")
                      .single();
                    if (error) throw error;
                    setName("");
                    setSlug("");
                    setReload((n) => n + 1);
                    choose(data);
                    setMessage("Escola criada.");
                  });
                }}
              >
                <label className="field">
                  Nome da escola
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={120}
                    minLength={2}
                    required
                  />
                </label>
                <label className="field">
                  Identificador da escola
                  <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    placeholder="minha-escola"
                    maxLength={120}
                    required
                  />
                </label>
                <button disabled={busy}>Criar escola</button>
              </form>
            </aside>
            <section className="card stack">
              {!school ? (
                <p>Escolha ou crie sua escola para montar o currículo.</p>
              ) : (
                <>
                  <p className="tag">Painel do professor</p>
                  <h2>{school.name}</h2>
                  <div className="actions">
                    <button
                      disabled={busy}
                      onClick={() => {
                        setSaved(null);
                        setValue({
                          ...demoCurriculum,
                          title: "Novo currículo",
                        });
                        setVisibility("private");
                        setEditing(true);
                      }}
                    >
                      Novo currículo
                    </button>
                    <label className="field">
                      Abrir currículo salvo
                      <select
                        disabled={busy}
                        value={saved?.id || ""}
                        onChange={(e) => {
                          const c = curricula.find(
                            (c) => c.id === e.target.value,
                          );
                          if (c) {
                            try {
                              setValue(parseCurriculum(c.content));
                              setSaved(c);
                              setVisibility(c.visibility);
                            } catch (err) {
                              setMessage(schoolError(err));
                            }
                          }
                        }}
                      >
                        <option value="">Escolha um currículo</option>
                        {curricula.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title} · {c.visibility}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="actions">
                    <button
                      aria-pressed={editing}
                      onClick={() => setEditing(true)}
                    >
                      Editar currículo
                    </button>
                    <button
                      aria-pressed={!editing}
                      onClick={() => setEditing(false)}
                    >
                      Visualizar como aluno
                    </button>
                  </div>
                  {editing ? (
                    <CurriculumEditor
                      value={value}
                      onChange={setValue}
                      media={media}
                    />
                  ) : (
                    <CurriculumView
                      value={value}
                      school={school.name}
                      identity={saved?.id || "school-draft-" + school.id}
                      media={media}
                      schoolTerms={terms}
                    />
                  )}
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={visibility === "public"}
                      onChange={(e) =>
                        setVisibility(e.target.checked ? "public" : "private")
                      }
                    />
                    Permitir link público para este currículo
                  </label>
                  <p className="fine-print">
                    Ao compartilhar, título, descrição, requisitos e orientações
                    salvos ficam públicos. Use apenas informações didáticas.
                    Mídias e técnicas próprias mantêm sua visibilidade
                    individual.
                  </p>
                  <button
                    disabled={busy}
                    onClick={() =>
                      void run(async () => {
                        const row = await saveSchoolCurriculum(
                          school.id,
                          value,
                          visibility,
                          saved,
                        );
                        setSaved(row);
                        setReload((n) => n + 1);
                        setMessage(
                          visibility === "public"
                            ? "Currículo salvo e compartilhamento ativado."
                            : "Currículo salvo como privado.",
                        );
                      })
                    }
                  >
                    Salvar currículo na escola
                  </button>
                  {saved?.visibility === "public" && (
                    <div className="share-box">
                      <label className="field">
                        Link da última versão salva
                        <input
                          readOnly
                          value={location.origin + "/curriculo?id=" + saved.id}
                        />
                      </label>
                      <div className="actions">
                        <a
                          href={"/curriculo?id=" + saved.id}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Abrir link público
                        </a>
                        <button
                          onClick={() =>
                            void run(async () => {
                              await navigator.clipboard.writeText(
                                location.origin + "/curriculo?id=" + saved.id,
                              );
                              setMessage("Link copiado.");
                            })
                          }
                        >
                          Copiar link
                        </button>
                      </div>
                    </div>
                  )}
                  <details>
                    <summary>Técnicas próprias da escola</summary>
                    <p className="fine-print">
                      Conteúdo autoral da escola, separado da terminologia
                      documental. Novos registros começam privados.
                    </p>
                    <div className="stack">
                      <label className="field">
                        Nome da técnica própria
                        <input
                          value={termName}
                          maxLength={120}
                          onChange={(e) => setTermName(e.target.value)}
                        />
                      </label>
                      <label className="field">
                        Descrição da escola
                        <textarea
                          value={termDescription}
                          onChange={(e) => setTermDescription(e.target.value)}
                          maxLength={5000}
                        />
                      </label>
                      <button
                        disabled={busy || !termName.trim()}
                        onClick={() =>
                          void run(async () => {
                            const { error } = await schoolClient()
                              .from("school_terms")
                              .insert({
                                school_id: school.id,
                                title: termName,
                                description: termDescription,
                              });
                            if (error) throw error;
                            setTermName("");
                            setTermDescription("");
                            setReload((n) => n + 1);
                            setMessage("Técnica própria salva como privada.");
                          })
                        }
                      >
                        Adicionar técnica própria
                      </button>
                      {terms.map((t) => (
                        <div key={t.id}>
                          <strong>{t.title}</strong>
                          <p>{t.description}</p>
                          <label>
                            <input
                              type="checkbox"
                              checked={t.visibility === "public"}
                              onChange={(e) => {
                                const visibility = e.target.checked
                                  ? "public"
                                  : "private";
                                void run(async () => {
                                  const { error } = await schoolClient()
                                    .from("school_terms")
                                    .update({ visibility })
                                    .eq("id", t.id);
                                  if (error) throw error;
                                  setReload((n) => n + 1);
                                });
                              }}
                            />
                            Permitir consulta pública desta técnica própria
                          </label>
                          <button
                            disabled={!value.grades.length}
                            onClick={() =>
                              setValue({
                                ...value,
                                grades: value.grades.map((g, i) =>
                                  i
                                    ? g
                                    : {
                                        ...g,
                                        requirements: [
                                          ...g.requirements,
                                          {
                                            id: crypto.randomUUID(),
                                            title: "Técnica própria da escola",
                                            kind: "tecnica",
                                            termSlug: "",
                                            schoolTermId: t.id,
                                            notes: "",
                                            mediaId: "",
                                          },
                                        ],
                                      },
                                ),
                              })
                            }
                          >
                            Vincular à primeira graduação
                          </button>
                        </div>
                      ))}
                    </div>
                  </details>
                  <details>
                    <summary>Demonstrações em vídeo e imagem</summary>
                    <form
                      className="stack"
                      onSubmit={(e) => {
                        e.preventDefault();
                        void run(async () => {
                          const url = safeMediaUrl(m.media_url);
                          if (!url)
                            throw new Error(
                              "Use um endereço HTTPS válido, sem credenciais.",
                            );
                          const { error } = await schoolClient()
                            .from("school_media")
                            .insert({
                              ...m,
                              school_id: school.id,
                              media_url: url,
                              term_slug: m.term_slug || null,
                            });
                          if (error) throw error;
                          setReload((n) => n + 1);
                          setMessage(
                            "Demonstração vinculada. A visibilidade escolhida foi preservada.",
                          );
                        });
                      }}
                    >
                      <p className="fine-print">
                        Neste MVP, use URLs. A privacidade do arquivo também
                        depende da plataforma que o hospeda.
                      </p>
                      {(
                        [
                          "title",
                          "description",
                          "creator",
                          "media_url",
                          "caption",
                          "credits",
                          "permission_note",
                        ] as const
                      ).map((key, i) => (
                        <label className="field" key={key}>
                          {
                            [
                              "Título da demonstração",
                              "Descrição",
                              "Autor ou demonstrador",
                              "URL da mídia",
                              "Legenda",
                              "Créditos",
                              "Permissão de uso e referência da autorização",
                            ][i]
                          }
                          <input
                            type={key === "media_url" ? "url" : "text"}
                            value={m[key]}
                            maxLength={key === "title" ? 120 : 2000}
                            required={[
                              "title",
                              "creator",
                              "media_url",
                              "permission_note",
                            ].includes(key)}
                            onChange={(e) =>
                              setM({ ...m, [key]: e.target.value })
                            }
                          />
                        </label>
                      ))}
                      <label className="field">
                        Tipo de mídia
                        <select
                          value={m.media_kind}
                          onChange={(e) =>
                            setM({ ...m, media_kind: e.target.value })
                          }
                        >
                          <option value="video">Vídeo</option>
                          <option value="image">Imagem</option>
                        </select>
                      </label>
                      <TermPicker
                        onPick={(t) => setM({ ...m, term_slug: t.slug })}
                      />
                      <p className="fine-print">
                        Técnica vinculada: {m.term_slug || "nenhuma"}
                      </p>
                      <label className="field">
                        Visibilidade da demonstração
                        <select
                          aria-label="Visibilidade da demonstração"
                          value={m.visibility}
                          onChange={(e) =>
                            setM({ ...m, visibility: e.target.value })
                          }
                        >
                          <option value="private">Privada · responsável</option>
                          <option value="public">
                            Pública · alunos com link
                          </option>
                        </select>
                      </label>
                      <label className="check-label">
                        <input
                          type="checkbox"
                          required
                          checked={m.rights_confirmed}
                          onChange={(e) =>
                            setM({ ...m, rights_confirmed: e.target.checked })
                          }
                        />
                        Tenho permissão para usar e compartilhar esta mídia.
                      </label>
                      <label className="check-label">
                        <input
                          type="checkbox"
                          required
                          checked={m.consent_confirmed}
                          onChange={(e) =>
                            setM({ ...m, consent_confirmed: e.target.checked })
                          }
                        />
                        Registrei consentimento de todas as pessoas retratadas,
                        incluindo responsáveis por menores quando aplicável.
                      </label>
                      <button disabled={busy}>Salvar demonstração</button>
                    </form>
                    <ul>
                      {media.map((item) => (
                        <li key={item.id}>
                          {item.title} · {item.visibility}
                          <button
                            disabled={busy}
                            onClick={() =>
                              void run(async () => {
                                const { error } = await schoolClient()
                                  .from("school_media")
                                  .update({
                                    visibility:
                                      item.visibility === "public"
                                        ? "private"
                                        : "public",
                                  })
                                  .eq("id", item.id);
                                if (error) throw error;
                                setReload((n) => n + 1);
                              })
                            }
                          >
                            {item.visibility === "public"
                              ? "Tornar privada"
                              : "Compartilhar demonstração"}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </details>
                </>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
