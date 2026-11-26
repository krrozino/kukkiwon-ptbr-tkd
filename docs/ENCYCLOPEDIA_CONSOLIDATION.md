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

## PRs anteriores

| PR | Evidência e decisão |
| --- | --- |
| #67, #70 | A navegação de visitante, a Biblioteca e os currículos seguem a implementação mais recente das #77 e #81. A #70 depende da #69 e tem contratos de interface anteriores à integração. Candidatas a encerramento manual após conferir os heads preservados. |
| #69 | O blob `ccb74667f02e97d64c9c9bb50c7a12d371e735ef`, em `e58d80b:content/research/gemini-library-candidates.json`, contém oito candidatos, incluindo seis registros Sebon e dois Palgwae. Útil para localizar referências em revisão. Conservar o head original com o material, pois os passos, aliases e pronúncias exigem cotejo por campo e parte das sequências depende da escola. |
| #71 | Recuperados CLI, testes e documentação para a conferência de um JSON isolado. A reconciliação já existente serve quando o pacote original completo está disponível. A saída opcional usa a proteção existente e exige arquivo novo fora da worktree. |
| #74 | As sete áreas e fichas atuais vieram pelas #77 e #81. A nota exclusiva descreve o recorte antigo de 48 itens e documenta a origem dos candidatos da #69. Preservada no head `8f174ec`. Candidata a encerramento manual. |
| #75 | Os intervalos por escola estão no código atual, inclusive em `c0949a1`. A nota exclusiva de `6d0784d` descreve os presets de sua própria branch. Candidata a encerramento manual, mantendo a nota histórica no head original. |
| #80 | O head `c0949a1` é ancestral da `main` pelo merge da #81. Candidata a encerramento manual. |
| #82–#85 | Pilotos encadeados, consolidação do Taegeuk 1 e pesquisa do Taegeuk 2. Integrar por escopo na candidata. Preservar heads, PRs e artefatos de pesquisa locais. |
| #26, #28, #89 | Abertas. Atualizações de Actions, TypeScript e npm seguem revisão independente. |

## Próxima ação

Portar a #85 e o trabalho exclusivo das #83 e #84. Verificar o isolamento do laboratório nas rotas e no pacote público.
