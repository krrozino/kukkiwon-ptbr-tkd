import { describe, it, expect } from 'vitest';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { HandRegionPanel, HandTermPanel } from '../src/components/research/HandDocumentationPanel';
import { validateHandMatrix } from '../src/lib/atlas-hand-documentation';
import { checkResearchBundle } from '../scripts/check-research-bundle.mjs';

const matrix = () => validateHandMatrix(JSON.parse(readFileSync('content/research/atlas-hand-v1/matrix.json', 'utf8')));
const termHtml = (slug: string) => renderToStaticMarkup(createElement(HandTermPanel, { matrix: matrix(), termSlug: slug }));

describe('Atlas A3 — consulta documental, sem aprovação implícita', () => {
  it('apresenta cada afirmação e sentido com sua própria fonte e localizador', () => {
    const data = matrix();
    for (const term of data.technical_terms) {
      const html = termHtml(term.slug);
      for (const row of [...data.term_field_claims, ...data.term_senses].filter(r => r.term_slug === term.slug)) {
        const key = 'claim_key' in row ? row.claim_key : row.sense_key;
        const entry = html.split(`data-evidence-key="${key}"`)[1]?.split('</article>')[0];
        expect(entry, key).toBeDefined();
        expect(entry, key).toContain(row.source_locator.replaceAll('&', '&amp;').replaceAll('>', '&gt;'));
        expect(entry, key).toContain(data.content_sources.find(s => s.source_id === row.source_id)!.official_url.replaceAll('&', '&amp;'));
        expect(entry, key).toContain('draft');
      }
    }
  });

  it('mantém os nove vínculos como propostas e as dez ilustrações sem Hangul', () => {
    const data = matrix();
    for (const region of data.body_regions) {
      const html = renderToStaticMarkup(createElement(HandRegionPanel, { matrix: data, regionSlug: region.slug }));
      expect(html).toContain(region.slug);
      if (region.region_kind === 'illustrative_anatomy') {
        expect(html).toContain('Sem terminologia técnica vinculada');
        expect(html).not.toContain('lang="ko"');
      } else {
        expect(html).toContain('Mapeamento editorial proposto');
        expect(html).toContain('lang="ko"');
        expect(html).toContain('Revisão humana pendente');
      }
    }
  });

  it('mostra lacunas sem fabricar romanização, pronúncia ou significado literal', () => {
    const historical = termHtml('seun-pyeonjumeok');
    expect(historical).toContain('세운편주먹');
    expect(historical).toContain('data-pending="romanization"');
    expect(historical).toContain('data-pending="pronunciation_pt"');
    expect(historical).toContain('Sem geometria correspondente');
    expect(termHtml('ageumson')).toContain('data-pending="literal_meaning"');
    expect(termHtml('sonnal')).toContain('Adaptação editorial PT-BR');
    expect(termHtml('sonnal')).toContain('Fonte institucional primária');
    expect(termHtml('sonnal')).toContain('Fonte histórica');
    expect(termHtml('sonnal')).toContain('Fundamentação da proposta');
  });

  it('não marca sentido documentado como ausente só porque está na coleção de sentidos', () => {
    const html = termHtml('jumeok');
    expect(html).not.toContain('data-pending="literal_meaning"');
    expect(html).not.toContain('data-pending="technical_meaning"');
    expect(html).toContain('Sentidos por contexto');
    expect(html).toContain('data-evidence-key="jumeok-literal-1"');
  });

  it('não mostra a ficha de outra região e recusa publicação ou referência inválida', () => {
    expect(renderToStaticMarkup(createElement(HandRegionPanel, { matrix: matrix(), regionSlug: 'missing' }))).toContain('Região não documentada');
    expect(termHtml('missing')).toContain('Termo não documentado');
    const data = matrix();
    data.term_field_claims[0].source_locator = '';
    expect(() => renderToStaticMarkup(createElement(HandTermPanel, { matrix: data, termSlug: 'sonnal' }))).toThrow();
    const published = matrix();
    (published.term_field_claims[0] as any).publication_status = 'published';
    expect(() => renderToStaticMarkup(createElement(HandRegionPanel, { matrix: published, regionSlug: 'sonnal' }))).toThrow();
  });

  it('o guard público rejeita fragmentos órfãos da matriz, mesmo sem o cabeçalho JSON', () => {
    const directory = mkdtempSync(join(tmpdir(), 'atlas-a3-fragment-'));
    try {
      writeFileSync(join(directory, 'orphan.js'), 'export const leaked = ' + JSON.stringify(matrix().term_field_claims[0]) + ';');
      expect(() => checkResearchBundle(directory)).toThrow(/Pesquisa privada/);
    } finally { rmSync(directory, { recursive: true, force: true }); }
  });
});
