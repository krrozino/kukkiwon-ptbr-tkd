import {spawn,execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createRequire} from 'node:module';
import {createServer} from 'node:net';
import {mkdirSync,writeFileSync,readFileSync,existsSync,unlinkSync,openSync,closeSync} from 'node:fs';
import {resolve,dirname,join,delimiter} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {randomBytes,randomUUID} from 'node:crypto';
import {generateImportSql} from '../../scripts/content.mjs';
import {launchService} from './process.mjs';

export const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const require=createRequire(new URL('./package.json',import.meta.url));
const {Client}=require('pg');
export async function command(executable,args,options={}) {
  return new Promise((done,reject)=>{
    const child=spawn(executable,args,{cwd:root,windowsHide:true,...options});
    child.once('error',reject);
    child.once('exit',code=>code===0?done():reject(new Error('Comando local falhou ('+code+'): '+executable)));
  });
}
async function port() {
  const server=createServer();
  await new Promise((done,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',done);});
  const value=server.address().port;await new Promise(done=>server.close(done));return value;
}
export async function startLocalRuntime() {
  const platform=process.platform==='win32'?'windows':process.platform;
  if(!['windows','linux','darwin'].includes(platform))throw new Error('Plataforma de validação não suportada.');
  const binaries=await import(pathToFileURL(require.resolve('@embedded-postgres/'+platform+'-'+process.arch)));
  const runDir=join(root,'.local-validation','runs',randomUUID());
  mkdirSync(runDir,{recursive:true});
  const databaseDir=join(runDir,'database'),pwd=randomBytes(24).toString('hex');
  const passwordFile=join(runDir,'password');writeFileSync(passwordFile,pwd,{mode:0o600});
  const dbPort=await port(),apiPort=await port(),secret=randomBytes(32).toString('hex');
  const postgrest=process.env.KUKKIWON_POSTGREST_BIN||join(root,'.local-validation','bin',process.platform==='win32'?'postgrest.exe':'postgrest');
  if(!existsSync(postgrest))throw new Error('PostgREST local ausente. Consulte tools/local-validation/README.md.');
  const logFile=join(runDir,'services.log'),log=openSync(logFile,'a');
  let postgres,api,client,postgrestVersion;
  async function stop() {
    await client?.end().catch(()=>{});
    if(api&&!api.killed)api.kill();
    if(postgres&&postgres.exitCode===null) {
      const ctl=join(dirname(binaries.postgres),process.platform==='win32'?'pg_ctl.exe':'pg_ctl');
      await command(ctl,['-D',databaseDir,'-m','fast','-w','stop'],{stdio:['ignore',log,log]}).catch(()=>postgres.kill());
    }
    closeSync(log);
  }
  try {
    await command(binaries.initdb,['-D',databaseDir,'--username=postgres','--pwfile='+passwordFile,'--encoding=UTF8','--locale=C','--auth=scram-sha-256'],{stdio:['ignore',log,log]});
    unlinkSync(passwordFile);
    postgres=await launchService(binaries.postgres,['-D',databaseDir,'-p',String(dbPort),'-h','127.0.0.1','-c','max_connections=30'],{cwd:root,stdio:['ignore',log,log]});
    client=new Client({host:'127.0.0.1',port:dbPort,user:'postgres',password:pwd,database:'postgres'});
    let connected=false;
    for(let attempt=0;attempt<80;attempt++) {
      if(postgres.exitCode!==null)throw new Error('PostgreSQL local encerrou: '+readFileSync(logFile,'utf8').slice(-2000));
      const probe=new Client({host:'127.0.0.1',port:dbPort,user:'postgres',password:pwd,database:'postgres'});
      try {await probe.connect();await probe.end();connected=true;break;}catch{await probe.end().catch(()=>{});await new Promise(done=>setTimeout(done,100));}
    }
    if(!connected)throw new Error('Timeout ao iniciar PostgreSQL local.');
    await client.connect();
    await client.query("create role anon nologin; create role authenticated nologin; grant usage on schema public to anon,authenticated;");
    await client.query("create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid$$;grant usage on schema auth to anon,authenticated;");
    await client.query("create role authenticator noinherit login password '"+pwd+"'; grant anon,authenticated to authenticator;");
    // Reproduz o estado legado do projeto dedicado antes da migração da Sprint 01.
    for(const file of ['20261103205602_catalogo_publico_inicial.sql','20261103220044_atlas_media_e_integridade_de_fontes.sql']) {
      await client.query(readFileSync(join(root,'supabase/migrations',file),'utf8'));
    }
    for(const file of ['kukkiwon_2012_first20_drafts.sql','atlas_maos_2012_drafts.sql']) {
      await client.query(readFileSync(join(root,'supabase/seeds',file),'utf8'));
    }
    await client.query(readFileSync(join(root,'supabase/migrations/20261105020254_sprint_catalog_search_relations.sql'),'utf8'));
    await client.query(readFileSync(join(root,'supabase/migrations/20261105030951_sprint02_schools_learning.sql'),'utf8'));
    const expansion=JSON.parse(readFileSync(join(root,'content/review/kukkiwon-2012-expansion.json'),'utf8'));
    await client.query(generateImportSql(expansion));await client.query(generateImportSql(expansion));
    const first=JSON.parse(readFileSync(join(root,'content/review/kukkiwon-2012-first20.json'),'utf8'));
    const sonnal=JSON.parse(readFileSync(join(root,'content/review/sprint02-sonnal-variants.json'),'utf8'));
    await client.query(generateImportSql(sonnal,[first,expansion]));
    const version=(await client.query('select version()')).rows[0].version;
    return {client,secret,runDir,logFile,version,apiUrl:'http://127.0.0.1:'+apiPort,stop,
      get postgrestVersion(){return postgrestVersion;},
      async startApi() {
        const environment={...process.env};
        const pathKey=Object.keys(environment).find(key=>key.toLowerCase()==='path');
        const inheritedPath=pathKey?environment[pathKey]:'';
        if(pathKey)delete environment[pathKey];
        environment.PATH=dirname(binaries.postgres)+delimiter+inheritedPath;
        const actualVersion=await promisify(execFile)(postgrest,['--version'],{cwd:root,windowsHide:true,env:environment});
        postgrestVersion=actualVersion.stdout.trim();
        api=await launchService(postgrest,[],{cwd:root,stdio:['ignore',log,log],env:{
          ...environment,PGRST_DB_URI:'postgresql://authenticator:'+pwd+'@127.0.0.1:'+dbPort+'/postgres',
          PGRST_DB_SCHEMAS:'public',PGRST_DB_ANON_ROLE:'anon',PGRST_SERVER_HOST:'127.0.0.1',
          PGRST_SERVER_PORT:String(apiPort),PGRST_JWT_SECRET:secret,PGRST_DB_MAX_ROWS:'1000',
        }});
        for(let attempt=0;attempt<100;attempt++) {
          if(api.exitCode!==null)throw new Error('PostgREST local encerrou: '+readFileSync(logFile,'utf8').slice(-2000));
          try {if((await fetch('http://127.0.0.1:'+apiPort+'/')).ok)return;}catch{}
          await new Promise(done=>setTimeout(done,100));
        }
        throw new Error('Timeout ao iniciar PostgREST local.');
      },
    };
  } catch(error) {await stop();throw error;}
}
