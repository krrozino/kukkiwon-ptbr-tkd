import { useState } from "react";
import {
  sequenceTypeLabels,
  sequenceTypes,
  type Curriculum,
  type Grade,
  type Requirement,
  type SequenceType,
} from "../lib/curriculum";
import TermPicker from "./TermPicker";
import type { SchoolMedia } from "./MediaPlayer";
import type { SchoolTerm } from "../lib/school-api";
export default function CurriculumEditor({
  value,
  onChange,
  media = [],
  schoolTerms = [],
}: {
  value: Curriculum;
  onChange: (c: Curriculum) => void;
  media?: SchoolMedia[];
  schoolTerms?: SchoolTerm[];
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
          {g.requirements.map((r, rIndex) => (
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
                  aria-label="Tipo de requisito"
                  value={r.kind}
                  onChange={(e) => {
                    const nextKind = e.target.value as Requirement["kind"];
                    req(g.id, r.id, {
                      kind: nextKind,
                      ...(nextKind === "matchuo-kyorugi" && !r.sequenceType
                        ? { sequenceType: "sebon", sequenceStart: 1, sequenceEnd: 5 }
                        : {}),
                    });
                  }}
                >
                  <option value="tecnica">Técnica</option>
                  <option value="poomsae">Poomsae</option>
                  <option value="matchuo-kyorugi">Matchuo Kyorugi (Combate combinado)</option>
                  <option value="palgwae">Palgwae (Coleção histórica)</option>
                  <option value="iron">Iron (Teoria e história)</option>
                  <option value="kibon-dongjak">Kibon Dongjak (Fundamentos)</option>
                  <option value="balkisul">Balkisul (Pés e chutes)</option>
                  <option value="sonkisul">Sonkisul (Mãos e punhos)</option>
                  <option value="teoria">Conhecimento teórico</option>
                  <option value="material">Material de estudo</option>
                </select>
              </label>
              {(r.kind === "matchuo-kyorugi" || r.sequenceType) && (
                <div className="sequence-range-fields stack">
                  <label className="field">
                    Modalidade de sequência da escola
                    <select
                      aria-label="Modalidade de sequência da escola"
                      value={r.sequenceType || ""}
                      onChange={(e) => {
                        const val = e.target.value as SequenceType | "";
                        req(
                          g.id,
                          r.id,
                          val
                            ? {
                                sequenceType: val,
                                sequenceStart: r.sequenceStart ?? 1,
                                sequenceEnd: r.sequenceEnd ?? 5,
                              }
                            : {
                                sequenceType: undefined,
                                sequenceStart: undefined,
                                sequenceEnd: undefined,
                              },
                        );
                      }}
                    >
                      <option value="">Sem intervalo numérico</option>
                      {sequenceTypes.map((st) => (
                        <option key={st} value={st}>
                          {sequenceTypeLabels[st]}
                        </option>
                      ))}
                    </select>
                  </label>
                  {r.sequenceType && (
                    <>
                      <div className="actions">
                        <label className="field">
                          Sequência inicial (1–100)
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={r.sequenceStart ?? 1}
                            onChange={(e) => {
                              const start = Math.max(1, Math.min(100, Number(e.target.value) || 1));
                              req(g.id, r.id, {
                                sequenceStart: start,
                                sequenceEnd: Math.max(start, r.sequenceEnd ?? start),
                              });
                            }}
                          />
                        </label>
                        <label className="field">
                          Sequência final (1–100)
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={r.sequenceEnd ?? r.sequenceStart ?? 1}
                            onChange={(e) => {
                              const end = Math.max(
                                r.sequenceStart ?? 1,
                                Math.min(100, Number(e.target.value) || 1),
                              );
                              req(g.id, r.id, { sequenceEnd: end });
                            }}
                          />
                        </label>
                      </div>
                      <div className="actions">
                        <button
                          type="button"
                          onClick={() =>
                            req(g.id, r.id, { sequenceStart: 1, sequenceEnd: 5 })
                          }
                        >
                          Intervalo 1 a 5
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            req(g.id, r.id, { sequenceStart: 1, sequenceEnd: 10 })
                          }
                        >
                          Intervalo 1 a 10
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            req(g.id, r.id, { sequenceStart: 6, sequenceEnd: 10 })
                          }
                        >
                          Intervalo 6 a 10
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
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
                      schoolTermId: undefined,
                      title: t.romanization + " · " + (t.translation_pt || ""),
                    });
                    setPick(null);
                  }}
                />
              )}
              <label className="field">
                Técnica da biblioteca da escola
                <select
                  value={r.schoolTermId || ""}
                  onChange={(e) => {
                    const t = schoolTerms.find(t => t.id === e.target.value);
                    req(g.id, r.id, t ? { schoolTermId: t.id, termSlug: "", title: t.title } : { schoolTermId: undefined });
                  }}
                >
                  <option value="">Sem técnica própria vinculada</option>
                  {schoolTerms.map(t => <option key={t.id} value={t.id}>{t.title} · {t.visibility === "public" ? "compartilhável" : "privada"}</option>)}
                </select>
              </label>
              {!schoolTerms.length && <p className="fine-print">Você pode criar técnicas próprias em “Técnicas próprias da escola” abaixo, mesmo sem registros publicados no catálogo.</p>}
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
              <div className="actions">
                <button
                  type="button"
                  disabled={rIndex === 0}
                  onClick={() =>
                    grade(g.id, (gr) => {
                      const next = [...gr.requirements];
                      [next[rIndex - 1], next[rIndex]] = [
                        next[rIndex],
                        next[rIndex - 1],
                      ];
                      return { ...gr, requirements: next };
                    })
                  }
                >
                  Subir conteúdo
                </button>
                <button
                  type="button"
                  disabled={rIndex === g.requirements.length - 1}
                  onClick={() =>
                    grade(g.id, (gr) => {
                      const next = [...gr.requirements];
                      [next[rIndex + 1], next[rIndex]] = [
                        next[rIndex],
                        next[rIndex + 1],
                      ];
                      return { ...gr, requirements: next };
                    })
                  }
                >
                  Descer conteúdo
                </button>
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
