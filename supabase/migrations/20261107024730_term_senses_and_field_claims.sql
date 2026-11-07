-- Issue #42. Proposta aditiva NÃO aplicada remotamente; nenhum seed/publicação.
-- CLI Supabase indisponível; arquivo criado localmente sem instalar ferramentas.
-- Depende de 20261106152500_knowledge_research_and_poomsae.sql (também proposta).

create table public.term_senses (
 id uuid primary key default gen_random_uuid(),
 term_id uuid not null references public.technical_terms(id) on delete restrict,
 sense_kind text not null check(sense_kind in ('literal','technical','contextual','historical','regional')),
 language_tag text not null check(length(language_tag)<=63 and language_tag ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$'),
 usage_context text not null check(length(btrim(usage_context))>0 and length(usage_context)<=2000),
 meaning text not null check(length(btrim(meaning))>0 and length(meaning)<=4000),
 evidence_id uuid not null references knowledge_research.field_evidence(id) on delete restrict,
 source_id uuid not null references public.content_sources(id) on delete restrict,
 source_locator text not null check(length(btrim(source_locator))>0 and length(source_locator)<=2000),
 source_snapshot jsonb not null check(jsonb_typeof(source_snapshot)='object'),
 editorial_status text not null default 'research' check(editorial_status in ('research','document_checked','technical_reviewed')),
 publication_status text not null default 'draft' check(publication_status in ('draft','published','retired')),
 checked_at timestamptz,
 approved_by uuid references knowledge_research.human_reviewers(user_id) on delete restrict,
 approved_at timestamptz,
 created_at timestamptz not null default clock_timestamp(),
 unique(id,term_id),
 check(publication_status<>'published' or editorial_status='technical_reviewed'),
 check((editorial_status='technical_reviewed')=(approved_by is not null and approved_at is not null))
);

create table public.term_field_claims (
 id uuid primary key default gen_random_uuid(),
 term_id uuid not null references public.technical_terms(id) on delete restrict,
 sense_id uuid,
 field_name text not null check(field_name in ('hangul','romanization','pronunciation_pt','translation_pt',
   'definition_pt','literal_meaning','technical_meaning','context','variant','distinction','region')),
 value text not null check(length(btrim(value))>0 and length(value)<=4000),
 language_tag text not null check(length(language_tag)<=63 and language_tag ~ '^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$'),
 usage_context text not null check(length(btrim(usage_context))>0 and length(usage_context)<=2000),
 variant_kind text check(variant_kind in ('documented_spelling','historical_romanization','regional_translation','synonym')),
 related_term_id uuid references public.technical_terms(id) on delete restrict,
 region_id uuid,
 region_usage_context text,
 evidence_id uuid not null references knowledge_research.field_evidence(id) on delete restrict,
 source_id uuid not null references public.content_sources(id) on delete restrict,
 source_locator text not null check(length(btrim(source_locator))>0 and length(source_locator)<=2000),
 source_snapshot jsonb not null check(jsonb_typeof(source_snapshot)='object'),
 editorial_status text not null default 'research' check(editorial_status in ('research','document_checked','technical_reviewed')),
 publication_status text not null default 'draft' check(publication_status in ('draft','published','retired')),
 checked_at timestamptz,
 approved_by uuid references knowledge_research.human_reviewers(user_id) on delete restrict,
 approved_at timestamptz,
 created_at timestamptz not null default clock_timestamp(),
 foreign key(sense_id,term_id) references public.term_senses(id,term_id) on delete restrict,
 foreign key(region_id,term_id,region_usage_context)
   references public.body_region_terms(region_id,term_id,usage_context) on delete restrict,
 check((region_id is null)=(region_usage_context is null)),
 check(region_id is null or field_name='region'),
 check(related_term_id is null or (field_name='distinction' and related_term_id<>term_id)),
 check(variant_kind is null or field_name in ('romanization','translation_pt','variant')),
 check(publication_status<>'published' or editorial_status='technical_reviewed'),
 check((editorial_status='technical_reviewed')=(approved_by is not null and approved_at is not null))
);

create index term_senses_term_idx on public.term_senses(term_id,publication_status);
create index term_senses_evidence_idx on public.term_senses(evidence_id);
create index term_senses_source_idx on public.term_senses(source_id);
create index term_senses_reviewer_idx on public.term_senses(approved_by);
create index term_claims_term_idx on public.term_field_claims(term_id,field_name,publication_status);
create index term_claims_sense_idx on public.term_field_claims(sense_id,term_id);
create index term_claims_evidence_idx on public.term_field_claims(evidence_id);
create index term_claims_source_idx on public.term_field_claims(source_id);
create index term_claims_reviewer_idx on public.term_field_claims(approved_by);
create index term_claims_related_idx on public.term_field_claims(related_term_id);
create index term_claims_region_idx on public.term_field_claims(region_id,term_id,region_usage_context);

-- Mesmo contrato de URL do cliente (HTTPS sem credenciais), com sintaxe SQL
-- conservadora: host DNS com TLD alfabético (sem IP), porta válida,
-- sem espaços, controles ou backslash.
-- O documento canônico não ganha permissões novas; só a projeção é publicada.
create function knowledge_research.guard_term_semantics() returns trigger
language plpgsql security invoker set search_path='' as $$
declare
 evidence knowledge_research.field_evidence;
 expected_field text;
 expected_value text;
 reviewer uuid;
 url text;
 port text;
begin
 if tg_op='INSERT' then new.created_at:=clock_timestamp(); else new.created_at:=old.created_at; end if;
 if new.evidence_id is null then raise exception 'Afirmação exige evidência individual'; end if;
 select * into strict evidence from knowledge_research.field_evidence where id=new.evidence_id;
 if tg_table_name='term_senses' then
  expected_field:=new.sense_kind||'_meaning'; expected_value:=new.meaning;
 else
  expected_field:=new.field_name; expected_value:=new.value;
 end if;
 if evidence.field_name<>expected_field or evidence.observed_value<>to_jsonb(expected_value)
   or not exists(select 1 from knowledge_research.candidates c
     where c.id=evidence.candidate_id and c.matched_term_id=new.term_id)
 then raise exception 'Evidência deve corresponder ao termo, campo e valor exatos'; end if;
 -- Whitelist: não copiar identidade, notas privadas ou futuras colunas do documento.
 new.source_id:=evidence.source_id;
 new.source_locator:=evidence.source_locator;
 new.source_snapshot:=jsonb_build_object(
  'institution',evidence.source_snapshot->'institution',
  'title',evidence.source_snapshot->'title',
  'edition',evidence.source_snapshot->'edition',
  'publication_year',evidence.source_snapshot->'publication_year',
  'official_url',evidence.source_snapshot->'official_url');
 url:=new.source_snapshot->>'official_url';
 port:=substring(url from '^https://[^/:?#]+:([0-9]+)');
 if coalesce(length(btrim(new.source_snapshot->>'institution')),0)=0
   or length(new.source_snapshot->>'institution')>4000
   or coalesce(length(btrim(new.source_snapshot->>'title')),0)=0
   or length(new.source_snapshot->>'title')>4000
   or (new.source_snapshot->>'edition' is not null and
     (length(btrim(new.source_snapshot->>'edition'))=0 or length(new.source_snapshot->>'edition')>4000))
   or (new.source_snapshot->>'publication_year' is not null and
     (new.source_snapshot->>'publication_year')::integer not between 1 and 9999)
   or url is null
   or length(url)>8000
   or url !~ '^https://([A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,63}(:[0-9]{1,5})?([/?#][^[:space:]\\]*)?$'
   or url ~ '[[:cntrl:]]'
   or (port is not null and port::numeric>65535)
 then raise exception 'Bibliografia exige instituição, título e URL HTTPS segura sem credenciais'; end if;
 if (new.checked_at is not null and new.checked_at>clock_timestamp())
   or (new.editorial_status<>'research' and new.checked_at is null)
 then raise exception 'Estado editorial exige conferência em data válida'; end if;
 if new.editorial_status='technical_reviewed' then
  reviewer:=knowledge_research.require_human_reviewer();
  if new.approved_by is not null and new.approved_by<>reviewer
    and (tg_op='INSERT' or new.approved_by is distinct from old.approved_by)
  then raise exception 'Identidade de revisor divergente da identidade autenticada'; end if;
  new.approved_by:=reviewer; new.approved_at:=clock_timestamp();
 else
  if tg_op='INSERT' and (new.approved_by is not null or new.approved_at is not null)
  then raise exception 'Pesquisa não aceita assinatura de aprovação'; end if;
  new.approved_by:=null; new.approved_at:=null;
 end if;
 return new;
end $$;
revoke all on function knowledge_research.guard_term_semantics() from public,anon,authenticated;

do $$
declare relation_name text;
begin
 foreach relation_name in array array['term_senses','term_field_claims'] loop
  execute format('create trigger term_semantics_guard before insert or update on public.%I for each row execute function knowledge_research.guard_term_semantics()',relation_name);
  execute format('create trigger term_semantics_history after insert or update or delete on public.%I for each row execute function knowledge_research.record_editorial_event()',relation_name);
  execute format('create trigger term_semantics_no_truncate before truncate on public.%I for each statement execute function knowledge_research.reject_mutation()',relation_name);
  execute format('alter table public.%I enable row level security',relation_name);
  execute format('revoke all on public.%I from public,anon,authenticated',relation_name);
 end loop;
end $$;

-- Projeções explícitas. SELECT * não é permitido: evidence_id e approved_by privados.
grant select(id,term_id,sense_kind,language_tag,usage_context,meaning,source_id,source_locator,
 source_snapshot,editorial_status,publication_status,checked_at,approved_at,created_at)
 on public.term_senses to anon,authenticated;
grant select(id,term_id,sense_id,field_name,value,language_tag,usage_context,variant_kind,
 related_term_id,region_id,region_usage_context,source_id,source_locator,source_snapshot,
 editorial_status,publication_status,checked_at,approved_at,created_at)
 on public.term_field_claims to anon,authenticated;

create policy term_senses_published on public.term_senses for select to anon,authenticated using (
 publication_status='published' and editorial_status='technical_reviewed'
 and exists(select 1 from public.technical_terms t where t.id=term_senses.term_id and t.publication_status='published')
);
create policy term_field_claims_published on public.term_field_claims for select to anon,authenticated using (
 publication_status='published' and editorial_status='technical_reviewed'
 and exists(select 1 from public.technical_terms t where t.id=term_field_claims.term_id and t.publication_status='published')
 and (sense_id is null or exists(select 1 from public.term_senses s
   where s.id=term_field_claims.sense_id and s.term_id=term_field_claims.term_id and s.publication_status='published'))
 and (related_term_id is null or exists(select 1 from public.technical_terms t
   where t.id=term_field_claims.related_term_id and t.publication_status='published'))
 and (region_id is null or exists(select 1 from public.body_region_terms b
   where b.region_id=term_field_claims.region_id and b.term_id=term_field_claims.term_id
     and b.usage_context=term_field_claims.region_usage_context))
);

-- Sem alterações em tabelas/políticas legadas, currículos, Poomsae ou flags.
