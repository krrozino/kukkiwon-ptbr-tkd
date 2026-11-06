# Documentação — Taekwondo para Todos

Esta é a porta de entrada para a documentação **pública e versionada**. Os documentos históricos de sprints, specs e pesquisa permanecem úteis como evidência, mas não substituem este índice nem o estado registrado em [Releases](https://github.com/krrozino/kukkiwon-ptbr-tkd/releases).

## Para visitantes e comunidade

| Documento | Objetivo |
| --- | --- |
| [README](../README.md) | Apresentação, público, recursos, limites, link do site |
| [Recursos](FEATURES.md) | O que existe hoje, o que depende de homologação |
| [Roadmap](ROADMAP.md) | Etapas e pendências verificadas |
| [Contribuição](../CONTRIBUTING.md) | Como ajudar com código, feedback e fontes |
| [Conduta](../CODE_OF_CONDUCT.md) | Regras de convivência |
| [Licenças e direitos](GOVERNANCE.md#licenças-e-direitos) | O que ainda está pendente |

## Para desenvolvedores

| Documento | Objetivo |
| --- | --- |
| [Começar localmente](GETTING_STARTED.md) | Dependências, .env, scripts e testes |
| [Arquitetura](ARCHITECTURE.md) | Stack, fronteiras de dados, fluxos e ambientes |
| [Política de versões](VERSIONING.md) | MAJOR / MINOR / PATCH e exemplos |
| [Release oficial](GITHUB_RELEASES.md) | Gatilhos manuais, pré-condições, smoke e rollback |
| [Operação](OPERATIONS.md) | Proteções e cuidados operacionais |
| [Segurança](../SECURITY.md) | Reportes de vulnerabilidade e segredos |
| [Banco](DATABASE.md) · [extensões](DATABASE_EXTENSIONS.md) | PostgreSQL, RLS e mudanças |
| [Pipeline editorial](DATA_PIPELINE.md) | Validação, pesquisa e importação controlada |

## Para revisão de conteúdo

| Documento | Objetivo |
| --- | --- |
| [Política editorial](CONTENT_POLICY.md) | Condições para publicação |
| [Revisão humana](EDITORIAL_REVIEW.md) | Como gerar e revisar pacotes offline |
| [Governança](GOVERNANCE.md) | Responsabilidades, decisões e limites |
| [Modelo de conhecimento](KNOWLEDGE_MODEL.md) | Estruturas propostas e isolamento |
| [Integração](KNOWLEDGE_INTEGRATION.md) | Leitura pública de relações e Poomsae |
| [Auditoria de pesquisa](GEMINI_RESEARCH_AUDIT.md) | Critérios e rastreabilidade da investigação |
| [Pesquisa documental](research/2026-11-06-documentary-audit.md) | Estado e fontes de candidatos |

## Histórico técnico

Os documentos `SPRINT_01.md`, `SPRINT_02.md`, `SPRINT_03.md`, `INTEGRATION_READINESS.md` e `superpowers/` descrevem **contextos históricos de implementação**. Alguns contêm URLs, nomes de branches, contagens e estados já superados. Nunca inferir o estado atual só a partir deles. Verifique o [changelog](../CHANGELOG.md), as [Releases](https://github.com/krrozino/kukkiwon-ptbr-tkd/releases), as migrações aplicadas e o workflow de CI.

## Fonte da verdade

- **GitHub:** arquitetura, interfaces, código, testes, runbooks, releases e políticas públicas.
- **Notion:** memória de decisões, planejamento, riscos e aprovações. Uma decisão implementada exige PR e atualização da documentação do repositório.
- **Supabase:** dados operacionais e estados editoriais, não o registro único de decisões.
- **Técnica:** fonte, localizador e revisão humana em cada ficha. Nenhuma Release confere aprovação técnica automática.