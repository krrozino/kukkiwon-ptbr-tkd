import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { studyDirections, taegeukOneStudy } from '../src/data/poomsae-study.ts';

const defaultDossierPath = resolve('review-output/taegeuk-2-jang.research.json');
const dossierPath = process.env.POOMSAE_RESEARCH_FILE ? resolve(process.env.POOMSAE_RESEARCH_FILE) : defaultDossierPath;
const outputPath = resolve(process.argv[2] ?? 'review-output/revisao-docente-taegeuk-1-e-2.md');

const techniqueSlugNotes = {
  'arae-makgi': 'Na Biblioteca, Arae-makgi remete à ficha Naeryeo-makgi (`/biblioteca/kibon-dongjak/naeryeo-makgi`).',
  'momtong-an-makgi': 'Na Biblioteca, Momtong-an-makgi remete à ficha An-makgi (`/biblioteca/kibon-dongjak/an-makgi`).',
  'olgul-makgi': 'Na Biblioteca, Olgul-makgi remete à ficha Ollyeo-makgi (`/biblioteca/kibon-dongjak/ollyeo-makgi`).',
  'momtong-bandae-jireugi': 'Na Biblioteca, o link "Família Jireugi" utiliza o slug `jeocheo-jireugi` (`/biblioteca/kibon-dongjak/jeocheo-jireugi`, ficha Jeocheo-jireugi).',
  'olgul-bandae-jireugi': 'Na Biblioteca, o link "Família Jireugi" utiliza o slug `jeocheo-jireugi` (`/biblioteca/kibon-dongjak/jeocheo-jireugi`, ficha Jeocheo-jireugi).',
  'ap-chagi': 'Ficha na Biblioteca: `/biblioteca/balkisul/ap-chagi`.',
};

function formatLineSteps(movements, targetDirection) {
  const numbers = movements.filter((m) => m.direction === targetDirection).map((m) => m.number);
  const ranges = [];
  for (const number of numbers) {
    const prev = ranges.at(-1);
    if (prev && prev.last + 1 === number) prev.last = number;
    else ranges.push({ first: number, last: number });
  }
  return ranges.map(({ first, last }) => (first === last ? String(first) : `${first}–${last}`)).join(', ') || '—';
}

function renderCourseSummary(movements) {
  const axial = movements
    .filter((m) => m.direction === 'ga' || m.direction === 'na')
    .map((m) => `${m.number} (${studyDirections[m.direction].label})`)
    .join(', ');

  return [
    '| Linha lateral | Esquerda (`Ra`) | Direita (`Da`) |',
    '| --- | --- | --- |',
    `| Linha 1 | Ra 1: ${formatLineSteps(movements, 'ra1')} | Da 1: ${formatLineSteps(movements, 'da1')} |`,
    `| Linha 2 | Ra 2: ${formatLineSteps(movements, 'ra2')} | Da 2: ${formatLineSteps(movements, 'da2')} |`,
    `| Linha 3 | Ra 3: ${formatLineSteps(movements, 'ra3')} | Da 3: ${formatLineSteps(movements, 'da3')} |`,
    '',
    `- **Eixo central (Na / Ga):** ${axial}`,
  ].join('\n');
}

function renderTaegeukOne() {
  const study = taegeukOneStudy;
  const lines = [
    `## 1. ${study.slug === 'taegeuk-1-jang' ? 'Taegeuk 1 Jang' : study.slug} (${study.hangul})`,
    '',
    `- **Identidade oficial:** [${study.identityLocator}](${study.identityUrl})`,
    `- **Fonte principal:** ${study.source.institution} · *${study.source.title}* (${study.source.edition}) — [PDF pp. ${study.start.citation.page}–${study.finish.citation.page}](${study.source.url}#page=${study.start.citation.page})`,
    `- **Demonstração em vídeo:** [${study.demonstration.recording.label}](${study.demonstration.recording.href}) · [${study.demonstration.lesson.label}](${study.demonstration.lesson.href}) (${study.demonstration.lesson.credit})`,
    `- **Nota de leitura:** ${study.readingNote}`,
    `- **Início:** ${study.start.title} · ${study.start.base.label} (p. ${study.start.citation.page}, quadro ${study.start.citation.locator})`,
    `- **Fim:** ${study.finish.title} · ${study.finish.base.label} (p. ${study.finish.citation.page}, quadro ${study.finish.citation.locator})`,
    '',
    '### Esquema de deslocamento (sem imagens externas)',
    '',
    renderCourseSummary(study.movements),
    '',
    '### Ficha de revisão por movimento — Taegeuk 1 Jang',
    '',
    '| Nº | Quadros | Direção | Base | Lateralidade | Técnica e fichas | Fontes | Pontos para confirmação docente |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ];

  for (const m of study.movements) {
    const dir = `${studyDirections[m.direction].arrow} ${studyDirections[m.direction].label}`;
    const isCompound = (m.frameCount ?? 1) > 1;
    const baseLabel = isCompound ? `${m.base.label} (base final)` : m.base.label;
    const techs = m.related.map((r) => `${r.label} (\`${r.href}\`)`).join('; ');
    const sourceText = `[Kukkiwon EMC p. ${m.citation.page}, quadro ${m.citation.locator}](${study.source.url}#page=${m.citation.page})`;
    const points = isCompound
      ? 'Movimento composto (2 quadros): confirmar sequência chute/soco, base final e alinhamento com o vídeo.'
      : 'Confirmar nomenclatura, lateralidade e execução conforme vídeo oficial.';
    lines.push(`| ${String(m.number).padStart(2, '0')} | ${m.citation.locator} | ${dir} | ${baseLabel} | ${m.lead} | **${m.title}** — ${techs} | ${sourceText} | ${points} |`);
  }

  return lines.join('\n');
}

function renderTaegeukTwo(dossier) {
  const sourceById = new Map(dossier.sources.map((s) => [s.id, s]));
  const footDiscrepancy = dossier.discrepancies.find((d) => d.path === 'movements[number=14].footTransition');

  const lines = [
    `## 2. ${dossier.name} (${dossier.hangul})`,
    '',
    `- **Identidade oficial:** [Board 37, nº 981](${dossier.identityUrl})`,
    `- **Contagem:** ${dossier.counts.numberedMovements} etapas numeradas · ${dossier.counts.actions} ações (preparação e retorno fora da contagem)`,
    `- **Fonte principal:** ${dossier.source.institution} · *${dossier.source.title}* (${dossier.source.edition}) — [PDF pp. ${dossier.start.citation.page}–${dossier.finish.citation.page}](${dossier.source.url}#page=${dossier.start.citation.page})`,
    `- **Confirmação audiovisual:** Pendente (sem imagens externas copiadas; consulta apenas via links oficiais e páginas de referência).`,
    `- **Início:** ${dossier.start.title} · ${dossier.start.posture.label} (${dossier.start.base?.label ?? ''}) — p. ${dossier.start.citation.page}, ${dossier.start.citation.locator}`,
    `- **Fim:** ${dossier.finish.title} · ${dossier.finish.posture.label} (${dossier.finish.base?.label ?? ''}) — p. ${dossier.finish.citation.page}, ${dossier.finish.citation.locator}`,
    '',
    '### Destaque obrigatório: divergência na transição do movimento 14',
    '',
  ];

  if (footDiscrepancy) {
    lines.push(`- **Campo em revisão:** \`${footDiscrepancy.path}\` (${footDiscrepancy.status})`);
    for (const variant of footDiscrepancy.variants ?? []) {
      const src = sourceById.get(variant.evidence.sourceId);
      const pageRef = variant.evidence.page ? `p. ${variant.evidence.page}, ` : '';
      lines.push(`- **${src?.institution ?? variant.evidence.sourceId}** (${pageRef}${variant.evidence.locator}): ${variant.summary}`);
    }
    if (footDiscrepancy.note) {
      lines.push(`- **Nota técnica:** ${footDiscrepancy.note}`);
    }
  }

  lines.push(
    '',
    '### Nota sobre nomenclatura e links para fichas técnicas',
    '',
    '- O link denominado **"Família Jireugi"** (usado nos movimentos com `momtong-bandae-jireugi` e `olgul-bandae-jireugi`) aponta para `/biblioteca/kibon-dongjak/jeocheo-jireugi`, pois na Biblioteca a ficha da família Jireugi é hospedada sob o slug `jeocheo-jireugi` (*Jeocheo-jireugi*).',
    '- `Arae-makgi` remete à ficha `naeryeo-makgi`; `Momtong-an-makgi` remete à ficha `an-makgi`; `Olgul-makgi` remete à ficha `ollyeo-makgi`.',
    '',
    '### Esquema de deslocamento (sem imagens externas)',
    '',
    renderCourseSummary(dossier.movements),
    '',
    '### Ficha de revisão por movimento — Taegeuk 2 Jang',
    '',
    '| Nº | Quadros | Direção | Base | Lateralidade | Técnica e fichas | Fontes | Pontos para confirmação docente |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
  );

  for (const m of dossier.movements) {
    const dir = `${studyDirections[m.direction].arrow} ${studyDirections[m.direction].label}`;
    const isCompound = m.actions.length > 1;
    const quadros = m.actions.map((a) => a.frame).join(', ');
    const baseLabel = isCompound ? `${m.base.label} (${m.base.hangul}) — base final` : `${m.base.label} (${m.base.hangul})`;

    const techs = m.actions
      .map((a, idx) => {
        const prefix = isCompound ? `${idx + 1}ª ação (${a.frame}): ` : '';
        const slugNote = techniqueSlugNotes[a.techniqueId] ?? '';
        return `${prefix}**${a.label}** (*${a.romanizationSource}* · ${a.hangul}) ${slugNote}`.trim();
      })
      .join('<br>');

    const refs = [];
    for (const ev of m.evidence) {
      const src = sourceById.get(ev.sourceId);
      const pageTxt = ev.page ? `p. ${ev.page}, ` : '';
      refs.push(`${src?.institution ?? ev.sourceId} (${pageTxt}${ev.locator})`);
    }
    const sourcesText = refs.join('; ');

    const points = [];
    if (m.number === 14) {
      points.push('**DIVERGÊNCIA DE TRANSIÇÃO:** confirmar se o pé direito faz pequeno deslocamento (Kukkiwon EMC p. 74) ou se ambos os pés permanecem no lugar (Dong-A p. 9).');
    }
    if (isCompound) {
      points.push('Movimento composto (2 quadros): confirmar transição entre chute e soco e base final.');
    }
    points.push('Confirmar execução em vídeo oficial (referência audiovisual pendente).');

    lines.push(`| ${String(m.number).padStart(2, '0')} | ${quadros} | ${dir} | ${baseLabel} | ${m.lead} | ${techs} | ${sourcesText} | ${points.join(' ')} |`);
  }

  return lines.join('\n');
}

const rawDossier = readFileSync(dossierPath, 'utf8');
const dossier = JSON.parse(rawDossier);

const documentLines = [
  '# Material de Revisão Docente — Taekwondo para Todos (Taegeuk 1 e Taegeuk 2)',
  '',
  '> Documento gerado localmente para avaliação de professor de Taekwondo.',
  '> Restrito ao ambiente de desenvolvimento (fora do pacote público). Nenhuma imagem externa sem licença foi copiada.',
  '',
  `Data de geração: ${new Date().toISOString().slice(0, 10)}`,
  '',
  renderTaegeukOne(),
  '',
  renderTaegeukTwo(dossier),
  '',
  '## 3. Checklist de assinatura docente',
  '',
  '- [ ] Taegeuk 1 Jang: sequência de 18 movimentos, bases, lateralidade e movimentos compostos 14 e 16 conferidos.',
  '- [ ] Taegeuk 2 Jang: sequência de 18 etapas / 23 ações e 5 movimentos compostos (8, 10, 16, 17, 18) conferidos.',
  '- [ ] Taegeuk 2 Jang — Movimento 14: definição docente sobre o deslocamento do pé direito vs. pés no lugar.',
  '- [ ] Nomenclaturas e remissões da Biblioteca (incluindo "Família Jireugi" -> slug `jeocheo-jireugi`) validadas para o aluno.',
  '- [ ] Indicação de referência audiovisual oficial para o Taegeuk 2 Jang.',
  '',
];

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, documentLines.join('\n'), 'utf8');
console.log('Material de revisão gerado em:', outputPath);
