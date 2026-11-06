import { readdirSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';

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
        if (/TC-[A-Z]+-\d{3}|taekwondo-research-audit|taekwondo-local-review|Conferência e propostas editoriais|source_locator_verified/.test(body)) throw new Error('Pesquisa privada ou laboratório incluído no pacote público: ' + file);
      }
    }
  }
  visit(directory);
  return { checked, researchRecordsExposed: 0 };
}
