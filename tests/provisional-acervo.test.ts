import { describe, expect, it } from 'vitest';
import { buildProvisionalAcervo, filterProvisionalAcervo, type ProvisionalBatch } from '../src/lib/provisional-acervo';

const source = { institution:'Kukkiwon', title:'Documento de teste', edition:'Edição de teste', year:2011, url:'https://research.kukkiwon.or.kr/document' };
const region = { slug:'palgup', romanization:'Palgup', hangul:'팔굽', category:'corpo', translation_pt:'Cotovelo', definition_pt:'Definição provisória.', source_locator:'Appendix > Palgup', publication_status:'draft', editorial_status:'research', atlas:{area:'arms',view:'both',x:null,y:null} };
const technique = { slug:'example-lock', romanization:'Exemplo', hangul:'예', category:'controle', translation_pt:'Controle de teste', definition_pt:'Proposta de teste.', source_locator:'§9 > Exemplo', publication_status:'draft', editorial_status:'research', anatomical_links:[{region_slug:'palgup', relation_type:'target', source_locator:'§9 > Exemplo > use'}] };
const batch = ():ProvisionalBatch[] => [{batch:'fixture',source,records:[structuredClone(region),structuredClone(technique)]}];

describe('acervo provisório, sem promoção editorial',()=>{
  it('projeta somente campos de consulta, mantendo revisão e lacunas explícitas',()=>{
    const input=batch();
    Object.assign(input[0].records[1],{api_token:'private',raw_columns:['private'],pronunciation_pt:'não copiar'});
    const before=JSON.stringify(input);
    const entries=buildProvisionalAcervo(input);
    expect(entries).toHaveLength(2);
    const entry=entries.find(e=>e.slug==='example-lock')!;
    expect(entry.status).toBe('provisional');
    expect(entry.fields.hangul?.value).toBe('예');
    expect(entry.fields.translation_pt?.evidence.locator).toBe('§9 > Exemplo');
    expect(entry.fields.translation_pt?.evidence.review).toBe('pending');
    expect(entry.gaps).toContain('pronunciation_pt');
    expect(JSON.stringify(entries)).not.toMatch(/private|raw_columns|api_token|não copiar/);
    expect(JSON.stringify(input)).toBe(before);
  });
  it('preserva o papel de alvo e permite consulta reversa sem inventar superfície',()=>{
    const entries=buildProvisionalAcervo(batch());
    const entry=entries.find(e=>e.slug==='example-lock')!;
    expect(entry.relations[0]).toMatchObject({regionSlug:'palgup',role:'target',atlasArea:'arms',evidence:{locator:'§9 > Exemplo > use',review:'pending'}});
    expect(filterProvisionalAcervo(entries,{region:'palgup'}).map(e=>e.slug)).toEqual(['palgup','example-lock']);
    expect(filterProvisionalAcervo(entries,{query:'COTOVELO'})).toHaveLength(1);
    expect(filterProvisionalAcervo(entries,{query:'팔굽'})).toHaveLength(1);
    expect(filterProvisionalAcervo(entries,{category:'controle',region:'palgup'})).toHaveLength(1);
    expect(filterProvisionalAcervo(entries,{region:'absent'})).toHaveLength(0);
  });
  it('recusa fontes inseguras, duplicidade, referências vazias e regiões inexistentes',()=>{
    for(const url of ['http://example.org','javascript:alert(1)','https://user:secret@example.org']) {
      const b=batch();b[0].source={...source,url};
      expect(()=>buildProvisionalAcervo(b)).toThrow(/fonte/i);
    }
    const duplicate=batch();duplicate[0].records.push(duplicate[0].records[0]);
    expect(()=>buildProvisionalAcervo(duplicate)).toThrow(/duplicado/i);
    const missing=batch();missing[0].records[1].source_locator=' ';
    expect(()=>buildProvisionalAcervo(missing)).toThrow(/localizador/i);
    const orphan=batch();orphan[0].records[1].anatomical_links![0].region_slug='absent';
    expect(()=>buildProvisionalAcervo(orphan)).toThrow(/região/i);
  });
  it('não transforma ausência de Hangul, definição ou relação em resposta inferida',()=>{
    const b=batch();Object.assign(b[0].records[1],{hangul:'',definition_pt:'',anatomical_links:[]});
    const entry=buildProvisionalAcervo(b)[1];
    expect(entry.fields.hangul).toBeUndefined();
    expect(entry.gaps).toEqual(expect.arrayContaining(['hangul','definition_pt','anatomical_links','pronunciation_pt']));
    expect(entry.relations).toEqual([]);
  });
});
