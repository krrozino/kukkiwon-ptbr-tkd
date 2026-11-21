import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import {
  studyDirections,
 type PoomsaeStudy,
  type StudyDirection,
  type StudyMovement,
} from '../../data/poomsae-study';

function MovementSource({
  citation,
  source,
}: {
  citation: StudyMovement['citation'];
  source: PoomsaeStudy['source'];
}) {
  return (
    <a className="claim-source" href={source.url + '#page=' + citation.page} target="_blank" rel="noopener noreferrer">
      {source.institution} · p. {citation.page} · quadro {citation.locator} ↗
    </a>
  );
}

function DirectionMarker({ direction }: { direction: StudyDirection }) {
  const { angle, label } = studyDirections[direction];

  return (
    <svg viewBox="0 0 176 108" role="img" aria-label={'Esquema da direção ' + label}>
      <path d="M13 54H163 M88 12V96" stroke="currentColor" strokeDasharray="3 5" opacity=".45" />
      <circle cx="88" cy="54" r="40" fill="none" stroke="currentColor" opacity=".35" />
      <circle cx="88" cy="54" r="5" fill="currentColor" />
      <path
        d="M88 54H121 M108 41L121 54 108 67"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={`rotate(${angle} 88 54)`}
      />
    </svg>
  );
}

export default function VisualSequence({ study }: { study: PoomsaeStudy }) {
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const [mode, setMode] = useState<'overview' | 'steps'>('overview');
  const [index, setIndex] = useState(0);
  const { movements } = study;
  const active = movements[index];
  const direction = studyDirections[active.direction];

  useEffect(() => {
    if (mode === 'steps') heading.current?.focus();
  }, [mode]);

  function selectMovement(next: number) {
    setIndex(next);
    setMode('steps');
  }

  function moveBy(offset: number) {
    setIndex((current) => Math.max(0, Math.min(current + offset, movements.length - 1)));
  }

  function handleKeys(event: KeyboardEvent<HTMLElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveBy(event.key === 'ArrowRight' ? 1 : -1);
    }
  }

  return (
    <section className="study-section" id="sequencia" aria-labelledby={id + '-sequence'}>
      <div className="study-section-heading">
        <div>
          <h2 id={id + '-sequence'}>Sequência de movimentos</h2>
          <p className="muted">{study.readingNote}</p>
        </div>
        <div className="study-mode" role="group" aria-label="Modo de estudo">
          <button type="button" aria-pressed={mode === 'overview'} onClick={() => setMode('overview')}>
            Visão geral
          </button>
          <button type="button" aria-pressed={mode === 'steps'} onClick={() => setMode('steps')}>
            Passo a passo
          </button>
        </div>
      </div>

      {mode === 'overview' ? (
        <>
          <div className="study-boundary">
            <div>
              <span className="eyebrow">Início</span>
              <strong>{study.start.title}</strong>
            </div>
            <a className="inline-link" href={study.start.base.href}>{study.start.base.label}</a>
            <MovementSource source={study.source} citation={study.start.citation} />
          </div>
          <ol className="study-movements">
            {movements.map((movement, position) => {
              const orientation = studyDirections[movement.direction];
              return (
                <li key={movement.number}>
                  <button
                    type="button"
                    aria-label={`Movimento ${movement.number}: ${movement.title}`}
                    onClick={() => selectMovement(position)}
                  >
                    <span className="study-number">{String(movement.number).padStart(2, '0')}</span>
                    <span className="study-move-title">{movement.title}</span>
                    <span className="study-orientation">
                      <span aria-hidden="true">{orientation.arrow}</span> {orientation.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="study-boundary">
            <div>
              <span className="eyebrow">Fim</span>
              <strong>{study.finish.title}</strong>
            </div>
            <a className="inline-link" href={study.finish.base.href}>{study.finish.base.label}</a>
            <MovementSource source={study.source} citation={study.finish.citation} />
          </div>
        </>
      ) : (
        <section className="study-step" aria-label="Movimento selecionado" onKeyDown={handleKeys}>
          <div className="study-step-content">
            <div>
              <p className="eyebrow" role="status">Movimento {active.number} de {movements.length}</p>
              <h3 ref={heading} tabIndex={-1}>{active.title}</h3>
              <p>{active.description}</p>
              <dl className="study-step-facts">
                <div>
                  <dt>Base</dt>
                  <dd><a className="inline-link" href={active.base.href}>{active.base.label}</a> · {active.lead}</dd>
                </div>
                <div>
                  <dt>Direção no diagrama</dt>
                  <dd><span aria-hidden="true">{direction.arrow} </span>{direction.label}</dd>
                </div>
              </dl>
              <ul className="study-techniques" aria-label="Fichas relacionadas">
                {active.related.map((term) => (
                  <li key={term.href}><a className="inline-link" href={term.href}>{term.label}</a></li>
                ))}
              </ul>
              <MovementSource source={study.source} citation={active.citation} />
            </div>
            <figure className="study-direction">
              <DirectionMarker direction={active.direction} />
              <figcaption>Direção {direction.label} · esquema autoral</figcaption>
            </figure>
          </div>
          <div className="study-step-controls">
            <button type="button" disabled={index === 0} onClick={() => moveBy(-1)}>
              <span aria-hidden="true">← </span>Anterior
            </button>
            <button type="button" disabled={index === movements.length - 1} onClick={() => moveBy(1)}>
              Próximo<span aria-hidden="true"> →</span>
            </button>
            <div className="study-step-index" role="group" aria-label="Ir para o movimento">
              {movements.map((movement, position) => (
                <button
                  key={movement.number}
                  type="button"
                  aria-label={`Ir para movimento ${movement.number}`}
                  aria-current={position === index ? 'step' : undefined}
                  onClick={() => setIndex(position)}
                >
                  {movement.number}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}
    </section>
  );
}
