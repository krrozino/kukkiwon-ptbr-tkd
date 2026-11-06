import {describe,it,expect} from 'vitest';
import {validateGlossary} from '../scripts/glossary.mjs';
import {checkGlossaryBundle} from '../scripts/check-glossary-bundle.mjs';
import {resolve} from 'node:path';
const source={institution:'Kukkiwon',title:'Technical Terminology',edition:'2011/2012',url:'https://research.kukkiwon.or.kr/homepage/boardMedia/11621',locator:'Introductory remarks §10',checkedAt:'2026-11-05'};
const review={status:'approved',translationBy:'Revisor de tradução',technicalBy:'Responsável técnico',approvedBy:'Responsável pelo projeto',approvedAt:'2026-11-05'};
const word={id:'arae',romanization:'Arae',hangul:'아래',meaning_pt:'Parte inferior',context_pt:'Referência baixa no contexto de estudo.',aliases:[],kind:'height',pronunciation_pt:null,sources:[source],review};
const batch=()=>({version:1,words:[structuredClone(word)],expressions:[]});
describe('publicação do glossário',()=>{
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
