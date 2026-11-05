import { useEffect, useState } from "react";
import { initialCurriculum, parseCurriculum, type Curriculum } from "../lib/curriculum";
import CurriculumEditor from "./CurriculumEditor";
import CurriculumView from "./CurriculumView";

export default function CurriculumApp() {
  const [value, setValue] = useState<Curriculum>(initialCurriculum);
  const [editing, setEditing] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("tkd:curriculum-draft");
      if (raw) {
        setValue(parseCurriculum(JSON.parse(raw)));
        setHasDraft(true);
      }
    } catch {
      setMessage("Não foi possível restaurar seu currículo local. O arquivo original foi preservado neste navegador.");
    }
    setReady(true);
  }, []);

  return (
    <div className="curriculum-portal" aria-busy={!ready}>
      <div className="curriculum-portal-grid">
        <section className="card">
          <p className="tag">Sou aluno</p>
          <h2>Consulte seu currículo</h2>
          <p>O professor compartilha um endereço próprio para cada currículo. Abra esse link diretamente no celular para visualizar os conteúdos da sua escola e registrar seu estudo.</p>
          <a href="/estudos" className="inline-link">Organizar meus estudos →</a>
        </section>
        <section className="card">
          <p className="tag">Sou professor</p>
          <h2>Crie o currículo da escola</h2>
          <p>Entre na área da sua escola para definir graduações, vincular conteúdos, adicionar demonstrações e criar links para os alunos.</p>
          <a href="/escolas" className="button">Acessar painel da escola</a>
        </section>
      </div>
      <section className="card curriculum-local">
        <h2>{hasDraft ? "Seu currículo salvo neste navegador" : "Prefere começar sem uma conta?"}</h2>
        <p>{hasDraft
          ? "Seu trabalho local foi preservado. Você pode continuar editando ou visualizar como aluno. Para compartilhar em outros aparelhos, salve pela área de escolas."
          : "Monte seu próprio currículo neste aparelho. Para compartilhá-lo com alunos e sincronizar com a escola, entre no painel do professor."}</p>
        <div className="actions">
          <button disabled={!ready} aria-pressed={editing} onClick={() => setEditing(true)}>
            {hasDraft ? "Continuar editando" : "Montar currículo neste navegador"}
          </button>
          {hasDraft && (
            <button disabled={!ready} aria-pressed={!editing} onClick={() => setEditing(false)}>
              Visualizar currículo salvo
            </button>
          )}
        </div>
        {message && <p role="status">{message}</p>}
        {editing && (
          <>
            <CurriculumEditor value={value} onChange={setValue} />
            <button
              disabled={!ready}
              onClick={() => {
                try {
                  parseCurriculum(value);
                  localStorage.setItem("tkd:curriculum-draft", JSON.stringify(value));
                  setHasDraft(true);
                  setEditing(false);
                  setMessage("Currículo salvo neste navegador. Para enviar um link aos alunos, salve uma versão na área de escolas.");
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : "Não foi possível salvar o currículo.");
                }
              }}
            >Salvar currículo neste navegador</button>
          </>
        )}
        {hasDraft && !editing && <CurriculumView value={value} school="Meu currículo local" identity="local-curriculum" />}
      </section>
    </div>
  );
}
