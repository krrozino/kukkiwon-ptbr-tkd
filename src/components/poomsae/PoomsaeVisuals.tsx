import { useEffect, useState } from 'react';
import { parseCurriculum } from '../../lib/curriculum';
import type { PoomsaeLineKind, TrigramBar } from '../../data/poomsae-guide';

export function TrigramDiagram({
  bars,
  label,
  compact = false,
}: {
  bars: readonly [TrigramBar, TrigramBar, TrigramBar];
  label: string;
  compact?: boolean;
}) {
  const width = compact ? 52 : 76;
  const height = compact ? 38 : 54;
  return (
    <figure className={`trigram-diagram${compact ? ' trigram-diagram-compact' : ''}`}>
      <svg
        viewBox="0 0 76 54"
        width={width}
        height={height}
        role="img"
        aria-label={`Diagrama do trigrama ${label}`}
      >
        <title>{`Trigrama ${label} — representação esquemática autoral`}</title>
        {bars.map((bar, index) => {
          const y = 7 + index * 16;
          return bar === 1 ? (
            <rect key={index} x="8" y={y} width="60" height="8" rx="2" fill="currentColor" />
          ) : (
            <g key={index}>
              <rect x="8" y={y} width="25" height="8" rx="2" fill="currentColor" />
              <rect x="43" y={y} width="25" height="8" rx="2" fill="currentColor" />
            </g>
          );
        })}
      </svg>
      {!compact && <figcaption>Esquema autoral · Taekwondo para Todos</figcaption>}
    </figure>
  );
}

const linePaths: Record<PoomsaeLineKind, readonly string[]> = {
  san: ['M38 10 V44', 'M14 22 V44 H62 V22'],
  gong: ['M16 14 H60', 'M38 14 V42', 'M14 42 H62'],
  ship: ['M38 10 V46', 'M14 28 H62'],
  o: ['M38 12 V42', 'M14 42 H62'],
  u: ['M14 14 H62', 'M38 14 V44'],
  su: ['M38 10 V46', 'M16 24 L30 28 L16 40', 'M60 20 L46 28 L60 40'],
};

export function PoomsaeLineDiagram({
  kind,
  character,
  label,
  compact = false,
}: {
  kind: PoomsaeLineKind;
  character: string;
  label: string;
  compact?: boolean;
}) {
  const width = compact ? 52 : 76;
  const height = compact ? 42 : 56;
  return (
    <figure className={`poomsae-line-diagram${compact ? ' poomsae-line-compact' : ''}`}>
      <svg
        viewBox="0 0 76 56"
        width={width}
        height={height}
        role="img"
        aria-label={`Esquema de linha da forma ${label} (${character})`}
      >
        <title>{`Linha de Poomsae ${character} (${label}) — diagrama esquemático autoral`}</title>
        <rect x="4" y="4" width="68" height="48" rx="6" fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1.5" />
        {linePaths[kind].map((d, idx) => (
          <path
            key={idx}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      {!compact && <figcaption>Esquema autoral da linha ({character})</figcaption>}
    </figure>
  );
}

function normalizeMatch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function findSchoolGradesForPoomsae(rawCurriculum: string | null, slug: string, formName: string): string[] {
  if (!rawCurriculum) return [];
  try {
    const parsed = parseCurriculum(JSON.parse(rawCurriculum));
    const targetSlug = normalizeMatch(slug);
    const targetName = normalizeMatch(formName);
    return parsed.grades
      .filter((grade) =>
        grade.requirements.some((req) => {
          if (req.termSlug === slug) return true;
          const reqTitle = normalizeMatch(req.title);
          return reqTitle.includes(targetName) || reqTitle.includes(targetSlug);
        }),
      )
      .map((grade) => grade.name);
  } catch {
    return [];
  }
}

export function SchoolBeltStatus({
  slug,
  formName,
  compact = false,
}: {
  slug: string;
  formName: string;
  compact?: boolean;
}) {
  const [grades, setGrades] = useState<string[] | null>(null);

  useEffect(() => {
    try {
      setGrades(findSchoolGradesForPoomsae(localStorage.getItem('tkd:curriculum-draft'), slug, formName));
    } catch {
      setGrades([]);
    }
  }, [slug, formName]);

  if (compact) {
    return (
      <p className="poomsae-belt-note">
        {grades && grades.length > 0 ? (
          <>
            <strong>No seu currículo:</strong> {grades.join(' · ')}
          </>
        ) : (
          <span>Graduação associada pelo currículo da escola</span>
        )}
      </p>
    );
  }

  return (
    <div className="poomsae-school-box">
      <span className="eyebrow">Graduação e autonomia escolar</span>
      {grades && grades.length > 0 ? (
        <p>
          <strong>Presente no seu currículo local:</strong> {grades.join(', ')}.{' '}
          <a className="inline-link" href="/curriculos">
            Abrir meu currículo →
          </a>
        </p>
      ) : (
        <p>
          A faixa exigida para <strong>{formName}</strong> varia conforme a escola ou federação.{' '}
          <a className="inline-link" href="/curriculos">
            Associar à sua faixa em Currículos →
          </a>
        </p>
      )}
    </div>
  );
}
