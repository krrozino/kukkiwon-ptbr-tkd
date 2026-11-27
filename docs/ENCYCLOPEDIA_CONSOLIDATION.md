# Consolidação da enciclopédia V2

## Operação Intensiva II

- Candidata empilhada: `codex/enciclopedia-expansao-v3`, base `c61c9bfa4ba9e0eb6b1ed7a75e7dcad388b5cb2f`. PR #93 permanece em Draft sobre `main@3229e058`, mergeável, com validate obrigatório, SonarCloud e Vercel verdes. O parecer de coordenação autoriza a avaliação funcional pelo mantenedor. A integração ainda depende de autorização específica.
- Worktree Linux reaproveitada: `/workspace/work/kukkiwon-ptbr-tkd`. Preflight limpo e dependências existentes. Medição inicial: 581 MiB no checkout, incluindo 500 MiB em dependências e 37 MiB em `review-output`. Navegadores Playwright: 681 MiB fora do checkout. Os comandos da seção Ambiente Windows continuam válidos para verificação local.
- #77 e #81 estão integradas. A tabela anterior conserva as decisões para #67, #69, #70, #71, #74, #75, #80 e #82–#85. As notas históricas exclusivas de #74 e #75 permanecem em seus respectivos heads. O blob Gemini da #69 contém oito candidatos. A #93 contém triagem e reconciliação Argon em CLIs distintas.
- A reconferência Linux do Taegeuk 2 continua em `review-output/taegeuk-2-jang.reconferencia.json`. A cópia original da #83 e `6a10385` seguem pendentes de verificação no Windows. Nenhuma cópia local foi substituída.
- Fases 3–4: modelo v2 compartilhado com percurso Ga/Na/Da/Ra ou códigos textuais próprios, fontes por campo, transições e cobertura parcial. `POOMSAE_RESEARCH_DIR` lê um diretório privado de JSONs e `POOMSAE_RESEARCH_FILE` continua a aceitar o v1. O exportador reutiliza a leitura e interrompe a gravação se houver entrada incompatível. A reconferência Linux do Taegeuk 2 foi exportada com as duas leituras da etapa 14. O Taegeuk 1 usa a mesma grade e posição inicial do piloto. Validação direcionada de esquema e tipos aprovada.
- Fases 5–6: conferência dos seis Taegeuk restantes, trechos iniciais de Koryo e Keumgang e localização das sete formas Dan restantes. O material de estudo fica em `review-output/op2-dossiers/`. Ver cobertura, convenções e pendências abaixo. Questões relacionadas: #45, #50, #65, #68 e #78.

- Fases 7–8: índice local agrupado por família, indicação de cobertura, foco e etapa persistente. Os cenários sintéticos percorrem Taegeuk e Dan em dois tamanhos e temas. A execução com a reconferência privada preservou as 18 etapas, 23 ações e a divergência da etapa 14. O teste de build fornece os JSONs sintéticos no ambiente e verifica 404 nas 17 rotas.

- Fases 9–14: 33 fichas adicionais em Kibon Dongjak (22), Sonkisul (3), Balkisul (6) e Matchuo Kyorugi (2). A edição inglesa de terminologia de 2011 com prefácio de 2012 foi cotejada por verbete. As famílias e variantes mantêm identidades distintas. A ficha de Kyorugi aponta para a edição WT com vigência inicial em 01/06/2026. A ficha de Matchuo orienta o registro por escola. O aprofundamento de Gyeokpa entra nas fichas do Iron.

### Cobertura documental da expansão

| Forma | Daegu etapas/ações | Cobertura no laboratório Linux | Reprodução EMC v20 | Pendência técnica |
| --- | ---: | --- | --- | --- |
| Taegeuk 1 | 18/20 | 18 etapas e 20 ações | pp. 53–64 | Conferência docente das direções e transições corrigidas |
| Taegeuk 2 | 18/23 | 18 etapas e 23 ações | pp. 66–81 | Comparar original da #83 e as duas leituras da etapa 14 |
| Taegeuk 3 | 20/34 | 20 etapas e 34 quadros | pp. 83–105 | Confirmar os membros executantes que a legenda deixa implícitos |
| Taegeuk 4 | 20/29 | 20 etapas e 29 quadros | pp. 107–126 | Conferir direção nas etapas 7–8 e a ação adicional nas legendas de 2 e 4 |
| Taegeuk 5 | 20/32 | 20 etapas e 32 quadros | pp. 128–149 | Etapa 15 indica Ra 2 em coreano e Ra 1 em inglês. Conferir também a etapa 18 e a origem da outra contagem de 33 |
| Taegeuk 6 | 19/31 | 19 etapas e 31 quadros | pp. 151–167 | Conferir as mudanças de direção dentro das etapas 6 e 12 |
| Taegeuk 7 | 25/33 | 25 etapas e 37 quadros | pp. 169–190 | Conciliar quatro quadros adicionais na convenção visual e conferir fases preparatórias |
| Taegeuk 8 | 27/38 | 27 etapas e 40 quadros | pp. 192–215 | Conciliar dois quadros adicionais e conferir a decomposição das etapas 3 e 19 |
| Koryo | 30/45 | Trecho inicial de 5 etapas e 7 quadros | pp. 218–249 | Completar a leitura do percurso e a sequência |
| Keumgang | 27/35 | Trecho inicial de 7 etapas e 7 quadros | pp. 251–267 | Completar o cotejo com o percurso 山 |
| Taebaek | 26/38 | Ficha contextual e fonte localizada | pp. 269–293 | Cotejar sequência |
| Pyongwon | 21/25 | Ficha contextual e fonte localizada | pp. 295–312 | Cotejar sequência |
| Sipjin | 28/31 | Ficha contextual e fonte localizada | pp. 314–342 | Cotejar sequência |
| Jitae | 28/37 | Ficha contextual e fonte localizada | pp. 344–364 | Cotejar sequência |
| Cheonkwon | 26/27 | Ficha contextual e fonte localizada | pp. 366–392 | Cotejar sequência |
| Hansu | 27/34 | Ficha contextual e fonte localizada | pp. 394–412 | Cotejar sequência |
| Ilyeo | 23/27 | Ficha contextual e fonte localizada | pp. 414–428 | Cotejar sequência |

Todos os estudos detalhados permanecem em revisão docente e linguística. A cobertura registra quadros numerados únicos. Preparação, retorno e vistas alternativas ficam fora da contagem. Os quadros compostos podem incluir fases preparatórias. A coluna Daegu registra a convenção de ações independente. A reprodução v20 é uma compilação de Edgardo Alberto Leiva, com lâminas identificadas como Kukkiwon Education Media Center. A confirmação direta do volume de 2022 ainda falta. [Reprodução v20](https://www.santafemarcial.com.ar/taekwondo/tkd-vocabulario-completo-v20.pdf) · [Índice coreano Kukkiwon](https://kukkiwon.or.kr/base/board/list?boardManagementNo=37&menuLevel=3&menuNo=62) · [Tabela Daegu](https://daegutkd.net/taekwondo/skill.php).

Com os JSONs no diretório ignorado, use o comando abaixo no checkout Linux. Para exportar a revisão, use as mesmas variáveis e execute `node scripts/export-poomsae-review.mjs`. O arquivo de saída permanece em `review-output/revisao-docente-taegeuk-1-e-2.md` por compatibilidade e inclui todos os dossiês fornecidos.

```sh
POOMSAE_RESEARCH_FILE=review-output/taegeuk-2-jang.reconferencia.json \
POOMSAE_RESEARCH_DIR=review-output/op2-dossiers \
npm run dev -- --host 127.0.0.1
```

## Checkpoint de 26/11/2026

- Base confirmada no GitHub: `main@3229e058c482628ec356f901a17639b383a28d81`. A #92 já está integrada. Na base, `validate` e Vercel passaram e SonarCloud registrou falha.
- Candidata: `codex/enciclopedia-consolidacao-v2`, em um clone isolado em `/workspace/work/kukkiwon-ptbr-tkd`. O `HEAD` e a lista de commits são obtidos com `git rev-parse HEAD` e `git log --oneline origin/main..HEAD`.
- Risco médio para integração e navegação. Alterações no isolamento do laboratório exigem testes negativos em build público. Decisões editoriais de publicação e divergências técnicas dependem de revisão humana.
- Registro de produto existente: [#78](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/78). Frentes relacionadas: [#45, Poomsae](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/45), [#65, Biblioteca e currículos](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/65), [#68, Argon](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/68), [#79, contraste](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/79), [#50, fontes](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/50) e [#41, Atlas](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/41).
- Governança do repositório, relatório do Atlas, Programations 2.0 vigente (revisão de 24/11) e roadmap do projeto no Notion consultados. A [PR Draft #93](https://github.com/krrozino/kukkiwon-ptbr-tkd/pull/93) reúne a candidata.

## Ambiente Windows

O ambiente desta operação é Linux. O [inventário anterior do Atlas](atlas-refinement/atlas-corporal-consolidado-issue-41.md#4-inventário-de-armazenamento-e-plano-seguro-de-limpeza-fase-0) documenta a última medição disponível, anterior à limpeza mencionada pelo mantenedor. As pastas de `D:\programations` continuam pendentes de verificação local.

`codex/poomsae-conferencia-documental@6a10385` não está entre as referências remotas nem foi encontrado no clone ou na API de commits. A equivalência textual ainda precisa ser conferida a partir do Windows. Preservar essa worktree e seus arquivos ignorados antes de qualquer ação de limpeza.

Para medir e conferir no Windows, use PowerShell no checkout principal. Os comandos abaixo apenas consultam e medem:

```powershell
$principal = 'D:\programations\kukkiwon site'
$pastas = @(
  $principal,
  'D:\programations\kukkiwon-atlas-cabeca-90-visual',
  'D:\programations\kukkiwon-taegeuk-1-consolidacao',
  'D:\programations\kukkiwon-poomsae-estudo',
  'D:\programations\kukkiwon-taegeuk-2-docs',
  'D:\programations\kukkiwon-taegeuk-2-piloto',
  'D:\programations\kukkiwon-poomsae-conferencia',
  'D:\programations\kukkiwon-evidence'
)
git -C $principal worktree list --porcelain
foreach ($pasta in $pastas) {
  if (-not (Test-Path -LiteralPath $pasta)) { continue }
  $tamanho = Get-ChildItem -LiteralPath $pasta -Recurse -Force -File | Measure-Object Length -Sum
  [pscustomobject]@{ Caminho = $pasta; MiB = [math]::Round($tamanho.Sum / 1MB, 2) }
  if (Test-Path -LiteralPath (Join-Path $pasta '.git')) {
    git -C $pasta status --short --untracked-files=all --ignored=matching
    git -C $pasta log --oneline HEAD --not --remotes=origin
  }
}
```

Se o head local existir, preserve-o antes de comparar o diff com `origin/codex/poomsae-estudo-visual` e `origin/codex/taegeuk-1-consolidacao-45`. O bundle abaixo deve ser novo e mantido com as evidências privadas. O bundle cobre commits, e os arquivos ignorados exigem cópia separada.

```powershell
$conferencia = 'D:\programations\kukkiwon-poomsae-conferencia'
$bundle = 'D:\programations\kukkiwon-evidence\poomsae-conferencia-documental.bundle'
if (Test-Path -LiteralPath $bundle) { throw 'Já existe um bundle neste caminho.' }
git -C $conferencia bundle create $bundle refs/heads/codex/poomsae-conferencia-documental
git -C $conferencia bundle verify $bundle
git -C $conferencia show --stat --oneline 6a10385
```

Com a medição atualizada e autorização específica, `git -C $principal worktree remove 'D:\programations\kukkiwon-atlas-cabeca-90-visual'` é candidato para a worktree da #92, desde que a conferência acima confirme histórico e arquivos preservados e ninguém esteja usando a pasta. Em worktrees inativas das #82–#84, pode-se remover somente `node_modules` por caminho literal após conferência. As estimativas de espaço do relatório de 24/11 antecedem a limpeza anterior e precisam de nova medição.

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

## Cobertura de Poomsae

| Forma | Etapas / ações na tabela Daegu | Material localizado e estado na candidata |
| --- | --- | --- |
| Taegeuk 1 | 18 / 20 | Lâminas EMC v20, pp. 53–64. Sequência da #85 integrada ao laboratório, com bases, lateralidade, quadros, direções e foco. Revisão docente pendente. |
| Taegeuk 2 | 18 / 23 | Lâminas EMC v20, pp. 66–81, e GEN008, p. 9, fig. 5. Preparação e retorno separados, cinco etapas compostas e vistas laterais complementares. Leitor da #84 integrado. Cópia local de conferência reconstruída a partir das fontes, com divergência do movimento 14 em aberto. |
| Taegeuk 3 | 20 / 34 | Lâminas EMC v20, pp. 83–105, e GEN008, p. 10, fig. 6. Contagem e localização registradas. Cotejo por etapa pendente. |
| Taegeuk 4 | 20 / 29 | Lâminas EMC v20, pp. 107–126, e GEN008, p. 11, fig. 7. Contagem e localização registradas. Cotejo por etapa pendente. |
| Taegeuk 5 | 20 / 32 | Lâminas EMC v20, pp. 128–149, e GEN008, p. 15, fig. 10. Uma referência visual anterior numera até 33, com edição e regra de contagem ainda a identificar. |
| Taegeuk 6 | 19 / 31 | Lâminas EMC v20, pp. 151–167, e GEN008, p. 16, fig. 11. Contagem e localização registradas. Cotejo por etapa pendente. |
| Taegeuk 7 | 25 / 33 | Lâminas EMC v20, pp. 169–190, e GEN008, p. 17, fig. 12. Contagem e localização registradas. Cotejo por etapa pendente. |
| Taegeuk 8 | 27 / 38 | Lâminas EMC v20, pp. 192–215, e GEN008, p. 18, fig. 13, com tabela parcial na página consultada. Cotejo por etapa pendente. |

A contagem e os localizadores foram conferidos em 26/11/2026 no exemplar v20, na tabela de Daegu e na cópia indexada do GEN008. A requisição direta ao PDF universitário retornou HTTP 400 neste ambiente. [Kukkiwon · índice de Poomsae, Board 55](https://www.kukkiwon.or.kr/eng/board/list?boardManagementNo=55&menuLevel=3&menuNo=72) · [Education Media Center, reprodução de Edgardo Alberto Leiva, v20](https://www.santafemarcial.com.ar/taekwondo/tkd-vocabulario-completo-v20.pdf#page=66) · [Guia GEN008 da Dong-A University](https://dms.donga.ac.kr/sites/cle/download/class1/GEN008%20%EA%B5%90%EC%96%91%ED%95%84%EC%88%98%20%EA%B0%95%EC%9D%98%EC%A7%80%EC%B9%A8%EC%84%9C%28%ED%83%9C%EA%B6%8C%EB%8F%84%29%20-%20%EC%98%88%EC%B2%B4%EB%8A%A5%EA%B3%84%EC%97%B4.pdf#page=9) · [Daegu · tabela 공인품새](https://daegutkd.net/taekwondo/skill.php).

As contagens divulgadas no índice seguem as colunas da tabela de Daegu. A identificação das fontes de Taegeuk 3–8 registra cobertura documental preliminar. O vol. 3 da coleção Kukkiwon de 2022 ainda precisa de consulta direta para comparação de edição. [Anúncio dos volumes](https://m.kukkiwon.or.kr/eng/board/read?boardManagementNo=49&boardNo=1688&menuLevel=2&menuNo=91&page=11).

Formas Dan com ficha contextual e contagem registrada em Daegu: Koryo (30/45), Keumgang (27/35), Taebaek (26/38), Pyongwon (21/25), Sipjin (28/31), Jitae (28/37), Cheonkwon (26/27), Hansu (27/34) e Ilyeo (23/27). A seção de formas superiores da reprodução EMC começa na p. 216. O cotejo de cada sequência e de sua convenção de percurso segue como pesquisa.

### Reprodução local e revisão docente

Execute `npm run dev -- --host 127.0.0.1` para consultar o Taegeuk 1. Para o Taegeuk 2 use o dossiê original da #83 com a variável de processo `POOMSAE_RESEARCH_FILE`. O comando `node scripts/export-poomsae-review.mjs` usa a mesma variável e gera a ficha em `review-output`. Nesta sessão a conferência independente foi armazenada em `review-output/taegeuk-2-jang.reconferencia.json`, dentro da worktree Linux. A cópia original do Windows preserva eventuais campos ou anotações adicionais. As duas rotas de estudo só são registradas no comando Astro de desenvolvimento.

## Biblioteca, Iron e Glossário

- Biblioteca com 128 fichas em sete áreas. As 105 fichas preexistentes conservam slugs. A listagem agrupa áreas e famílias, com ordenações alternativas e busca persistente. Matchuo Kyorugi abriga Sebon, Dubon, Hanbon e Anjoa como práticas de escola. Palgwae mantém a coleção histórica.
- Iron com 35 fichas, incluindo 23 novas com fontes por seção. Os três níveis permanecem e os assuntos agrupam as fichas. O bloco teórico cobre história no Brasil, instituições, etiqueta, certificação, Poomsae, equipamentos, preparação física geral e segurança.
- O Glossário tem 15 palavras e três expressões em revisão e zero entradas homologadas. Os novos links de ficha exigem aprovação individual, fonte e slug explícito. A operação preserva as duas bases editoriais.

## Próxima ação

Validar o HEAD da #93 e abrir a prévia pública para revisar os fluxos de Biblioteca, Iron e Poomsae. Para a revisão de execução e nomenclatura, abrir a ficha docente local e conferir a divergência de deslocamento do Taegeuk 2 antes de qualquer decisão editorial.
