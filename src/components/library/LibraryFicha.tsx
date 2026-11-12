import { getHandRegion } from '../../lib/public-hand';
import type { LibraryItem, LibraryCategory } from '../../lib/library';

export default function LibraryFicha({ item, category }: { item: LibraryItem; category?: LibraryCategory }) {
  return (
    <article className="library-ficha stack" aria-labelledby="ficha-title">
      <header className="ficha-header card">
        <div className="ficha-breadcrumb">
          <a href="/biblioteca">Biblioteca Geral</a>
          <span> / </span>
          <a href={`/biblioteca/${item.categoryId}`}>{category?.name || item.categoryId}</a>
          <span> / </span>
          <span>{item.name}</span>
        </div>

        <p className="tag">
          {category?.name} {item.sequenceNumber ? `· Sequência Nº ${item.sequenceNumber}` : ''}
        </p>

        <h1 id="ficha-title">{item.name}</h1>

        <div className="ficha-terminology-grid">
          {item.hangul && (
            <div className="term-cell">
              <span className="term-label">Hangul (Escrita Coreana)</span>
              <p lang="ko" className="hangul term-value-large">
                {item.hangul}
              </p>
            </div>
          )}
          {item.romanization && (
            <div className="term-cell">
              <span className="term-label">Romanização</span>
              <p className="term-value">
                <strong>{item.romanization}</strong>
              </p>
            </div>
          )}
          {item.pronunciation_pt && (
            <div className="term-cell">
              <span className="term-label">Pronúncia Didática em Português</span>
              <p className="term-value">{item.pronunciation_pt}</p>
            </div>
          )}
        </div>

        {item.literalMeaning && (
          <p className="ficha-lead">
            <strong>Significado literal:</strong> {item.literalMeaning}
          </p>
        )}
      </header>

      <section className="card ficha-content">
        <h2>Explicação Técnica e Biomecânica</h2>
        <p className="lead">{item.description}</p>
        {item.technicalMeaning && (
          <p>
            <strong>Conceito técnico:</strong> {item.technicalMeaning}
          </p>
        )}
        {item.execution && (
          <div className="execution-box">
            <h3>Como Executar</h3>
            <p>{item.execution}</p>
          </div>
        )}
      </section>

      {item.steps && item.steps.length > 0 && (
        <section className="card ficha-steps" aria-label="Sequência passo a passo">
          <h2>Sequência de Movimentos</h2>
          <ol className="steps-list">
            {item.steps.map((st) => (
              <li key={st.stepNumber} className="step-item">
                <header className="step-header">
                  <strong>Passo {st.stepNumber}</strong>
                  {st.stance && <span className="pill">Base: {st.stance}</span>}
                  {st.target && <span className="pill">Alvo: {st.target}</span>}
                </header>
                <p>{st.instruction}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {item.bodyRegions && item.bodyRegions.some(slug => getHandRegion(slug)) && (
        <section className="card ficha-atlas-relations">
          <h2>Superfícies Anatômicas e Atlas Corporal</h2>
          <p>
            Esta técnica utiliza regiões corporais mapeadas no Atlas vetorial do Taekwondo:
          </p>
          <div className="atlas-pill-group">
            {item.bodyRegions.filter(regionSlug => getHandRegion(regionSlug)).map((regionSlug) => (
              <a
                key={regionSlug}
                href={`/atlas?region=${encodeURIComponent(regionSlug)}&zoom=1`}
                className="atlas-region-pill"
              >
                <span className="pill-icon">◎</span> Ver {regionSlug} no Atlas Corporal →
              </a>
            ))}
          </div>
        </section>
      )}

      <footer className="card ficha-sources">
        <h2>Fontes e referências</h2>
        <ul className="sources-list">
          {item.sources.map((src, idx) => (
            <li key={idx} className="source-item">
              <strong>{src.institution}</strong> — <em>{src.title}</em>
              {src.editionOrYear && <span> ({src.editionOrYear})</span>}
              {src.locator && <span> · Localizador: {src.locator}</span>}
              {src.url && /^https:\/\//i.test(src.url) && (
                <div>
                  <a href={src.url} target="_blank" rel="noopener noreferrer" className="source-link">
                    Consultar fonte ↗
                  </a>
                </div>
              )}
            </li>
          ))}
        </ul>
      </footer>
    </article>
  );
}
