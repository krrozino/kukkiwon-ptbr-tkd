import { useState, useMemo } from 'react';
import {
  LIBRARY_CATEGORIES,
  LIBRARY_ITEMS,
  type LibraryCategoryId,
} from '../../lib/library';

export default function LibraryExplorer({ initialCategory }: { initialCategory?: LibraryCategoryId }) {
  const [selectedCategory, setSelectedCategory] = useState<LibraryCategoryId | 'all'>(initialCategory || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const currentCategory = useMemo(() => {
    if (selectedCategory === 'all') return null;
    return LIBRARY_CATEGORIES.find((c) => c.id === selectedCategory) || null;
  }, [selectedCategory]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return LIBRARY_ITEMS.filter((item) => {
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) return false;
      if (selectedSubcategory !== 'all' && item.subcategoryId !== selectedSubcategory) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.hangul && item.hangul.includes(q)) ||
        (item.romanization && item.romanization.toLowerCase().includes(q)) ||
        (item.pronunciation_pt && item.pronunciation_pt.toLowerCase().includes(q)) ||
        item.description.toLowerCase().includes(q) ||
        (item.literalMeaning && item.literalMeaning.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, selectedSubcategory, searchQuery]);

  return (
    <div className="library-explorer stack">
      <div className="card library-search-box">
        <label className="field">
          <strong>Buscar em toda a biblioteca</strong>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquise por nome, Hangul (태극), romanização ou significado..."
            maxLength={200}
            aria-label="Buscar na biblioteca"
          />
        </label>
        {searchQuery && (
          <p className="fine-print" role="status">
            {filteredItems.length} resultado(s) para "{searchQuery}"
          </p>
        )}
      </div>

      <div className="category-chips" role="group" aria-label="Filtrar por categoria">
        <button
          type="button"
          className={`chip ${selectedCategory === 'all' ? 'active' : ''}`}
          aria-pressed={selectedCategory === 'all'}
          onClick={() => {
            setSelectedCategory('all');
            setSelectedSubcategory('all');
          }}
        >
          Todas (7 áreas)
        </button>
        {LIBRARY_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`chip ${selectedCategory === cat.id ? 'active' : ''}`}
            aria-pressed={selectedCategory === cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setSelectedSubcategory('all');
            }}
          >
            <span lang="ko" aria-hidden="true">{cat.koreanHangul}</span> {cat.name}
          </button>
        ))}
      </div>

      {currentCategory && currentCategory.subcategories.length > 0 && (
        <div className="subcategory-chips" role="group" aria-label="Filtrar por subcategoria">
          <button
            type="button"
            className={`chip subchip ${selectedSubcategory === 'all' ? 'active' : ''}`}
            aria-pressed={selectedSubcategory === 'all'}
            onClick={() => setSelectedSubcategory('all')}
          >
            Todas as subcategorias
          </button>
          {currentCategory.subcategories.map((sub) => (
            <button
              key={sub.id}
              type="button"
              className={`chip subchip ${selectedSubcategory === sub.id ? 'active' : ''}`}
              aria-pressed={selectedSubcategory === sub.id}
              onClick={() => setSelectedSubcategory(sub.id)}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      <div className="library-grid">
        {filteredItems.length === 0 ? (
          <div className="card empty-search" role="status">
            <h3>Nenhum item encontrado</h3>
            <p>Tente alterar os termos da busca ou selecionar outra categoria.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedSubcategory('all');
              }}
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const cat = LIBRARY_CATEGORIES.find((c) => c.id === item.categoryId);
            return (
              <article key={item.slug} className="card library-card">
                <header className="library-card-header">
                  <span className="library-card-category">{cat?.name}</span>
                  {item.sequenceNumber && (
                    <span className="library-seq-badge">Nº {item.sequenceNumber}</span>
                  )}
                </header>
                <h3>
                  <a href={`/biblioteca/${item.categoryId}/${item.slug}`}>{item.name}</a>
                </h3>
                {item.hangul && (
                  <p lang="ko" className="hangul library-hangul">
                    {item.hangul}
                  </p>
                )}
                {item.romanization && (
                  <p className="library-romanization">
                    <strong>Romanização:</strong> {item.romanization}
                  </p>
                )}
                {item.pronunciation_pt && (
                  <p className="fine-print">
                    <strong>Pronúncia PT:</strong> {item.pronunciation_pt}
                  </p>
                )}
                <p className="library-card-desc">{item.description}</p>
                {item.bodyRegions && item.bodyRegions.length > 0 && (
                  <div className="library-body-links">
                    <span className="fine-print">Superfícies no corpo:</span>
                    {item.bodyRegions.map((reg) => (
                      <a key={reg} href={`/atlas?region=${reg}&zoom=1`} className="pill-link">
                        Atlas: {reg}
                      </a>
                    ))}
                  </div>
                )}
                <footer className="library-card-footer">
                  <a href={`/biblioteca/${item.categoryId}/${item.slug}`} className="inline-link">
                    Ver ficha detalhada →
                  </a>
                </footer>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
