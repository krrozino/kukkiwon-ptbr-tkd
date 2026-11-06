import { useState, type SubmitEvent } from "react";
import type { AuditedResearchRecord } from "../../lib/research-audit";
import { candidateReviewState, proposalFields, reviewChecklist, type ChecklistKey, type ReviewInput, type ReviewSession } from "../../lib/research-session";

export default function ResearchReviewPanel({ record, session, onEvent }: Readonly<{ record: AuditedResearchRecord; session: ReviewSession | null; onEvent: (input: ReviewInput) => boolean }>) {
  const [note, setNote] = useState(""); const [field, setField] = useState<string>(proposalFields[0]);
  const [proposed, setProposed] = useState(""); const [reason, setReason] = useState("");
  const [url, setUrl] = useState(""); const [locator, setLocator] = useState("");
  const state = candidateReviewState(session, record.candidate_id);
  const submitProposal = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onEvent({ kind: "proposal", candidate_id: record.candidate_id, field, proposed, reason, url, locator })) { setProposed(""); setReason(""); }
  };
  return <section className="research-review" aria-label="Observações editoriais locais">
    <h4>Checklist de revisão</h4>
    {!session && <p>Inicie uma sessão com sua identificação para registrar checklist e propostas.</p>}
    <fieldset disabled={!session}><legend>Registrar conferências como observação local</legend>{Object.entries(reviewChecklist).map(([key, label]) => <label className="research-check" key={key}><input type="checkbox" checked={!!state.checklist[key as ChecklistKey]} onChange={e => onEvent({ candidate_id: record.candidate_id, kind: "checklist", key, checked: e.target.checked })}/>{label}</label>)}</fieldset>
    <p className="fine-print">Concluir o checklist não altera a evidência documental, o status técnico ou a publicação.</p>
    <form onSubmit={e => { e.preventDefault(); if (onEvent({ kind: "note", candidate_id: record.candidate_id, text: note })) setNote(""); }}>
      <label>Observação para revisão<textarea value={note} onChange={e => setNote(e.target.value)} maxLength={5000} required disabled={!session}/></label><button disabled={!session} type="submit">Registrar observação</button>
    </form>
    <details><summary>Propor correção com justificativa e evidência</summary><form onSubmit={submitProposal}>
      <label>Campo da proposta<select value={field} onChange={e => setField(e.target.value)} disabled={!session}>{proposalFields.map(k => <option key={k}>{k}</option>)}</select></label>
      <p>Valor original preservado:</p><pre>{(typeof record.original[field] === "string" ? record.original[field] : "—")}</pre>
      <label>Valor proposto<textarea value={proposed} onChange={e => setProposed(e.target.value)} required maxLength={5000} disabled={!session}/></label>
      <label>Justificativa<textarea value={reason} onChange={e => setReason(e.target.value)} minLength={10} maxLength={5000} required disabled={!session}/></label>
      <label>URL HTTPS da evidência<input value={url} onChange={e => setUrl(e.target.value)} type="url" required maxLength={2000} disabled={!session}/></label>
      <label>Página ou seção da evidência<input value={locator} onChange={e => setLocator(e.target.value)} required maxLength={5000} disabled={!session}/></label>
      <button type="submit" disabled={!session}>Registrar proposta de correção</button>
    </form></details>
    <h4>Histórico das observações e propostas</h4>
    {state.history.length ? <ol className="research-history">{state.history.map(e => <li key={e.event_id}><strong>#{e.sequence} · {e.kind}</strong><br/>{e.actor_name} · <time dateTime={e.recorded_at}>{e.recorded_at}</time><pre>{JSON.stringify(e.data, null, 2)}</pre></li>)}</ol> : <p>Nenhum evento registrado para este candidato.</p>}
  </section>;
}
