import { z } from 'astro/zod';
import type { PoomsaeStudy, StudyCourse, StudyLink, StudyReference } from '../data/poomsae-study-model';
import { studyDirections } from '../data/poomsae-study.ts';
import { safeReferenceUrl } from './published-knowledge.ts';

const text = z.string().trim().min(1);
const httpsUrl = text.refine(safeReferenceUrl);
const page = z.number().int().positive();
const direction = z.string().regex(/^[a-z][a-z0-9-]{0,39}$/);
const citation = z.object({ page, locator: text });
const term = z.object({ termId: text, label: text, hangul: text.optional() });
const source = z.object({
  id: text, institution: text, title: text, edition: text.nullable(),
  url: httpsUrl, sourceCheckedAt: z.iso.date(), locator: text.optional(),
});
const evidence = z.object({ sourceId: text, page: page.optional(), locator: text });
const boundary = z.object({ title: text, direction, position: direction.optional(), posture: term, base: term.optional(), displacement: text.optional(), citation });
const frame = z.object({
  frame: text, techniqueId: text, label: text, hangul: text.optional(), romanizationSource: text.optional(),
  kind: text.optional(), executor: text.optional(),
  evidence: z.array(evidence).min(1),
});

const discrepancy = z.object({
  path: text,
  status: text,
  note: text.optional(),
  variants: z.array(z.object({ summary: text, evidence })).optional(),
});

const dossierBase = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  hangul: text,
  meaning: text,
  identityUrl: httpsUrl,
  source,
  sources: z.array(source).min(1),
  review: z.object({ distribution: z.literal('local-only'), publicationApproved: z.literal(false) }),
  counts: z.object({ numberedMovements: page, actions: page, boundaryIncluded: z.literal(false) }),
  start: boundary,
  finish: boundary,
  discrepancies: z.array(discrepancy),
  movements: z.array(z.object({
    number: page, title: text, direction, description: text.nullable().optional(), base: term.optional(),
    displacement: text.optional(), kihap: z.boolean().optional(),
    baseSide: z.enum(['Esquerda', 'Direita']).optional(),
    initialPosition: text.optional(), finalPosition: text.optional(),
    bodyOrientation: text.optional(), rotation: text.optional(),
    fields: z.array(z.object({ field: text, evidence })).optional(),
    transitions: z.array(z.object({ description: text, evidence })).optional(),
    lead: z.enum(['Esquerda', 'Direita']).optional(), citation, actions: z.array(frame).min(1),
    evidence: z.array(evidence).default([]),
  })).min(1),
});

const dossierSchema = z.discriminatedUnion('schemaVersion', [
  dossierBase.extend({ schemaVersion: z.literal(1), slug: z.literal('taegeuk-2-jang'), hangul: z.literal('태극 2장') }),
  dossierBase.extend({
    schemaVersion: z.literal(2),
    family: z.enum(['Taegeuk', 'Dan']),
    identityLocator: text,
    trigramHangul: text.optional(),
    readingNote: text,
    course: z.union([
      z.object({ kind: z.literal('taegeuk') }),
      z.object({ kind: z.literal('text'), directions: z.record(direction, text) }),
    ]),
    closure: boundary.optional(),
    coverage: z.enum(['partial', 'complete']),
    synthetic: z.literal(true).optional(),
  }),
]);

export function parsePoomsaeDossier(
  input: unknown,
  links?: {
    term: (slug: string) => string | null;
    technique: (id: string) => StudyLink | undefined;
  },
): PoomsaeStudy<string> {
  const dossier = dossierSchema.parse(input);
  const { counts, movements } = dossier;
  const modern = dossier.schemaVersion === 2 ? dossier : undefined;
  const course: StudyCourse = modern?.course ?? { kind: 'taegeuk' };
  const family = modern?.family ?? 'Taegeuk';
  if (family === 'Dan' && course.kind === 'taegeuk') throw new Error('Este percurso é exclusivo da família Taegeuk.');
  const directions = course.kind === 'taegeuk' ? studyDirections : course.directions;
  const boundaries = [dossier.start, dossier.finish, ...(modern?.closure ? [modern.closure] : [])];
  const codes = [...movements.map((point) => point.direction), ...boundaries.flatMap((point) =>
    point.position ? [point.direction, point.position] : [point.direction],
  )];
  if (codes.some((code) => !Object.hasOwn(directions, code))) throw new Error('Direção fora da convenção do dossiê.');
  if (counts.numberedMovements !== movements.length ||
      counts.actions !== movements.reduce((total, movement) => total + movement.actions.length, 0)) {
    throw new Error('As contagens declaradas divergem da sequência do dossiê.');
  }

  const sources = new Map(dossier.sources.map((entry) => [entry.id, entry]));
  const primary = sources.get(dossier.source.id);
  if (!primary || primary.url !== dossier.source.url || sources.size !== dossier.sources.length) {
    throw new Error('Registro de fontes incompleto ou inconsistente.');
  }

  function reference({ sourceId, locator, page }: z.infer<typeof evidence>): StudyReference {
    const entry = sources.get(sourceId);
    if (!entry) throw new Error('Uma referência não consta no registro de fontes.');
    return { institution: entry.institution, title: entry.title, url: entry.url, locator, page,
      edition: entry.edition ?? undefined, sourceCheckedAt: entry.sourceCheckedAt };
  }

  function studyTerm({ termId, label, hangul }: z.infer<typeof term>) {
    return { label, hangul, href: links?.term(termId) ?? null };
  }

  function point({ title, direction, position, posture, base, displacement, citation }: z.infer<typeof boundary>) {
    return { title, direction, position, displacement, base: studyTerm(posture), stance: base && studyTerm(base), citation };
  }

  return {
    slug: dossier.slug,
    family, course,
    coverage: modern?.coverage ?? 'complete',
    synthetic: modern?.synthetic,
    hangul: dossier.hangul,
    meaning: dossier.meaning,
    identityUrl: dossier.identityUrl,
    identityLocator: modern?.identityLocator ?? 'Board 37, nº 981',
    trigramHangul: modern ? modern.trigramHangul : '태',
    readingNote: modern?.readingNote ?? 'Preparação e retorno ficam fora da contagem. Os quadros de uma etapa são estudados sob o mesmo número.',
    source: {
      institution: primary.institution, title: primary.title, url: primary.url,
      edition: primary.edition ?? 'Edição não identificada', sourceCheckedAt: primary.sourceCheckedAt,
      reviewState: 'Revisão docente pendente',
    },
    references: dossier.sources.flatMap((entry) => entry.id === primary.id || !entry.locator ? [] : [
      reference({ sourceId: entry.id, locator: entry.locator }),
    ]),
    start: point(dossier.start),
    finish: point(dossier.finish),
    closure: modern?.closure && point(modern.closure),
    movements: movements.map(({ actions, base, lead, evidence, citation, fields, transitions, ...movement }, index) => {
      const { number } = movement;
      if (number !== index + 1) throw new Error('As etapas do dossiê devem estar em ordem consecutiva.');

      const footDiscrepancy = dossier.discrepancies.find(({ path, status }) =>
        path === `movements[number=${number}].footTransition` && status === 'pending_technical_review',
      );
      const reviewPoints: string[] = [];
      if (footDiscrepancy) {
        reviewPoints.push('Confirmar deslocamento dos pés na mudança de direção (divergência entre fontes).');
      }
      if (actions.length > 1) reviewPoints.push('Confirmar transições entre os quadros da etapa e a base final.');
      reviewPoints.push('Conferir execução, lateralidade e nomenclatura com o professor.');
      if (new Set(actions.map((action) => action.frame)).size !== actions.length) {
        throw new Error('Quadros repetidos dentro da mesma etapa.');
      }

      return {
        ...movement,
        base: base && studyTerm(base),
        leadFoot: lead && (lead === 'Esquerda' ? 'Esquerdo' : 'Direito'),
        transitionPending: Boolean(footDiscrepancy),
        discrepancy: footDiscrepancy?.variants?.length ? {
          note: footDiscrepancy.note,
          variants: footDiscrepancy.variants.map((variant) => ({
            summary: variant.summary,
            reference: reference(variant.evidence),
          })),
        } : undefined,
        reviewPoints,
        fieldReferences: fields?.map(({ field, evidence }) => ({ field, reference: reference(evidence) })),
        transitions: transitions?.map(({ description, evidence }) => ({ description, reference: reference(evidence) })),
        references: [reference({ sourceId: primary.id, ...citation }), ...evidence.map(reference)]
          .filter((entry, position, all) => all.findIndex((candidate) =>
            candidate.url === entry.url && candidate.page === entry.page && candidate.locator === entry.locator,
          ) === position),
        frames: actions.map((action, frameIndex) => {
          const expected = actions.length === 1 ? String(number) : `${number}-${frameIndex + 1}`;
          if (!modern && action.frame !== expected) throw new Error('O rótulo do quadro não corresponde à etapa.');
          const references = action.evidence.map(reference);
          const photo = references.find((entry) => entry.url === primary.url && (modern || entry.page !== undefined));
          if (!photo) throw new Error('Quadro sem localizador da fonte principal.');
          return {
            id: action.frame, label: action.label, hangul: action.hangul, romanization: action.romanizationSource,
            kind: action.kind, executor: action.executor,
            reference: photo, additionalReferences: references.filter((entry) => entry !== photo),
            link: links?.technique(action.techniqueId),
          };
        }),
      };
    }),
  };
}
