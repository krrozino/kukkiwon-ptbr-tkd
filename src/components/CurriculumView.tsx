import { useEffect, useState } from "react";
import type { Curriculum } from "../lib/curriculum";
import TermContext from "./TermContext";
import MediaPlayer, { type SchoolMedia } from "./MediaPlayer";
import type { SchoolTerm } from "../lib/school-api";
export default function CurriculumView({
  value,
  school = "Exemplo didático independente",
  identity = "demo",
  media = [],
  schoolTerms = [],
}: {
  value: Curriculum;
  school?: string;
  identity?: string;
  media?: SchoolMedia[];
  schoolTerms?: SchoolTerm[];
}) {
  const [preview, setPreview] = useState<string | null>(null),
    [checked, setChecked] = useState<string[]>([]),
    [loadedKey, setLoadedKey] = useState<string|null>(null),
    [error, setError] = useState("");
  const key = "tkd:checklist:" + identity;
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || "[]");
      if (!Array.isArray(data) || !data.every((x) => typeof x === "string"))
        throw new Error();
      setChecked(data);
    } catch {
      setChecked([]);
      setError("Não foi possível ler o checklist deste navegador.");
    }
    setLoadedKey(key);
  }, [key]);
  const toggle = (id: string) => {
    const next = checked.includes(id)
      ? checked.filter((x) => x !== id)
      : [...checked, id];
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setChecked(next);
      setError("");
    } catch {
      setError("Não foi possível salvar o checklist neste navegador.");
    }
  };
  return (
    <div className="curriculum-view" aria-busy={loadedKey!==key}>
      <p className="tag">{school}</p>
      <h2>{value.title}</h2>
      <p>{value.description}</p>
      <p className="fine-print">
        O checklist registra seu estudo neste navegador; a graduação é avaliada
        pelo professor.
      </p>
      {error && <p role="alert">{error}</p>}
      {value.grades.map((g) => (
        <section className="grade-view" key={g.id}>
          <h3>
            <span className="belt-mark" />
            {g.name}
          </h3>
          <p className="fine-print">
            {
              g.requirements.filter((r) => checked.includes(g.id + ":" + r.id))
                .length
            }{" "}
            de {g.requirements.length} conteúdos estudados
          </p>
          <ul className="requirements">
            {g.requirements.map((r) => (
              <li key={r.id}>
                <label>
                  <input
                    type="checkbox"
                    disabled={loadedKey!==key}
                    checked={checked.includes(g.id + ":" + r.id)}
                    onChange={() => toggle(g.id + ":" + r.id)}
                  />
                  <strong>{r.title}</strong>
                </label>
                <span className="pill">{r.kind}</span>
                {r.schoolTermId &&
                  (schoolTerms.find((t) => t.id === r.schoolTermId) ? (
                    <div className="school-technique">
                      <strong>
                        {
                          schoolTerms.find((t) => t.id === r.schoolTermId)!
                            .title
                        }
                      </strong>
                      <p>
                        {
                          schoolTerms.find((t) => t.id === r.schoolTermId)!
                            .description
                        }
                      </p>
                      <small>
                        Técnica própria da escola · sem homologação editorial
                      </small>
                    </div>
                  ) : (
                    <p className="fine-print">
                      Técnica própria privada ou indisponível neste acesso.
                    </p>
                  ))}
                <p>{r.notes}</p>
                {r.termSlug && (
                  <button
                    className="text-button"
                    disabled={loadedKey!==key}
                    onClick={() => setPreview(r.termSlug)}
                  >
                    Consultar {r.termSlug} aqui ↗
                  </button>
                )}
                {r.mediaId &&
                  (media.find((m) => m.id === r.mediaId) ? (
                    <MediaPlayer
                      media={media.find((m) => m.id === r.mediaId)!}
                    />
                  ) : (
                    <p className="fine-print">
                      Demonstração privada ou indisponível neste acesso.
                    </p>
                  ))}
              </li>
            ))}
          </ul>
        </section>
      ))}
      {preview && (
        <TermContext slug={preview} compact onClose={() => setPreview(null)} />
      )}
    </div>
  );
}
