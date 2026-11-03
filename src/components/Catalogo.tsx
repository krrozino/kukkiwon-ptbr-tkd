import { useEffect, useMemo, useState } from 'react';
import { fetchPublishedTerms, isCatalogConfigured, type TechnicalTerm } from '../lib/catalog-api';

const normalize = (input: string) =>
  input.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();

export default function Catalogo() {
  const [terms, setTerms] = useState<TechnicalTerm[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(isCatalogConfigured());
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isCatalogConfigured()) return;
    const controller = new AbortController();
    fetchPublishedTerms(controller.signal)
      .then(setTerms)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : 'Erro ao consultar o catálogo.');
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const categories = useMemo(() => [...new Set(terms.map(item => item.category))].sort(), [terms]);
  const filtered = useMemo(() => terms.filter(term => {
    const searchable = [term.romanization, term.hangul, term.translation_pt, term.pronunciation_pt,
      ...(term.term_aliases || []).map(alias => alias.alias)].filter(Boolean).join(' ');
    return (category === 'all' || category === term.category) && normalize(searchable).includes(normalize(query));
  }), [terms, category, query]);

  return <div className="catalog">
    <div className="catalog-filters">
      <label className="field">Buscar por nome, Hangul ou nome alternativo
        <input type="search" value={query} onChange={event => setQuery(event.target.value)}
          placeholder="Nome da técnica, coreano ou tradução" autoComplete="off" />
      </label>
      <label className="field">Categoria
        <select value={category} onChange={event => setCategory(event.target.value)}>
          <option value="all">Todas as categorias</option>
          {categories.map(value => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
    </div>
    {!isCatalogConfigured() ? <div className="empty" role="status"><strong>Catálogo ainda não conectado nesta versão.</strong>
      <p>A estrutura está pronta. A conexão com o banco será ativada na publicação definitiva.</p></div>
      : loading ? <p role="status">Consultando registros publicados...</p>
      : error ? <div className="empty" role="alert"><strong>Não foi possível carregar o catálogo.</strong><p>{error}</p></div>
      : terms.length === 0 ? <div className="empty" role="status"><strong>Nenhuma técnica publicada ainda.</strong>
          <p>Aguardamos conferência de fonte, tradução e validação por especialista. As fichas preliminares não são exibidas.</p></div>
      : <>
        <p className="results-count" role="status">{filtered.length} de {terms.length} registros encontrados</p>
        {filtered.length === 0 ? <div className="empty">Nenhuma técnica corresponde aos filtros.</div> :
          <div className="grid">
            {filtered.map(item => <a className="card term-card" key={item.id}
              href={'/tecnica?slug=' + encodeURIComponent(item.slug)}>
              <span className="tag">{item.category}</span>
              <h2>{item.romanization}</h2>
              {item.hangul && <p lang="ko" className="hangul">{item.hangul}</p>}
              <p>{item.translation_pt || 'Tradução em revisão'}</p>
              <span className="inline-link">Abrir ficha técnica →</span>
            </a>)}
          </div>}
      </>}
  </div>;
}
