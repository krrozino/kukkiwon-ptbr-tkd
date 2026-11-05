import {it,expect} from 'vitest';
import {previewConfiguration} from '../scripts/preview-config.mjs';
const credentials={PUBLIC_SUPABASE_URL:'https://acbostnsohltuaegfkwl.supabase.co',PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test_only'};
it('mantém a prévia padrão sem conexão mesmo quando existem variáveis no ambiente',()=>{
 const r=previewConfiguration({review:false,connected:false},credentials);
 expect(r.env.PUBLIC_SUPABASE_URL).toBe('');expect(r.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY).toBe('');expect(r.env.PUBLIC_CONTENT_REVIEW).toBe('false');
});
it('conecta a revisão apenas ao Supabase dedicado com chave pública',()=>{
 const r=previewConfiguration({review:true,connected:true},credentials);
 expect(r.mode).toBe('editorial_review_connected');expect(r.env.PUBLIC_CONTENT_REVIEW).toBe('true');expect(r.env.PUBLIC_SPRINT02_SCHEMA).toBe('true');expect(r.env.PUBLIC_SUPABASE_URL).toBe('https://acbostnsohltuaegfkwl.supabase.co');
});
it('recusa outro projeto, credenciais na URL e chaves secretas',()=>{
 for(const config of [{...credentials,PUBLIC_SUPABASE_URL:'https://outro.supabase.co'},{...credentials,PUBLIC_SUPABASE_URL:'https://user:password@acbostnsohltuaegfkwl.supabase.co'},{...credentials,PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_secret_not_allowed'}])expect(()=>previewConfiguration({review:true,connected:true},config)).toThrow();
});
