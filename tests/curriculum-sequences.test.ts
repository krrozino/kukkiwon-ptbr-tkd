import { describe, expect, it } from 'vitest';
import { initialCurriculum, parseCurriculum, sequenceLabel, type Curriculum, type Requirement } from '../src/lib/curriculum';

const make = (patch: Partial<Requirement> = {}): Curriculum => ({
  ...structuredClone(initialCurriculum),
  grades: [{
    id: 'faixa-amarela',
    name: 'Faixa Amarela',
    requirements: [{
      id: 'requisito-1', title: 'Matchuo Kyorugi — Sebon 1 ao 5',
      kind: 'matchuo-kyorugi', termSlug: '', notes: '', mediaId: '',
      sequenceType: 'sebon', sequenceStart: 1, sequenceEnd: 5, ...patch,
    }],
  }],
});

describe('Currículo por escola — sequências numeradas (#65)', () => {
  it('guarda intervalos de Sebon sem atribuir progressão universal', () => {
    const yellow = parseCurriculum(make());
    const greenTip = parseCurriculum(make({ sequenceEnd: 10 }));
    expect(sequenceLabel(yellow.grades[0].requirements[0])).toBe('Sebon 1 a 5');
    expect(sequenceLabel(greenTip.grades[0].requirements[0])).toBe('Sebon 1 a 10');
    expect(JSON.parse(JSON.stringify(greenTip)).grades[0].requirements[0].sequenceEnd).toBe(10);
  });
  it('aceita currículos legados, sem intervalos, e sequências de outras modalidades', () => {
    expect(parseCurriculum(initialCurriculum).grades[0].requirements).toEqual([]);
    expect(sequenceLabel({sequenceType:'dubon',sequenceStart:2,sequenceEnd:4})).toBe('Dubon 2 a 4');
    expect(sequenceLabel({sequenceStart:1,sequenceEnd:3})).toBe('Sequência 1 a 3');
    expect(sequenceLabel({sequenceStart:1})).toBeNull();
  });
  const invalidCases: Array<[Partial<Requirement>, string]> = [
    [{sequenceStart:1,sequenceEnd:undefined},'incompleto'],
    [{sequenceStart:undefined,sequenceEnd:5},'sem início'],
    [{sequenceStart:0},'zero'],
    [{sequenceEnd:0},'fim zero'],
    [{sequenceStart:7,sequenceEnd:3},'inversão'],
    [{sequenceEnd:101},'limite'],
    [{sequenceStart:1.5},'decimal'],
    [{sequenceType:'inventada'},'modalidade inválida'],
    [{libraryCategory:'sem-categoria'},'categoria inválida'],
  ];
  it.each(invalidCases)('rejeita dados fora do contrato: %s (%s)', (patch) => {
    expect(() => parseCurriculum(make(patch as Partial<Requirement>))).toThrow('Requisito inválido.');
  });
  it('não exige que duas escolas usem a mesma progressão de faixa', () => {
    const a = make({sequenceEnd:5});
    const b = make({sequenceEnd:10});
    expect(parseCurriculum(a).grades[0].requirements[0].sequenceEnd).toBe(5);
    expect(parseCurriculum(b).grades[0].requirements[0].sequenceEnd).toBe(10);
  });
});
