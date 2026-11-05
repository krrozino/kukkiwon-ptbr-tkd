-- Smoke test transacional: alterações ficam revertidas ao final.
begin;
insert into public.content_sources(institution,title,official_url)
values ('TEST_TRANSACTION','Temporary test source','https://example.org/not-public');
insert into public.technical_terms(slug,category,romanization)
values ('test-rollback-only','test','TEST ONLY');
insert into public.term_sources(term_id,source_id,source_locator,checked_at)
select t.id,s.id,'test-section',now()
from public.technical_terms t cross join public.content_sources s
where t.slug='test-rollback-only' and s.institution='TEST_TRANSACTION';
update public.technical_terms
set editorial_status='technical_reviewed',
    publication_status='published',
    published_at=now()
where slug='test-rollback-only';
do $$
declare blocked boolean := false;
begin
 begin
  delete from public.term_sources
  where term_id=(select id from public.technical_terms where slug='test-rollback-only');
  set constraints published_term_source_integrity immediate;
 exception when others then
  blocked := true;
 end;
 if not blocked then raise exception 'INTEGRITY FAIL: removed last source'; end if;
end $$;
rollback;

select
 has_table_privilege('anon','public.technical_terms','SELECT') as anon_can_select,
 has_table_privilege('anon','public.technical_terms','INSERT') as anon_can_insert,
 has_table_privilege('anon','public.technical_terms','UPDATE') as anon_can_update,
 has_table_privilege('anon','public.technical_terms','DELETE') as anon_can_delete;
