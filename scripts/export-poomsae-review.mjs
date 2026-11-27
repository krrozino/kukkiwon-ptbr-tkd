import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { studyDirectionLabel, taegeukOneStudy } from '../src/data/poomsae-study.ts';
import { parseTaegeukTwoDossier } from '../src/lib/poomsae-dossier.ts';

const outputPath = fileURLToPath(new URL('../review-output/revisao-docente-taegeuk-1-e-2.md', import.meta.url));
if (process.argv.length > 2) {
  throw new Error('O exportador usa um destino fixo em review-output e não aceita argumentos posicionais.');
}

function cite({ institution, url, page, locator }) {
  const href = new URL(url);
  if (page) href.hash = 'page=' + page;
  return `[${institution} · ${page ? 'p. ' + page + ' · ' : ''}${locator}](${href.href})`;
}

function renderStudy(study, title) {
  const actions = study.movements.reduce((total, { frames }) => total + frames.length, 0);
  const lines = [
    '## ' + title,
    '',
    `- [${study.hangul} · ${study.identityLocator}](${study.identityUrl})`,
    `- ${study.movements.length} movimentos numerados e ${actions} ações. ${study.readingNote}`,
    `- ${study.source.title} · ${study.source.edition} · consulta de ${study.source.sourceCheckedAt}`,
  ];
  for (const [label, point] of [['Preparação', study.start], ['Retorno', study.finish]]) {
    const reference = cite({ ...study.source, ...point.citation });
    lines.push(`- ${label} · ${point.base.label} · ${studyDirectionLabel(point.direction)} · ${reference}`);
  }
  for (const movement of study.movements) {
    lines.push('', `### ${movement.number}. ${movement.title}`, '');
    lines.push(`- Direção no percurso · ${studyDirectionLabel(movement.direction)}`);
    if (movement.base) lines.push(`- Base final · ${movement.base.label}`);
    if (movement.baseSide) lines.push(`- Lado da base · ${movement.baseSide}`);
    if (movement.leadFoot) lines.push(`- Pé da frente · ${movement.leadFoot}`);
    if (movement.displacement) lines.push(`- Deslocamento · ${movement.displacement}`);
    if (movement.transitionPending) lines.push('- Deslocamento em revisão docente.');
    if (movement.description) lines.push('', movement.description, '');
    for (const frame of movement.frames) {
      const labels = [frame.label, frame.romanization, frame.hangul, frame.executor].filter(Boolean);
      const references = [frame.reference, ...frame.additionalReferences ?? []].map(cite);
      lines.push(`- Quadro ${frame.id} · ${labels.join(' · ')} · ${references.join(' · ')}`);
    }
    for (const reference of movement.references ?? []) lines.push('- ' + cite(reference));
    for (const { summary, reference } of movement.discrepancy?.variants ?? []) {
      lines.push(`- Divergência · ${summary} · ${cite(reference)}`);
    }
    if (movement.discrepancy?.note) lines.push('- ' + movement.discrepancy.note);
    lines.push(...(movement.reviewPoints ?? ['Conferir execução, lateralidade e nomenclatura nas referências.'])
      .map((point) => '- [ ] ' + point));
  }
  return lines.join('\n');
}

const dossierPath = process.env.POOMSAE_RESEARCH_FILE;
const second = dossierPath ? parseTaegeukTwoDossier(JSON.parse(readFileSync(dossierPath, 'utf8'))) : null;
const sections = [
  '# Ficha de revisão docente — Taekwondo para Todos',
  'Material de consulta interna. Revisão técnica e linguística pendentes.',
  renderStudy(taegeukOneStudy, 'Taegeuk 1 Jang'),
  second ? renderStudy(second, 'Taegeuk 2 Jang') : 'Para incluir o Taegeuk 2, informe o dossiê local em `POOMSAE_RESEARCH_FILE`.',
];

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, sections.join('\n\n') + '\n', 'utf8');
console.log('Ficha gerada em', outputPath);
