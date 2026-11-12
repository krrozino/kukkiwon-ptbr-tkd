import { LIBRARY_CATEGORIES, type LibraryCategoryId } from '../../lib/library';

export default function LibraryNav({ activeCategory }: { activeCategory?: LibraryCategoryId }) {
  return (
    <nav className="library-nav" aria-label="Categorias da Biblioteca Geral">
      <div className="library-nav-scroll">
        <a
          href="/biblioteca"
          className={`library-nav-item ${!activeCategory ? 'active' : ''}`}
          aria-current={!activeCategory ? 'page' : undefined}
        >
          <span className="library-nav-hangul" aria-hidden="true">전체</span>
          <span className="library-nav-label">Todas as Áreas</span>
        </a>
        {LIBRARY_CATEGORIES.map((cat) => (
          <a
            key={cat.id}
            href={`/biblioteca/${cat.id}`}
            className={`library-nav-item ${activeCategory === cat.id ? 'active' : ''}`}
            aria-current={activeCategory === cat.id ? 'page' : undefined}
          >
            <span className="library-nav-hangul" aria-hidden="true">{cat.koreanHangul}</span>
            <span className="library-nav-label">{cat.name}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
