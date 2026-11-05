const dedicatedUrl='https://acbostnsohltuaegfkwl.supabase.co';
export function previewConfiguration({review=false,connected=false,storage=false},credentials={}) {
  let url='',key='';
  if(connected) {
    let parsed;try{parsed=new URL(credentials.PUBLIC_SUPABASE_URL);}catch{throw new Error('Configure a URL pública do Supabase dedicado.');}
    if(parsed.origin!==dedicatedUrl||parsed.pathname!=='/'||parsed.username||parsed.password||parsed.search||parsed.hash)throw new Error('A prévia conectada exige o projeto Supabase dedicado aprovado.');
    key=credentials.PUBLIC_SUPABASE_PUBLISHABLE_KEY||'';
    if(!key.startsWith('sb_publishable_')||key.includes('SUBSTITUA'))throw new Error('Configure somente uma chave pública publishable ativa.');
    url=dedicatedUrl;
  }
  return {
    mode:review?(connected?'editorial_review_connected':'editorial_review_opt_in'):(connected?'public_catalog_connected':'interface_without_remote_catalog'),
    env:{PUBLIC_SUPABASE_URL:url,PUBLIC_SUPABASE_PUBLISHABLE_KEY:key,PUBLIC_CONTENT_REVIEW:review?'true':'false',PUBLIC_SPRINT02_SCHEMA:connected?'true':'false',PUBLIC_SPRINT03_STORAGE:storage?'true':'false',ASTRO_TELEMETRY_DISABLED:'1'},
  };
}
