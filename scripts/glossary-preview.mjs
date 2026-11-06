import {spawnSync} from 'node:child_process';
import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {resolve,extname,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateGlossary} from './glossary.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),out=resolve(root,'.preview-build/glossary');
const review=JSON.parse(readFileSync(resolve(root,'content/glossary/review.json'),'utf8'));
const errors=validateGlossary(review,{requireApproval:false});if(errors.length)throw Error(errors.join('\n'));
const astro=resolve(root,'node_modules/astro/bin/astro.mjs');
const result=spawnSync(process.execPath,[astro,'build','--outDir',out],{cwd:root,stdio:'inherit',windowsHide:true,env:{...process.env,
 PUBLIC_GLOSSARY_REVIEW:'true',PUBLIC_CONTENT_REVIEW:'false',PUBLIC_SUPABASE_URL:'',PUBLIC_SUPABASE_PUBLISHABLE_KEY:'',ASTRO_TELEMETRY_DISABLED:'1'}});
if(result.status!==0)process.exit(result.status||1);
if(process.argv.includes('--build-only'))process.exit(0);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json'};
const server=createServer((req,res)=>{
 try{
  const url=new URL(req.url,'http://127.0.0.1');let path=resolve(out,'.'+decodeURIComponent(url.pathname));
  if(!path.startsWith(out+'/')&&!path.startsWith(out+'\\')&&path!==out){res.writeHead(403);return res.end();}
  if(existsSync(path)&&statSync(path).isDirectory())path=resolve(path,'index.html');
  if(!existsSync(path)){res.writeHead(404);return res.end('Não encontrado');}
  res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-store'});res.end(readFileSync(path));
 }catch{res.writeHead(400);res.end('Endereço inválido');}
});
server.listen(4324,'127.0.0.1',()=>process.stdout.write('Prévia LOCAL, sem publicação: http://127.0.0.1:4324/glossario\nConteúdo em revisão; Ctrl+C encerra.\n'));
process.on('SIGINT',()=>server.close(()=>process.exit(0)));
