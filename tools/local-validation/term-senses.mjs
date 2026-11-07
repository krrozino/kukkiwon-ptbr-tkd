import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { startLocalRuntime, root } from './runtime.mjs';
import { termFixture, senseFixture, claimFixture, asReviewer, publish, outsider } from '../../tests/helpers/term-senses-db.mjs';

// Uses only a new loopback PostgreSQL cluster and existing local binaries.
// No database URL argument, remote credentials, hosted SQL or Docker.
const runtime = await startLocalRuntime();
const db = { query:(sql,args)=>runtime.client.query(sql,args), exec:sql=>runtime.client.query(sql) };
const checks = [];
const token = (role, sub) => {
  const data = [{alg:'HS256',typ:'JWT'},{role,...(sub?{sub}:{}),exp:Math.floor(Date.now()/1000)+3600}]
    .map(value=>Buffer.from(JSON.stringify(value)).toString('base64url')).join('.');
  return data+'.'+createHmac('sha256',runtime.secret).update(data).digest('base64url');
};
async function request(table, params, role='anon', method='GET', body) {
  const response = await fetch(runtime.apiUrl+'/'+table+'?'+new URLSearchParams(params),{
    method,headers:{Authorization:'Bearer '+token(role,role==='authenticated'?outsider:undefined),
      'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});
  return {status:response.status,data:await response.json()};
}
async function rows(table,params,role) {
  const result=await request(table,params,role);
  assert.equal(result.status,200,JSON.stringify(result.data));
  return result.data;
}
function passed(message) { checks.push(message); process.stdout.write('PASS '+message+'\n'); }

try {
  assert.deepEqual(runtime.catalogAfterSemantics,runtime.catalogBeforeKnowledge);
  assert.equal(runtime.catalogAfterSemantics.technical_terms.length,108);
  passed('SQL aditivo preserva as oito tabelas e os 108 rascunhos');
  await db.exec(readFileSync(join(root,'supabase/tests/term_senses_authorization.sql'),'utf8'));
  passed('smoke SQL negativo em PostgreSQL real local');
  await runtime.startApi();
  await db.exec('begin;');
  const term=await termFixture(db,'qa-sense-term',true);
  const sense=await senseFixture(db,term);
  const a=await claimFixture(db,term,'romanization','Grafia A',sense.id);
  const b=await claimFixture(db,term,'romanization','Grafia B',sense.id);
  await db.exec('commit;');
  for(const role of ['anon','authenticated']) {
    assert.deepEqual(await rows('term_senses',{select:'id,meaning',term_id:'eq.'+term},role),[]);
    assert.deepEqual(await rows('term_field_claims',{select:'id,value',term_id:'eq.'+term},role),[]);
  }
  passed('PostgREST/JWT anon e authenticated ocultam pesquisa/draft');
  await db.exec('begin;'); await asReviewer(db);
  await publish(db,'term_senses',sense.id);
  await publish(db,'term_field_claims',a.id); await publish(db,'term_field_claims',b.id);
  await db.exec('commit;');
  for(const role of ['anon','authenticated']) {
    const result=await rows('term_senses',{select:'id,meaning,source_locator,source_snapshot',term_id:'eq.'+term},role);
    assert.equal(result.length,1);
    assert.equal(result[0].source_locator,'§2 > entrada individual');
    assert.equal(result[0].source_snapshot.title,'Documento de teste');
    assert.deepEqual((await rows('term_field_claims',{select:'value',term_id:'eq.'+term,order:'value.asc'},role)),[{value:'Grafia A'},{value:'Grafia B'}]);
    for(const column of ['approved_by','evidence_id']) {
      for(const table of ['term_senses','term_field_claims'])
        assert.ok([401,403].includes((await request(table,{select:column},role)).status));
    }
    for(const table of ['term_senses','term_field_claims'])
      assert.ok([401,403].includes((await request(table,{},role,'POST',{})).status));
    assert.deepEqual(await rows('content_sources',{select:'id',id:'eq.'+sense.source},role),[]);
  }
  passed('PostgREST mostra variantes/publicação individual e citação sem expor pesquisa, assinatura ou escrita');
  await db.exec('begin;');
  await db.query(`update public.term_senses set publication_status='draft',editorial_status='research' where id=$1`,[sense.id]);
  await db.exec('commit;');
  for(const role of ['anon','authenticated']) {
    assert.deepEqual(await rows('term_senses',{select:'id',term_id:'eq.'+term},role),[]);
    assert.deepEqual(await rows('term_field_claims',{select:'id',term_id:'eq.'+term},role),[]);
  }
  passed('revogação do sentido oculta afirmações em novas requisições HTTP');
  const result={status:'PASS',postgres:runtime.version,postgrest:runtime.postgrestVersion,checks,
    scope:'PostgreSQL/PostgREST local; Supabase Auth e ambiente hospedado não homologados'};
  writeFileSync(join(root,'.local-validation','term-senses-latest.json'),JSON.stringify(result,null,2)+'\n');
} finally { await runtime.stop(); }
