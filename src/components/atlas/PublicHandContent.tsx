import { useState } from 'react';
import { getHandRegion, getHandRegionForTerm, getHandTerm, getHandTermForRegion,
  handRegionDescription, handTerms, searchHandTerms, type HandTerm } from '../../lib/public-hand';
import { zoneCopy } from './zone-copy';
import { libraryItemHref } from '../../lib/library';

function ReferenceLink({ reference }: { reference: { institution: string; title: string; edition: string; locator: string; url: string } }) {
  if (!/^https:\/\/[^\s/@]+/i.test(reference.url)) return null;
  return <a href={reference.url} target="_blank" rel="noopener noreferrer">
    {reference.institution} · {reference.title}{reference.edition ? ' (' + reference.edition + ')' : ''}
    <span className="hand-reference-locator"> · {reference.locator}</span>
  </a>;
}

export function PublicHandTerm({ term, compact = false }: { term: HandTerm; compact?: boolean }) {
  return <div className={'hand-term-card' + (compact ? ' hand-term-card-compact' : '')}>
    <strong>{term.name}</strong>
    {term.romanization && <span className="hand-term-romanization">{term.romanization}</span>}
    {term.hangul && <span lang="ko" className="hand-term-hangul">{term.hangul}</span>}
    {term.pronunciation && <p><span className="hand-label">Pronúncia aproximada:</span> {term.pronunciation}</p>}
    {term.description && <p>{term.description}</p>}
    {!compact && <>
      {term.meanings.length > 0 && <section aria-label="Significados da terminologia">
        <h4>Significados e uso</h4>
        <ul>{term.meanings.map((meaning, i) => <li key={i}>
          {meaning.kind === 'literal' ? 'Sentido literal' : 'Termo técnico'}
          {meaning.language === 'en' ? ' (inglês)' : ''}: {meaning.value}
        </li>)}</ul>
      </section>}
      {term.related.length > 0 && <section aria-label="Técnicas relacionadas nas fontes">
        <h4>Movimentos e técnicas relacionados</h4>
        <ul>{term.related.map((related, i) => <li key={i}>{related.name}
          {related.reference && <> · <ReferenceLink reference={related.reference} /></>}
        </li>)}</ul>
      </section>}
      {term.variants.length > 0 && <section aria-label="Grafias alternativas">
        <h4>Outras grafias</h4>
        <ul>{term.variants.map((variant, i) => <li key={i}>{variant.value}</li>)}</ul>
      </section>}
    </>}
    {term.evidence.length > 0 && <details className="hand-term-sources">
      <summary>Fontes e referências</summary>
      <ul>{term.evidence.map((row, i) => row.reference && <li key={i}>
        <span className="hand-label">{row.field === 'hangul' ? 'Hangul' : 'Romanização'}: </span>
        <ReferenceLink reference={row.reference} />
      </li>)}</ul>
    </details>}
    <a className="inline-link hand-library-link" href={libraryItemHref(term.slug)!}>Abrir ficha na biblioteca →</a>
  </div>;
}

/** Rendered inside the existing stable-height SVG inspector. */
export function PublicHandRegionInspector({ regionSlug }: { regionSlug: string }) {
  const region = getHandRegion(regionSlug);
  const term = getHandTermForRegion(regionSlug);
  if (!region) return null;
  return <article className="hand-region-card" data-hand-region={region.slug}>
    {term ? <PublicHandTerm term={term} compact /> : <>
      <strong>{zoneCopy[region.slug]?.title || region.name}</strong>
      {handRegionDescription(region.slug) && <p>{handRegionDescription(region.slug)}</p>}
    </>}
  </article>;
}

/** All 23 terms remain searchable even when there is no matching geometry. */
export function PublicHandIndex({ selectedTerm, onSelect }: {
  selectedTerm: string | null;
  onSelect: (slug: string) => void;
}) {
  const [query, setQuery] = useState('');
  const results = searchHandTerms(query);
  return <section className="hand-term-index" aria-label="Índice dos termos da mão" id="atlas-hand-index">
    <h3>Partes e configurações da mão</h3>
    <label htmlFor="hand-term-search">Buscar nome, Hangul ou romanização</label>
    <input id="hand-term-search" type="search" value={query} onChange={e => setQuery(e.target.value)}
      autoComplete="off" placeholder="Ex.: Sonnal, 손날, punho" />
    <p className="fine-print" role="status">{results.length} de {handTerms.length} termos</p>
    {results.length ? <ul className="hand-term-index-results">{results.map(term => <li key={term.slug}>
      <button type="button" aria-pressed={selectedTerm === term.slug} onClick={() => onSelect(term.slug)}>
        <span>{term.romanization || term.name}{term.hangul && <span lang="ko"> · {term.hangul}</span>}</span>
        <small>{term.name}</small>
      </button>
    </li>)}</ul> : <p>Nenhum termo corresponde à busca.</p>}
    {selectedTerm && !getHandRegionForTerm(selectedTerm) && getHandTerm(selectedTerm) &&
      <section className="hand-term-selected" aria-label="Detalhes do termo escolhido">
        <h3>Ficha do termo</h3>
        <PublicHandTerm term={getHandTerm(selectedTerm)!} />
      </section>}
  </section>;
}
