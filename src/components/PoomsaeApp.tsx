import { useEffect, useState } from 'react';
import { isCatalogConfigured } from '../lib/catalog-api';
import {
  fetchPublishedPoomsae,
  fetchPoomsaeSteps,
  isKnowledgeSchemaEnabled,
  type PoomsaeForm,
  type PoomsaeStep,
} from '../lib/poomsae';
import KnowledgeReferences from './KnowledgeReferences';
import FavoriteButton from './FavoriteButton';
import {
  allPoomsaeGuides,
  danForms,
  getPoomsaeGuide,
  getPoomsaeKoreanIdentity,
  kukkiwonPoomsaeSource,
  kukkiwonTaegeukVideosNotice,
  taegeukForms,
  type PoomsaeFormGuide,
} from '../data/poomsae-guide';
import { getPoomsaeCounts, poomsaeCountSource } from '../data/poomsae-counts';
import { PoomsaeLineDiagram, SchoolBeltStatus, TrigramDiagram } from './poomsae/PoomsaeVisuals';

export function PoomsaeSequence({ form, steps }: { form: PoomsaeForm; steps: PoomsaeStep[] }) {
  const [mode, setMode] = useState<'complete' | 'step'>('complete');
  const [stepIndex, setStepIndex] = useState(0);
  const guide = getPoomsaeGuide(form.technical_terms.slug);

  useEffect(() => {
    setStepIndex(0);
  }, [form.term_id, steps.length]);

  const activeStep = steps[Math.min(stepIndex, Math.max(0, steps.length - 1))];

  return (
    <article className="section-inner" aria-label={'Sequência de ' + form.technical_terms.romanization}>
      <div className="poomsae-sequence-head">
        <div>
          <h2>{form.technical_terms.romanization}</h2>
          {form.technical_terms.hangul && <p lang="ko">{form.technical_terms.hangul}</p>}
          <p>{form.technical_terms.translation_pt}</p>
        </div>
        {guide?.kind === 'taegeuk' && (
          <TrigramDiagram bars={guide.trigram.bars} label={`${guide.trigram.romanization} (${guide.symbol})`} compact />
        )}
        {guide?.kind === 'dan' && guide.poomsaeLine && (
          <PoomsaeLineDiagram
            kind={guide.poomsaeLine.kind}
            character={guide.poomsaeLine.character}
            label={guide.name}
            compact
          />
        )}
      </div>
      <p className="fine-print">Versão documental: {form.sequence_version}. A numeração segue os registros publicados.</p>
      <div className="actions">
        <a href={'/tecnica?slug=' + encodeURIComponent(form.technical_terms.slug)}>
          Consultar ficha e referências da forma
        </a>
        {guide && <a href={`/biblioteca/poomsae/${guide.slug}`}>Abrir dossiê na biblioteca →</a>}
      </div>
      <KnowledgeReferences sources={[form]} />
      {!steps.length ? (
        <p>Nenhum movimento publicado para esta versão.</p>
      ) : (
        <>
          <div className="poomsae-mode-bar" role="group" aria-label="Modo de visualização da sequência">
            <button type="button" aria-pressed={mode === 'complete'} onClick={() => setMode('complete')}>
              Visão completa ({steps.length})
            </button>
            <button type="button" aria-pressed={mode === 'step'} onClick={() => setMode('step')}>
              Estudo passo a passo
            </button>
          </div>
          {mode === 'complete' ? (
            <ol>
              {steps.map((step) => (
                <li key={step.id} value={step.step_number} className="card">
                  <h3>
                    Movimento {step.step_number}:{' '}
                    <a href={'/tecnica?slug=' + encodeURIComponent(step.technical_terms.slug)}>
                      {step.technical_terms.romanization}
                    </a>
                  </h3>
                  {step.technical_terms.hangul && <p lang="ko">{step.technical_terms.hangul}</p>}
                  {step.instruction_pt && <p>{step.instruction_pt}</p>}
                  <KnowledgeReferences sources={[step]} />
                </li>
              ))}
            </ol>
          ) : (
            activeStep && (
              <div
                className="card poomsae-stepper"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowRight') setStepIndex((idx) => Math.min(steps.length - 1, idx + 1));
                  if (event.key === 'ArrowLeft') setStepIndex((idx) => Math.max(0, idx - 1));
                }}
              >
                <p className="tag" role="status">
                  Passo {stepIndex + 1} de {steps.length} · Movimento documentado #{activeStep.step_number}
                </p>
                <h3>
                  Movimento {activeStep.step_number}:{' '}
                  <a href={'/tecnica?slug=' + encodeURIComponent(activeStep.technical_terms.slug)}>
                    {activeStep.technical_terms.romanization}
                  </a>
                </h3>
                {activeStep.technical_terms.hangul && <p lang="ko">{activeStep.technical_terms.hangul}</p>}
                {activeStep.instruction_pt && <p>{activeStep.instruction_pt}</p>}
                <KnowledgeReferences sources={[activeStep]} />
                <div className="actions">
                  <button
                    type="button"
                    disabled={stepIndex === 0}
                    onClick={() => setStepIndex((idx) => Math.max(0, idx - 1))}
                  >
                    ← Movimento anterior
                  </button>
                  <button
                    type="button"
                    disabled={stepIndex >= steps.length - 1}
                    onClick={() => setStepIndex((idx) => Math.min(steps.length - 1, idx + 1))}
                  >
                    Próximo movimento →
                  </button>
                </div>
              </div>
            )
          )}
        </>
      )}
    </article>
  );
}

function PoomsaeDossierPanel({
  guide,
  onSelect,
  onClose,
}: {
  guide: PoomsaeFormGuide;
  onSelect: (slug: string) => void;
  onClose: () => void;
}) {
  const index = allPoomsaeGuides.findIndex((item) => item.slug === guide.slug);
  const prev = index > 0 ? allPoomsaeGuides[index - 1] : null;
  const next = index >= 0 && index < allPoomsaeGuides.length - 1 ? allPoomsaeGuides[index + 1] : null;
  const counts = getPoomsaeCounts(guide);
  const identity = getPoomsaeKoreanIdentity(guide);

  return (
    <section className="card poomsae-dossier" aria-label="Dossiê de estudo da forma" id="dossie-poomsae">
      <div className="poomsae-dossier-top">
        <div>
          <p className="tag">
            {guide.kind === 'taegeuk'
              ? `Série Taegeuk · Forma ${guide.number} de 8 · Trigrama ${guide.trigram.romanization}`
              : `Série Yudanja (Dan) · ${guide.order} de 9`}
          </p>
          <h2>{guide.name}</h2>
          <a className="inline-link" href={identity.url} target="_blank" rel="noopener noreferrer" lang="ko">{identity.hangul}</a>
          <p className="lead">
            {guide.kind === 'taegeuk' ? `${guide.trigram.symbolPt} — ${guide.note}` : guide.theme}
          </p>
        </div>
        <div className="poomsae-dossier-visual">
          {guide.kind === 'taegeuk' && (
            <TrigramDiagram bars={guide.trigram.bars} label={`${guide.trigram.romanization} (${guide.symbol})`} />
          )}
          {guide.kind === 'dan' && guide.poomsaeLine && (
            <PoomsaeLineDiagram
              kind={guide.poomsaeLine.kind}
              character={guide.poomsaeLine.character}
              label={guide.name}
            />
          )}
        </div>
      </div>

      <div className="poomsae-dossier-grid">
        <div className="poomsae-dossier-block">
          <h3>Contexto filosófico e simbólico</h3>
          <p>{guide.philosophySummary}</p>
          {guide.kind === 'taegeuk' && <p className="fine-print">{guide.trigram.polaritySummary}</p>}
          {guide.kind === 'dan' &&
            (guide.poomsaeLine ? (
              <p className="fine-print">{guide.poomsaeLine.meaningPt}</p>
            ) : (
              <p className="fine-print">
                O artigo institucional consultado não especifica caractere isolado para a linha de deslocamento desta
                forma; nenhum diagrama foi inferido sem fonte.
              </p>
            ))}
        </div>

        <div className="poomsae-dossier-block">
          <h3>Correspondência corporal e foco técnico</h3>
          <p>
            <strong>{guide.bodyCorrespondence.label}:</strong> {guide.bodyCorrespondence.summary}
          </p>
          <ul>
            {guide.practiceFocus.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <p className="fine-print">
            <a className="inline-link" href={`/atlas?region=${guide.bodyCorrespondence.atlasRegion}&zoom=1`}>
              Explorar região relacionada no Atlas corporal →
            </a>
          </p>
        </div>
      </div>

      <SchoolBeltStatus slug={guide.slug} formName={guide.name} />

      <div className="poomsae-dossier-relations">
        {counts && (
          <div>
            <strong>Contagem documental</strong>
            <p>{counts.stages} etapas (품) · {counts.actions} ações (동작수)</p>
            <a className="inline-link" href={poomsaeCountSource.url} target="_blank" rel="noopener noreferrer">
              {poomsaeCountSource.institution} · {poomsaeCountSource.locator} ↗
            </a>
            <p className="fine-print">
              Consulta em <time dateTime={poomsaeCountSource.accessedOn}>26/11/2026</time>. A contagem segue a tabela citada.
            </p>
            <a className="inline-link" href="/biblioteca/iron/iron-convencoes-de-contagem">Como ler etapas, ações e quadros →</a>
          </div>
        )}
        <div>
          <strong>Postura de preparação relacionada (consulta provisória):</strong>{' '}
          <a className="inline-link" href={`/acervo#${guide.relatedAcervoJunbi.slug}`}>
            {guide.relatedAcervoJunbi.romanization} no Acervo →
          </a>
          <p className="fine-print">{guide.relatedAcervoJunbi.note}</p>
        </div>
        <div>
          <strong>Fonte individual desta síntese:</strong>{' '}
          <a className="inline-link" href={guide.evidence.url} target="_blank" rel="noopener noreferrer">
            {guide.evidence.institution} · {guide.evidence.document} ({guide.evidence.locator}) ↗
          </a>
          <p className="fine-print">
            Conferido em {guide.evidence.sourceCheckedAt}. Síntese didática em português; a sequência passo a passo não
            é inferida a partir do resumo filosófico.
          </p>
        </div>
      </div>

      <div className="actions poomsae-dossier-actions">
        <FavoriteButton slug={guide.slug} title={guide.name} />
        <a className="button button-outline" href={`/biblioteca/poomsae/${guide.slug}`}>
          Abrir ficha completa na Biblioteca →
        </a>
        {prev && (
          <button type="button" onClick={() => onSelect(prev.slug)}>
            ← {prev.name}
          </button>
        )}
        {next && (
          <button type="button" onClick={() => onSelect(next.slug)}>
            {next.name} →
          </button>
        )}
        <button type="button" onClick={onClose}>
          Fechar dossiê
        </button>
      </div>
    </section>
  );
}

export default function PoomsaeApp() {
  const enabled = isKnowledgeSchemaEnabled() && isCatalogConfigured();
  const [forms, setForms] = useState<PoomsaeForm[]>([]),
    [selected, setSelected] = useState<string | null>(null);
  const [steps, setSteps] = useState<PoomsaeStep[]>([]),
    [loading, setLoading] = useState(enabled),
    [stepsLoading, setStepsLoading] = useState(false);
  const [error, setError] = useState(''),
    [stepError, setStepError] = useState(''),
    [retry, setRetry] = useState(0);
  const [activeGuideSlug, setActiveGuideSlug] = useState<string | null>(null);

  useEffect(() => {
    const syncGuideFromUrl = () => {
      const slug = new URLSearchParams(window.location.search).get('forma');
      if (slug && getPoomsaeGuide(slug)) setActiveGuideSlug(slug);
    };
    syncGuideFromUrl();
    window.addEventListener('popstate', syncGuideFromUrl);
    return () => window.removeEventListener('popstate', syncGuideFromUrl);
  }, []);

  const selectGuide = (slug: string | null) => {
    setActiveGuideSlug(slug);
    const params = new URLSearchParams(window.location.search);
    if (slug) params.set('forma', slug);
    else params.delete('forma');
    const query = params.toString();
    history.replaceState(null, '', '/poomsae' + (query ? '?' + query : '') + (slug ? '#dossie-poomsae' : ''));
  };

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetchPublishedPoomsae(controller.signal)
      .then((rows) => {
        if (!controller.signal.aborted) {
          setForms(rows);
          const slug = new URLSearchParams(window.location.search).get('slug');
          setSelected(rows.find((row) => row.technical_terms.slug === slug)?.term_id || rows[0]?.term_id || null);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setError('Não foi possível consultar as formas publicadas.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [enabled, retry]);

  useEffect(() => {
    setSteps([]);
    setStepError('');
    if (!selected) return;
    const controller = new AbortController();
    setStepsLoading(true);
    fetchPoomsaeSteps(selected, controller.signal)
      .then((rows) => {
        if (!controller.signal.aborted) setSteps(rows);
      })
      .catch(() => {
        if (!controller.signal.aborted) setStepError('Não foi possível consultar os movimentos desta forma.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setStepsLoading(false);
      });
    return () => controller.abort();
  }, [selected, retry]);

  const form = forms.find((item) => item.term_id === selected);
  const activeGuide = activeGuideSlug ? getPoomsaeGuide(activeGuideSlug) : null;

  if (loading) return <p role="status">Consultando Poomsae publicados...</p>;
  if (error)
    return (
      <div role="alert">
        <p>{error}</p>
        <button onClick={() => setRetry((value) => value + 1)}>Tentar novamente</button>
      </div>
    );

  if (!forms.length)
    return (
      <div className="poomsae-index">
        {activeGuide && (
          <PoomsaeDossierPanel guide={activeGuide} onSelect={(slug) => selectGuide(slug)} onClose={() => selectGuide(null)} />
        )}

        <section aria-label="Introdução às formas Taegeuk">
          <div className="card">
            <p className="tag">Conteúdo educativo de referência</p>
            <h2>Conheça os oito Taegeuk</h2>
            <p>
              Os nomes, os trigramas (Palgwae/Bagua), as correspondências corporais e os temas gerais das oito formas
              Taegeuk podem ser estudados desde já. A associação entre Poomsae e faixa depende do currículo de cada
              escola ou federação, e as sequências passo a passo continuarão separadas até a validação documental de
              cada movimento.
            </p>
            <div className="grid poomsae-grid">
              {taegeukForms.map((item) => (
                <article key={item.number} className="card poomsae-card">
                  <div className="poomsae-card-head">
                    <div>
                      <p className="tag">
                        Forma {item.number} de 8 · {item.trigram.romanization}
                      </p>
                      <h3>{item.name}</h3>
                    </div>
                    <TrigramDiagram
                      bars={item.trigram.bars}
                      label={`${item.trigram.romanization} (${item.symbol})`}
                      compact
                    />
                  </div>
                  <p>
                    <strong>Símbolo: {item.symbol}</strong> ({item.trigram.symbolPt})
                  </p>
                  <p>{item.note}</p>
                  <p className="fine-print">Foco corporal na fonte: {item.bodyCorrespondence.label}.</p>
                  <SchoolBeltStatus slug={item.slug} formName={item.name} compact />
                  <div className="poomsae-card-actions">
                    <button
                      type="button"
                      aria-pressed={activeGuideSlug === item.slug}
                      onClick={() => selectGuide(activeGuideSlug === item.slug ? null : item.slug)}
                    >
                      {activeGuideSlug === item.slug ? 'Dossiê aberto' : 'Explorar dossiê'}
                    </button>
                    <a className="inline-link" href={`/biblioteca/poomsae/${item.slug}`}>
                      Ficha na biblioteca →
                    </a>
                    <a className="inline-link" target="_blank" rel="noreferrer" href={item.evidence.url}>
                      Ler a descrição original na Kukkiwon →
                    </a>
                  </div>
                </article>
              ))}
            </div>
            <p className="fine-print">
              Resumo introdutório independente, baseado nas descrições públicas da Kukkiwon; não substitui ensino
              supervisionado nem constitui uma sequência técnica homologada neste site.{' '}
              <a href={kukkiwonPoomsaeSource} target="_blank" rel="noreferrer">
                Consultar a referência original de Poomsae
              </a>{' '}
              ·{' '}
              <a href={kukkiwonTaegeukVideosNotice} target="_blank" rel="noopener noreferrer">
                Comunicado Kukkiwon (2025) sobre vídeos educativos Taegeuk 1–8
              </a>
              .
            </p>
          </div>
        </section>

        <section className="card section-inner" aria-label="Poomsae de graduação Dan">
          <p className="tag">Poomsae de graduação Dan</p>
          <h2>Conheça as formas de Koryo a Ilyeo</h2>
          <p>
            Os nove nomes, temas filosóficos e linhas de deslocamento documentadas abaixo são apresentados pela
            Kukkiwon para praticantes Yudanja (faixa preta / Dan). Seus movimentos individuais ainda precisam de
            documentação específica e revisão antes de aparecer como sequência passo a passo aqui.
          </p>
          <div className="grid poomsae-grid">
            {danForms.map((item) => (
              <article key={item.boardNo} className="card poomsae-card">
                <div className="poomsae-card-head">
                  <div>
                    <p className="tag">Yudanja · {item.order} de 9</p>
                    <h3>{item.name}</h3>
                  </div>
                  {item.poomsaeLine && (
                    <PoomsaeLineDiagram
                      kind={item.poomsaeLine.kind}
                      character={item.poomsaeLine.character}
                      label={item.name}
                      compact
                    />
                  )}
                </div>
                <p>{item.theme}</p>
                {item.poomsaeLine && (
                  <p className="fine-print">
                    <strong>Linha documentada:</strong> {item.poomsaeLine.character}
                  </p>
                )}
                <SchoolBeltStatus slug={item.slug} formName={item.name} compact />
                <p className="fine-print">
                  Kukkiwon · {item.evidence.locator}. Fonte consultada em {item.evidence.sourceCheckedAt}. Resumo
                  editorial em revisão; sequência técnica não verificada.
                </p>
                <div className="poomsae-card-actions">
                  <button
                    type="button"
                    aria-pressed={activeGuideSlug === item.slug}
                    onClick={() => selectGuide(activeGuideSlug === item.slug ? null : item.slug)}
                  >
                    {activeGuideSlug === item.slug ? 'Dossiê aberto' : 'Explorar dossiê'}
                  </button>
                  <a className="inline-link" href={`/biblioteca/poomsae/${item.slug}`}>
                    Ficha na biblioteca →
                  </a>
                  <a className="inline-link" target="_blank" rel="noopener noreferrer" href={item.evidence.url}>
                    Conferir nome e contexto na Kukkiwon →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="empty" role="status">
          <h2>Poomsae em preparação</h2>
          <p>As sequências detalhadas aparecerão após conferência das fontes e aprovação editorial de cada movimento.</p>
          <div className="actions">
            <a href="/catalogo">Consultar catálogo</a>
            <a href="/biblioteca/poomsae">Ver coleção Poomsae na Biblioteca</a>
            <a href="/biblioteca/palgwae">Conhecer a coleção histórica Palgwae</a>
            <a href="/curriculos">Montar currículo de estudos</a>
          </div>
        </div>
      </div>
    );

  return (
    <div>
      <label className="field">
        Forma publicada
        <select
          value={selected || ''}
          onChange={(event) => {
            const id = event.target.value;
            setSelected(id);
            const item = forms.find((row) => row.term_id === id);
            if (item) history.replaceState(null, '', '/poomsae?slug=' + encodeURIComponent(item.technical_terms.slug));
          }}
        >
          {forms.map((item) => (
            <option key={item.term_id} value={item.term_id}>
              {item.technical_terms.romanization}
            </option>
          ))}
        </select>
      </label>
      {stepsLoading ? (
        <p role="status">Consultando movimentos publicados...</p>
      ) : stepError ? (
        <div role="alert">
          <p>{stepError}</p>
          <button onClick={() => setRetry((value) => value + 1)}>Tentar novamente</button>
        </div>
      ) : (
        form && <PoomsaeSequence form={form} steps={steps} />
      )}
    </div>
  );
}
