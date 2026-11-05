import { useEffect, useState } from "react";
import { publicSchoolCurriculum } from "../lib/school-api";
import CurriculumView from "./CurriculumView";
export default function SharedCurriculum() {
  const [data, setData] =
      useState<Awaited<ReturnType<typeof publicSchoolCurriculum>>>(null),
    [status, setStatus] = useState("Carregando currículo compartilhado…");
  useEffect(() => {
    const c = new AbortController();
    const id = new URLSearchParams(location.search).get("id");
    if (!id) {
      setStatus("Link de currículo inválido.");
      return;
    }
    publicSchoolCurriculum(id, c.signal)
      .then((d) => {
        if (!c.signal.aborted) {
          setData(d);
          setStatus(
            d ? "" : "Currículo privado, removido ou não compartilhado.",
          );
        }
      })
      .catch(() => {
        if (!c.signal.aborted)
          setStatus(
            "Não foi possível abrir o currículo. Confira a conexão ou peça ao professor um link atualizado.",
          );
      });
    return () => c.abort();
  }, []);
  return (
    <div className="card">
      {data ? (
        <CurriculumView
          value={data.curriculum.content}
          school={data.school?.name || "Escola"}
          identity={data.curriculum.id}
          media={data.media}
          schoolTerms={data.terms}
        />
      ) : (
        <p role="status">{status}</p>
      )}
    </div>
  );
}
