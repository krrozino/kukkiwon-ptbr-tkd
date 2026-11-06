import type { AuditedResearchRecord } from "./research-audit.ts";

/** CSV is quoted and formula-prefixed cells are escaped for spreadsheet review. */
export function researchCsvCell(value: string): string {
  const safe = /^[\s]*[=+@-]/u.test(value) || /^[\t\r\n]/u.test(value) ? "'" + value : value;
  return '"' + safe.replaceAll('"', '""') + '"';
}
export function researchReportCsv(records: AuditedResearchRecord[]): string {
  const rows = records.map(r => [r.candidate_id, r.normalized.category, r.normalized.romanization, r.normalized.hangul, r.normalized.name_pt, r.audit_status, r.matches.map(m => m.kind + ":" + m.existing.slug).join("; "), r.matches.flatMap(m => m.conflicts).join("; "), r.original.pdf_pages.join("; ")]);
  return [["candidate_id", "categoria", "romanizacao", "hangul", "nome_pt_original", "estado_documental", "correspondencias_propostas", "conflitos", "paginas_pdf"], ...rows].map(row => row.map(researchCsvCell).join(",")).join("\r\n") + "\r\n";
}
