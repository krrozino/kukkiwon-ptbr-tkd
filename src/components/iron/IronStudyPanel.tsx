import { useEffect, useState } from 'react';
import { ironEntries, ironQuizQuestions, type IronLevel } from '../../data/iron-guide';

const QUIZ_STORAGE_KEY = 'tkd:iron-quiz:v1';
const PAGE_SIZE = 6;

const LEVEL_INFO = {
  all: { label: `Todos os níveis (${ironEntries.length} temas)`, filter: '' },
  basico: { label: 'Básico (Iniciante)', filter: 'Iron · Básico' },
  intermediario: { label: 'Intermediário', filter: 'Iron · Intermediário' },
  avancado: { label: 'Avançado e Professores', filter: 'Iron · Avançado' },
} as const;

type Level = 'all' | IronLevel;
const levels = Object.keys(LEVEL_INFO) as Level[];
const topics = [...new Set(ironQuizQuestions.map((question) => question.topic))]
  .sort((a, b) => a.localeCompare(b, 'pt-BR'));

function readAnswers(): Record<string, number> {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(QUIZ_STORAGE_KEY) ?? 'null');
    if (!stored || typeof stored !== 'object') return {};
    const saved = stored as Record<string, unknown>;
    return Object.fromEntries(ironQuizQuestions.flatMap(({ id, options }) => {
      const selection = saved[id];
      return typeof selection === 'number' && Number.isInteger(selection) &&
        selection >= 0 && selection < options.length ? [[id, selection]] : [];
    }));
  } catch {
    return {};
  }
}

export default function IronStudyPanel() {
  const [selectedLevel, setSelectedLevel] = useState<Level>('all');
  const [topic, setTopic] = useState('');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [reviewIds, setReviewIds] = useState<string[] | null>(null);
  const [page, setPage] = useState(0);
  const [storageUnavailable, setStorageUnavailable] = useState(false);

  useEffect(() => {
    setAnswers(readAnswers());
    function restoreLevel() {
      const kind = new URLSearchParams(location.search).get('tipo');
      setSelectedLevel(levels.find((level) => LEVEL_INFO[level].filter === kind) ?? 'all');
      setReviewIds(null);
      setPage(0);
    }
    restoreLevel();
    window.addEventListener('popstate', restoreLevel);
    return () => window.removeEventListener('popstate', restoreLevel);
  }, []);

  function chooseLevel(level: Level) {
    const filter = LEVEL_INFO[level].filter;
    const url = new URL(location.href);
    if (filter) url.searchParams.set('tipo', filter);
    else url.searchParams.delete('tipo');
    url.hash = 'fichas';
    history.replaceState(history.state, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  function selectAnswer(questionId: string, optionIndex: number) {
    const next = { ...answers, [questionId]: optionIndex };
    setAnswers(next);
    try {
      localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(next));
      setStorageUnavailable(false);
    } catch {
      setStorageUnavailable(true);
    }
  }

  function resetQuiz() {
    setAnswers({});
    setReviewIds(null);
    setPage(0);
    try {
      localStorage.removeItem(QUIZ_STORAGE_KEY);
      setStorageUnavailable(false);
    } catch {
      setStorageUnavailable(true);
    }
  }

  const filteredQuestions = ironQuizQuestions.filter((question) =>
    (selectedLevel === 'all' || question.level === selectedLevel) && (!topic || question.topic === topic),
  );
  const correctCount = filteredQuestions.filter(({ id, correctIndex }) => answers[id] === correctIndex).length;
  const answeredCount = filteredQuestions.filter(({ id }) => answers[id] !== undefined).length;
  const displayedQuestions = reviewIds === null ? filteredQuestions : filteredQuestions.filter(({ id }) => reviewIds.includes(id));
  const pageCount = Math.ceil(displayedQuestions.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(0, pageCount - 1));
  const start = currentPage * PAGE_SIZE;
  const pageQuestions = displayedQuestions.slice(start, start + PAGE_SIZE);

  function toggleReview() {
    setReviewIds(reviewIds ? null : filteredQuestions
      .filter(({ id, correctIndex }) => answers[id] !== undefined && answers[id] !== correctIndex)
      .map(({ id }) => id));
    setPage(0);
  }

  return (
    <section className="iron-study-panel" aria-label="Trilha de níveis e revisão de teoria">
      <div className="iron-levels-box">
        <h2>Escolha seu nível de estudo teórico</h2>
        <div className="poomsae-mode-bar" role="group" aria-label="Filtrar teoria por nível">
          {levels.map((level) => (
            <button key={level} type="button" className="poomsae-mode-btn"
              aria-pressed={selectedLevel === level} onClick={() => chooseLevel(level)}>
              {LEVEL_INFO[level].label}
            </button>
          ))}
        </div>
      </div>

      <div className="iron-quiz-section" role="region" aria-label="Revisão rápida de compreensão teórica">
        <div className="iron-quiz-head">
          <div>
            <h2>Revisão rápida de compreensão</h2>
            <p>Cada resposta inclui uma explicação, a ficha de estudo e a fonte.</p>
          </div>
          <div className="iron-quiz-score">
            <span role="status">
              Respondidas <strong>{answeredCount}/{filteredQuestions.length}</strong> · Acertos <strong>{correctCount}</strong>
            </span>
            {Object.keys(answers).length > 0 && (
              <button type="button" className="button button-outline" onClick={resetQuiz}>Reiniciar revisão</button>
            )}
          </div>
        </div>
        <div className="iron-quiz-filters">
          <label>
            Assunto das questões
            <select value={topic} onChange={(event) => {
              setTopic(event.target.value);
              setReviewIds(null);
              setPage(0);
            }}>
              <option value="">Todos os assuntos</option>
              {topics.map((name) => <option value={name} key={name}>{name}</option>)}
            </select>
          </label>
          <button type="button" className="button button-outline" aria-pressed={reviewIds !== null}
            disabled={reviewIds === null && answeredCount === correctCount} onClick={toggleReview}>
            {reviewIds === null ? 'Revisar erros' : 'Voltar a todas as questões'}
          </button>
        </div>
        {storageUnavailable && <p role="status">As respostas estão disponíveis nesta página. O navegador bloqueou o armazenamento local.</p>}
        {reviewIds !== null && <p>Revisão de erros · {displayedQuestions.length} questões selecionadas</p>}
        {!pageQuestions.length && <p role="status">Nenhuma questão para este filtro. Escolha outro nível ou assunto.</p>}
        <div className="iron-quiz-grid">
          {pageQuestions.map((question) => {
            const { id, level, topic, options, correctIndex, reference } = question;
            const chosen = answers[id];
            const isCorrect = chosen === correctIndex;
            return (
              <article className="iron-quiz-card" key={id}>
                <p className="eyebrow">{LEVEL_INFO[level].filter} · {topic}</p>
                <h3>{question.question}</h3>
                <div className="iron-quiz-options" role="group" aria-label={question.question}>
                  {options.map((option, index) => {
                    const selected = chosen === index;
                    return (
                      <button key={option} type="button"
                        className={`iron-option-btn${selected ? (isCorrect ? ' is-correct' : ' is-wrong') : ''}`}
                        aria-pressed={selected} onClick={() => selectAnswer(id, index)}>
                        {option}
                      </button>
                    );
                  })}
                </div>
                {chosen !== undefined && (
                  <div className="iron-quiz-feedback">
                    <p role="status"><strong>{isCorrect ? 'Correto:' : 'Releia com atenção:'}</strong> {question.explanation}</p>
                    <a className="inline-link" href={`/biblioteca/iron/${question.relatedSlug}`}>Abrir ficha de referência →</a>
                    <a className="inline-link" href={reference.url} target="_blank" rel="noopener noreferrer">
                      {reference.institution} · {reference.locator} ↗
                    </a>
                  </div>
                )}
              </article>
            );
          })}
        </div>
        {pageCount > 1 && (
          <nav className="iron-quiz-filters" aria-label="Páginas da revisão">
            <button type="button" className="button button-outline" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>
              Página anterior
            </button>
            <span role="status">Página {currentPage + 1} de {pageCount}</span>
            <button type="button" className="button button-outline" disabled={currentPage === pageCount - 1} onClick={() => setPage(currentPage + 1)}>
              Próxima página
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
