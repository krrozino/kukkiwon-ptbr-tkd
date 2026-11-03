-- Migração aplicada ao projeto Supabase dedicado acbostnsohltuaegfkwl; revisar antes de reutilizar em outro ambiente.
create table public.content_sources (
 id uuid primary key default gen_random_uuid(),
 institution text not null, title text not null, edition text,
 publication_year integer, official_url text not null check(official_url ~* '^https://'),
 created_at timestamptz not null default now()
);
create table public.technical_terms (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique, category text not null,
 hangul text, romanization text not null,
 translation_pt text, definition_pt text, pronunciation_pt text,
 editorial_status text not null default 'research' check (editorial_status in ('research','document_checked','technical_reviewed')),
 publication_status text not null default 'draft' check (publication_status in ('draft','published','retired')),
 published_at timestamptz, created_at timestamptz not null default now(),
 constraint only_approved_published check (publication_status <> 'published' or (editorial_status = 'technical_reviewed' and published_at is not null))
);
create table public.term_sources (
 term_id uuid not null references public.technical_terms(id) on delete cascade,
 source_id uuid not null references public.content_sources(id) on delete restrict,
 source_locator text not null, checked_at timestamptz,
 primary key(term_id,source_id,source_locator)
);
create table public.term_aliases (
 id uuid primary key default gen_random_uuid(),
 term_id uuid not null references public.technical_terms(id) on delete cascade,
 alias text not null, alias_kind text not null check(alias_kind in ('historical','school_usage','search','alternate_romanization')),
 is_official boolean not null default false,
 unique(term_id,alias,alias_kind)
);
create function public.assert_verified_source()
returns trigger language plpgsql set search_path = '' as $$
begin
 if new.publication_status='published' and not exists (
  select 1 from public.term_sources s where s.term_id=new.id and s.checked_at is not null
 ) then raise exception 'A publicação exige fonte conferida'; end if;
 return new;
end;$$;
create trigger assert_verified_source_on_publish
before insert or update of publication_status,editorial_status on public.technical_terms
for each row execute function public.assert_verified_source();
revoke execute on function public.assert_verified_source() from public,anon,authenticated;
create index technical_terms_public_idx on public.technical_terms(publication_status,romanization);
create index term_sources_term_idx on public.term_sources(term_id);
create index term_aliases_term_idx on public.term_aliases(term_id);
alter table public.content_sources enable row level security;
alter table public.technical_terms enable row level security;
alter table public.term_sources enable row level security;
alter table public.term_aliases enable row level security;
revoke all on public.content_sources,public.technical_terms,public.term_sources,public.term_aliases from anon,authenticated;
grant select on public.content_sources,public.technical_terms,public.term_sources,public.term_aliases to anon,authenticated;
create policy "Termos publicados" on public.technical_terms for select to anon,authenticated using (publication_status='published');
create policy "Fontes dos termos publicados" on public.term_sources for select to anon,authenticated using (exists (select 1 from public.technical_terms t where t.id=term_id and t.publication_status='published'));
create policy "Documentos de termos publicados" on public.content_sources for select to anon,authenticated using (exists(select 1 from public.term_sources ts join public.technical_terms t on t.id=ts.term_id where ts.source_id=id and t.publication_status='published'));
create policy "Aliases de termos publicados" on public.term_aliases for select to anon,authenticated using (exists (select 1 from public.technical_terms t where t.id=term_id and t.publication_status='published'));
