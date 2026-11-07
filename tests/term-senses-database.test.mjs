import { beforeAll, afterAll, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parsePublishedTermSemantics, TERM_SENSE_COLUMNS, TERM_CLAIM_COLUMNS } from '../src/lib/term-semantics';
import { createTermSensesDb, termFixture, senseFixture, claimFixture, evidenceFixture,
  asReviewer, publish, reviewer, outsider } from './helpers/term-senses-db.mjs';

let db;
beforeAll(async () => { db = await createTermSensesDb(); });
afterAll(async () => { await db?.close(); });
beforeEach(async () => { await db.exec("begin; set local request.jwt.claim.sub='';"); });
afterEach(async () => { await db.exec('rollback; reset role;'); });

async function rejected(operation, pattern) {
  await db.exec('savepoint negative_case;');
  await expect(operation()).rejects.toThrow(pattern);
  await db.exec('rollback to savepoint negative_case;');
}

describe(process.env.TERM_SENSES_REAL_DB === '1' ? 'Issue 42 — PostgreSQL portátil local' : 'Issue 42 — PGlite local, sem homologação de RLS real', () => {
  it('preserva identidade e Hangul iguais com N sentidos e fontes independentes, sem promoção', async () => {
    const term = await termFixture(db);
    await senseFixture(db,term,'technical');
    await senseFixture(db,term,'literal','Hipótese literal de teste, sem homologação');
    for (const kind of ['contextual','historical','regional']) await senseFixture(db,term,kind);
    const other = await termFixture(db,'outro-termo-mesmo-hangul');
    await senseFixture(db,other);
    expect((await db.query('select count(*)::int n from public.technical_terms')).rows[0].n).toBe(2);
    expect((await db.query('select sense_kind,publication_status,editorial_status from public.term_senses where term_id=$1 order by sense_kind',[term])).rows)
      .toEqual(['contextual','historical','literal','regional','technical'].map(sense_kind => ({sense_kind,publication_status:'draft',editorial_status:'research'})));
    expect((await db.query('select count(distinct source_id)::int n from public.term_senses')).rows[0].n).toBe(6);
    await db.exec('set local role anon;');
    expect((await db.query('select id from public.term_senses')).rows).toEqual([]);
  });

  it('recusa evidência ausente, valor/campo/termo divergentes e sentido de outro termo', async () => {
    const term = await termFixture(db), other = await termFixture(db,'outro');
    const evidence = await evidenceFixture(db,term,'hangul','뒷굽이');
    const insert = (parent,field,value,id) => db.query(`insert into public.term_field_claims
      (term_id,field_name,value,language_tag,usage_context,evidence_id) values($1,$2,$3,'ko','Teste',$4)`,[parent,field,value,id]);
    await rejected(() => insert(term,'hangul','뒷굽이',null), /evidência|not-null/i);
    await rejected(() => insert(term,'romanization','뒷굽이',evidence.evidence), /evidência/i);
    await rejected(() => insert(term,'hangul','Outro valor',evidence.evidence), /evidência/i);
    await rejected(() => insert(other,'hangul','뒷굽이',evidence.evidence), /evidência/i);
    const sense = await senseFixture(db,other);
    await rejected(() => db.query(`insert into public.term_field_claims
      (term_id,sense_id,field_name,value,language_tag,usage_context,evidence_id)
      values($1,$2,'hangul','뒷굽이','ko','Teste',$3)`,[term,sense.id,evidence.evidence]), /foreign key/i);
  });

  it.each(['https://user:pass@example.org/a','https://example.org\\evil','https://example.org/a b','https://999.999.999.999/a'])(
    'recusa projeção bibliográfica insegura: %s', async url => {
      const term = await termFixture(db);
      const evidence = await evidenceFixture(db,term,'hangul','뒷굽이',url);
      await rejected(() => db.query(`insert into public.term_field_claims
        (term_id,field_name,value,language_tag,usage_context,evidence_id)
        values($1,'hangul','뒷굽이','ko','Teste',$2)`,[term,evidence.evidence]), /URL|bibliogr/i);
    });

  it('captura bibliografia/localizador da evidência sem aceitar falsificação nem expor a pesquisa', async () => {
    const term = await termFixture(db,'dwitgubi',true), sense = await senseFixture(db,term);
    await asReviewer(db); await publish(db,'term_senses',sense.id);
    await db.query(`update public.content_sources set title='Correção posterior' where id=$1`,[sense.source]);
    await db.query(`update public.term_senses set source_locator='Falso',source_snapshot='{}' where id=$1`,[sense.id]);
    await db.exec('set local role anon;');
    const row = (await db.query('select source_id,source_locator,source_snapshot from public.term_senses')).rows[0];
    expect(row.source_locator).toBe('§2 > entrada individual');
    expect(row.source_snapshot.title).toBe('Documento de teste');
    expect(Object.keys(row.source_snapshot).sort()).toEqual(['edition','institution','official_url','publication_year','title']);
    expect((await db.query('select id from public.content_sources where id=$1',[sense.source])).rows).toEqual([]);
    for (const sql of ['select approved_by from public.term_senses','select evidence_id from public.term_senses',
      'select * from knowledge_research.editorial_events']) await rejected(() => db.query(sql), /permission denied/);
  });

  it.each([{edition:''},{publication_year:0},{publication_year:10000},{title:'x'.repeat(4001)}])(
    'recusa metadado bibliográfico incompatível com o contrato público: %j', async patch => {
      const term=await termFixture(db);
      // Capture invalid canonical metadata in a fresh immutable evidence snapshot.
      const original=await evidenceFixture(db,term,'hangul','뒷굽이');
      for(const [key,value] of Object.entries(patch)) await db.query(`update public.content_sources set ${key}=$1 where id=$2`,[value,original.source]);
      const {rows:[evidence]}=await db.query(`insert into knowledge_research.field_evidence
        (candidate_id,field_name,observed_value,source_id,source_locator)
        select candidate_id,field_name,observed_value,source_id,source_locator from knowledge_research.field_evidence where id=$1 returning id`,[original.evidence]);
      await rejected(()=>db.query(`insert into public.term_field_claims
        (term_id,field_name,value,language_tag,usage_context,evidence_id)
        values($1,'hangul','뒷굽이','ko','Teste',$2)`,[term,evidence.id]),/bibliogr/i);
    });

  it('carimba criação no banco e não aceita metadados de tamanho ilimitado', async () => {
    const term=await termFixture(db), sense=await senseFixture(db,term);
    await db.query(`update public.term_senses set created_at='2999-01-01' where id=$1`,[sense.id]);
    expect(Date.parse((await db.query('select created_at from public.term_senses where id=$1',[sense.id])).rows[0].created_at)).toBeLessThanOrEqual(Date.now());
    await rejected(()=>db.query(`update public.term_senses set language_tag=$1 where id=$2`,['pt-'+'BR-'.repeat(30)+'BR',sense.id]),/check constraint/);
    await rejected(()=>db.query(`update public.term_senses set usage_context=$1 where id=$2`,[' '.repeat(2001)+'Teste',sense.id]),/check constraint/);
  });

  it.each(['term_senses','term_field_claims'])('%s exige conferência válida e humano ativo para revisão/publicação', async table => {
    const term = await termFixture(db,'dwitgubi',true);
    const item = table === 'term_senses' ? await senseFixture(db,term) : await claimFixture(db,term);
    await rejected(() => db.query(`update public.${table} set editorial_status='document_checked' where id=$1`,[item.id]), /confer/i);
    await rejected(() => publish(db,table,item.id), /identidade autenticada/i);
    await asReviewer(db);
    await rejected(() => db.query(`update public.${table} set editorial_status='technical_reviewed',checked_at=now(),approved_by=$1 where id=$2`,[outsider,item.id]), /divergente/i);
    await rejected(() => db.query(`update public.${table} set editorial_status='document_checked',checked_at=now()+interval '1 day' where id=$1`,[item.id]), /confer/i);
    await db.query('update knowledge_research.human_reviewers set active=false where user_id=$1',[reviewer]);
    await rejected(() => publish(db,table,item.id), /revisor ativo/i);
    await db.query('update knowledge_research.human_reviewers set active=true where user_id=$1',[reviewer]);
    await publish(db,table,item.id);
    await db.exec("set local request.jwt.claim.sub='';");
    await rejected(() => db.query(`update public.${table} set usage_context='Edição sem revisão' where id=$1`,[item.id]), /identidade autenticada/i);
    await db.query(`update public.${table} set publication_status='draft',editorial_status='research' where id=$1`,[item.id]);
    expect((await db.query(`select approved_by,approved_at from public.${table} where id=$1`,[item.id])).rows[0]).toEqual({approved_by:null,approved_at:null});
  });

  it.each(['anon','authenticated'])('%s não lê draft nem escreve catálogo ou se torna revisor', async role => {
    const term = await termFixture(db,'dwitgubi',true);
    await senseFixture(db,term); await claimFixture(db,term);
    await db.exec(`set local role ${role};`);
    expect((await db.query('select id from public.term_senses')).rows).toEqual([]);
    expect((await db.query('select id from public.term_field_claims')).rows).toEqual([]);
    for (const table of ['term_senses','term_field_claims']) {
      for (const sql of [`update public.${table} set publication_status='published'`, `delete from public.${table}`, `truncate public.${table}`])
        await rejected(() => db.exec(sql), /permission denied/);
      await rejected(() => db.exec(`insert into public.${table} default values`), /permission denied/);
    }
    await rejected(() => db.query('insert into knowledge_research.human_reviewers(user_id) values($1)',[reviewer]),/permission denied/);
    await rejected(() => db.exec('select knowledge_research.require_human_reviewer()'),/permission denied/);
  });

  it('preserva duas grafias conflitantes e oculta dependentes quando o sentido ou termo é retirado', async () => {
    const term = await termFixture(db,'dwitgubi',true), sense = await senseFixture(db,term);
    const a = await claimFixture(db,term,'romanization','Duit kubi',sense.id);
    const b = await claimFixture(db,term,'romanization','Dwitgubi',sense.id);
    await asReviewer(db);
    await publish(db,'term_senses',sense.id);
    await publish(db,'term_field_claims',a.id); await publish(db,'term_field_claims',b.id);
    await db.exec('set local role anon;');
    expect((await db.query('select value from public.term_field_claims order by value')).rows).toEqual([{value:'Duit kubi'},{value:'Dwitgubi'}]);
    expect((await db.query('select alias from public.term_aliases')).rows).toEqual([]);
    await db.exec('reset role;');
    await db.query(`update public.term_senses set publication_status='retired' where id=$1`,[sense.id]);
    await db.exec('set local role anon;');
    expect((await db.query('select id from public.term_field_claims')).rows).toEqual([]);
    await db.exec('reset role;'); await publish(db,'term_senses',sense.id);
    await db.query(`update public.technical_terms set publication_status='draft' where id=$1`,[term]);
    await db.exec('set local role authenticated;');
    expect((await db.query('select id from public.term_senses')).rows).toEqual([]);
    expect((await db.query('select id from public.term_field_claims')).rows).toEqual([]);
  });

  it('vincula somente regiões existentes e esconde a afirmação ao retirar a região', async () => {
    const term = await termFixture(db,'dwitgubi',true);
    const {rows:[region]} = await db.query(`insert into public.body_regions(slug,region_group,name_pt,publication_status)
      values('ilustracao','feet','Recorte ilustrativo','published') returning id`);
    const evidence = await evidenceFixture(db,term,'region','Superfície proposta');
    const insert = () => db.query(`insert into public.term_field_claims
      (term_id,field_name,value,language_tag,usage_context,region_id,region_usage_context,evidence_id)
      values($1,'region','Superfície proposta','pt-BR','Teste',$2,'surface',$3) returning id`,[term,region.id,evidence.evidence]);
    await rejected(insert,/foreign key/);
    await db.query(`insert into public.body_region_terms(region_id,term_id,usage_context,anatomical_role) values($1,$2,'surface','surface')`,[region.id,term]);
    const {rows:[claim]}=await insert();
    await asReviewer(db); await publish(db,'term_field_claims',claim.id);
    await db.exec('set local role anon;');
    expect((await db.query('select value from public.term_field_claims')).rows).toHaveLength(1);
    await db.exec('reset role;');
    await db.query(`update public.body_regions set publication_status='draft' where id=$1`,[region.id]);
    await db.exec('set local role anon;');
    expect((await db.query('select id from public.term_field_claims')).rows).toEqual([]);
  });

  it('registra histórico privado de alterações/exclusões e impede TRUNCATE', async () => {
    const term=await termFixture(db), sense=await senseFixture(db,term), claim=await claimFixture(db,term);
    await db.query(`update public.term_senses set usage_context='Contexto corrigido' where id=$1`,[sense.id]);
    await db.query('delete from public.term_field_claims where id=$1',[claim.id]);
    const {rows}=await db.query(`select action,previous_snapshot,snapshot from knowledge_research.editorial_events
      where entity_kind='term_senses' and action='UPDATE'`);
    expect(rows[0].previous_snapshot.usage_context).toBe('Contexto documental de teste');
    expect(rows[0].snapshot.usage_context).toBe('Contexto corrigido');
    expect((await db.query(`select action from knowledge_research.editorial_events where entity_kind='term_field_claims' and action='DELETE'`)).rows).toEqual([{action:'DELETE'}]);
    for (const table of ['term_senses','term_field_claims']) await rejected(() => db.exec(`truncate public.${table} cascade`),/imutável/i);
  });

  it('oculta a distinção quando o outro termo ainda é draft e após revogação', async () => {
    const term=await termFixture(db,'dwichuk',true), other=await termFixture(db,'dwikkumchi',true);
    const evidence=await evidenceFixture(db,term,'distinction','São superfícies distintas na proposta documental');
    const {rows:[claim]}=await db.query(`insert into public.term_field_claims
      (term_id,field_name,value,language_tag,usage_context,related_term_id,evidence_id)
      values($1,'distinction','São superfícies distintas na proposta documental','pt-BR','Comparação',$2,$3) returning id`,[term,other,evidence.evidence]);
    await asReviewer(db); await publish(db,'term_field_claims',claim.id);
    await db.exec('set local role anon;');
    expect((await db.query('select related_term_id from public.term_field_claims')).rows).toEqual([{related_term_id:other}]);
    await db.exec('reset role;');
    await db.query(`update public.technical_terms set publication_status='retired' where id=$1`,[other]);
    await db.exec('set local role anon;');
    expect((await db.query('select id from public.term_field_claims')).rows).toEqual([]);
  });

  it('mantém responsáveis de escolas A/B isolados e sem escrita global', async () => {
    await db.query('insert into auth.users(id) values($1),($2)',[reviewer,outsider]);
    for (const [index,owner] of [reviewer,outsider].entries()) {
      const {rows:[school]}=await db.query(`insert into public.schools(owner_user_id,name,slug) values($1,$2,$3) returning id`,[owner,'Escola '+index,'escola-'+index]);
      await db.query(`insert into public.school_curricula(school_id,owner_user_id,title,content)
        values($1,$2,$3,'{}')`,[school.id,owner,'Currículo '+index]);
    }
    await db.query(`select set_config('request.jwt.claim.sub',$1,true)`,[reviewer]);
    await db.exec('set local role authenticated;');
    expect((await db.query('select title from public.school_curricula')).rows).toEqual([{title:'Currículo 0'}]);
    await rejected(()=>db.exec('insert into public.term_senses default values'),/permission denied/);
    await rejected(()=>db.exec('insert into public.term_field_claims default values'),/permission denied/);
    await db.query(`select set_config('request.jwt.claim.sub',$1,true)`,[outsider]);
    expect((await db.query('select title from public.school_curricula')).rows).toEqual([{title:'Currículo 1'}]);
    await rejected(()=>db.exec(`update public.term_senses set editorial_status='technical_reviewed'`),/permission denied/);
  });

  it('trocar a evidência de um sentido revisado exige nova sessão de revisor ativo', async () => {
    const term=await termFixture(db), sense=await senseFixture(db,term);
    const replacement=await evidenceFixture(db,term,'technical_meaning','Novo sentido técnico');
    await asReviewer(db); await publish(db,'term_senses',sense.id);
    const change=()=>db.query(`update public.term_senses set evidence_id=$1,meaning='Novo sentido técnico' where id=$2`,[replacement.evidence,sense.id]);
    await db.exec("set local request.jwt.claim.sub='';");
    await rejected(change,/identidade autenticada/);
    await db.query(`select set_config('request.jwt.claim.sub',$1,true)`,[reviewer]);
    await db.query('update knowledge_research.human_reviewers set active=false where user_id=$1',[reviewer]);
    await rejected(change,/revisor ativo/);
    expect((await db.query('select meaning from public.term_senses where id=$1',[sense.id])).rows[0].meaning).toBe('Sentido técnico proposto');
  });

  it('decodifica a projeção SQL publicada com os mesmos tipos usados pelo cliente', async () => {
    const term=await termFixture(db,'contrato-publico',true), sense=await senseFixture(db,term);
    const claim=await claimFixture(db,term,'romanization','Grafia original',sense.id);
    await asReviewer(db); await publish(db,'term_senses',sense.id); await publish(db,'term_field_claims',claim.id);
    await db.exec('set local role anon;');
    const data={senses:(await db.query(`select ${TERM_SENSE_COLUMNS} from public.term_senses where term_id=$1`,[term])).rows,
      claims:(await db.query(`select ${TERM_CLAIM_COLUMNS} from public.term_field_claims where term_id=$1`,[term])).rows};
    const parsed=parsePublishedTermSemantics(JSON.parse(JSON.stringify(data)),term);
    expect(parsed.senses[0].meaning).toBe('Sentido técnico proposto');
    expect(parsed.claims[0].value).toBe('Grafia original');
  });

  it('executa o smoke SQL no backend local selecionado', async () => {
    await db.exec('rollback;');
    await db.exec(readFileSync('supabase/tests/term_senses_authorization.sql','utf8'));
    await db.exec('begin;');
  });
});
