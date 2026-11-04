import Ajv from 'ajv';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const schema = JSON.parse(readFileSync(resolve(root, 'content/schema/research-batch.schema.json'), 'utf8'));
const validate = new Ajv({ allErrors: true, strict: false }).compile(schema);
const normalized = value => value.normalize('NFC').toLowerCase().replace(/[\s‐‑–—_-]/gu, '');
export function loadBatches() {
  return readdirSync(resolve(root, 'content/review')).filter(f => f.endsWith('.json'))
    .sort().map(f => JSON.parse(readFileSync(resolve(root, 'content/review', f), 'utf8')));
}
export function validateBatches(batches) {
  const errors = [], slugs = new Set(), identities = new Set();
  const result = { errors, records: 0, research: 0, document_checked: 0 };
  for (const batch of batches) {
    if (!validate(batch)) {
      errors.push(...validate.errors.map(e => (batch?.batch || 'lote') + e.instancePath + ': ' + e.message));
      continue;
    }
    try {
      const url = new URL(batch.source.url);
      if (url.protocol !== 'https:' || !(url.hostname === 'kukkiwon.or.kr' || url.hostname.endsWith('.kukkiwon.or.kr'))) {
        errors.push(batch.batch + ': fonte Kukkiwon deve estar em domínio institucional');
      }
    } catch { errors.push(batch.batch + ': URL de fonte inválida'); }
    for (const r of batch.records) {
      result.records++; result[r.editorial_status]++;
      if (!r.source_locator.trim()) errors.push(r.slug + ': localizador vazio');
      if (slugs.has(r.slug)) errors.push(r.slug + ': slug duplicado');
      slugs.add(r.slug);
      const identity = normalized(r.hangul) + ':' + normalized(r.romanization);
      if (identities.has(identity)) errors.push(r.slug + ': nome duplicado');
      identities.add(identity);
      if (r.variant_of === r.slug) errors.push(r.slug + ': variante de si mesma');
      if (['an-makgi','naeryeo-makgi','ollyeo-makgi'].includes(r.slug) &&
          (r.aliases || []).some(a => /^(arae|eolgul|oelgul|momtong)-makgi$/i.test(a.alias))) {
        errors.push(r.slug + ': alias de variante não pode ser sinônimo genérico');
      }
      if (r.checked_at || r.published_at) errors.push(r.slug + ': pesquisa não atribui datas de revisão/publicação');
    }
  }
  for (const batch of batches) for (const r of batch?.records || []) {
    if (r.variant_of && !slugs.has(r.variant_of)) errors.push(r.slug + ': família ausente ' + r.variant_of);
    for (const link of r.anatomical_links || []) if (!slugs.has(link.region_slug)) errors.push(r.slug + ': região ausente ' + link.region_slug);
    if (r.atlas && (r.atlas.x == null) !== (r.atlas.y == null)) errors.push(r.slug + ': coordenadas incompletas');
  }
  return result;
}
const sqlString = value => value == null ? 'null' : "'" + String(value).replaceAll("'", "''") + "'";
export function generateImportSql(batch) {
  const report = validateBatches([batch]);
  if (report.errors.length) throw new Error(report.errors.join('\n'));
  const payload = sqlString(JSON.stringify(batch));
  // The database is never contacted. Reviewed/published or divergent rows stop the whole transaction.
  return `-- Gerado por scripts/content.mjs. Revisar e executar SOMENTE em ambiente isolado primeiro.
-- Sem checked_at automático. Conflitos abortam; reexecução idêntica não altera dados.
begin;
lock table public.technical_terms, public.content_sources, public.term_sources, public.term_aliases, public.term_relations, public.body_regions, public.body_region_terms in share row exclusive mode;
create temporary table import_batch (data jsonb) on commit drop;
insert into import_batch values (${payload}::jsonb);
create temporary table import_records on commit drop as
 select r.* from import_batch b, jsonb_to_recordset(b.data->'records')
 as r(slug text, category text, hangul text, romanization text, translation_pt text, definition_pt text,
 editorial_status text, record_kind text, source_locator text, variant_of text, aliases jsonb, atlas jsonb, anatomical_links jsonb);
do $import$
declare conflicts text;
begin
 select string_agg(t.slug, ', ' order by t.slug) into conflicts
 from public.technical_terms t join import_records r using(slug)
 where t.publication_status <> 'draft' or t.editorial_status <> r.editorial_status
 or (t.category,t.hangul,t.romanization,t.translation_pt,t.definition_pt,t.record_kind)
 is distinct from (r.category,r.hangul,r.romanization,r.translation_pt,r.definition_pt,coalesce(r.record_kind,'technique'));
 if conflicts is not null then raise exception 'Conflitos de importação (nenhuma alteração aplicada): %', conflicts; end if;
 select string_agg(br.slug, ', ' order by br.slug) into conflicts
 from public.body_regions br join import_records r using(slug)
 where r.atlas is not null and (br.publication_status <> 'draft'
 or (br.name_pt,br.atlas_area,br.detail_view,br.detail_x,br.detail_y)
 is distinct from (r.translation_pt,r.atlas->>'area',r.atlas->>'view',(r.atlas->>'x')::numeric,(r.atlas->>'y')::numeric));
 if conflicts is not null then raise exception 'Conflitos de regiões (nenhuma alteração aplicada): %', conflicts; end if;
 if (select count(*) from public.content_sources s, import_batch b where s.official_url=b.data->'source'->>'url') > 1
 then raise exception 'Fonte duplicada: resolver manualmente antes de importar'; end if;
end $import$;
insert into public.content_sources(institution,title,edition,publication_year,official_url)
select data->'source'->>'institution',data->'source'->>'title',data->'source'->>'edition',
(data->'source'->>'year')::integer,data->'source'->>'url' from import_batch b
where not exists(select 1 from public.content_sources s where s.official_url=b.data->'source'->>'url');
insert into public.technical_terms(slug,category,hangul,romanization,translation_pt,definition_pt,editorial_status,publication_status,record_kind)
select slug,category,hangul,romanization,translation_pt,definition_pt,editorial_status,'draft',coalesce(record_kind,'technique') from import_records
on conflict(slug) do nothing;
insert into public.term_sources(term_id,source_id,source_locator,checked_at)
select t.id,s.id,r.source_locator,null from import_records r
join public.technical_terms t using(slug)
cross join import_batch b join public.content_sources s on s.official_url=b.data->'source'->>'url'
on conflict do nothing;
insert into public.term_relations(term_id,related_term_id,relation_kind,source_id,source_locator)
select t.id,parent.id,'variant_of',s.id,r.source_locator from import_records r
join public.technical_terms t using(slug) join public.technical_terms parent on parent.slug=r.variant_of
cross join import_batch b join public.content_sources s on s.official_url=b.data->'source'->>'url'
on conflict do nothing;
insert into public.term_aliases(term_id,alias,alias_kind,is_official)
select t.id,a->>'alias',a->>'alias_kind',false from import_records r
join public.technical_terms t using(slug) cross join lateral jsonb_array_elements(coalesce(r.aliases,'[]'::jsonb)) a
on conflict do nothing;
insert into public.body_regions(slug,region_group,name_pt,publication_status,atlas_area_override,detail_view,detail_x,detail_y)
select slug,case when atlas->>'area' in ('arms','legs') then 'torso' else atlas->>'area' end,
translation_pt,'draft',case when atlas->>'area' in ('arms','legs') then atlas->>'area' end,
atlas->>'view',(atlas->>'x')::numeric,(atlas->>'y')::numeric from import_records where atlas is not null
on conflict(slug) do nothing;
insert into public.body_region_terms(region_id,term_id,usage_context,anatomical_role,source_id,source_locator)
select region.id,t.id,case when a->>'relation_type'='anatomy' then 'other' else a->>'relation_type' end,
a->>'relation_type',s.id,a->>'source_locator' from import_records r
join public.technical_terms t using(slug)
cross join lateral jsonb_array_elements(coalesce(r.anatomical_links,'[]'::jsonb)) a
join public.body_regions region on region.slug=a->>'region_slug'
cross join import_batch b join public.content_sources s on s.official_url=b.data->'source'->>'url'
on conflict do nothing;
commit;
`;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const batches = loadBatches(), report = validateBatches(batches);
    if (report.errors.length) { process.stderr.write(JSON.stringify(report, null, 2) + '\n'); process.exitCode = 1; }
    else if (process.argv[2] === '--sql') {
      const batch = batches.find(b => b.batch === process.argv[3]);
      if (!batch) throw new Error('Informe um identificador de lote existente após --sql');
      process.stdout.write(generateImportSql(batch));
    } else if (process.argv.length > 2) { throw new Error('Uso: node scripts/content.mjs [--sql nome-do-lote]'); }
    else process.stdout.write(JSON.stringify({ mode:'dry_run', ...report }, null, 2) + '\n');
  } catch (e) { process.stderr.write(e.message + '\n'); process.exitCode = 1; }
}
