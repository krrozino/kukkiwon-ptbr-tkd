import { describe, expect, it } from 'vitest';
import { inspectArgonInventory, reconcileWithExisting, allowedOutputPath } from '../scripts/argon-inventory.mjs';

const rows = (count = 380) => ({
  provenance_pdf: 'Enciclopédia Técnica de Taekwondo.pdf',
  records: Array.from({length: count}, (_, i) => ({
    id: 'TKD-' + String(i + 1).padStart(3, '0'),
    candidate_slug: 'candidate-' + (i + 1),
    page_start: Math.min(334, 18 + i),
    page_end: Math.min(334, 18 + i),
    raw_cells: { slug: 'candidate-' + (i + 1) },
    hangul_raw: '',
    romanization_raw: '',
    raw_evidence_class: i < 357 ? 'A' : i < 369 ? 'B' : i < 378 ? 'C' : i === 378 ? 'A/B' : 'B/C',
  }))
});
describe('Argon PDF — conferência offline do inventário de pesquisa', () => {
  it('valida 380 IDs sem tratar alegações como registros publicados', () => {
    const x = inspectArgonInventory(rows());
    expect(x.unique_ids).toBe(380);
    expect(x.unique_candidate_slugs).toBe(380);
    expect(x.summary_grade_conflict).toBe(true);
    expect(x.records.every((r: { may_publish: boolean; needs_field_verification: boolean }) => r.may_publish === false && r.needs_field_verification)).toBe(true);
  });
  it('rejeita registros ausentes, duplicados e páginas inválidas', () => {
    expect(() => inspectArgonInventory(rows(379))).toThrow(/Contagem/);
    const duplicate = rows(); duplicate.records[5].id = 'TKD-005';
    expect(() => inspectArgonInventory(duplicate)).toThrow(/ID/);
    const invalid = rows(); invalid.records[20].page_end = 999;
    expect(() => inspectArgonInventory(invalid)).toThrow(/Página/);
  });
  it('reconcilia somente slug exato, sem decidir equivalência ou aprovação', () => {
    const x = inspectArgonInventory(rows());
    const r = reconcileWithExisting(x, ['candidate-1', 'candidate-240']);
    expect(r.exact_slug_matches).toBe(2);
    expect(r.unmatched_count).toBe(378);
    expect(r.note).toContain('não confirma identidade');
  });
  it('proíbe gravar o relatório em diretórios públicos ou fonte', () => {
    expect(() => allowedOutputPath('src/data/argon.json')).toThrow(/proibida/);
    expect(() => allowedOutputPath('public/argon.json')).toThrow(/proibida/);
    expect(allowedOutputPath('../argon-private.json')).toContain('argon-private.json');
  });
});
