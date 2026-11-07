import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync,readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {previewConfiguration} from './preview-config.mjs';
import {loadProvisionalAcervo} from './provisional-acervo.mjs';
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
// O catálogo editorial continua offline; escolas podem conectar ao projeto dedicado.
const review=process.argv.includes('--review'),connected=process.argv.includes('--connected'),storage=process.argv.includes('--storage');
const publicCredentials={};
if(connected&&existsSync(resolve(root,'.env.preview.local'))) {
  for(const line of readFileSync(resolve(root,'.env.preview.local'),'utf8').split(/\r?\n/)) {
    const match=/^(PUBLIC_SUPABASE_URL|PUBLIC_SUPABASE_PUBLISHABLE_KEY)=(.*)$/.exec(line.trim());
    if(match)publicCredentials[match[1]]=match[2].trim().replace(/^(['"])(.*)\1$/,'$2');
  }
}
for(const field of ['PUBLIC_SUPABASE_URL','PUBLIC_SUPABASE_PUBLISHABLE_KEY'])if(process.env[field])publicCredentials[field]=process.env[field];
const config=previewConfiguration({review,connected,storage},publicCredentials);
const provisionalEntries=loadProvisionalAcervo().length;
run(executableFor('astro'),['build','--outDir','.preview-build/site'],config.env);
run(executableFor('wrangler'),['deploy','--dry-run','--autoconfig=false','--config','wrangler.preview.jsonc','--outdir','.preview-build/worker'],{
  WRANGLER_SEND_METRICS:'false',
});
mkdirSync(resolve(root,'.preview-build'),{recursive:true});
const revision=spawnSync('git',['rev-parse','HEAD'],{cwd:root,windowsHide:true,encoding:'utf8'}).stdout.trim();
writeFileSync(resolve(root,'.preview-build/release.json'),JSON.stringify({
  revision,mode:config.mode,connectedToDedicatedSupabase:connected,includedDrafts:provisionalEntries,uploaded:false,
  publicProvisionalRecords:provisionalEntries,privateResearchRecordsExposed:0,humanApprovedByThisBuild:0,
  approvalRequired:['Cloudflare preview deploy','remote database migration/import','human editorial publication'],
},null,2));
process.stdout.write('Prévia preparada localmente em .preview-build/. Nenhum envio à Cloudflare.\n');
