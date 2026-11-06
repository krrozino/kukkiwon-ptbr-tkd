import type { TermSource } from '../lib/catalog-api';
import { safeReferenceUrl } from '../lib/published-knowledge';

export default function KnowledgeReferences({sources}:{sources:TermSource[]}) {
  if(!sources.length)return <p>Nenhuma referência pública disponível.</p>;
  return <ul className="source-list">{sources.map((record,index)=><li key={index}>
    <strong>{record.content_sources?.institution || 'Fonte'}</strong>{' — '}
    {safeReferenceUrl(record.content_sources?.official_url)
      ? <a href={record.content_sources!.official_url} target="_blank" rel="noopener noreferrer">{record.content_sources?.title || 'Consultar documento'}</a>
      : <span>{record.content_sources?.title || 'Documento sem link público'}</span>}
    {record.content_sources?.edition && ' · '+record.content_sources.edition}
    <span className="fine-print"> · Seção: {record.source_locator}</span>
  </li>)}</ul>;
}
