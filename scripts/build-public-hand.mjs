import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Deliberately selected visitor fields; this module is never imported in a public page.
const input = new URL('../content/research/atlas-hand-v1/matrix.json', import.meta.url);
const output = new URL('../src/data/public-hand-v1.json', import.meta.url);
const matrix = JSON.parse(readFileSync(input, 'utf8'));
const pick = (term, field) => matrix.term_field_claims.find(row =>
  row.term_slug === term && row.field_name === field && row.evidence_kind === 'primary' &&
  row.editorial_status === 'document_checked') ||
  matrix.term_field_claims.find(row => row.term_slug === term && row.field_name === field && row.evidence_kind === 'editorial');
const sourceById = new Map(matrix.content_sources.map(s => [s.source_id, s]));
const reference = row => {
  if (!row || row.evidence_kind === 'editorial') return null;
  const src = sourceById.get(row.source_id);
  if (!src || src.authority !== 'primary' || !src.official_url.startsWith('https://')) return null;
  return { title: src.title, institution: src.institution,
    edition: src.publication_year ? String(src.publication_year) : '',
    url: src.official_url, locator: row.source_locator };
};
const publicTerms = matrix.technical_terms.map(term => {
  const claims = name => matrix.term_field_claims.filter(c => c.term_slug === term.slug && c.field_name === name);
  const field = name => { const row = pick(term.slug, name); return row ? row.value : null; };
  const evidence = ['hangul','romanization'].map(k => ({ field: k, reference: reference(pick(term.slug, k)) }))
    .filter(x => x.reference !== null);
  const meanings = matrix.term_senses.filter(s => s.term_slug === term.slug && s.editorial_status === 'document_checked'
    && s.evidence_kind === 'primary').map(s => ({ kind: s.sense_kind, language: s.language_tag, value: s.meaning,
      reference: reference(s) }));
  const variants = claims('variant').filter(c => c.editorial_status === 'document_checked' && c.evidence_kind === 'primary')
    .map(c => ({ value:c.value,reference:reference(c) }));
  const related = matrix.term_relations.filter(relation => relation.related_term_slug === term.slug &&
    relation.editorial_status === 'document_checked' && sourceById.get(relation.source_id)?.authority === 'primary')
    .map(relation => ({ name: relation.term_slug.charAt(0).toUpperCase() + relation.term_slug.slice(1),
      reference: reference({ ...relation, evidence_kind: 'primary' }) }));
  return { slug: term.slug, name: field('translation_pt') || field('romanization') || term.slug,
    hangul: field('hangul'), romanization: field('romanization'), pronunciation: field('pronunciation_pt'),
    description: field('definition_pt'), meanings, variants, related, evidence };
});
const mapped = new Map(matrix.body_region_terms.map(r => [r.region_slug,r.term_slug]));
const publicRegions = matrix.body_regions.map(r => ({ slug:r.slug, name:r.name_pt, termSlug:mapped.get(r.slug) || null }));
if (publicTerms.length !== 23 || publicRegions.length !== 19 || mapped.size !== 9 ||
  publicRegions.filter(r=>!r.termSlug).length !== 10) {
  throw new Error('Public hand slice unexpectedly changed: review required');
}
const generated = JSON.stringify({ version:1, publicTerms, publicRegions },null,2)+'\n';
if (process.argv.includes('--check')) {
  if (readFileSync(output,'utf8') !== generated) throw new Error('Public hand projection changed. Regenerate after reviewing the diff.');
  console.log('public hand: 23 terms; 19 regions; 9 linked; 10 illustrative');
} else {
  writeFileSync(output,generated);
  console.log('Wrote '+fileURLToPath(output));
}
