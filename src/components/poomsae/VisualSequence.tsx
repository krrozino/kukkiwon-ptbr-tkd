import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { describeStudyDirection } from '../../data/poomsae-study';
import type {
  PoomsaeStudy as StudyModel, StudyCourse, StudyMovement as MovementModel, StudyReference, StudyTerm,
} from '../../data/poomsae-study-model';
import type { PoomsaeFormGuide } from '../../data/poomsae-guide';
import { PoomsaeLineDiagram, TrigramDiagram } from './PoomsaeVisuals';
import TaegeukCourseDiagram from './TaegeukCourseDiagram';

type PoomsaeStudy = StudyModel<string>;
type StudyMovement = MovementModel<string>;

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

function StudyBoundary({ label, boundary, source, course }: {
  label: string;
  boundary: PoomsaeStudy['start'];
  course?: StudyCourse;
  source: PoomsaeStudy['source'];
}) {
  return (
    <div className="study-boundary">
      <div>
        <span className="eyebrow">{label}</span>
        <strong>{boundary.title}</strong>
      </div>
      <span><TermLink term={boundary.base} /></span>
      {boundary.stance && <span>Base · <TermLink term={boundary.stance} /></span>}
      <span>{boundary.position && <>Posição {describeStudyDirection(course, boundary.position).label} · </>}Orientação {describeStudyDirection(course, boundary.direction).label}</span>
      {boundary.displacement && <span>{boundary.displacement}</span>}
      <MovementSource source={source} citation={boundary.citation} />
    </div>
  );
}

function DirectionMarker({ angle, label }: { angle: number; label: string }) {

  return (
    <svg viewBox="0 0 176 108" role="img" aria-label={label + ' na orientação inicial'}>
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

function MovementFacts({ movement, course }: { movement: StudyMovement; course?: StudyCourse }) {
  const direction = describeStudyDirection(course, movement.direction);
  return (
    <>
      <dl className="study-step-facts">
        <div>
          <dt>{course?.kind === 'text' ? 'Direção na fonte' : 'Direção no diagrama'}</dt>
          <dd><span aria-hidden="true">{direction.arrow} </span>{direction.label}</dd>
        </div>
        <div>
          <dt>Deslocamento dos pés</dt>
          <dd>{movement.transitionPending ? 'Deslocamento em revisão docente' : movement.displacement ?? 'Lacuna documental'}</dd>
        </div>
        {movement.initialPosition && <div><dt>Posição inicial</dt><dd>{movement.initialPosition}</dd></div>}
        {movement.bodyOrientation && <div><dt>Orientação corporal</dt><dd>{movement.bodyOrientation}</dd></div>}
        {movement.kihap && <div><dt>Kihap</dt><dd>Documentado na etapa</dd></div>}
        {movement.rotation && <div><dt>Rotação</dt><dd>{movement.rotation}</dd></div>}
      </dl>
      <div>
        <strong>Posição final</strong>
        {movement.finalPosition && <p>{movement.finalPosition}</p>}
        <dl className="study-step-facts">
          <div>
            <dt>{movement.frames.length > 1 ? 'Base final' : 'Base'}</dt>
            <dd>{movement.base ? <TermLink term={movement.base} /> : 'Lacuna documental'}</dd>
          </div>
          {movement.baseSide && <div>
            <dt>Lado da base</dt>
            <dd>{movement.baseSide}</dd>
          </div>}
          {movement.leadFoot && <div>
            <dt>Pé da frente</dt>
            <dd>{movement.leadFoot}</dd>
          </div>}
        </dl>
      </div>
      {movement.transitions?.length ? (
        <ul className="study-references" aria-label="Transições documentadas">
          {movement.transitions.map(({ description, reference }) => (
            <li key={description}>{description} <ReferenceLink reference={reference} /></li>
          ))}
        </ul>
      ) : null}
      {movement.fieldReferences?.length ? (
        <ul className="study-references" aria-label="Fontes por campo">
          {movement.fieldReferences.map(({ field, reference }) => (
            <li key={field}>{field} · <ReferenceLink reference={reference} /></li>
          ))}
        </ul>
      ) : null}
      {movement.discrepancy && (
        <div className="study-review-points">
          <strong>Divergência entre fontes</strong>
          {movement.discrepancy.note && <p>{movement.discrepancy.note}</p>}
          <ul>
            {movement.discrepancy.variants.map(({ summary, reference }) => (
              <li key={`${reference.url}:${reference.locator}`}>{summary} <ReferenceLink reference={reference} /></li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function MovementActions({ movement }: { movement: StudyMovement }) {
  return (
    <>
      <ol className="study-frames" aria-label="Ações da etapa">
        {movement.frames.map(({ id, label, kind, executor, hangul, romanization, reference, additionalReferences, link }) => (
          <li key={id}>
            <strong>Quadro {id} · {kind && `${kind} · `}{label}</strong>
            {(romanization || hangul) && <span>{romanization}{hangul && <>{romanization && ' · '}<span lang="ko">{hangul}</span></>}</span>}
            {executor && <span>Membro executante · <span>{executor}</span></span>}
            {link && <a className="inline-link" href={link.href}>{link.label}</a>}
            <ReferenceLink reference={reference} />
            {additionalReferences?.map((entry) => <ReferenceLink key={`${entry.url}:${entry.locator}`} reference={entry} />)}
          </li>
        ))}
      </ol>
      {movement.references?.length ? (
        <ul className="study-references" aria-label="Referências da etapa">
          {movement.references.map((reference) => (
            <li key={`${reference.url}:${reference.locator}`}><ReferenceLink reference={reference} /></li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

type StudyMode = 'overview' | 'steps' | 'review';

export default function VisualSequence({ study, guide }: { study: PoomsaeStudy; guide: PoomsaeFormGuide }) {
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const [mode, setMode] = useState<StudyMode>('overview');
  const [index, setIndex] = useState(0);
  const { movements, course } = study;
  const active = movements[index];
  const direction = describeStudyDirection(course, active.direction);
  const taegeukGrid = guide.kind === 'taegeuk' && course?.kind !== 'text';
  const actionCount = movements.reduce((total, movement) => total + movement.frames.length, 0);

  useEffect(() => {
    function restoreMovement() {
      const number = Number(new URLSearchParams(location.search).get('movimento'));
      const position = movements.findIndex((movement) => movement.number === number);
      setMode(position < 0 ? 'overview' : 'steps');
      setIndex(Math.max(position, 0));
    }
    restoreMovement();
    window.addEventListener('popstate', restoreMovement);
    return () => window.removeEventListener('popstate', restoreMovement);
  }, [movements]);

  useEffect(() => {
    if (mode === 'steps') heading.current?.focus();
  }, [mode, index]);

  function selectMode(nextMode: StudyMode, next = index) {
    const url = new URL(location.href);
    if (nextMode === 'steps') url.searchParams.set('movimento', String(movements[next].number));
    else url.searchParams.delete('movimento');
    if (url.href !== location.href) history.replaceState(history.state, '', url);
    setMode(nextMode);
    setIndex(next);
  }

  function moveBy(offset: number) {
    selectMode('steps', Math.max(0, Math.min(index + offset, movements.length - 1)));
  }

  function handleKeys(event: KeyboardEvent<HTMLElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveBy(event.key === 'ArrowRight' ? 1 : -1);
    }
  }

  return (
    <>
    <section className="study-section" id="sequencia" aria-labelledby={id + '-sequence'}>
      <div className="study-section-heading">
        <div>
          <h2 id={id + '-sequence'}>Sequência de movimentos</h2>
          <p className="study-count">{movements.length} etapas numeradas · {actionCount} ações</p>
          <p className="muted">{study.readingNote}</p>
          {taegeukGrid && <p className="muted">As setas seguem a orientação inicial de quem pratica, mesmo após os giros. Na preparação, a pessoa começa em Na e olha para Ga (frente).</p>}
        </div>
        <div className="study-mode" role="group" aria-label="Modo de estudo">
          <button type="button" aria-pressed={mode === 'overview'} onClick={() => selectMode('overview')}>
            Visão geral
          </button>
          <button type="button" aria-pressed={mode === 'steps'} onClick={() => selectMode('steps')}>
            Passo a passo
          </button>
          <button type="button" aria-pressed={mode === 'review'} onClick={() => selectMode('review')}>
            Ficha de revisão
          </button>
        </div>
      </div>

      {mode === 'overview' ? (
        <>
          <StudyBoundary label="Início" boundary={study.start} source={study.source} course={course} />
          <ol className="study-movements">
            {movements.map((movement, position) => {
              const orientation = describeStudyDirection(course, movement.direction);
              const frameCount = movement.frames.length;
              return (
                <li key={movement.number}>
                  <button
                    type="button"
                    aria-label={`Movimento ${movement.number}: ${movement.title}`}
                    onClick={() => selectMode('steps', position)}
                  >
                    <span className="study-number">{String(movement.number).padStart(2, '0')}</span>
                    <span className="study-move-title">{movement.title}</span>
                    <span className="study-orientation">
                      <span aria-hidden="true">{orientation.arrow}</span> {orientation.label}
                      {frameCount > 1 && (
                        <> · <span>{frameCount} quadros</span></>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <StudyBoundary label="Fim" boundary={study.finish} source={study.source} course={course} />
          {study.closure && <StudyBoundary label="Encerramento" boundary={study.closure} source={study.source} course={course} />}
        </>
      ) : mode === 'steps' ? (
        <section className="study-step" aria-label="Movimento selecionado" onKeyDown={handleKeys}>
          <div className="study-step-content">
            <div>
              <p className="eyebrow" role="status">Movimento {active.number} de {movements.length}</p>
              <h3 ref={heading} tabIndex={-1}>{active.title}</h3>
              {active.description && <p>{active.description}</p>}
              <MovementFacts movement={active} course={course} />
              <MovementActions movement={active} />
            </div>
            {direction.angle !== undefined && (
              <figure className="study-direction">
                <DirectionMarker angle={direction.angle} label={direction.label} />
                <figcaption>{direction.label} · orientação inicial</figcaption>
              </figure>
            )}
          </div>
          <progress aria-label="Progresso na sequência" value={index + 1} max={movements.length} />
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
                  onClick={() => selectMode('steps', position)}
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
            <StudyBoundary label="Início" boundary={study.start} source={study.source} course={course} />
            <StudyBoundary label="Fim" boundary={study.finish} source={study.source} course={course} />
            {study.closure && <StudyBoundary label="Encerramento" boundary={study.closure} source={study.source} course={course} />}
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
                      onClick={() => selectMode('steps', position)}
                    >
                      Estudar passo {movement.number}
                    </button>
                  </div>

                  {movement.description && <p>{movement.description}</p>}
                  <MovementFacts movement={movement} course={course} />
                  <MovementActions movement={movement} />
                  <div className="study-review-points">
                    <strong>Pontos para confirmação docente</strong>
                    <ul>
                      {(movement.reviewPoints ?? [
                        'Conferir a lateralidade na imagem do quadro e a leitura do deslocamento na legenda.',
                        ...(movement.frames.length > 1 ? ['Conferir a transição entre os quadros.'] : []),
                      ]).map((point) => <li key={point}>{point}</li>)}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </section>
    <section className="study-section" id="galeria" aria-labelledby={id + '-gallery'}>
      <h2 id={id + '-gallery'}>Galeria de estudo</h2>
      <div className="study-gallery">
        {taegeukGrid && <TaegeukCourseDiagram movements={movements} active={mode === 'steps' ? active : undefined} />}
        {guide.kind === 'taegeuk' ? (
        <div className="study-gallery-panel study-gallery-symbol">
          <TrigramDiagram bars={guide.trigram.bars} label={guide.trigram.romanization} compact />
          <div>
            <strong>Trigrama {guide.trigram.romanization}</strong>
            <p>{guide.trigram.polaritySummary}</p>
            <p className="fine-print">Esquema original · Taekwondo para Todos</p>
          </div>
        </div>
        ) : guide.poomsaeLine && (
          <figure className="study-gallery-panel">
            <PoomsaeLineDiagram {...guide.poomsaeLine} label={guide.name} />
            <figcaption>{guide.poomsaeLine.meaningPt}</figcaption>
          </figure>
        )}
      </div>
      <a className="inline-link" href={study.source.url + '#page=' + study.start.citation.page} target="_blank" rel="noopener noreferrer">
        Consultar as lâminas de referência (pp. {study.start.citation.page}–{study.finish.citation.page}) ↗
      </a>
    </section>
    </>
  );
}
