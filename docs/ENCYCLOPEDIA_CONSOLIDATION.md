# Consolidação da enciclopédia V2

## Checkpoint de 26/11/2026

- Base confirmada no GitHub: `main@3229e058c482628ec356f901a17639b383a28d81`. A #92 já está integrada. Na base, `validate` e Vercel passaram e SonarCloud registrou falha.
- Candidata: `codex/enciclopedia-consolidacao-v2`, em um clone isolado em `/workspace/work/kukkiwon-ptbr-tkd`. O `HEAD` e a lista de commits são obtidos com `git rev-parse HEAD` e `git log --oneline origin/main..HEAD`.
- Risco médio para integração e navegação. Alterações no isolamento do laboratório exigem testes negativos em build público. Decisões editoriais de publicação e divergências técnicas dependem de revisão humana.
- Registro de produto existente: [#78](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/78). Frentes relacionadas: [#45, Poomsae](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/45), [#65, Biblioteca e currículos](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/65), [#68, Argon](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/68), [#79, contraste](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/79), [#50, fontes](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/50) e [#41, Atlas](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/41).
- Governança do projeto e relatório do Atlas conferidos. A documentação global do Programations 2.0 fora do repositório e o Notion não estavam conectados.

## Ambiente Windows

O ambiente desta operação é Linux. O [inventário anterior do Atlas](atlas-refinement/atlas-corporal-consolidado-issue-41.md#4-inventário-de-armazenamento-e-plano-seguro-de-limpeza-fase-0) documenta a última medição disponível, anterior à limpeza mencionada pelo mantenedor. As pastas de `D:\programations` continuam pendentes de verificação local.

`codex/poomsae-conferencia-documental@6a10385` não está entre as referências remotas nem foi encontrado no clone ou na API de commits. A equivalência textual ainda precisa ser conferida a partir do Windows. Preservar essa worktree e seus arquivos ignorados antes de qualquer ação de limpeza.

## Próxima ação

Conferir diferenças das PRs históricas em relação à base atual e preservar o material único de pesquisa. Em seguida, portar a #85 e o trabalho exclusivo de #83 e #84, verificando o isolamento do laboratório.
