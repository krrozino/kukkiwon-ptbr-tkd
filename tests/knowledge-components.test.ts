import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PoomsaeForm, PoomsaeStep } from '../src/lib/poomsae';

const technical_terms = {id:'form-fixture',slug:'form-fixture',romanization:'Forma de teste',category:'poomsae',record_kind:'poomsae',hangul:null,translation_pt:'Fixture',definition_pt:null,pronunciation_pt:null,publication_status:'published' as const};
const evidence = {publication_status:'published' as const,checked_at:'2026-11-06',approved_at:'2026-11-06',source_locator:'Fixture §1',content_sources:{institution:'Fixture',title:'Documento de teste',edition:null,publication_year:2026,official_url:'https://example.org/test'}};
const form: PoomsaeForm = {...evidence,term_id:technical_terms.id,sequence_version:'fixture-v1',technical_terms};
const step: PoomsaeStep = {...evidence,id:'step-fixture',poomsae_term_id:form.term_id,step_number:3,instruction_pt:'Instrução de teste.',technical_terms:{...technical_terms,id:'technique-fixture',slug:'technique-fixture',romanization:'Técnica de teste',record_kind:'technique'}};

describe('public knowledge components',()=>{
  it('opens a region context only when a recorded catalog relation supplies that exact term',async()=>{
    const {regionContextSlug} = await import('../src/components/AtlasRelations');
    expect(regionContextSlug('surface-fixture',[])).toBeNull();
    expect(regionContextSlug('surface-fixture',[{term_id:'fixture',usage_context:'surface',anatomical_role:'surface',technical_terms:{slug:'another-fixture',romanization:'Fixture',translation_pt:null}}])).toBeNull();
    expect(regionContextSlug('surface-fixture',[{term_id:'fixture',usage_context:'surface',anatomical_role:'surface',technical_terms:{slug:'surface-fixture',romanization:'Fixture',translation_pt:null}}])).toBe('surface-fixture');
  });
  it('groups explicit atlas roles and keeps each recorded source beside its technique',async()=>{
    const {default:AtlasRelations} = await import('../src/components/AtlasRelations');
    const html = renderToStaticMarkup(createElement(AtlasRelations,{links:[{term_id:'fixture',usage_context:'surface',anatomical_role:'surface',source_locator:'Atlas fixture §2',content_sources:evidence.content_sources,technical_terms:{slug:'technique-fixture',romanization:'Técnica de teste',translation_pt:'Fixture',publication_status:'published'}}],onPreview:()=>{}}));
    expect(html).toContain('Superfícies de contato');
    expect(html).toContain('/tecnica?slug=technique-fixture');
    expect(html).toContain('Atlas fixture §2');
    expect(html).toContain('https://example.org/test');
    expect(html).not.toContain('Alvos');
  });
  it('renders only recorded Poomsae numbering and links the recorded technique and source',async()=>{
    const {PoomsaeSequence} = await import('../src/components/PoomsaeApp');
    const html = renderToStaticMarkup(createElement(PoomsaeSequence,{form,steps:[step]}));
    expect(html).toContain('value="3"');
    expect(html).toContain('/tecnica?slug=technique-fixture');
    expect(html).toContain('https://example.org/test');
    expect(html).toContain('Fixture §1');
    expect(html).toContain('Instrução de teste.');
    expect(html).not.toContain('value="1"');
  });

  it('keeps an empty published Poomsae sequence navigable without inventing steps',async()=>{
    const {PoomsaeSequence} = await import('../src/components/PoomsaeApp');
    const html = renderToStaticMarkup(createElement(PoomsaeSequence,{form,steps:[]}));
    expect(html).toContain('/tecnica?slug=form-fixture');
    expect(html).toContain('Nenhum movimento publicado');
    expect(html).not.toContain('<ol');
  });

  it('never renders an executable source link and preserves its document label',async()=>{
    const {default:KnowledgeReferences} = await import('../src/components/KnowledgeReferences');
    const html = renderToStaticMarkup(createElement(KnowledgeReferences,{sources:[{...evidence,content_sources:{...evidence.content_sources,official_url:'javascript:alert(1)'}}]}));
    expect(html).toContain('Documento de teste');
    expect(html).not.toContain('href=');
  });
});
