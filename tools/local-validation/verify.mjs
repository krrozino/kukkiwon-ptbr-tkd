import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {createRequire} from 'node:module';
import {startLocalRuntime,command,root} from './runtime.mjs';

const require=createRequire(new URL('../../package.json',import.meta.url));
const runtime=await startLocalRuntime(),results=[];
async function check(name,fn) {await fn();results.push(name);process.stdout.write('OK '+name+'\n');}
const c=runtime.client;
const token=role=>{
  const data=[{alg:'HS256',typ:'JWT'},{role,exp:Math.floor(Date.now()/1000)+3600}].map(v=>Buffer.from(JSON.stringify(v)).toString('base64url')).join('.');
  return data+'.'+createHmac('sha256',runtime.secret).update(data).digest('base64url');
};
const api=async(path,body,role='anon')=>{
  const response=await fetch(runtime.apiUrl+path,{method:body===undefined?'GET':'POST',headers:{
    Accept:'application/json','Content-Type':'application/json',Authorization:'Bearer '+token(role),
  },...(body===undefined?{}:{body:JSON.stringify(body)})});
  const data=await response.json();if(!response.ok)throw new Error('API local '+response.status+': '+JSON.stringify(data));return data;
};
const search=(query='',offset=0,extra={})=>api('/rpc/search_catalog',{search_query:query,category_filter:null,region_filter:null,family_filter:null,page_size:100,page_offset:offset,...extra});
try {
  await check('migração sobre legado + importação idempotente: 105 rascunhos',async()=>{
    const {rows:[r]}=await c.query("select count(*)::int total,count(*) filter(where publication_status='published')::int published from public.technical_terms");
    assert.deepEqual(r,{total:105,published:0});
    assert.equal((await c.query('select count(*)::int n from public.body_regions')).rows[0].n,21);
    assert.equal((await c.query('select count(*)::int n from public.term_relations')).rows[0].n,4);
  });
  await runtime.startApi();
  await check('REST anon/authenticated: rascunhos invisíveis',async()=>{
    for(const role of ['anon','authenticated']) {
      for(const table of ['technical_terms','term_sources','content_sources','term_aliases','body_regions','body_region_terms','term_media','term_relations']) {
        assert.deepEqual(await api('/'+table+'?select=*',undefined,role),[]);
        const write=await fetch(runtime.apiUrl+'/'+table,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token(role)},body:'{}'});
        assert.ok([401,403].includes(write.status),role+' não deve escrever em '+table);
      }
      const response=await fetch(runtime.apiUrl+'/technical_terms',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token(role)},body:JSON.stringify({slug:'forbidden',category:'x',romanization:'x'})});
      assert.ok([401,403].includes(response.status));
    }
    assert.deepEqual(await search(),{items:[],total:0});
  });
  // Somente fixtures sintéticas locais. Nenhum dos 105 registros reais muda de estado.
  await c.query("insert into public.content_sources(institution,title,edition,official_url) values('QA local','Fixture de integração','teste','https://example.org/qa');");
  await c.query(`insert into public.technical_terms(slug,category,romanization,hangul,translation_pt,definition_pt,editorial_status)
    select 'qa-term-'||lpad(n::text,4,'0'),'qa-chute',case when n=1 then 'QA Ap-chagi' else 'QA Técnica '||lpad(n::text,4,'0') end,
    case when n=1 then '앞차기' else '테스트' end,'Teste: chute à frente','Fixture sintética de integração local.','technical_reviewed'
    from generate_series(1,1005) n;
    insert into public.technical_terms(slug,category,romanization,record_kind,editorial_status)
    values('qa-family','qa-familia','QA Família','family','technical_reviewed');
    insert into public.term_sources(term_id,source_id,source_locator,checked_at)
    select t.id,s.id,'QA > Fixture',now() from public.technical_terms t cross join public.content_sources s
    where t.slug like 'qa-%' and s.institution='QA local';
    update public.technical_terms set publication_status='published',published_at=now() where slug like 'qa-%';
    insert into public.term_aliases(term_id,alias,alias_kind) select id,'Bênção QA','search' from public.technical_terms where slug='qa-term-0001';
    insert into public.body_regions(slug,region_group,name_pt,publication_status,detail_view,detail_x,detail_y)
    values('qa-foot','feet','QA região do pé','published','front',50,28);
    insert into public.body_region_terms(region_id,term_id,usage_context,anatomical_role)
    select r.id,t.id,'surface','surface' from public.body_regions r cross join public.technical_terms t where r.slug='qa-foot' and t.slug='qa-term-0001';
    insert into public.term_relations(term_id,related_term_id,relation_kind,source_id,source_locator,publication_status,checked_at)
    select t.id,parent.id,'variant_of',s.id,'QA > Fixture','published',now() from public.technical_terms t
    cross join public.technical_terms parent cross join public.content_sources s
    where t.slug='qa-term-0001' and parent.slug='qa-family' and s.institution='QA local';`);
  await check('REST busca normalizada + filtros + paginação acima de 1000',async()=>{
    for(const query of ['apchagi','앞차기','앞차기'.normalize('NFD'),'bencao']) {
      assert.deepEqual((await search(query)).items.map(t=>t.slug),['qa-term-0001']);
    }
    assert.equal((await search()).total,1006);
    assert.equal((await search('',1000)).items.length,6);
    assert.equal((await search('',0,{region_filter:'qa-foot'})).total,1);
    assert.equal((await search('',0,{family_filter:'qa-family'})).total,1);
    assert.equal((await search('',0,{category_filter:'qa-chute'})).total,1005);
    assert.equal((await search('%')).total,0);
  });
  await check('REST atlas/ficha: joins, fontes, relações e filtros reais',async()=>{
    const regions=await api('/body_regions?atlas_area=eq.feet&select=id,slug,name_pt');
    assert.deepEqual(regions.map(r=>r.slug),['qa-foot']);
    const links=await api('/body_region_terms?region_id=eq.'+regions[0].id+'&select=usage_context,technical_terms(slug,romanization)');
    assert.equal(links[0].technical_terms.slug,'qa-term-0001');
    const terms=await api('/technical_terms?slug=eq.qa-term-0001&select=id,slug,term_aliases(alias)');
    const sources=await api('/term_sources?term_id=eq.'+terms[0].id+'&select=source_locator,content_sources(title,official_url)');
    assert.equal(sources[0].content_sources.title,'Fixture de integração');
    assert.equal((await api('/rpc/catalog_facets',{})).families[0].slug,'qa-family');
  });
  await check('última fonte conferida: remoção bloqueada no servidor PostgreSQL',async()=>{
    await c.query('begin');
    try {
      await c.query("delete from public.term_sources where term_id=(select id from public.technical_terms where slug='qa-term-0001')");
      await assert.rejects(c.query('set constraints all immediate'),/fonte conferida/);
    } finally {await c.query('rollback');}
  });
  await check('atlas real desktop/mobile via PostgREST local',async()=>{
    await command(process.execPath,[require.resolve('@playwright/test/cli'),'test','--config=playwright.integration.config.ts'],{
      stdio:'inherit',env:{...process.env,KUKKIWON_LOCAL_API_URL:runtime.apiUrl},
    });
  });
  await check('105 registros de pesquisa permanecem rascunhos após toda a validação',async()=>{
    const r=(await c.query("select count(*)::int n from public.technical_terms where slug not like 'qa-%' and publication_status='draft'")).rows[0];
    assert.equal(r.n,105);
  });
  const report={status:'passed',postgres:runtime.version,postgrest:runtime.postgrestVersion,checks:results,realDrafts:105,remoteWrites:0};
  writeFileSync(join(root,'.local-validation','latest.json'),JSON.stringify(report,null,2));
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
} finally {await runtime.stop();}
