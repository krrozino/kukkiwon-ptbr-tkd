import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadBatches, validateBatches } from './content.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = resolve(root, 'review-output');

export const reviewColumns = [
  'lote','categoria','slug','tipo_registro','romanizacao','hangul','traducao_pt_provisoria',
  'definicao_pt_provisoria','fonte_instituicao','fonte_titulo','fonte_edicao',
  'fonte_ano','fonte_url','localizador_exato','linhas_extracao_nao_paginacao',
  'estado_documental_atual','revisao_2022_atual','revisao_humana_comprovada',
  'variante_de','regioes_relacionadas','observacoes_preexistentes',
  'revisar_hangul_romanizacao','revisar_traducao','revisar_execucao',
  'revisar_anatomia_variantes','comparar_edicao_2022','decisao_final',
  'revisor','data_revisao','link_evidencia_revisao','observacoes_revisor'
];

const reviewPending = {
  revisar_hangul_romanizacao: 'pendente',
  revisar_traducao: 'pendente',
  revisar_execucao: 'pendente',
  revisar_anatomia_variantes: 'pendente',
  comparar_edicao_2022: 'pendente',
  decisao_final: 'pendente',
  revisor: '',
  data_revisao: '',
  link_evidencia_revisao: '',
  observacoes_revisor: ''
};

export function createReviewEntries(batches, { batch, category } = {}) {
  const report = validateBatches(batches);
  if (report.errors.length) {
    throw new Error('Pesquisa inválida; exportação bloqueada:\n' + report.errors.join('\n'));
  }
  const entries = batches.flatMap(item => item.records.map(record => ({
    lote: item.batch,
    categoria: record.category,
    slug: record.slug,
    tipo_registro: record.record_kind || 'technique',
    romanizacao: record.romanization,
    hangul: record.hangul,
    traducao_pt_provisoria: record.translation_pt,
    definicao_pt_provisoria: record.definition_pt,
    fonte_instituicao: item.source.institution,
    fonte_titulo: item.source.title,
    fonte_edicao: item.source.edition || '',
    fonte_ano: String(item.source.year || ''),
    fonte_url: item.source.url,
    localizador_exato: record.source_locator,
    linhas_extracao_nao_paginacao: record.web_extraction_lines || '',
    estado_documental_atual: record.editorial_status,
    revisao_2022_atual: record.comparison_with_2022 || 'pendente',
    revisao_humana_comprovada: record.evidence?.human_checked === true ? 'sim' : 'nao',
    variante_de: record.variant_of || '',
    regioes_relacionadas: (record.anatomical_links || []).map(link =>
      link.region_slug + ' (' + link.relation_type + ')').join(' | '),
    observacoes_preexistentes: Array.isArray(record.review_notes)
      ? record.review_notes.join(' | ') : '',
    ...reviewPending
  })));
  const selected = entries.filter(row =>
    (!batch || row.lote === batch) && (!category || row.categoria === category));
  if (selected.length === 0) {
    throw new Error('Nenhum registro corresponde ao lote ou à categoria solicitada.');
  }
  return selected.sort((a, b) => a.categoria.localeCompare(b.categoria, 'pt-BR') ||
    a.romanizacao.localeCompare(b.romanizacao, 'pt-BR') || a.slug.localeCompare(b.slug));
}

export function escapeSpreadsheetCell(value) {
  let text = value == null ? '' : String(value);
  // Excel/Sheets can interpret a malicious cell as a formula, even when quoted in CSV.
  if (/^\s*[=+@-]/u.test(text) || /^[\t\r\n]/u.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}

export function serializeReviewCsv(entries) {
  if (!Array.isArray(entries) || entries.length === 0) throw new Error('Lote vazio.');
  const header = reviewColumns.map(escapeSpreadsheetCell).join(';');
  const rows = entries.map(entry => reviewColumns.map(column =>
    escapeSpreadsheetCell(entry[column])).join(';'));
  // UTF-8 BOM and CRLF are deliberate for opening in Excel configured for pt-BR.
  return '\ufeff' + [header, ...rows].join('\r\n') + '\r\n';
}

export function parseReviewOptions(args) {
  const options = {};
  const allowed = new Map([
    ['--batch','batch'],['--category','category'],['--output','output']
  ]);
  for (let i = 0; i < args.length; i++) {
    const property = allowed.get(args[i]);
    if (!property || !args[i + 1] || args[i + 1].startsWith('--') ||
        options[property] !== undefined) {
      throw new Error('Uso: npm run content:review -- [--batch id] [--category nome] [--output arquivo.csv]');
    }
    options[property] = args[++i];
  }
  if (options.output && !/^[a-zA-Z0-9][a-zA-Z0-9._-]*\.csv$/u.test(options.output)) {
    throw new Error('O arquivo deve ser um nome .csv simples dentro de review-output/.');
  }
  return options;
}

export function runReviewExport(args) {
  const options = parseReviewOptions(args);
  const entries = createReviewEntries(loadBatches(), options);
  const csv = serializeReviewCsv(entries);
  if (options.output) {
    mkdirSync(outputDirectory, { recursive: true });
    const destination = resolve(outputDirectory, options.output);
    // Never silently replace a spreadsheet already annotated by a human reviewer.
    writeFileSync(destination, csv, { encoding: 'utf8', flag: 'wx' });
    process.stdout.write('Arquivo criado em review-output/' + options.output +
      ' (' + entries.length + ' registros). Nenhuma publicação ou importação realizada.\n');
  } else {
    process.stdout.write(csv);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { runReviewExport(process.argv.slice(2)); }
  catch (error) { process.stderr.write(error.message + '\n'); process.exitCode = 1; }
}
