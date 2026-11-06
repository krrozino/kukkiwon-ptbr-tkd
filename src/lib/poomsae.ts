import { fetchPublic, type TechnicalTerm, type TermSource } from './catalog-api';
import { hasCheckedSource } from './published-knowledge';

type Evidence = TermSource & { publication_status: 'published'; approved_at: string };
export type PoomsaeForm = Evidence & {term_id:string;sequence_version:string;technical_terms:TechnicalTerm};
export type PoomsaeStep = Evidence & {id:string;poomsae_term_id:string;step_number:number;instruction_pt:string|null;technical_terms:TechnicalTerm};
export const isKnowledgeSchemaEnabled = () => import.meta.env.PUBLIC_KNOWLEDGE_SCHEMA === 'true';
const sourceFields = 'source_locator,checked_at,approved_at,publication_status,content_sources(institution,title,edition,publication_year,official_url)';
const termFields = 'id,slug,category,romanization,hangul,translation_pt,pronunciation_pt,definition_pt,publication_status,record_kind';
const object = (value:unknown):value is Record<string,unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
function validTerm(value:unknown):value is TechnicalTerm {
  return object(value) && value.publication_status === 'published' &&
    ['id','slug','category','romanization','record_kind'].every(key=>typeof value[key] === 'string') &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug as string) && (value.slug as string).length<=120 &&
    ['hangul','translation_pt','pronunciation_pt','definition_pt'].every(key=>value[key]===null||typeof value[key]==='string');
}
function validEvidence(value:Record<string,unknown>) {
  return value.publication_status==='published' && typeof value.approved_at==='string' &&
    Number.isFinite(Date.parse(value.approved_at)) && hasCheckedSource(value as unknown as TermSource);
}
async function allPublishedRows(table:string,select:string,filters:Record<string,string>,signal?:AbortSignal) {
  const rows:unknown[] = [];
  for(let offset=0;;offset+=100) {
    const page=await fetchPublic<unknown>(table,new URLSearchParams({select,publication_status:'eq.published',...filters,limit:'100',offset:String(offset)}),signal);
    if(!Array.isArray(page)||page.length>100)throw new Error('Resposta inválida de Poomsae.');
    if(offset && page.length && JSON.stringify(page)===JSON.stringify(rows.slice(-page.length)))throw new Error('Paginação inválida de Poomsae.');
    rows.push(...page);
    if(page.length<100)return rows;
  }
}
export async function fetchPublishedPoomsae(signal?:AbortSignal):Promise<PoomsaeForm[]> {
  if(!isKnowledgeSchemaEnabled())return [];
  const rows=await allPublishedRows('poomsae_forms','term_id,sequence_version,'+sourceFields+',technical_terms!poomsae_forms_term_id_fkey('+termFields+')',{order:'term_id.asc'},signal);
  if(rows.some(row=>!object(row)||typeof row.term_id!=='string'||typeof row.sequence_version!=='string'||!row.sequence_version.trim()||!validEvidence(row)||!validTerm(row.technical_terms)||row.technical_terms.record_kind!=='poomsae'||row.technical_terms.id!==row.term_id))throw new Error('Resposta inválida de Poomsae.');
  return rows as PoomsaeForm[];
}
export async function fetchPoomsaeSteps(termId:string,signal?:AbortSignal):Promise<PoomsaeStep[]> {
  if(!isKnowledgeSchemaEnabled())return [];
  if(!/^[a-zA-Z0-9-]{1,120}$/.test(termId))throw new Error('Identificador inválido de Poomsae.');
  const rows=await allPublishedRows('poomsae_steps','id,poomsae_term_id,step_number,instruction_pt,'+sourceFields+',technical_terms!poomsae_steps_technique_term_id_fkey('+termFields+')',{poomsae_term_id:'eq.'+termId,order:'step_number.asc,id.asc'},signal);
  const numbers=new Set<number>();
  for(const row of rows) {
    if(!object(row)||typeof row.id!=='string'||row.poomsae_term_id!==termId||!Number.isSafeInteger(row.step_number)||(row.step_number as number)<1||numbers.has(row.step_number as number)||(row.instruction_pt!==null&&typeof row.instruction_pt!=='string')||!validEvidence(row)||!validTerm(row.technical_terms))throw new Error('Resposta inválida da sequência de Poomsae.');
    numbers.add(row.step_number as number);
  }
  return rows as PoomsaeStep[];
}
