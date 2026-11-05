# Finalização da cadeia de PRs

Escopo: finalizar o fluxo editorial existente e validar migração/API/atlas sem alterar Supabase remoto, publicar técnicas, fazer deploy ou merge na main.

## Estado inicial conferido

| PR | Entrega | Base | Situação inicial |
| --- | --- | --- | --- |
| #1 | Astro/React, banco inicial e Worker separado | main | Draft, CI aprovada |
| #4 | Catálogo/fichas, atlas inicial e integridade de fontes | branch da #1 | Draft, CI aprovada |
| #7 | Primeiro lote de 20 registros | branch da #4 | Draft, CI aprovada |
| #9 | Sprint 01: 85 candidatos, busca paginada e atlas | branch da #7 | Draft, CI aprovada |
| #10 | Exportação de 105 fichas para revisão humana | branch da #9 | Draft, CI aprovada |

Não havia revisões/comentários pendentes nas cinco PRs. O GitHub indicava todas sem conflitos. Essas informações descrevem o momento da conferência, não autorização para integrar.

## Plano de fechamento

- [x] Revisar o exportador da #10, executar a suíte e comprovar que a exportação não sobrescreve respostas.
- [x] Gerar os pacotes de revisão sem aprovar conteúdo.
- [x] Validar as migrações sobre o estado legado em PostgreSQL e PostgREST locais: 105 rascunhos, busca, paginação, permissões e atlas.
- [x] Executar desktop/mobile com chamadas à API local real, além da suíte existente.
- [x] Preparar o pacote estático Cloudflare em dry run, sem envio.
- [x] Registrar evidências e explicitar as autorizações ainda necessárias.

## Limite do ambiente local

Esta máquina não tem Docker, WSL ou PostgreSQL instalados. O Supabase CLI exige um runtime de contêiner para a stack local completa. Não foi instalado Docker/WSL nem criada branch/projeto Supabase remoto. A alternativa de validação usa PostgreSQL portátil e PostgREST em loopback, com roles/RLS equivalentes para o catálogo. Isso cobre banco e Data API; não homologa Kong, Supabase Auth, Storage ou a infraestrutura hospedada.

## Evidências finais

| Verificação executada | Resultado |
| --- | --- |
| Instalação reprodutível com npm ci | Aprovada; dependências sem vulnerabilidades conhecidas na auditoria executada |
| Validação de conteúdo | 105 registros, zero erros; 85 research e 20 document_checked herdados, todos draft |
| Astro/TypeScript | Zero erros, avisos e hints |
| Testes unitários/dados/CLI | 36 aprovados |
| Playwright com fixtures | 22 aprovados: 11 desktop e 11 mobile |
| PostgreSQL 17.11 + PostgREST 16.5 | Sete verificações de migração, REST, permissões, busca, atlas e preservação dos rascunhos |
| Playwright com API real local | Seis aprovados: três desktop e três mobile |
| Cloudflare Worker local | Smoke desktop e mobile aprovados, zero requisições externas |
| Wrangler dry run | 18 assets lidos; sem upload, cron ou bindings |
| git merge-tree / ancestralidade | Cadeia linear, integração simulada sem conflitos; nenhum merge realizado |

O teste REST conferiu anon e authenticated, com leitura dos rascunhos vazia e tentativa de escrita bloqueada nas oito tabelas. Os filtros foram aplicados a 1.006 fixtures públicas sintéticas, permitindo verificar página acima de 1.000, português sem acentos, Hangul NFC/NFD, aliases, família e região. Os 105 registros de pesquisa permaneceram rascunhos antes e depois dos testes.

A revisão dos scripts de validação encontrou dois ajustes operacionais, já corrigidos: propagação de erro de inicialização para executar a limpeza e registro da versão real do PostgREST. Foi simulado um executável inválido e confirmado o encerramento do cluster correspondente. Não restaram bloqueantes identificados no escopo conferido.

Os resultados locais em `.local-validation/latest.json` e `.preview-build/smoke.json` são gerados pelos próprios comandos, sem credenciais reais. Os testes de integração nativa são adicionais e opcionais; a CI comum executa conteúdo, Astro/TS, testes unitários, build, preparação dry run e a suíte de interface com fixtures.

## Revisão editorial concluída

A revisão independente do diff original da #10 não encontrou bloqueantes. O revisor gerou e leu o CSV com um leitor independente: 105 linhas, 31 colunas, fontes/localizadores presentes e todas as decisões pendentes. A cobertura foi complementada com execução real do CLI: cria um arquivo novo, recusa a segunda gravação e mantém seu conteúdo intacto.

Pacotes já gerados em `review-output/`, fora do Git:

- `revisao-geral-integracao-2026-11-04.csv`: 105 fichas.
- `chutes-expansao-integracao-2026-11-04.csv`: 12 fichas da expansão.

Isso finaliza a ferramenta e o procedimento de encaminhamento. As pessoas qualificadas ainda precisam preencher as avaliações. Não há importação automática das respostas nem promoção de estados editoriais.

## Caminho de integração sem duplicação

Foi conferida a ancestralidade de todos os heads e simulada a integração com `git merge-tree`, sem mudar branches ou fazer merge. A main é ancestral de toda a cadeia; os commits originais estão preservados.

Após autorização, executar **uma PR por vez**:

1. Integrar #1 na main com **merge commit**, preservando seus commits.
2. Redirecionar a base da #4 para main, conferir que o diff contém apenas a #4 e integrar com merge commit.
3. Repetir para #7, depois #9 e por último #10, sempre mudando a base somente após integrar a anterior.
4. Conferir CI e conflitos antes de cada merge. Não excluir a branch base enquanto a PR seguinte ainda depender dela.

**Evitar squash e rebase merge nas PRs inferiores desta cadeia.** Eles reescrevem a identidade dos commits e podem fazer mudanças já integradas reaparecerem nos diffs seguintes. Não fazer cherry-pick do código de uma PR para outra.

Nenhuma base foi redirecionada e nenhuma PR foi integrada nesta execução. A integração do código pode preservar os 105 rascunhos; a aprovação do conteúdo é outra etapa e não precisa ser simulada para integrar a aplicação.

## Próxima prévia Cloudflare

`npm run preview:prepare` gera `.preview-build/site/`, executa o Wrangler somente com `--dry-run` e grava um manifesto local. A configuração `wrangler.preview.jsonc` usa o Worker separado `kukkiwon-ptbr-tkd-preview`, sem cron ou bindings do monitor.

A prévia preparada não contém chaves reais e está **sem conexão com o catálogo remoto**. Permite testar interface, corpo frontal/posterior, zoom e detalhes esquemáticos sem depender da migração ainda não autorizada. O catálogo mostra o estado de conexão ausente. Nenhum rascunho ou fixture QA foi incorporado aos assets.

`npm run preview:check` serviu esse pacote com Wrangler/Workerd local, verificou desktop/mobile, navegação, ampliação, ausência de overflow e **zero requisições externas**. Capturas em `.preview-build/screenshots/`. Esse comando não envia conteúdo à Cloudflare.

Para uma prévia conectada, é necessário autorizar e aplicar a migração no projeto dedicado, preparar a configuração pública e gerar um novo pacote. Importar rascunhos não os torna visíveis; técnicas/regiões só aparecerão após aprovação editorial humana.

## Autorizações que continuam necessárias

- Integrar as PRs na main, na ordem acima.
- Enviar a prévia separada à Cloudflare, selecionando a conta correta.
- Aplicar migração e eventual importação no Supabase dedicado. Isso não está incluído na autorização de deploy ou merge.
- Publicar qualquer técnica, região, relação ou mídia somente depois da revisão humana e de direitos exigida.

Nenhuma dessas operações foi executada. A validação local não cria recursos pagos nem altera projetos Supabase existentes.
