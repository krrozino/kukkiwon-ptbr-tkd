-- Sprint 03: applied to the dedicated Supabase after user approval on 2026-11-05.
alter table public.school_media alter column media_url drop not null;
alter table public.school_media add column storage_path text;
alter table public.school_media add column license_name text not null default '' check(length(license_name)<=200);
alter table public.school_media add constraint school_media_source check (
 (storage_path is null and media_url is not null) or
 (media_url is null and storage_path is not null and media_kind='image' and storage_path ~
  ('^' || school_id::text || '/[0-9a-f-]{36}\.(jpg|png|webp)$')
  and length(trim(license_name))>0 and rights_confirmed and consent_confirmed)
);
create unique index school_media_storage_path_idx on public.school_media(storage_path) where storage_path is not null;
grant select(storage_path,license_name) on public.school_media to anon;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('school-images','school-images',false,5242880,array['image/jpeg','image/png','image/webp']);

-- No upsert/UPDATE: uploads receive a fresh UUID; never overwrite another file.
create policy school_images_insert on storage.objects for insert to authenticated
with check(bucket_id='school-images' and exists(
 select 1 from public.schools s where s.id::text=split_part(storage.objects.name,'/',1)
 and s.owner_user_id=(select auth.uid())
) and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$');
create policy school_images_owner_read on storage.objects for select to authenticated
using(bucket_id='school-images' and exists(
 select 1 from public.schools s where s.id::text=split_part(storage.objects.name,'/',1)
 and s.owner_user_id=(select auth.uid())
));
create policy school_images_owner_delete on storage.objects for delete to authenticated
using(bucket_id='school-images' and exists(
 select 1 from public.schools s where s.id::text=split_part(storage.objects.name,'/',1)
 and s.owner_user_id=(select auth.uid())
));
-- Use download(), not public/signed URLs. Every new download rechecks sharing.
-- Revocation cannot remove copies already downloaded by an authorized reader.
create policy school_images_shared_read on storage.objects for select to anon
using(bucket_id='school-images' and exists(
 select 1 from public.school_media m
 where m.storage_path=storage.objects.name and m.visibility='public'
 -- school_media RLS already requires rights_confirmed and consent_confirmed.
 and exists(
  select 1 from public.school_curricula c
  where c.school_id=m.school_id and c.visibility='public'
  and jsonb_path_exists(c.content,'$.grades[*].requirements[*] ? (@.mediaId == $id)',jsonb_build_object('id',m.id::text))
 )
));
