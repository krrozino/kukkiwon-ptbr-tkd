# Registro público de decisões de arquitetura e produto (ADRs)

As decisões completas, suas alternativas e seu histórico de discussão ficam na **base interna do Notion**. Este índice público registra o resultado **já adotado na implementação**, com links a documentos versionados. Isso evita publicar páginas privadas do workspace sem autorização.

**Data de consolidação:** 06/11/2026. Nenhuma decisão da lista equivale automaticamente à aplicação de migração, publicação de técnica ou deploy.

| ADR | Estado | Decisão | Documento de referência |
| --- | --- | --- | --- |
| ADR-001 | Aceita | Projeto comunitário, público, gratuito, sem fins lucrativos e não afiliado à Kukkiwon | [README](../README.md), [Governança](GOVERNANCE.md) |
| ADR-002 | Aceita | Astro/React/TypeScript + Cloudflare Workers + Supabase/PostgreSQL dedicado | [Arquitetura](ARCHITECTURE.md), [Banco](DATABASE.md) |
| ADR-003 | Aceita | Currículos próprios de escola não alteram o catálogo técnico canônico | [Funcionalidades](FEATURES.md), [Política editorial](CONTENT_POLICY.md) |
| ADR-004 | Aceita | Técnica pública exige fontes verificáveis por campo, revisão humana e direitos de mídia | [Revisão editorial](EDITORIAL_REVIEW.md), [Pipeline](DATA_PIPELINE.md) |
| ADR-005 | Aceita | PR/CI obrigatórias; release oficial manual, auditável e com tag pós-deploy | [Runbook](GITHUB_RELEASES.md), [Operação](OPERATIONS.md) |
| ADR-006 | Aceita | MAJOR.MINOR.PATCH por impacto: gigante / grande-médio / pequeno e conteúdo validado | [Versionamento](VERSIONING.md) |
| ADR-007 | Aceita | GitHub mantém implementação pública; Notion mantém decisões, riscos e planejamento | [Governança](GOVERNANCE.md), [Documentação](INDEX.md) |
| ADR-008 | **Proposta** | Definir licenças separadas de código, traduções/dados e mídia | [Licenças e direitos](GOVERNANCE.md#licenças-e-direitos) |
| ADR-009 | Aceita como objetivo; implementação proposta, homologação pendente | Termos e regiões podem ter vários sentidos/traduções/variantes, cada um atribuído a fonte e contexto | [Proposta SQL/TS](adr/009-term-senses.md), [Modelo de conhecimento](KNOWLEDGE_MODEL.md), [Fontes por campo](SOURCE_PROVENANCE.md) |
| ADR-010 | Aceita (padrão; SVGs pendentes) | Atlas com desenhos vetoriais autorais, revisão anatômica, autoria e direitos rastreáveis | [Arte original](ORIGINAL_ATLAS_ART.md), [Issue #41](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/41) |
| ADR-011 | Aceita (regra editorial; cobertura pendente) | Cada afirmação técnica deve permitir abrir a fonte/edição/localizador específico | [Proveniência](SOURCE_PROVENANCE.md), [Issue #50](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/50) |

## Como propor ou alterar uma decisão

1. Abra uma Issue explicando contexto, alternativas, riscos, evidências, impactos nos usuários e migrações.
2. Discuta e registre a decisão no banco de ADRs do Notion, distinguindo *proposta* de *aceita*.
3. Ao aprovar, atualize a documentação canônica no GitHub por PR e vincule ADR/Issue ao commit e à release.
4. Quando uma decisão for substituída, preserve o histórico e publique a referência à sucessora, sem apagar o motivo original.

## Limites

- Não há revisores técnicos de produção registrados apenas por este documento.
- O modelo de pesquisa/Poomsae ainda depende de migração e homologação próprias.
- A inclusão de técnicas no catálogo é uma decisão editorial individual, não um efeito colateral de release.
- Licenças ainda **não estão definidas**; repositório público não implica permissão irrestrita de reutilização.

[Governança](GOVERNANCE.md) · [Contribuir](../CONTRIBUTING.md) · [Releases](https://github.com/krrozino/kukkiwon-ptbr-tkd/releases)
