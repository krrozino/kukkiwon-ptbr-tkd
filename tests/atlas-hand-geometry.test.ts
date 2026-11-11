import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { handOutline, fistOutline, surfaces, handSurfaceSlugs } from '../src/components/atlas/surfaces';
import { zonesFor } from '../src/components/atlas/zones';
import { zoneCopy } from '../src/components/atlas/zone-copy';

type Point = [number, number];

/** Avalia um caminho SVG (M, L, H, V, C, Q, Z) em uma polilinha densa para análise geométrica amostrada. */
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

describe('Atlas A1.1/A1.3 — geometria vetorial da mão e precisão amostrada dos recortes', () => {
  it('avalia os extremos reais das curvas dos cinco dedos (indicador y=16, médio y=9, anelar y=13.5, mínimo y=30)', () => {
    const thumbBox = bbox(sampleSvgPath(surfaces['illustration-thumb'].path, 64));
    const indexBox = bbox(sampleSvgPath(surfaces['illustration-finger-index'].path, 64));
    const middleBox = bbox(sampleSvgPath(surfaces['illustration-finger-middle'].path, 64));
    const ringBox = bbox(sampleSvgPath(surfaces['illustration-finger-ring'].path, 64));
    const littleBox = bbox(sampleSvgPath(surfaces['illustration-finger-little'].path, 64));

    // Extremos reais medidos nos ápices das curvas cúbicas:
    expect(indexBox.minY).toBeCloseTo(16, 3);
    expect(middleBox.minY).toBeCloseTo(9, 3);
    expect(ringBox.minY).toBeCloseTo(13.5, 3);
    expect(littleBox.minY).toBeCloseTo(30, 3);
    expect(thumbBox.minY).toBeCloseTo(55.823, 2);

    // Em coordenadas SVG (y cresce para baixo), menor minY = ápice mais alto (dedo mais longo).
    expect(middleBox.minY).toBeLessThan(ringBox.minY);
    expect(ringBox.minY).toBeLessThan(indexBox.minY);
    expect(indexBox.minY).toBeLessThan(littleBox.minY);
    expect(littleBox.minY).toBeLessThan(thumbBox.minY);

    // O dedo mínimo (y=30) é substancialmente mais baixo que o indicador (y=16) e o anelar (y=13.5).
    expect(littleBox.minY - indexBox.minY).toBeCloseTo(14, 3);
    expect(littleBox.minY - ringBox.minY).toBeCloseTo(16.5, 3);

    // Ordenação horizontal estrita (radial -> ulnar na vista palmar).
    expect(thumbBox.minX).toBeLessThan(indexBox.minX);
    expect(indexBox.minX).toBeLessThan(middleBox.minX);
    expect(middleBox.minX).toBeLessThan(ringBox.minX);
    expect(ringBox.minX).toBeLessThan(littleBox.minX);
  });

  it('separa os dedos nas comissuras interdigitais (38,58), (50,57) e (61,62) e mantém as fendas abertas fora das zonas', () => {
    const outlinePoly = sampleSvgPath(handOutline, 32);
    const indexPoly = sampleSvgPath(surfaces['illustration-finger-index'].path, 32);
    const middlePoly = sampleSvgPath(surfaces['illustration-finger-middle'].path, 32);
    const ringPoly = sampleSvgPath(surfaces['illustration-finger-ring'].path, 32);
    const littlePoly = sampleSvgPath(surfaces['illustration-finger-little'].path, 32);
    const middleBox = bbox(middlePoly);
    const ringBox = bbox(ringPoly);
    const littleBox = bbox(littlePoly);

    // As comissuras (38,58), (50,57) e (61,62) são pontos de encontro na base dos dedos,
    // com fenda aberta acima de cada comissura (e não uma parede vertical compartilhada).
    expect(middleBox.maxX).toBeCloseTo(ringBox.minX, 3);
    expect(ringBox.maxX).toBeCloseTo(littleBox.minX, 3);
    expect(minDistanceToBoundary([38, 58], indexPoly)).toBeLessThan(1e-4);
    expect(minDistanceToBoundary([38, 58], middlePoly)).toBeLessThan(1e-4);
    expect(minDistanceToBoundary([50, 57], middlePoly)).toBeLessThan(1e-4);
    expect(minDistanceToBoundary([50, 57], ringPoly)).toBeLessThan(1e-4);
    expect(minDistanceToBoundary([61, 62], ringPoly)).toBeLessThan(1e-4);
    expect(minDistanceToBoundary([61, 62], littlePoly)).toBeLessThan(1e-4);

    // Sondas dentro das fendas interdigitais acima das comissuras ficam fora da silhueta e de todos os dedos:
    const cleftProbes: Point[] = [
      [22, 58], // fenda polegar-indicador
      [38, 42], // fenda indicador-médio acima de (38, 58)
      [50, 42], // fenda médio-anelar acima de (50, 57)
      [61, 48], // fenda anelar-mínimo acima de (61, 62)
    ];
    for (const pt of cleftProbes) {
      expect(pointInPolygon(pt, outlinePoly), `fenda em (${pt[0]}, ${pt[1]}) fora da silhueta`).toBe(false);
      expect(pointInPolygon(pt, indexPoly), `fenda em (${pt[0]}, ${pt[1]}) fora do indicador`).toBe(false);
      expect(pointInPolygon(pt, middlePoly), `fenda em (${pt[0]}, ${pt[1]}) fora do médio`).toBe(false);
      expect(pointInPolygon(pt, ringPoly), `fenda em (${pt[0]}, ${pt[1]}) fora do anelar`).toBe(false);
      expect(pointInPolygon(pt, littlePoly), `fenda em (${pt[0]}, ${pt[1]}) fora do mínimo`).toBe(false);
    }

    // Na malha amostrada (passo 0.5), nenhum ponto pertence simultaneamente ao anelar e ao mínimo.
    for (let x = 50.25; x <= 72; x += 0.5) {
      for (let y = 12; y <= 68; y += 0.5) {
        const inRing = pointInPolygon([x, y], ringPoly);
        const inLittle = pointInPolygon([x, y], littlePoly);
        expect(inRing && inLittle, `sobreposição em (${x}, ${y})`).toBe(false);
      }
    }
  });

  it('valida fronteiras internas de sonnal, sonnaldeung e ageumson com tolerância de stroke (±0.75 u)', () => {
    const openFrontZones = zonesFor('hands', 'front', false).map(z => ({
      id: z.id,
      poly: sampleSvgPath(z.path, 32),
    }));
    const openBackZones = zonesFor('hands', 'back', false).map(z => ({
      id: z.id,
      poly: sampleSvgPath(z.path, 32),
    }));

    // Em repouso (.surface-cutout path tem stroke-width: 0.8 -> meia-largura 0.4 u).
    // Sondas a >= 0.65..0.75 u de cada fronteira interna devem pertencer exclusivamente
    // à superfície esperada e manter folga >= 0.45 u da borda.
    const strokeHalfWidth = 0.4;
    const frontBoundaryProbes: Array<{ label: string; point: Point; expected: string }> = [
      // Fronteira sonnal (x=63.5..62.5) <-> sonbadak (y=65..98, ponto médio em x=63.0, y=81.5)
      { label: 'sonbadak à esquerda de sonnal', point: [62.25, 81.5], expected: 'sonbadak' },
      { label: 'sonnal à direita de sonbadak', point: [63.75, 81.5], expected: 'sonnal' },
      // Fronteira sonnal <-> batangson (curva de (62.5,98) a (59.5,125), em y=110 x≈61.3)
      { label: 'batangson à esquerda de sonnal', point: [60.4, 110], expected: 'batangson' },
      { label: 'sonnal à direita de batangson', point: [62.2, 110], expected: 'sonnal' },
      // Fronteira sonnal <-> illustration-finger-little ((63.5,65)->(71.5,67), em x=67.5 y=66)
      { label: 'mínimo acima de sonnal', point: [67.5, 65.2], expected: 'illustration-finger-little' },
      { label: 'sonnal abaixo do mínimo', point: [67.5, 66.8], expected: 'sonnal' },
      // Fronteira sonnaldeung <-> illustration-finger-index ((30.5,42)->(31,62), em y=52 x=30.75)
      { label: 'sonnaldeung à esquerda do indicador', point: [30.0, 52], expected: 'sonnaldeung' },
      { label: 'indicador à direita de sonnaldeung', point: [31.5, 52], expected: 'illustration-finger-index' },
      // Fronteira sonnaldeung <-> ageumson ((25,72)->(29,72) e (29,72)->(31,62))
      { label: 'sonnaldeung acima de ageumson', point: [27, 71.25], expected: 'sonnaldeung' },
      { label: 'ageumson abaixo de sonnaldeung', point: [27, 72.75], expected: 'ageumson' },
      { label: 'sonnaldeung à esquerda do chanfro de ageumson', point: [29.2, 67], expected: 'sonnaldeung' },
      { label: 'ageumson à direita do chanfro de sonnaldeung', point: [30.8, 67], expected: 'ageumson' },
      // Fronteira ageumson <-> sonbadak ((31,62)->(36,66) e (36,66)->(35,86))
      { label: 'sonbadak acima do chanfro de ageumson', point: [33.5, 63.1], expected: 'sonbadak' },
      { label: 'ageumson abaixo do chanfro de sonbadak', point: [33.5, 64.9], expected: 'ageumson' },
      { label: 'ageumson à esquerda de sonbadak', point: [34.75, 76], expected: 'ageumson' },
      { label: 'sonbadak à direita de ageumson', point: [36.25, 76], expected: 'sonbadak' },
      // Fronteira ageumson <-> illustration-thumb ((20,86)->(25,72), em y=79 x=22.5)
      { label: 'polegar à esquerda de ageumson', point: [21.6, 79], expected: 'illustration-thumb' },
      { label: 'ageumson à direita do polegar', point: [23.4, 79], expected: 'ageumson' },
      // Fronteira ageumson <-> illustration-hand-side ((20,86)->(35,86), em x=28 y=86)
      { label: 'ageumson acima da borda radial', point: [28, 85.25], expected: 'ageumson' },
      { label: 'borda radial abaixo de ageumson', point: [28, 86.75], expected: 'illustration-hand-side' },
    ];

    for (const probe of frontBoundaryProbes) {
      const owners = openFrontZones.filter(z => pointInPolygon(probe.point, z.poly));
      expect(owners.map(z => z.id), probe.label).toEqual([probe.expected]);
      expect(minDistanceToBoundary(probe.point, owners[0].poly), `${probe.label}: folga de stroke`).toBeGreaterThan(strokeHalfWidth);
    }

    // Na vista dorsal, as mesmas sondas nas fronteiras equivalentes resolvem para sondeung, illustration-hand-base e illustration-hand-web:
    const backMap: Record<string, string> = {
      sonbadak: 'sondeung',
      batangson: 'illustration-hand-base',
      ageumson: 'illustration-hand-web',
    };
    for (const probe of frontBoundaryProbes) {
      const expectedBack = backMap[probe.expected] ?? probe.expected;
      const owners = openBackZones.filter(z => pointInPolygon(probe.point, z.poly));
      expect(owners.map(z => z.id), `dorso -> ${probe.label}`).toEqual([expectedBack]);
    }
  });

  it('mede partição planar amostrada (passo 1 u, margem de borda 0.25 u) sem sobreposição nos 4 estados', () => {
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
          if (distToOutline < 0.25) continue; // exclui vizinhança imediata do contorno nas amostras de malha

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
      expect(coveredCount / insideOutlineCount, `${label}: cobertura amostrada`).toBeGreaterThan(0.995);
      expect(overlapCount, `${label}: sobreposição amostrada entre zonas`).toBe(0);
      expect(outsideLeakCount, `${label}: vazamento amostrado fora da silhueta`).toBe(0);

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
