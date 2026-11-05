import {it,expect} from 'vitest';
import {resolve} from 'node:path';
import {launchService} from '../tools/local-validation/process.mjs';
it('retorna rejeição de inicialização em vez de evento de erro não tratado',async()=>{
  await expect(launchService(resolve('missing-validation-executable'),[],{stdio:'ignore'})).rejects.toMatchObject({code:'ENOENT'});
});
