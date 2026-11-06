import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync, readFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildResearchArtifacts, runResearchAudit } from '../scripts/research-audit.mjs';
import { checkResearchBundle } from '../scripts/check-research-bundle.mjs';

describe('Artefatos reproduzíveis e isolamento público', () => {
  it('preserva CSV gerado e originais após staging Git com autocrlf do Windows', () => {
    const path = mkdtempSync(join(tmpdir(), 'research-git-'));
    try {
      const git = (...args) => execFileSync('git', args, { cwd: path, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
      git('init', '-q'); git('config', 'core.autocrlf', 'true');
      writeFileSync(join(path, '.gitattributes'), readFileSync('.gitattributes'));
      mkdirSync(join(path, 'content/research/fixture/original'), { recursive: true });
      const files = ['content/research/fixture/candidates.csv', 'content/research/fixture/original/source.csv'];
      const bytes = Buffer.from('\ufeffheader,body\r\noriginal,"line\nline"\r\n');
      for (const file of files) writeFileSync(join(path, file), bytes);
      git('add', '.');
      for (const file of files) expect(git('show', ':' + file)).toEqual(bytes);
    } finally { rmSync(path, { recursive: true, force: true }); }
  });
  it('reproduz os115 originais sem mudar os108 registros existentes', () => {
    const artifacts = buildResearchArtifacts();
    expect(artifacts).toEqual(buildResearchArtifacts());
    expect(runResearchAudit()).toEqual({ candidates: 115, artifacts: 4, mode: 'checked' });
    const audit = JSON.parse(artifacts['audit.json']);
    expect(audit.records).toHaveLength(115); expect(audit.existing_terms).toHaveLength(108);
    expect(audit.records.every(r => r.original.publication_status === 'draft' && r.original.editorial_status === 'research')).toBe(true);
    const inventory = JSON.parse(artifacts['inventory.json']);
    expect(inventory.files).toHaveLength(13);
    expect(inventory.entities.reduce((n, e) => n + e.count, 0)).toBe(85);
    expect(inventory.references).toBe(42);
    for (const [name, body] of Object.entries(artifacts)) expect(readFileSync('content/research/gemini-2026-11-06/' + name, 'utf8')).toBe(body);
  });
  it('bloqueia dados e chunks órfãos do laboratório no pacote público', () => {
    const path = mkdtempSync(join(tmpdir(), 'research-public-'));
    try {
      writeFileSync(join(path, 'index.html'), '<h1>Catálogo sem fichas publicadas</h1>');
      expect(checkResearchBundle(path).researchRecordsExposed).toBe(0);
      writeFileSync(join(path, 'unreferenced.js'), 'const candidate="TC-CHA-001"');
      expect(() => checkResearchBundle(path)).toThrow(/Pesquisa privada/);
      writeFileSync(join(path, 'unreferenced.js'), 'const format="taekwondo-local-review"');
      expect(() => checkResearchBundle(path)).toThrow();
    } finally { rmSync(path, { recursive: true, force: true }); }
  });
});
