import type { fetchTermDetails, TermSource } from './catalog-api';
import type { GlossaryData, GlossaryExpression, GlossaryWord } from './glossary';

export type KnowledgeDetail = NonNullable<Awaited<ReturnType<typeof fetchTermDetails>>>;
export type LearningCard = {
  id: string;
  prompt: string;
  hangul: string | null;
  answer: string;
  context: string | null;
  href: string;
  sources: TermSource[];
  glossaryExpressionIds: string[];
};

export function safeReferenceUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch { return false; }
}

export function hasCheckedSource(source: unknown): source is TermSource {
  if (!source || typeof source !== 'object') return false;
  const record = source as Record<string,unknown>;
  if (!record.content_sources || typeof record.content_sources !== 'object') return false;
  const document = record.content_sources as Record<string,unknown>;
  return typeof record.source_locator === 'string' && Boolean(record.source_locator.trim()) &&
    typeof record.checked_at === 'string' && Number.isFinite(Date.parse(record.checked_at)) &&
    typeof document.institution === 'string' && Boolean(document.institution.trim()) &&
    typeof document.title === 'string' && Boolean(document.title.trim()) &&
    safeReferenceUrl(document.official_url);
}

function approvedGlossaryItem(item: GlossaryWord | GlossaryExpression): boolean {
  const review = item.review;
  return Boolean(review.status === 'approved' && review.translationBy?.trim() &&
    review.technicalBy?.trim() && review.approvedBy?.trim() && review.approvedAt &&
    Number.isFinite(Date.parse(review.approvedAt)) && item.sources.some(source =>
      source.locator?.trim() && source.checkedAt && Number.isFinite(Date.parse(source.checkedAt)) &&
      safeReferenceUrl(source.url)));
}

/** Editorial IDs, never inferred Korean segmentation or spelling similarity. */
export function glossaryLinksForTerm(slug: string, data: GlossaryData) {
  const expressions = data.expressions.filter(item => item.technicalSlug === slug && approvedGlossaryItem(item));
  const ids = new Set(expressions.flatMap(item => item.segments.map(segment => segment.wordId)));
  return { expressions, words: data.words.filter(word => ids.has(word.id) && approvedGlossaryItem(word)) };
}

/** Cards reuse the published translation verbatim; no new technical instruction is generated. */
export function buildLearningDeck(details: KnowledgeDetail[], glossary: GlossaryData): LearningCard[] {
  const seen = new Set<string>();
  return details.flatMap(detail => {
    const { term } = detail;
    const sources = detail.sources.filter(hasCheckedSource);
    if (term.publication_status !== 'published' || !term.translation_pt?.trim() ||
      !sources.length || seen.has(term.slug)) return [];
    seen.add(term.slug);
    return [{
      id: 'term:' + term.slug, prompt: term.romanization, hangul: term.hangul,
      answer: term.translation_pt, context: term.definition_pt,
      href: '/tecnica?slug=' + encodeURIComponent(term.slug), sources,
      glossaryExpressionIds: glossaryLinksForTerm(term.slug, glossary).expressions.map(item => item.id),
    }];
  });
}

export function buildTranslationQuiz(cards: LearningCard[]) {
  const answers = [...new Set(cards.map(card => card.answer))];
  if (answers.length < 2) return [];
  return cards.map((card, index) => {
    const choices = [card.answer, ...answers.filter(answer => answer !== card.answer).slice(0, 3)];
    // Vary the answer position without changing the recorded wording.
    const offset = index % choices.length;
    return {cardId:card.id,prompt:card.prompt,answer:card.answer,choices:[...choices.slice(offset),...choices.slice(0,offset)]};
  });
}
