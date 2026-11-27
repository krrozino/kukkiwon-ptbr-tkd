import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

type ReadOptions = {
  file?: string;
  directory?: string;
  reserved?: readonly string[];
  warn?: (message: string) => void;
};

export async function readLocalPoomsaeDossiers<T extends { slug: string }>(
  parse: (input: unknown) => T,
  { file = process.env.POOMSAE_RESEARCH_FILE, directory = process.env.POOMSAE_RESEARCH_DIR,
    reserved = [], warn = console.warn }: ReadOptions = {},
): Promise<T[]> {
  const paths = file ? [file] : [];
  if (directory) {
    try {
      const entries = await readdir(directory, { withFileTypes: true });
      paths.push(...entries.filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
        .map((entry) => join(directory, entry.name)).sort());
    } catch {
      warn('Diretório local de dossiês indisponível. Confira POOMSAE_RESEARCH_DIR.');
    }
  }

  const studies: T[] = [];
  const seen = new Set(reserved);
  for (const [index, path] of paths.entries()) {
    try {
      const study = parse(JSON.parse(await readFile(path, 'utf8')));
      if (seen.has(study.slug)) {
        warn(`Dossiê local ${index + 1} ignorado por identidade repetida.`);
        continue;
      }
      seen.add(study.slug);
      studies.push(study);
    } catch {
      warn(`Dossiê local ${index + 1} indisponível. Confira o arquivo e seu esquema.`);
    }
  }
  return studies;
}
