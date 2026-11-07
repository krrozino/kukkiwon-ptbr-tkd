import { describe, expect, it } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { loadProvisionalAcervo, provisionalReviewCsv } from '../scripts/provisional-acervo.mjs';

describe('pipeline local do acervo consultável',()=>{
  it('reúne 108 registros existentes e 12 novos com fonte por campo e alvo separado de superfície',()=>{
    const entries=loadProvisionalAcervo();
    expect(entries).toHaveLength(120);
    expect(new Set(entries.map(e=>e.slug)).size).toBe(120);
    expect(entries.every(e=>e.status==='provisional' && Object.values(e.fields).every(f=>f.evidence.review==='pending'))).toBe(true);
    const lock=entries.find(e=>e.slug==='palgup-biteureo-kkeokgi');
    expect(lock.relations).toEqual([expect.objectContaining({regionSlug:'palgup',role:'target',evidence:expect.objectContaining({locator:expect.stringContaining('p. 43'),accessedAt:'2026-11-07'})})]);
    expect(entries.find(e=>e.slug==='palgup-dollyeo-chigi').relations[0].role).toBe('surface');
    expect(entries.find(e=>e.slug==='ogeum-georeo-neomgigi').relations).toEqual([]);
  });
  it('exporta por campo e relação, mantendo decisão e revisor vazios e neutralizando fórmulas',()=>{
    const entries=loadProvisionalAcervo();
    const csv=provisionalReviewCsv(entries);
    expect(csv).toContain('"region:target";"palgup"');
    expect(csv).toContain('"pendente";"";"";""');
    entries[0].fields.translation_pt.value='=HYPERLINK("https://example.org")';
    expect(provisionalReviewCsv(entries)).toContain('"\'=HYPERLINK(');
  });
  it('CLI nunca sobrescreve uma revisão já preenchida e recusa caminhos fora do diretório local',()=>{
    const name='test-acervo-'+process.pid+'.csv',path='review-output/'+name;
    try {
      execFileSync(process.execPath,['scripts/provisional-acervo.mjs','--review',name]);
      const before=readFileSync(path,'utf8');
      const second=spawnSync(process.execPath,['scripts/provisional-acervo.mjs','--review',name],{encoding:'utf8',windowsHide:true});
      expect(second.status).toBe(1);expect(readFileSync(path,'utf8')).toBe(before);
      expect(spawnSync(process.execPath,['scripts/provisional-acervo.mjs','--review','../escape.csv'],{windowsHide:true}).status).toBe(1);
    } finally {rmSync(path,{force:true});}
  });
});
