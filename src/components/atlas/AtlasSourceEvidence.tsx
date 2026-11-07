import type { TermSource } from "../../lib/catalog-api";
import { hasCheckedSource } from "../../lib/published-knowledge";
import KnowledgeReferences from "../KnowledgeReferences";

/**
 * Evidence is attached to the exact selected atlas record, never inferred
 * from the illustrative SVG path or from an unrelated source index.
 */
export default function AtlasSourceEvidence({
  kind,
  sources = [],
}: {
  kind: "technical" | "illustrative";
  sources?: TermSource[];
}) {
  if (kind === "illustrative") {
    return (
      <div className="atlas-source-evidence" aria-label="Origem da ilustração">
        <small>
          Desenho esquemático do projeto. A identificação visual em português
          não constitui nomenclatura oficial da Kukkiwon.
        </small>
        <a href="/fontes">Como conferimos as fontes e as técnicas</a>
      </div>
    );
  }
  const checked = sources.filter(hasCheckedSource);
  return (
    <div className="atlas-source-evidence" aria-label="Referências desta região">
      <span className="atlas-source-heading">Fonte documental desta ficha</span>
      {checked.length ? (
        <KnowledgeReferences sources={checked} />
      ) : (
        <p className="fine-print">
          Esta prévia ainda não apresenta fonte individual com localizador e
          conferência registrados. A referência técnica precisa ser verificada.
          {" "}
          <a href="/fontes">Entenda os critérios de publicação</a>.
        </p>
      )}
    </div>
  );
}
