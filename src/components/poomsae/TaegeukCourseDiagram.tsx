import { Fragment } from 'react';
import { describeStudyDirection, studyDirectionLabel, studyDirections, type StudyDirection } from '../../data/poomsae-study';

import type { StudyMovement } from '../../data/poomsae-study-model';

interface Props {
  movements: readonly StudyMovement<string>[];
  active?: StudyMovement<string>;
}

const lines = [
  { y: 67, left: 'da3', right: 'ra3' },
  { y: 125, left: 'da2', right: 'ra2' },
  { y: 183, left: 'da1', right: 'ra1' },
] as const;

function formatSteps(numbers: readonly number[]) {
  const ranges: { first: number; last: number }[] = [];
  for (const number of numbers) {
    const previous = ranges.at(-1);
    if (previous && previous.last + 1 === number) previous.last = number;
    else ranges.push({ first: number, last: number });
  }
  return ranges.map(({ first, last }) => first === last ? String(first) : `${first}–${last}`).join(', ');
}

export default function TaegeukCourseDiagram({ movements, active }: Props) {
  const onDirection = (direction: StudyDirection) => formatSteps(
    movements.filter((movement) => movement.direction === direction).map((movement) => movement.number),
  );
  const axialSteps = formatSteps(
    movements.filter(({ direction }) => direction === 'ga' || direction === 'na').map(({ number }) => number),
  );

  return (
    <figure className="study-gallery-panel">
      <svg viewBox="0 0 360 250" role="img" aria-label="Na e Ga formam o eixo central. Na é o ponto de partida, na parte de baixo, e Ga é a frente, no topo. Da fica à esquerda e Ra à direita na orientação inicial do praticante.">
        <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M180 37V213" opacity=".52" />
          <path d="M180 211V192 M175 197L180 192 185 197" />
          {lines.map(({ y }) => <line key={y} x1="52" x2="308" y1={y} y2={y} opacity=".52" />)}
        </g>
        <g fill="currentColor" fontSize="12" fontWeight="650" textAnchor="middle">
          <text x="180" y="25" data-selected={active?.direction === 'ga' || undefined}>{studyDirectionLabel('ga')}</text>
          <text x="180" y="233" data-selected={active?.direction === 'na' || undefined}>Início ({studyDirections.na.label})</text>
          {lines.map(({ y, left, right }) => (
            <Fragment key={y}>
              <circle cx="180" cy={y} r="5" />
              <text x="85" y={y - 11} data-selected={active?.direction === left || undefined}>{studyDirections[left].label}</text>
              <text x="275" y={y - 11} data-selected={active?.direction === right || undefined}>{studyDirections[right].label}</text>
              <text x="85" y={y + 20} fontSize="11" fontWeight="400">{onDirection(left)}</text>
              <text x="275" y={y + 20} fontSize="11" fontWeight="400">{onDirection(right)}</text>
            </Fragment>
          ))}
        </g>
      </svg>
      <figcaption>
        <strong>Linhas de deslocamento</strong>
        {active && <span>Movimento {active.number} · {describeStudyDirection(undefined, active.direction).label}</span>}
        <span>Orientação inicial do praticante. A seta em Na indica para onde ele olha na preparação. Etapas no eixo central: {axialSteps}. Esquema autoral, sem escala.</span>
      </figcaption>
    </figure>
  );
}
