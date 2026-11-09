import { useEffect, useRef, useState } from 'react';
import rawMatrix from '../../../content/research/atlas-hand-v1/matrix.json';
import { validateHandMatrix } from '../../lib/atlas-hand-documentation';
import DetailMap from '../atlas/DetailMap';
import { HandRegionPanel, HandTermPanel } from './HandDocumentationPanel';
import type { View } from '../atlas/BodyMap';
import '../../styles/hand-atlas-lab.css';

// Only the dev alias imports this module. The public build resolves an empty component.
const matrix = validateHandMatrix(rawMatrix);
const normalized = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('pt-BR').trim();

export default function HandAtlasWorkbench() {
  const [view, setView] = useState<View>('front');
  const [query, setQuery] = useState('');
  const [pendingOnly, setPendingOnly] = useState(false);
  const [termSlug, setTermSlug] = useState<string | null>(null);
  const termHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (termSlug) termHeading.current?.focus(); }, [termSlug]);
  const search = normalized(query);
  const terms = matrix.technical_terms.filter(term => (!pendingOnly || term.geometry_status === 'pending') &&
    (!search || [term.slug,
      ...matrix.term_field_claims.filter(claim => claim.term_slug === term.slug).map(claim => claim.value),
      ...matrix.term_senses.filter(sense => sense.term_slug === term.slug).map(sense => sense.meaning),
    ].some(value => normalized(value).includes(search))));
  return <div className="hand-atlas-lab">
    <h2>Consulta documental da mão</h2>
    <aside className="notice" aria-label="Estado editorial">
      <strong>Provisório · Revisão humana pendente</strong>
      <p>Consulta local de pesquisa. Conferência documental não equivale à aprovação técnica ou linguística.
        Traduções e pronúncias PT-BR são adaptações editoriais. Os vínculos ao desenho são propostas que aguardam revisão da geometria.</p>
      <p>23 termos · 19 regiões · 9 vínculos propostos · 14 configurações sem geometria.</p>
    </aside>
    <div className="atlas-controls" aria-label="Vista da mão">
      <button type="button" aria-pressed={view === 'front'} onClick={() => setView('front')}>Palma</button>
      <button type="button" aria-pressed={view === 'back'} onClick={() => setView('back')}>Dorso</button>
    </div>
    <DetailMap area="hands" view={view} regions={[]} selected={null} onSelect={() => {}}
      renderInspection={region => <HandRegionPanel matrix={matrix} regionSlug={region.slug} />} />
    <p>Ilustração original — Taekwondo para Todos. A identificação visual não constitui nomenclatura oficial da Kukkiwon.</p>
    <section className="hand-document-browser" aria-label="Índice documental da mão">
      <h2>Buscar termos e configurações</h2>
      <p>Busque por identificador, Hangul, romanização, variante ou significado. As configurações sem desenho permanecem somente neste índice.</p>
      <label>Buscar documentação da mão
        <input type="search" value={query} onChange={event => setQuery(event.target.value)} />
      </label>
      <label className="hand-filter">
        <input type="checkbox" checked={pendingOnly} onChange={event => setPendingOnly(event.target.checked)} />
        Somente configurações sem geometria
      </label>
      <p role="status">{terms.length ? `${terms.length} termos encontrados` : 'Nenhum termo encontrado'}</p>
      <ul className="hand-term-results">{terms.map(term => <li key={term.slug}>
        <button type="button" aria-label={`Consultar termo ${term.slug}`} aria-pressed={termSlug === term.slug}
          onClick={() => { setTermSlug(term.slug); if (termSlug === term.slug) termHeading.current?.focus(); }}>
          {term.slug} · {term.geometry_status === 'pending' ? 'sem geometria' : 'vínculo proposto'}
        </button>
      </li>)}</ul>
      {termSlug && <section className="hand-term-detail" aria-labelledby="hand-term-heading">
        <h2 id="hand-term-heading" ref={termHeading} tabIndex={-1}>Documentação do termo selecionado</h2>
        <HandTermPanel matrix={matrix} termSlug={termSlug} />
      </section>}
    </section>
  </div>;
}
