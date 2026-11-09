import { readdirSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';

// Also catch tree-shaken/partial records after an accidental dev-module import.
const handMatrix = JSON.parse(readFileSync(new URL('../content/research/atlas-hand-v1/matrix.json', import.meta.url), 'utf8'));
const handSignatures = [
  ...handMatrix.term_field_claims.map(row => row.claim_key),
  ...handMatrix.term_senses.map(row => row.sense_key),
  ...handMatrix.content_sources.filter(source => source.authority === 'editorial').map(source => source.title),
];

/** Inspect the actual output, including chunks that no HTML references. */
export function checkResearchBundle(directory) {
  let checked = 0;
  function visit(path) {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const file = join(path, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.isFile() && ['.html', '.js', '.json', '.map', '.csv', '.md'].includes(extname(file))) {
        checked++;
        const body = readFileSync(file, 'utf8');
        if (/TC-[A-Z]+-\d{3}|taekwondo-research-audit|taekwondo-local-review|taekwondo-atlas-hand-research|Conferência e propostas editoriais|source_locator_verified/.test(body) || handSignatures.some(signature => body.includes(signature))) throw new Error('Pesquisa privada ou laboratório incluído no pacote público: ' + file);
      }
    }
  }
  visit(directory);
  return { checked, researchRecordsExposed: 0 };
}
