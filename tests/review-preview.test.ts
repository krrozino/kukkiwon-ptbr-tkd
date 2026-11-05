import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fetchCatalogPage, fetchCatalogFacets, fetchRegions, fetchRegion, fetchRegionTerms,
  fetchTermDetails, isCatalogConfigured, isReviewMode } from '../src/lib/catalog-api';

beforeEach(() => {
  vi.stubEnv('PUBLIC_REVIEW_MODE','1');
  vi.stubEnv('PUBLIC_SUPABASE_URL','');
  vi.stubEnv('PUBLIC_SUPABASE_PUBLISHABLE_KEY','');
  vi.stubGlobal('fetch',() => {throw new Error('Modo de revisão não pode acessar a rede.');});
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

it('lista os 105 rascunhos sem consultar a API ou apresentá-los como publicados',async()=>{
  expect(isReviewMode()).toBe(true);
  expect(isCatalogConfigured()).toBe(true);
  const first=await fetchCatalogPage({page:1,pageSize:24});
  const last=await fetchCatalogPage({page:5,pageSize:24});
  expect(first.total).toBe(105);
  expect(first.items).toHaveLength(24);
  expect(last.items).toHaveLength(9);
  expect([...first.items,...last.items].every(item=>item.publication_status==='draft')).toBe(true);
});

it('busca Hangul, romanização e tradução provisória diretamente nos registros',async()=>{
  for (const text of ['앞차기','Ap-chagi','chute frontal']) {
    const response=await fetchCatalogPage({query:text});
    expect(response.items.some(item=>item.slug==='ap-chagi')).toBe(true);
  }
  expect((await fetchCatalogPage({query:'esta-tecnica-nao-existe'})).total).toBe(0);
});

it('apresenta facetas, regiões, vínculo anatômico e ficha com fonte original',async()=>{
  const facets=await fetchCatalogFacets();
  expect(facets.regions).toHaveLength(21);
  const feet=await fetchRegions('feet');
  expect(feet.length).toBeGreaterThan(0);
  const apchuk=await fetchRegion('apchuk');
  expect(apchuk?.atlas_area).toBe('feet');
  const links=await fetchRegionTerms('apchuk');
  expect(links.some(link=>link.technical_terms?.slug==='apchuk')).toBe(true);
  const detail=await fetchTermDetails('ap-chagi');
  expect(detail?.term.publication_status).toBe('draft');
  expect(detail?.sources[0].content_sources?.official_url).toMatch(/^https:\/\/research\.kukkiwon\.or\.kr/);
  expect(detail?.sources[0].source_locator).toContain('Ap-chagi');
  expect(await fetchTermDetails('nao-existe')).toBeNull();
});

it('filtra variantes por família e mantém metadados de revisão separados',async()=>{
  const result=await fetchCatalogPage({family:'dollyeo-chigi'});
  expect(result.items.some(item=>item.slug==='palgup-dollyeo-chigi')).toBe(true);
  const detail=await fetchTermDetails('palgup-dollyeo-chigi');
  expect(detail?.relations[0]?.technical_terms?.slug).toBe('dollyeo-chigi');
  expect(detail?.term.publication_status).toBe('draft');
});
