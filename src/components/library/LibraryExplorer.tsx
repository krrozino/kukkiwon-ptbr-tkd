import { useEffect, useState } from 'react';
import {
  atlasHref,
  getLibraryCategory,
  getLibraryKinds,
  libraryCategories,
  libraryItemHref,
  searchLibrary,
  type LibraryCategoryId,
  type LibraryItem,
  type LibrarySortMode,
} from '../../lib/library';

const validSorts = new Set<LibrarySortMode>(['default', 'az', 'hangul', 'atlas']);

function LibraryEntries({ items, showKind = false }: { items: readonly LibraryItem[]; showKind?: boolean }) {
  return (
    <ul className="library-entry-list">
      {items.map(({ slug, term, kindLabel }) => (
        <li className="library-entry" key={slug}>
          <a href={libraryItemHref(slug)!}>
            <strong>{term.romanization || term.name}</strong>
            {term.hangul && <span lang="ko">{term.hangul}</span>}
          </a>
          <p>{term.romanization && term.name}{showKind && <small>{kindLabel}</small>}</p>
          {atlasHref(slug) && <span className="entry-atlas">Atlas</span>}
        </li>
      ))}
    </ul>
  );
}

function LibraryGroups({ items, showArea }: { items: readonly LibraryItem[]; showArea: boolean }) {
  return libraryCategories.map((category) => {
    const collection = items.filter((item) => item.categoryId === category.id);
    if (!collection.length) return null;
    const groups = Map.groupBy(collection, (item) => item.kindLabel);
    return (
      <section className="library-collection" key={category.id} aria-label={category.label}>
        {showArea && <h3>{category.label}</h3>}
        {[...groups].map(([label, group]) => (
          <section className="library-group" key={label} aria-label={label}>
            {showArea ? <h4>{label}</h4> : <h2>{label}</h2>}
            {category.id === 'iron' ? [...Map.groupBy(group, (item) => item.topic ?? 'Panorama')].map(([topic, entries]) => (
              <div className="library-topic" key={topic}>
                {showArea ? <h5>{topic}</h5> : <h3>{topic}</h3>}
                <LibraryEntries items={entries} />
              </div>
            )) : <LibraryEntries items={group} />}
          </section>
        ))}
      </section>
    );
  });
}

export default function LibraryExplorer({ categoryId }: { categoryId?: LibraryCategoryId }) {
  const [query, setQuery] = useState('');
  const [area, setArea] = useState<string>(categoryId || '');
  const [onlyAtlas, setOnlyAtlas] = useState(false);
  const [kindFilter, setKindFilter] = useState('');
  const [sortBy, setSortBy] = useState<LibrarySortMode>('default');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const restore = () => {
      const params = new URLSearchParams(location.search);
      setQuery(params.get('q')?.slice(0, 200) || '');
      setArea(categoryId || (getLibraryCategory(params.get('area') || '')?.id ?? ''));
      setOnlyAtlas(params.get('atlas') === '1');
      setKindFilter(params.get('tipo')?.slice(0, 120) || '');
      const rawSort = params.get('ordem') as LibrarySortMode | null;
      setSortBy(rawSort && validSorts.has(rawSort) ? rawSort : 'default');
      setReady(true);
    };
    restore();
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, [categoryId]);

  const kinds = getLibraryKinds(area || undefined);
  const effectiveKind = kinds.includes(kindFilter) ? kindFilter : '';

  const update = (
    q: string,
    a: string,
    atlas: boolean,
    nextKind = effectiveKind,
    nextSort: LibrarySortMode = sortBy,
  ) => {
    const nextKinds = getLibraryKinds(a || undefined);
    const validKind = nextKinds.includes(nextKind) ? nextKind : '';
    setQuery(q);
    setArea(a);
    setOnlyAtlas(atlas);
    setKindFilter(validKind);
    setSortBy(nextSort);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (a && !categoryId) params.set('area', a);
    if (atlas) params.set('atlas', '1');
    if (validKind) params.set('tipo', validKind);
    if (nextSort !== 'default') params.set('ordem', nextSort);
    history.replaceState(null, '', location.pathname + (params.size ? '?' + params : '') + '#fichas');
  };

  const items = searchLibrary(query, area, onlyAtlas, effectiveKind, sortBy);
  const hasActiveFilters = Boolean(
    query || (area && !categoryId) || onlyAtlas || effectiveKind || sortBy !== 'default',
  );

  return (
    <section className="library-explorer" aria-label="Fichas da biblioteca" aria-busy={!ready} id="fichas">
      <div className="library-search-panel">
        <div className="library-filters">
          <label className="field">
            Buscar na biblioteca
            <input
              type="search"
              placeholder="Nome, coreano, pronúncia, trigrama ou significado"
              maxLength={200}
              value={query}
              onChange={(event) => update(event.target.value, area, onlyAtlas)}
            />
          </label>
          {!categoryId && (
            <div className="field">
              <label htmlFor="library-area">Área de estudo</label>
              <select
                id="library-area"
                value={area}
                onChange={(event) => update(query, event.target.value, onlyAtlas, '')}
              >
                <option value="">Todas as áreas</option>
                {libraryCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label} · {category.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          {kinds.length > 1 && (
            <div className="field">
              <label htmlFor="library-kind">Subdivisão</label>
              <select
                id="library-kind"
                value={effectiveKind}
                onChange={(event) => update(query, area, onlyAtlas, event.target.value)}
              >
                <option value="">Todas as subdivisões</option>
                {kinds.map((kind) => (
                  <option key={kind} value={kind}>
                    {kind}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="field">
            <label htmlFor="library-sort">Ordenar</label>
            <select
              id="library-sort"
              value={sortBy}
              onChange={(event) =>
                update(query, area, onlyAtlas, effectiveKind, event.target.value as LibrarySortMode)
              }
            >
              <option value="default">Ordem da coleção</option>
              <option value="az">Alfabética (A–Z)</option>
              <option value="hangul">Com escrita coreana primeiro</option>
              <option value="atlas">Com região no Atlas primeiro</option>
            </select>
          </div>
        </div>
        <div className="library-filter-footer">
          <label className="check-label">
            <input
              type="checkbox"
              checked={onlyAtlas}
              onChange={(event) => update(query, area, event.target.checked)}
            />
            Com região no Atlas
          </label>
          <div className="library-filter-status">
            <p role="status">
              {items.length} {items.length === 1 ? 'ficha encontrada' : 'fichas encontradas'}
            </p>
            {items.length > 0 && hasActiveFilters && (
              <button
                type="button"
                className="button button-outline"
                onClick={() => update('', categoryId || '', false, '', 'default')}
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {items.length ? (
        <div className="library-results">
          {sortBy === 'default' ? <LibraryGroups items={items} showArea={!categoryId} /> : <LibraryEntries items={items} showKind />}
        </div>
      ) : (
        <div className="library-empty">
          <h3>Nenhuma ficha encontrada</h3>
          <p>Tente outro nome ou escolha outra área. Você também pode consultar os materiais de estudo desta coleção.</p>
          <div className="actions">
            <button onClick={() => update('', categoryId || '', false, '', 'default')}>Limpar filtros</button>
            <a className="inline-link" href={getLibraryCategory(area)?.href || '/atlas'}>
              {getLibraryCategory(area)?.destination || 'Explorar o Atlas'} →
            </a>
          </div>
        </div>
      )}
      <noscript>
        <p>A busca interativa precisa de JavaScript. As fichas também estão disponíveis pelos links acima.</p>
      </noscript>
    </section>
  );
}
