import { PGlite } from '@electric-sql/pglite';
import { pg_trgm } from '@electric-sql/pglite/contrib/pg_trgm';
import { beforeAll, afterAll, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { generateImportSql } from '../scripts/content.mjs';
import { storageSchema } from './helpers/storage-schema.mjs';
let db;
const expansion = JSON.parse(readFileSync(new URL('../content/review/kukkiwon-2012-expansion.json', import.meta.url)));
beforeAll(async () => {
  db = new PGlite({extensions:{pg_trgm}});
  await db.exec('create role anon; create role authenticated; grant usage on schema public to anon, authenticated;');
  await db.exec("create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;");
  await db.exec(storageSchema);
  for (const file of readdirSync('supabase/migrations').filter(f => f.endsWith('.sql')).sort()) {
    await db.exec(readFileSync('supabase/migrations/' + file, 'utf8'));
  }
});
afterAll(async () => { await db?.close(); });
beforeEach(async () => { await db.exec('reset role; begin;'); });
afterEach(async () => { await db.exec('rollback; reset role;'); });
async function published(slug, name = 'Técnica') {
  const {rows:[t]} = await db.query("insert into public.technical_terms(slug,category,romanization,hangul,translation_pt,editorial_status) values($1,'chute',$2,'앞차기','Chute à frente','technical_reviewed') returning id", [slug,name]);
  const {rows:[s]} = await db.query("insert into public.content_sources(institution,title,edition,official_url) values('Teste','Fixture isolada','teste','https://example.org/test') returning id");
  await db.query("insert into public.term_sources(term_id,source_id,source_locator,checked_at) values($1,$2,'§1 > Fixture',now())",[t.id,s.id]);
  await db.query("update public.technical_terms set publication_status='published',published_at=now() where id=$1",[t.id]);
  return t;
}
describe('PostgreSQL isolado: busca, permissões e fontes', () => {
  it('pagina além de 500 e filtra antes do limite, sem rascunhos', async () => {
    await published('ap-chagi', 'Ap-chagi');
    await db.exec(`insert into public.technical_terms(slug,category,romanization,editorial_status)
      select 'draft-'||n,'chute','Oculto '||n,'research' from generate_series(1,1100) n;`);
    // Published fixtures share a checked source, still exercising the real publication triggers.
    await db.exec(`insert into public.technical_terms(slug,category,romanization,editorial_status)
      select 'term-'||n,'chute','Termo '||lpad(n::text,4,'0'),'technical_reviewed' from generate_series(1,1100) n;
      insert into public.term_sources(term_id,source_id,source_locator,checked_at)
      select t.id,s.id,'§1 > Fixture',now() from public.technical_terms t cross join public.content_sources s where t.slug like 'term-%';
      update public.technical_terms set publication_status='published',published_at=now() where slug like 'term-%';
      set local role anon;`);
    const {rows:[r]} = await db.query("select public.search_catalog('',null,null,null,100,1000) as result");
    expect(r.result.total).toBe(1101);
    expect(r.result.items).toHaveLength(100);
    const {rows:[last]} = await db.query("select public.search_catalog('Termo 1100',null,null,null,24,0) as result");
    expect(last.result.total).toBe(1);
    expect(last.result.items[0].slug).toBe('term-1100');
    expect((await db.query('select count(*)::int n from public.technical_terms')).rows[0].n).toBe(1101);
    await expect(db.exec("insert into public.technical_terms(slug,category,romanization) values('evil','x','x')")).rejects.toThrow(/permission denied/);
  });
  it('busca português, Hangul normalizado, romanização e aliases literais', async () => {
    const t = await published('ap-chagi','Ap-chagi');
    await db.query("insert into public.term_aliases(term_id,alias,alias_kind) values($1,'Bênção','search')",[t.id]);
    await db.exec('set local role anon;');
    for (const q of ['a frente','apchagi','AP-CHAGI','앞차기','앞차기'.normalize('NFD'),'bencao']) {
      const {rows:[r]} = await db.query("select public.search_catalog($1,null,null,null,24,0) as result",[q]);
      expect(r.result.items.map(t => t.slug),q).toEqual(['ap-chagi']);
    }
    const {rows:[r]} = await db.query("select public.search_catalog('%',null,null,null,24,0) as result");
    expect(r.result.total).toBe(0);
  });
  it('bloqueia publicação sem fonte e remoção da última fonte conferida', async () => {
    const t = await published('protected');
    await db.query('delete from public.term_sources where term_id=$1',[t.id]);
    await expect(db.exec('set constraints all immediate')).rejects.toThrow(/fonte conferida/);
  });
  it('bloqueia publicação sem revisão técnica', async () => {
    await expect(db.exec("insert into public.technical_terms(slug,category,romanization,publication_status,published_at) values('bad','x','x','published',now())")).rejects.toThrow();
  });
  it('expõe somente o documento de uma técnica publicada, com correlação correta de RLS', async () => {
    await published('source-visible');
    await db.exec("insert into public.content_sources(institution,title,official_url) values('Private','Unpublished document','https://example.org/private'); set local role anon;");
    const {rows}=await db.query('select title from public.content_sources');
    expect(rows).toEqual([{title:'Fixture isolada'}]);
  });
  it('RLS protege regiões, mídias e relações de rascunhos', async () => {
    const a=await published('parent'), b=await published('variant');
    await db.query("insert into public.term_relations(term_id,related_term_id,relation_kind,source_id,source_locator,publication_status,checked_at) select $1,$2,'variant_of',id,'§1 > Fixture','published',now() from public.content_sources limit 1",[a.id,b.id]);
    await db.exec("insert into public.body_regions(slug,region_group,name_pt) values('private-region','hands','Privado'); set local role authenticated;");
    expect((await db.query('select count(*)::int n from public.body_regions')).rows[0].n).toBe(0);
    expect((await db.query('select count(*)::int n from public.term_relations')).rows[0].n).toBe(1);
    await db.exec('reset role;');
    await db.query("update public.technical_terms set publication_status='draft' where id=$1",[b.id]);
    await db.exec('set local role anon;');
    expect((await db.query('select count(*)::int n from public.term_relations')).rows[0].n).toBe(0);
    await expect(db.exec("select public.search_catalog('',null,null,null,501,0)")).rejects.toThrow();
  });
  it('nenhuma tabela de catálogo concede escrita pública; todas usam RLS', async () => {
    for(const role of ['anon','authenticated']) {
      const {rows}=await db.query(`select c.relname,c.relrowsecurity,
        has_table_privilege($1,c.oid,'INSERT,UPDATE,DELETE,TRUNCATE') as writable
        from pg_class c join pg_namespace n on n.oid=c.relnamespace
        where n.nspname='public' and c.relkind='r' and c.relname not in ('schools','school_curricula','school_terms','school_media')`,[role]);
      expect(rows).toHaveLength(8);
      expect(rows.every(r=>r.relrowsecurity&&!r.writable)).toBe(true);
    }
  });
  it('mídia publicada exige evidência de direitos e autoria', async () => {
    const t=await published('media-term');
    await expect(db.query("insert into public.term_media(term_id,media_kind,media_url,rights_status,publication_status) values($1,'video','https://example.org/video','authorized_embed','published')",[t.id])).rejects.toThrow();
  });
});
describe('SQL gerado executado em PostgreSQL', () => {
  it('importa duas vezes sem duplicar ou conferir fontes automaticamente', async () => {
    await db.exec('rollback;');
    const sql = generateImportSql(expansion);
    await db.exec(sql);
    await db.exec(sql);
    expect((await db.query('select count(*)::int n from public.technical_terms')).rows[0].n).toBe(85);
    expect((await db.query('select count(*)::int n from public.term_sources where checked_at is not null')).rows[0].n).toBe(0);
    expect((await db.query('select count(*)::int n from public.term_relations')).rows[0].n).toBe(4);
    expect((await db.query('select count(*)::int n from public.body_regions')).rows[0].n).toBe(16);
    expect((await db.query('select count(*)::int n from public.body_region_terms')).rows[0].n).toBe(20);
    await db.exec('set role anon;');
    expect((await db.query('select count(*)::int n from public.technical_terms')).rows[0].n).toBe(0);
    await db.exec('reset role; begin;');
  });
  it('conflitos abortam o lote sem sobrescrever revisão existente', async () => {
    const changed = structuredClone(expansion);
    changed.records[0].translation_pt = 'Divergência';
    await expect(db.exec(generateImportSql(changed))).rejects.toThrow(/Conflitos de importação/);
  });
  it.each(['relação de variante','vínculo anatômico'])('rejeita divergência de fonte em %s',async(kind)=>{
    const changed=structuredClone(expansion);
    const r=changed.records.find(r=>r.slug==='palgup-dollyeo-chigi');
    if(kind==='relação de variante')r.source_locator+=' > divergência';
    else r.anatomical_links[0].source_locator+=' > divergência';
    await expect(db.exec(generateImportSql(changed))).rejects.toThrow(/Conflitos/);
  });
});
