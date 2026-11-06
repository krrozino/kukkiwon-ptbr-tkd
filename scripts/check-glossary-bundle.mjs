import {readdirSync,readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
export function checkGlossaryBundle(directory,review=process.env.PUBLIC_GLOSSARY_REVIEW==='true'){
if(review){
 if(resolve(directory)===resolve(fileURLToPath(new URL('../dist',import.meta.url))))throw new Error('A prévia de revisão não pode usar o diretório oficial dist.');
 process.stdout.write('Build de prévia local do glossário; conteúdo não aprovado, não publicar.\n');
}else{
 const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)]);
 const root=resolve(directory);
 const approved=JSON.parse(readFileSync(new URL('../content/glossary/approved.json',import.meta.url),'utf8'));
 const reviewData=JSON.parse(readFileSync(new URL('../content/glossary/review.json',import.meta.url),'utf8'));
 const released=new Set([...approved.words,...approved.expressions].map(e=>e.id));
 const forbidden=['glossary-pilot-review-001',...[...reviewData.words,...reviewData.expressions].filter(e=>!released.has(e.id)).map(e=>e.context_pt)];
 for(const file of walk(root).filter(p=>/\.(html|js|json|map)$/.test(p))){
  const content=readFileSync(file,'utf8');
  if(forbidden.some(text=>content.includes(text)||content.includes(JSON.stringify(text).slice(1,-1))))throw new Error('Rascunhos do glossário encontrados no pacote público: '+file);
 }
 process.stdout.write('Pacote público sem lote de revisão do glossário.\n');
}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))checkGlossaryBundle(process.argv[2]||'dist');
