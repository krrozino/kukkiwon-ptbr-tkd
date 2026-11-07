# Atlas A2 — plano de implementação

**Objetivo:** entregar matriz documental da mão e contrato consultável por slug, pronto para integrar à geometria independente do Antigravity.

**Especificação:** despacho Sprint Atlas A2 recebido em 07/11/2026; `AGENTS.md`, `docs/SOURCE_PROVENANCE.md`, `docs/KNOWLEDGE_MODEL.md` e contrato da Issue #42 em `15b1e05`.

**Arquitetura:** JSON versionado com `technical_terms`, `term_senses`, `term_field_claims`, `content_sources`, `body_regions`, `body_region_terms` e `term_relations`. Chaves locais por slug resolvem identidades existentes sem criar UUIDs de banco. Validação TypeScript compartilhada pela CLI offline e pelos consumidores; CSV derivado por afirmação. Tipos semânticos importados do modelo da #42. Dados recebidos explicitamente pelo consumidor, sem importação automática no site público.

**Escolhas de execução:** planejamento seguido de implementação autônoma, conforme o despacho. Reaproveitar contratos da Issue #42 diretamente da main atualizada, sem novas migrações. Não criar UI nesta etapa: contrato e matriz bastam para integração posterior.

**Risco:** MEDIUM (conteúdo e contrato local, sem SQL/RLS remoto).

## Restrições e STOP

- Base final: `origin/main` em `f1a251c8c625aee7362337904d7343fc42f4509f`; branch exclusiva `feat/atlas-hand-terminology`.
- Preservar `surfaces.ts`, `DetailMap.tsx`, `BodyRegionMap.tsx`, `global.css` e todos os slugs geométricos.
- Sem Docker, Firecrawl, API paga, migração remota, publicação editorial, merge ou deploy.
- Toda linha permanece `draft`, sem assinatura humana. Documento conferido não valida tradução/pronúncia editorial.
- STOP de coleta: bloqueio/403/429, restrição robots/termos, mídia sem direitos. Não contornar proteção nem redistribuir PDFs/imagens.
- STOP de implementação: necessidade de modificar arquivos proibidos, conflito de propriedade da worktree ou dependência indispensável de produção.

## Revisão de entradas críticas

- Grafias regionais não substituem romanização institucional; conflitos permanecem explícitos.
- Modumsonkkeut (cinco pontas reunidas) não equivale automaticamente a Moeundusonkkeut (duas).
- Vários sentidos/nomes podem coexistir; tradução técnica não prova etimologia.
- Regiões ilustrativas não recebem Hangul técnico; configurações sem geometria ficam pendentes.
- Ausência de fonte/data/localizador, referência insegura, chaves órfãs e publicação indevida devem falhar.

## Tarefas

### 1. Conferência documental e inventário

- [x] Isolar worktree, ler governança/contratos e issues #43/#50; comparar proposta #42.
- [x] Instalar com `npm ci --ignore-scripts`; baseline `npm test`: 164/164.
- [x] Conferir apêndice 2012, fontes históricas 2010/2011 e variantes complementares; registrar hashes, páginas PDF e lacunas.

### 2. Contrato, validação e consultas

Arquivos: `src/lib/atlas-hand-documentation.ts`, `tests/atlas-hand-documentation.test.ts`.

Interface: `validateHandMatrix(unknown): HandMatrix`, `handTermDocumentation(matrix, slug)`, `handRegionDocumentation(matrix, slug)`, `handMatrixCsv(matrix)`.

- [x] Escrever testes antes da implementação: evidências exatas por campo, URL/data/localizador, múltiplos sentidos, ligações, ilustração, estados editoriais e CSV seguro.
- [x] Observar falha, implementar e executar testes focados.
- [x] Não importar conteúdo de pesquisa no runtime público; bloquear o formato no guard de bundle existente.

### 3. Matriz e auditoria reproduzível

Arquivos: `content/research/atlas-hand-v1/{matrix.json,claims.csv}`, `scripts/atlas-hand-audit.mjs`, `docs/research/2026-11-07-atlas-hand.md`.

- [x] Registrar todas as regiões de mão existentes e configurações documentadas adicionais, sem inventar geometria.
- [x] Derivar CSV por afirmação; testar equivalência do artefato, identidade NFC, localizadores e compatibilidade com slugs/termos existentes.
- [x] Oferecer `npm run atlas:hand:check` (offline/check) e regeneração explícita; nenhum importador SQL/remoto.
- [x] Documentar resolução futura para #42, distinções semânticas, integração e revisão pendente.

### 4. Verificação e entrega

- [x] Executar `content:check`, `research:audit`, `sources:audit`, `atlas:hand:check`, `check`, `npm test`, `build` e teste de isolamento público relevante.
- [x] Revisar diff e assegurar zero alterações nos quatro arquivos proibidos.
- [x] Commit convencional, push da branch exclusiva e PR Draft independente, relacionada a #43/#50 sem fechar escopos globais: PR #59.
- [x] Registrar HEAD/base, CI, evidências, pendências e handoff na PR; sem integração da PR à main ou deploy.

## Registro de execução e decisões

- Inventário: 23 termos, 19 regiões, 47 sentidos, 202 afirmações e 13 relações. Conferência local dos PDFs encontrou os 89 registros de Hangul/romanização usados no pacote.
- Testes focados finais: 32/32. Baseline: 164/164. Isolamento público Playwright: 2/2, desktop/mobile, servidor dedicado na porta 4331; avisos ambientais `NO_COLOR`/`FORCE_COLOR`, sem falha de teste.
- Verificação inicial local: `content:check` (108 registros), `research:audit` (115 candidatos), `sources:audit` (8 fontes legadas), `atlas:hand:check` (novo lote), `check` (zero erros/avisos), `npm test` (196/196) e `build` (14 rotas e guards públicos) passaram.
- Verificação final sobre `f1a251c`: todas as auditorias anteriores e `acervo:check` (120 entradas, 26 relações, zero aprovações) passaram; `npm test` passou 254/254 em 31 arquivos; `check` sem erros/avisos, com dois hints preexistentes de `MediaQueryList.addListener` em `Base.astro`; build de 16 rotas com guards públicos aprovado. Nenhuma correção fora do escopo foi feita nesses hints do layout.
- Revisão independente somente de leitura por subagente Sol/Alto: identificou relação técnica externa não resolvida no audit e inconsistência na rejeição de assinaturas extras nas relações. Ambos os casos foram reproduzidos em testes que falharam antes da correção e passaram depois.
- Decisão: a verificação de identidades externas recebe um catálogo explícito; a CLI sempre fornece os três lotes canônicos locais. Sem catálogo, a API declara somente validação estrutural/interna. Isso mantém o contrato sem rede nem outro catálogo paralelo.
- Decisão: tratar assinatura extra em vínculos como parte da fronteira editorial exigida pelo despacho e corrigir junto à lacuna de identidade. Nenhum item de revisão ficou adiado por escolha técnica.
- Decisão: usar `term_relations.relation_kind='related'`, já aceito pelo SQL existente, preservando a direção técnica → superfície e a fonte. Não introduzir `uses_surface` como enum novo. Regressão observada RED→GREEN.
- Decisão: a consulta provisória deste lote é local e explícita; o gate público continua fechado. A futura integração visual deve manter os estados de pesquisa, sem tratar o lote como aprovado.
- Limites da revisão: aprovação humana linguística/técnica, qualidade fonética, anatomia/direitos do SVG e comportamento remoto não foram atestados. Permanecem tarefas humanas ou de integração autorizada, descritas no relatório documental.
- As ações posteriores ao commit (push, PR Draft, HEAD e CI) são registradas no handoff da própria PR e na entrega do chat, sem incorporar identificação antecipada ou CI fictícia neste arquivo.
- Correção do preflight: o refspec local de fetch era restrito a duas branches. `git fetch origin main` recebeu a main em FETCH_HEAD, mas não moveu o ponteiro antigo `origin/main` (`7d08a66`). Após detectar na PR, executei fetch explícito `refs/heads/main:refs/remotes/origin/main` e incorporei a base `f1a251c` na branch da tarefa, sem rebase/force-push. As verificações foram refeitas sobre a base atual; os arquivos reservados permanecem idênticos a ela. Essa atualização também permitiu importar diretamente os tipos já integrados da #42.
