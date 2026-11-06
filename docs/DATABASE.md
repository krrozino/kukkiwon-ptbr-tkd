# Banco de dados — Supabase / PostgreSQL

## Projeto e escopo

- **Supabase dedicado:** `acbostnsohltuaegfkwl`, região `sa-east-1`, PostgreSQL, separado do EloDo.
- **Painel:** https://supabase.com/dashboard/project/acbostnsohltuaegfkwl
- **Acesso público:** somente dados elegíveis via PostgREST/RPC com RLS e chave `sb_publishable_*`.
- **Acesso privado:** Auth e políticas por escola; pesquisa/editoria em ambiente isolado até autorização.
- Nunca utilizar `service_role` ou `sb_secret_*` no frontend, em Issues, Notion ou documentação pública.

## Migrações remotas confirmadas em 06/11/2026

| Migração | Estado |
| --- | --- |
| `20261103205602_catalogo_publico_inicial` | Aplicada |
| `20261103220044_atlas_media_e_integridade_de_fontes` | Aplicada |
| `20261105020254_sprint_catalog_search_relations` | Aplicada |
| `20261105115448_sprint02_schools_learning` | Aplicada |
| `20261105203201_sprint03_school_images` | Aplicada |
| `20261106152500_knowledge_research_and_poomsae` | **NÃO aplicada remotamente**; proposta no repositório |

A existência de um arquivo em `supabase/migrations/` não significa aplicação. Antes de executar qualquer migração futura, inspecionar as migrações ativas, planejar backup/rollback e homologar em ambiente isolado. Não executar migrações automaticamente em CI ou deploy do site.

## Estado editorial remoto confirmado

Em 06/11/2026, `public.technical_terms` continha:
- **105 linhas `publication_status='draft'`**.
- **Zero linhas `publication_status='published'`**.

Contagens de arquivos do repositório e pesquisas Gemini são inventários distintos; não deduzir que estão no banco. Conteúdo publicado depende de fonte, status editorial adequado, `checked_at` e revisão humana. A constraint do banco **não substitui** a conferência por professor/linguista.

## Contratos essenciais

- `technical_terms`: identidades canônicas e estados editoriais.
- `term_aliases`: grafias/nomes auxiliares sem confundir família com variante.
- `content_sources` e `term_sources`: instituições, documentos, edições/localizadores e verificações.
- `body_regions` e `body_region_terms`: anatomia, superfícies e vínculo contextual com termos.
- `term_relations`: relacionamentos técnicos condicionados à visibilidade dos termos e fontes.
- `search_catalog(...)` e `catalog_facets()`: busca e filtros por registros publicados, com limites, paginação e RLS.
- Tabelas de escola, currículo e mídia: aplicação de permissões próprias e direitos das demonstrações.
- `knowledge_research`, `poomsae_forms` e `poomsae_steps`: **estruturas da migração proposta** — não presumir disponíveis na API pública do projeto até serem aplicadas e validadas.

Leia o [pipeline de dados](DATA_PIPELINE.md), o [modelo detalhado de conhecimento](KNOWLEDGE_MODEL.md) e as [extensões](DATABASE_EXTENSIONS.md) para contratos completos.

## Segurança por padrão

- RLS habilitado em todas as tabelas expostas; escrita pública de termos canônicos negada.
- Mesmo quando um usuário está autenticado, permissões de escola e de catálogo têm escopos distintos. Não usar `user_metadata` como fonte de autorização.
- Revisão e promoção de conteúdo devem usar transações controladas, fonte por campo e identidade de revisor validada no servidor.
- Mídias publicáveis só com autoria, licença/autorização e verificação.
- Cuidado com views e funções privilegiadas: documentar e auditar qualquer exceção ao contexto RLS.
- Plano de backup e restauração independente necessário antes de confiar dados insubstituíveis ao plano gratuito.
- Monitorar avisos de segurança do Supabase Auth, inclusive proteção de senhas vazadas, sem alterar configuração sem aprovação.

## Separação de responsabilidades

Uma release do frontend não aplica a migração experimental, não importa rascunhos e não publica técnicas. A aprovação editorial humana é uma autorização distinta do deploy.

Referências: [política editorial](CONTENT_POLICY.md), [operação](OPERATIONS.md), [releases](GITHUB_RELEASES.md).