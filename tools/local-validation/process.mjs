import {spawn} from 'node:child_process';
// Reject startup errors through the awaited path, so the caller's finally can
// stop other services. Keep an error listener installed after the spawn event.
export function launchService(executable,args,options={}) {
  return new Promise((done,reject)=>{
    const child=spawn(executable,args,{windowsHide:true,...options});
    child.once('error',reject);
    child.once('spawn',()=>done(child));
  });
}
