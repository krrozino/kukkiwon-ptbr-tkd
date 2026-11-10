import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { HandRegionPanel, HandTermPanel } from '../src/components/research/HandDocumentationPanel';
import { validateHandMatrix } from '../src/lib/atlas-hand-documentation';

const matrix = () => validateHandMatrix(JSON.parse(readFileSync('content/research/atlas-hand-v1/matrix.json', 'utf8')));

const BANNED_EDITORIAL_STRINGS = [
  'Revisão humana pendente',
  'Conferência documental',
  'Análise documental',
  'Conteúdo provisório',
  'Mapeamento editorial proposto',
  'Pendente de aprovação',
  'Sem terminologia técnica vinculada',
  'Identificador documental:',
  'Identificador da região:',
  'Identificação editorial do desenho',
  'Lacunas de pesquisa',
];

describe('Issue #64 — Experiência do Visitante e Apresentação Limpa', () => {
  it('garante que nenhuma região da mão exiba jargão editorial ou mensagens de auditoria', () => {
    const data = matrix();
    for (const region of data.body_regions) {
      const html = renderToStaticMarkup(createElement(HandRegionPanel, { matrix: data, regionSlug: region.slug }));
      expect(html).toContain(region.name_pt);
      for (const banned of BANNED_EDITORIAL_STRINGS) {
        expect(html, `Região ${region.slug} não deve conter "${banned}"`).not.toContain(banned);
      }
    }
  });

  it('garante que fichas de termos da mão apresentem título, dados e fontes de forma limpa', () => {
    const data = matrix();
    for (const term of data.technical_terms) {
      const html = renderToStaticMarkup(createElement(HandTermPanel, { matrix: data, termSlug: term.slug }));
      for (const banned of BANNED_EDITORIAL_STRINGS) {
        expect(html, `Termo ${term.slug} não deve conter "${banned}"`).not.toContain(banned);
      }
    }
  });

  it('exibe dados essenciais de sonnal de forma enciclopédica sem mensagens de rascunho', () => {
    const data = matrix();
    const html = renderToStaticMarkup(createElement(HandTermPanel, { matrix: data, termSlug: 'sonnal' }));
    expect(html).toContain('손날');
    expect(html).toContain('Sonnal');
    expect(html).toContain('Adaptação didática PT-BR');
    expect(html).not.toContain('draft ·');
    expect(html).not.toContain('Revisão humana pendente');
    expect(html).not.toContain('Mapeamento editorial proposto');
  });

  it('região ilustrativa exibe orientação anatômica didática sem reclamar de ausência de coreano', () => {
    const data = matrix();
    const html = renderToStaticMarkup(createElement(HandRegionPanel, { matrix: data, regionSlug: 'illustration-finger-index' }));
    expect(html).toContain('Indicador');
    expect(html).toContain('Superfície anatômica da mão');
    expect(html).not.toContain('lang="ko"');
    expect(html).not.toContain('Sem terminologia técnica vinculada');
    expect(html).not.toContain('permanecem pendentes');
  });
});
