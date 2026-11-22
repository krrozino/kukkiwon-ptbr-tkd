import { useEffect, useState } from 'react';
import { parseCurriculum } from '../../lib/curriculum';

export type MatchuoModality = 'sebon' | 'dubon' | 'hanbon' | 'anjoa';

export type MatchuoNotebookEntry = {
  id: string;
  modality: MatchuoModality;
  number: number;
  gradeLabel: string;
  teacherSummary: string;
  reviewed: boolean;
};

const STORAGE_KEY = 'tkd:matchuo-notebook:v1';

const MODALITY_LABELS: Record<MatchuoModality, { short: string; full: string }> = {
  sebon: { short: 'Sebon', full: 'Sebon (3 passos)' },
  dubon: { short: 'Dubon', full: 'Dubon (2 passos)' },
  hanbon: { short: 'Hanbon', full: 'Hanbon (1 passo)' },
  anjoa: { short: 'Anjoa', full: 'Anjoa (sentado)' },
};

function parseNotebook(raw: string | null): MatchuoNotebookEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (row): row is MatchuoNotebookEntry =>
          row &&
          typeof row === 'object' &&
          typeof row.id === 'string' &&
          (row.modality === 'sebon' ||
            row.modality === 'dubon' ||
            row.modality === 'hanbon' ||
            row.modality === 'anjoa') &&
          Number.isSafeInteger(row.number) &&
          row.number >= 1 &&
          row.number <= 100 &&
          typeof row.gradeLabel === 'string' &&
          typeof row.teacherSummary === 'string' &&
          typeof row.reviewed === 'boolean',
      )
      .slice(0, 120);
  } catch {
    return [];
  }
}

export default function MatchuoOrganizer() {
  const [entries, setEntries] = useState<MatchuoNotebookEntry[]>([]);
  const [curriculumHighlights, setCurriculumHighlights] = useState<
    { gradeName: string; title: string }[]
  >([]);
  const [filter, setFilter] = useState<'all' | MatchuoModality>('all');
  const [modality, setModality] = useState<MatchuoModality>('sebon');
  const [startNum, setStartNum] = useState('1');
  const [endNum, setEndNum] = useState('5');
  const [gradeLabel, setGradeLabel] = useState('');
  const [teacherSummary, setTeacherSummary] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setEntries(parseNotebook(localStorage.getItem(STORAGE_KEY)));
    try {
      const rawCurriculum = localStorage.getItem('tkd:curriculum-draft');
      if (rawCurriculum) {
        const parsed = parseCurriculum(JSON.parse(rawCurriculum));
        const found: { gradeName: string; title: string }[] = [];
        for (const grade of parsed.grades) {
          for (const req of grade.requirements) {
            const lower = `${req.title} ${req.kind} ${req.termSlug}`.toLowerCase();
            if (
              lower.includes('sebon') ||
              lower.includes('dubon') ||
              lower.includes('hanbon') ||
              lower.includes('anjoa') ||
              lower.includes('matchuo') ||
              lower.includes('combinad')
            ) {
              found.push({ gradeName: grade.name, title: req.title });
            }
          }
        }
        setCurriculumHighlights(found);
      }
    } catch {
      setCurriculumHighlights([]);
    }
  }, []);

  const persist = (next: MatchuoNotebookEntry[], message = '') => {
    const sorted = [...next].sort((a, b) =>
      a.modality === b.modality ? a.number - b.number : a.modality.localeCompare(b.modality),
    );
    setEntries(sorted);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
    if (message) setFeedback(message);
  };

  const handleAddRange = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const from = Number.parseInt(startNum, 10);
    const to = Number.parseInt(endNum || startNum, 10);
    if (
      !Number.isSafeInteger(from) ||
      !Number.isSafeInteger(to) ||
      from < 1 ||
      to > 100 ||
      to < from ||
      to - from > 29
    ) {
      setFeedback('Informe um intervalo válido entre 1 e 100 (máximo de 30 números por vez).');
      return;
    }

    const next = [...entries];
    let created = 0;
    for (let num = from; num <= to; num += 1) {
      const existingIndex = next.findIndex(
        (item) => item.modality === modality && item.number === num,
      );
      if (existingIndex >= 0) {
        if (gradeLabel.trim()) next[existingIndex].gradeLabel = gradeLabel.trim().slice(0, 80);
        if (from === to && teacherSummary.trim()) {
          next[existingIndex].teacherSummary = teacherSummary.trim().slice(0, 400);
        }
      } else {
        next.push({
          id: `${modality}-${num}`,
          modality,
          number: num,
          gradeLabel: gradeLabel.trim().slice(0, 80),
          teacherSummary: from === to ? teacherSummary.trim().slice(0, 400) : '',
          reviewed: false,
        });
        created += 1;
      }
    }
    setTeacherSummary('');
    persist(
      next,
      created > 0
        ? `${MODALITY_LABELS[modality].short} ${from}${to > from ? ` a ${to}` : ''} registrado no seu caderno local.`
        : `Intervalo ${MODALITY_LABELS[modality].short} ${from}${to > from ? ` a ${to}` : ''} atualizado.`,
    );
  };

  const toggleReviewed = (id: string) => {
    persist(
      entries.map((item) => (item.id === id ? { ...item, reviewed: !item.reviewed } : item)),
    );
  };

  const updateNote = (id: string, note: string) => {
    persist(
      entries.map((item) =>
        item.id === id ? { ...item, teacherSummary: note.slice(0, 400) } : item,
      ),
    );
  };

  const removeEntry = (id: string) => {
    persist(entries.filter((item) => item.id !== id), 'Exercício removido do caderno local.');
  };

  const visibleEntries =
    filter === 'all' ? entries : entries.filter((item) => item.modality === filter);
  const reviewedCount = entries.filter((item) => item.reviewed).length;

  return (
    <section className="matchuo-organizer" aria-label="Organizador de sequências da sua escola">
      <div className="matchuo-organizer-head">
        <div>
          <span className="eyebrow">Estudo personalizado por dojang</span>
          <h2>Organizador de sequências da sua escola</h2>
          <p>
            A numeração de Sebon, Dubon, Hanbon e Anjoa pertence ao currículo de cada escola (por
            exemplo, Sebon 1 a 5 em uma faixa e 1 a 10 em outra). Registre abaixo os números e as
            orientações transmitidas pelo seu professor sem misturar com padrão universal.
          </p>
        </div>
        <a className="button button-outline" href="/curriculos">
          Vincular ao currículo →
        </a>
      </div>

      {curriculumHighlights.length > 0 && (
        <div className="matchuo-curriculum-banner" role="region" aria-label="Requisitos de combate combinado no currículo local">
          <strong>Registrado no seu currículo local:</strong>
          <ul>
            {curriculumHighlights.map((item, idx) => (
              <li key={`${item.gradeName}-${idx}`}>
                <span>{item.gradeName}:</span> {item.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form className="matchuo-form" onSubmit={handleAddRange}>
        <div className="matchuo-form-grid">
          <label className="field">
            Modalidade combinada
            <select
              value={modality}
              onChange={(event) => setModality(event.target.value as MatchuoModality)}
            >
              {(Object.keys(MODALITY_LABELS) as MatchuoModality[]).map((key) => (
                <option key={key} value={key}>
                  {MODALITY_LABELS[key].full}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Do nº
            <input
              type="number"
              min={1}
              max={100}
              value={startNum}
              onChange={(event) => setStartNum(event.target.value)}
            />
          </label>
          <label className="field">
            Ao nº
            <input
              type="number"
              min={1}
              max={100}
              value={endNum}
              onChange={(event) => setEndNum(event.target.value)}
            />
          </label>
          <label className="field">
            Faixa na sua escola (opcional)
            <input
              type="text"
              maxLength={80}
              placeholder="Ex.: Faixa Amarela, Ponta Verde"
              value={gradeLabel}
              onChange={(event) => setGradeLabel(event.target.value)}
            />
          </label>
        </div>
        {startNum === endNum && (
          <label className="field matchuo-single-note">
            Orientação do professor para este número (opcional)
            <input
              type="text"
              maxLength={400}
              placeholder="Ex.: recuo em Apgubi, defesa média e contra-ataque definido na aula"
              value={teacherSummary}
              onChange={(event) => setTeacherSummary(event.target.value)}
            />
          </label>
        )}
        <div className="matchuo-form-actions">
          <button type="submit" className="button">
            Registrar intervalo no caderno
          </button>
          <button
            type="button"
            className="button button-outline"
            onClick={() => {
              setModality('sebon');
              setStartNum('1');
              setEndNum('5');
              setGradeLabel('Exemplo da escola · 1º bloco');
            }}
          >
            Preencher Sebon 1 a 5
          </button>
          <button
            type="button"
            className="button button-outline"
            onClick={() => {
              setModality('sebon');
              setStartNum('1');
              setEndNum('10');
              setGradeLabel('Exemplo da escola · 2º bloco');
            }}
          >
            Preencher Sebon 1 a 10
          </button>
        </div>
        {feedback && (
          <p className="fine-print" role="status">
            {feedback}
          </p>
        )}
      </form>

      <div className="matchuo-filter-bar" role="group" aria-label="Filtrar caderno por modalidade">
        <button
          type="button"
          className="poomsae-mode-btn"
          aria-pressed={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          Todas ({entries.length})
        </button>
        {(Object.keys(MODALITY_LABELS) as MatchuoModality[]).map((key) => {
          const count = entries.filter((item) => item.modality === key).length;
          return (
            <button
              key={key}
              type="button"
              className="poomsae-mode-btn"
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
            >
              {MODALITY_LABELS[key].short} ({count})
            </button>
          );
        })}
      </div>

      {visibleEntries.length > 0 ? (
        <>
          <p className="fine-print">
            Progresso neste navegador: <strong>{reviewedCount}</strong> de{' '}
            <strong>{entries.length}</strong> exercícios marcados como revisados.
          </p>
          <div className="matchuo-entry-grid">
            {visibleEntries.map((entry) => (
              <article className="matchuo-entry-card" key={entry.id}>
                <div className="matchuo-entry-top">
                  <strong>
                    {MODALITY_LABELS[entry.modality].short} #{entry.number}
                  </strong>
                  {entry.gradeLabel && <span className="pill">{entry.gradeLabel}</span>}
                </div>
                <label className="field">
                  <span className="sr-only">
                    Anotação do professor para {MODALITY_LABELS[entry.modality].short} {entry.number}
                  </span>
                  <input
                    type="text"
                    maxLength={400}
                    placeholder="Anote ataque, defesa e contra-ataque ensinados na sua escola"
                    value={entry.teacherSummary}
                    onChange={(event) => updateNote(entry.id, event.target.value)}
                  />
                </label>
                <div className="matchuo-entry-actions">
                  <button
                    type="button"
                    className="poomsae-mode-btn"
                    aria-pressed={entry.reviewed}
                    onClick={() => toggleReviewed(entry.id)}
                  >
                    {entry.reviewed ? 'Revisado' : 'Em treino'}
                  </button>
                  <button
                    type="button"
                    className="inline-delete-btn"
                    aria-label={`Remover ${MODALITY_LABELS[entry.modality].short} ${entry.number}`}
                    onClick={() => removeEntry(entry.id)}
                  >
                    Remover
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <p className="fine-print">
          Nenhum exercício numerado salvo neste filtro ainda. Use o formulário acima para criar a
          lista de estudo da sua faixa (ex.: Sebon 1 a 5, Dubon 1 a 5 ou Anjoa 1 a 5).
        </p>
      )}
    </section>
  );
}
