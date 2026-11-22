import { handTerms, getHandRegionForTerm, type HandTerm } from './public-hand';

/** Product navigation, not a new technical classification or Korean dictionary. */
export const libraryCategories = [
  { id: 'poomsae', label: 'Poomsae', title: 'Formas e sequências', description: 'Encontre as formas e suas referências em um só lugar.', href: '/poomsae', destination: 'Explorar Poomsae', number: '01' },
  { id: 'matchuo-kyorugi', label: 'Matchuo Kyorugi', title: 'Combate combinado', description: 'Organize os conteúdos ensinados pelo seu professor.', href: '/curriculos', destination: 'Consultar currículos', number: '02' },
  { id: 'palgwae', label: 'Palgwae', title: 'Coleção Palgwae', description: 'Um espaço para reunir fichas e referências desta coleção.', href: '/fontes', destination: 'Conhecer as fontes', number: '03' },
  { id: 'iron', label: 'Iron', title: 'Teoria e terminologia', description: 'Consulte o glossário e encontre os caminhos de leitura.', href: '/glossario', destination: 'Abrir o glossário', number: '04' },
  { id: 'kibon-dongjak', label: 'Kibon Dongjak', title: 'Fundamentos', description: 'Comece pelos materiais de alturas e direções.', href: '/fundamentos/alturas-e-direcoes', destination: 'Estudar fundamentos', number: '05' },
  { id: 'balkisul', label: 'Balkisul', title: 'Pés e pernas', description: 'Explore o Atlas e consulte os materiais de combate.', href: '/kyorugi', destination: 'Explorar materiais de combate', number: '06' },
  { id: 'sonkisul', label: 'Sonkisul', title: 'Mãos e punhos', description: 'Consulte superfícies e configurações com acesso ao Atlas.', href: '/atlas?region=hands&zoom=1', destination: 'Explorar a mão no Atlas', number: '07' },
] as const;
export type LibraryCategoryId = typeof libraryCategories[number]['id'];
export const categoryResources: Record<LibraryCategoryId, { title: string; description: string; href: string }[]> = {
  poomsae: [{ title: 'Índice de Poomsae', description: 'Consulte as formas e os links de referência já disponíveis.', href: '/poomsae' }],
  'matchuo-kyorugi': [{ title: 'Conteúdos da sua escola', description: 'Organize os exercícios e as orientações realmente ensinados pelo professor.', href: '/curriculos' }],
  palgwae: [{ title: 'Referências e metodologia', description: 'Encontre as fontes da biblioteca. As sequências desta coleção ainda não estão disponíveis aqui.', href: '/fontes' }],
  iron: [{ title: 'Glossário de consulta', description: 'Pesquise palavras e expressões nos materiais do projeto.', href: '/glossario' }, { title: 'Fontes e critérios', description: 'Conheça a origem das informações e as diferenças entre referências.', href: '/fontes' }],
  'kibon-dongjak': [{ title: 'Alturas e direções', description: 'Acesse o material de fundamentos já disponível.', href: '/fundamentos/alturas-e-direcoes' }, { title: 'Currículo da escola', description: 'Relacione os conteúdos aos objetivos da sua turma.', href: '/curriculos' }],
  balkisul: [{ title: 'Pés no Atlas', description: 'Explore o desenho original e as regiões selecionáveis.', href: '/atlas?region=feet&zoom=1' }, { title: 'Materiais de combate', description: 'Consulte os materiais relacionados e suas fontes.', href: '/kyorugi' }],
  sonkisul: [{ title: 'Mão no Atlas', description: 'Consulte os termos junto ao desenho interativo.', href: '/atlas?region=hands&zoom=1' }],
};
export type LibraryItem = { slug: string; categoryId: LibraryCategoryId; term: HandTerm };
// One identity, one source: no copied Argon/Gemini research in the public bundle.
export const libraryItems: LibraryItem[] = handTerms.map(term => ({ slug: term.slug, categoryId: 'sonkisul', term }));
export const getLibraryItem = (slug: string) => libraryItems.find(item => item.slug === slug);
export const getLibraryCategory = (id: string) => libraryCategories.find(category => category.id === id);
export function libraryItemHref(slug: string) {
  const item = getLibraryItem(slug);
  return item ? `/biblioteca/${item.categoryId}/${item.slug}` : null;
}
export function atlasHref(slug: string) {
  const region = getHandRegionForTerm(slug);
  return region ? `/atlas?region=${region.slug}&zoom=1` : null;
}
function normalize(text: string) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/[-_]/g, ' ');
}
export function searchLibrary(query: string, categoryId?: string, onlyAtlas = false) {
  const words = normalize(query.trim()).split(/\s+/).filter(Boolean);
  return libraryItems.filter(item => {
    if (categoryId && item.categoryId !== categoryId) return false;
    if (onlyAtlas && !atlasHref(item.slug)) return false;
    const { term } = item;
    const text = normalize([term.slug, term.name, term.romanization, term.hangul, term.pronunciation,
      term.description, ...term.meanings.map(meaning => meaning.value), ...term.variants.map(variant => variant.value)].join(' '));
    return words.every(word => text.includes(word));
  });
}
