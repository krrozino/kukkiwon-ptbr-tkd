import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  validateHandMatrix, handTermDocumentation, handRegionDocumentation, handMatrixCsv,
  handSemanticsProposal,
} from '../src/lib/atlas-hand-documentation';

const load = () => JSON.parse(readFileSync('content/research/atlas-hand-v1/matrix.json', 'utf8'));
const catalog = () => ['kukkiwon-2012-first20','kukkiwon-2012-expansion','sprint02-sonnal-variants']
  .flatMap(name => JSON.parse(readFileSync('content/review/' + name + '.json', 'utf8')).records);

describe('Atlas A2 — evidência documental independente da geometria', () => {
  it('recupera campos com a própria referência e distingue tradução de registro documental', () => {
    const data = validateHandMatrix(load());
    const term = handTermDocumentation(data, 'sonnal')!;
    expect(term.claims.find(c => c.field_name === 'hangul')).toMatchObject({
      value: '손날', evidence_kind: 'primary', editorial_status: 'document_checked',
      reference: { institution: 'Kukkiwon', official_url: 'https://research.kukkiwon.or.kr/homepage/boardMedia/11621' },
    });
    expect(term.claims.find(c => c.field_name === 'translation_pt')).toMatchObject({
      evidence_kind: 'editorial', editorial_status: 'research', publication_status: 'draft',
    });
    expect(term.claims.find(c => c.field_name === 'pronunciation_pt')).toMatchObject({
      evidence_kind: 'editorial', editorial_status: 'research', checked_at: null,
    });
    expect(handTermDocumentation(data, 'termo-inexistente')).toBeNull();
  });

  it('preserva vários sentidos do mesmo Hangul sem transformar tradução em etimologia', () => {
    const term = handTermDocumentation(validateHandMatrix(load()), 'jumeok')!;
    expect(term.senses.some(s => s.sense_kind === 'literal' && s.language_tag === 'en')).toBe(true);
    expect(term.senses.some(s => s.sense_kind === 'technical' && s.language_tag === 'pt-BR')).toBe(true);
    const arc = handTermDocumentation(validateHandMatrix(load()), 'ageumson')!;
    expect(arc.senses.some(s => s.sense_kind === 'literal')).toBe(false);
    expect(arc.term.research_gaps.some(g => g.field_name === 'literal_meaning')).toBe(true);
  });

  it('separa cobertura documental, vínculo geométrico e região ilustrativa', () => {
    const data = validateHandMatrix(load());
    expect(handRegionDocumentation(data, 'sonbadak')!.terms.map(t => t.term.slug)).toContain('sonbadak');
    const illustration = handRegionDocumentation(data, 'illustration-finger-index')!;
    expect(illustration.region.region_kind).toBe('illustrative_anatomy');
    expect(illustration.terms).toEqual([]);
    expect(handTermDocumentation(data, 'modumsonkkeut')!.regions).toEqual([]);
    expect(handTermDocumentation(data, 'modumsonkkeut')!.term.geometry_status).toBe('pending');
    expect(handRegionDocumentation(data, 'regiao-ausente')).toBeNull();
  });

  it('mantém a grafia histórica divergente como variante, sem reescrever o termo', () => {
    const term = handTermDocumentation(validateHandMatrix(load()), 'moeundusonkkeut')!;
    expect(term.claims.some(c => c.field_name === 'romanization' && c.value === 'Moeundusonkkeut')).toBe(true);
    expect(term.claims.some(c => c.field_name === 'variant' && c.value === 'Moundusonkket')).toBe(true);
  });

  it.each([
    ['URL insegura', (d: any) => { d.content_sources[0].official_url = 'javascript:alert(1)'; }],
    ['credenciais', (d: any) => { d.content_sources[0].official_url = 'https://user:pass@example.org/'; }],
    ['localizador vazio', (d: any) => { d.term_field_claims[0].source_locator = ' '; }],
    ['fonte ausente', (d: any) => { d.term_field_claims[0].source_id = 'missing'; }],
    ['conferência ausente', (d: any) => { d.term_field_claims[0].checked_at = null; }],
    ['data futura', (d: any) => { d.term_field_claims[0].checked_at = '2099-01-01'; }],
    ['data impossível', (d: any) => { d.term_field_claims[0].checked_at = '2026-02-30'; }],
    ['publicação indevida', (d: any) => { d.term_field_claims[0].publication_status = 'published'; }],
    ['aprovação simulada', (d: any) => { d.term_senses[0].approved_at = '2026-11-07'; }],
    ['editorial como documental', (d: any) => { const c = d.term_field_claims.find((c: any) => c.evidence_kind === 'editorial'); c.editorial_status = 'document_checked'; c.checked_at = '2026-11-07'; }],
    ['Hangul não NFC', (d: any) => { d.term_field_claims[0].value = '손날'.normalize('NFD'); }],
    ['sentido de outro termo', (d: any) => { d.term_field_claims[0].sense_key = d.term_senses.find((s: any) => s.term_slug !== d.term_field_claims[0].term_slug).sense_key; }],
    ['vínculo sem região', (d: any) => { d.body_region_terms[0].region_slug = 'missing'; }],
    ['chave duplicada', (d: any) => { d.term_field_claims.push(d.term_field_claims[0]); }],
    ['evidência de outro campo', (d: any) => { d.term_field_claims[0].evidence.field_name = 'romanization'; }],
    ['valor sem evidência exata', (d: any) => { d.term_field_claims[0].value = '다른말'; }],
  ])('rejeita %s antes de apresentar o conteúdo', (_, change) => {
    const data = load(); change(data);
    expect(() => validateHandMatrix(data)).toThrow();
  });

  it('rejeita vínculos de uma ilustração como se fossem superfície técnica', () => {
    const data = load();
    data.body_region_terms[0].region_slug = 'illustration-finger-index';
    expect(() => validateHandMatrix(data)).toThrow();
  });

  it('rejeita relações com técnica inexistente ao resolver contra o catálogo explícito', () => {
    const data = load();
    expect(() => validateHandMatrix(data, catalog())).not.toThrow();
    data.term_relations[0].term_slug = 'nonexistent-technique';
    expect(() => validateHandMatrix(data, catalog())).toThrow(/catálogo/);
  });

  it('rejeita correspondência canônica declarada que não existe no catálogo', () => {
    const data = load();
    const linked = data.technical_terms.find((t: any) => t.existing_term_slug !== null);
    const withoutLinkedTerm = catalog().filter((t: any) => t.slug !== linked.slug);
    expect(() => validateHandMatrix(data, withoutLinkedTerm)).toThrow(/catálogo/);
  });

  it.each(['body_region_terms', 'term_relations'])('rejeita assinatura humana simulada em %s', collection => {
    const data = load();
    data[collection][0].approved_by = 'fake-human';
    data[collection][0].approved_at = '2026-11-07';
    expect(() => validateHandMatrix(data)).toThrow();
  });

  it('exporta propostas para #42 preservando campos/valores sem fabricar UUID ou aprovação', () => {
    const data = validateHandMatrix(load());
    const proposal = handSemanticsProposal(data, 'sonnal')!;
    expect(proposal.term_slug).toBe('sonnal');
    expect(proposal.term_senses.length).toBeGreaterThan(0);
    expect(proposal.term_field_claims.every(c => c.publication_status === 'draft' && c.approved_at === null)).toBe(true);
    expect(proposal.field_evidence.every(e => e.source_locator && e.observed_value)).toBe(true);
    expect('term_id' in proposal.term_field_claims[0]).toBe(false);
    expect(handSemanticsProposal(data, 'inexistente')).toBeNull();
  });

  it('CSV reproduz cada afirmação e neutraliza fórmulas em planilhas', () => {
    const data = validateHandMatrix(load());
    expect(handMatrixCsv(data)).toBe(readFileSync('content/research/atlas-hand-v1/claims.csv', 'utf8'));
    const c = data.term_field_claims.find(c => c.evidence_kind === 'editorial')!;
    c.value = '=HYPERLINK("https://example.org")';
    c.evidence.observed_value = c.value;
    expect(handMatrixCsv(data)).toContain('"\'=HYPERLINK(""https://example.org"")"');
  });
});
