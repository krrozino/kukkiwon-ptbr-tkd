import { safeReferenceUrl } from './published-knowledge.ts';

export const provisionalFields = ['romanization','hangul','translation_pt','definition_pt'] as const;
type Field = typeof provisionalFields[number];
type Source = {institution:string;title:string;edition?:string;year?:number;url:string};
export type ProvisionalBatch = {batch:string;source:Source;accessed_at?:string;records:{
  slug:string;category:string;record_kind?:string;romanization:string;hangul?:string;translation_pt?:string;definition_pt?:string;
  source_locator:string;publication_status:string;editorial_status:string;
  atlas?:{area:string;view:string;x:number|null;y:number|null};
  anatomical_links?:{region_slug:string;relation_type:string;source_locator:string}[];
}[]};
export type ProvisionalEvidence = {source:Source;locator:string;accessedAt:string|null;review:'pending'};
export type ProvisionalEntry = {
  slug:string;category:string;kind:string;batch:string;status:'provisional';
  fields:Partial<Record<Field,{value:string;evidence:ProvisionalEvidence}>>;
  atlasArea:string|null;
  relations:{regionSlug:string;regionName:string;role:string;atlasArea:string|null;evidence:ProvisionalEvidence}[];
  gaps:string[];
};
const present = (value:unknown): value is string => typeof value==='string' && Boolean(value.trim());
const normalize = (value:string) => value.normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase('pt-BR');
const areas = new Set(['head','torso','arms','legs','hands','feet']);

/** Explicit reading projection. Never changes the original records or publishes them to a database. */
export function buildProvisionalAcervo(batches:ProvisionalBatch[]):ProvisionalEntry[] {
  const records=new Map<string,ProvisionalBatch['records'][number]>();
  for(const batch of batches) {
    const s=batch.source;
    if(!s || !safeReferenceUrl(s.url) || !present(s.institution) || !present(s.title)) throw new Error('Fonte inválida: '+batch.batch);
    if(batch.accessed_at && (!/^\d{4}-\d{2}-\d{2}$/.test(batch.accessed_at) || !Number.isFinite(Date.parse(batch.accessed_at)))) throw new Error('Data de consulta inválida');
    for(const record of batch.records) {
      if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug)) throw new Error('Slug inválido');
      if(records.has(record.slug)) throw new Error('Slug duplicado: '+record.slug);
      if(!present(record.source_locator)) throw new Error('Localizador ausente: '+record.slug);
      if(!present(record.romanization) || !present(record.category)) throw new Error('Nome/categoria ausente: '+record.slug);
      if(record.atlas && !areas.has(record.atlas.area)) throw new Error('Região ilustrativa inválida: '+record.slug);
      records.set(record.slug,record);
    }
  }
  return batches.flatMap(batch=>batch.records.map(record=>{
    // Allowlist protects public pages and exports from raw research or private annotations.
    const source:Source={institution:batch.source.institution,title:batch.source.title,url:batch.source.url,
      ...(batch.source.edition?{edition:batch.source.edition}:{}),...(batch.source.year?{year:batch.source.year}:{})};
    const evidence=(locator:string):ProvisionalEvidence=>({source,locator,accessedAt:batch.accessed_at||null,review:'pending'});
    const fields:ProvisionalEntry['fields']={};
    for(const field of provisionalFields) if(present(record[field])) fields[field]={value:record[field],evidence:evidence(record.source_locator)};
    const relations=(record.anatomical_links||[]).map(link=>{
      const region=records.get(link.region_slug);
      if(!region || !present(link.source_locator) || !['surface','target','anatomy','movement'].includes(link.relation_type)) throw new Error('Relação com região inválida: '+record.slug);
      return {regionSlug:region.slug,regionName:region.translation_pt||region.romanization,role:link.relation_type,atlasArea:region.atlas?.area||null,evidence:evidence(link.source_locator)};
    });
    const gaps:string[]=provisionalFields.filter(field=>!fields[field]);
    gaps.push('pronunciation_pt','literal_meaning','human_review');
    if(!relations.length) gaps.push('anatomical_links');
    return {slug:record.slug,category:record.category,kind:record.record_kind||'technique',batch:batch.batch,
      status:'provisional' as const,fields,atlasArea:record.atlas?.area||null,relations,gaps};
  }));
}

export function filterProvisionalAcervo(entries:ProvisionalEntry[],{query='',category='',region=''}:{query?:string;category?:string;region?:string}={}) {
  const needle=normalize(query.trim());
  return entries.filter(entry=>(!category||entry.category===category) &&
    (!region||entry.slug===region||entry.relations.some(link=>link.regionSlug===region)) &&
    (!needle||normalize(Object.values(entry.fields).map(field=>field.value).join(' ')).includes(needle)));
}
