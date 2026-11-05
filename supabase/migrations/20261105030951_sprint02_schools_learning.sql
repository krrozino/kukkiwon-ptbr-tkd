-- Sprint 02: proposta aditiva. Aplicar remotamente somente após aprovação.
alter table public.technical_terms add column pronunciation_status text not null default 'unverified' check(pronunciation_status in ('unverified','provisional','verified'));
alter table public.technical_terms add column pronunciation_notes text;
alter table public.technical_terms add column pronunciation_audio_url text check(pronunciation_audio_url ~ '^https://');
alter table public.technical_terms add column pronunciation_audio_kind text check(pronunciation_audio_kind in ('human','synthetic'));
create table public.schools(
 id uuid primary key default gen_random_uuid(),owner_user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 name text not null check(length(trim(name)) between 2 and 120),slug text not null unique check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug)<=120),
 created_at timestamptz not null default now(),unique(id,owner_user_id)
);
create table public.school_curricula(
 id uuid primary key default gen_random_uuid(),school_id uuid not null,owner_user_id uuid not null default auth.uid(),
 title text not null check(length(trim(title)) between 1 and 120),content jsonb not null check(jsonb_typeof(content)='object' and octet_length(content::text)<=200000),
 visibility text not null default 'private' check(visibility in ('private','public')),updated_at timestamptz not null default clock_timestamp(),
 foreign key(school_id,owner_user_id) references public.schools(id,owner_user_id) on delete cascade
);
create table public.school_terms(
 id uuid primary key default gen_random_uuid(),school_id uuid not null,owner_user_id uuid not null default auth.uid(),
 title text not null check(length(trim(title)) between 1 and 120),description text not null default '',hangul text,romanization text,
 visibility text not null default 'private' check(visibility in ('private','public')),
 foreign key(school_id,owner_user_id) references public.schools(id,owner_user_id) on delete cascade
);
create table public.school_media(
 id uuid primary key default gen_random_uuid(),school_id uuid not null,owner_user_id uuid not null default auth.uid(),
 title text not null check(length(trim(title)) between 1 and 120),description text not null default '',term_slug text,creator text not null check(length(trim(creator))>0),
 media_kind text not null check(media_kind in ('video','image')),media_url text not null check(media_url ~ '^https://[^/@]+(/|$)' and media_url !~ '[[:space:]]'),
 caption text not null default '',credits text not null default '',permission_note text not null check(length(trim(permission_note))>0),
 rights_confirmed boolean not null default false,consent_confirmed boolean not null default false,
 visibility text not null default 'private' check(visibility in ('private','public')),
 check(visibility<>'public' or (rights_confirmed and consent_confirmed)),
 foreign key(school_id,owner_user_id) references public.schools(id,owner_user_id) on delete cascade
);
create index schools_owner_idx on public.schools(owner_user_id);
create index school_curricula_school_idx on public.school_curricula(school_id,owner_user_id);
create index school_curricula_owner_idx on public.school_curricula(owner_user_id);
create index school_terms_school_idx on public.school_terms(school_id,owner_user_id);
create index school_terms_owner_idx on public.school_terms(owner_user_id);
create index school_media_school_idx on public.school_media(school_id,owner_user_id);
create index school_media_owner_idx on public.school_media(owner_user_id);
create index school_media_term_idx on public.school_media(term_slug) where visibility='public';
create function public.curriculum_timestamp() returns trigger language plpgsql set search_path='' as $$begin new.updated_at=clock_timestamp();return new;end;$$;
revoke execute on function public.curriculum_timestamp() from public,anon,authenticated;
create trigger curriculum_timestamp before update on public.school_curricula for each row execute function public.curriculum_timestamp();
alter table public.schools enable row level security;
alter table public.school_curricula enable row level security;
alter table public.school_terms enable row level security;
alter table public.school_media enable row level security;
revoke all on public.schools,public.school_curricula,public.school_terms,public.school_media from anon,authenticated;
grant select,insert,update,delete on public.schools,public.school_curricula,public.school_terms,public.school_media to authenticated;
grant select(id,name,slug) on public.schools to anon;
grant select(id,school_id,title,content,visibility,updated_at) on public.school_curricula to anon;
grant select(id,school_id,title,description,hangul,romanization,visibility) on public.school_terms to anon;
-- Evidências de permissão e identificadores de conta não fazem parte da API anônima.
grant select(id,school_id,title,description,term_slug,creator,media_kind,media_url,caption,credits,visibility) on public.school_media to anon;
create policy schools_owner on public.schools for all to authenticated using(owner_user_id=(select auth.uid())) with check(owner_user_id=(select auth.uid()));
create policy schools_shared_name on public.schools for select to anon using(exists(select 1 from public.school_curricula c where c.school_id=schools.id and c.visibility='public'));
create policy curricula_owner on public.school_curricula for all to authenticated using(owner_user_id=(select auth.uid())) with check(owner_user_id=(select auth.uid()));
create policy curricula_shared on public.school_curricula for select to anon using(visibility='public');
create policy terms_owner on public.school_terms for all to authenticated using(owner_user_id=(select auth.uid())) with check(owner_user_id=(select auth.uid()));
create policy terms_shared on public.school_terms for select to anon using(visibility='public');
create policy media_owner on public.school_media for all to authenticated using(owner_user_id=(select auth.uid())) with check(owner_user_id=(select auth.uid()));
-- A leitura compartilhada usa o cliente público sem token de sessão, com GRANT por coluna.
-- Assim outra conta autenticada não ganha acesso às evidências privadas por possuir SELECT completo.
create policy media_shared on public.school_media for select to anon using(visibility='public' and rights_confirmed and consent_confirmed);
