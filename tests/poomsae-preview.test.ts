import { describe, expect, it, vi } from 'vitest';
import { loadPoomsaePreviews, parseTaegeukTwoStudy } from '../src/lib/poomsae-preview';

const source = {
  id: 'unit-fixture',
  institution: 'Instituição de teste',
  title: 'Documento sintético',
  edition: '1',
  sourceCheckedAt: '2026-11-22',
  url: 'https://example.test/source.pdf',
};
const point = {
  title: 'Preparação de teste',
  direction: 'ga',
  posture: { termId: 'gibon-junbi', label: 'Preparação de teste' },
  citation: { page: 1, locator: 'Preparação' },
};
const action = (frame: string, page: number) => ({
  frame,
  techniqueId: 'ap-chagi',
  label: 'Ação de teste',
  hangul: '테스트',
  romanizationSource: 'Teste',
  evidence: [{ sourceId: source.id, page, locator: 'Quadro ' + frame }],
});
const dossier = () => ({
  schemaVersion: 1,
  slug: 'taegeuk-2-jang',
  hangul: '태극 2장',
  meaning: 'Identidade de teste',
  identityUrl: 'https://example.test/identity',
  source,
  sources: [source],
  review: { distribution: 'local-only', publicationApproved: false },
  counts: { numberedMovements: 2, actions: 3, boundaryIncluded: false },
  start: point,
  finish: { ...point, citation: { page: 5, locator: 'Retorno' } },
  discrepancies: [{ path: 'movements[number=2].footTransition', status: 'pending_technical_review' }],
  movements: [
    {
      number: 1, title: 'Etapa de teste', direction: 'da1', description: null,
      base: { termId: 'ap-seogi', label: 'Base de teste', hangul: '테스트' }, lead: 'Esquerda',
      related: [], citation: { page: 2, locator: 'Quadro 1' }, actions: [action('1', 2)],
    },
    {
      number: 2, title: 'Etapa composta de teste', direction: 'ga', description: 'Descrição de teste',
      base: { termId: 'apgubi', label: 'Base final de teste', hangul: '테스트' }, lead: 'Direita',
      related: [{ label: 'Link inválido', href: '/biblioteca/x/inexistente' }],
      citation: { page: 3, locator: 'Quadros 2-1 e 2-2' }, actions: [action('2-1', 3), action('2-2', 4)],
    },
  ],
});

describe('dados locais da prévia Taegeuk 2', () => {
  it('mantém as prévias ausentes sem o comando Astro dev, mesmo com DEV ativo', async () => {
    vi.stubEnv('DEV', true);
    try {
      await expect(loadPoomsaePreviews()).resolves.toEqual([]);
    } finally {
      vi.unstubAllEnvs();
    }
  });
  it('agrupa os quadros em sua etapa e mantém base final, fontes e posições em revisão', () => {
    const study = parseTaegeukTwoStudy(dossier());
    expect(study.actionCount).toBe(3);
    expect(study.movements).toHaveLength(2);
    expect(study.start.base.href).toBe('/biblioteca/kibon-dongjak/gibon-junbi');
    const last = study.movements[1];
    expect(last.base.href).toBe('/biblioteca/kibon-dongjak/apgubi');
    expect(last.related).toEqual([]);
    expect(last.transitionPending).toBe(true);
    expect(last.frames?.map(({ id, reference }) => [id, reference.page])).toEqual([['2-1', 3], ['2-2', 4]]);
  });

  it('rejeita contagens e rótulos incompatíveis', () => {
    const inconsistent = dossier();
    inconsistent.counts.actions += 1;
    expect(() => parseTaegeukTwoStudy(inconsistent)).toThrow();
    const incorrectFrame = dossier();
    incorrectFrame.movements[1].actions[1].frame = '3-2';
    expect(() => parseTaegeukTwoStudy(incorrectFrame)).toThrow();
  });

  it('rejeita URL insegura, fonte ausente e autorização incompatível', () => {
    const unsafe = dossier();
    unsafe.identityUrl = 'javascript:void(0)';
    expect(() => parseTaegeukTwoStudy(unsafe)).toThrow();
    const missing = dossier();
    missing.movements[1].actions[1].evidence[0].sourceId = 'ausente';
    expect(() => parseTaegeukTwoStudy(missing)).toThrow();
    const published = dossier();
    published.review.publicationApproved = true;
    expect(() => parseTaegeukTwoStudy(published)).toThrow();
  });
});
