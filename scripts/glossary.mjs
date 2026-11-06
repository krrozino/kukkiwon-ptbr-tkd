import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const text=v=>typeof v==='string'&&v.trim().length>0;
const slug=v=>typeof v==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v);
const date=v=>text(v)&&/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(v)&&!Number.isNaN(Date.parse(v));
export function validateGlossary(data,{requireApproval=true}={}){
 const errors=[];
 if(data?.version!==1||!Array.isArray(data.words)||!Array.isArray(data.expressions))return ['Glossário: estrutura inválida'];
 const ids=new Set(),words=new Map(data.words.map(w=>[w.id,w]));
 for(const [kind,items] of [['word',data.words],['expression',data.expressions]])for(const item of items){
  const id=item?.id||'(sem id)';
  if(!slug(item?.id)||ids.has(id))errors.push(id+': identificador inválido/duplicado');ids.add(id);
  for(const key of ['romanization','hangul','context_pt',kind==='word'?'meaning_pt':'translation_pt'])if(!text(item?.[key]))errors.push(id+': '+key+' obrigatório');
  if(kind==='word'&&(!Array.isArray(item.aliases)||!item.aliases.every(text)||!['height','direction','anatomy','action','surface'].includes(item.kind)))errors.push(id+': classe ou aliases inválidos');
  if(!Array.isArray(item?.sources)||item.sources.length===0)errors.push(id+': fonte obrigatória');
  else for(const source of item.sources){
   if(!['institution','title','edition','locator'].every(k=>text(source?.[k])))errors.push(id+': referência incompleta');
   try{const u=new URL(source.url);if(u.protocol!=='https:'||!(u.hostname==='kukkiwon.or.kr'||u.hostname.endsWith('.kukkiwon.or.kr')||u.hostname==='krdict.korean.go.kr'))throw Error();}
   catch{errors.push(id+': domínio de fonte não autorizado');}
   if(requireApproval&&!date(source?.checkedAt))errors.push(id+': fonte não conferida');
  }
  if(requireApproval&&(!item?.review||item.review.status!=='approved'||!['translationBy','technicalBy','approvedBy'].every(k=>text(item.review[k]))||!date(item.review.approvedAt)))errors.push(id+': revisão humana incompleta');
  if(kind==='expression'){
   if(!Array.isArray(item.segments)||!item.segments.length)errors.push(id+': segmentos obrigatórios');
   else{
    if(item.segments.map(s=>s.romanization).join('-')!==item.romanization||item.segments.map(s=>s.hangul).join('')!==item.hangul)errors.push(id+': correspondência textual inválida');
    for(const segment of item.segments){const word=words.get(segment.wordId);if(!word||segment.hangul!==word.hangul||segment.romanization.toLowerCase()!==word.romanization.toLowerCase())errors.push(id+': palavra/segmento não conferido');}
   }
   if(item.technicalSlug!=null&&!slug(item.technicalSlug))errors.push(id+': ficha inválida');
  }
 }
 return errors;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.argv.length>2){process.stderr.write('Este comando não aceita caminhos; valida somente o glossário público.\n');process.exit(1);}
 const errors=validateGlossary(JSON.parse(readFileSync(new URL('../content/glossary/approved.json',import.meta.url),'utf8')));
 if(errors.length){process.stderr.write(errors.join('\n')+'\n');process.exitCode=1;}
 else process.stdout.write('Glossário público validado: somente conteúdo aprovado.\n');
}
