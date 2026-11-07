import { describe, it, expect } from 'vitest';
import { validateTermSemantics, parsePublishedTermSemantics, TERM_SENSE_COLUMNS, TERM_CLAIM_COLUMNS } from '../src/lib/term-semantics';
import fixture from './fixtures/term-semantics.json';

const id = '42000000-0000-4000-8000-000000000001';
function published() {
  const data = structuredClone(fixture.data);
  for (const row of [...data.senses, ...data.claims]) {
    Object.assign(row,{editorial_status:'technical_reviewed',publication_status:'published',
      checked_at:'2026-11-06T12:00:00Z',approved_at:'2026-11-06T13:00:00Z'});
  }
  return data;
}

describe('contrato de sentidos/afirmações', () => {
  it('valida exemplos de pesquisa sem confundi-los com conteúdo publicado', () => {
    const data = validateTermSemantics(fixture.data);
    expect(data.senses.map(s => s.meaning)).toEqual([
      'Base com peso atrás','Mão em arco','Base do calcanhar','Parte posterior do calcanhar',
    ]);
    expect(data.claims.find(c => c.variant_kind === 'documented_spelling')?.value).toBe('Duit kubi');
    expect(() => parsePublishedTermSemantics(fixture.data,id)).toThrow(/publicad/i);
  });
  it('preserva sentidos/variantes e evidencia independente, sem eleger tradução canônica', () => {
    const data=published();
    data.senses=data.senses.filter(s=>s.term_id===id);
    data.claims=data.claims.filter(c=>c.term_id===id && c.related_term_id===null);
    const result=parsePublishedTermSemantics(data,id);
    expect(result.senses).toHaveLength(1);
    expect(result.claims.filter(c=>c.field_name==='romanization').map(c=>c.value)).toEqual(['Dwitgubi','Duit kubi']);
    expect(TERM_SENSE_COLUMNS.split(',')).not.toContain('approved_by');
    expect(TERM_CLAIM_COLUMNS.split(',')).not.toContain('evidence_id');
  });
  it.each(['javascript:alert(1)','data:text/html,x','http://example.org','https://u:p@example.org'])('recusa URL insegura %s', url => {
    const data=published(); data.senses[0].source_snapshot.official_url=url;
    expect(()=>validateTermSemantics(data)).toThrow(/referência/i);
  });
  it.each(['source_locator','meaning','language_tag','usage_context'])('recusa %s vazio', field => {
    const data=published(); Object.assign(data.senses[0],{[field]:' '});
    expect(()=>validateTermSemantics(data)).toThrow();
  });
  it('recusa metadados privados, estados inventados e documento ausente', () => {
    for(const patch of [{approved_by:id},{evidence_id:id},{editorial_status:'approved'},{source_snapshot:null}]) {
      const data=published(); Object.assign(data.senses[0],patch);
      expect(()=>validateTermSemantics(data)).toThrow();
    }
  });
  it('recusa datas futuras, publicação sem revisão e sem conferência', () => {
    for(const patch of [{checked_at:null},{approved_at:null},{editorial_status:'research'},
      {checked_at:'2999-01-01T00:00:00Z'},{approved_at:'2999-01-01T00:00:00Z'}]) {
      const data=published(); Object.assign(data.senses[0],patch);
      expect(()=>validateTermSemantics(data)).toThrow();
    }
  });
  it('recusa IDs duplicados, sentido de outro termo, pais ausentes e lote de outro termo', () => {
    const data=published();
    expect(()=>validateTermSemantics({...data,senses:[...data.senses,data.senses[0]]})).toThrow();
    const wrong=structuredClone(data); wrong.claims[0].sense_id=data.senses[1].id;
    expect(()=>validateTermSemantics(wrong)).toThrow(/sentido/i);
    expect(()=>validateTermSemantics({...data,senses:[]})).toThrow(/sentido/i);
    expect(()=>parsePublishedTermSemantics(data,id)).toThrow(/termo/i);
  });
  it('recusa vínculo anatômico incompleto e diferença que aponta ao próprio termo', () => {
    for(const patch of [{region_id:id,region_usage_context:null},{region_id:id,region_usage_context:'surface'},
      {field_name:'distinction',related_term_id:id},{variant_kind:'synonym',field_name:'hangul'}]) {
      const data=published(); Object.assign(data.claims[0],patch);
      expect(()=>validateTermSemantics(data)).toThrow();
    }
  });
  it('mede limites textuais em caracteres Unicode, como o PostgreSQL', () => {
    const data=published(); data.senses[0].meaning='🥋'.repeat(3000);
    expect(validateTermSemantics(data).senses[0].meaning).toBe(data.senses[0].meaning);
  });
});
