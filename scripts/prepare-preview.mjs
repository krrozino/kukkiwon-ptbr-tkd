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
// O modo de revisão é opt-in e não se comunica com o catálogo remoto.
const review=process.argv.includes('--review');
run(executableFor('astro'),['build','--outDir','.preview-build/site'],{
  PUBLIC_SUPABASE_URL:'',PUBLIC_SUPABASE_PUBLISHABLE_KEY:'',PUBLIC_CONTENT_REVIEW:review?'true':'false',PUBLIC_SPRINT02_SCHEMA:'false',ASTRO_TELEMETRY_DISABLED:'1',
});
run(executableFor('wrangler'),['deploy','--dry-run','--autoconfig=false','--config','wrangler.preview.jsonc','--outdir','.preview-build/worker'],{
  WRANGLER_SEND_METRICS:'false',
});
mkdirSync(resolve(root,'.preview-build'),{recursive:true});
const revision=spawnSync('git',['rev-parse','HEAD'],{cwd:root,windowsHide:true,encoding:'utf8'}).stdout.trim();
writeFileSync(resolve(root,'.preview-build/release.json'),JSON.stringify({
  revision,mode:review?'editorial_review_opt_in':'interface_without_remote_catalog',includedDrafts:review?108:0,uploaded:false,publishedResearchRecords:0,
  approvalRequired:['Cloudflare preview deploy','remote database migration/import','human editorial publication'],
},null,2));
process.stdout.write('Prévia preparada localmente em .preview-build/. Nenhum envio à Cloudflare.\n');
