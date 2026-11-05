import { useEffect, useState } from "react";
import {
  demoCurriculum,
  parseCurriculum,
  type Curriculum,
} from "../lib/curriculum";
import CurriculumEditor from "./CurriculumEditor";
import CurriculumView from "./CurriculumView";
export default function CurriculumApp() {
  const [value, setValue] = useState<Curriculum>(demoCurriculum),
    [editing, setEditing] = useState(false),
    [message, setMessage] = useState(""),
    [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tkd:curriculum-draft");
      if (raw) setValue(parseCurriculum(JSON.parse(raw)));
    } catch {
      setMessage(
        "Não foi possível restaurar o rascunho local; ele foi preservado.",
      );
    }
    setReady(true);
  }, []);
  return (
    <div className="card" aria-busy={!ready}>
      <div className="actions">
        <button disabled={!ready} aria-pressed={!editing} onClick={() => setEditing(false)}>
          Modo aluno · visualizar
        </button>
        <button disabled={!ready} aria-pressed={editing} onClick={() => setEditing(true)}>
          Modo professor · editar exemplo
        </button>
        <a href="/escolas">Entrar e salvar na escola →</a>
      </div>
      <p className="notice">
        Este currículo é demonstrativo. Personalize com o professor da sua
        escola. Não é um requisito oficial da Kukkiwon.
      </p>
      {message && <p role="status">{message}</p>}
      {editing ? (
        <>
          <CurriculumEditor value={value} onChange={setValue} />
          <button
            disabled={!ready}
            onClick={() => {
              try {
                parseCurriculum(value);
                localStorage.setItem(
                  "tkd:curriculum-draft",
                  JSON.stringify(value),
                );
                setMessage(
                  "Rascunho salvo neste navegador. Para compartilhar entre aparelhos, salve na escola.",
                );
              } catch (e) {
                setMessage(
                  e instanceof Error ? e.message : "Não foi possível salvar.",
                );
              }
            }}
          >
            Salvar rascunho local
          </button>
        </>
      ) : (
        <CurriculumView value={value} />
      )}
    </div>
  );
}
