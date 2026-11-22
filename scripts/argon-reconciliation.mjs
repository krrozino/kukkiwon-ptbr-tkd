import { readFileSync, writeFileSync, readdirSync, realpathSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join, basename, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const EXPECTED_SHA = '38dcec3822fc052c98554122b438d3db7b262f85ca390063f0ec4a7b8f1cd226';
function actualPath(path) {
  const suffix = []; let current = resolve(path);
  while (!existsSync(current)) { suffix.unshift(basename(current)); current = dirname(current); }
  return join(realpathSync(current), ...suffix);
}
export function assertPrivateOutput(path, root = ROOT) {
  const out = actualPath(path), project = actualPath(root);
  const comparable = value => process.platform === 'win32' ? value.toLowerCase() : value;
  if (comparable(out) === comparable(project) || comparable(out).startsWith(comparable(project + sep))) {
    throw new Error('A matriz bruta exige saída externa à worktree; nunca src/public/dist/content.');
  }
  return out;
}
function modules(record) {
  if (record.number <= 60) return ['iron', 'kibon-dongjak'];
  if (record.number <= 125) return record.number >= 89 && record.number <= 105 ? ['balkisul', 'atlas'] : ['sonkisul', 'atlas'];
  if (record.number <= 227) return ['kibon-dongjak'];
  if (record.number <= 291) return ['sonkisul'];
  if (record.number <= 325) return ['balkisul'];
  if (record.number <= 349) return record.number === 343 ? ['palgwae'] : ['poomsae'];
  return ['iron', 'kyorugi'];
}
export function buildArgonMatrix(input, { existing = [], expected = 380 } = {}) {
  if (!Array.isArray(input?.records) || input.records.length !== expected) throw new Error(`Inventário deve conter ${expected} registros.`);
  const ids = new Set(), slugs = new Set();
  const sections = {}, grades = {};
  const records = input.records.map((record, index) => {
    if (record.id !== 'TKD-' + String(index + 1).padStart(3, '0') || ids.has(record.id)) throw new Error('ID repetido ou fora de ordem.');
    if (typeof record.candidate_slug !== 'string' || !record.candidate_slug || slugs.has(record.candidate_slug)) throw new Error('Slug candidato ausente ou duplicado.');
    if (!Number.isInteger(record.page_start) || !Number.isInteger(record.page_end) || record.page_start < 1 || record.page_end < record.page_start || record.page_end > 334) throw new Error('Intervalo de página inválido.');
    if (!record.raw_cells || typeof record.raw_cells !== 'object') throw new Error('Células brutas ausentes.');
    ids.add(record.id); slugs.add(record.candidate_slug);
    sections[record.section] = (sections[record.section] || 0) + 1;
    grades[record.raw_evidence_class] = (grades[record.raw_evidence_class] || 0) + 1;
    const matches = existing.filter(item => item.slug === record.candidate_slug).map(item => ({ ...item, basis: 'exact_slug_only' }));
    return {
      research_id: record.id, original: record,
      variants_raw: record.raw_cells.variants ?? '', sources_raw: record.raw_cells.source_audit ?? '',
      matches, disposition: matches.length ? 'existing_candidate_identity_requires_validation' : 'integration_candidate_requires_validation',
      navigation_proposals: modules(record), navigation_verified: false,
      publication: 'research_only', external_verification: 'not_performed',
    };
  });
  return { records, unique_ids: ids.size, sections, grades_as_printed: grades,
    matching_candidates: records.filter(record => record.matches.length).length,
    claimed_aliases: 152, aliases_independently_verified: false,
    grade_summary_claim: { A: 327, B: 40, C: 13 },
    note: 'Propostas de navegação e correspondências textuais não provam identidade técnica. Células, variantes e fontes são preservadas literalmente; nenhuma publicação ou fusão automática.' };
}
function loadExisting(root) {
  const output = [];
  for (const name of readdirSync(join(root, 'content/review')).filter(name => name.endsWith('.json'))) {
    const data = JSON.parse(readFileSync(join(root, 'content/review', name), 'utf8'));
    for (const item of data.records || []) output.push({ slug: item.slug, origin: 'content/review/' + name, state: 'draft' });
  }
  const hand = JSON.parse(readFileSync(join(root, 'src/data/public-hand-v1.json'), 'utf8'));
  for (const term of hand.publicTerms) output.push({ slug: term.slug, origin: 'public-hand-v1', state: 'existing_public_projection' });
  return output;
}
const csvValue = value => '"' + String(value ?? '').replaceAll('"', '""') + '"';
export function run({ source, output, priorLibrary }) {
  if (typeof output !== 'string' || !/\.json$/i.test(output)) throw new Error('A saída integral deve usar extensão .json; o CSV é gerado separadamente.');
  const dest = assertPrivateOutput(output);
  const sourceRoot = resolve(source);
  const pdf = join(sourceRoot, 'DOCUMENTO_ORIGINAL.pdf');
  if (!statSync(pdf).isFile()) throw new Error('PDF original ausente.');
  const sha = createHash('sha256').update(readFileSync(pdf)).digest('hex');
  if (sha !== EXPECTED_SHA) throw new Error('Hash do PDF diverge do pacote indicado.');
  const pages = readFileSync(join(sourceRoot, 'texto_334_paginas.jsonl'), 'utf8').trim().split(/\r?\n/).map(line => JSON.parse(line));
  if (pages.length !== 334 || pages.some((page, index) => page.page !== index + 1 || typeof page.text !== 'string')) throw new Error('Extração de páginas incompleta.');
  const existing = loadExisting(ROOT);
  if (priorLibrary) {
    for (const term of JSON.parse(readFileSync(priorLibrary, 'utf8'))) existing.push({ slug: term.slug, origin: 'PR74-candidate', state: 'unverified_draft' });
  }
  const input = JSON.parse(readFileSync(join(sourceRoot, 'inventario_380_celulas_brutas.json'), 'utf8'));
  const matrix = buildArgonMatrix(input, { existing });
  const bundle = { source_pdf_sha256: sha, source_pages: pages.length, ...matrix,
    document_pages_preserved: pages,
    links_from_pdf_unverified: JSON.parse(readFileSync(join(sourceRoot, 'fontes_links_pdf.json'), 'utf8')),
  };
  mkdirSync(dirname(dest), { recursive: true });
  const csvPath = assertPrivateOutput(dest.replace(/\.json$/i, '') + '.csv');
  if (actualPath(dest).toLowerCase() === actualPath(csvPath).toLowerCase()) throw new Error('JSON e CSV precisam de destinos distintos.');
  writeFileSync(dest, JSON.stringify(bundle, null, 2) + '\n');
  const csv = [['research_id','candidate_slug','pages','section','matches','disposition','variants_raw','source_raw','proposed_modules']];
  for (const record of matrix.records) csv.push([record.research_id,record.original.candidate_slug,
    record.original.page_start + '-' + record.original.page_end,record.original.section,
    record.matches.map(item => item.origin + ':' + item.slug).join(' | '), record.disposition,
    record.variants_raw,record.sources_raw,record.navigation_proposals.join(' | ')]);
  writeFileSync(csvPath, '\uFEFF' + csv.map(row => row.map(csvValue).join(',')).join('\r\n') + '\r\n');
  return { records: matrix.unique_ids, pages: pages.length, matching_candidates: matrix.matching_candidates,
    no_exact_match: matrix.unique_ids - matrix.matching_candidates, grades_as_printed: matrix.grades_as_printed,
    aliases_independently_verified: false, source_pdf_sha256: sha, output: dest, csv: csvPath };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), value = flag => args[args.indexOf(flag) + 1];
  if (!args.includes('--source') || !args.includes('--output')) {
    console.error('Uso: node scripts/argon-reconciliation.mjs --source PASTA_PACOTE --output CAMINHO_EXTERNO.json [--prior-library JSON_PR74]');
    process.exitCode = 2;
  } else {
    try { console.log(JSON.stringify(run({ source: value('--source'), output: value('--output'), priorLibrary: args.includes('--prior-library') ? value('--prior-library') : undefined }), null, 2)); }
    catch (error) { console.error(error.message); process.exitCode = 1; }
  }
}
