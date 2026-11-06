import { PGlite } from '@electric-sql/pglite';
import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm';
import { beforeAll, afterAll, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { storageSchema } from './helpers/storage-schema.mjs';
import { loadBatches, generateImportSql } from '../scripts/content.mjs';

let db;
let originalCatalog, migratedCatalog;
const catalogTables = ['technical_terms','content_sources','term_sources','term_aliases','term_relations','body_regions','body_region_terms','term_media'];
async function catalogSnapshot() {
  const entries = [];
  for (const table of catalogTables) {
    const { rows: [row] } = await db.query(`select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]') data from public.${table} t`);
    entries.push([table,row.data]);
  }
  return Object.fromEntries(entries);
}
const reviewer = '10000000-0000-4000-8000-000000000001';
const outsider = '10000000-0000-4000-8000-000000000002';
beforeAll(async () => {
  db = new PGlite({ extensions: { pg_trgm } });
  await db.exec(`create role anon; create role authenticated;
    grant usage on schema public to anon,authenticated;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema auth to anon,authenticated;`);
  await db.exec(storageSchema);
  const migration = '20261106152500_knowledge_research_and_poomsae.sql';
  for (const file of readdirSync('supabase/migrations').filter(f => f.endsWith('.sql') && f !== migration).sort()) {
    await db.exec(readFileSync('supabase/migrations/' + file, 'utf8'));
    if (file === '20261103220044_atlas_media_e_integridade_de_fontes.sql') {
      for (const seed of ['kukkiwon_2012_first20_drafts.sql','atlas_maos_2012_drafts.sql']) {
        await db.exec(readFileSync('supabase/seeds/' + seed,'utf8'));
      }
    }
  }
  const batches = loadBatches();
  for (const batch of batches.filter(batch => batch.batch !== 'kukkiwon-2012-first20')) {
    await db.exec(generateImportSql(batch,batches.filter(other => other !== batch)));
  }
  originalCatalog = await catalogSnapshot();
  await db.exec(readFileSync('supabase/migrations/' + migration,'utf8'));
  migratedCatalog = await catalogSnapshot();
  // Free only legacy fixtures; never disable the new immutable/audit triggers.
  await db.exec(`delete from public.body_region_terms; delete from public.term_relations;
    delete from public.term_aliases; delete from public.term_media; delete from public.term_sources;
    delete from public.technical_terms; delete from public.body_regions; delete from public.content_sources;`);
});
afterAll(async () => { await db?.close(); });
beforeEach(async () => {
  await db.exec(`reset role; begin; set local request.jwt.claim.sub='';
    insert into auth.users(id) values('${reviewer}'),('${outsider}');`);
});
afterEach(async () => { await db.exec('rollback; reset role;'); });

async function researchFixture() {
  const { rows: [source] } = await db.query(`insert into public.content_sources(institution,title,official_url)
    values('Fixture','Documento isolado','https://example.org/fixture') returning id`);
  const { rows: [batch] } = await db.query(`insert into knowledge_research.import_batches
    (batch_key,source_id,source_locator,payload_sha256) values('isolated-batch',$1,'§2',repeat('a',64)) returning id`, [source.id]);
  const { rows: [candidate] } = await db.query(`insert into knowledge_research.candidates
    (batch_id,record_key,candidate_kind,raw_payload) values($1,'candidate-1','technique','{"translation_pt":"Provisório"}') returning id`, [batch.id]);
  return { source: source.id, batch: batch.id, candidate: candidate.id };
}
async function proposalFixture() {
  const fixture = await researchFixture();
  const { rows: [proposal] } = await db.query(`insert into knowledge_research.change_proposals(candidate_id,patch,rationale)
    values($1,'{"translation_pt":"Tradução conferida"}','Proposta de revisão') returning id`, [fixture.candidate]);
  return { ...fixture, proposal: proposal.id };
}
async function evidence(fixture, locator = '§2 > p. 4', value = 'Tradução conferida') {
  return db.query(`insert into knowledge_research.field_evidence(candidate_id,field_name,observed_value,source_id,source_locator)
    values($1,'translation_pt',to_jsonb($2::text),$3,$4)`, [fixture.candidate, value, fixture.source, locator]);
}
async function asReviewer() {
  await db.query('insert into knowledge_research.human_reviewers(user_id) values($1)', [reviewer]);
  await db.query("select set_config('request.jwt.claim.sub',$1,true)", [reviewer]);
}
async function canonicalTerm(slug, kind = 'technique', publish = true) {
  const { rows: [term] } = await db.query(`insert into public.technical_terms
    (slug,category,romanization,record_kind,editorial_status)
    values($1,'fixture',$1,$2,'technical_reviewed') returning id`, [slug, kind]);
  const { rows: [source] } = await db.query(`insert into public.content_sources(institution,title,official_url)
    values('Fixture',$1,'https://example.org/fixture') returning id`, [slug]);
  await db.query(`insert into public.term_sources(term_id,source_id,source_locator,checked_at)
    values($1,$2,'§1',now())`, [term.id, source.id]);
  if (publish) await db.query(`update public.technical_terms set publication_status='published',published_at=now() where id=$1`, [term.id]);
  return { term: term.id, source: source.id };
}
async function formFixture(publish = false) {
  const root = await canonicalTerm('poomsae-fixture', 'poomsae');
  await db.query(`insert into public.poomsae_forms(term_id,sequence_version,source_id,source_locator)
    values($1,'fixture-v1',$2,'§4 > Forma')`, [root.term, root.source]);
  if (publish) {
    await asReviewer();
    await db.query(`update public.poomsae_forms set publication_status='published',checked_at=now() where term_id=$1`, [root.term]);
  }
  return root;
}

describe('Conhecimento: isolamento e proveniência no PostgreSQL real', () => {
  it('aplica a migração sobre os 108 rascunhos existentes sem reescrever registros ou fontes', async () => {
    expect(originalCatalog.technical_terms).toHaveLength(108);
    expect(originalCatalog.technical_terms.every(term => term.publication_status === 'draft')).toBe(true);
    expect(migratedCatalog).toEqual(originalCatalog);
    expect((await db.query('select count(*)::int n from knowledge_research.candidates')).rows[0].n).toBe(0);
    expect((await db.query('select count(*)::int n from public.poomsae_forms')).rows[0].n).toBe(0);
  });
  it.each(['term','related_term'])('expõe fonte exclusiva de relação visível e a oculta ao retirar %s de publicação', async hiddenParent => {
    const term = await canonicalTerm('relation-child', 'variant');
    const parent = await canonicalTerm('relation-parent', 'family');
    const { rows: [source] } = await db.query(`insert into public.content_sources(institution,title,official_url)
      values('Fixture','Fonte exclusiva da relação','https://example.org/relation-only') returning id`);
    await db.query(`insert into public.term_relations(term_id,related_term_id,relation_kind,source_id,source_locator,publication_status,checked_at)
      values($1,$2,'variant_of',$3,'§3 > Variante','published',now())`, [term.term,parent.term,source.id]);
    await db.exec('set local role anon;');
    expect((await db.query(`select relation.source_locator,document.title from public.term_relations relation
      left join public.content_sources document on document.id=relation.source_id
      where relation.term_id=$1`, [term.term])).rows)
      .toEqual([{ source_locator: '§3 > Variante', title: 'Fonte exclusiva da relação' }]);
    await db.exec('reset role;');
    await db.query(`update public.technical_terms set publication_status='draft' where id=$1`,
      [hiddenParent === 'term' ? term.term : parent.term]);
    await db.exec('set local role anon;');
    expect((await db.query('select term_id from public.term_relations')).rows).toEqual([]);
    expect((await db.query('select title from public.content_sources where id=$1', [source.id])).rows).toEqual([]);
  });
  it.each(['term','region'])('expõe fonte exclusiva de vínculo do atlas e a oculta ao retirar %s de publicação', async hiddenParent => {
    const term = await canonicalTerm('atlas-technique');
    const { rows: [region] } = await db.query(`insert into public.body_regions(slug,region_group,name_pt,publication_status)
      values('atlas-region','hands','Região isolada','published') returning id`);
    const { rows: [source] } = await db.query(`insert into public.content_sources(institution,title,official_url)
      values('Fixture','Fonte exclusiva do atlas','https://example.org/atlas-only') returning id`);
    await db.query(`insert into public.body_region_terms(region_id,term_id,usage_context,source_id,source_locator)
      values($1,$2,'surface',$3,'Apêndice > Região')`, [region.id,term.term,source.id]);
    await db.exec('set local role anon;');
    expect((await db.query(`select link.source_locator,document.title from public.body_region_terms link
      left join public.content_sources document on document.id=link.source_id
      where link.term_id=$1`, [term.term])).rows)
      .toEqual([{ source_locator: 'Apêndice > Região', title: 'Fonte exclusiva do atlas' }]);
    await db.exec('reset role;');
    if (hiddenParent === 'term') await db.query(`update public.technical_terms set publication_status='draft' where id=$1`, [term.term]);
    else await db.query(`update public.body_regions set publication_status='draft' where id=$1`, [region.id]);
    await db.exec('set local role anon;');
    expect((await db.query('select term_id from public.body_region_terms')).rows).toEqual([]);
    expect((await db.query('select title from public.content_sources where id=$1', [source.id])).rows).toEqual([]);
  });
  it('não dá acesso a pesquisa, funções ou escrita de Poomsae a visitantes ou contas comuns', async () => {
    await researchFixture();
    for (const role of ['anon', 'authenticated']) {
      const { rows: [access] } = await db.query(`select has_schema_privilege($1,'knowledge_research','USAGE') as visible`, [role]);
      expect(access.visible).toBe(false);
      const { rows } = await db.query(`select c.relname,c.relrowsecurity,
        has_table_privilege($1,c.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE') as allowed
        from pg_class c join pg_namespace n on n.oid=c.relnamespace
        where n.nspname='knowledge_research' and c.relkind='r'`, [role]);
      expect(rows.length).toBeGreaterThanOrEqual(7);
      expect(rows.every(row => row.relrowsecurity && !row.allowed)).toBe(true);
      expect((await db.query(`select count(*)::int n from pg_proc p join pg_namespace n on n.oid=p.pronamespace
        where n.nspname='knowledge_research' and has_function_privilege($1,p.oid,'EXECUTE')`, [role])).rows[0].n).toBe(0);
      await db.exec(`set local role ${role};`);
      expect((await db.query('select count(*)::int n from public.poomsae_forms')).rows[0].n).toBe(0);
      await db.exec('reset role;');
    }
  });
  it('exige localizador individual e preserva o lote sem alterar ou publicar o catálogo', async () => {
    const fixture = await researchFixture();
    await db.exec('savepoint bad_locator;');
    await expect(evidence(fixture, '  ')).rejects.toThrow(/check constraint/);
    await db.exec('rollback to savepoint bad_locator;');
    await evidence(fixture);
    expect((await db.query('select count(*)::int n from public.technical_terms')).rows[0].n).toBe(0);
    expect((await db.query('select count(*)::int n from knowledge_research.editorial_events')).rows[0].n).toBe(3);
  });
  it('mantém pesquisa invisível por RLS mesmo após um grant acidental de leitura', async () => {
    await researchFixture();
    await db.exec(`grant usage on schema knowledge_research to anon,authenticated;
      grant select on all tables in schema knowledge_research to anon,authenticated;`);
    for (const role of ['anon','authenticated']) {
      await db.exec(`set local role ${role};`);
      expect((await db.query('select count(*)::int n from knowledge_research.candidates')).rows[0].n).toBe(0);
      expect((await db.query('select count(*)::int n from knowledge_research.editorial_events')).rows[0].n).toBe(0);
      await db.exec('reset role;');
    }
  });
  it('preserva a citação usada na evidência quando metadados bibliográficos forem corrigidos', async () => {
    const fixture = await researchFixture();
    await evidence(fixture);
    await db.query(`update public.content_sources set title='Metadado corrigido',official_url='https://example.org/new' where id=$1`, [fixture.source]);
    const { rows: [row] } = await db.query('select source_snapshot from knowledge_research.field_evidence where candidate_id=$1', [fixture.candidate]);
    expect(row.source_snapshot.title).toBe('Documento isolado');
    expect(row.source_snapshot.official_url).toBe('https://example.org/fixture');
  });
  it('rejeita decisão humana sem identidade autenticada, mesmo com revisor fornecido', async () => {
    const fixture = await proposalFixture();
    await evidence(fixture);
    await db.query('insert into knowledge_research.human_reviewers(user_id) values($1)', [reviewer]);
    await expect(db.query(`insert into knowledge_research.human_approvals(proposal_id,decision,reviewer_id,rationale)
      values($1,'approve',$2,'Conferido')`, [fixture.proposal, reviewer])).rejects.toThrow(/identidade autenticada/i);
  });
  it('rejeita usuário fora da lista editorial, sem inferir autorização dos metadados', async () => {
    const fixture = await proposalFixture();
    await evidence(fixture);
    await db.query("select set_config('request.jwt.claim.sub',$1,true)", [outsider]);
    await expect(db.query(`insert into knowledge_research.human_approvals(proposal_id,decision,rationale)
      values($1,'approve','Conferido')`, [fixture.proposal])).rejects.toThrow(/revisor ativo/i);
  });
  it('não aprova campo sem evidência individual correspondente', async () => {
    const fixture = await proposalFixture();
    await evidence(fixture, '§2 > p. 4', 'Outro valor');
    await asReviewer();
    await expect(db.query(`insert into knowledge_research.human_approvals(proposal_id,decision,rationale)
      values($1,'approve','Conferido')`, [fixture.proposal])).rejects.toThrow(/evidência.*campo/i);
  });
  it('rejeita revisor desativado e não confunde uma evidência com todos os campos de uma proposta', async () => {
    const fixture = await proposalFixture();
    await evidence(fixture);
    await asReviewer();
    await db.query('update knowledge_research.human_reviewers set active=false where user_id=$1', [reviewer]);
    await db.exec('savepoint inactive;');
    await expect(db.query(`insert into knowledge_research.human_approvals(proposal_id,decision,rationale)
      values($1,'approve','Conferido')`, [fixture.proposal])).rejects.toThrow(/revisor ativo/i);
    await db.exec('rollback to savepoint inactive;');
    await db.query('update knowledge_research.human_reviewers set active=true where user_id=$1', [reviewer]);
    const { rows: [proposal] } = await db.query(`insert into knowledge_research.change_proposals(candidate_id,patch,rationale)
      values($1,'{"translation_pt":"Tradução conferida","hangul":"앞차기"}','Dois campos') returning id`, [fixture.candidate]);
    await expect(db.query(`insert into knowledge_research.human_approvals(proposal_id,decision,rationale)
      values($1,'approve','Conferido')`, [proposal.id])).rejects.toThrow(/evidência.*campo/i);
  });
  it('registra decisão autenticada sem promover proposta e sem aceitar assinatura alheia', async () => {
    const fixture = await proposalFixture();
    await evidence(fixture);
    await asReviewer();
    await db.exec('savepoint spoofed;');
    await expect(db.query(`insert into knowledge_research.human_approvals(proposal_id,decision,reviewer_id,rationale)
      values($1,'approve',$2,'Conferido')`, [fixture.proposal, outsider])).rejects.toThrow(/identidade.*divergente/i);
    await db.exec('rollback to savepoint spoofed;');
    const { rows: [approval] } = await db.query(`insert into knowledge_research.human_approvals(proposal_id,decision,rationale)
      values($1,'approve','Conferido no documento') returning reviewer_id,created_at`, [fixture.proposal]);
    expect(approval.reviewer_id).toBe(reviewer);
    expect(approval.created_at).toBeTruthy();
    expect((await db.query('select count(*)::int n from public.technical_terms')).rows[0].n).toBe(0);
    const { rows: [event] } = await db.query(`select actor_user_id,actor_kind,snapshot from knowledge_research.editorial_events
      where entity_kind='human_approvals'`);
    expect(event.actor_user_id).toBe(reviewer);
    expect(event.actor_kind).toBe('human');
    expect(event.snapshot.decision).toBe('approve');
  });
  it.each(['import_batches','candidates','field_evidence','change_proposals','human_approvals','editorial_events'])(
    'mantém %s imutável, incluindo DELETE e TRUNCATE', async (table) => {
      const fixture = await proposalFixture();
      await evidence(fixture);
      await asReviewer();
      await db.query(`insert into knowledge_research.human_approvals(proposal_id,decision,rationale)
        values($1,'approve','Conferido')`, [fixture.proposal]);
      for (const statement of [`update knowledge_research.${table} set created_at=now()`,
        `delete from knowledge_research.${table}`, `truncate knowledge_research.${table} cascade`]) {
        await db.exec('savepoint immutable;');
        await expect(db.exec(statement)).rejects.toThrow(/imutável/i);
        await db.exec('rollback to savepoint immutable;');
      }
    });
});

describe('Poomsae: relações ao catálogo existente e publicação humana', () => {
  it('aceita terminologia no catálogo canônico e mantém Poomsae vazio por padrão', async () => {
    await canonicalTerm('terminologia-fixture', 'terminology', false);
    await formFixture();
    await db.exec('set local role anon;');
    expect((await db.query('select count(*)::int n from public.poomsae_forms')).rows[0].n).toBe(0);
    expect((await db.query('select count(*)::int n from public.poomsae_steps')).rows[0].n).toBe(0);
  });
  it('não deixa automação publicar forma com fonte e checked_at sem revisor humano', async () => {
    const root = await formFixture();
    await expect(db.query(`update public.poomsae_forms set publication_status='published',checked_at=now() where term_id=$1`, [root.term]))
      .rejects.toThrow(/identidade autenticada/i);
  });
  it('expõe sequência ordenável, fontes individuais e nenhum identificador de revisor', async () => {
    const root = await formFixture(true);
    const technique = await canonicalTerm('movimento-fixture');
    const { rows: [stepSource] } = await db.query(`insert into public.content_sources(institution,title,official_url)
      values('Fixture','Fonte apenas do passo','https://example.org/step') returning id`);
    await db.query(`insert into public.poomsae_steps(poomsae_term_id,step_number,technique_term_id,source_id,source_locator,
      publication_status,checked_at) values($1,1,$2,$3,'§4 > passo 1','published',now())`, [root.term, technique.term, stepSource.id]);
    await db.exec('set local role anon;');
    expect((await db.query('select term_id,sequence_version,approved_at from public.poomsae_forms')).rows[0].term_id).toBe(root.term);
    expect((await db.query('select step_number,technique_term_id from public.poomsae_steps order by step_number')).rows)
      .toEqual([{ step_number: 1, technique_term_id: technique.term }]);
    expect((await db.query('select title from public.content_sources where id=$1', [stepSource.id])).rows).toEqual([{ title: 'Fonte apenas do passo' }]);
    await db.exec('savepoint private_identity;');
    await expect(db.query('select approved_by from public.poomsae_forms')).rejects.toThrow(/permission denied/);
    await db.exec('rollback to savepoint private_identity; reset role;');
    await db.query(`update public.technical_terms set publication_status='draft' where id=$1`, [technique.term]);
    await db.exec('set local role anon;');
    expect((await db.query('select count(*)::int n from public.poomsae_steps')).rows[0].n).toBe(0);
    expect((await db.query('select count(*)::int n from public.content_sources where id=$1', [stepSource.id])).rows[0].n).toBe(0);
  });
  it('rejeita posição duplicada e família usada como movimento executável', async () => {
    const root = await formFixture();
    const technique = await canonicalTerm('movimento-fixture');
    const family = await canonicalTerm('familia-fixture', 'family');
    await db.query(`insert into public.poomsae_steps(poomsae_term_id,step_number,technique_term_id,source_id,source_locator)
      values($1,1,$2,$3,'§4 > passo 1')`, [root.term, technique.term, root.source]);
    await db.exec('savepoint duplicate;');
    await expect(db.query(`insert into public.poomsae_steps(poomsae_term_id,step_number,technique_term_id,source_id,source_locator)
      values($1,1,$2,$3,'§4 > passo 1')`, [root.term, technique.term, root.source])).rejects.toThrow(/unique constraint/);
    await db.exec('rollback to savepoint duplicate;');
    await expect(db.query(`insert into public.poomsae_steps(poomsae_term_id,step_number,technique_term_id,source_id,source_locator)
      values($1,2,$2,$3,'§4 > passo 2')`, [root.term, family.term, root.source])).rejects.toThrow(/técnica ou variante/i);
  });
  it('exige nova identidade humana ao editar publicação e registra o valor anterior', async () => {
    const root = await formFixture(true);
    await db.exec("set local request.jwt.claim.sub=''; savepoint automation;");
    await expect(db.query(`update public.poomsae_forms set sequence_version='alterada' where term_id=$1`, [root.term]))
      .rejects.toThrow(/identidade autenticada/i);
    await db.exec('rollback to savepoint automation;');
    await db.query("select set_config('request.jwt.claim.sub',$1,true)", [reviewer]);
    await db.query(`update public.poomsae_forms set sequence_version='fixture-v2' where term_id=$1`, [root.term]);
    const { rows: [event] } = await db.query(`select actor_user_id,previous_snapshot,snapshot from knowledge_research.editorial_events
      where entity_kind='poomsae_forms' and snapshot->>'sequence_version'='fixture-v2'`);
    expect(event.actor_user_id).toBe(reviewer);
    expect(event.previous_snapshot.sequence_version).toBe('fixture-v1');
    expect(event.snapshot.sequence_version).toBe('fixture-v2');
  });
  it.each(['poomsae_forms','poomsae_steps'])('bloqueia TRUNCATE de %s para não contornar o histórico', async table => {
    await formFixture();
    await expect(db.exec(`truncate public.${table} cascade`)).rejects.toThrow(/imutável/i);
  });
});
