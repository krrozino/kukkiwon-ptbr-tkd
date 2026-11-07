-- Future smoke test: ONLY on an isolated disposable PostgreSQL/Supabase database
-- after all versioned migrations. NOT on the hosted project or production.
-- psql -X -v ON_ERROR_STOP=1 -f supabase/tests/term_senses_authorization.sql
-- Run as test owner. Rollback removes all synthetic data. No real human review.
-- This script simulates gateway claims; also verify real JWT/PostgREST separately.
begin;
create temp table semantics_test_ids as select
 gen_random_uuid() term,gen_random_uuid() source,gen_random_uuid() batch,
 gen_random_uuid() candidate,gen_random_uuid() evidence,gen_random_uuid() sense;
grant select on semantics_test_ids to anon,authenticated;

insert into public.technical_terms(id,slug,category,romanization,record_kind)
 select term,'issue42-'||term,'fixture','Fixture sem homologação','terminology' from semantics_test_ids;
insert into public.content_sources(id,institution,title,official_url)
 select source,'Fixture','Documento isolado','https://example.org/issue42' from semantics_test_ids;
insert into knowledge_research.import_batches(id,batch_key,source_id,source_locator,payload_sha256)
 select batch,batch::text,source,'§1',repeat('a',64) from semantics_test_ids;
insert into knowledge_research.candidates(id,batch_id,record_key,candidate_kind,matched_term_id,raw_payload)
 select candidate,batch,'fixture','terminology',term,'{}'::jsonb from semantics_test_ids;
insert into knowledge_research.field_evidence(id,candidate_id,field_name,observed_value,source_id,source_locator)
 select evidence,candidate,'technical_meaning','"Sentido de teste"'::jsonb,source,'§1 > fixture' from semantics_test_ids;
insert into public.term_senses(id,term_id,sense_kind,meaning,language_tag,usage_context,evidence_id)
 select sense,term,'technical','Sentido de teste','pt-BR','Teste descartável',evidence from semantics_test_ids;

do $$
declare role_name text; table_name text;
begin
 foreach role_name in array array['anon','authenticated'] loop
  foreach table_name in array array['term_senses','term_field_claims'] loop
   if not (select relrowsecurity from pg_class where oid=('public.'||table_name)::regclass)
     or has_table_privilege(role_name,'public.'||table_name,'INSERT,UPDATE,DELETE,TRUNCATE')
     or has_column_privilege(role_name,'public.'||table_name,'approved_by','SELECT')
     or has_column_privilege(role_name,'public.'||table_name,'evidence_id','SELECT')
   then raise exception 'Unsafe privileges: % / %',role_name,table_name; end if;
  end loop;
  if has_schema_privilege(role_name,'knowledge_research','USAGE')
    or has_function_privilege(role_name,'knowledge_research.guard_term_semantics()','EXECUTE')
  then raise exception 'Private research exposed: %',role_name; end if;
 end loop;
 -- An owner with no authenticated subject must not assign a human review.
 perform set_config('request.jwt.claim.sub','',true);
 begin
  update public.term_senses set editorial_status='technical_reviewed',checked_at=now()
   where id=(select sense from semantics_test_ids);
  raise exception 'FAILED: automated review succeeded';
 exception when raise_exception then
  if sqlerrm not like '%identidade autenticada%' then raise; end if;
 end;
end $$;

set local role anon;
do $$
begin
 if exists(select 1 from public.term_senses where id=(select sense from semantics_test_ids))
 then raise exception 'FAILED: anon can read draft'; end if;
 begin
  perform approved_by from public.term_senses;
  raise exception 'FAILED: reviewer identity visible';
 exception when insufficient_privilege then null; end;
 begin
  update public.term_senses set publication_status='published';
  raise exception 'FAILED: anon can write';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
do $$
begin
 if exists(select 1 from public.term_senses where id=(select sense from semantics_test_ids))
 then raise exception 'FAILED: ordinary account can read draft'; end if;
 begin
  perform evidence_id from public.term_senses;
  raise exception 'FAILED: private evidence visible';
 exception when insufficient_privilege then null; end;
 begin
  insert into knowledge_research.human_reviewers(user_id) values(gen_random_uuid());
  raise exception 'FAILED: account self-registered as reviewer';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
