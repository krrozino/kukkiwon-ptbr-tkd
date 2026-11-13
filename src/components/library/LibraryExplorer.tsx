import { useEffect, useState } from 'react';
import { atlasHref, getLibraryCategory, libraryCategories, libraryItemHref, searchLibrary, type LibraryCategoryId } from '../../lib/library';

export default function LibraryExplorer({ categoryId }: { categoryId?: LibraryCategoryId }) {
  const [query, setQuery] = useState('');
  const [area, setArea] = useState<string>(categoryId || '');
  const [onlyAtlas, setOnlyAtlas] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const restore = () => {
      const params = new URLSearchParams(location.search);
      setQuery(params.get('q')?.slice(0, 200) || '');
      setArea(categoryId || (getLibraryCategory(params.get('area') || '')?.id ?? ''));
      setOnlyAtlas(params.get('atlas') === '1');
      setReady(true);
    };
    restore();
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, [categoryId]);
  const update = (q: string, a: string, atlas: boolean) => {
    setQuery(q); setArea(a); setOnlyAtlas(atlas);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (a && !categoryId) params.set('area', a);
    if (atlas) params.set('atlas', '1');
    history.replaceState(null, '', location.pathname + (params.size ? '?' + params : '') + '#fichas');
  };
  const items = searchLibrary(query, area, onlyAtlas);
  return <section className="library-explorer" aria-label="Fichas da biblioteca" aria-busy={!ready} id="fichas">
    <div className="library-search-panel">
      <div className="library-filters">
        <label className="field">Buscar na biblioteca
          <input type="search" placeholder="Nome, coreano, pronúncia ou significado" maxLength={200} value={query}
            onChange={event => update(event.target.value, area, onlyAtlas)} />
        </label>
        {!categoryId && <div className="field"><label htmlFor="library-area">Área de estudo</label>
          <select id="library-area" value={area} onChange={event => update(query, event.target.value, onlyAtlas)}>
            <option value="">Todas as áreas</option>
            {libraryCategories.map(category => <option key={category.id} value={category.id}>{category.label} · {category.title}</option>)}
          </select>
        </div>}
      </div>
      <div className="library-filter-footer">
        <label className="check-label"><input type="checkbox" checked={onlyAtlas} onChange={event => update(query, area, event.target.checked)} />Com região no Atlas</label>
        <p role="status">{items.length} {items.length === 1 ? 'ficha encontrada' : 'fichas encontradas'}</p>
      </div>
    </div>
    {items.length ? <div className="library-results">{items.map(({ slug, term }) => <article className="library-entry" key={slug}>
      <div className="entry-meta"><span>Superfícies e configurações</span>{atlasHref(slug) && <span className="entry-atlas">Atlas ↗</span>}</div>
      <div className="entry-title"><h3><a href={libraryItemHref(slug)!}>{term.romanization || term.name}</a></h3>{term.hangul && <span lang="ko">{term.hangul}</span>}</div>
      <p>{term.name}</p>
      <span className="entry-footer">Sonkisul · Mãos e punhos <span aria-hidden="true">↗</span></span>
    </article>)}</div> : <div className="library-empty">
      <span className="eyebrow">Continue explorando</span><h3>Nenhuma ficha encontrada</h3>
      <p>Tente outro nome ou escolha outra área. Você também pode consultar os materiais de estudo desta coleção.</p>
      <div className="actions"><button onClick={() => update('', categoryId || '', false)}>Limpar filtros</button>
        <a className="inline-link" href={getLibraryCategory(area)?.href || '/atlas'}>{getLibraryCategory(area)?.destination || 'Explorar o Atlas'} →</a></div>
    </div>}
    <noscript><p>A busca interativa precisa de JavaScript. As fichas também estão disponíveis pelos links acima.</p></noscript>
  </section>;
}
