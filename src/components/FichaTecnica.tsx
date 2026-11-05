import { useEffect, useState } from 'react';
import { fetchTermDetails, isCatalogConfigured } from '../lib/catalog-api';

type Detail = NonNullable<Awaited<ReturnType<typeof fetchTermDetails>>>;

export default function FichaTecnica() {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'notfound' | 'error' | 'unconfigured'>('loading');
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('slug');
    if (!slug || !/^[a-z0-9-]{1,120}$/.test(slug)) { setStatus('notfound'); return; }
    if (!isCatalogConfigured()) { setStatus('unconfigured'); return; }
    const controller = new AbortController();
    fetchTermDetails(slug, controller.signal).then(data => {
      if (!data) { setStatus('notfound'); return; }
      setDetail(data); setStatus('ready');
    }).catch(() => { if (!controller.signal.aborted) setStatus('error'); });
    return () => controller.abort();
  }, []);

  if (status !== 'ready' || !detail) return <div className="empty" role="status">
    {status === 'loading' ? 'Carregando ficha técnica...' :
      status === 'unconfigured' ? 'A conexão com o catálogo ainda não está ativa nesta prévia.' :
      status === 'notfound' ? 'Técnica não encontrada ou ainda não publicada.' :
      'Não foi possível consultar esta técnica.'}
  </div>;

  const { term, sources, media, regions, relations } = detail;
  return <article className="technique-detail">
    <p className="tag">{term.category} · Ficha técnica publicada</p>
    <h1>{term.romanization}</h1>
    {term.hangul && <p lang="ko" className="hangul">{term.hangul}</p>}
    {term.translation_pt && <p className="lead">{term.translation_pt}</p>}
    <div className="detail-grid">
      <section className="card">
        <h2>Entenda a técnica</h2>
        <p>{term.definition_pt || 'Definição ainda não disponível.'}</p>
        {term.pronunciation_pt && <p><strong>Pronúncia aproximada em português:</strong> {term.pronunciation_pt}</p>}
        <p className="fine-print">A pronúncia em português é uma adaptação didática, não uma romanização oficial.</p>
      </section>
      <section className="card">
        <h2>Nomenclaturas relacionadas</h2>
        {(term.term_aliases || []).length === 0 ? <p>Nenhum nome alternativo registrado.</p> :
          <ul>{term.term_aliases!.map(alias => <li key={alias.alias + alias.alias_kind}>
            {alias.alias} <span className="fine-print">({alias.alias_kind}{alias.is_official ? ', documentado' : ', uso de busca'})</span>
          </li>)}</ul>}
      </section>
    </div>
    <section className="section-inner">
      <h2>Referências documentais</h2>
      <p className="fine-print">As fontes abaixo identificam a origem do conteúdo. Verificação técnica e tradução são etapas editoriais distintas.</p>
      {sources.length === 0 ? <p>Nenhuma referência pública disponível.</p> :
        <ul className="source-list">{sources.map((record, index) => <li key={index}>
          <strong>{record.content_sources?.institution || 'Fonte'}</strong>{' — '}
          <a href={record.content_sources?.official_url || '#'} target="_blank" rel="noopener noreferrer">
            {record.content_sources?.title || 'Consultar documento'}
          </a>
          {record.content_sources?.edition && ' · ' + record.content_sources.edition}
          <span className="fine-print"> · Seção: {record.source_locator}</span>
        </li>)}</ul>}
    </section>
    <section className="section-inner"><h2>Atlas e técnicas relacionadas</h2>
      {regions.filter(r=>r.body_regions).length===0?<p>Nenhuma região corporal publicada associada.</p>:
        <ul>{regions.filter(r=>r.body_regions).map(r=><li key={r.body_regions!.id+r.usage_context}>
          <a href={'/atlas?region='+encodeURIComponent(r.body_regions!.slug)}>{r.body_regions!.name_pt}</a>
          <span className="fine-print"> · {r.usage_context==='surface'?'Superfície de contato':r.usage_context==='target'?'Alvo':r.usage_context==='movement'?'Movimento':'Vínculo anatômico'}</span>
        </li>)}</ul>}
      {relations.filter(r=>r.technical_terms).length>0&&<ul>{relations.filter(r=>r.technical_terms).map(r=><li key={r.technical_terms!.slug+r.relation_kind}>
        {r.relation_kind==='variant_of'?'Variante de: ':'Relacionada: '}
        <a href={'/tecnica?slug='+encodeURIComponent(r.technical_terms!.slug)}>{r.technical_terms!.romanization}</a>
      </li>)}</ul>}
      {term.record_kind==='family'&&<a href={'/catalogo?family='+encodeURIComponent(term.slug)}>Consultar variantes documentadas desta família</a>}
    </section>
    <section className="section-inner"><h2>Mídia autorizada</h2>
      {media.length === 0 ? <p>Vídeos e imagens serão incluídos após conferência de autoria e permissões.</p> :
        <ul>{media.map(item => <li key={item.id}><a href={item.media_url} rel="noopener noreferrer" target="_blank">{item.caption_pt || item.media_kind}</a>
          {item.creator&&' · '+item.creator}{item.license_name&&' · '+item.license_name}
        </li>)}</ul>}
    </section>
  </article>;
}
