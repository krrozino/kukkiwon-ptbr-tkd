import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import {
  studyDirectionLabel,
  studyDirections,
  type PoomsaeStudy,
  type StudyDirection,
  type StudyMovement,
  type StudyReference,
  type StudyTerm,
} from '../../data/poomsae-study';

function MovementSource({
  citation,
  source,
}: {
  citation: PoomsaeStudy['start']['citation'];
  source: PoomsaeStudy['source'];
}) {
  return (
    <a className="claim-source" href={source.url + '#page=' + citation.page} target="_blank" rel="noopener noreferrer">
      {source.institution} · p. {citation.page} · quadro {citation.locator} ↗
    </a>
  );
}

function ReferenceLink({ reference }: { reference: StudyReference }) {
  const { institution, title, url, page, locator } = reference;
  const href = new URL(url);
  if (page) href.hash = 'page=' + page;
  return (
    <a className="claim-source" href={href.href} target="_blank" rel="noopener noreferrer">
      {institution} · {page ? 'p. ' + page + ' · ' : title + ' · '}{locator}{'\u00A0↗'}
    </a>
  );
}

function TermLink({ term }: { term: StudyTerm }) {
  return (
    <>
      {term.href ? <a className="inline-link" href={term.href}>{term.label}</a> : term.label}
      {term.hangul && <> <span lang="ko">{term.hangul}</span></>}
    </>
  );
}

function StudyBoundary({ label, boundary, source }: {
  label: string;
  boundary: PoomsaeStudy['start'];
  source: PoomsaeStudy['source'];
}) {
  return (
    <div className="study-boundary">
      <div>
        <span className="eyebrow">{label}</span>
        <strong>{boundary.title}</strong>
      </div>
      <span><TermLink term={boundary.base} /></span>
      <span>Posição {studyDirections[boundary.position].label} · voltado para {studyDirectionLabel(boundary.direction)}</span>
      {boundary.displacement && <span>{boundary.displacement}</span>}
      <MovementSource source={source} citation={boundary.citation} />
    </div>
  );
}

function DirectionMarker({ direction }: { direction: StudyDirection }) {
  const { angle } = studyDirections[direction];

  return (
    <svg viewBox="0 0 176 108" role="img" aria-label={studyDirectionLabel(direction) + ' na orientação inicial'}>
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

function MovementFacts({ movement }: { movement: StudyMovement }) {
  const direction = studyDirections[movement.direction];
  return (
    <>
      <dl className="study-step-facts">
        <div>
          <dt>Direção no diagrama</dt>
          <dd><span aria-hidden="true">{direction.arrow} </span>{studyDirectionLabel(movement.direction)}</dd>
        </div>
        <div>
          <dt>Deslocamento dos pés</dt>
          <dd>{movement.displacement}</dd>
        </div>
      </dl>
      <div>
        <strong>Posição final</strong>
        <dl className="study-step-facts">
          <div>
            <dt>Base</dt>
            <dd><TermLink term={movement.base} /></dd>
          </div>
          <div>
            <dt>Lado da base</dt>
            <dd>{movement.baseSide}</dd>
          </div>
          <div>
            <dt>Pé da frente</dt>
            <dd>{movement.leadFoot}</dd>
          </div>
        </dl>
      </div>
    </>
  );
}

function MovementActions({ movement }: { movement: StudyMovement }) {
  return (
    <>
      <ol className="study-frames" aria-label="Ações da etapa">
        {movement.frames.map(({ id, label, kind, executor, hangul, romanization, reference, link }) => (
          <li key={id}>
            <strong>Quadro {id} · {kind} · {label}</strong>
            <span>{romanization}{hangul && <> · <span lang="ko">{hangul}</span></>}</span>
            <span>Membro executante · <span>{executor}</span></span>
            {link && <a className="inline-link" href={link.href}>{link.label}</a>}
            <ReferenceLink reference={reference} />
          </li>
        ))}
      </ol>
      {movement.references?.length ? (
        <ul className="study-references" aria-label="Referências complementares da etapa">
          {movement.references.map((reference) => (
            <li key={reference.locator}><ReferenceLink reference={reference} /></li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

export default function VisualSequence({ study }: { study: PoomsaeStudy }) {
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const [mode, setMode] = useState<'overview' | 'steps' | 'review'>('overview');
  const [index, setIndex] = useState(0);
  const { movements } = study;
  const active = movements[index];
  const actionCount = movements.reduce((total, movement) => total + movement.frames.length, 0);

  useEffect(() => {
    if (mode === 'steps') heading.current?.focus();
  }, [mode, index]);

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
          <p className="study-count">{movements.length} etapas numeradas · {actionCount} ações</p>
          <p className="muted">{study.readingNote}</p>
          <p className="muted">As setas seguem a orientação inicial de quem pratica, mesmo após os giros. Na preparação, a pessoa começa em Na e olha para Ga (frente).</p>
        </div>
        <div className="study-mode" role="group" aria-label="Modo de estudo">
          <button type="button" aria-pressed={mode === 'overview'} onClick={() => setMode('overview')}>
            Visão geral
          </button>
          <button type="button" aria-pressed={mode === 'steps'} onClick={() => setMode('steps')}>
            Passo a passo
          </button>
          <button type="button" aria-pressed={mode === 'review'} onClick={() => setMode('review')}>
            Ficha de revisão
          </button>
        </div>
      </div>

      {mode === 'overview' ? (
        <>
          <StudyBoundary label="Início" boundary={study.start} source={study.source} />
          <ol className="study-movements">
            {movements.map((movement, position) => {
              const orientation = studyDirections[movement.direction];
              const frameCount = movement.frames.length;
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
                      <span aria-hidden="true">{orientation.arrow}</span> {studyDirectionLabel(movement.direction)}
                      {frameCount > 1 && (
                        <> · <span>{frameCount} quadros</span></>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <StudyBoundary label="Fim" boundary={study.finish} source={study.source} />
        </>
      ) : mode === 'steps' ? (
        <section className="study-step" aria-label="Movimento selecionado" onKeyDown={handleKeys}>
          <div className="study-step-content">
            <div>
              <p className="eyebrow" role="status">Movimento {active.number} de {movements.length}</p>
              <h3 ref={heading} tabIndex={-1}>{active.title}</h3>
              <p>{active.description}</p>
              <MovementFacts movement={active} />
              <MovementActions movement={active} />
            </div>
            <figure className="study-direction">
              <DirectionMarker direction={active.direction} />
              <figcaption>{studyDirectionLabel(active.direction)} · orientação inicial</figcaption>
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
      ) : (
        <section className="study-review" aria-label="Ficha de revisão docente">
          <div className="study-review-boundaries">
            <StudyBoundary label="Início" boundary={study.start} source={study.source} />
            <StudyBoundary label="Fim" boundary={study.finish} source={study.source} />
          </div>
          <ol className="study-review-list">
            {movements.map((movement, position) => {
              const frames = movement.frames.map(({ id }) => id).join(', ');

              return (
                <li key={movement.number} className="study-review-card">
                  <div className="study-review-header">
                    <div>
                      <p className="eyebrow">
                        Movimento {String(movement.number).padStart(2, '0')} · Quadro(s) {frames}
                      </p>
                      <h3>{movement.title}</h3>
                    </div>
                    <button
                      type="button"
                      className="study-review-jump"
                      onClick={() => selectMovement(position)}
                    >
                      Estudar passo {movement.number}
                    </button>
                  </div>

                  <p>{movement.description}</p>
                  <MovementFacts movement={movement} />
                  <MovementActions movement={movement} />
                  <div className="study-review-points">
                    <strong>Pontos para confirmação docente</strong>
                    <ul>
                      <li>Conferir a lateralidade na imagem do quadro e a leitura do deslocamento na legenda.</li>
                      {movement.frames.length > 1 && <li>Conferir a transição do chute ao apoio e ao soco.</li>}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </section>
  );
}
