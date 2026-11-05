-- Extensão do catálogo público e integridade de fontes; nenhuma técnica é importada.
create table public.body_regions (
 id uuid primary key default gen_random_uuid(),
 slug text not null unique,
 region_group text not null check (region_group in ('hands','feet','head','torso')),
 name_pt text not null,
 publication_status text not null default 'draft'
   check (publication_status in ('draft','published','retired')),
 created_at timestamptz not null default now()
);

create table public.body_region_terms (
 region_id uuid not null references public.body_regions(id) on delete cascade,
 term_id uuid not null references public.technical_terms(id) on delete cascade,
 usage_context text not null
   check (usage_context in ('surface','target','movement','other')),
 primary key (region_id,term_id,usage_context)
);

create table public.term_media (
 id uuid primary key default gen_random_uuid(),
 term_id uuid not null references public.technical_terms(id) on delete cascade,
 media_kind text not null check (media_kind in ('image','video','audio')),
 media_url text not null check (media_url ~* '^https://'),
 caption_pt text,
 rights_status text not null default 'needs_review'
   check (rights_status in ('needs_review','permission_confirmed','authorized_embed')),
 publication_status text not null default 'draft'
   check (publication_status in ('draft','published','retired')),
 created_at timestamptz not null default now(),
 constraint media_rights_to_publish
   check (publication_status <> 'published' or rights_status <> 'needs_review')
);

create index body_regions_public_idx on public.body_regions (publication_status,region_group);
create index body_region_terms_term_idx on public.body_region_terms (term_id);
create index term_media_public_idx on public.term_media (term_id,publication_status);

alter table public.body_regions enable row level security;
alter table public.body_region_terms enable row level security;
alter table public.term_media enable row level security;

revoke all on public.body_regions,public.body_region_terms,public.term_media from anon,authenticated;
grant select on public.body_regions,public.body_region_terms,public.term_media to anon,authenticated;

create policy "Regioes publicadas" on public.body_regions
 for select to anon,authenticated using (publication_status='published');

create policy "Tecnicas publicadas associadas a regioes" on public.body_region_terms
 for select to anon,authenticated using (
   exists(select 1 from public.body_regions r where r.id=region_id and r.publication_status='published')
   and exists(select 1 from public.technical_terms t where t.id=term_id and t.publication_status='published')
 );

create policy "Midias publicadas" on public.term_media
 for select to anon,authenticated using (
   publication_status='published'
   and exists(select 1 from public.technical_terms t where t.id=term_id and t.publication_status='published')
 );

-- Constraint trigger diferido permite substituir a fonte na mesma transação.
create function public.assert_published_term_keeps_source()
 returns trigger language plpgsql set search_path = '' as $$
begin
 if exists (
   select 1 from public.technical_terms t
   where t.id = old.term_id and t.publication_status='published'
 )
 and not exists (
   select 1 from public.term_sources s
   where s.term_id = old.term_id and s.checked_at is not null
 ) then
   raise exception 'Termo publicado nao pode ficar sem fonte conferida';
 end if;
 return null;
end
$$;

create constraint trigger published_term_source_integrity
 after update or delete on public.term_sources
 deferrable initially deferred for each row
 execute function public.assert_published_term_keeps_source();

revoke execute on function public.assert_published_term_keeps_source()
 from public,anon,authenticated;

alter table public.term_sources
 add constraint source_locator_nonempty check(length(btrim(source_locator)) > 0);
