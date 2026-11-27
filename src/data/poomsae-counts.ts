import type { PoomsaeFormGuide } from './poomsae-guide';

export const poomsaeCountSource = {
  institution: 'Associação de Taekwondo de Daegu',
  url: 'https://daegutkd.net/taekwondo/skill.php',
  locator: 'Tabela 공인품새 · colunas 품 e 동작수',
  accessedOn: '2026-11-26',
};

const taegeukCounts = [
  [18, 20], [18, 23], [20, 34], [20, 29], [20, 32], [19, 31], [25, 33], [27, 38],
] as const;

const danCounts: Readonly<Record<string, readonly [number, number]>> = {
  koryo: [30, 45], keumgang: [27, 35], taebaek: [26, 38], pyongwon: [21, 25],
  sipjin: [28, 31], jitae: [28, 37], cheonkwon: [26, 27], hansu: [27, 34], ilyeo: [23, 27],
};

export function getPoomsaeCounts(guide: PoomsaeFormGuide) {
  const counts = guide.kind === 'taegeuk'
    ? taegeukCounts[guide.number - 1]
    : danCounts[guide.slug];
  return counts ? { stages: counts[0], actions: counts[1] } : undefined;
}
