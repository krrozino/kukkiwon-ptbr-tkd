import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {validateGlossary} from './scripts/glossary.mjs';
import {checkGlossaryBundle} from './scripts/check-glossary-bundle.mjs';
import {checkResearchBundle} from './scripts/check-research-bundle.mjs';
const errors=validateGlossary(JSON.parse(readFileSync(new URL('./content/glossary/approved.json',import.meta.url),'utf8')));
if(errors.length)throw new Error(errors.join('\n'));
export default defineConfig({ output: 'static', outDir:process.env.PUBLIC_GLOSSARY_REVIEW==='true'?'.preview-build/glossary-review':'./dist', integrations: [react(),{
  name:'research-dev-only',hooks:{'astro:config:setup':({command,updateConfig})=>updateConfig({vite:{resolve:{alias:{
    '@research/workbench':fileURLToPath(new URL(command==='dev'?'./src/components/ResearchWorkbench.tsx':'./src/components/research/ResearchUnavailable.tsx',import.meta.url)),
    '@research/hand-atlas':fileURLToPath(new URL(command==='dev'?'./src/components/research/HandAtlasWorkbench.tsx':'./src/components/research/ResearchUnavailable.tsx',import.meta.url)),
  }}}})},
},{
  name:'glossary-public-gate',hooks:{'astro:build:done':({dir})=>checkGlossaryBundle(fileURLToPath(dir))},
},{
  name:'research-public-gate',hooks:{'astro:build:done':({dir})=>checkResearchBundle(fileURLToPath(dir))},
}] });
