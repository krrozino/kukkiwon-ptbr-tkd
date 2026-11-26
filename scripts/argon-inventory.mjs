import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ID_PATTERN = /^TKD-(\d{3})$/;
const CATEGORIES = [
  ['Morfologia e terminologia', 60],
  ['Anatomia e superfícies corporais', 65],
  ['Bases e deslocamentos', 52],
  ['Bloqueios e defesas', 50],
  ['Ataques de mão e braço', 64],
  ['Ataques de pé e perna', 34],
  ['Poomsae', 24],
  ['Kyorugi, Hoshinsul e demais', 31],
];

export function inspectArgonInventory(input, { expected = 380, pages = 334 } = {}) {
  if (!input || typeof input !== 'object' || !Array.isArray(input.records)) {
    throw new Error('Inventário Argon deve conter records[].');
  }
  if (input.records.length !== expected) {
    throw new Error('Contagem de registros divergente: ' + input.records.length + ' (esperados ' + expected + ').');
  }
  const ids = new Set(), slugs = new Set(), classes = {};
  const records = input.records.map((r, index) => {
    const match = typeof r?.id === 'string' && r.id.match(ID_PATTERN);
    if (!match || Number(match[1]) !== index + 1 || ids.has(r.id)) {
      throw new Error('ID ausente, repetido ou fora de ordem na posição ' + (index + 1));
    }
    const slug = typeof r.candidate_slug === 'string' ? r.candidate_slug.normalize('NFC').trim() : '';
    if (!slug || slugs.has(slug) || slug.length > 180) {
      throw new Error('Slug de pesquisa ausente/duplicado: ' + r.id);
    }
    if (!Number.isInteger(r.page_start) || !Number.isInteger(r.page_end) ||
      r.page_start < 1 || r.page_start > r.page_end || r.page_end > pages) {
      throw new Error('Página inválida no registro ' + r.id);
    }
    if (!r.raw_cells || typeof r.raw_cells !== 'object' || Array.isArray(r.raw_cells)) {
      throw new Error('Células brutas ausentes em ' + r.id);
    }
    const grade = r.raw_evidence_class || 'UNCLASSIFIED';
    classes[grade] = (classes[grade] || 0) + 1;
    ids.add(r.id);
    slugs.add(slug);
    return {
      research_id: r.id,
      proposed_slug: slug,
      source_pdf_pages: [r.page_start, r.page_end],
      source_class_raw: grade,
      raw_hangul: typeof r.hangul_raw === 'string' ? r.hangul_raw : '',
      raw_romanization: typeof r.romanization_raw === 'string' ? r.romanization_raw : '',
      needs_field_verification: true,
      may_publish: false,
    };
  });
  return { expected, unique_ids: ids.size, unique_candidate_slugs: slugs.size,
    classes_by_raw_row: classes, summary_grade_conflict: 
    classes.A !== 327 || classes.B !== 40 || classes.C !== 13,
    category_expectations: CATEGORIES.map(([name, count]) => ({ name, claimed_count: count })),
    records };
}

export function reconcileWithExisting(inventory, existingSlugs) {
  const slugs = new Set(existingSlugs);
  const matches = inventory.records.filter(r => slugs.has(r.proposed_slug));
  return { candidate_count: inventory.records.length, exact_slug_matches: matches.length,
    exact_matches: matches.map(r => r.research_id),
    unmatched_count: inventory.records.length - matches.length,
    note: 'Correspondência textual não confirma identidade, romanização, tradução ou fonte. Nenhum registro é publicado.' };
}

export function loadExistingReviewSlugs(root = ROOT) {
  const folder = resolve(root, 'content/review');
  return readdirSync(folder).filter(f => f.endsWith('.json')).flatMap(file => {
    const data = JSON.parse(readFileSync(join(folder, file), 'utf8'));
    return Array.isArray(data.records) ? data.records.map(r => r.slug).filter(s => typeof s === 'string') : [];
  });
}

export function allowedOutputPath(path, root = ROOT) {
  const out = resolve(path);
  const deny = ['src', 'public', 'dist', 'content/review', '.github'];
  for (const folder of deny) {
    const dir = resolve(root, folder);
    if (out === dir || out.startsWith(dir + sep)) {
      throw new Error('Saída de pesquisa proibida dentro de ' + folder);
    }
  }
  return out;
}

function valueAfter(args, flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const inputPath = valueAfter(process.argv, '--input');
  if (!inputPath) {
    console.error('Uso: node scripts/argon-inventory.mjs --input CAMINHO/inventario_380_celulas_brutas.json [--output CAMINHO/relatorio-privado.json]');
    process.exitCode = 2;
  } else {
    try {
      const inventory = inspectArgonInventory(JSON.parse(readFileSync(inputPath, 'utf8')));
      const reconcile = reconcileWithExisting(inventory, loadExistingReviewSlugs());
      const output = { source: 'Enciclopédia Técnica de Taekwondo — extração bruta', ...inventory,
        reconciliation: reconcile, claimed_aliases_not_reconciled: 152,
        publication_status: 'research_only', source_verification: 'not_performed' };
      const path = valueAfter(process.argv, '--output');
      if (path) writeFileSync(allowedOutputPath(path), JSON.stringify(output, null, 2) + '\n');
      console.log(JSON.stringify({
        records: inventory.unique_ids, unique_slugs: inventory.unique_candidate_slugs,
        raw_grade_counts: inventory.classes_by_raw_row,
        grade_summary_conflicts: inventory.summary_grade_conflict,
        exact_slug_matches: reconcile.exact_slug_matches,
        unmatched: reconcile.unmatched_count,
        wrote_private_output: Boolean(path)
      }, null, 2));
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  }
}
