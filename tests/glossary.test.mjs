import {describe,it,expect} from 'vitest';
import {validateGlossary} from '../scripts/glossary.mjs';
import {checkGlossaryBundle} from '../scripts/check-glossary-bundle.mjs';
import {resolve} from 'node:path';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync,rmdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
const source={institution:'Kukkiwon',title:'Technical Terminology',edition:'2011/2012',url:'https://research.kukkiwon.or.kr/homepage/boardMedia/11621',locator:'Introductory remarks §10',checkedAt:'2026-11-05'};
const review={status:'approved',translationBy:'Revisor de tradução',technicalBy:'Responsável técnico',approvedBy:'Responsável pelo projeto',approvedAt:'2026-11-05'};
const word={id:'arae',romanization:'Arae',hangul:'아래',meaning_pt:'Parte inferior',context_pt:'Referência baixa no contexto de estudo.',aliases:[],kind:'height',pronunciation_pt:null,sources:[source],review};
const batch=()=>({version:1,words:[structuredClone(word)],expressions:[]});
describe('publicação do glossário',()=>{
 it('CLI valida apenas o arquivo público fixo, sem aceitar outro caminho',()=>{
  const folder=mkdtempSync(resolve(tmpdir(),'glossary-cli-'));
  try{
   const file=resolve(folder,'content.json');writeFileSync(file,JSON.stringify({version:1,words:[],expressions:[]}));
   const result=spawnSync(process.execPath,['scripts/glossary.mjs',file],{encoding:'utf8'});
   expect(result.status).toBe(1);expect(result.stderr).toContain('não aceita caminhos');
  }finally{rmSync(resolve(folder,'content.json'),{force:true});rmdirSync(folder);}
 });
 it('prévia serve somente arquivos conhecidos, sem consultar caminhos de requisição no disco',async()=>{
  const folder=mkdtempSync(resolve(tmpdir(),'glossary-preview-'));
  try{
   mkdirSync(resolve(folder,'glossario'));writeFileSync(resolve(folder,'glossario/index.html'),'Prévia local');
   const {createPreviewHandler}=await import('../scripts/glossary-preview-server.mjs');
   const handle=createPreviewHandler(folder);
   // Remover o arquivo prova que as requisições usam o manifesto em memória.
   rmSync(resolve(folder,'glossario/index.html'));
   const request=url=>{let status,body;handle({url},{writeHead:code=>{status=code;},end:value=>{body=value;}});return{status,body:body?.toString()};};
   expect(request('/glossario')).toEqual({status:200,body:'Prévia local'});
   expect(request('/glossario/')).toEqual({status:200,body:'Prévia local'});
   expect(request('/%2e%2e/%2e%2e/private.json').status).toBe(404);
   expect(request('/glossario/%2f..%2fprivate.json').status).toBe(404);
  }finally{rmSync(resolve(folder,'glossario/index.html'),{force:true});rmdirSync(resolve(folder,'glossario'));rmdirSync(folder);}
 });
 it('não permite escrever uma prévia de revisão no diretório oficial',()=>{
  expect(()=>checkGlossaryBundle(resolve('dist'),true)).toThrow(/diretório oficial/);
 });
 it('aceita lote vazio e entrada com referências e revisões completas',()=>{
  expect(validateGlossary({version:1,words:[],expressions:[]})).toEqual([]);expect(validateGlossary(batch())).toEqual([]);
 });
 it.each(['translationBy','technicalBy','approvedBy','approvedAt'])('recusa aprovação incompleta: %s',field=>{
  const data=batch();delete data.words[0].review[field];expect(validateGlossary(data).length).toBeGreaterThan(0);
 });
 it('recusa rascunho no arquivo público e permite sua validação na prévia local',()=>{
  const data=batch();data.words[0].review.status='draft';expect(validateGlossary(data).length).toBeGreaterThan(0);
  expect(validateGlossary(data,{requireApproval:false})).toEqual([]);
 });
 it('recusa fontes sem localizador ou fora dos domínios oficiais',()=>{
  const data=batch();data.words[0].sources[0].url='https://kukkiwon.or.kr.example.org/copia';expect(validateGlossary(data).length).toBeGreaterThan(0);
  data.words[0].sources[0]=source;data.words[0].sources[0]={...source,locator:''};expect(validateGlossary(data).length).toBeGreaterThan(0);
 });
 it('recusa duplicatas e correspondência de segmentos inconsistente',()=>{
  const data=batch();data.words.push(structuredClone(word));expect(validateGlossary(data).length).toBeGreaterThan(0);
  data.words.pop();data.expressions=[{id:'arae-test',romanization:'Arae-test',hangul:'아래테스트',translation_pt:'Expressão',context_pt:'Contexto',segments:[{wordId:'missing',romanization:'Arae',hangul:'아래'}],sources:[source],review,technicalSlug:null}];
  expect(validateGlossary(data).length).toBeGreaterThan(0);
 });
});
