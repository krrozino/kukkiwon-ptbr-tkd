import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { auditResearch, auditStatuses, parseAuditFile, searchResearchRecord, type AuditedResearchBundle } from "../lib/research-audit";
import { createReviewSession, appendReviewEvent, parseReviewSession, type ReviewInput, type ReviewSession } from "../lib/research-session";
import { researchReportCsv } from "../lib/research-reports";
import ResearchCandidateView from "./research/ResearchCandidateView";
import ResearchReviewPanel from "./research/ResearchReviewPanel";
import "../styles/research.css";

const labels: Record<string, string> = { verified_primary: "Fonte primária · campos indicados", verified_secondary: "Fonte secundária · campos indicados", conflicting: "Divergência documental", insufficient_evidence: "Evidência insuficiente", extraction_error: "Erro de extração", pending_review: "Revisão pendente" };
function download(body: string, name: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([body], { type: type + ";charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
/** No source data imports, fetches, storage or backend persistence. Dev-only route. */
export default function ResearchWorkbench() {
  const [bundle, setBundle] = useState<AuditedResearchBundle | null>(null);
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const [query, setQuery] = useState(""); const [category, setCategory] = useState("");
  const [status, setStatus] = useState(""); const [comparison, setComparison] = useState("");
  const [batch, setBatch] = useState(""); const [activeId, setActiveId] = useState<string | null>(null);
  const [actor, setActor] = useState(""); const [busy, setBusy] = useState(false);
  const loadVersion = useRef(0);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const categories = useMemo(() => [...new Set(bundle?.records.map(r => r.normalized.category) || [])].sort((a, b) => a.localeCompare(b, "pt-BR")), [bundle]);
  const matches = useMemo(() => (bundle?.records || []).filter((r, i) =>
    (!category || r.normalized.category === category) && (!status || r.audit_status === status) &&
    (!batch || Math.floor(i / 20) === Number(batch) - 1) && searchResearchRecord(r, query) &&
    (!comparison || (comparison === "unmatched" && !r.matches.length) || (comparison === "conflict" && r.matches.some(m => m.conflicts.length)) || (comparison === "duplicate" && r.duplicate_candidate_ids.length) || (comparison === "variant" && r.matches.some(m => m.kind === "possible_variant_review")))
  ), [bundle, query, category, status, comparison, batch]);
  const active = matches.find(r => r.candidate_id === activeId) || matches[0] || null;
  const openFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const version = ++loadVersion.current, file = event.currentTarget.files?.[0];
    setError(""); setNotice(""); setBundle(null); setSession(null); setActiveId(null);
    if (!file) return;
    setBusy(true);
    try {
      if (file.size > 10_000_000) throw new Error("Arquivo maior que 10 MB; confira a origem.");
      const input: unknown = JSON.parse(await file.text());
      const parsed = typeof input === "object" && input !== null && "format" in input ? parseAuditFile(input) : auditResearch(input, []);
      if (version !== loadVersion.current) return;
      setBundle(parsed); setQuery(""); setCategory(""); setStatus(""); setComparison(""); setBatch("");
      setNotice(parsed.existing_terms.length ? "Relatório íntegro aberto com comparação editorial." : "Extração original aberta. Para comparar os 108 registros, abra audit.json gerado pelo pipeline.");
    } catch (cause) { if (version === loadVersion.current) setError(cause instanceof Error ? cause.message : "Falha ao ler pesquisa."); }
    finally { if (version === loadVersion.current) setBusy(false); }
  };
  const openSession = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0], current = bundle, version = loadVersion.current;
    if (!file || !current) return;
    setError("");
    try {
      if (file.size > 10_000_000) throw new Error("Sessão maior que 10 MB.");
      const parsed = await parseReviewSession(JSON.parse(await file.text()), current);
      if (version === loadVersion.current) { setSession(parsed); setNotice("Sessão local reaberta; identificação declarada, sem autenticação ou homologação."); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Sessão inválida."); }
  };
  const startSession = async () => {
    if (!bundle) return;
    const version = loadVersion.current;
    try { const value = await createReviewSession(bundle, actor); if (version === loadVersion.current) { setSession(value); setError(""); } }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Identificação inválida."); }
  };
  const recordEvent = (input: ReviewInput) => {
    if (!session || !bundle) return false;
    try { setSession(appendReviewEvent(session, bundle, input)); setError(""); setNotice("Evento adicionado à sessão local. Exporte para preservar o histórico."); return true; }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Evento inválido."); return false; }
  };
  return <section className="card research-lab" aria-label="Laboratório editorial local" aria-busy={!ready || busy}>
    <p className="tag">Somente ambiente local · dados não homologados</p>
    <h2>Conferência e propostas editoriais</h2>
    <p>Abra <code>audit.json</code> gerado por <code>npm run research:prepare</code>, ou a extração <code>tecnicas_rascunho.json</code>. Os arquivos são processados nesta aba.</p>
    <label className="research-file">Arquivo JSON de pesquisa<input aria-label="Arquivo JSON de pesquisa" type="file" accept=".json,application/json" disabled={!ready} onChange={openFile}/></label>
    {error && <p role="alert" className="research-alert">{error}</p>}
    {notice && <p className="fine-print" aria-live="polite">{notice}</p>}
    {bundle && <>
      <p><output><strong>{bundle.records.length} candidatos em pesquisa. Nenhum aprovado.</strong> PDF: {bundle.metadata.pdf_pages} páginas. Comparação: {bundle.existing_terms.length} registros existentes.</output></p>
      <details className="research-session" open={!session}>
        <summary>Sessão de revisão {session ? `· ${session.actor_name} · ${session.events.length} eventos` : "· iniciar ou reabrir"}</summary>
        <p>Use sua identificação real. Este registro local é uma declaração do autor das observações; não autentica identidade nem concede aprovação. O histórico existe nesta aba até você exportá-lo.</p>
        {!session && <div className="research-actions"><label>Nome e vínculo do responsável<input value={actor} onChange={e => setActor(e.target.value)} autoComplete="name" maxLength={200}/></label><button type="button" onClick={startSession}>Iniciar sessão de observações</button></div>}
        <label>Reabrir sessão JSON<input aria-label="Reabrir sessão JSON" type="file" accept=".json,application/json" onChange={openSession}/></label>
        {session && <button type="button" onClick={() => download(JSON.stringify(session, null, 2) + "\n", "sessao-revisao-local.json")}>Exportar sessão e histórico</button>}
      </details>
      <div className="research-filters">
        <label>Buscar português, Hangul, romanização ou ID<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Ex.: ap-chagi" maxLength={200}/></label>
        <label>Categoria<select value={category} onChange={e => setCategory(e.target.value)}><option value="">Todas</option>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
        <label>Estado documental<select value={status} onChange={e => setStatus(e.target.value)}><option value="">Todos</option>{auditStatuses.map(s => <option value={s} key={s}>{labels[s]}</option>)}</select></label>
        <label>Correspondência<select value={comparison} onChange={e => setComparison(e.target.value)}><option value="">Todas</option><option value="conflict">Com divergência</option><option value="duplicate">Duplicata interna possível</option><option value="variant">Variante possível</option><option value="unmatched">Sem correspondência</option></select></label>
        <label>Lote de trabalho<select value={batch} onChange={e => setBatch(e.target.value)}><option value="">Todos os candidatos</option>{Array.from({ length: Math.ceil(bundle.records.length / 20) }, (_, i) => <option key={i} value={i + 1}>Lote {i + 1} · {i * 20 + 1}–{Math.min((i + 1) * 20, bundle.records.length)}</option>)}</select></label>
      </div>
      <div className="research-actions"><p aria-live="polite">{matches.length} resultados nos filtros.</p><button type="button" onClick={() => download(researchReportCsv(matches), "candidatos-filtrados.csv", "text/csv")}>Exportar resultados CSV</button></div>
      <div className="research-columns">
        <nav className="research-results" aria-label="Candidatos de pesquisa"><ul>{matches.map(r => <li key={r.candidate_id}><button type="button" aria-pressed={active?.candidate_id === r.candidate_id} onClick={() => setActiveId(r.candidate_id)}><strong>{r.normalized.romanization || r.normalized.slug}</strong><small lang="ko">{r.normalized.hangul}</small><small>{r.candidate_id} · PDF p. {r.original.pdf_pages.join(", ")}</small><small>{labels[r.audit_status]}</small></button></li>)}</ul></nav>
        <div className="research-detail" aria-label="Evidências do candidato">{active ? <><ResearchCandidateView record={active}/><ResearchReviewPanel key={active.candidate_id} record={active} session={session} onEvent={recordEvent}/></> : <p>Nenhuma entrada corresponde aos filtros.</p>}</div>
      </div>
    </>}
  </section>;
}
