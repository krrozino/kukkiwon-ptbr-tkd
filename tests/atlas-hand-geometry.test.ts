import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { handOutline, fistOutline, surfaces, handSurfaceSlugs } from '../src/components/atlas/surfaces';
import { zonesFor } from '../src/components/atlas/zones';
import { zoneCopy } from '../src/components/atlas/zone-copy';

type Point = [number, number];

/** Avalia um caminho SVG (M, L, H, V, C, Q, Z) em uma polilinha densa para análise geométrica real. */
function sampleSvgPath(d: string, stepsPerCurve = 24): Point[] {
  const tokens = d.match(/[MLHVCQZ]|-?\d+(?:\.\d+)?/gi) ?? [];
  const points: Point[] = [];
  let i = 0;
  let cmd = '';
  let current: Point = [0, 0];
  let start: Point = [0, 0];
  const next = () => Number(tokens[i++]);
  const push = (p: Point) => {
    if (!points.length || Math.hypot(points[points.length - 1][0] - p[0], points[points.length - 1][1] - p[1]) > 1e-6) {
      points.push(p);
    }
  };
  while (i < tokens.length) {
    if (/^[A-Za-z]$/.test(tokens[i])) cmd = tokens[i++].toUpperCase();
    if (cmd === 'M') {
      current = [next(), next()];
      start = [...current];
      push(current);
      cmd = 'L';
    } else if (cmd === 'L') {
      current = [next(), next()];
      push(current);
    } else if (cmd === 'H') {
      current = [next(), current[1]];
      push(current);
    } else if (cmd === 'V') {
      current = [current[0], next()];
      push(current);
    } else if (cmd === 'Q') {
      const p0 = current;
      const p1: Point = [next(), next()];
      const p2: Point = [next(), next()];
      for (let s = 1; s <= stepsPerCurve; s++) {
        const t = s / stepsPerCurve;
        const u = 1 - t;
        push([
          u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
          u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
        ]);
      }
      current = p2;
    } else if (cmd === 'C') {
      const p0 = current;
      const p1: Point = [next(), next()];
      const p2: Point = [next(), next()];
      const p3: Point = [next(), next()];
      for (let s = 1; s <= stepsPerCurve; s++) {
        const t = s / stepsPerCurve;
        const u = 1 - t;
        push([
          u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
          u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
        ]);
      }
      current = p3;
    } else if (cmd === 'Z') {
      push(start);
      current = [...start];
    }
  }
  return points;
}

function pointInPolygon(point: Point, polygon: Point[]): boolean {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersects = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function minDistanceToBoundary(point: Point, polygon: Point[]): number {
  const [px, py] = point;
  let minDist = Infinity;
  for (let i = 0; i < polygon.length - 1; i++) {
    const [x1, y1] = polygon[i];
    const [x2, y2] = polygon[i + 1];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
    const dist = Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}

function bbox(polygon: Point[]) {
  const xs = polygon.map(p => p[0]);
  const ys = polygon.map(p => p[1]);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

describe('Atlas A1.1 — geometria vetorial da mão e precisão dos recortes', () => {
  it('avalia as curvas reais dos cinco dedos e confirma a hierarquia anatômica de comprimentos', () => {
    const thumbBox = bbox(sampleSvgPath(surfaces['illustration-thumb'].path));
    const indexBox = bbox(sampleSvgPath(surfaces['illustration-finger-index'].path));
    const middleBox = bbox(sampleSvgPath(surfaces['illustration-finger-middle'].path));
    const ringBox = bbox(sampleSvgPath(surfaces['illustration-finger-ring'].path));
    const littleBox = bbox(sampleSvgPath(surfaces['illustration-finger-little'].path));

    // Em coordenadas SVG (y cresce para baixo), menor minY = ápice mais alto (dedo mais longo).
    expect(middleBox.minY).toBeLessThan(ringBox.minY);
    expect(ringBox.minY).toBeLessThan(indexBox.minY);
    expect(indexBox.minY).toBeLessThan(littleBox.minY);
    expect(littleBox.minY).toBeLessThan(thumbBox.minY);

    // O dedo mínimo é substancialmente mais curto que o indicador e o anelar.
    expect(littleBox.minY - indexBox.minY).toBeGreaterThanOrEqual(12);
    expect(littleBox.minY - ringBox.minY).toBeGreaterThanOrEqual(15);

    // Ordenação horizontal estrita (radial -> ulnar na vista palmar).
    expect(thumbBox.minX).toBeLessThan(indexBox.minX);
    expect(indexBox.minX).toBeLessThan(middleBox.minX);
    expect(middleBox.minX).toBeLessThan(ringBox.minX);
    expect(ringBox.minX).toBeLessThan(littleBox.minX);
  });

  it('separa anelar e mínimo exatamente na comissura interdigital sem invasão', () => {
    const middleBox = bbox(sampleSvgPath(surfaces['illustration-finger-middle'].path));
    const ringPoly = sampleSvgPath(surfaces['illustration-finger-ring'].path);
    const littlePoly = sampleSvgPath(surfaces['illustration-finger-little'].path);
    const ringBox = bbox(ringPoly);
    const littleBox = bbox(littlePoly);

    // A fronteira entre médio e anelar coincide em x = 50; entre anelar e mínimo em x = 61.
    expect(middleBox.maxX).toBeCloseTo(ringBox.minX, 3);
    expect(ringBox.maxX).toBeCloseTo(littleBox.minX, 3);

    // Nenhum ponto interno do mínimo pertence ao anelar e vice-versa.
    for (let x = 50.25; x <= 72; x += 0.5) {
      for (let y = 12; y <= 68; y += 0.5) {
        const inRing = pointInPolygon([x, y], ringPoly);
        const inLittle = pointInPolygon([x, y], littlePoly);
        expect(inRing && inLittle, `sobreposição em (${x}, ${y})`).toBe(false);
      }
    }
  });

  it('mede partição planar com zero sobreposição e cobertura integral na mão aberta e no punho', () => {
    const cases = [
      { label: 'mão aberta — palma', view: 'front' as const, fist: false, outline: handOutline, expectedZones: 11 },
      { label: 'mão aberta — dorso', view: 'back' as const, fist: false, outline: handOutline, expectedZones: 11 },
      { label: 'punho — palma', view: 'front' as const, fist: true, outline: fistOutline, expectedZones: 4 },
      { label: 'punho — dorso', view: 'back' as const, fist: true, outline: fistOutline, expectedZones: 4 },
    ];

    for (const { label, view, fist, outline, expectedZones } of cases) {
      const outlinePoly = sampleSvgPath(outline, 32);
      const zones = zonesFor('hands', view, fist);
      expect(zones, label).toHaveLength(expectedZones);
      const zonePolys = zones.map(z => ({ id: z.id, poly: sampleSvgPath(z.path, 32), anchor: z.anchor }));

      let insideOutlineCount = 0;
      let coveredCount = 0;
      let overlapCount = 0;
      let outsideLeakCount = 0;

      for (let x = 2.3; x < 98; x += 1) {
        for (let y = 2.3; y < 136; y += 1) {
          const pt: Point = [x, y];
          const distToOutline = minDistanceToBoundary(pt, outlinePoly);
          if (distToOutline < 0.25) continue; // ignora pontos sobre a linha de contorno

          const inOutline = pointInPolygon(pt, outlinePoly);
          const matchingZones = zonePolys.filter(z => minDistanceToBoundary(pt, z.poly) >= 0.2 && pointInPolygon(pt, z.poly));
          const anyZone = zonePolys.filter(z => pointInPolygon(pt, z.poly));

          if (inOutline) {
            insideOutlineCount++;
            if (anyZone.length >= 1) coveredCount++;
            if (matchingZones.length > 1) overlapCount++;
          } else if (anyZone.length > 0) {
            outsideLeakCount++;
          }
        }
      }

      expect(insideOutlineCount, label).toBeGreaterThan(1500);
      expect(coveredCount / insideOutlineCount, `${label}: cobertura`).toBeGreaterThan(0.995);
      expect(overlapCount, `${label}: sobreposição entre zonas`).toBe(0);
      expect(outsideLeakCount, `${label}: vazamento fora da silhueta`).toBe(0);

      // Cada âncora deve cair exclusivamente dentro de sua própria zona e dentro da silhueta.
      for (const z of zonePolys) {
        expect(pointInPolygon(z.anchor, outlinePoly), `${label} -> âncora de ${z.id} na silhueta`).toBe(true);
        const owners = zonePolys.filter(candidate => pointInPolygon(z.anchor, candidate.poly)).map(c => c.id);
        expect(owners, `${label} -> âncora exclusiva de ${z.id}`).toEqual([z.id]);
      }
    }
  });

  it('preserva os 19 identificadores de superfície da mão e suas legendas ilustrativas', () => {
    expect(handSurfaceSlugs).toHaveLength(19);
    for (const slug of handSurfaceSlugs) {
      expect(surfaces[slug], slug).toBeDefined();
      expect(zoneCopy[slug], slug).toBeDefined();
      expect(zoneCopy[slug].title.length).toBeGreaterThan(2);
      expect(zoneCopy[slug].description.length).toBeGreaterThan(10);
    }
  });

  it('usa seletor html[data-theme="dark"] sem depender de prefers-color-scheme: dark no CSS global', () => {
    const css = readFileSync('src/styles/global.css', 'utf8');
    expect(css).toContain('[data-theme="dark"] .detail-svg .anatomy-edge');
    expect(css).not.toMatch(/@media\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)/);
  });
});
