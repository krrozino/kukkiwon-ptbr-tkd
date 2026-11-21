import { useEffect, useState } from 'react';
import { ironQuizQuestions, type IronLevel } from '../../data/iron-guide';

const QUIZ_STORAGE_KEY = 'tkd:iron-quiz:v1';

const LEVEL_INFO: Record<
  'all' | IronLevel,
  { label: string; badge: string; audience: string }
> = {
  all: {
    label: 'Todos os níveis (12 temas)',
    badge: 'Visão completa',
    audience: 'Percorra toda a trilha teórica do iniciante ao pesquisador.',
  },
  basico: {
    label: 'Básico (Iniciante)',
    badge: 'Primeiros passos',
    audience: 'Significado do Taekwondo, cortesia no Dojang, faixas Gup/Dan e leitura de alturas.',
  },
  intermediario: {
    label: 'Intermediário',
    badge: 'Aprofundamento',
    audience: 'História pós-1945, diferença entre Kukkiwon/WT/CBTKD, evolução de Poomsae e formação dos nomes em coreano.',
  },
  avancado: {
    label: 'Avançado e Professores',
    badge: 'Pesquisa e fontes',
    audience: 'Historiografia crítica, hierarquia de fontes primárias, sistemas de romanização e matriz marcial vs esportiva.',
  },
};

export default function IronStudyPanel() {
  const [selectedLevel, setSelectedLevel] = useState<'all' | IronLevel>('all');
  const [answers, setAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(QUIZ_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') setAnswers(parsed);
      }
    } catch {
      setAnswers({});
    }
  }, []);

  const chooseLevel = (level: 'all' | IronLevel) => {
    setSelectedLevel(level);
    const kindParam =
      level === 'basico'
        ? 'Iron · Básico'
        : level === 'intermediario'
          ? 'Iron · Intermediário'
          : level === 'avancado'
            ? 'Iron · Avançado'
            : '';
    const params = new URLSearchParams(location.search);
    if (kindParam) params.set('tipo', kindParam);
    else params.delete('tipo');
    history.replaceState(
      null,
      '',
      location.pathname + (params.size ? '?' + params : '') + '#fichas',
    );
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const selectAnswer = (questionId: string, optionIndex: number) => {
    const next = { ...answers, [questionId]: optionIndex };
    setAnswers(next);
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(next));
  };

  const resetQuiz = () => {
    setAnswers({});
    localStorage.removeItem(QUIZ_STORAGE_KEY);
  };

  const filteredQuestions =
    selectedLevel === 'all'
      ? ironQuizQuestions
      : ironQuizQuestions.filter((q) => q.level === selectedLevel);

  const correctCount = filteredQuestions.filter(
    (q) => answers[q.id] === q.correctIndex,
  ).length;
  const answeredCount = filteredQuestions.filter(
    (q) => answers[q.id] !== undefined,
  ).length;

  return (
    <section className="iron-study-panel" aria-label="Trilha de níveis e revisão de teoria">
      <div className="iron-levels-box">
        <div>
          <span className="eyebrow">Estudo progressivo de Iron</span>
          <h2>Escolha seu nível de estudo teórico</h2>
          <p>{LEVEL_INFO[selectedLevel].audience}</p>
        </div>
        <div className="poomsae-mode-bar" role="group" aria-label="Filtrar teoria por nível">
          {(Object.keys(LEVEL_INFO) as ('all' | IronLevel)[]).map((level) => (
            <button
              key={level}
              type="button"
              className="poomsae-mode-btn"
              aria-pressed={selectedLevel === level}
              onClick={() => chooseLevel(level)}
            >
              {LEVEL_INFO[level].label}
            </button>
          ))}
        </div>
      </div>

      <div className="iron-quiz-section" role="region" aria-label="Revisão rápida de compreensão teórica">
        <div className="iron-quiz-head">
          <div>
            <span className="eyebrow">Autoavaliação com fontes</span>
            <h2>Revisão rápida de compreensão</h2>
            <p>
              Verifique seu domínio sobre conceitos documentados sem pegadinhas. Cada resposta indica a ficha correspondente para aprofundamento.
            </p>
          </div>
          <div className="iron-quiz-score">
            <span role="status">
              Respondidas: <strong>{answeredCount}/{filteredQuestions.length}</strong> · Acertos:{' '}
              <strong>{correctCount}</strong>
            </span>
            {answeredCount > 0 && (
              <button type="button" className="button button-outline" onClick={resetQuiz}>
                Reiniciar revisão
              </button>
            )}
          </div>
        </div>

        <div className="iron-quiz-grid">
          {filteredQuestions.map((q, index) => {
            const chosen = answers[q.id];
            const isAnswered = chosen !== undefined;
            const isCorrect = chosen === q.correctIndex;
            return (
              <article className="iron-quiz-card" key={q.id}>
                <p className="eyebrow">
                  Questão {index + 1} ·{' '}
                  {q.level === 'basico'
                    ? 'Básico'
                    : q.level === 'intermediario'
                      ? 'Intermediário'
                      : 'Avançado'}
                </p>
                <h3>{q.question}</h3>
                <div className="iron-quiz-options" role="group" aria-label={q.question}>
                  {q.options.map((opt, optIdx) => {
                    const selected = chosen === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        className={`iron-option-btn${
                          selected
                            ? isCorrect
                              ? ' is-correct'
                              : ' is-wrong'
                            : ''
                        }`}
                        aria-pressed={selected}
                        onClick={() => selectAnswer(q.id, optIdx)}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {isAnswered && (
                  <div className="iron-quiz-feedback">
                    <p>
                      <strong>{isCorrect ? 'Correto:' : 'Releia com atenção:'}</strong>{' '}
                      {q.explanation}
                    </p>
                    <a className="inline-link" href={`/biblioteca/iron/${q.relatedSlug}`}>
                      Abrir ficha de referência →
                    </a>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
