import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TechnicalTerm, TermSource } from '../src/lib/catalog-api';
import type { GlossaryData } from '../src/lib/glossary';

// Synthetic records are deliberately kept in tests; no fixture is a publication.
const source: TermSource = {source_locator:'Test §1',checked_at:'2026-11-06T00:00:00Z',content_sources:{institution:'Fixture',title:'Test document',edition:'Test',publication_year:2026,official_url:'https://example.org/reference'}};
const term: TechnicalTerm = {id:'test-a',slug:'test-a',category:'fixture',romanization:'Test A',hangul:null,translation_pt:'Resposta A',pronunciation_pt:null,definition_pt:'Contexto da fixture.',publication_status:'published',record_kind:'technique'};
const detail = (changes: Partial<TechnicalTerm> = {}, sources = [source]) => ({term:{...term,...changes},sources,media:[],regions:[],relations:[]});
const review = {status:'approved' as const,translationBy:'Fixture',technicalBy:'Fixture',approvedBy:'Fixture',approvedAt:'2026-11-06'};
const glossary: GlossaryData = {version:1,words:[{id:'word-a',romanization:'Word',hangul:'가',meaning_pt:'Palavra',context_pt:'Fixture',kind:'action',aliases:[],pronunciation_pt:null,sources:[{institution:'Fixture',title:'Document',edition:'Test',url:'https://example.org/reference',locator:'§1',checkedAt:'2026-11-06'}],review}],expressions:[{id:'expression-a',romanization:'Word A',hangul:'가',translation_pt:'Resposta A',context_pt:'Fixture',technicalSlug:'test-a',segments:[{wordId:'word-a',romanization:'Word',hangul:'가'}],sources:[{institution:'Fixture',title:'Document',edition:'Test',url:'https://example.org/reference',locator:'§1',checkedAt:'2026-11-06'}],review}]};

afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();});

describe('derived public knowledge',()=>{
  it('treats malformed evidence as ineligible rather than crashing a learning session',async()=>{
    const {hasCheckedSource} = await import('../src/lib/published-knowledge');
    expect(hasCheckedSource({source_locator:{},checked_at:'2026-11-06',content_sources:source.content_sources} as unknown as TermSource)).toBe(false);
    expect(hasCheckedSource({...source,content_sources:{...source.content_sources!,title:{}}} as unknown as TermSource)).toBe(false);
  });
  it('derives flashcards only from published terms with checked, usable documentary evidence',async()=>{
    const {buildLearningDeck} = await import('../src/lib/published-knowledge');
    const cards = buildLearningDeck([detail(),detail({id:'draft',slug:'draft',publication_status:'draft'}),detail({id:'unchecked',slug:'unchecked'},[{...source,checked_at:null}]),detail({id:'missing',slug:'missing'},[]),detail({id:'unsafe',slug:'unsafe'},[{...source,content_sources:{...source.content_sources!,official_url:'javascript:alert(1)'}}])],glossary);
    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({id:'term:test-a',prompt:'Test A',answer:'Resposta A',href:'/tecnica?slug=test-a',glossaryExpressionIds:['expression-a']});
    expect(cards[0].sources[0].source_locator).toBe('Test §1');
  });

  it('crosslinks only explicit approved expression mappings, never name similarity or draft glossary',async()=>{
    const {glossaryLinksForTerm} = await import('../src/lib/published-knowledge');
    const data = structuredClone(glossary);
    data.expressions.push({...data.expressions[0],id:'similar-name',technicalSlug:null});
    data.expressions.push({...data.expressions[0],id:'draft-expression',review:{...review,status:'draft'}});
    expect(glossaryLinksForTerm('test-a',data)).toMatchObject({expressions:[{id:'expression-a'}],words:[{id:'word-a'}]});
    expect(glossaryLinksForTerm('expression-a',data)).toEqual({expressions:[],words:[]});
  });

  it('builds quiz alternatives from distinct published answers and leaves insufficient decks empty',async()=>{
    const {buildLearningDeck,buildTranslationQuiz} = await import('../src/lib/published-knowledge');
    expect(buildTranslationQuiz(buildLearningDeck([detail()],glossary))).toEqual([]);
    const cards = buildLearningDeck([detail(),detail({id:'test-b',slug:'test-b',romanization:'Test B',translation_pt:'Resposta B'}),detail({id:'test-c',slug:'test-c',romanization:'Test C',translation_pt:'Resposta A'})],glossary);
    const questions = buildTranslationQuiz(cards);
    expect(questions[0]).toMatchObject({cardId:'term:test-a',answer:'Resposta A'});
    expect(questions[0].choices).toEqual(['Resposta A','Resposta B']);
  });
});

describe('optional public Poomsae schema',()=>{
  it('does not query an unapplied schema while the feature is disabled',async()=>{
    vi.stubEnv('PUBLIC_KNOWLEDGE_SCHEMA','false');
    vi.stubGlobal('fetch',()=>{throw new Error('Unexpected network request');});
    const {fetchPublishedPoomsae,fetchPoomsaeSteps} = await import('../src/lib/poomsae');
    expect(await fetchPublishedPoomsae()).toEqual([]);
    expect(await fetchPoomsaeSteps('test-a')).toEqual([]);
  });

  it('rejects draft, unchecked and malformed sequence rows returned by the API',async()=>{
    vi.stubEnv('PUBLIC_KNOWLEDGE_SCHEMA','true');
    vi.stubEnv('PUBLIC_SUPABASE_URL','https://example.supabase.co');
    vi.stubEnv('PUBLIC_SUPABASE_PUBLISHABLE_KEY','sb_publishable_test');
    const {fetchPublishedPoomsae,fetchPoomsaeSteps} = await import('../src/lib/poomsae');
    vi.stubGlobal('fetch',async()=>Response.json([{term_id:'test-a',sequence_version:'1',publication_status:'draft',checked_at:'2026-11-06',approved_at:'2026-11-06',source_locator:'§1',content_sources:source.content_sources,technical_terms:{...term,record_kind:'poomsae'}}]));
    await expect(fetchPublishedPoomsae()).rejects.toThrow(/inválida/i);
    vi.stubGlobal('fetch',async()=>Response.json([{id:'step',poomsae_term_id:'test-a',step_number:0,instruction_pt:null,publication_status:'published',checked_at:null,approved_at:'2026-11-06',source_locator:'§1',content_sources:source.content_sources,technical_terms:term}]));
    await expect(fetchPoomsaeSteps('test-a')).rejects.toThrow(/inválida/i);
  });
});
