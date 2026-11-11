import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { surfaces } from '../src/components/atlas/surfaces';
import { zonesFor } from '../src/components/atlas/zones';
import {
  getHandTerm, getHandRegion, getHandRegionForTerm, getHandTermForRegion,
  handAtlasRegions, handRegions, handTerms, searchHandTerms,
} from '../src/lib/public-hand';

const payload = JSON.parse(readFileSync('src/data/public-hand-v1.json','utf8'));

describe('Atlas público da mão — módulo funcional (Issue #72)', () => {
  it('preserva as 19 áreas e nove vínculos documentados', () => {
    expect(handRegions).toHaveLength(19);
    expect(handAtlasRegions).toHaveLength(19);
    expect(handTerms).toHaveLength(23);
    expect(handRegions.filter(region => region.termSlug)).toHaveLength(9);
    expect(handRegions.filter(region => region.termSlug === null)).toHaveLength(10);
    expect(new Set(handRegions.map(region => region.slug)).size).toBe(19);
    expect(new Set(handTerms.map(term => term.slug)).size).toBe(23);
    for (const region of handRegions) {
      expect(surfaces[region.slug], region.slug).toBeDefined();
      expect(region.name.trim().length).toBeGreaterThan(2);
      if (region.termSlug) expect(getHandTerm(region.termSlug)).not.toBeNull();
    }
  });
  it('cobre todos os recortes da mão aberta, dorso e ambos os punhos', () => {
    for (const view of ['front', 'back'] as const) {
      for (const fist of [false, true]) {
        for (const zone of zonesFor('hands',view,fist)) {
          expect(getHandRegion(zone.id), zone.id).not.toBeNull();
        }
      }
    }
  });
  it('exibe Hangul e pronúncia com fontes por campo', () => {
    const term = getHandTermForRegion('sonnal');
    expect(term).toMatchObject({slug:'sonnal',hangul:'손날',romanization:'Sonnal',pronunciation:'sôn-nal'});
    expect(term!.evidence).toEqual(expect.arrayContaining([
      expect.objectContaining({ field:'hangul',reference:expect.objectContaining({institution:'Kukkiwon'}) }),
      expect.objectContaining({ field:'romanization',reference:expect.objectContaining({institution:'Kukkiwon'}) }),
    ]));
    expect(getHandRegionForTerm('sonnal')?.slug).toBe('sonnal');
  });
  it('pesquisa por nome, Hangul, pronúncia, romanização e variantes', () => {
    expect(searchHandTerms('손날').map(term=>term.slug)).toContain('sonnal');
    expect(searchHandTerms('dju-mók').some(term=>term.slug==='jumeok')).toBe(true);
    expect(searchHandTerms('Moundusonkket').map(term=>term.slug)).toContain('moeundusonkkeut');
    expect(searchHandTerms('mínimo')).not.toEqual([]);
    expect(searchHandTerms('modumsonkkeut').map(term=>term.slug)).toContain('modumsonkkeut');
    expect(getHandRegionForTerm('modumsonkkeut')).toBeNull();
    expect(searchHandTerms('termo-que-nao-existe')).toHaveLength(0);
  });
  it('apresenta 14 relações técnicas com fontes sem inventar a execução', () => {
    const relations = handTerms.flatMap(term => term.related);
    expect(relations).toHaveLength(14);
    expect(getHandTerm('sonbadak')?.related.map(r=>r.name)).toContain('Bada-makgi');
    expect(relations.every(r => r.reference?.url.startsWith('https://'))).toBe(true);
    expect(relations.every(r => !('steps' in r))).toBe(true);
  });
  it('não inclui metadados internos nem a matriz bruta no JSON público', () => {
    const content=JSON.stringify(payload);
    for (const raw of ['term_field_claims','claim_key','source_id','publication_status','human_review','editorial_status','research_gaps','publish_to_site']) {
      expect(content).not.toContain('"'+raw+'"');
    }
    for (const term of handTerms) {
      expect(term.name.length).toBeGreaterThan(1);
      for (const entry of term.evidence) {
        expect(entry.reference?.url).toMatch(/^https:\/\//);
        expect(entry.reference?.locator).toBeTruthy();
      }
    }
  });
});
