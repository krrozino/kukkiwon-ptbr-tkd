-- Regiões corporais editoriais para futuro atlas; SEM publicação.
-- Termos conectados ao glossário Kukkiwon 2012. Todas as regiões ficam em draft.
begin;
insert into public.body_regions(slug,region_group,name_pt,publication_status)
values
 ('batangson','hands','Base da palma da mão','draft'),
 ('jumeok','hands','Punho fechado','draft'),
 ('sonbadak','hands','Palma da mão','draft'),
 ('sonnal','hands','Borda externa da mão','draft'),
 ('sonnaldeung','hands','Borda interna da mão','draft')
on conflict (slug) do nothing;
insert into public.body_region_terms(region_id,term_id,usage_context)
select r.id,t.id,'surface' from public.body_regions r
join public.technical_terms t on t.slug=r.slug
where r.region_group='hands' and r.slug in ('batangson','jumeok','sonbadak','sonnal','sonnaldeung')
on conflict do nothing;
commit;
