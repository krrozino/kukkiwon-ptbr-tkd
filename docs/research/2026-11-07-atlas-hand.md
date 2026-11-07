# Atlas A2 — documentação da mão

Lote de pesquisa `atlas-hand-v1`, conferido em 07/11/2026. **Todos os registros continuam em rascunho, com revisão humana pendente.** O contrato está pronto para consulta por slug e integração posterior; a geometria e o catálogo público não foram modificados.

## Entrega e limites

- 23 termos/configurações, 19 regiões geométricas existentes (9 com correspondência técnica proposta e 10 exclusivamente ilustrativas).
- 47 sentidos e 202 afirmações com evidência individual: valor, campo, documento, URL, edição, localizador, data e natureza da informação.
- 13 relações documentadas com técnicas já presentes nos lotes de revisão.
- [Matriz JSON](../../content/research/atlas-hand-v1/matrix.json) como fonte versionada e [CSV por afirmação](../../content/research/atlas-hand-v1/claims.csv) para cotejo. Ambos ficam fora do site público.
- Nenhum sentido, tradução ou pronúncia recebe aprovação humana. A arte exige avaliação separada de anatomia, autoria e direitos.

`document_checked` identifica conferência do **campo observado**: não aprova automaticamente outra língua, execução, pronúncia ou equivalência lexical. Nomes, definições e pronúncias PT-BR são propostas próprias em `research`, com fonte editorial e fundamento institucional separados. A matriz usa `approved_at: null`; não contém identidade de revisor nem UUID de aprovação.

## Fontes e método

1. [Kukkiwon, Taekwondo Technical Terminology, arquivo 11621](https://research.kukkiwon.or.kr/homepage/boardMedia/11621): apêndice **Applicable Parts of the Body**, páginas **69–75 do arquivo PDF**. A paginação física começa na capa; não inventar páginas impressas onde não aparecem. O prefácio data de 01/03/2012 (p. PDF 2), mas o colofão informa primeira publicação inglesa em **31/12/2011** (p. PDF 96). Por isso `publication_year=2011` e a edição registra ambas as datas.
2. [Projeto WTA de traduções de 2011, artigo 27665](https://research.kukkiwon.or.kr/board/result/article/27665), [anexo inglês 11634](https://research.kukkiwon.or.kr/homepage/boardMedia/11634): 97 páginas; colofão na p. PDF 97. O texto extraído das páginas 69–75 coincide com o arquivo 11621. As duas disponibilizações não são fontes independentes de confirmação.
3. [Publicação coreana de 2010, artigo 27667](https://research.kukkiwon.or.kr/board/result/article/27667), [anexo 11637](https://research.kukkiwon.or.kr/homepage/boardMedia/11637): 30 páginas duplas. `부록 > 사용부위`, p. impressa 43 na p. PDF 23, e pp. impressas 44–45 na p. PDF 24. Hangul cotejado; romanização não inferida do coreano.
4. [Taekwondo Brasil, dicionário](https://www.taekwondobrasil.com.br/dicionario-de-palavras-coreanas-taekwondo/): seções **SON (MÃO)** e **JUMOK(PUNHO FECHADO)**. Grafias regionais são observações para comparação; não substituem os termos Kukkiwon nem entram automaticamente em `term_aliases`.
5. [HanRa, Partes del cuerpo](https://tkdhanra.com/?page_id=2114): página localizada, mas a leitura por item deu timeout. Nenhuma afirmação deste lote recebe conferência a partir dela; a comparação individual permanece pendente.
6. [National Institute of Korean Language, entrada 주먹, 79399, acepção 1](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=79399&nation=eng): sustenta o sentido lexical comum de `Jumeok`, distinguido da superfície técnica descrita pela Kukkiwon. Os sentidos figurativos da entrada não foram incorporados ao atlas.

As requisições locais aos três PDFs usaram user agent explícito, timeout e intervalo de dois segundos, depois de consultar o `robots.txt` institucional (permitia o caminho). Foram três downloads, sem coleta massiva ou contorno de bloqueios. Os timeouts iniciais do navegador ficaram registrados como falhas de transporte; nenhum bloqueio de acesso foi contornado. Os hashes SHA-256 e quantidades de páginas constam em `content_sources`. Os PDFs, textos integrais e renders permanecem em `.local-validation/atlas-a2/`, ignorado pelo Git. Nenhuma figura institucional é redistribuída.

O cotejo incluiu leitura visual das páginas 69, 74, 75 e 96 do arquivo 11621, leitura textual completa do apêndice e comparação com os dois anexos históricos. As definições portuguesas são paráfrases concisas, não transcrições de um manual oficial em português. A conferência documental não substitui revisão de coreano/Taekwondo.

## Contrato e integração por slug

`src/lib/atlas-hand-documentation.ts` fornece:

```ts
validateHandMatrix(value: unknown): HandMatrix
validateHandMatrix(value: unknown, catalog: { slug: string }[]): HandMatrix
handTermDocumentation(matrix, 'sonnal')
handRegionDocumentation(matrix, 'sonbadak')
handSemanticsProposal(matrix, 'sonnal')
handMatrixCsv(matrix)
```

Cada afirmação/sentido retornado tem sua própria `reference` e os documentos de `basis`. A interface futura deve mostrar valor, natureza (`primary`, `historical`, `complementary`, `editorial`), estado e localizador juntos. Não selecionar a primeira tradução como se eliminasse sentidos alternativos. `null` significa slug ausente; regiões exclusivamente ilustrativas retornam lista de termos vazia; termos sem desenho continuam consultáveis pelo slug.

Sem o argumento `catalog`, o validador confere a estrutura e os vínculos internos do pacote. Para resolver identidades externas, forneça o catálogo autorizado explicitamente. A CLI sempre carrega os três lotes canônicos versionados e recusa relações com técnicas ausentes ou `existing_term_slug` divergente; não faz consulta remota para descobrir identidades. O consumidor de arquivo externo deve validar com esse catálogo antes de apresentar relações como resolvidas.

O consumidor recebe a matriz **explicitamente**, por exemplo de um arquivo aberto em ambiente local de revisão. Nenhuma rota pública importa esse JSON. `checkResearchBundle` também bloqueia o marcador do formato, inclusive em chunks órfãos. O despacho permite consulta provisória antes da revisão; neste lote essa consulta é local, preservando os gates de publicação de `AGENTS.md`. Integrar ao atlas público é uma decisão editorial posterior.

### Reaproveitamento da Issue #42

A base foi atualizada para `origin/main` em **`f1a251c`** antes da entrega final. As tabelas/contratos de `term_senses` e `term_field_claims` da #42, implementados originalmente em **`15b1e05`**, já estão nessa base. O módulo importa diretamente os tipos de `src/lib/term-semantics.ts` (`ClaimField`, `SenseKind`, `EditorialStatus`, `SourceSnapshot`, `VariantKind` e `RegionUsageContext`). Esta PR não acrescenta ou modifica migrações, RLS ou SQL.

O formato portátil reutiliza `technical_terms`, `content_sources`, `term_senses`, `term_field_claims`, `body_regions`, `body_region_terms` e `term_relations`. As chaves locais `term_slug`, `sense_key`, `claim_key`, `region_slug` e `source_id` referem-se a identidades documentais, **não são UUIDs fictícios**. `existing_term_slug` identifica as correspondências exatas aos registros já versionados. Nenhuma aproximação linguística cria identidade.

`handSemanticsProposal` retorna as propostas e `field_evidence` com valores exatos para uma futura importação confiável. O importador deverá:

1. Resolver slug para `technical_terms.id`, fonte para `content_sources.id` e região para `body_regions.id`, preservando identidades existentes; criar novos candidatos apenas no fluxo editorial autorizado.
2. Inserir lote/candidato/evidência em `knowledge_research`, com hash do arquivo realmente recebido; o snapshot bibliográfico deve vir do documento canônico, conforme o trigger existente. `evidence_id` só existe depois dessa inserção.
3. Resolver `sense_key` para o ID do sentido e emitir somente as colunas aceitas por #42. Para sentidos, `evidence.field_name = sense_kind + '_meaning'`; para afirmações, campo e valor devem coincidir exatamente com a evidência.
4. Resolver `(region_slug, term_slug, region_usage_context)` para a chave existente em `body_region_terms`. `related_term_slug` de uma distinção resolve para `related_term_id`. As relações técnica → superfície usam **`relation_kind='related'`**, já aceito pelo esquema existente; os lados da relação e o localizador técnico preservam o contexto. Não criar um valor SQL novo nem inferir alias.
5. Manter `publication_status='draft'`, `approved_at=null`, sem fornecer `approved_by`. `basis`, `evidence_kind`, notas e lacunas pertencem ao pacote de pesquisa e à proposta, não viram colunas extras nas tabelas públicas. As evidências editoriais apontam para o documento próprio; o fundamento Kukkiwon não passa a ser autor da tradução.

Esse mapeamento é uma preparação de dados, não um importador executável. Nenhum acesso ao Supabase é necessário para consultar, validar ou exportar o lote. A aplicação de migração e eventual importação exigem autorização separada.

## Vínculos geométricos propostos

Correspondências explícitas por slug: `sonbadak`, `batangson`, `sonnal`, `sonnaldeung`, `ageumson`, `sondeung`, `jumeok`, `deungjumeok` e `mejumeok`. Cada vínculo tem uma afirmação `field_name='region'` própria, em `research`, com fonte editorial e localizador institucional de fundamento. A delimitação real do path SVG não é verificada por este lote.

As outras 14 configurações permanecem `geometry_status='pending'`. Um dedo ilustrado não representa, por si só, uma configuração técnica de pontas dos dedos. Os dez slugs `illustration-*` existentes continuam sem termo coreano associado. Seus rótulos em português são operacionais/ilustrativos, e o crédito do projeto não confirma anatomia, licença ou aprovação da arte.

## Divergências

- **modumsonkkeut:** Kukkiwon define cinco pontas reunidas; `Moeundusonkkeut` reúne duas. O dicionário Taekwondo Brasil associa a grafia `Mo Dum Sonkut` a duas pontas. A matriz registra a divergência com ambas as localizações, sem substituir a definição institucional. A linha dessa página também concatena `Batang Son`; não foi interpretada como uma entrada independente limpa.
- **moeundusonkkeut / moeunsesonkkeut:** a classificação na p. PDF 6 do arquivo 11621 usa `Moundusonkket` / `Mounsesonkket`; o apêndice na p. PDF 73 usa `Moeundusonkkeut` / `Moeunsesonkkeut`. Essas grafias internas foram preservadas por contexto, sem correção silenciosa.
- **ageumson:** `Arc Hand` é rótulo técnico inglês, não prova da composição etimológica de `아금손`. `Agui Son` aparece na fonte brasileira sem Hangul e permanece apenas como observação contextual para pesquisa, sem declaração de alias ou sinonímia.
- **seun-pyeonjumeok:** `세운편주먹` está na edição coreana de 2010, p. impressa 44 / p. PDF 24. O slug é uma chave editorial de pesquisa; não há romanização institucional nem pronúncia PT-BR preenchidas. A configuração vertical foi sintetizada em português e permanece pendente de revisão.
- **jumeok:** a mão fechada no uso lexical e a área frontal das juntas no uso técnico têm sentidos e referências diferentes. O sentido lexical inglês está conferido na entrada do NIKL; sua versão PT-BR é proposta editorial.

Não foram fabricadas traduções literais para preencher lacunas. As outras 22 entradas ainda precisam de uma fonte lexical própria para etimologia, se houver interesse em exibi-la. Todas as traduções/pronúncias precisam de revisão humana; a comparação com os livros de 2022 e o cotejo individual HanRa permanecem pendentes.

## Propostas editoriais

As tabelas abaixo permitem localizar cada `slug` por **nome**, **definição** e **pronúncia**. Os valores portugueses são de autoria editorial Codex, não da Kukkiwon. O fundamento técnico individual está nas referências da matriz/CSV. O guia de pronúncia é apenas uma aproximação para leitores brasileiros: `û` aproxima a vogal coreana escrita `eu`, `kk` sinaliza consoante tensa e o `k` final é curto. Não é IPA, áudio ou pronúncia verificada por falante; não deve ser promovido para `verified`.

Para `jumeok > sentido lexical`, a proposta portuguesa é “Punho fechado (mão com os dedos recolhidos à palma)”, baseada na acepção 1 do NIKL. Ela não substitui a definição técnica de contato.

## Auditoria e reprodução

Com Node 22.18+ ou Node 24 e dependências instaladas por `npm ci --ignore-scripts`:

```text
npm run atlas:hand:check
npm run atlas:hand:check -- --json
npm run atlas:hand:prepare
npx vitest run tests/atlas-hand-documentation.test.ts tests/atlas-hand-pipeline.test.mjs
```

O primeiro comando valida estrutura, referências individuais, datas reais não futuras, páginas PDF, NFC, correspondência exata entre evidência/campo/valor, vínculos/sentidos e estados provisórios, além de exigir CSV idêntico ao derivado. `prepare` regenera somente o CSV local depois da validação. O CSV neutraliza fórmulas ao abrir em planilhas; o JSON conserva o valor original. Não há HTTP, importação SQL, aprovação ou escrita remota nesses comandos.

Os testes cobrem pares Hangul/romanização documentados, compatibilidade com termos e slugs geométricos existentes, múltiplos sentidos, conflitos, ausência honesta de romanização, evidências órfãs, URL insegura/com credenciais, data ausente/futura/impossível, aprovação/publicação indevida e vazamento de pesquisa no bundle. As demais verificações do repositório e a CI são reportadas no handoff/PR; teste estrutural não comprova correção linguística de toda a matriz.

## Inventário documental por slug

Hangul e romanização abaixo foram observados nos localizadores indicados. As páginas são físicas do PDF, salvo indicação de página impressa.

| Slug | Hangul | Romanização documentada | Referência | Geometria |
| --- | --- | --- | --- | --- |
| sonnal | 손날 | Sonnal | KUK-2012-TERMINOLOGY — Appendix > Applicable Parts of the Body > Sonnal; PDF pp. 74-75 | Vínculo proposto |
| sonnaldeung | 손날등 | Sonnaldeung | KUK-2012-TERMINOLOGY — Appendix > Applicable Parts of the Body > Sonnaldeung; PDF p. 75 | Vínculo proposto |
| sonbadak | 손바닥 | Sonbadak | KUK-2012-TERMINOLOGY — Appendix > Applicable Parts of the Body > Sonbadak; PDF p. 74 | Vínculo proposto |
| batangson | 바탕손 | Batangson | KUK-2012-TERMINOLOGY — Appendix > Applicable Parts of the Body > Batangson; PDF p. 70 | Vínculo proposto |
| ageumson | 아금손 | Ageumson | KUK-2012-TERMINOLOGY — Appendix > Applicable Parts of the Body > Ageumson; PDF p. 69 | Vínculo proposto |
| sondeung | 손등 | Sondeung | KUK-2012-TERMINOLOGY — Appendix > Applicable Parts of the Body > Sondeung; PDF p. 74 | Vínculo proposto |
| jumeok | 주먹 | Jumeok | KUK-2012-TERMINOLOGY — Appendix > Applicable Parts of the Body > Jumeok; PDF p. 72 | Vínculo proposto |
| deungjumeok | 등주먹 | Deungjumeok | KUK-2012-TERMINOLOGY — Appendix > Applicable Parts of the Body > Deungjumeok; PDF pp. 70-71 | Vínculo proposto |
| mejumeok | 메주먹 | Mejumeok | KUK-2012-TERMINOLOGY — Appendix > Applicable Parts of the Body > Mejumeok; PDF p. 72 | Vínculo proposto |
| bamjumeok | 밤주먹 | Bamjumeok | KUK-2012-TERMINOLOGY — Appendix > Applicable Parts of the Body > Bamjumeok; PDF p. 70 | Pendente |
| jipgebamjumeok | 집게밤주먹 | Jipgebamjumeok | KUK-2012-TERMINOLOGY — Appendix > Applicable Parts of the Body > Jipgebamjumeok; PDF p. 72 | Pendente |
| jipgejumeok | 집게주먹 | Jipgejumeok | KUK-2012-TERMINOLOGY — Appendix > Applicable Parts of the Body > Jipgejumeok; PDF p. 72 | Pendente |
| pyeonjumeok | 편주먹 | Pyeonjumeok | KUK-2012-TERMINOLOGY — Appendix > Applicable Parts of the Body > Pyeonjumeok; PDF p. 74 | Pendente |
| gomson | 곰손 | Gomson | KUK-2012-TERMINOLOGY — Appendix > Applicable Parts of the Body > Gomson; PDF p. 71 | Pendente |
| gupinsonmok | 굽힌손목 | Gupinsonmok | KUK-2012-TERMINOLOGY — Appendix > Applicable Parts of the Body > Gupinsonmok; PDF p. 71 | Pendente |
| gawisonkkeut | 가위손끝 | Gawisonkkeut | KUK-2012-TERMINOLOGY — Appendix > Applicable Parts of the Body > Gawisonkkeut; PDF p. 71 | Pendente |
| hansonkkeut | 한손끝 | Hansonkkeut | KUK-2012-TERMINOLOGY — Appendix > Applicable Parts of the Body > Hansonkkeut; PDF p. 72 | Pendente |
| modumsonkkeut | 모둠손끝 | Modumsonkkeut | KUK-2012-TERMINOLOGY — Appendix > Applicable Parts of the Body > Modumsonkkeut; PDF p. 73 | Pendente |
| moeundusonkkeut | 모은두손끝 | Moeundusonkkeut | KUK-2012-TERMINOLOGY — Appendix > Applicable Parts of the Body > Moeundusonkkeut; PDF p. 73 | Pendente |
| moeunsesonkkeut | 모은세손끝 | Moeunsesonkkeut | KUK-2012-TERMINOLOGY — Appendix > Applicable Parts of the Body > Moeunsesonkkeut; PDF p. 73 | Pendente |
| pyeonsonkkeut | 편손끝 | Pyeonsonkkeut | KUK-2012-TERMINOLOGY — Appendix > Applicable Parts of the Body > Pyeonsonkkeut; PDF p. 74 | Pendente |
| son | 손 | Son | KUK-2012-TERMINOLOGY — Appendix > Applicable Parts of the Body > Son; PDF p. 74 | Pendente |
| seun-pyeonjumeok | 세운편주먹 | Não localizada | KUK-2010-KO-PDF — 부록 > 사용부위 > 세운편주먹; p. impressa 44; PDF p. 24 | Pendente |

### Nomes, definições e pronúncias propostas

| Slug | Nome PT-BR proposto | Definição editorial | Pronúncia aproximada |
| --- | --- | --- | --- |
| sonnal | Borda externa da mão (mão em faca) | Borda da mão aberta do mínimo ao punho; dedos reunidos. | sôn-nal |
| sonnaldeung | Borda interna da mão (faca reversa) | Borda oposta ao sonnal, com polegar recolhido à palma. | sôn-nal-dûng |
| sonbadak | Palma da mão | Face palmar entre a base dos dedos e o punho. | sôn-ba-dak |
| batangson | Base da palma da mão | Base palmar exposta com a mão fletida para trás. | ba-tang-sôn |
| ageumson | Mão em arco | Configuração em arco entre polegar e indicador afastados. | a-gûm-sôn |
| sondeung | Dorso da mão | Face oposta à palma da mão. | sôn-dûng |
| jumeok | Punho fechado | Mão fechada; contato frontal das primeiras juntas do indicador e médio. | dju-mók |
| deungjumeok | Dorso do punho fechado | Face superior das primeiras juntas do indicador e médio no punho fechado. | dûng-dju-mók |
| mejumeok | Punho em martelo | Borda externa do punho fechado, correspondente ao lado do mínimo. | mê-dju-mók |
| bamjumeok | Punho com junta média saliente | Punho fechado com a junta média do dedo médio projetada. | bam-dju-mók |
| jipgebamjumeok | Punho com junta do indicador saliente | Punho fechado com a segunda junta do indicador projetada. | djip-kê-bam-dju-mók |
| jipgejumeok | Punho em pinça | Polegar e indicador formam pinça; outros dedos recolhidos. | djip-kê-dju-mók |
| pyeonjumeok | Punho parcialmente fechado | Configuração parcialmente fechada que expõe as juntas médias dos quatro dedos. | pyón-dju-mók |
| gomson | Mão de urso | Configuração que reúne base palmar e juntas dos dedos mais recolhidos. | kôm-sôn |
| gupinsonmok | Punho fletido | Área de articulação entre dorso da mão e punho fletido para dentro. | ku-pin-sôn-mók |
| gawisonkkeut | Pontas dos dedos em tesoura | Pontas do indicador e médio separados; demais dedos recolhidos. | ka-ui-sôn-kkût |
| hansonkkeut | Ponta de um dedo | Ponta do indicador estendido com os demais dedos recolhidos. | han-sôn-kkût |
| modumsonkkeut | Cinco pontas dos dedos reunidas | Pontas dos cinco dedos reunidas em uma configuração compacta. | mo-dum-sôn-kkût |
| moeundusonkkeut | Duas pontas dos dedos reunidas | Pontas do indicador e médio estendidos e unidos; outros dedos recolhidos. | mo-ûn-du-sôn-kkût |
| moeunsesonkkeut | Três pontas dos dedos reunidas | Indicador e anelar unidos, médio alinhado sobre eles; polegar e mínimo recolhidos. | mo-ûn-sê-sôn-kkût |
| pyeonsonkkeut | Pontas dos dedos em lança | Dedos reunidos; médio levemente curvado para alinhar as pontas do indicador e anelar. | pyón-sôn-kkût |
| son | Mão | Mão aberta, com dedos e polegar, distal ao punho. | sôn |
| seun-pyeonjumeok | Punho parcialmente fechado vertical | Punho parcialmente fechado mantido na vertical, com o lado do martelo voltado para baixo. | Em pesquisa |
