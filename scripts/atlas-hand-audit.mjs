/** Offline only. Reads curated metadata; never fetches sources or writes a database. */
import { readFileSync, writeFileSync } from 'node:fs';
import { validateHandMatrix, handMatrixCsv } from '../src/lib/atlas-hand-documentation.ts';

const flags = process.argv.slice(2);
if (flags.some(flag => !['--offline','--check','--json','--write'].includes(flag)) ||
  (flags.includes('--write') && flags.includes('--check'))) {
  console.error('Use --offline, --check, --json ou --write (regenera somente o CSV local).');
  process.exitCode = 2;
} else {
  try {
    const directory = new URL('../content/research/atlas-hand-v1/', import.meta.url);
    const catalog = ['kukkiwon-2012-first20','kukkiwon-2012-expansion','sprint02-sonnal-variants']
      .flatMap(name => JSON.parse(readFileSync(new URL('../content/review/' + name + '.json', import.meta.url), 'utf8')).records);
    const matrix = validateHandMatrix(JSON.parse(readFileSync(new URL('matrix.json', directory), 'utf8')), catalog);
    const csv = handMatrixCsv(matrix);
    const target = new URL('claims.csv', directory);
    if (flags.includes('--write')) writeFileSync(target, csv);
    else if (readFileSync(target, 'utf8') !== csv) throw new Error('CSV divergente; revise o JSON e execute npm run atlas:hand:prepare.');
    const result = {
      terms: matrix.technical_terms.length, regions: matrix.body_regions.length,
      senses: matrix.term_senses.length, claims: matrix.term_field_claims.length,
      geometryMappedTerms: matrix.technical_terms.filter(t => t.geometry_status === 'mapped').length,
      pendingGeometryTerms: matrix.technical_terms.filter(t => t.geometry_status === 'pending').length,
      illustrativeRegions: matrix.body_regions.filter(r => r.region_kind === 'illustrative_anatomy').length,
      techniqueRelations: matrix.term_relations.length,
      publishedRows: 0, networkRequests: 0, remoteWrites: 0,
    };
    if (flags.includes('--json')) console.log(JSON.stringify(result, null, 2));
    else console.log(`PASS: ${result.terms} termos, ${result.regions} regiões, ${result.senses} sentidos, ${result.claims} afirmações; ${result.pendingGeometryTerms} configurações sem geometria. Sem publicação, rede ou escrita remota.`);
  } catch (error) {
    console.error('FAIL:', error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
