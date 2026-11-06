import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {validateGlossary} from './scripts/glossary.mjs';
import {checkGlossaryBundle} from './scripts/check-glossary-bundle.mjs';
const errors=validateGlossary(JSON.parse(readFileSync(new URL('./content/glossary/approved.json',import.meta.url),'utf8')));
if(errors.length)throw new Error(errors.join('\n'));
export default defineConfig({ output: 'static', outDir:process.env.PUBLIC_GLOSSARY_REVIEW==='true'?'.preview-build/glossary-review':'./dist', integrations: [react(),{
  name:'glossary-public-gate',hooks:{'astro:build:done':({dir})=>checkGlossaryBundle(fileURLToPath(dir))},
}] });
