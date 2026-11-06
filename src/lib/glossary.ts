import approved from '../../content/glossary/approved.json';
import {useEffect,useState} from 'react';
export type GlossarySource={institution:string;title:string;edition:string;url:string;locator:string;checkedAt:string|null};
export type GlossaryReview={status:'draft'|'approved';translationBy:string|null;technicalBy:string|null;approvedBy:string|null;approvedAt:string|null;notes?:string};
export type GlossaryWord={id:string;romanization:string;hangul:string;meaning_pt:string;context_pt:string;kind:'height'|'direction'|'anatomy'|'action'|'surface';aliases:string[];pronunciation_pt:string|null;sources:GlossarySource[];review:GlossaryReview};
export type GlossaryExpression={id:string;romanization:string;hangul:string;translation_pt:string;context_pt:string;technicalSlug:string|null;segments:{wordId:string;romanization:string;hangul:string}[];sources:GlossarySource[];review:GlossaryReview};
export type GlossaryData={version:number;batchId?:string;words:GlossaryWord[];expressions:GlossaryExpression[]};
export const glossaryReviewMode=import.meta.env.PUBLIC_GLOSSARY_REVIEW==='true';
export const publicGlossary=approved as GlossaryData;
let reviewPromise:Promise<GlossaryData>|undefined;
export function loadGlossary():Promise<GlossaryData>{
 if(glossaryReviewMode)return reviewPromise??=(import('../../content/glossary/review.json').then(m=>m.default as GlossaryData));
 return Promise.resolve(publicGlossary);
}
export function useGlossary(){
 const [data,setData]=useState(publicGlossary);
 useEffect(()=>{let live=true;void loadGlossary().then(value=>{if(live)setData(value);});return()=>{live=false;};},[]);
 return data;
}
export const normalizeGlossary=(s:string)=>s.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[\s‐‑–—_-]/gu,'');
export function matchesGlossaryExpression(expression:GlossaryExpression,data:GlossaryData,needle:string){
 if(!needle||[expression.romanization,expression.hangul,expression.translation_pt].some(v=>normalizeGlossary(v).includes(needle)))return true;
 const choices=expression.segments.map(s=>[s.romanization,...(data.words.find(w=>w.id===s.wordId)?.aliases||[])].map(normalizeGlossary));
 if(choices.some(words=>words.some(w=>w.includes(needle))))return true;
 const escape=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 // Segmentos e aliases explícitos; aceitar prefixos enquanto o aluno digita,
 // sem inferir traduções ou combinar variantes técnicas diferentes.
 let complete='';const prefixes:string[]=[];
 for(const words of choices){
  const endings=[...new Set(words.flatMap(w=>Array.from({length:w.length},(_,i)=>escape(w.slice(0,i+1)))))];
  prefixes.push(complete+'(?:'+endings.join('|')+')');
  complete+='(?:'+words.map(escape).join('|')+')';
 }
 return new RegExp('^(?:'+prefixes.join('|')+')$').test(needle);
}
