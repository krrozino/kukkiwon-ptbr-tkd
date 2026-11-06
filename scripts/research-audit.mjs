import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { auditResearch, auditStatuses } from '../src/lib/research-audit.ts';
import { researchReportCsv } from '../src/lib/research-reports.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const directory = resolve(root, 'content/research/gemini-2026-11-06');
const json = file => JSON.parse(readFileSync(file, 'utf8'));
const serialize = value => JSON.stringify(value, null, 2) + '\n';
const sha256 = value => createHash('sha256').update(value).digest('hex');

export function buildResearchArtifacts() {
  const source = resolve(directory, 'original');
  const bundle = json(resolve(source, 'tecnicas_rascunho.json'));
  const documentary = json(resolve(directory, 'document-audit.json'));
  if (documentary.records.length !== bundle.records.length) throw new Error('Auditoria documental deve cobrir todos os candidatos.');
  const existing = readdirSync(resolve(root, 'content/review')).filter(n => n.endsWith('.json')).sort().flatMap(file => {
    const batch = json(resolve(root, 'content/review', file));
    return batch.records.map(record => ({
      slug: record.slug, hangul: record.hangul || '', romanization: record.romanization,
      category: record.category, translation_pt: record.translation_pt || '', definition_pt: record.definition_pt || '',
      record_kind: record.record_kind || 'technique', source_locator: record.source_locator, batch: batch.batch,
      ...(record.aliases ? { aliases: record.aliases.map(a => ({ alias: a.alias, alias_kind: a.alias_kind })) } : {}),
    }));
  });
  const audit = auditResearch(bundle, existing, documentary);
  const files = readdirSync(source).sort().map(name => {
    const bytes = readFileSync(resolve(source, name)); return { name, bytes: bytes.length, sha256: sha256(bytes) };
  });
  const entities = ['families', 'morphemes', 'surfaces', 'poomsae', 'commands'].map(kind => {
    const list = json(resolve(source, kind + '_rascunho.json'));
    const ids = new Set(list.map(r => r.candidate_id));
    if (ids.size !== list.length || list.some(r => r.editorial_status !== 'research' || r.publication_status !== 'draft' || r.eligible_for_public_site !== false || !Array.isArray(r.raw_columns))) throw new Error('Entidade malformada ou promovida: ' + kind);
    if (list.length !== bundle.metadata.other_categories[kind]) throw new Error('Contagem divergente: ' + kind);
    return { kind, count: list.length, ids: [...ids] };
  });
  const expectedEntities = entities.flatMap(e => e.ids);
  if (!Array.isArray(documentary.other_entities) || documentary.other_entities.length !== expectedEntities.length || new Set(documentary.other_entities.map(e => e.id)).size !== expectedEntities.length || documentary.other_entities.some(e => !expectedEntities.includes(e.id) || !auditStatuses.includes(e.audit_status))) throw new Error('Cobertura incompleta das entidades complementares.');
  const references = json(resolve(source, 'referencias_a_conferir.json'));
  if (references.length !== bundle.metadata.references_count || documentary.references?.length !== references.length || new Set(documentary.references.map(r => r.id)).size !== references.length) throw new Error('Cobertura bibliográfica inconsistente.');
  const inventory = { version: 1, bundle: bundle.metadata.bundle, pdf_sha256: bundle.metadata.pdf_sha256, pdf_pages: bundle.metadata.pdf_pages, files, technical_candidates: audit.records.length, existing_records: existing.length, entities, references: references.length };
  const counts = Object.fromEntries(auditStatuses.map(status => [status, audit.records.filter(r => r.audit_status === status).length]));
  const comparisons = Object.fromEntries(['exact_slug', 'normalized_slug', 'explicit_alias', 'same_identity', 'possible_variant_review', 'unmatched_review'].map(kind => [kind, audit.records.filter(r => (r.matches[0]?.kind || 'unmatched_review') === kind).length]));
  const conflicts = audit.records.filter(r => r.matches.some(m => m.conflicts.length));
  const report = `# Auditoria reproduzível da pesquisa Gemini\n\nBase documental: 06/11/2026. Arquivos originais: ${files.length}, preservados byte a byte. PDF: ${inventory.pdf_pages} páginas; SHA-256: \`${inventory.pdf_sha256}\`.\n\n## Cobertura\n\n${audit.records.length} candidatos técnicos classificados; ${expectedEntities.length} entidades complementares; ${references.length} referências com avaliação individual de acesso. O inventário editorial atual contém ${existing.length} registros, sem alteração pelo pipeline.\n\n| Estado documental | Quantidade |\n|---|---:|\n${Object.entries(counts).map(([s, n]) => `| ${s} | ${n} |`).join('\n')}\n\nEsses estados identificam evidência nos campos enumerados de cada registro. Nenhum estado comprova automaticamente tradução PT-BR, execução, anatomia, revisão técnica ou aprovação editorial.\n\n## Comparação recalculada\n\n| Indício | Quantidade |\n|---|---:|\n${Object.entries(comparisons).map(([s, n]) => `| ${s} | ${n} |`).join('\n')}\n\n${conflicts.length} candidatos têm divergência explícita de nome/categoria em uma correspondência. Todas as correspondências, inclusive aliases, exigem decisão humana. Ausência de correspondência não significa técnica nova.\n\n## Pendências por candidato\n\n| Candidato | Evidência documental | Indício principal | Conflitos | PDF |\n|---|---|---|---|---|\n${audit.records.map(r => `| ${r.candidate_id} | ${r.audit_status} | ${r.matches[0]?.kind || 'unmatched_review'} | ${[...new Set(r.matches.flatMap(m => m.conflicts))].join(', ') || '—'} | ${r.original.pdf_pages.join(', ')} |`).join('\n')}\n\n## Uso\n\nExecute \`npm run research:audit\` para conferir os artefatos versionados. Execute \`npm run research:prepare\` para regenerar os relatórios; os hashes dos originais já inventariados precisam continuar idênticos. Abra \`audit.json\` em \`/pesquisa-local\` com o servidor local. O arquivo não integra o build público nem grava dados no Supabase.\n\nVeja o relatório documental em \`docs/research/2026-11-06-documentary-audit.md\` para fontes efetivamente acessadas e limites da conferência. Técnicas, variantes, nomes coreanos, traduções, contatos/alvos e Poomsae continuam dependentes das revisões humanas indicadas.\n`;
  return { 'inventory.json': serialize(inventory), 'audit.json': serialize(audit), 'AUDIT_REPORT.md': report, 'candidates.csv': researchReportCsv(audit.records) };
}

export function runResearchAudit({ write = false } = {}) {
  const artifacts = buildResearchArtifacts();
  const baseline = resolve(directory, 'inventory.json');
  if (existsSync(baseline) && readFileSync(baseline, 'utf8') !== artifacts['inventory.json']) throw new Error('Inventário de origem mudou; revisão explícita exigida. Nenhum arquivo foi sobrescrito.');
  if (write) {
    // Validate the complete input and prepare every output before changing files.
    mkdirSync(directory, { recursive: true });
    for (const [name, body] of Object.entries(artifacts)) writeFileSync(resolve(directory, name), body);
  } else {
    for (const [name, body] of Object.entries(artifacts)) if (!existsSync(resolve(directory, name)) || readFileSync(resolve(directory, name), 'utf8') !== body) throw new Error('Artefato ausente/desatualizado: ' + name);
  }
  return { candidates: JSON.parse(artifacts['audit.json']).records.length, artifacts: Object.keys(artifacts).length, mode: write ? 'prepared' : 'checked' };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    if (process.argv.slice(2).some(a => a !== '--write')) throw new Error('Argumento desconhecido; use somente --write para regenerar.');
    console.log(JSON.stringify(runResearchAudit({ write: process.argv.includes('--write') })));
  } catch (cause) { console.error(cause.message); process.exitCode = 1; }
}
