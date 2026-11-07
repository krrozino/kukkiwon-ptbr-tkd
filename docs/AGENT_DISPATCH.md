# Orquestração de agentes — Programations 2.0 no Taekwondo para Todos

**Objetivo:** aumentar entregas válidas por unidade de quota e retrabalho, não simplesmente executar mais agentes. Esta política é o roteiro *deste repositório*, não uma garantia de acesso remoto a todos os aplicativos. Confirme a disponibilidade de cada agente/modelo no seletor real antes de despachar.

## Governança

- **Responsável por executar:** agente que recebeu Issue, worktree e allowlist. **Responsável por aprovar:** mantenedor; uma IA não homologa sua própria implementação.
- **Uma Issue, uma branch, um objetivo, uma PR.** Projetos/arquivos com conflitos devem ser sequenciados; paralelizar somente recursos isolados. Conversas `/side`, `/fork` e `/goal` não criam worktrees.
- **Preflight leve:** `git status --short`, `git branch --show-current`, `git rev-parse HEAD`, `git log -1`, PR/Issue ativa, `AGENTS.md`, versão de produção e limites.
- **Gate:** evidência de testes reais, PR CI, diff revisado. Merge separado de deploy. Atualizar handoff na Issue; Notion registra *por quê*, GitHub registra *o quê*.
- **Orçamento:** preferir execução local/fixtures e modelos de rotina para trabalho claro; escalonar após falha diagnosticada, não após demora arbitrária. Máximo duas tentativas cegas; na segunda falha produzir diagnóstico e STOP. Nenhuma API, Firecrawl, token pago ou serviço de coleta massiva sem aprovação.

## Responsáveis e modelos iniciais (condicionados ao seletor)

| Frente/Issue | Executor preferencial | Modelo/esforço sugerido | Revisão independente | Entregável concreto |
| --- | --- | --- | --- | --- |
| #40, PR #48 — painel e tipografia | **ANTIGRAVITY** para browser visual; CODEX para testes pontuais | Antigravity Gemini Flash / Médio; Codex Terra / Médio | ChatGPT revisa logs e screenshots | Sem título cortado, toque/teclado estáveis, E2E 375/1280 e PR atualizada |
| #41 — geometria cabeça/tronco/braços/pernas | **ANTIGRAVITY** para reconstruir e fotografar o resultado; CODEX para testes de hitbox em outra worktree sequenciada | Flash / Médio→Alto para UI; Argon / Alto só se geometria transversal bloquear | Gemini multimodal **read-only** compara checklist de anatomia sem copiar a arte | SVG 100% original e editável, frente/costas, captura para cada zona, cobertura e aceite visual |
| #42 — significados, schema e RLS | **CODEX** | Sol / Alto, Extra Alto se alterar autenticação/RLS | Gemini Argon ou segunda revisão técnica em diff sanitizado | ADR, migração **local**, testes negativos de leitura anônima e múltiplos sentidos; sem aplicar prod |
| #43 — conectores e normalização de fontes | **CODEX** | Sol / Médio; Terra para testes pequenos | Gemini pesquisa divergências **sem escrita** | CLI offline + conectores aprovados, relatório idempotente, hash e localizadores; sem scraping indiscriminado |
| #44 e #5 — primeiros 10–15 candidatos editoriais | **GEMINI** para cotejar documentos; **CHATGPT** para normalização/revisão e coordenação | Gemini modelo multimodal disponível, esforço suficiente | Pessoa habilitada em Taekwondo/coreano para homologação | JSON de candidatos e comparativo de fontes por campo; **nenhum published** automático |
| #45 — Poomsae por etapa | **CODEX** para UI/contratos; GEMINI pesquisa documentação | Codex Sol / Médio ou Alto se SQL; Gemini leitura multimodal | Revisor técnico humano | Passos versionados com localizador individual; sem passos inferidos |
| #50 — referências por campo | **CODEX** | Terra / Médio para componente/testes; Sol / Médio para integração de várias rotas | ChatGPT auditoria de cobertura read-only | Link da fonte junto à afirmação, edição/localizador, fallbacks honestos, testes e relatório |
| Documentação/fixtures LOW | **JULES** somente se disponível e autorizado | Modelo configurado na ferramenta, apenas tarefa delimitada | CODEX/ChatGPT verifica diff | Uma branch nova e Draft PR por tarefa; CI Fixer e sugestões automáticas desligadas |

**Não** rodar Codex e Antigravity editando `src/components/atlas/` ao mesmo tempo em branches que serão integradas sem rebase e verificação. O Codex pode fazer investigação **read-only** de uma PR do Antigravity simultaneamente, sem editar.

## Fases de execução e paralelismo real

**Fase A — já em andamento:** #40 (PR #48), #43 (PR #47 integrada) e #50 (contrato/fonte). Evitar iniciar outra correção de layout sobre #48 antes do merge/decisão.

**Fase B — 2 frentes em paralelo isoladas:**
- **Antigravity, branch `feat/atlas-original-body-41`**, apenas arquivos `src/components/atlas/{zones,BodyIllustration,...}`, testes de geometria/snapshots, SVGs próprios e manifesto de arte. Não editar SQL, fonte/DB, `AGENTS.md`, deploy.
- **Codex, branch `feat/term-senses-model-42`**, apenas migrações **locais**/modelo/código e testes/ADR do schema. Não editar atlas visual, conteúdo remoto ou chaves. CI separadas e revisão dirigida.

**Fase C — conteúdo e Poomsae:** Gemini gera pacotes de pesquisa atribuídos por campo/URL, Codex prepara código, humano valida, outra PR propõe publicação com autorização explícita. O ganho vem de eliminar retrabalho de digitação, **não** remover validação humana.

## Modelo de despacho obrigatório

```text
PROGRAMATIONS DISPATCH
Issue / objetivo:
RESPONSÁVEL: CODEX | ANTIGRAVITY | JULES | GEMINI (READ-ONLY)
Modelo/esforço: conferir seletor; menor suficiente
Repositório: krrozino/kukkiwon-ptbr-tkd
Branch + worktree exclusiva:
HEAD e base esperados:
Arquivos permitidos / proibidos:
Evidência disponível e dados de teste:
Entrega/DoD (mensurável):
Testes/CI exigidos:
Risco:
STOP CONDITIONS:
Ações NÃO autorizadas: deploy, migração de produção, publicação editorial, credenciais, force/reset/limpeza destrutiva, custos externos.
Handoff: commit/PR/HEAD, tests PASS/FAIL/SKIP, riscos, alterações locais e próxima ação.
```

## Despacho pronto: Antigravity — reconstrução autoral (#41)

```text
Responsável: ANTIGRAVITY; modelo Gemini Flash Medium, High se necessário; Argon High somente por bloqueio geométrico real. Abrir Issue #41 e AGENTS.md. Faça /plan, leia os IDs e paths de zones.ts/BodyIllustration.tsx e isole worktree/branch feat/atlas-original-body-41. Preserve todos os slugs e os bons recortes de mãos/pés. Crie desenho vetorial ORIGINAL com duas vistas e paths anatômicos editáveis sem tracing de imagens de terceiros. Use as seis referências apenas do acervo privado autorizado localmente (se estiver disponível; sem presumir acesso), e documente a procedência; nunca commite imagens brutas. Gere screenshots em desktop/mobile, teste hitboxes e teclado, reporte overlaps/gaps e resuma antes/depois. Pare se precisar de mídia de terceiro, edição de banco, conflito de worktree, direitos duvidosos ou mudança em produção. Entregue PR Draft e handoff sem merge nem deploy.
```

## Despacho pronto: Codex — dados e fontes (#42 / #50, uma Issue por execução)

```text
Responsável: CODEX, Sol Médio; Alto/Extra Alto apenas se schema/RLS exigir. Inicie Modo planejamento para #42. Faça preflight Git, leia AGENTS.md, docs/SOURCE_PROVENANCE.md, docs/CONTENT_POLICY.md, migrações já aplicadas, proposta 20261106152500 e testes de PGlite. Trabalhe numa branch/worktree exclusiva. Modele sentidos literais/técnicos com evidência por campo, fonte, localizador, significado alternativo e status. Alterações SQL apenas em ambiente LOCAL de teste. Exija testes negativos (anon, tenant, draft, unsupported URLs) e build; não aplique SQL remoto, não crie reviewer, não publique técnicas e não altere flags de produção. Se o ambiente local real falhar ou houver divergência de migração, STOP e preserve evidências. Reporte PR Draft, SHA, status e próxima ação.
```

## Despacho pronto: Gemini — cotejo documental (#44, somente pesquisa)

```text
Responsável: GEMINI, leitura/revisão independente, modelo multimodal disponível de menor custo suficiente. Compare cada termo candidato entre Kukkiwon 2012, páginas oficiais atuais, traduções institucionais e HanRa/PT-BR, preservando grafias e sentidos divergentes. Devolva JSON/CSV com source_id, edition, URL, locator, termo original, Hangul documentado (não inferido), romanization original, significado literal quando documentado, significado técnico, confiança, direitos de reprodução e campos sem evidência. Cite exatamente qual fonte sustenta cada campo e separe hipóteses de fatos; não copie texto extenso, vídeos ou desenhos. Não escreva no Supabase, não declare revisão humana nem faça deploy. Se fonte não acessível, registre BLOCKED e não invente.
```

## Handoff mínimo

```text
HANDOFF PROGRAMATIONS 2.0
Projeto | Issue | Branch | base/HEAD | worktree
Executor / modelo real / esforço | risco | allowed files
Arquivos modificados e status Git
Testes executados com comando e resultado | CI link | warnings e limitações
Evidência visual/documental + fonte
Produção: NÃO alterada (ou evidência explícita do que foi autorizado)
Bloqueios / STOP / conflitos / quota
Próxima ação exata
```

**Referências internas:** [AGENTS.md](../AGENTS.md) · [controle de fontes](SOURCE_PROVENANCE.md) · [atlas original](ORIGINAL_ATLAS_ART.md) · [segurança](../SECURITY.md).
