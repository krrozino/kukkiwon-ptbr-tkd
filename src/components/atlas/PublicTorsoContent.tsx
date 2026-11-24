import type { BodyRegion } from '../../lib/catalog-api';
import { getTorsoEntries, getTorsoLibraryLinks, torsoDocumentReview, type TorsoTermEntry } from '../../lib/public-torso';
import { AtlasIllustrativeCredit, AtlasReviewStamp, AtlasSourceCitation, AtlasViewNotice } from './AtlasInspectionEvidence';
import type { View } from './BodyMap';
import { zoneCopy } from './zone-copy';

const viewLabels = { front: 'anterior', back: 'posterior' };
const kindLabels = {
  target_area_general: 'Área-alvo geral',
  detailed_target: 'Alvo detalhado documentado',
  contextual_reference: 'Termo contextual documentado',
} as const;

function torsoPrimarySourceLabel(provenance: NonNullable<TorsoTermEntry['korean']>['hangulProvenance'], hasExtra: boolean) {
  if (provenance === 'linguistic_reference') return 'Área, sentido e romanização (manual Kukkiwon)';
  if (provenance === 'manual_compound' && !hasExtra) return 'Termo e Hangul em expressão composta (manual Kukkiwon)';
  return 'Alvo na edição inglesa (manual Kukkiwon)';
}

export default function PublicTorsoRegionInspector({ region, view }: Readonly<{ region: BodyRegion; view: View }>) {
  const entries = getTorsoEntries(region.slug);
  const links = getTorsoLibraryLinks(region.slug);
  return <article className="hand-term-card">
    <AtlasViewNotice regionView={region.detail_view} view={view} labels={viewLabels} />
    <p className="surface-panel-eyebrow">Região anatômica ilustrativa</p>
    <strong>{region.name_pt}</strong>
    {(!entries || entries.length > 1) && <p>{zoneCopy[region.id].description}</p>}
    {!entries && (
      <p className="fine-print">
        A região lateral das costelas e da cintura compõe contextualmente a altura média (Momtong), sem entrada anatômica isolada nas páginas do manual consultadas.
      </p>
    )}
    {entries?.map(({ kind, namePt, description, reference, korean, linguisticReference, extraReference }) => {
      const provenance = korean?.hangulProvenance;
      const extraLabel = provenance === 'manual_compound'
        ? 'Termo e Hangul em expressão composta (manual Kukkiwon)'
        : 'Uso contextual (manual Kukkiwon)';
      return (
        <section key={namePt} className="hand-term-card">
          <p className="surface-panel-eyebrow">{kindLabels[kind]}</p>
          <strong>{namePt}</strong>
          {korean && <p>
            <span className="hand-term-romanization">{korean.romanization}</span>
            {korean.hangul && <> · <span lang="ko">{korean.hangul}</span></>}
          </p>}
          <p>{description}</p>
          {korean?.sourceNote && <p className="fine-print">{korean.sourceNote}</p>}
          <details className="hand-term-sources">
            <summary>Fontes de {namePt.toLocaleLowerCase('pt-BR')}</summary>
            <ul className="fine-print">
              <li><b>{torsoPrimarySourceLabel(provenance, Boolean(extraReference))}</b> · <AtlasSourceCitation reference={reference} /></li>
              {linguisticReference && (
                <li><b>Correspondência linguística de Hangul (norma NIKL)</b> · <AtlasSourceCitation reference={linguisticReference} /></li>
              )}
              {extraReference && <li><b>{extraLabel}</b> · <AtlasSourceCitation reference={extraReference} /></li>}
            </ul>
          </details>
        </section>
      );
    })}
    {links?.map(link => (
      <a key={link.href} className="inline-link" href={link.href}>{link.label}</a>
    ))}
    {entries && <AtlasReviewStamp date={torsoDocumentReview.checkedOn} />}
    <AtlasIllustrativeCredit />
  </article>;
}
