import { useState } from "react";
import type { Curriculum, Grade, Requirement } from "../lib/curriculum";
import TermPicker from "./TermPicker";
import type { SchoolMedia } from "./MediaPlayer";
export default function CurriculumEditor({
  value,
  onChange,
  media = [],
}: {
  value: Curriculum;
  onChange: (c: Curriculum) => void;
  media?: SchoolMedia[];
}) {
  const [pick, setPick] = useState<string | null>(null);
  const grade = (id: string, fn: (g: Grade) => Grade) =>
    onChange({
      ...value,
      grades: value.grades.map((g) => (g.id === id ? fn(g) : g)),
    });
  const req = (gid: string, id: string, patch: Partial<Requirement>) =>
    grade(gid, (g) => ({
      ...g,
      requirements: g.requirements.map((r) =>
        r.id === id ? { ...r, ...patch } : r,
      ),
    }));
  return (
    <div className="curriculum-editor stack">
      <label className="field">
        Nome do currículo
        <input
          value={value.title}
          maxLength={120}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
        />
      </label>
      <label className="field">
        Descrição e origem
        <textarea
          value={value.description}
          maxLength={5000}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
        />
      </label>
      {value.grades.map((g, index) => (
        <fieldset className="grade-editor stack" key={g.id}>
          <legend>Graduação {index + 1}</legend>
          <label className="field">
            Nome da graduação
            <input
              value={g.name}
              maxLength={120}
              onChange={(e) =>
                grade(g.id, (g) => ({ ...g, name: e.target.value }))
              }
            />
          </label>
          <div className="actions">
            <button
              disabled={index === 0}
              onClick={() => {
                const next = [...value.grades];
                [next[index - 1], next[index]] = [next[index], next[index - 1]];
                onChange({ ...value, grades: next });
              }}
            >
              Subir graduação
            </button>
            <button
              disabled={index === value.grades.length - 1}
              onClick={() => {
                const next = [...value.grades];
                [next[index + 1], next[index]] = [next[index], next[index + 1]];
                onChange({ ...value, grades: next });
              }}
            >
              Descer graduação
            </button>
            <button
              onClick={() =>
                onChange({
                  ...value,
                  grades: value.grades.filter((x) => x.id !== g.id),
                })
              }
            >
              Remover graduação
            </button>
          </div>
          {g.requirements.map((r) => (
            <div className="requirement-editor stack" key={r.id}>
              <label className="field">
                Conteúdo
                <input
                  value={r.title}
                  maxLength={200}
                  onChange={(e) => req(g.id, r.id, { title: e.target.value })}
                />
              </label>
              <label className="field">
                Tipo de requisito
                <select
                  value={r.kind}
                  onChange={(e) =>
                    req(g.id, r.id, {
                      kind: e.target.value as Requirement["kind"],
                    })
                  }
                >
                  <option value="tecnica">Técnica</option>
                  <option value="poomsae">Poomsae</option>
                  <option value="teoria">Conhecimento teórico</option>
                  <option value="material">Material de estudo</option>
                </select>
              </label>
              <label className="field">
                Orientação compartilhada do professor
                <textarea
                  value={r.notes}
                  maxLength={3000}
                  onChange={(e) => req(g.id, r.id, { notes: e.target.value })}
                />
              </label>
              {r.termSlug && (
                <p className="fine-print">
                  Técnica vinculada: {r.termSlug}{" "}
                  <button onClick={() => req(g.id, r.id, { termSlug: "" })}>
                    Desvincular
                  </button>
                </p>
              )}
              <button onClick={() => setPick(pick === r.id ? null : r.id)}>
                Vincular técnica do catálogo
              </button>
              {pick === r.id && (
                <TermPicker
                  onPick={(t) => {
                    req(g.id, r.id, {
                      termSlug: t.slug,
                      title: t.romanization + " · " + (t.translation_pt || ""),
                    });
                    setPick(null);
                  }}
                />
              )}
              <label className="field">
                Demonstração da escola
                <select
                  aria-label="Demonstração da escola"
                  value={r.mediaId}
                  onChange={(e) => req(g.id, r.id, { mediaId: e.target.value })}
                >
                  <option value="">Sem demonstração</option>
                  {media.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ·{" "}
                      {m.visibility === "public" ? "compartilhável" : "privada"}
                    </option>
                  ))}
                </select>
              </label>
              <button
                onClick={() =>
                  grade(g.id, (g) => ({
                    ...g,
                    requirements: g.requirements.filter((x) => x.id !== r.id),
                  }))
                }
              >
                Remover conteúdo
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              grade(g.id, (g) => ({
                ...g,
                requirements: [
                  ...g.requirements,
                  {
                    id: crypto.randomUUID(),
                    title: "Novo conteúdo",
                    kind: "tecnica",
                    termSlug: "",
                    notes: "",
                    mediaId: "",
                  },
                ],
              }))
            }
          >
            Adicionar conteúdo
          </button>
        </fieldset>
      ))}
      <button
        onClick={() =>
          onChange({
            ...value,
            grades: [
              ...value.grades,
              {
                id: crypto.randomUUID(),
                name: "Nova graduação",
                requirements: [],
              },
            ],
          })
        }
      >
        Adicionar graduação
      </button>
    </div>
  );
}
