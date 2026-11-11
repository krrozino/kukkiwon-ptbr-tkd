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
        <a href="/fontes">Fontes e referências</a>
      </div>
    );
  }
  const checked = sources.filter(hasCheckedSource);
  if (!checked.length) return null;
  return (
    <div className="atlas-source-evidence" aria-label="Referências desta região">
      <span className="atlas-source-heading">Fontes desta região</span>
      <KnowledgeReferences sources={checked} />
    </div>
  );
}
