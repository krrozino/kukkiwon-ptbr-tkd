import { PGlite } from '@electric-sql/pglite';
import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm';
import { readFileSync, readdirSync } from 'node:fs';
import { storageSchema } from './storage-schema.mjs';

// Supabase gateway identity is simulated here. This is NOT real DB homologation.
export async function createTermSensesDb() {
  // Opt-in: reuse the existing local-only runner, never accept a database URL.
  if (process.env.TERM_SENSES_REAL_DB === '1') {
    const { startLocalRuntime } = await import('../../tools/local-validation/runtime.mjs');
    const runtime = await startLocalRuntime();
    try {
      await runtime.client.query(`delete from public.body_region_terms; delete from public.term_relations;
        delete from public.term_aliases; delete from public.term_media; delete from public.term_sources;
        delete from public.technical_terms; delete from public.body_regions; delete from public.content_sources;`);
      return { exec:sql=>runtime.client.query(sql), query:(sql,args)=>runtime.client.query(sql,args), close:()=>runtime.stop() };
    } catch(error) { await runtime.stop(); throw error; }
  }
  const db = new PGlite({ extensions: { pg_trgm } });
  await db.exec(`create role anon; create role authenticated;
    grant usage on schema public to anon,authenticated;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema auth to anon,authenticated;`);
  await db.exec(storageSchema);
  for (const file of readdirSync('supabase/migrations').filter(f => f.endsWith('.sql')).sort()) {
    await db.exec(readFileSync('supabase/migrations/' + file, 'utf8'));
  }
  return db;
}

export const reviewer = '42000000-0000-4000-8000-000000000001';
export const outsider = '42000000-0000-4000-8000-000000000002';

export async function termFixture(db, slug = 'dwitgubi', publish = false) {
  const { rows: [term] } = await db.query(`insert into public.technical_terms
    (slug,category,romanization,hangul,record_kind) values($1,'fixture',$1,'뒷굽이','terminology') returning id`, [slug]);
  if (publish) {
    const { rows: [source] } = await db.query(`insert into public.content_sources(institution,title,official_url)
      values('Fixture','Fonte legada','https://example.org/legacy') returning id`);
    await db.query(`insert into public.term_sources(term_id,source_id,source_locator,checked_at)
      values($1,$2,'§1',now())`, [term.id,source.id]);
    await db.query(`update public.technical_terms set editorial_status='technical_reviewed',
      publication_status='published',published_at=now() where id=$1`, [term.id]);
  }
  return term.id;
}

export async function evidenceFixture(db, term, field, value, url = 'https://example.org/sense') {
  const { rows: [source] } = await db.query(`insert into public.content_sources
    (institution,title,edition,publication_year,official_url) values('Fixture','Documento de teste','Teste',2026,$1) returning id`, [url]);
  const { rows: [batch] } = await db.query(`insert into knowledge_research.import_batches
    (batch_key,source_id,source_locator,payload_sha256) values(gen_random_uuid()::text,$1,'§1',repeat('a',64)) returning id`, [source.id]);
  const { rows: [candidate] } = await db.query(`insert into knowledge_research.candidates
    (batch_id,record_key,candidate_kind,matched_term_id,raw_payload) values($1,'candidate','terminology',$2,'{}') returning id`, [batch.id,term]);
  const { rows: [evidence] } = await db.query(`insert into knowledge_research.field_evidence
    (candidate_id,field_name,observed_value,source_id,source_locator)
    values($1,$2,to_jsonb($3::text),$4,'§2 > entrada individual') returning id`, [candidate.id,field,value,source.id]);
  return { evidence: evidence.id, source: source.id };
}

export async function senseFixture(db, term, kind = 'technical', meaning = 'Sentido técnico proposto') {
  const evidence = await evidenceFixture(db, term, kind + '_meaning', meaning);
  const { rows: [sense] } = await db.query(`insert into public.term_senses
    (term_id,sense_kind,language_tag,usage_context,meaning,evidence_id)
    values($1,$2,'pt-BR','Contexto documental de teste',$3,$4) returning id`, [term,kind,meaning,evidence.evidence]);
  return { id:sense.id, ...evidence };
}

export async function claimFixture(db, term, field = 'romanization', value = 'Duit kubi', sense = null) {
  const evidence = await evidenceFixture(db,term,field,value);
  const { rows: [claim] } = await db.query(`insert into public.term_field_claims
    (term_id,sense_id,field_name,value,language_tag,usage_context,variant_kind,evidence_id)
    values($1,$2,$3,$4,'pt-BR','Grafia preservada da fonte','documented_spelling',$5) returning id`, [term,sense,field,value,evidence.evidence]);
  return { id:claim.id, ...evidence };
}

export async function asReviewer(db) {
  await db.query(`insert into auth.users(id) values($1),($2) on conflict do nothing`, [reviewer,outsider]);
  await db.query(`insert into knowledge_research.human_reviewers(user_id) values($1) on conflict do nothing`, [reviewer]);
  await db.query(`select set_config('request.jwt.claim.sub',$1,true)`, [reviewer]);
}

export async function publish(db, table, id) {
  await db.query(`update public.${table} set editorial_status='technical_reviewed',
    publication_status='published',checked_at=now() where id=$1`, [id]);
}
