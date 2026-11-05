do $smoke$
declare
 user_a uuid:=gen_random_uuid(); user_b uuid:=gen_random_uuid(); school_id uuid; curriculum_id uuid; media_id uuid; written integer; verified boolean:=false;
begin
 begin
  insert into auth.users(id) values(user_a),(user_b);
  perform set_config('request.jwt.claim.sub',user_a::text,true);
  set local role authenticated;
  insert into public.schools(name,slug) values('QA Sprint 02 temporária','qa-sprint02-'||user_a::text) returning id into school_id;
  insert into public.school_curricula(school_id,title,content) values(school_id,'QA temporário','{"title":"QA","description":"Teste transacional","grades":[]}') returning id into curriculum_id;
  insert into public.school_media(school_id,title,creator,media_kind,media_url,permission_note,rights_confirmed,consent_confirmed) values(school_id,'QA privada','QA','video','https://example.invalid/qa.mp4','Evidência privada QA',true,true) returning id into media_id;
  perform set_config('request.jwt.claim.sub',user_b::text,true);
  if exists(select 1 from public.school_curricula c where c.id=curriculum_id) then raise exception 'Outra conta leu currículo privado';end if;
  update public.schools s set name='Acesso indevido' where s.id=school_id;get diagnostics written=row_count;
  if written<>0 then raise exception 'Outra conta alterou escola';end if;
  begin
   insert into public.school_curricula(school_id,owner_user_id,title,content) values(school_id,user_a,'Falsificado','{}');
   raise exception 'Falsificação de responsável não foi bloqueada';
  exception when insufficient_privilege then null;end;
  perform set_config('request.jwt.claim.sub',user_a::text,true);
  update public.school_curricula c set visibility='public' where c.id=curriculum_id;
  set local role anon;
  perform set_config('request.jwt.claim.sub','',true);
  if not exists(select 1 from public.school_curricula c where c.id=curriculum_id) then raise exception 'Currículo público não ficou visível';end if;
  if exists(select 1 from public.school_media m where m.id=media_id) then raise exception 'Mídia privada ficou visível';end if;
  if not exists(select 1 from public.schools s where s.id=school_id) then raise exception 'Nome público da escola indisponível';end if;
  begin perform owner_user_id from public.schools limit 1;raise exception 'Identificador de conta exposto';exception when insufficient_privilege then null;end;
  begin perform permission_note from public.school_media limit 1;raise exception 'Evidência de consentimento exposta';exception when insufficient_privilege then null;end;
  set local role authenticated;
  perform set_config('request.jwt.claim.sub',user_a::text,true);
  update public.school_curricula c set visibility='private' where c.id=curriculum_id;
  set local role anon;
  perform set_config('request.jwt.claim.sub','',true);
  if exists(select 1 from public.school_curricula c where c.id=curriculum_id) then raise exception 'Revogação não removeu leitura pública';end if;
  reset role;
  verified:=true;
  raise exception using errcode='ZX001',message='Reverter fixtures após smoke aprovado';
 exception when sqlstate 'ZX001' then null;
 end;
 if not verified then raise exception 'Smoke não concluiu';end if;
 if exists(select 1 from auth.users where id in(user_a,user_b)) or exists(select 1 from public.schools s where s.id=school_id) then raise exception 'Fixtures não foram revertidas';end if;
end $smoke$;
