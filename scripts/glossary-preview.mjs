import {spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateGlossary} from './glossary.mjs';
import {createPreviewHandler} from './glossary-preview-server.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),out=resolve(root,'.preview-build/glossary');
const review=JSON.parse(readFileSync(resolve(root,'content/glossary/review.json'),'utf8'));
const errors=validateGlossary(review,{requireApproval:false});if(errors.length)throw Error(errors.join('\n'));
const astro=resolve(root,'node_modules/astro/bin/astro.mjs');
const result=spawnSync(process.execPath,[astro,'build','--outDir',out],{cwd:root,stdio:'inherit',windowsHide:true,env:{...process.env,
 PUBLIC_GLOSSARY_REVIEW:'true',PUBLIC_CONTENT_REVIEW:'false',PUBLIC_SUPABASE_URL:'',PUBLIC_SUPABASE_PUBLISHABLE_KEY:'',ASTRO_TELEMETRY_DISABLED:'1'}});
if(result.status!==0)process.exit(result.status||1);
if(process.argv.includes('--build-only'))process.exit(0);
const server=createServer(createPreviewHandler(out));
server.listen(4324,'127.0.0.1',()=>process.stdout.write('Prévia LOCAL, sem publicação: http://127.0.0.1:4324/glossario\nConteúdo em revisão; Ctrl+C encerra.\n'));
process.on('SIGINT',()=>server.close(()=>process.exit(0)));
