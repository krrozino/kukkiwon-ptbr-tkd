/** Local projection and review export. No HTTP, credentials, SQL or state promotion. */
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadBatches, validateBatches } from './content.mjs';
import { buildProvisionalAcervo, provisionalFields } from '../src/lib/provisional-acervo.ts';
import { escapeSpreadsheetCell } from './review-export.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export function loadProvisionalAcervo() {
  const extra=readdirSync(resolve(root,'content/provisional')).filter(f=>f.endsWith('.json')).sort()
    .map(f=>JSON.parse(readFileSync(resolve(root,'content/provisional',f),'utf8')));
  const batches=[...loadBatches(),...extra];
  const report=validateBatches(batches);
  if(report.errors.length) throw new Error(report.errors.join('\n'));
  return buildProvisionalAcervo(batches);
}
export function provisionalReviewCsv(entries) {
  const rows=[['slug','campo','valor_provisorio','instituicao','documento','edicao','ano','url','localizador','data_consulta_documento','revisao_humana','decisao','revisor','observacoes']];
  for(const entry of entries) {
    const append=(field,value,evidence)=>rows.push([entry.slug,field,value,evidence?.source.institution||'',evidence?.source.title||'',evidence?.source.edition||'',evidence?.source.year||'',evidence?.source.url||'',evidence?.locator||'',evidence?.accessedAt||'','pendente','','','']);
    for(const field of provisionalFields) {
      const claim=entry.fields[field];
      append(field,claim?.value||'',claim?.evidence);
    }
    for(const relation of entry.relations) append('region:'+relation.role,relation.regionSlug,relation.evidence);
    for(const gap of entry.gaps.filter(g=>!provisionalFields.includes(g))) append('pendencia:'+gap,'',null);
  }
  return '\ufeff'+rows.map(row=>row.map(value=>escapeSpreadsheetCell(value)).join(';')).join('\r\n')+'\r\n';
}
export function runProvisionalAcervo(args) {
  if(args.length && !(args.length===2 && args[0]==='--review' && /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.csv$/.test(args[1]))) throw new Error('Uso: npm run acervo:check [-- --review nome.csv]');
  const entries=loadProvisionalAcervo();
  if(args.length) {
    const directory=resolve(root,'review-output');mkdirSync(directory,{recursive:true});
    writeFileSync(resolve(directory,args[1]),provisionalReviewCsv(entries),{encoding:'utf8',flag:'wx'});
  }
  return {entries:entries.length,relations:entries.reduce((n,e)=>n+e.relations.length,0),humanApproved:0,remoteWrites:0,mode:args.length?'local_review_export':'offline_check'};
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(runProvisionalAcervo(process.argv.slice(2)),null,2)); }
  catch(error) { console.error(error.message);process.exitCode=1; }
}
