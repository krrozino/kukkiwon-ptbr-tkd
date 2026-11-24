import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { bodyZones } from '../src/components/atlas/zones';
import { zoneCopy } from '../src/components/atlas/zone-copy';
import { getLibraryItem } from '../src/lib/library';
import { safeReferenceUrl } from '../src/lib/published-knowledge';
import { getTorsoAtlasRegion, getTorsoEntries, getTorsoLibraryLinks, torsoAtlasRegions } from '../src/lib/public-torso';
import { getLegsAtlasRegion, getLegsEntry, legsAtlasRegions } from '../src/lib/public-legs';

describe('atlas público de tronco e pernas/tornozelo', () => {
  it('cobre todos os recortes de tronco e pernas sem vazar conteúdo privado', () => {
    const torsoZoneIds = bodyZones.filter(z => z.area === 'torso').map(z => z.id);
    const legsZoneIds = bodyZones.filter(z => z.area === 'legs').map(z => z.id);
    expect(torsoAtlasRegions).toHaveLength(torsoZoneIds.length);
    expect(legsAtlasRegions).toHaveLength(legsZoneIds.length);
    expect(torsoAtlasRegions.some(r => r.slug === 'torso-solar-plexus')).toBe(true);
    expect(legsAtlasRegions.some(r => r.slug === 'legs-hip')).toBe(true);
    expect(legsAtlasRegions.some(r => r.slug === 'mureup')).toBe(true);
    expect(legsAtlasRegions.some(r => r.slug === 'jeonggangi')).toBe(true);
    expect(legsAtlasRegions.some(r => r.slug === 'legs-ankle')).toBe(true);

    for (const region of [...torsoAtlasRegions, ...legsAtlasRegions]) {
      expect(zoneCopy[region.id], region.id).toBeDefined();
    }
    expect(getLegsAtlasRegion('legs-knee')?.slug).toBe('mureup');
    expect(getLegsAtlasRegion('legs-shin')?.slug).toBe('jeonggangi');
    expect(getTorsoAtlasRegion('torso-solar-plexus')?.detail_view).toBe('front');

    for (const rel of [
      'src/lib/public-torso.ts',
      'src/lib/public-legs.ts',
      'src/components/atlas/PublicTorsoContent.tsx',
      'src/components/atlas/PublicLegsContent.tsx',
    ]) {
      const code = readFileSync(resolve(process.cwd(), rel), 'utf8');
      expect(code).not.toMatch(/content\/research|content\/review|content\/provisional/i);
    }
  });

  it('valida URLs seguras, localizadores e vínculos reais com a Biblioteca', () => {
    for (const region of torsoAtlasRegions) {
      const entries = getTorsoEntries(region.slug) ?? [];
      for (const entry of entries) {
        expect(safeReferenceUrl(entry.reference.url)).toBe(true);
        expect(entry.reference.locator.trim().length).toBeGreaterThan(3);
        if (entry.korean?.hangul) {
          expect(entry.korean.hangulProvenance).toBeDefined();
        }
        if (entry.linguisticReference) {
          expect(safeReferenceUrl(entry.linguisticReference.url)).toBe(true);
          expect(entry.linguisticReference.locator.trim().length).toBeGreaterThan(3);
        }
        if (entry.extraReference) {
          expect(safeReferenceUrl(entry.extraReference.url)).toBe(true);
          expect(entry.extraReference.locator.trim().length).toBeGreaterThan(3);
        }
      }
      for (const link of getTorsoLibraryLinks(region.slug) ?? []) {
        if (link.href.startsWith('/biblioteca/')) {
          const slug = link.href.split('/').pop()!;
          expect(getLibraryItem(slug), slug).toBeDefined();
        }
      }
    }

    for (const region of legsAtlasRegions) {
      const entry = getLegsEntry(region.slug);
      expect(entry, region.slug).toBeDefined();
      if (entry?.reference) {
        expect(safeReferenceUrl(entry.reference.url)).toBe(true);
        expect(entry.reference.locator.trim().length).toBeGreaterThan(3);
      }
      if (entry?.hangul) {
        expect(entry.hangulProvenance).toBeDefined();
      }
      if (entry?.linguisticReference) {
        expect(safeReferenceUrl(entry.linguisticReference.url)).toBe(true);
        expect(entry.linguisticReference.locator.trim().length).toBeGreaterThan(3);
      }
      if (entry?.extraReference) {
        expect(safeReferenceUrl(entry.extraReference.url)).toBe(true);
        expect(entry.extraReference.locator.trim().length).toBeGreaterThan(3);
      }
      if (entry?.libraryLink?.href.startsWith('/biblioteca/')) {
        const parts = entry.libraryLink.href.split('/').filter(Boolean);
        if (parts.length === 3) expect(getLibraryItem(parts[2]), parts[2]).toBeDefined();
      }
    }
  });
});
