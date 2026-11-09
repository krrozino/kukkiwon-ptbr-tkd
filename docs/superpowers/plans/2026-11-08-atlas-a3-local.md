# Atlas A3 — consulta documental local

**Objetivo:** ligar a documentação da PR #59 às regiões existentes da mão, sem distribuir pesquisa no build público.
**Base:** `6564cb0d77e6df57fb2365faa7e2c328c9b9c4c6`, branch própria `feat/atlas-a3-documentation-lab`, Issue #61.
**Execução:** autônoma conforme o pedido do mantenedor; implementação nesta sessão. Risco MEDIUM (fronteira editorial e integração de interface).

## Decisões e limites

- Reutilizar o alias de desenvolvimento do laboratório: nova entrada `/atlas-mao-local` com implementação substituída por componente vazio no build. Flags públicas não habilitam pesquisa.
- Consumir diretamente `validateHandMatrix`, `handRegionDocumentation` e `handTermDocumentation`; não editar o contrato nem o JSON/CSV original.
- Acrescentar somente um ponto opcional de renderização no inspector atual. Preservar comportamento público, seleção, fontes, altura e geometria da #58.
- Renderizar cada afirmação e sentido com sua fonte, localizador, contexto, idioma, conferência documental e distinção editorial. Ausência vira pendência.
- Manter 19 slugs e dez regiões ilustrativas. Busca documental dos 23 termos, com filtro para os 14 sem geometria, sem hotspots adicionais.
- Usar CSS local respeitando `html[data-theme]`. Nenhuma mudança em surfaces, BodyRegionMap ou geometria da #60.
- A associação visual final depende da geometria revisada pelo Antigravity; esta entrega usa os mapeamentos propostos da #59.
- Não executar merge/deploy, operação remota Supabase, migração, promoção editorial, Firecrawl ou API paga. Docker autorizado pelo pedido atual, desnecessário neste escopo.

## Etapas e evidências

- [x] Recuperar nesta pasta, conferir Git/remotos/GitHub, ler contrato e políticas após scanner de segredos.
- [x] Instalar dependências fixadas com `npm ci --ignore-scripts`; criar `.env` somente com placeholders e flags desativadas.
- [x] Registrar baseline de auditorias, check, Vitest, build e Playwright pertinente.
- [x] Escrever testes de renderização documental (nove vínculos, dez ilustrações, lacunas, fontes por afirmação, nenhum estado publicado) e guard contra fragmentos órfãos. Falhas antes do componente/rota e regressão de falso campo pendente reproduzidas antes das respectivas implementações.
- [x] Implementar painéis documentais, entrada local, busca e ponto opcional no inspector; obter GREEN.
- [x] Escrever/executar Playwright local para mouse, toque, teclado, busca, fontes, mobile 375/desktop 1280 e temas; capturar evidências locais.
- [x] Executar regressões públicas da #58 e teste explícito de exclusão no build público.
- [x] Revisar diff de forma independente, registrar resultados e limitações e preparar entrega em commits organizados.

Entrega autorizada pelo pedido: push de branch própria e PR Draft empilhada sobre #59 (Refs #61), sem merge/deploy. Resultados: Vitest 261/261, Playwright público 122/122, laboratório 18/18; detalhes e limitação ambiental em `docs/research/2026-11-08-atlas-a3-handoff.md`.

## Critérios de parada

Segredo detectado antes de leitura; conflito com trabalho local/posse de arquivos; necessidade de mudar arte reservada; operação privilegiada/produção; evidência documental inválida. Preservar arquivos e comunicar bloqueio real.
