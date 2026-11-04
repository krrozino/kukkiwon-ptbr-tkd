import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { fetchCatalogPage, fetchRegions, fetchTermDetails, createCatalogClient } from '../src/lib/catalog-api';
beforeEach(() => {
  vi.stubEnv('PUBLIC_SUPABASE_URL','https://acbostnsohltuaegfkwl.supabase.co');
  vi.stubEnv('PUBLIC_SUPABASE_PUBLISHABLE_KEY','sb_publishable_test');
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
it('envia busca e filtros com paginação ao servidor e preserva o total', async () => {
  let request: Request | undefined;
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    request = new Request(url, init);
    return Response.json({items:[],total:1205});
  });
  const result = await fetchCatalogPage({query:'앞차기',category:'chute',region:'apchuk',family:'chagi',page:22,pageSize:24});
  expect(result).toEqual({items:[],total:1205});
  expect(request!.url).toBe('https://acbostnsohltuaegfkwl.supabase.co/rest/v1/rpc/search_catalog');
  expect(await request!.json()).toEqual({search_query:'앞차기',category_filter:'chute',region_filter:'apchuk',family_filter:'chagi',page_size:24,page_offset:504});
});
it('propaga cancelamento e não transforma erro em catálogo vazio', async () => {
  const controller = new AbortController(); controller.abort();
  vi.stubGlobal('fetch', (_url: string, init: RequestInit) => {
    expect(init.signal).toBe(controller.signal);
    return Promise.reject(new DOMException('aborted','AbortError'));
  });
  await expect(fetchCatalogPage({},controller.signal)).rejects.toMatchObject({name:'AbortError'});
  vi.stubGlobal('fetch', async () => new Response('',{status:503}));
  await expect(fetchCatalogPage({})).rejects.toThrow(/503/);
});
it('rejeita resposta malformada, paginação inválida e configuração secreta', async () => {
  vi.stubGlobal('fetch', async () => Response.json({items:'bad',total:2}));
  await expect(fetchCatalogPage({})).rejects.toThrow(/resposta/i);
  await expect(fetchCatalogPage({page:-1})).rejects.toThrow(/página/i);
  expect(() => createCatalogClient({url:'http://evil.test',key:'sb_secret_x'})).toThrow();
});
it('não devolve rascunhos mesmo se a API responder dados indevidos', async () => {
  vi.stubGlobal('fetch', async () => Response.json({items:[{slug:'private',publication_status:'draft'}],total:1}));
  await expect(fetchCatalogPage({})).rejects.toThrow(/resposta/i);
});
it('busca regiões com limite explícito e resolve somente ficha publicada', async () => {
  vi.stubGlobal('fetch', async (url: string) => {
    const u = new URL(url);
    if(u.pathname.endsWith('body_regions')) {
      expect(u.searchParams.get('atlas_area')).toBe('eq.feet');
      return Response.json([]);
    }
    return Response.json([]);
  });
  expect(await fetchRegions('feet')).toEqual([]);
  expect(await fetchTermDetails('ap-chagi')).toBeNull();
});
