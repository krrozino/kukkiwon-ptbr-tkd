import { describe, it, expect } from 'vitest';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { checkResearchBundle } from '../scripts/check-research-bundle.mjs';
import { handTermDocumentation, validateHandMatrix } from '../src/lib/atlas-hand-documentation.ts';
import { handSurfaceSlugs } from '../src/components/atlas/surfaces';

const matrix = () => JSON.parse(readFileSync('content/research/atlas-hand-v1/matrix.json', 'utf8'));

describe('Atlas A2 — auditoria e compatibilidade', () => {
  it('auditoria offline confere os artefatos e recusa flags de rede/escrita remota', () => {
    const result = JSON.parse(execFileSync(process.execPath, ['scripts/atlas-hand-audit.mjs', '--offline', '--check', '--json'], { encoding: 'utf8', windowsHide: true }));
    expect(result).toMatchObject({ terms: 23, regions: 19, geometryMappedTerms: 9, publishedRows: 0, networkRequests: 0, remoteWrites: 0 });
    const rejected = spawnSync(process.execPath, ['scripts/atlas-hand-audit.mjs', '--remote'], { encoding: 'utf8', windowsHide: true });
    expect(rejected.status).toBe(2);
  });

  it('cobre exatamente as regiões existentes da mão sem editar ou inferir geometria', () => {
    const data = validateHandMatrix(matrix());
    expect(data.body_regions.map(r => r.slug).sort()).toEqual([...handSurfaceSlugs].sort());
    const catalog = ['kukkiwon-2012-first20','kukkiwon-2012-expansion','sprint02-sonnal-variants']
      .flatMap(name => JSON.parse(readFileSync('content/review/' + name + '.json', 'utf8')).records);
    for (const term of data.technical_terms) {
      const prior = catalog.find(r => r.slug === term.slug);
      expect(term.existing_term_slug).toBe(prior ? term.slug : null);
      if (prior?.hangul) expect(handTermDocumentation(data, term.slug).claims.some(c => c.field_name === 'hangul' && c.value === prior.hangul)).toBe(true);
    }
    for (const relation of data.term_relations) expect(catalog.some(t => t.slug === relation.term_slug)).toBe(true);
  });

  it('confere os pares documentais e preserva a romanização histórica ainda não localizada', () => {
    const data = validateHandMatrix(matrix());
    for (const [slug, hangul, romanization] of [
      ['sonnal','손날','Sonnal'], ['sonnaldeung','손날등','Sonnaldeung'],
      ['sonbadak','손바닥','Sonbadak'], ['batangson','바탕손','Batangson'],
      ['ageumson','아금손','Ageumson'], ['sondeung','손등','Sondeung'],
      ['jumeok','주먹','Jumeok'], ['deungjumeok','등주먹','Deungjumeok'],
      ['mejumeok','메주먹','Mejumeok'], ['modumsonkkeut','모둠손끝','Modumsonkkeut'],
      ['moeundusonkkeut','모은두손끝','Moeundusonkkeut'], ['moeunsesonkkeut','모은세손끝','Moeunsesonkkeut'],
    ]) {
      const claims = handTermDocumentation(data, slug).claims.filter(c => c.source_id === 'KUK-2012-TERMINOLOGY');
      expect(claims.some(c => c.field_name === 'hangul' && c.value === hangul)).toBe(true);
      expect(claims.some(c => c.field_name === 'romanization' && c.value === romanization)).toBe(true);
    }
    const historical = handTermDocumentation(data, 'seun-pyeonjumeok');
    expect(historical.claims.some(c => c.field_name === 'hangul' && c.value === '세운편주먹')).toBe(true);
    expect(historical.claims.some(c => c.field_name === 'romanization')).toBe(false);
    expect(historical.term.research_gaps.some(g => g.field_name === 'romanization')).toBe(true);
  });

  it('mantém relações técnica → superfície no vocabulário aceito pelo esquema existente', () => {
    const data = validateHandMatrix(matrix());
    expect(data.term_relations.length).toBeGreaterThan(0);
    for (const relation of data.term_relations) expect(relation.relation_kind).toBe('related');
  });

  it('impede inclusão da matriz ou chunk órfão de pesquisa no pacote público', () => {
    const directory = mkdtempSync(join(tmpdir(), 'atlas-a2-public-'));
    try {
      writeFileSync(join(directory, 'orphan.json'), JSON.stringify(matrix()));
      expect(() => checkResearchBundle(directory)).toThrow(/Pesquisa privada/);
    } finally { rmSync(directory, { recursive: true, force: true }); }
  });
});
