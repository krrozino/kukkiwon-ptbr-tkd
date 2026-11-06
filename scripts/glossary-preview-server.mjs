import {readdirSync,readFileSync} from 'node:fs';
import {join,extname} from 'node:path';

const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json'};
export function createPreviewHandler(root){
 const files=new Map();
 const walk=(directory,prefix='')=>{
  for(const entry of readdirSync(directory,{withFileTypes:true})){
   const path=join(directory,entry.name),url=prefix+'/'+entry.name;
   if(entry.isDirectory())walk(path,url);
   else if(entry.isFile()){
    const file={body:readFileSync(path),type:types[extname(entry.name)]||'application/octet-stream'};
    files.set(url,file);
    if(entry.name==='index.html'){files.set(prefix||'/',file);files.set(prefix+'/',file);}
   }
  }
 };
 walk(root);
 return(req,res)=>{
  let key;try{key=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);}
  catch{res.writeHead(400);return res.end('Endereço inválido');}
  const file=files.get(key);
  if(!file){res.writeHead(404);return res.end('Não encontrado');}
  res.writeHead(200,{'Content-Type':file.type,'Cache-Control':'no-store'});res.end(file.body);
 };
}
