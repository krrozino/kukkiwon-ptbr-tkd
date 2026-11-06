import { useMemo, useState, type ChangeEvent } from "react";
import { parseResearchBundle, type ResearchBundle } from "../lib/research-loader";

/** No hardcoded draft data and no network persistence: the reviewer opens a local JSON file. */
export default function ResearchWorkbench() {
  const [bundle, setBundle] = useState<ResearchBundle | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const categories = useMemo(() => [...new Set(bundle?.records.map(r => r.category_provisional) || [])].sort(), [bundle]);
  const matches = useMemo(() => (bundle?.records || []).filter(r => {
    const haystack = [r.slug_provisional, r.romanization_extracted, r.hangul_extracted,
      r.candidate_id, r.existing_slug_or_variant_candidate || ""].join(" ").toLocaleLowerCase();
    return (!category || r.category_provisional === category) &&
      haystack.includes(query.trim().toLocaleLowerCase());
  }), [bundle, category, query]);
  const active = matches.find(r => r.candidate_id === activeId) ?? matches[0] ?? null;

  const openFile = async (event: ChangeEvent<HTMLInputElement>) => {
    setBundle(null);
    setActiveId(null);
    setError("");
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    try {
      if (file.size > 10_000_000) throw new Error("Arquivo maior que 10 MB; confira a origem.");
      const parsed: unknown = JSON.parse(await file.text());
      setBundle(parseResearchBundle(parsed));
      setQuery("");
      setCategory("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível ler o arquivo.");
    }
  };

  return (
    <section className="card research-lab" aria-label="Laboratório editorial local">
      <p className="tag">Somente ambiente local · dados não homologados</p>
      <h2>Conferência do inventário externo</h2>
      <p>Abra o <code>tecnicas_rascunho.json</code> extraído do pacote de auditoria. O navegador processa o arquivo localmente; nenhuma ficha é enviada ao Supabase ou publicada.</p>
      <label className="research-file">
        <span>Arquivo JSON de pesquisa</span>
        <input aria-label="Arquivo JSON de pesquisa" type="file" accept=".json,application/json" onChange={openFile} />
      </label>
      {error && <p role="alert">{error}</p>}
      {bundle && (
        <>
          <p role="status"><strong>{bundle.records.length} candidatos em pesquisa.</strong> Nenhum aprovado. PDF: {bundle.metadata.pdf_pages} páginas.</p>
          <div className="research-filters">
            <label>Buscar termo, Hangul ou ID
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ex.: ap-chagi" />
            </label>
            <label>Família
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Todas</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>
          <div className="research-columns">
            <div className="research-results">
              <h3>{matches.length} resultados</h3>
              <ul>
                {matches.map(r => <li key={r.candidate_id}>
                  <button type="button" aria-pressed={active?.candidate_id === r.candidate_id} onClick={() => setActiveId(r.candidate_id)}>
                    <strong>{r.romanization_extracted || r.slug_provisional}</strong>
                    <small lang="ko">{r.hangul_extracted}</small>
                    <small>PDF p. {r.pdf_pages.join(", ")}</small>
                  </button>
                </li>)}
              </ul>
            </div>
            <div className="research-detail" aria-label="Evidências do candidato">
              {active ? (
                <>
                  <p className="tag">Pesquisa · não publicável</p>
                  <h3>{active.romanization_extracted || active.slug_provisional}</h3>
                  <p lang="ko">{active.hangul_extracted}</p>
                  <p><strong>ID sugerido:</strong> <code>{active.candidate_id}</code></p>
                  <p><strong>ID no PDF:</strong> <code>{active.pdf_id_observed}</code></p>
                  <p><strong>Localização:</strong> página(s) {active.pdf_pages.join(", ")}</p>
                  <p><strong>Comparação:</strong> {active.compare_existing_repo}
                    {active.existing_slug_or_variant_candidate ? " · " + active.existing_slug_or_variant_candidate : ""}</p>
                  <h4>Alertas de extração</h4>
                  {active.normalization_issues.length ?
                    <ul>{active.normalization_issues.map((flag, i) => <li key={i}>{flag}</li>)}</ul> :
                    <p>Sem alertas automáticos. A conferência técnica continua pendente.</p>}
                  <h4>Colunas originais extraídas</h4>
                  <ol>{active.raw_columns.map((cell, i) =>
                    <li key={i}><pre className="research-raw">{cell || "—"}</pre></li>)}</ol>
                  <p className="fine-print">A identificação de fonte primária, traduções, alvos, nomenclaturas e detalhes técnicos depende de verificação humana. Não utilizar como instrução técnica definitiva.</p>
                </>
              ) : <p>Nenhuma entrada corresponde aos filtros.</p>}
            </div>
          </div>
        </>
      )}
    </section>
  );
}