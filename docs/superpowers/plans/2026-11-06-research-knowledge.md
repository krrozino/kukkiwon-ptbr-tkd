# Research Knowledge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** transformar a pesquisa em entrada auditável e revisão prática, preservando o catálogo e a produção.

**Architecture:** originais imutáveis com hashes, camada de auditoria por campo e comparador conservador. Pesquisa isolada no navegador e em esquema privado; recursos públicos reutilizam somente registros publicados.

**Tech Stack:** Astro, React, TypeScript, Node, Vitest, PGlite/PostgreSQL, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-06-research-knowledge-design.md`

## Global Constraints

- Nenhum deploy, alteração do Worker oficial, migração remota ou gravação no Supabase remoto.
- Nenhuma promoção editorial, revisão humana, assinatura ou data de aprovação inventada.
- Nenhuma alteração dos 108 originais nem das geometrias SVG.
- Nenhuma cópia de figuras ou livros institucionais para o pacote público.
- PRs separadas e dependências explícitas; sem merge automático.

## Review Focus

- Entrada malformada no fim de um lote: rejeitar o arquivo inteiro, sem estado parcial.
- Mesmo slug com Hangul diferente: exibir conflito e preservar ambos os valores.
- Sessão local modificada externamente: validar identidade do lote, sequência histórica e limites; não interpretar como aprovação.
- Fonte acessível apenas como anúncio: não marcar conteúdo técnico do livro como conferido.
- Novas tabelas sem migração remota: experiência pública vazia e estável por padrão.

### Task 1: Auditoria e pipeline

**Files:** `src/lib/research-loader.ts`, `src/lib/research-audit.ts`, `scripts/research-audit.mjs`, `tests/research-audit.test.ts`, `content/research/gemini-2026-11-06/*`, `docs/research/*`.

**Interfaces:** `auditResearch(bundle, existing, documentary)` retorna envelope versionado com originais, normalizações, correspondências, estado documental e lacunas; `parseAuditFile(unknown)` valida entrada sem promover conteúdo.

- [ ] Testar rejeição integral de JSON malformado/promovido, NFC idempotente, identidades únicas, conflito, variantes, proveniência e nenhuma mutação dos lotes.
- [ ] Rodar os testes e observar falha por comportamento ausente.
- [ ] Implementar parser, comparador, inventário com SHA-256, classificação individual e relatórios JSON/CSV/Markdown reproduzíveis.
- [ ] Rodar testes focados e a suíte; gerar artefatos e comparar duas execuções.
- [ ] Commit/PR A com cobertura documental real e pendências.

### Task 2: Modelo relacional

**Files:** nova migração em `supabase/migrations`, `tests/knowledge-database.test.mjs`, `docs/KNOWLEDGE_MODEL.md`.

**Interfaces:** reutilizar `technical_terms`, `term_sources`, `term_relations`, `body_regions`; relações novas opcionais para a integração pública.

- [ ] Ler esquema existente e escrever testes de RLS, evidência por campo, integridade, identidade humana e histórico imutável.
- [ ] Observar falha, implementar migração compatível e executar somente em PGlite.
- [ ] Validar suíte e documentar aplicabilidade local; commit/PR B dependente da A.

### Task 3: Laboratório editorial

**Files:** `src/components/ResearchWorkbench.tsx`, `src/lib/research-session.ts`, `tests/research-session.test.ts`, testes locais Playwright e estilos próprios.

**Interfaces:** consome o envelope da Task 1; sessões portáveis identificam hash do PDF e candidatos, preservam eventos de checklist/proposta/anotação sem aprovação.

- [ ] Testar busca PT/Hangul/romanização, filtros, comparação e sessões com revisão explícita sem promoção.
- [ ] Observar falha, implementar histórico, checklist, exportação e reabertura validada.
- [ ] Testar no navegador desktop/mobile, teclado, XSS e erros; conferir ausência do componente/dados no build público.
- [ ] Commit/PR C dependente da B.

### Task 4: Integração e fundações educativas

**Files:** adaptador de conhecimento publicado, componentes de catálogo/atlas/glossário/Poomsae/aprendizagem, testes correspondentes, `docs/KNOWLEDGE_INTEGRATION.md`.

**Interfaces:** apenas termos e relações publicados, dados licenciados e localizadores; recursos dependentes de migração desligados por padrão.

- [ ] Testar exclusão de rascunhos, fonte/relação inválida, estado vazio e ausência de graduação universal.
- [ ] Observar falha e implementar adaptadores/componentes e navegação acessível.
- [ ] Executar conteúdo, TypeScript, unitários/banco, integração local, build e Playwright; revisão independente da branch.
- [ ] Commit/PR D dependente da C, sem merge/deploy; registrar resultados e próximos passos humanos.
