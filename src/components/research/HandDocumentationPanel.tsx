import {
  handRegionDocumentation, handTermDocumentation,
  type HandMatrix, type HandSource, type HandField,
} from '../../lib/atlas-hand-documentation';
import { safeReferenceUrl } from '../../lib/published-knowledge';

const authority: Record<HandSource['authority'], string> = {
  primary: 'Fonte institucional primária', historical: 'Fonte histórica',
  complementary: 'Fonte complementar', editorial: 'Proposta editorial do projeto',
};
const fields: Record<HandField, string> = {
  hangul: 'Hangul documentado', romanization: 'Romanização documentada',
  pronunciation_pt: 'Pronúncia aproximada — adaptação editorial PT-BR',
  translation_pt: 'Tradução PT-BR — proposta editorial', definition_pt: 'Definição PT-BR — proposta editorial',
  literal_meaning: 'Significado literal', technical_meaning: 'Significado técnico',
  context: 'Contexto de uso', variant: 'Variantes documentadas', distinction: 'Distinções',
  region: 'Associação à região — proposta editorial',
};
const senseKinds = {
  literal: 'Literal', technical: 'Técnico', contextual: 'Contextual', historical: 'Histórico', regional: 'Regional',
};
type TermDocumentation = NonNullable<ReturnType<typeof handTermDocumentation>>;
type DocumentedRow = TermDocumentation['claims'][number] | TermDocumentation['senses'][number];

function Reference({ reference, locator }: { reference: HandSource; locator: string }) {
  return <div className="hand-reference">
    <span>{authority[reference.authority]} · {reference.institution}</span>
    {safeReferenceUrl(reference.official_url)
      ? <a href={reference.official_url} target="_blank" rel="noopener noreferrer">{reference.title}</a>
      : <span>{reference.title} · Link indisponível</span>}
    <span>Edição: {reference.edition ?? 'não informada'} · Ano: {reference.publication_year ?? 'não informado'}</span>
    <span>Localizador: {locator}</span>
  </div>;
}

function Evidence({ row, matrix }: { row: DocumentedRow; matrix: HandMatrix }) {
  const claim = 'claim_key' in row;
  return <article className="hand-evidence" data-evidence-key={claim ? row.claim_key : row.sense_key}>
    <p lang={row.language_tag}>{claim ? row.value : row.meaning}</p>
    <p className="hand-state">
      {row.evidence_kind === 'editorial' ? 'Adaptação editorial PT-BR · não é tradução oficial' : authority[row.evidence_kind]}
      {' · '}{row.editorial_status === 'document_checked' ? 'Conferência documental' : 'Em pesquisa'}
      {' · '}draft · Revisão humana pendente
    </p>
    <p>Contexto: {row.usage_context} · Idioma: {row.language_tag}</p>
    {claim && row.variant_kind && <p>Tipo de variante: {row.variant_kind}</p>}
    <p>Conferência documental em: {row.checked_at ?? 'pendente'}</p>
    <Reference reference={row.reference} locator={row.source_locator} />
    {row.basis.length > 0 && <div className="hand-basis">
      <strong>Fundamentação da proposta</strong>
      {row.basis.map((basis, index) => <Reference key={index}
        reference={matrix.content_sources.find(source => source.source_id === basis.source_id)!} locator={basis.source_locator} />)}
    </div>}
    {row.note && <p>Nota: {row.note}</p>}
  </article>;
}

export function HandTermPanel({ matrix, termSlug }: { matrix: HandMatrix; termSlug: string }) {
  const documentation = handTermDocumentation(matrix, termSlug);
  if (!documentation) return <p role="status">Termo não documentado. Consulta pendente.</p>;
  const { term, claims, senses, regions, techniques } = documentation;
  return <div className="hand-documentation" data-term-documentation={term.slug}>
    <h3>Identificador documental: {term.slug}</h3>
    <p className="hand-state">Provisório · draft · Revisão humana pendente</p>
    <p>{term.geometry_status === 'pending'
      ? 'Sem geometria correspondente. Consultável apenas como documentação; nenhum hotspot foi criado.'
      : 'Mapeamento editorial proposto. A correspondência visual aguarda revisão da geometria.'}</p>
    {(Object.entries(fields) as [HandField, string][]).map(([field, label]) => {
      const rows = claims.filter(c => c.field_name === field);
      const hasDocumentedSense = senses.some(sense => `${sense.sense_kind}_meaning` === field);
      return <section key={field} data-field={field} aria-label={label}>
        <h4>{label}</h4>
        {rows.length ? rows.map(row => <Evidence key={row.claim_key} row={row} matrix={matrix} />)
          : hasDocumentedSense ? <p>Consulte os sentidos documentados em “Sentidos por contexto”, abaixo.</p>
          : <p data-pending={field}>Pendente — informação não documentada neste campo.</p>}
      </section>;
    })}
    <section aria-label="Sentidos por contexto">
      <h4>Sentidos por contexto</h4>
      {senses.map(row => <div key={row.sense_key}>
        <h5>Sentido {senseKinds[row.sense_kind].toLowerCase()}</h5>
        <Evidence row={row} matrix={matrix} />
      </div>)}
    </section>
    <section aria-label="Vínculos geométricos propostos">
      <h4>Vínculos geométricos propostos</h4>
      {regions.length ? regions.map(region => <div key={region.region_slug}>
        <p>Região: {region.region_slug} · research · draft · sem aprovação humana</p>
        <Reference reference={region.reference} locator={region.source_locator} />
      </div>) : <p>Pendente — sem vínculo geométrico.</p>}
    </section>
    <section aria-label="Relações documentais com técnicas">
      <h4>Relações documentais com técnicas</h4>
      {techniques.length ? techniques.map(technique => <div key={technique.term_slug}>
        <p>Identificador: {technique.term_slug} · {technique.relation_kind} · draft · Revisão humana pendente</p>
        <p>Conferência documental em: {technique.checked_at}</p>
        <Reference reference={technique.reference} locator={technique.source_locator} />
      </div>) : <p>Pendente — nenhuma relação documentada neste lote.</p>}
    </section>
    <section aria-label="Lacunas de pesquisa">
      <h4>Lacunas de pesquisa</h4>
      <ul>{term.research_gaps.map(gap => <li key={gap.field_name}>{gap.field_name}: {gap.reason}</li>)}</ul>
    </section>
  </div>;
}

export function HandRegionPanel({ matrix, regionSlug }: { matrix: HandMatrix; regionSlug: string }) {
  const documentation = handRegionDocumentation(matrix, regionSlug);
  if (!documentation) return <p role="status">Região não documentada. Consulta pendente.</p>;
  const { region, terms } = documentation;
  return <div className="hand-documentation" data-region-documentation={region.slug}>
    <h3>{region.name_pt}</h3>
    <p>Identificador da região: {region.slug}</p>
    <p className="hand-state">Provisório · Revisão humana pendente</p>
    <p>Identificação editorial do desenho · {region.note}</p>
    {terms.length ? terms.map(term => <HandTermPanel key={term.term.slug} matrix={matrix} termSlug={term.term.slug} />)
      : <p>Sem terminologia técnica vinculada. Região exclusivamente ilustrativa; Hangul, romanização, pronúncia e significados técnicos permanecem pendentes.</p>}
  </div>;
}
