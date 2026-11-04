-- Proposta aditiva, validada em PostgreSQL isolado. NÃO aplicada ao Supabase remoto.
create schema if not exists extensions;
create extension if not exists pg_trgm with schema extensions;

create function public.catalog_normalize(value text) returns text
language sql immutable strict parallel safe set search_path = ''
as $$
 select regexp_replace(
   translate(lower(normalize(value, NFC)),
     'áàâãäåéèêëíìîïóòôõöúùûüçñ', 'aaaaaaeeeeiiiiooooouuuucn'),
   '[[:space:]‐‑–—_-]+', '', 'g')
$$;
revoke all on function public.catalog_normalize(text) from public;
grant execute on function public.catalog_normalize(text) to anon,authenticated;

alter table public.technical_terms
 add column record_kind text not null default 'technique'
 check(record_kind in ('technique','family','variant','surface','anatomy')),
 add column search_text text generated always as (
   public.catalog_normalize(romanization || ' ' || coalesce(hangul,'') || ' ' ||
     coalesce(translation_pt,'') || ' ' || coalesce(pronunciation_pt,''))
 ) stored;
alter table public.term_aliases
 add column search_text text generated always as (public.catalog_normalize(alias)) stored;
create index technical_terms_search_idx on public.technical_terms using gin(search_text extensions.gin_trgm_ops);
create index term_aliases_search_idx on public.term_aliases using gin(search_text extensions.gin_trgm_ops);
create index technical_terms_page_idx on public.technical_terms(romanization collate "C",slug) where publication_status='published';
create index technical_terms_category_page_idx on public.technical_terms(category,romanization,slug) where publication_status='published';

-- Relações não implicam equivalência: família/variante são ligações direcionais com fonte.
create table public.term_relations (
 term_id uuid not null references public.technical_terms(id) on delete cascade,
 related_term_id uuid not null references public.technical_terms(id) on delete cascade,
 relation_kind text not null check(relation_kind in ('variant_of','related')),
 source_id uuid not null references public.content_sources(id) on delete restrict,
 source_locator text not null check(length(btrim(source_locator)) > 0),
 publication_status text not null default 'draft' check(publication_status in ('draft','published','retired')),
 checked_at timestamptz,
 primary key(term_id,related_term_id,relation_kind),
 check(term_id <> related_term_id),
 check(publication_status <> 'published' or checked_at is not null)
);
create index term_relations_parent_idx on public.term_relations(related_term_id,relation_kind);
alter table public.term_relations enable row level security;
revoke all on public.term_relations from anon,authenticated;
grant select on public.term_relations to anon,authenticated;
create policy "Relações revisadas entre termos publicados" on public.term_relations for select to anon,authenticated using (
 publication_status='published'
 and exists(select 1 from public.technical_terms t where t.id=term_id and t.publication_status='published')
 and exists(select 1 from public.technical_terms t where t.id=related_term_id and t.publication_status='published')
);

-- Coordenadas são escolhas gráficas editoriais, não nomenclatura anatômica oficial.
alter table public.body_regions
 add column atlas_area_override text check(atlas_area_override in ('hands','feet','head','torso','arms','legs')),
 add column atlas_area text generated always as (coalesce(atlas_area_override,region_group)) stored,
 add column detail_view text check(detail_view in ('front','back','both')),
 add column detail_x numeric check(detail_x between 5 and 95),
 add column detail_y numeric check(detail_y between 5 and 98);
create index body_regions_atlas_idx on public.body_regions(atlas_area,slug) where publication_status='published';
alter table public.body_region_terms
 add column anatomical_role text check(anatomical_role in ('surface','target','anatomy','movement')),
 add column source_id uuid references public.content_sources(id) on delete restrict,
 add column source_locator text check(source_locator is null or length(btrim(source_locator)) > 0);
alter table public.term_media
 add column creator text,
 add column license_name text,
 add column rights_evidence_url text check(rights_evidence_url is null or rights_evidence_url ~* '^https://'),
 add column rights_notes text;
alter table public.term_media add constraint published_media_rights_evidence
 check(publication_status <> 'published' or (
   length(btrim(coalesce(creator,''))) > 0
   and rights_evidence_url is not null
   and length(btrim(coalesce(license_name,rights_notes,''))) > 0
 )) not valid;

-- Serializa alterações de fontes do mesmo termo antes da verificação diferida.
create function public.lock_term_before_source_change() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
 perform 1 from public.technical_terms where id=old.term_id for update;
 if tg_op='DELETE' then return old; end if;
 return new;
end $$;
revoke all on function public.lock_term_before_source_change() from public,anon,authenticated;
create trigger lock_term_before_source_change
 before update or delete on public.term_sources for each row
 execute function public.lock_term_before_source_change();

create function public.search_catalog(
 search_query text default '', category_filter text default null, region_filter text default null,
 family_filter text default null, page_size integer default 24, page_offset integer default 0
) returns jsonb language plpgsql stable security invoker set search_path = '' as $$
declare needle text;
begin
 if page_size is null or page_size < 1 or page_size > 100 or page_offset is null or page_offset < 0
 then raise exception 'Paginação inválida'; end if;
 if length(coalesce(search_query,'')) > 200 then raise exception 'Busca muito longa'; end if;
 needle := '%' || replace(replace(replace(public.catalog_normalize(coalesce(search_query,'')), E'\\', E'\\\\'), '%', E'\\%'), '_', E'\\_') || '%';
 return (
 with filtered as materialized (
   select t.id,t.slug,t.category,t.hangul,t.romanization,t.translation_pt,t.pronunciation_pt,
          t.definition_pt,t.publication_status,t.record_kind
   from public.technical_terms t
   where t.publication_status='published'
   and (category_filter is null or t.category=category_filter)
   and (region_filter is null or exists(
     select 1 from public.body_region_terms br join public.body_regions r on r.id=br.region_id
     where br.term_id=t.id and r.slug=region_filter and r.publication_status='published'))
   and (family_filter is null or exists(
     select 1 from public.term_relations tr join public.technical_terms parent on parent.id=tr.related_term_id
     where tr.term_id=t.id and tr.relation_kind='variant_of' and tr.publication_status='published'
     and parent.slug=family_filter and parent.publication_status='published'))
   and (t.search_text like needle escape E'\\' or exists(
     select 1 from public.term_aliases a where a.term_id=t.id and a.search_text like needle escape E'\\'))
 ), page as (
   select f.*,coalesce((select jsonb_agg(jsonb_build_object('alias',a.alias,'alias_kind',a.alias_kind,'is_official',a.is_official) order by a.alias)
     from public.term_aliases a where a.term_id=f.id),'[]'::jsonb) as term_aliases
   from filtered f order by f.romanization collate "C",f.slug limit page_size offset page_offset
 )
 select jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(p) order by p.romanization collate "C",p.slug) from page p),'[]'::jsonb),
 'total',(select count(*) from filtered))
 );
end $$;
revoke all on function public.search_catalog(text,text,text,text,integer,integer) from public;
grant execute on function public.search_catalog(text,text,text,text,integer,integer) to anon,authenticated;

create function public.catalog_facets() returns jsonb
language sql stable security invoker set search_path = '' as $$
 select jsonb_build_object(
 'categories',coalesce((select jsonb_agg(category order by category) from
   (select distinct category from public.technical_terms where publication_status='published') c),'[]'::jsonb),
 'regions',coalesce((select jsonb_agg(jsonb_build_object('slug',slug,'name_pt',name_pt) order by name_pt)
   from public.body_regions where publication_status='published'),'[]'::jsonb),
 'families',coalesce((select jsonb_agg(jsonb_build_object('slug',slug,'romanization',romanization) order by romanization)
   from public.technical_terms where record_kind='family' and publication_status='published'),'[]'::jsonb)
 )
$$;
revoke all on function public.catalog_facets() from public;
grant execute on function public.catalog_facets() to anon,authenticated;
-- Não há carga de dados, mudança de status editorial ou política de escrita pública.
