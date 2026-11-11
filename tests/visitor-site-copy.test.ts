import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const visitorFiles = [
  'src/pages/index.astro',
  'src/pages/catalogo.astro',
  'src/pages/kyorugi.astro',
  'src/pages/fontes.astro',
  'src/components/Catalogo.tsx',
  'src/components/TermContext.tsx',
  'src/components/PoomsaeApp.tsx',
  'src/components/GlossaryApp.tsx',
  'src/components/KoreanExpression.tsx',
  'src/components/Atlas.tsx',
  'src/components/atlas/AtlasSourceEvidence.tsx',
  'src/components/atlas/BodyRegionMap.tsx',
  'src/components/FichaTecnica.tsx',
  'src/components/ProvisionalAcervo.tsx',
];

const banned = [
  'Acervo em revisão',
  'registros provisórios',
  'Tradução em revisão',
  'Rascunho não validado',
  'Provisória, não verificada',
  'Termo coreano disponível após revisão',
  'Laboratório documental da mão',
  'As sequências detalhadas aparecerão após conferência',
  'Esta prévia ainda não apresenta fonte individual',
];

describe('Issue #64 — textos para visitantes', () => {
  it.each(visitorFiles)('%s não exibe estados editoriais', (path) => {
    const source = readFileSync(path, 'utf8');
    for (const text of banned) {
      expect(source, path + ': ' + text).not.toContain(text);
    }
  });
});
