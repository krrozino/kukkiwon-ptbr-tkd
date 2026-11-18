import { describe, it, expect } from 'vitest';
import {
  buildArgonMatrix,
  assertPrivateOutput,
  loadExistingInventory,
  summarizeArgonReconciliation,
  CANONICAL_RECONCILIATION_MODULES,
  run,
} from '../scripts/argon-reconciliation.mjs';
const row = (id, slug, raw = {}) => ({ id, number: Number(id.slice(4)), candidate_slug: slug, section: 'Anatomia e superfícies', page_start: 52, page_end: 53, raw_cells: { variants: 'Son\nnal', source_audit: 'A\n(SRC-01)', ...raw }, raw_evidence_class: 'A' });
describe('reconciliação Argon é conservação, não aprovação', () => {
  it('preserva células e variantes sem fundir uma correspondência textual', () => {
    const raw = row('TKD-001', 'sonnal');
    const result = buildArgonMatrix({ records: [raw] }, { existing: [{ slug: 'sonnal', origin: 'public-hand' }], expected: 1 });
    expect(result.records[0].original).toEqual(raw);
    expect(result.records[0].matches).toEqual([{ slug: 'sonnal', origin: 'public-hand', basis: 'exact_slug_only' }]);
    expect(result.records[0].publication).toBe('research_only');
    expect(result.records[0].variants_raw).toBe('Son\nnal');
    expect(result.aliases_independently_verified).toBe(false);
  });
  it('não trata grafia parecida como identidade e mantém o candidato novo', () => {
    const result = buildArgonMatrix({ records: [row('TKD-001', 'sonnal-deung')] }, { existing: [{ slug: 'sonnaldeung', origin: 'public-hand' }], expected: 1 });
    expect(result.records[0].matches).toEqual([]);
    expect(result.records[0].disposition).toBe('integration_candidate_requires_validation');
  });
  it('recusa ID duplicado, contagem divergente e página inválida', () => {
    expect(() => buildArgonMatrix({ records: [row('TKD-001','a'),row('TKD-001','b')] }, { expected: 2 })).toThrow(/ID/);
    expect(() => buildArgonMatrix({ records: [] })).toThrow(/380/);
    expect(() => buildArgonMatrix({ records: [{ ...row('TKD-001','a'),page_end: 335 }] }, { expected: 1 })).toThrow(/página/);
  });
  it('recusa saída pública, inclusive usando caminhos relativos', () => {
    const root = process.cwd();
    for (const folder of ['src','public','dist','content/review','.github']) {
      expect(() => assertPrivateOutput(root + '/' + folder + '/matrix.json', root)).toThrow(/externa/);
    }
    expect(() => assertPrivateOutput(root + '/src/../dist/x', root)).toThrow(/externa/);
    expect(assertPrivateOutput(root + '/../private-argon/matrix.json', root)).toContain('private-argon');
  });
  it('recusa extensão que faria o CSV substituir o bundle integral', () => {
    const external = process.cwd() + '/../private-argon/';
    expect(() => run({ source: external + 'input-not-present', output: external + 'matrix.csv' })).toThrow(/\.json/);
    expect(() => run({ source: external + 'input-not-present', output: external + 'matrix' })).toThrow(/\.json/);
  });
  it('mapeia inventário completo das 7 áreas da Biblioteca e do Atlas sem autopublicação', async () => {
    const { libraryItems } = await import('../src/lib/library.ts');
    const existing = loadExistingInventory();
    const existingSlugs = new Set(existing.map(e => e.slug));
    for (const item of libraryItems) {
      expect(existingSlugs.has(item.slug), item.slug).toBe(true);
    }
    expect(existing.some(e => e.slug === 'sonnal' && e.origin === 'public-hand-v1')).toBe(true);
    expect(existing.some(e => e.slug === 'apchuk' && e.origin === 'library:balkisul')).toBe(true);
    expect(existing.some(e => e.slug === 'apchuk' && e.origin === 'atlas-geometry')).toBe(true);
    expect(existing.some(e => e.slug === 'palgup' && e.origin === 'atlas-geometry')).toBe(true);
    expect(existing.some(e => e.slug === 'taegeuk-1-jang' && e.origin === 'library:poomsae')).toBe(true);

    const sampleRecords = [
      { ...row('TKD-001', 'apgubi'), number: 1 },
      { ...row('TKD-002', 'apchuk'), number: 90 },
      { ...row('TKD-003', 'candidato-novo'), number: 355 },
    ];
    // Re-number IDs sequentially for buildArgonMatrix invariant
    const normalized = sampleRecords.map((r, i) => ({
      ...r,
      id: 'TKD-' + String(i + 1).padStart(3, '0'),
    }));
    const matrix = buildArgonMatrix({ records: normalized }, { existing, expected: 3 });
    const summary = summarizeArgonReconciliation(matrix);
    expect(Object.keys(summary.byProposedModule)).toEqual(CANONICAL_RECONCILIATION_MODULES);
    expect(summary.autoPublishedCount).toBe(0);
    expect(summary.aliasesIndependentlyVerified).toBe(false);
    expect(summary.rawAliasLinesCount).toBe(6);
    expect(matrix.records[1].matches.some(m => m.origin === 'library:balkisul')).toBe(true);
  });
});

