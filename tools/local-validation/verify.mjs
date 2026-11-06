import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { startLocalRuntime, command, root } from "./runtime.mjs";

const require = createRequire(new URL("../../package.json", import.meta.url));
const runtime = await startLocalRuntime(),
  results = [];
async function check(name, fn) {
  await fn();
  results.push(name);
  process.stdout.write("OK " + name + "\n");
}
const c = runtime.client;
const token = (role) => {
  const data = [
    { alg: "HS256", typ: "JWT" },
    { role, exp: Math.floor(Date.now() / 1000) + 3600 },
  ]
    .map((v) => Buffer.from(JSON.stringify(v)).toString("base64url"))
    .join(".");
  return (
    data +
    "." +
    createHmac("sha256", runtime.secret).update(data).digest("base64url")
  );
};
const api = async (path, body, role = "anon") => {
  const response = await fetch(runtime.apiUrl + path, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token(role),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      "API local " + response.status + ": " + JSON.stringify(data),
    );
  return data;
};
const search = (query = "", offset = 0, extra = {}) =>
  api("/rpc/search_catalog", {
    search_query: query,
    category_filter: null,
    region_filter: null,
    family_filter: null,
    page_size: 100,
    page_offset: offset,
    ...extra,
  });
try {
  await check(
    "migração sobre legado + importação idempotente: 108 rascunhos",
    async () => {
      const {
        rows: [r],
      } = await c.query(
        "select count(*)::int total,count(*) filter(where publication_status='published')::int published from public.technical_terms",
      );
      assert.deepEqual(r, { total: 108, published: 0 });
      assert.equal(
        (await c.query("select count(*)::int n from public.body_regions"))
          .rows[0].n,
        21,
      );
      assert.equal(
        (await c.query("select count(*)::int n from public.term_relations"))
          .rows[0].n,
        7,
      );
    },
  );
  await check('PostgreSQL real: migração de conhecimento aplicada sem reescrever os 108 rascunhos',async()=>{
    const {rows:[tables]}=await c.query("select to_regclass('public.poomsae_forms')::text forms,to_regclass('public.poomsae_steps')::text steps,to_regclass('knowledge_research.candidates')::text candidates");
    assert.deepEqual(tables,{forms:'poomsae_forms',steps:'poomsae_steps',candidates:'knowledge_research.candidates'});
    assert.ok(runtime.catalogBeforeKnowledge);
    assert.deepEqual(runtime.catalogAfterKnowledge,runtime.catalogBeforeKnowledge);
  });
  await runtime.startApi();
  await check("REST anon/authenticated: rascunhos invisíveis", async () => {
    for (const role of ["anon", "authenticated"]) {
      for (const table of [
        "technical_terms",
        "term_sources",
        "content_sources",
        "term_aliases",
        "body_regions",
        "body_region_terms",
        "term_media",
        "term_relations",
      ]) {
        assert.deepEqual(
          await api("/" + table + "?select=*", undefined, role),
          [],
        );
        const write = await fetch(runtime.apiUrl + "/" + table, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token(role),
          },
          body: "{}",
        });
        assert.ok(
          [401, 403].includes(write.status),
          role + " não deve escrever em " + table,
        );
      }
      const response = await fetch(runtime.apiUrl + "/technical_terms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token(role),
        },
        body: JSON.stringify({
          slug: "forbidden",
          category: "x",
          romanization: "x",
        }),
      });
      assert.ok([401, 403].includes(response.status));
    }
    assert.deepEqual(await search(), { items: [], total: 0 });
  });
  // Somente fixtures sintéticas locais. Nenhum dos 108 registros reais muda de estado.
  await c.query(
    "insert into public.content_sources(institution,title,edition,official_url) values('QA local','Fixture de integração','teste','https://example.org/qa');",
  );
  await c.query("insert into public.content_sources(institution,title,official_url) values('QA relação','Fixture exclusiva de relação','https://example.org/qa-relation'),('QA atlas','Fixture exclusiva do atlas','https://example.org/qa-atlas')");
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
    insert into public.body_region_terms(region_id,term_id,usage_context,anatomical_role,source_id,source_locator)
    select r.id,t.id,'surface','surface',s.id,'QA > Atlas' from public.body_regions r cross join public.technical_terms t cross join public.content_sources s where r.slug='qa-foot' and t.slug='qa-term-0001' and s.institution='QA atlas';
    insert into public.term_relations(term_id,related_term_id,relation_kind,source_id,source_locator,publication_status,checked_at)
    select t.id,parent.id,'variant_of',s.id,'QA > Fixture','published',now() from public.technical_terms t
    cross join public.technical_terms parent cross join public.content_sources s
    where t.slug='qa-term-0001' and parent.slug='qa-family' and s.institution='QA relação';`);
  await check(
    "REST busca normalizada + filtros + paginação acima de 1000",
    async () => {
      for (const query of [
        "apchagi",
        "앞차기",
        "앞차기".normalize("NFD"),
        "bencao",
      ]) {
        assert.deepEqual(
          (await search(query)).items.map((t) => t.slug),
          ["qa-term-0001"],
        );
      }
      assert.equal((await search()).total, 1006);
      assert.equal((await search("", 1000)).items.length, 6);
      assert.equal(
        (await search("", 0, { region_filter: "qa-foot" })).total,
        1,
      );
      assert.equal(
        (await search("", 0, { family_filter: "qa-family" })).total,
        1,
      );
      assert.equal(
        (await search("", 0, { category_filter: "qa-chute" })).total,
        1005,
      );
      assert.equal((await search("%")).total, 0);
    },
  );
  await check('REST real: pesquisa privada e identidade de revisão não são projeções públicas',async()=>{
    for(const role of ['anon','authenticated']) {
      assert.deepEqual(await api('/poomsae_forms?select=term_id,sequence_version',undefined,role),[]);
      assert.deepEqual(await api('/poomsae_steps?select=id,step_number',undefined,role),[]);
      for(const path of ['/import_batches?select=*','/candidates?select=*','/poomsae_forms?select=approved_by','/poomsae_steps?select=approved_by']) {
        const response=await fetch(runtime.apiUrl+path,{headers:{Authorization:'Bearer '+token(role)}});
        assert.ok([401,403,404].includes(response.status),role+' não deve ler '+path);
      }
      for(const table of ['poomsae_forms','poomsae_steps']) {
        const response=await fetch(runtime.apiUrl+'/'+table,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token(role)},body:'{}'});
        assert.ok([401,403].includes(response.status),role+' não deve escrever '+table);
      }
    }
  });
  await check(
    "REST atlas/ficha: joins, fontes, relações e filtros reais",
    async () => {
      const regions = await api(
        "/body_regions?atlas_area=eq.feet&select=id,slug,name_pt",
      );
      assert.deepEqual(
        regions.map((r) => r.slug),
        ["qa-foot"],
      );
      const links = await api(
        "/body_region_terms?region_id=eq." +
          regions[0].id +
          "&select=usage_context,anatomical_role,source_locator,content_sources(institution,title,edition,publication_year,official_url),technical_terms(slug,romanization,translation_pt,publication_status,record_kind)",
      );
      assert.equal(links[0].technical_terms.slug, "qa-term-0001");
      assert.equal(links[0].content_sources.title,'Fixture exclusiva do atlas');
      assert.equal(links[0].source_locator,'QA > Atlas');
      const terms = await api(
        "/technical_terms?slug=eq.qa-term-0001&select=id,slug,term_aliases(alias)",
      );
      const sources = await api(
        "/term_sources?term_id=eq." +
          terms[0].id +
          "&select=source_locator,content_sources(title,official_url)",
      );
      assert.equal(sources[0].content_sources.title, "Fixture de integração");
      const relations=await api('/term_relations?term_id=eq.'+terms[0].id+'&select=relation_kind,source_locator,checked_at,content_sources(institution,title,edition,publication_year,official_url),technical_terms!term_relations_related_term_id_fkey(slug,romanization,publication_status)');
      assert.equal(relations[0].content_sources.title,'Fixture exclusiva de relação');
      assert.equal(relations[0].technical_terms.slug,'qa-family');
      assert.equal(
        (await api("/rpc/catalog_facets", {})).families[0].slug,
        "qa-family",
      );
    },
  );
  await check(
    "última fonte conferida: remoção bloqueada no servidor PostgreSQL",
    async () => {
      await c.query("begin");
      try {
        await c.query(
          "delete from public.term_sources where term_id=(select id from public.technical_terms where slug='qa-term-0001')",
        );
        await assert.rejects(
          c.query("set constraints all immediate"),
          /fonte conferida/,
        );
      } finally {
        await c.query("rollback");
      }
    },
  );
  await check("atlas real desktop/mobile via PostgREST local", async () => {
    const appPort=Number(process.env.KUKKIWON_INTEGRATION_PORT||'4347');
    assert.ok(Number.isSafeInteger(appPort)&&appPort>=1024&&appPort<=65535,'Porta local de integração inválida');
    const config=join(runtime.runDir,'playwright.config.ts');
    writeFileSync(config,`import {defineConfig} from '@playwright/test';
import base from ${JSON.stringify(join(root,'playwright.integration.config.ts'))};
export default defineConfig({...base,testDir:${JSON.stringify(join(root,'tests/integration'))},outputDir:${JSON.stringify(join(runtime.runDir,'browser-results'))},
use:{...base.use,baseURL:'http://127.0.0.1:${appPort}'},webServer:{...base.webServer,
command:'npm run dev -- --host 127.0.0.1 --port ${appPort}',cwd:${JSON.stringify(root)},url:'http://127.0.0.1:${appPort}',
env:{...base.webServer.env,PUBLIC_CONTENT_REVIEW:'false',PUBLIC_GLOSSARY_REVIEW:'false',PUBLIC_KNOWLEDGE_SCHEMA:'true'}}});\n`);
    await command(
      process.execPath,
      [
        require.resolve("@playwright/test/cli"),
        "test",
        "--config="+config,
      ],
      {
        stdio: "inherit",
        env: { ...process.env, KUKKIWON_LOCAL_API_URL: runtime.apiUrl },
      },
    );
  });
  await check('REST real de Poomsae: rascunhos ocultos, revisão exigida e projeções aninhadas com fontes',async()=>{
    const {rows:[form]}=await c.query(`insert into public.technical_terms(slug,category,romanization,translation_pt,record_kind,editorial_status)
      values('qa-poomsae','qa-forma','QA Forma','Forma sintética local','poomsae','technical_reviewed') returning id`);
    const {rows:[source]}=await c.query("insert into public.content_sources(institution,title,official_url) values('QA local','Fonte exclusiva da forma','https://example.org/qa-form') returning id");
    const {rows:[stepSource]}=await c.query("insert into public.content_sources(institution,title,official_url) values('QA local','Fonte exclusiva do movimento','https://example.org/qa-step') returning id");
    await c.query(`insert into public.term_sources(term_id,source_id,source_locator,checked_at)
      select $1,id,'QA > Registro canônico',now() from public.content_sources where title='Fixture de integração'`,[form.id]);
    await c.query("update public.technical_terms set publication_status='published',published_at=now() where id=$1",[form.id]);
    await c.query("insert into public.poomsae_forms(term_id,sequence_version,source_id,source_locator) values($1,'qa-v1',$2,'QA > Forma')",[form.id,source.id]);
    await c.query(`insert into public.poomsae_steps(poomsae_term_id,step_number,technique_term_id,instruction_pt,source_id,source_locator)
      select $1,3,id,'Movimento sintético de teste',$2,'QA > Movimento 3' from public.technical_terms where slug='qa-term-0001'`,[form.id,stepSource.id]);
    const formsPath='/poomsae_forms?publication_status=eq.published&select=term_id,sequence_version,source_locator,checked_at,approved_at,publication_status,content_sources(institution,title,edition,publication_year,official_url),technical_terms!poomsae_forms_term_id_fkey(id,slug,category,romanization,hangul,translation_pt,pronunciation_pt,definition_pt,publication_status,record_kind)';
    const stepsPath='/poomsae_steps?publication_status=eq.published&poomsae_term_id=eq.'+form.id+'&order=step_number.asc,id.asc&select=id,poomsae_term_id,step_number,instruction_pt,source_locator,checked_at,approved_at,publication_status,content_sources(institution,title,edition,publication_year,official_url),technical_terms!poomsae_steps_technique_term_id_fkey(id,slug,category,romanization,hangul,translation_pt,pronunciation_pt,definition_pt,publication_status,record_kind)';
    for(const role of ['anon','authenticated']) {
      assert.deepEqual(await api(formsPath,undefined,role),[]);
      assert.deepEqual(await api(stepsPath,undefined,role),[]);
      assert.deepEqual(await api('/content_sources?id=eq.'+source.id+'&select=title',undefined,role),[]);
    }
    await assert.rejects(c.query("update public.poomsae_forms set publication_status='published',checked_at=now() where term_id=$1",[form.id]),/identidade autenticada/);
    const reviewer='a1000000-0000-4000-8000-000000000001';
    await c.query('insert into auth.users(id) values($1)',[reviewer]);
    await c.query('insert into knowledge_research.human_reviewers(user_id) values($1)',[reviewer]);
    await c.query("select set_config('request.jwt.claim.sub',$1,false)",[reviewer]);
    try {
      await c.query("update public.poomsae_forms set publication_status='published',checked_at=now() where term_id=$1",[form.id]);
      await c.query("update public.poomsae_steps set publication_status='published',checked_at=now() where poomsae_term_id=$1",[form.id]);
    } finally {await c.query("select set_config('request.jwt.claim.sub','',false)");}
    for(const role of ['anon','authenticated']) {
      const forms=await api(formsPath,undefined,role),steps=await api(stepsPath,undefined,role);
      assert.equal(forms.length,1);assert.equal(forms[0].technical_terms.slug,'qa-poomsae');
      assert.equal(forms[0].content_sources.title,'Fonte exclusiva da forma');
      assert.ok(forms[0].approved_at&&forms[0].checked_at);
      assert.equal(steps.length,1);assert.equal(steps[0].step_number,3);
      assert.equal(steps[0].technical_terms.slug,'qa-term-0001');
      assert.equal(steps[0].content_sources.title,'Fonte exclusiva do movimento');
      assert.equal('approved_by' in forms[0],false);assert.equal('approved_by' in steps[0],false);
    }
    await c.query("update public.technical_terms set publication_status='draft' where slug='qa-term-0001'");
    assert.deepEqual(await api(stepsPath),[]);
    assert.deepEqual(await api('/content_sources?id=eq.'+stepSource.id+'&select=title'),[]);
    await c.query("update public.technical_terms set publication_status='draft' where id=$1",[form.id]);
    assert.deepEqual(await api(formsPath),[]);
    assert.deepEqual(await api('/content_sources?id=eq.'+source.id+'&select=title'),[]);
  });
  await check(
    "108 registros de pesquisa permanecem rascunhos após toda a validação",
    async () => {
      const r = (
        await c.query(
          "select count(*)::int n from public.technical_terms where slug not like 'qa-%' and publication_status='draft'",
        )
      ).rows[0];
      assert.equal(r.n, 108);
    },
  );
  const report = {
    status: "passed",
    postgres: runtime.version,
    postgrest: runtime.postgrestVersion,
    checks: results,
    realDrafts: 108,
    remoteWrites: 0,
  };
  writeFileSync(
    join(root, ".local-validation", "latest.json"),
    JSON.stringify(report, null, 2),
  );
  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
} finally {
  await runtime.stop();
}
