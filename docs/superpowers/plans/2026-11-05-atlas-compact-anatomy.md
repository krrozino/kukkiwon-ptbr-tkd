# Atlas compact anatomy implementation plan

**Goal:** entregar painel compacto, vistas espelhadas e recortes refinados.
**Architecture:** preservar a interação da V2.3; ajustar `DetailMap`, geometria
SVG local em `surfaces.ts` e estilos do inspetor.
**Tech Stack:** Astro, React, TypeScript, SVG, Playwright.
**Spec:** `docs/superpowers/specs/2026-11-05-atlas-compact-anatomy-design.md`.

## Global constraints

- Uma PR; sem deploy, migrações ou alteração de conteúdo editorial.
- Zonas ilustrativas sem romanização, hangul ou ficha técnica.
- Manter seleção no primeiro toque, legenda e altura fixa do painel.

## Review focus

- Região publicada seguida de uma ilustrativa: não exibir ficha da anterior.
- Mudança de postura/vista: não deixar seleção ou tooltip de recorte invisível.
- Espelhamento: manter hit testing e conector alinhados ao desenho.
- Geometria: não deixar áreas pintadas fora da silhueta ou grandes lacunas.
- Painel rico: permitir acesso real à ficha por toque e teclado.

## Task 1 — Painel compacto e dados publicados

- [x] Adicionar teste de texto compacto e nenhuma consulta técnica em zona ilustrativa.
- [x] Adicionar teste do painel rico e navegação do link na região publicada.
- [x] Observar falha nos novos testes antes da implementação.
- [x] Ajustar `src/components/atlas/DetailMap.tsx` e estilos específicos do painel.

## Task 2 — Geometria e interação

- [x] Adicionar testes de orientação visível, cobertura e limites dos recortes.
- [x] Adicionar regressão de toque e painel estável ao alternar vistas/posturas.
- [x] Observar falha nos novos testes antes da implementação.
- [x] Refinar `surfaces.ts`, aplicar espelhamento único no grupo e clipping.
- [x] Conferir as capturas comparativas no desktop e celular.

## Task 3 — Verificação e entrega

- [x] `npm run check` e `npm test`: sem erros.
- [x] `npm run test:ui`: todos os cenários desktop/mobile aprovados.
- [x] Revisão independente do diff; corrigir problemas bloqueantes.
- [ ] Commit, push da branch e uma PR para `main`; observar resultado da CI.

Expected: configurações, credenciais, banco, registros editoriais e publicação
oficial permanecem intocados. Nenhuma execução do workflow manual de deploy.


## Evidências

- Cinco cenários novos falharam antes da implementação.
- 66 testes de interface aprovados em desktop/celular; 49 testes locais aprovados.
- Revisão independente verificou cobertura sem lacunas/sobreposições nas seis combinações de mão/punho/pé e vista.
- O problema de Tab identificado na revisão ganhou regressão RED e correção: foco por teclado preserva a ficha selecionada.
- O conector lateral permanece no espaço externo reservado; a linha inferior acompanha o espelhamento.

