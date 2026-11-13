# Experiência educacional — 13/11/2026

Objetivo: uma enciclopédia compreensível para alunos e professores. Base `d9a0fcc`,
branch `codex/experience-library-20261113`, worktree exclusiva. Risco MEDIUM
(navegação, projeção de conteúdo e vínculos locais). Execução direta autorizada.

## Diagnóstico e decisão

Capturas reais de `/`, `/atlas`, `/catalogo`, `/poomsae` e `/curriculos` em 375/1440:
`D:/programations/kukkiwon-evidence/experience-20261113/before/`.
Cabeçalho de 132px com onze links, destinos ocultos por rolagem horizontal no
celular, catálogo remoto separado dos 23 termos úteis do Atlas, roteiro longo
antes dos controles de currículo. Não foi detectado overflow horizontal inicial.

Dois protótipos navegáveis em `.../proposals/index.html`: Caderno editorial
(papel/verde, títulos serifados) e Dojang digital (escuro, menu lateral).
Escolha do implementador: Caderno editorial, pela leitura e pelo espaço útil em
celular; tema escuro mantém a mesma estrutura. Não é aceite visual humano.

## Arquitetura e sistema inicial

Início → Biblioteca (sete áreas, busca) → ficha por slug → Atlas por região.
Currículos → editor local/escola → conteúdos da biblioteca; Meu estudo reaproveita
favoritos, pastas e notas. Poomsae, fundamentos, glossário e combate permanecem
acessíveis pelo contexto da biblioteca. Fontes e escola também no rodapé.
Rotas anteriores e IDs permanecem compatíveis.

Tokens sem fontes remotas: papel `#f7f6f0`, painel `#fffefa`, tinta `#213b33`,
verde `#245746`, terracota `#a34632`; texto Segoe UI/system e títulos Georgia.
Hangul usa Malgun Gothic/Apple SD Gothic Neo/system. Grid máximo 1240px,
passos 4/8/12/16/24/32/48/64, alvos >=44px, foco visível, respeito a movimento
reduzido, temas por preferência já existente. Componentes: breadcrumbs, cards,
seções, busca/filtros, ficha e referências por campo.

## Conteúdo e limites

PR #73 integrada: reutilizar os 23 termos e a geometria existente, sem duplicar
dados. PR #74: aproveitar a organização em sete áreas; as 25 fichas Gemini não
entram por sua documentação ainda pendente. PR #75: manter independente; sem
merge automático dos intervalos e sem alterar contratos ou persistência remota.

Argon: PDF e cópia do pacote têm SHA256
`38dcec3822fc052c98554122b438d3db7b262f85ca390063f0ec4a7b8f1cd226`.
380 linhas, oito grupos documentais, 334 páginas. Preservar células, variantes
brutas, referências e páginas em matriz LOCAL. Correspondência de slug é apenas
candidata, nunca equivalência aprovada. O total 152 de aliases não é uma lista
independentemente conferida. A divergência 327/40/13 versus classes impressas
357/12/9/1/1 permanece registrada. Nenhum dado Argon vira público por inferência.

## Plano de implementação e verificação

- [x] Biblioteca: derivar fichas da projeção existente; busca PT/Hangul/aliases,
  sete áreas e estados vazios úteis; testar filtro, URLs e relações válidas.
- [x] Layout e fluxo: tokens, navegação móvel, home, ficha e retorno do Atlas;
  testar teclado, favoritos, histórico e 375/768/1440 claro/escuro.
- [x] Currículos: ações antes do roteiro; vincular termos locais documentados
  preservando requisitos antigos e catálogo remoto; testar salvar/recarregar.
- [x] Argon: comando offline com saída externa e matriz de todos os 380 IDs,
  células/variantes/referências preservadas, correspondências separadas e testes
  negativos de saída em diretórios públicos.
- [x] TypeScript/Astro, build, testes unitários e Playwright relevantes; imagens
  antes/depois e revisão independente. Handoff de commits/CI na Draft PR da #65.

STOP: qualquer necessidade de produção, credenciais, conflito de ownership ou
publicação editorial. `src/lib/school-api.ts` não será lido nem modificado;
exceção de continuação independente autorizada no chat. Scanner mantido nos
demais arquivos. Sem alteração de auth, RLS, flags, banco ou deploy.

Próximos lotes: reconciliar famílias/bases; depois pé/perna; Poomsae somente por
passo/edição documentados. Matchuo e Palgwae não recebem sequências inferidas.
Concluir software exige fluxo visual funcional, não apenas compilação. Revisão
humana dos novos candidatos e homologação de produção são pendências separadas.

## Evidência da entrega

`npm ci --ignore-scripts`, `content:check`, `research:audit`, `sources:audit`,
`npm run check` e build de produção PASS. Astro/TS: zero erros, dois hints
preexistentes do fallback `MediaQueryList.addListener`. Unitários: 281 PASS.
Playwright: 80 PASS na regressão de Atlas/fluxo/currículos; 54 PASS na rodada de
auth/temas/inspector/fluxo (22 comuns); os 22 testes do fluxo foram repetidos e
passaram após os ajustes finais. Serviços escolares simulados; sem login real
nem gravação de produção. Leitor de tela real não testado; teclado, nomes
acessíveis e toque foram verificados no Chromium.

30 capturas posteriores (cinco páginas × três larguras × dois temas) em
`D:/programations/kukkiwon-evidence/experience-20261113/after/`: sem overflow
horizontal ou erro JS observado. [Comparação da home](assets/experience-comparison.png).
Worker oficial consultado somente para leitura, HTTP 200; nenhuma implantação.

Matriz privada `.../argon-reconciliation.json` e CSV: 380 IDs/334 páginas,
67 candidatos com slug igual em projeção pública, lotes locais ou PR #74;
313 sem correspondência exata. Essa contagem não significa 67 identidades
aprovadas. Preservadas variantes brutas e todas as páginas/links do pacote.
Para reproduzir: `node scripts/argon-reconciliation.mjs --source PASTA_PACOTE
--output CAMINHO_EXTERNO.json [--prior-library JSON_PR74]`. Apenas `.json` é
aceito para a saída integral; JSON/CSV são verificados como destinos distintos
antes da escrita. Nenhum PDF, célula bruta ou candidato novo entrou no bundle.

Revisão independente encontrou um atalho sem alvo em áreas diferentes da mão
e colisão potencial do JSON/CSV com extensão incorreta. Ambos corrigidos;
teste de extensão falhou antes da correção e passou depois. Decisões do
implementador: manter as seis áreas sem fichas novas com links a materiais
existentes, preservar PRs #74/#75 independentes e deixar aliases/integridade
semântica Argon para revisão por campo. Não confundir revisão de código com
aceite visual humano, validação anatômica ou editorial.

Conferência final: `seun-pyeonjumeok` não tem fonte individual na projeção
existente. A ficha agora informa essa ausência e mantém Hangul ausente;
regressão reproduzida e corrigida em desktop/mobile (dois testes adicionais).

CI remota: o teste de caminho foi tornado independente do nome da worktree.
A suíte completa seguinte passou 152/154 casos e identificou o acesso direto
a Kyorugi ausente na home; o link foi restaurado no rodapé, mantendo o menu
principal curto. O resultado da execução sucessora está no handoff da PR.
