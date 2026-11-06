-- Proposta local aditiva. NÃO aplicada ao Supabase remoto; nenhum seed ou publicação.
-- CLI Supabase indisponível neste ambiente: nome versionado criado localmente.
-- O catálogo canônico continua em public.technical_terms; pesquisa não é catálogo.

create schema knowledge_research;
revoke all on schema knowledge_research from public,anon,authenticated;
alter default privileges in schema knowledge_research revoke all on tables from public,anon,authenticated;
alter default privileges in schema knowledge_research revoke all on sequences from public,anon,authenticated;
alter default privileges in schema knowledge_research revoke execute on functions from public,anon,authenticated;

create table knowledge_research.import_batches (
 id uuid primary key default gen_random_uuid(),
 batch_key text not null unique check(length(btrim(batch_key)) between 1 and 200),
 source_id uuid not null references public.content_sources(id) on delete restrict,
 source_locator text not null check(length(btrim(source_locator)) > 0),
 payload_sha256 text not null check(payload_sha256 ~ '^[0-9a-f]{64}$'),
 created_at timestamptz not null default clock_timestamp()
);
create table knowledge_research.candidates (
 id uuid primary key default gen_random_uuid(),
 batch_id uuid not null references knowledge_research.import_batches(id) on delete restrict,
 record_key text not null check(length(btrim(record_key)) between 1 and 200),
 candidate_kind text not null check(candidate_kind in
   ('technique','family','variant','surface','anatomy','poomsae','poomsae_step','terminology','alias','relation','media')),
 matched_term_id uuid references public.technical_terms(id) on delete restrict,
 raw_payload jsonb not null check(jsonb_typeof(raw_payload)='object' and octet_length(raw_payload::text)<=200000),
 created_at timestamptz not null default clock_timestamp(),
 unique(batch_id,record_key)
);
create index knowledge_candidates_term_idx on knowledge_research.candidates(matched_term_id);
create table knowledge_research.field_evidence (
 id uuid primary key default gen_random_uuid(),
 candidate_id uuid not null references knowledge_research.candidates(id) on delete restrict,
 field_name text not null check(field_name ~ '^[a-z][a-z0-9_]{0,79}$'),
 observed_value jsonb not null check(octet_length(observed_value::text)<=100000),
 source_id uuid not null references public.content_sources(id) on delete restrict,
 source_snapshot jsonb not null check(jsonb_typeof(source_snapshot)='object'),
 source_locator text not null check(length(btrim(source_locator)) between 1 and 2000),
 evidence_note text check(evidence_note is null or length(evidence_note)<=4000),
 created_at timestamptz not null default clock_timestamp()
);
create index knowledge_evidence_candidate_idx on knowledge_research.field_evidence(candidate_id,field_name);
create index knowledge_evidence_source_idx on knowledge_research.field_evidence(source_id);
create table knowledge_research.change_proposals (
 id uuid primary key default gen_random_uuid(),
 candidate_id uuid not null references knowledge_research.candidates(id) on delete restrict,
 target_term_id uuid references public.technical_terms(id) on delete restrict,
 supersedes_id uuid references knowledge_research.change_proposals(id) on delete restrict,
 patch jsonb not null check(jsonb_typeof(patch)='object' and patch<>'{}'::jsonb and octet_length(patch::text)<=100000),
 rationale text not null check(length(btrim(rationale)) between 1 and 4000),
 created_at timestamptz not null default clock_timestamp(),
 check(supersedes_id is null or supersedes_id<>id)
);
create index knowledge_proposals_candidate_idx on knowledge_research.change_proposals(candidate_id);
create index knowledge_proposals_term_idx on knowledge_research.change_proposals(target_term_id);
create index knowledge_proposals_supersedes_idx on knowledge_research.change_proposals(supersedes_id);
-- Registro editorial administrado por conexão confiável; não deriva de user_metadata.
create table knowledge_research.human_reviewers (
 user_id uuid primary key references auth.users(id) on delete restrict,
 active boolean not null default true,
 created_at timestamptz not null default clock_timestamp()
);
create table knowledge_research.human_approvals (
 id uuid primary key default gen_random_uuid(),
 proposal_id uuid not null references knowledge_research.change_proposals(id) on delete restrict,
 decision text not null check(decision in ('approve','reject','needs_changes')),
 reviewer_id uuid not null default auth.uid() references knowledge_research.human_reviewers(user_id) on delete restrict,
 rationale text not null check(length(btrim(rationale)) between 1 and 4000),
 created_at timestamptz not null default clock_timestamp()
);
create index knowledge_approvals_proposal_idx on knowledge_research.human_approvals(proposal_id);
create index knowledge_approvals_reviewer_idx on knowledge_research.human_approvals(reviewer_id);
create table knowledge_research.editorial_events (
 id bigint generated always as identity primary key,
 entity_kind text not null,
 entity_id uuid not null,
 action text not null check(action in ('INSERT','UPDATE','DELETE')),
 actor_kind text not null check(actor_kind in ('automation','human')),
 actor_user_id uuid references auth.users(id) on delete restrict,
 snapshot jsonb not null check(jsonb_typeof(snapshot)='object'),
 previous_snapshot jsonb check(previous_snapshot is null or jsonb_typeof(previous_snapshot)='object'),
 created_at timestamptz not null default clock_timestamp(),
 check((actor_kind='human')=(actor_user_id is not null))
);
create index knowledge_events_entity_idx on knowledge_research.editorial_events(entity_kind,entity_id,id);
create index knowledge_events_actor_idx on knowledge_research.editorial_events(actor_user_id);

create function knowledge_research.require_human_reviewer() returns uuid
language plpgsql security invoker set search_path='' as $$
declare reviewer uuid := auth.uid();
begin
 if reviewer is null then raise exception 'A decisão exige identidade autenticada'; end if;
 if not exists(select 1 from knowledge_research.human_reviewers r where r.user_id=reviewer and r.active)
 then raise exception 'A decisão exige revisor ativo'; end if;
 return reviewer;
end $$;

-- Fotografia bibliográfica obtida do documento canônico, nunca do payload recebido.
-- A correção posterior de content_sources não reescreve a proveniência já capturada.
create function knowledge_research.capture_evidence_source() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 select to_jsonb(source) into strict new.source_snapshot from public.content_sources source where source.id=new.source_id;
 return new;
end $$;
create trigger knowledge_evidence_source before insert on knowledge_research.field_evidence
 for each row execute function knowledge_research.capture_evidence_source();

create function knowledge_research.guard_human_approval() returns trigger
language plpgsql security invoker set search_path='' as $$
declare reviewer uuid := knowledge_research.require_human_reviewer(); proposal knowledge_research.change_proposals;
begin
 if new.reviewer_id is not null and new.reviewer_id<>reviewer
 then raise exception 'Identidade de revisor divergente da identidade autenticada'; end if;
 new.reviewer_id := reviewer;
 new.created_at := clock_timestamp();
 select * into strict proposal from knowledge_research.change_proposals where id=new.proposal_id;
 if new.decision='approve' and exists (
   select 1 from jsonb_each(proposal.patch) field
   where not exists(select 1 from knowledge_research.field_evidence e
     where e.candidate_id=proposal.candidate_id and e.field_name=field.key and e.observed_value=field.value)
 ) then raise exception 'A aprovação exige evidência correspondente a cada campo'; end if;
 return new;
end $$;
create trigger knowledge_human_approval before insert on knowledge_research.human_approvals
 for each row execute function knowledge_research.guard_human_approval();

create function knowledge_research.reject_mutation() returns trigger
language plpgsql security invoker set search_path='' as $$
begin raise exception 'Registro editorial imutável: acrescente nova evidência, proposta ou decisão'; end $$;

create function knowledge_research.record_editorial_event() returns trigger
language plpgsql security invoker set search_path='' as $$
declare actor uuid := auth.uid(); payload jsonb; previous jsonb;
begin
 if tg_op='DELETE' then payload:=to_jsonb(old); else payload:=to_jsonb(new); end if;
 if tg_op='UPDATE' then previous:=to_jsonb(old); end if;
 insert into knowledge_research.editorial_events(entity_kind,entity_id,action,actor_kind,actor_user_id,snapshot,previous_snapshot)
 values(tg_table_name,coalesce(payload->>'id',payload->>'term_id')::uuid,tg_op,
   case when actor is null then 'automation' else 'human' end,actor,payload,previous);
 return null;
end $$;

-- Sem políticas ou grants no esquema privado. RLS acrescenta proteção caso alguém
-- conceda privilégios acidentalmente; acesso editorial exige desenho de servidor futuro.
do $$
declare relation_name text;
begin
 foreach relation_name in array array['import_batches','candidates','field_evidence','change_proposals','human_reviewers','human_approvals','editorial_events'] loop
  execute format('alter table knowledge_research.%I enable row level security',relation_name);
  if relation_name<>'human_reviewers' then
   execute format('create trigger knowledge_immutable_rows before update or delete on knowledge_research.%I for each row execute function knowledge_research.reject_mutation()',relation_name);
   execute format('create trigger knowledge_immutable_truncate before truncate on knowledge_research.%I for each statement execute function knowledge_research.reject_mutation()',relation_name);
  end if;
  if relation_name not in ('editorial_events','human_reviewers') then
   execute format('create trigger knowledge_audit_insert after insert on knowledge_research.%I for each row execute function knowledge_research.record_editorial_event()',relation_name);
  end if;
 end loop;
end $$;
revoke all on all tables in schema knowledge_research from public,anon,authenticated;
revoke all on all sequences in schema knowledge_research from public,anon,authenticated;
revoke all on all functions in schema knowledge_research from public,anon,authenticated;

-- Novas classes continuam na identidade canônica existente, sem criar outro catálogo.
alter table public.technical_terms drop constraint technical_terms_record_kind_check;
alter table public.technical_terms add constraint technical_terms_record_kind_check
 check(record_kind in ('technique','family','variant','surface','anatomy','poomsae','terminology'));

create table public.poomsae_forms (
 term_id uuid primary key references public.technical_terms(id) on delete restrict,
 sequence_version text not null check(length(btrim(sequence_version)) between 1 and 120),
 source_id uuid not null references public.content_sources(id) on delete restrict,
 source_locator text not null check(length(btrim(source_locator)) between 1 and 2000),
 publication_status text not null default 'draft' check(publication_status in ('draft','published','retired')),
 checked_at timestamptz,
 approved_by uuid references knowledge_research.human_reviewers(user_id) on delete restrict,
 approved_at timestamptz,
 created_at timestamptz not null default clock_timestamp(),
 check(publication_status<>'published' or (checked_at is not null and approved_by is not null and approved_at is not null))
);
create index poomsae_forms_source_idx on public.poomsae_forms(source_id);
create index poomsae_forms_reviewer_idx on public.poomsae_forms(approved_by);
create table public.poomsae_steps (
 id uuid primary key default gen_random_uuid(),
 poomsae_term_id uuid not null references public.poomsae_forms(term_id) on delete restrict,
 step_number integer not null check(step_number>0),
 technique_term_id uuid not null references public.technical_terms(id) on delete restrict,
 instruction_pt text check(instruction_pt is null or length(btrim(instruction_pt)) between 1 and 4000),
 source_id uuid not null references public.content_sources(id) on delete restrict,
 source_locator text not null check(length(btrim(source_locator)) between 1 and 2000),
 publication_status text not null default 'draft' check(publication_status in ('draft','published','retired')),
 checked_at timestamptz,
 approved_by uuid references knowledge_research.human_reviewers(user_id) on delete restrict,
 approved_at timestamptz,
 created_at timestamptz not null default clock_timestamp(),
 unique(poomsae_term_id,step_number),
 check(publication_status<>'published' or (checked_at is not null and approved_by is not null and approved_at is not null))
);
create index poomsae_steps_technique_idx on public.poomsae_steps(technique_term_id);
create index poomsae_steps_source_idx on public.poomsae_steps(source_id);
create index poomsae_steps_reviewer_idx on public.poomsae_steps(approved_by);

create function knowledge_research.guard_poomsae() returns trigger
language plpgsql security invoker set search_path='' as $$
declare reviewer uuid;
begin
 if tg_table_name='poomsae_forms' then
  if not exists(select 1 from public.technical_terms t where t.id=new.term_id and t.record_kind='poomsae')
  then raise exception 'A forma exige termo canônico do tipo poomsae'; end if;
 else
  if not exists(select 1 from public.technical_terms t where t.id=new.technique_term_id and t.record_kind in ('technique','variant'))
  then raise exception 'O passo exige técnica ou variante executável'; end if;
 end if;
 if new.publication_status='published' then
  reviewer:=knowledge_research.require_human_reviewer();
  if new.approved_by is not null and new.approved_by<>reviewer
    and (tg_op='INSERT' or new.approved_by is distinct from old.approved_by)
  then raise exception 'Identidade de revisor divergente da identidade autenticada'; end if;
  if new.checked_at is null or new.checked_at>clock_timestamp()
  then raise exception 'Publicação exige fonte conferida em data válida'; end if;
  new.approved_by:=reviewer;
  new.approved_at:=clock_timestamp();
 else
  if tg_op='INSERT' and (new.approved_by is not null or new.approved_at is not null)
  then raise exception 'Rascunho não aceita assinatura de aprovação'; end if;
  new.approved_by:=null;
  new.approved_at:=null;
 end if;
 return new;
end $$;
revoke all on function knowledge_research.guard_poomsae() from public,anon,authenticated;
create trigger poomsae_form_guard before insert or update on public.poomsae_forms
 for each row execute function knowledge_research.guard_poomsae();
create trigger poomsae_step_guard before insert or update on public.poomsae_steps
 for each row execute function knowledge_research.guard_poomsae();
create trigger poomsae_form_history after insert or update or delete on public.poomsae_forms
 for each row execute function knowledge_research.record_editorial_event();
create trigger poomsae_step_history after insert or update or delete on public.poomsae_steps
 for each row execute function knowledge_research.record_editorial_event();
create trigger poomsae_form_no_truncate before truncate on public.poomsae_forms
 for each statement execute function knowledge_research.reject_mutation();
create trigger poomsae_step_no_truncate before truncate on public.poomsae_steps
 for each statement execute function knowledge_research.reject_mutation();

alter table public.poomsae_forms enable row level security;
alter table public.poomsae_steps enable row level security;
revoke all on public.poomsae_forms,public.poomsae_steps from public,anon,authenticated;
-- Identidades e anotações editoriais privadas não integram a projeção pública.
grant select(term_id,sequence_version,source_id,source_locator,publication_status,checked_at,approved_at,created_at)
 on public.poomsae_forms to anon,authenticated;
grant select(id,poomsae_term_id,step_number,technique_term_id,instruction_pt,source_id,source_locator,publication_status,checked_at,approved_at,created_at)
 on public.poomsae_steps to anon,authenticated;
create policy poomsae_forms_published on public.poomsae_forms for select to anon,authenticated using (
 publication_status='published'
 and exists(select 1 from public.technical_terms t where t.id=poomsae_forms.term_id and t.record_kind='poomsae' and t.publication_status='published')
);
create policy poomsae_steps_published on public.poomsae_steps for select to anon,authenticated using (
 publication_status='published'
 and exists(select 1 from public.poomsae_forms f where f.term_id=poomsae_steps.poomsae_term_id and f.publication_status='published')
 and exists(select 1 from public.technical_terms t where t.id=poomsae_steps.technique_term_id and t.record_kind in ('technique','variant') and t.publication_status='published')
);

-- A existência é avaliada com a RLS de cada vínculo: relações exigem dois termos
-- publicados; atlas exige termo e região publicados; formas/passos têm seus gates.
-- A correlação pelo documento preserva o isolamento das fontes privadas da pesquisa.
create policy "Documentos de vínculos publicados" on public.content_sources
 for select to anon,authenticated using (
 exists(select 1 from public.poomsae_forms f where f.source_id=content_sources.id)
 or exists(select 1 from public.poomsae_steps s where s.source_id=content_sources.id)
 or exists(select 1 from public.term_relations r where r.source_id=content_sources.id)
 or exists(select 1 from public.body_region_terms b where b.source_id=content_sources.id)
);
alter policy "Restringir documentos aos vínculos públicos" on public.content_sources using (
 exists(select 1 from public.term_sources ts join public.technical_terms t on t.id=ts.term_id
   where ts.source_id=content_sources.id and t.publication_status='published')
 or exists(select 1 from public.poomsae_forms f where f.source_id=content_sources.id)
 or exists(select 1 from public.poomsae_steps s where s.source_id=content_sources.id)
 or exists(select 1 from public.term_relations r where r.source_id=content_sources.id)
 or exists(select 1 from public.body_region_terms b where b.source_id=content_sources.id)
);

-- Nenhuma política de escrita, endpoint editorial, promoção de proposta ou seed.
