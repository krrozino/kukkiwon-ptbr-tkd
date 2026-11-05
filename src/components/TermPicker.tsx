import { useEffect, useState } from "react";
import { fetchCatalogPage, type TechnicalTerm } from "../lib/catalog-api";
export default function TermPicker({
  onPick,
}: {
  onPick: (t: TechnicalTerm) => void;
}) {
  const [q, setQ] = useState(""),
    [terms, setTerms] = useState<TechnicalTerm[]>([]),
    [error, setError] = useState("");
  useEffect(() => {
    setTerms([]);
    if (q.trim().length < 2) return;
    const c = new AbortController();
    const timer = setTimeout(() => {
      fetchCatalogPage({ query: q, pageSize: 6 }, c.signal)
        .then((d) => {
          if (!c.signal.aborted) {
            setTerms(d.items);
            setError(
              d.items.length
                ? ""
                : "Nenhuma técnica disponível para esta busca.",
            );
          }
        })
        .catch(() => {
          if (!c.signal.aborted)
            setError("Não foi possível consultar o catálogo.");
        });
    }, 180);
    return () => {
      c.abort();
      clearTimeout(timer);
    };
  }, [q]);
  return (
    <div className="term-picker">
      <label className="field">
        Buscar técnica para inserir
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setError("");
          }}
          placeholder="Nome, Hangul ou romanização"
          maxLength={200}
        />
      </label>
      {error && (
        <p role="status" className="fine-print">
          {error}
        </p>
      )}
      {terms.length > 0 && (
        <ul className="picker-results">
          {terms.map((t) => (
            <li key={t.slug}>
              <button
                onClick={() => {
                  onPick(t);
                  setQ("");
                  setTerms([]);
                }}
              >
                {t.romanization} · {t.translation_pt}
                {t.publication_status === "draft" ? " · rascunho" : ""}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
