import { useState } from "react";
import { sequenceLabel, type Curriculum, type Grade, type Requirement } from "../lib/curriculum";
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
              <div className="req-header-row">
                <span className="req-num">Conteúdo {rIndex + 1}</span>
                {sequenceLabel(r) && <span className="req-seq-badge">{sequenceLabel(r)}</span>}
                <div className="req-reorder-actions">
                  <button
                    type="button"
                    disabled={rIndex === 0}
                    aria-label={`Subir conteúdo ${rIndex + 1}`}
                    onClick={() => {
                      grade(g.id, (g) => {
                        const next = [...g.requirements];
                        [next[rIndex - 1], next[rIndex]] = [next[rIndex], next[rIndex - 1]];
                        return { ...g, requirements: next };
                      });
                    }}
                  >
                    ↑ Subir
                  </button>
                  <button
                    type="button"
                    disabled={rIndex === g.requirements.length - 1}
                    aria-label={`Descer conteúdo ${rIndex + 1}`}
                    onClick={() => {
                      grade(g.id, (g) => {
                        const next = [...g.requirements];
                        [next[rIndex + 1], next[rIndex]] = [next[rIndex], next[rIndex + 1]];
                        return { ...g, requirements: next };
                      });
                    }}
                  >
                    ↓ Descer
                  </button>
                </div>
              </div>

              <label className="field">
                Conteúdo / Título do requisito
                <input
                  value={r.title}
                  maxLength={200}
                  onChange={(e) => req(g.id, r.id, { title: e.target.value })}
                />
              </label>

              <label className="field">
                Área / Tipo de requisito
                <select
                  value={r.kind}
                  onChange={(e) =>
                    req(g.id, r.id, {
                      kind: e.target.value as Requirement["kind"],
                    })
                  }
                >
                  <option value="tecnica">Técnica Geral</option>
                  <option value="matchuo-kyorugi">Matchuo Kyorugi (Luta Combinada)</option>
                  <option value="poomsae">Poomsae (Formas)</option>
                  <option value="palgwae">Palgwae (Formas Históricas)</option>
                  <option value="iron">Iron (Teoria / Filosofia)</option>
                  <option value="kibon-dongjak">Kibon Dongjak (Fundamentos)</option>
                  <option value="balkisul">Balkisul (Chutes / Pernas)</option>
                  <option value="sonkisul">Sonkisul (Mãos / Punhos)</option>
                  <option value="teoria">Conhecimento teórico</option>
                  <option value="material">Material de estudo</option>
                </select>
              </label>

              {(r.kind === "matchuo-kyorugi" || r.kind === "palgwae" ||
                r.sequenceStart !== undefined || r.sequenceEnd !== undefined || r.sequenceType !== undefined) && (
              <div className="card sequence-range-config">
                <strong>Configuração de Sequências Numeradas</strong>
                <p className="fine-print">
                  Defina intervalos numerados específicos para a graduação (ex: Sebon 1 ao 5 para Faixa Amarela, ou 1 ao 10 para Ponta Verde).
                </p>
                <div className="sequence-inputs-row" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <label className="field" style={{ flex: '1 1 120px' }}>
                    Modalidade
                    <select
                      value={r.sequenceType || "sebon"}
                      onChange={(e) => req(g.id, r.id, { sequenceType: e.target.value })}
                    >
                      <option value="sebon">Sebon (3 passos)</option>
                      <option value="dubon">Dubon (2 passos)</option>
                      <option value="anjoa">Anjoa (sentado)</option>
                      <option value="sequência">Outra sequência</option>
                    </select>
                  </label>
                  <label className="field" style={{ flex: '1 1 90px' }}>
                    Do nº
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={r.sequenceStart ?? ""}
                      placeholder="Início"
                      onChange={(e) => {
                        const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                        req(g.id, r.id, { sequenceStart: val, sequenceType: val === undefined && r.sequenceEnd === undefined ? undefined : (r.sequenceType || "sebon") });
                      }}
                    />
                  </label>
                  <label className="field" style={{ flex: '1 1 90px' }}>
                    Ao nº
                    <input
                      type="number"
                      min={r.sequenceStart || 1}
                      max={100}
                      value={r.sequenceEnd ?? ""}
                      placeholder="Fim"
                      onChange={(e) => {
                        const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                        req(g.id, r.id, { sequenceEnd: val, sequenceType: val === undefined && r.sequenceStart === undefined ? undefined : (r.sequenceType || "sebon") });
                      }}
                    />
                  </label>
                </div>

                <div className="sequence-presets-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      req(g.id, r.id, {
                        kind: "matchuo-kyorugi",
                        sequenceType: "sebon",
                        sequenceStart: 1,
                        sequenceEnd: 5,
                        title: "Matchuo Kyorugi — Sebon 1 ao 5",
                      });
                    }}
                  >
                    Preencher exemplo da escola: faixa amarela · Sebon 1 a 5
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      req(g.id, r.id, {
                        kind: "matchuo-kyorugi",
                        sequenceType: "sebon",
                        sequenceStart: 1,
                        sequenceEnd: 10,
                        title: "Matchuo Kyorugi — Sebon 1 ao 10",
                      });
                    }}
                  >
                    Preencher exemplo da escola: ponta verde · Sebon 1 a 10
                  </button>
                  {(r.sequenceStart !== undefined || r.sequenceEnd !== undefined || r.sequenceType !== undefined) && (
                    <button
                      type="button"
                      onClick={() => {
                        req(g.id, r.id, {
                          sequenceStart: undefined,
                          sequenceEnd: undefined,
                          sequenceType: undefined,
                        });
                      }}
                    >
                      Remover numeração
                    </button>
                  )}
                </div>
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
