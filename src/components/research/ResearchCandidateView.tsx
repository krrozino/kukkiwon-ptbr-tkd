import { safeResearchUrl, type AuditedResearchRecord } from "../../lib/research-audit";

export default function ResearchCandidateView({ record: r }: Readonly<{ record: AuditedResearchRecord }>) {
  return <article>
    <p className="tag">Pesquisa · {r.audit_status} · não publicável</p>
    <h3>{r.normalized.romanization || r.normalized.slug}</h3><p lang="ko">{r.normalized.hangul}</p>
    <p><strong>Candidato:</strong> {r.candidate_id} · <strong>ID observado:</strong> {r.original.pdf_id_observed} · <strong>PDF:</strong> p. {r.original.pdf_pages.join(", ")}</p>
    <p className="research-alert">{r.summary}</p>
    <p>O estado documental se limita aos campos citados nas evidências. Tradução, execução, relações anatômicas e decisão editorial exigem revisão própria.</p>
    <h4>Extração e normalização conservadora</h4>
    <div className="research-table-wrap"><table><thead><tr><th scope="col">Campo</th><th scope="col">Extração original</th><th scope="col">Unicode NFC e quebras de linha</th></tr></thead><tbody>
      {([['Português', r.original.name_pt_raw, r.normalized.name_pt], ['Hangul', r.original.hangul_extracted, r.normalized.hangul], ['Romanização', r.original.romanization_extracted, r.normalized.romanization], ['Slug', r.original.slug_provisional, r.normalized.slug]] as const).map(([label, raw, normalized]) => <tr key={label}><th scope="row">{label}</th><td><pre>{typeof raw === 'string' ? raw || '—' : '—'}</pre></td><td><pre>{normalized || '—'}</pre></td></tr>)}
    </tbody></table></div>
    <h4>Comparação com o catálogo editorial</h4>
    {!r.matches.length && <p>Sem correspondência identificada. A identidade e a classificação continuam em revisão; não é uma nova técnica aprovada.</p>}
    {r.matches.map(m => <section className="research-comparison" key={m.existing.slug} aria-label={`Comparação ${m.existing.slug}`}>
      <h5>{m.existing.romanization} · {m.kind}</h5>
      <dl><dt>Registro existente</dt><dd>{m.existing.slug} · {m.existing.record_kind} · lote {m.existing.batch}</dd><dt>Hangul</dt><dd lang="ko">{m.existing.hangul}</dd><dt>Português existente</dt><dd>{m.existing.translation_pt}</dd><dt>Definição existente</dt><dd>{m.existing.definition_pt}</dd><dt>Localizador existente</dt><dd>{m.existing.source_locator}</dd></dl>
      <p>{m.conflicts.length ? `Divergência: ${m.conflicts.join(', ')}. Preservar os dois valores até decisão humana.` : 'A correspondência é um indício. Sinônimo, variante, família e homônimo dependem de resolução humana.'}</p>
    </section>)}
    {!!r.duplicate_candidate_ids.length && <p className="research-alert">Possíveis duplicatas internas: {r.duplicate_candidate_ids.join(', ')}. Nenhum candidato foi removido.</p>}
    <h4>Evidências documentais</h4>
    {r.evidence.length ? <ul>{r.evidence.map(e => <li key={[e.source_id, e.locator, ...e.fields, e.finding].join("|")}><strong>{e.fields.join(', ')}</strong>: {e.finding}<br/>{safeResearchUrl(e.url) && <a href={e.url} target="_blank" rel="noopener noreferrer">{e.source_id}</a>} · {e.locator}</li>)}</ul> : <p>Sem evidência individual acessada registrada. O rótulo {(typeof r.original.evidence_label_in_pdf === "string" ? r.original.evidence_label_in_pdf : "—")} veio do PDF e não comprova a informação.</p>}
    {!!r.proposed_corrections.length && <><h4>Propostas documentais de correção</h4><ul>{r.proposed_corrections.map(p => <li key={[p.field, p.source_id, p.locator, p.original, p.proposed].join("|")}><strong>{p.field}</strong><pre>{p.original}</pre><span>Proposta:</span><pre>{p.proposed}</pre><p>{p.reason} · {p.source_id} · {p.locator}</p></li>)}</ul></>}
    <h4>Campos incompletos e alertas de extração</h4>
    <p>{r.incomplete_fields.length ? r.incomplete_fields.join(', ') : 'Os campos esperados estão preenchidos. Isso não comprova sua correção.'}</p>
    {r.original.normalization_issues.length ? <ul>{r.original.normalization_issues.map((flag, i) => <li key={i}>{flag}</li>)}</ul> : <p>Sem alertas automáticos de fragmentação.</p>}
    <details><summary>Ver todas as colunas originais</summary><ol>{Object.entries(r.original.raw_columns).map(([position, cell]) => <li key={r.candidate_id + ":original-column:" + position}><pre className="research-raw">{cell || '—'}</pre></li>)}</ol></details>
  </article>;
}
