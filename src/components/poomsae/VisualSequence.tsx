import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import {
  studyDirections,
  type PoomsaeStudy,
  type StudyDirection,
  type StudyLink,
  type StudyMovement,
  type StudyReference,
  type StudyTerm,
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

function ReferenceLink({ reference }: { reference: StudyReference }) {
  const { institution, title, url, page, locator } = reference;
  const href = new URL(url);
  if (page) href.hash = 'page=' + page;
  return (
    <a className="claim-source" href={href.href} target="_blank" rel="noopener noreferrer">
      {institution} · {page ? 'p. ' + page + ' · ' : title + ' · '}{locator} ↗
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
      {boundary.stance && <span><TermLink term={boundary.stance} /></span>}
      <MovementSource source={source} citation={boundary.citation} />
    </div>
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

function TechniqueLink({ link }: { link: StudyLink }) {
  return (
    <div className="study-technique-link">
      <a className="inline-link" href={link.href}>{link.label}</a>
      {link.note && <span className="study-link-note">{link.note}</span>}
    </div>
  );
}

function DiscrepancyCallout({ movement }: { movement: StudyMovement }) {
  if (!movement.transitionPending) return null;

  return (
    <div className="study-discrepancy" role="note">
      <strong>Divergência entre fontes · revisão docente</strong>
      <p>Deslocamento em revisão docente. O diagrama indica a direção da etapa.</p>
      {movement.discrepancy?.variants.length ? (
        <ul className="study-discrepancy-variants">
          {movement.discrepancy.variants.map((variant) => (
            <li key={variant.reference.url + variant.reference.locator}>
              <span>{variant.summary}</span>
              <ReferenceLink reference={variant.reference} />
            </li>
          ))}
        </ul>
      ) : null}
      {movement.discrepancy?.note && <p className="fine-print">{movement.discrepancy.note}</p>}
    </div>
  );
}

function movementReviewPoints(movement: StudyMovement): readonly string[] {
  if (movement.reviewPoints?.length) return movement.reviewPoints;

  const points: string[] = [];
  if ((movement.frameCount ?? movement.frames?.length ?? 1) > 1) {
    points.push('Confirmar transição entre os dois quadros da etapa e base final.');
  }
  points.push('Confirmar nomenclatura, lateralidade e alinhamento com a demonstração oficial.');
  return points;
}

function movementFrameSummary(movement: StudyMovement): string {
  if (movement.frames?.length) {
    return movement.frames.length === 1
      ? `Quadro ${movement.frames[0].id}`
      : `Quadros ${movement.frames.map((frame) => frame.id).join(', ')}`;
  }
  return `Quadro ${movement.citation.locator}`;
}

export default function VisualSequence({ study }: { study: PoomsaeStudy }) {
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const [mode, setMode] = useState<'overview' | 'steps' | 'review'>('overview');
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
          {study.actionCount !== undefined && (
            <p className="study-count">{movements.length} etapas numeradas · {study.actionCount} ações</p>
          )}
          <p className="muted">{study.readingNote}</p>
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
              const frameCount = movement.frames?.length ?? movement.frameCount ?? 1;
              return (
                <li key={movement.number}>
                  <button
                    type="button"
                    aria-label={`Movimento ${movement.number}: ${movement.title}`}
                    data-pending={movement.transitionPending ? 'true' : undefined}
                    onClick={() => selectMovement(position)}
                  >
                    <span className="study-number">{String(movement.number).padStart(2, '0')}</span>
                    <span className="study-move-title">{movement.title}</span>
                    <span className="study-orientation">
                      <span aria-hidden="true">{orientation.arrow}</span> {orientation.label}
                      {frameCount > 1 && (
                        <> · <span>{frameCount} quadros</span></>
                      )}
                      {movement.transitionPending && (
                        <> · <span className="study-pending-flag">Revisão</span></>
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
              {active.description && <p>{active.description}</p>}
              <DiscrepancyCallout movement={active} />
              <dl className="study-step-facts">
                <div>
                  <dt>{(active.frames?.length ?? active.frameCount ?? 1) > 1 ? 'Base final' : 'Base'}</dt>
                  <dd><TermLink term={active.base} /> · {active.lead}</dd>
                </div>
                <div>
                  <dt>Direção no diagrama</dt>
                  <dd><span aria-hidden="true">{direction.arrow} </span>{direction.label}</dd>
                </div>
              </dl>
              {active.frames ? (
                <ol className="study-frames" aria-label="Ações da etapa">
                  {active.frames.map(({ id: frameId, label, hangul, romanization, reference, additionalReferences, link }, frameIndex) => (
                    <li key={frameId}>
                      <strong>
                        {active.frames && active.frames.length > 1 ? `${frameIndex + 1}ª ação · ` : ''}
                        Quadro {frameId} · {label}
                      </strong>
                      <span><span lang="ko">{hangul}</span> · {romanization}</span>
                      {link && <TechniqueLink link={link} />}
                      <ReferenceLink reference={reference} />
                      {additionalReferences.length > 0 && (
                        <details>
                          <summary>Outras fontes do quadro</summary>
                          {additionalReferences.map((entry) => (
                            <div key={entry.url + entry.locator}><ReferenceLink reference={entry} /></div>
                          ))}
                        </details>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <>
                  <ul className="study-techniques" aria-label="Fichas relacionadas">
                    {active.related.map((term) => (
                      <li key={term.href}><TechniqueLink link={term} /></li>
                    ))}
                  </ul>
                </>
              )}
              {!active.references?.length && <MovementSource source={study.source} citation={active.citation} />}
              {active.references?.length ? (
                <ul className="study-references" aria-label="Referências da etapa">
                  {active.references.map((reference) => (
                    <li key={reference.url + reference.locator}><ReferenceLink reference={reference} /></li>
                  ))}
                </ul>
              ) : null}
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
      ) : (
        <section className="study-review" aria-label="Ficha de revisão docente">
          <div className="study-review-boundaries">
            <StudyBoundary label="Início" boundary={study.start} source={study.source} />
            <StudyBoundary label="Fim" boundary={study.finish} source={study.source} />
          </div>
          <ol className="study-review-list">
            {movements.map((movement, position) => {
              const orientation = studyDirections[movement.direction];
              const isCompound = (movement.frames?.length ?? movement.frameCount ?? 1) > 1;
              const points = movementReviewPoints(movement);

              return (
                <li
                  key={movement.number}
                  className="study-review-card"
                  data-pending={movement.transitionPending ? 'true' : undefined}
                >
                  <div className="study-review-header">
                    <div>
                      <p className="eyebrow">
                        Movimento {String(movement.number).padStart(2, '0')} · {movementFrameSummary(movement)}
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

                  {movement.description && <p>{movement.description}</p>}

                  <dl className="study-step-facts">
                    <div>
                      <dt>{isCompound ? 'Base final' : 'Base'}</dt>
                      <dd><TermLink term={movement.base} /></dd>
                    </div>
                    <div>
                      <dt>Lateralidade</dt>
                      <dd>{movement.lead}</dd>
                    </div>
                    <div>
                      <dt>Direção</dt>
                      <dd><span aria-hidden="true">{orientation.arrow} </span>{orientation.label}</dd>
                    </div>
                  </dl>

                  {movement.frames ? (
                    <ol className="study-frames" aria-label={`Técnicas do movimento ${movement.number}`}>
                      {movement.frames.map(({ id: frameId, label, hangul, romanization, reference, additionalReferences, link }, frameIndex) => (
                        <li key={frameId}>
                          <strong>
                            {movement.frames && movement.frames.length > 1 ? `${frameIndex + 1}ª ação · ` : ''}
                            Quadro {frameId} · {label}
                          </strong>
                          <span><span lang="ko">{hangul}</span> · {romanization}</span>
                          {link && <TechniqueLink link={link} />}
                          <ReferenceLink reference={reference} />
                          {additionalReferences.map((entry) => (
                            <ReferenceLink key={entry.url + entry.locator} reference={entry} />
                          ))}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="study-review-tech">
                      <strong>Técnicas e fichas relacionadas</strong>
                      <ul className="study-techniques">
                        {movement.related.map((term) => (
                          <li key={term.href}><TechniqueLink link={term} /></li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="study-review-sources">
                    <strong>Fontes do movimento</strong>
                    {movement.references?.length ? (
                      <ul className="study-references">
                        {movement.references.map((reference) => (
                          <li key={reference.url + reference.locator}><ReferenceLink reference={reference} /></li>
                        ))}
                      </ul>
                    ) : (
                      <div><MovementSource source={study.source} citation={movement.citation} /></div>
                    )}
                  </div>

                  <DiscrepancyCallout movement={movement} />

                  <div className="study-review-points">
                    <strong>Pontos para confirmação docente</strong>
                    <ul>
                      {points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
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
