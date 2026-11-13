import { describe, it, expect } from 'vitest';
import { buildArgonMatrix, assertPrivateOutput, run } from '../scripts/argon-reconciliation.mjs';
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
});
