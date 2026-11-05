import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const executableFor=name=>{
  const packageFile=resolve(root,'node_modules',name,'package.json');
  const info=JSON.parse(readFileSync(packageFile,'utf8'));
  return resolve(dirname(packageFile),typeof info.bin==='string'?info.bin:info.bin[name]);
};
const run=(file,args,env={})=>{
  const result=spawnSync(process.execPath,[file,...args],{cwd:root,windowsHide:true,stdio:'inherit',env:{...process.env,...env}});
  if(result.status!==0)throw new Error('Preparação local falhou; nenhum deploy foi realizado.');
};
// Prévia sem conexão: permite testar a interface e os vazios sem depender de uma
// migração remota ainda não autorizada. Não incorpora chaves reais nem rascunhos.
run(executableFor('astro'),['build','--outDir','.preview-build/site'],{
  PUBLIC_SUPABASE_URL:'',PUBLIC_SUPABASE_PUBLISHABLE_KEY:'',PUBLIC_REVIEW_MODE:'1',ASTRO_TELEMETRY_DISABLED:'1',
});
run(executableFor('wrangler'),['deploy','--dry-run','--autoconfig=false','--config','wrangler.preview.jsonc','--outdir','.preview-build/worker'],{
  WRANGLER_SEND_METRICS:'false',
});
mkdirSync(resolve(root,'.preview-build'),{recursive:true});
const revision=spawnSync('git',['rev-parse','HEAD'],{cwd:root,windowsHide:true,encoding:'utf8'}).stdout.trim();
writeFileSync(resolve(root,'.preview-build/release.json'),JSON.stringify({
  revision,mode:'research_review_preview_only',uploaded:false,publishedResearchRecords:0,reviewCandidateCount:105,
  approvalRequired:['Cloudflare preview deploy','remote database migration/import','human editorial publication'],
},null,2));
process.stdout.write('Prévia preparada localmente em .preview-build/. Nenhum envio à Cloudflare.\n');
