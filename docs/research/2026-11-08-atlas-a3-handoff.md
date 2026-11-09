# Atlas A3 — consulta documental local da mão

Data: 08/11/2026. Refs #61. Entrega empilhada sobre a PR #59; sem integração da geometria conflitante da #60.

## Recuperação e ambiente

- Clone direto no workspace vazio `D:\programations\kukkiwon site`, remoto oficial `https://github.com/krrozino/kukkiwon-ptbr-tkd.git`. `git fsck --no-reflogs` passou.
- `main`: `f1a251c8c625aee7362337904d7343fc42f4509f`; base documental: `6564cb0d77e6df57fb2365faa7e2c328c9b9c4c6`. Referências reconfirmadas no remoto antes da entrega.
- Branch exclusiva: `feat/atlas-a3-documentation-lab`. Não houve escrita nas branches #59/#60.
- Git 2.54.0.windows.1; GitHub CLI 2.97.0, autenticação ativa; Node 24.15.0; npm 11.12.1.
- Astro 7.4.5; integração React 7.1.0; React 19.3.1; TypeScript 5.9.3; Vitest 5.1.0; Playwright 1.64.1, Chromium instalado.
- Docker cliente/daemon 29.8.1 e Compose 5.5.1 disponíveis. Nenhum contêiner necessário/iniciado. Supabase CLI não instalada, dispensável para esta implementação.
- `npm ci --ignore-scripts`: 333 pacotes, auditoria sem vulnerabilidades. `.env` local ignorado criado apenas com os placeholders do exemplo e flags desativadas; nenhuma credencial remota configurada.
- Scanner determinístico executado antes de ler arquivos. Nenhum segredo detectado nos arquivos lidos ou alterados.

## Implementação

- `/atlas-mao-local` usa o `DetailMap` atual e o mesmo inspector, sem mudar paths, slugs, vistas ou hitboxes.
- Ponto opcional `renderInspection` permite que apenas o consumidor isolado forneça a ficha documental. A apresentação pública original continua com `AtlasSourceEvidence`, verificação de slug e alturas de 440/480px.
- Painéis consomem `handRegionDocumentation` e `handTermDocumentation`; a matriz é validada por `validateHandMatrix`. Contrato, JSON/CSV A2 e estados editoriais não foram alterados.
- Hangul, romanização, pronúncia editorial, traduções, contextos, sentidos e variantes são mostrados com referência individual, localizador, idioma, autoridade, data documental, fundamentação e notas. `document_checked` continua diferente de aprovação humana.
- Campos ausentes ficam pendentes. Sentidos existentes na coleção própria são sinalizados corretamente, sem falsa lacuna no índice de campos.
- Busca pelos 23 termos com filtro dos 14 sem geometria. Dez regiões `illustration-*` continuam sem terminologia técnica vinculada; nove correspondências continuam propostas editoriais.
- Alias de desenvolvimento substitui o workbench por componente vazio durante build, independentemente de flags públicas. O guard examina a saída inteira, incluindo chunks órfãos e fragmentos identificados pelas chaves A2.
- Link para o laboratório apenas na versão de desenvolvimento de `/pesquisa-local`. Não foram adicionados dependências, SQL, RLS, migrações, permissões ou release.

## Verificação

Baseline na base documental: auditorias de conteúdo/fontes/pesquisa/mão/acervo passaram; check com zero erros/avisos e dois hints preexistentes; Vitest 255/255; build 16 rotas; Playwright pertinente 28/28 desktop/mobile.

Resultados finais:

| Verificação | Resultado |
| --- | --- |
| content:check | PASS — 108 registros |
| sources:audit | PASS — 8 fontes, offline |
| research:audit | PASS — 115 candidatos / 4 artefatos |
| atlas:hand:check | PASS — 23 termos, 19 regiões, 47 sentidos, 203 afirmações |
| acervo:check | PASS — 120 entradas, 26 relações, zero aprovações humanas |
| check | PASS — zero erros/avisos; dois hints preexistentes sobre addListener em Base.astro |
| npm test | PASS — 261/261, 32 arquivos |
| build | PASS — 17 rotas, guards editoriais ativos |
| Guard na saída pública e na prévia | PASS — 45 e 46 arquivos inspecionados, zero registros de pesquisa expostos |
| Playwright público completo | PASS — 122/122, desktop/mobile, artefatos em C: |
| Playwright laboratório completo | PASS — 18/18, incluindo 12 cenários da mão, artefatos separados em C: |
| Revisão independente | Estática, somente leitura; nenhum finding acionável |

Os seis novos testes unitários cobrem todos os campos/sentidos e referências dos 23 termos, nove vínculos/dez ilustrações, lacunas reais, rejeição de matriz inválida/publicação e fragmento órfão. Os testes browser exercitam mouse/toque/teclado, foco no link de evidência, seleção persistente, busca histórica, ausência de hotspot falso, 375/1280px, claro/escuro divergentes do sistema e exclusão no build público.

Capturas locais: `review-output/atlas-a3/` (24 imagens de palma/dorso/punho em 375/1280px, claro/escuro, projetos desktop/mobile). Inspeção visual pelo executor em desktop claro e mobile escuro, sem homologação estética humana.

Uma primeira execução simultânea das suítes compartilhou o diretório padrão de artefatos: houve ENOENT em traces. O disco D: também chegou a aproximadamente 56 MiB livres e houve ENOSPC na gravação de traces. Os resultados foram preservados fora do repositório; a validação final usa diretórios separados em C: e execução sequencial. Nenhum teste de produto foi alterado para ocultar essas falhas ambientais. Recomendado liberar espaço em D: antes de novos trabalhos volumosos.

Reprodução das suítes com espaço para artefatos (substitua os diretórios por caminhos locais separados em um disco com espaço):

```powershell
npm run test:ui -- --output C:/kukkiwon-validation/public
npm run test:research:ui -- --output C:/kukkiwon-validation/research
```

O SHA final, a PR Draft e a CI remota são reportados no handoff da PR, após os commits deste documento. A CI do GitHub é distinta da validação local descrita nesta tabela.

## Pendências e limites

- #60 permanece conflitante: sua versão antiga de DetailMap não foi copiada. Nenhuma geometria foi modificada nem certificada quanto a anatomia/overlap.
- Antigravity deve entregar a arte atualizada sobre main, preservar slugs e recursos da #58 e fornecer evidências de hit-testing/clip/contraste. Depois, conferir visualmente os nove mapeamentos editoriais antes de consolidá-los.
- Continuam pendentes revisão linguística/técnica humana de cada afirmação, aprovação estética, comparação de 2022 e demais lacunas da #59. Nenhum resultado automatizado promove esses estados.
- A revisão independente foi estática: não repetiu os testes nem conferiu documentos externos. Os resultados executados são os desta sessão.
- Sem merge, deploy, migração remota, escrita no Supabase, publicação de rascunhos, Firecrawl ou API paga.

Próximo passo: revisar a PR Draft empilhada e o laboratório local; depois compatibilizar a arte revisada do Antigravity mantendo os mapeamentos provisórios e repetir a validação sobre o SHA integrado.
