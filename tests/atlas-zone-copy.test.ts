import {describe,expect,it} from 'vitest';
import {atlasZones,zonesFor} from '../src/components/atlas/zones';
import {zoneCopy} from '../src/components/atlas/zone-copy';

describe('atlas anatômico público',()=>{
  it('nomeia e explica todas as zonas, inclusive dedos e vistas dorsais',()=>{
    for(const zone of atlasZones){
      const copy=zoneCopy[zone.id];
      expect(copy,zone.id).toBeDefined();
      expect(copy.title.trim().length,zone.id).toBeGreaterThan(2);
      expect(copy.description.trim().length,zone.id).toBeGreaterThan(15);
      expect(copy.title).not.toMatch(/revisão|ilustrativa \d+/i);
      expect(copy.description).not.toMatch(/tradução oficial|homologad[ao]/i);
    }
  });
  it('mantém recortes orgânicos nos segmentos principais do corpo',()=>{
    for(const area of ['head','torso','arms','legs'] as const) {
      for(const view of ['front','back'] as const) {
        const zones=zonesFor(area,view);
        expect(zones.length,area+view).toBeGreaterThan(0);
        expect(zones.some(zone=>/[CQ]/.test(zone.path)),area+view).toBe(true);
      }
    }
  });
});
