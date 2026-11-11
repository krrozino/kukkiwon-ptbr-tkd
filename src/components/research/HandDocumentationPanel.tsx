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
  return <article className="hand-evidence" data-evidence-key={claim ? row.claim_key : row.sense_key} data-status="draft">
    <p lang={row.language_tag}>{claim ? row.value : row.meaning}</p>
    <p className="hand-state">
      {row.evidence_kind === 'editorial' ? 'Adaptação didática PT-BR' : authority[row.evidence_kind]}
    </p>
    {row.usage_context && <p>Contexto: {row.usage_context}</p>}
    {claim && row.variant_kind && <p>Variante: {row.variant_kind}</p>}
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
  if (!documentation) return <p role="status">Termo não documentado.</p>;
  const { term, claims, senses, regions, techniques } = documentation;
  const hangulClaim = claims.find(c => c.field_name === 'hangul');
  const romanClaim = claims.find(c => c.field_name === 'romanization');
  const ptClaim = claims.find(c => c.field_name === 'pronunciation_pt');
  const transClaim = claims.find(c => c.field_name === 'translation_pt');
  const defClaim = claims.find(c => c.field_name === 'definition_pt');
  const litSense = senses.find(s => s.sense_kind === 'literal');
  const techSense = senses.find(s => s.sense_kind === 'technical');

  return <div className="hand-documentation" data-term-documentation={term.slug}>
    <header className="hand-term-header">
      <h3>{transClaim?.value || romanClaim?.value || term.slug}</h3>
      {hangulClaim && <p lang="ko" className="hangul-large">{hangulClaim.value}</p>}
      {romanClaim && <p className="romanization-lead"><strong>Romanização:</strong> {romanClaim.value}</p>}
      {ptClaim && <p className="pronunciation-lead"><strong>Pronúncia aproximada:</strong> {ptClaim.value}</p>}
      {(litSense || techSense || defClaim) && (
        <p className="meaning-lead">
          <strong>Significado:</strong> {techSense?.meaning || defClaim?.value || litSense?.meaning}
        </p>
      )}
    </header>

    {(Object.entries(fields) as [HandField, string][]).map(([field, label]) => {
      const rows = claims.filter(c => c.field_name === field);
      const hasDocumentedSense = senses.some(sense => `${sense.sense_kind}_meaning` === field);
      if (!rows.length && !hasDocumentedSense) {
        return <span key={field} data-pending={field} className="sr-only" aria-hidden="true" />;
      }
      return <section key={field} data-field={field} aria-label={label}>
        <h4>{label}</h4>
        {rows.length ? rows.map(row => <Evidence key={row.claim_key} row={row} matrix={matrix} />)
          : <p>Consulte os sentidos documentados em “Sentidos por contexto”, abaixo.</p>}
      </section>;
    })}

    {senses.length > 0 && (
      <section aria-label="Sentidos por contexto">
        <h4>Sentidos por contexto</h4>
        {senses.map(row => <div key={row.sense_key}>
          <h5>Sentido {senseKinds[row.sense_kind].toLowerCase()}</h5>
          <Evidence row={row} matrix={matrix} />
        </div>)}
      </section>
    )}

    {regions.length > 0 && (
      <section aria-label="Superfícies anatômicas correspondentes">
        <h4>Superfícies anatômicas correspondentes</h4>
        {regions.map(region => <div key={region.region_slug}>
          <p>Superfície: {region.region_slug}</p>
          <Reference reference={region.reference} locator={region.source_locator} />
        </div>)}
      </section>
    )}

    {techniques.length > 0 && (
      <section aria-label="Relações com técnicas de Taekwondo">
        <h4>Relações com técnicas de Taekwondo</h4>
        {techniques.map(technique => <div key={technique.term_slug}>
          <p>Técnica relacionada: {technique.term_slug} ({technique.relation_kind})</p>
          <Reference reference={technique.reference} locator={technique.source_locator} />
        </div>)}
      </section>
    )}
  </div>;
}

export function HandRegionPanel({ matrix, regionSlug }: { matrix: HandMatrix; regionSlug: string }) {
  const documentation = handRegionDocumentation(matrix, regionSlug);
  if (!documentation) return <p role="status">Região não documentada.</p>;
  const { region, terms } = documentation;
  return <div className="hand-documentation" data-region-documentation={region.slug}>
    <h3>{region.name_pt}</h3>
    {region.note && <p className="region-lead">{region.note}</p>}
    {terms.length > 0 ? (
      terms.map(term => <HandTermPanel key={term.term.slug} matrix={matrix} termSlug={term.term.slug} />)
    ) : (
      <p className="region-description">
        Superfície anatômica da mão identificada no mapa corporal do Taekwondo para fins de estudo e orientação técnica.
      </p>
    )}
  </div>;
}
