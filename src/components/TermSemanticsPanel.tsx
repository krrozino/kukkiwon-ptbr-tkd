import { useEffect, useState } from "react";
import KnowledgeReferences from "./KnowledgeReferences";
import type { TermSource } from "../lib/catalog-api";
import type { TermFieldClaim, TermSense, TermSemantics } from "../lib/term-semantics";
import { canReadTermSemantics, fetchPublishedTermSemantics } from "../lib/public-term-semantics";

const senseLabels: Record<TermSense["sense_kind"], string> = {
  literal: "Significado literal",
  technical: "Significado técnico",
  contextual: "Uso contextual",
  historical: "Uso histórico",
  regional: "Uso regional",
};
const claimLabels: Record<TermFieldClaim["field_name"], string> = {
  hangul: "Hangul",
  romanization: "Romanização documentada",
  pronunciation_pt: "Pronúncia aproximada em português",
  translation_pt: "Tradução em português",
  definition_pt: "Definição",
  literal_meaning: "Sentido literal",
  technical_meaning: "Sentido técnico",
  context: "Contexto",
  variant: "Variante documentada",
  distinction: "Diferença entre termos",
  region: "Região ou superfície associada",
};

type CitedRow = Pick<TermSense, "source_locator" | "checked_at" | "source_snapshot">;
const asSource = (row: CitedRow): TermSource => ({
  source_locator: row.source_locator,
  checked_at: row.checked_at,
  content_sources: row.source_snapshot,
});

function SourceForClaim({ row }: { row: CitedRow }) {
  return <KnowledgeReferences sources={[asSource(row)]} />;
}

/** Read-only rendering of values that have already passed database RLS + decoder. */
export function TermSemanticsDetails({ data }: { data: TermSemantics }) {
  if (data.senses.length === 0 && data.claims.length === 0) return null;
  return (
    <section className="section-inner term-semantics" aria-label="Significados e variantes com referências">
      <h2>Significados e formas documentadas</h2>
      <p className="fine-print">Uma expressão pode ter vários sentidos ou grafias. Cada informação abaixo apresenta sua própria fonte.</p>
      {data.senses.map((sense) => (
        <section className="term-semantics-entry" key={sense.id}>
          <h3>{senseLabels[sense.sense_kind]}</h3>
          <p>{sense.meaning}</p>
          <p className="fine-print">Contexto: {sense.usage_context}</p>
          <SourceForClaim row={sense} />
        </section>
      ))}
      {data.claims.length > 0 && (
        <div className="term-semantics-claims">
          <h3>Escritas, traduções e outras informações</h3>
          <ul>
            {data.claims.map((claim) => (
              <li key={claim.id} className="term-semantics-entry">
                <strong>{claimLabels[claim.field_name]}</strong>
                <p lang={claim.field_name === "hangul" ? "ko" : undefined}>{claim.value}</p>
                {claim.variant_kind && <p className="fine-print">Variante: {claim.variant_kind.replaceAll("_", " ")}</p>}
                <p className="fine-print">Contexto: {claim.usage_context}</p>
                <SourceForClaim row={claim} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/** Remains completely inactive until BOTH database migrations are enabled. */
export default function TermSemanticsPanel({ termId }: { termId: string }) {
  const [data, setData] = useState<TermSemantics | null>(null);
  const [error, setError] = useState(false);
  const enabled = canReadTermSemantics();
  useEffect(() => {
    setData(null);
    setError(false);
    if (!enabled) return;
    const controller = new AbortController();
    fetchPublishedTermSemantics(termId, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [termId, enabled]);
  if (!enabled) return null;
  if (error) return <p className="fine-print" role="status">Os significados adicionais estão temporariamente indisponíveis.</p>;
  return data ? <TermSemanticsDetails data={data} /> : null;
}
