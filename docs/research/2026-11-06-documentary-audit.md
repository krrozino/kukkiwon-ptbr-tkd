# Auditoria documental crítica da pesquisa Gemini

Data da conferência: 06/11/2026. O lote continua em **pesquisa / rascunho**. Esta auditoria não aprova publicação, tradução, execução técnica nem integração de dados no catálogo público.

O PDF recebido tem **89 páginas**, com SHA-256 `1550915bb02bfbec0c983a0a461bb8fc7c567028df5dea17942542628e528842`, recalculado a partir do arquivo em Downloads. Os 13 arquivos originais do pacote foram preservados. A auditoria examinou o texto do PDF recebido, as linhas extraídas de todas as categorias e fontes externas recuperadas nesta sessão. A renderização da página física 27 confirmou visualmente a divisão de uma linha e de seu ID entre páginas; não houve revisão visual integral das 89 páginas.

O resultado individual, incluindo localizadores, campos efetivamente cotejados e propostas separadas, está em [document-audit.json](../../content/research/gemini-2026-11-06/document-audit.json). O registro de acesso está em [source-access.json](source-access.json). Os números de página da fonte Kukkiwon são **páginas físicas do PDF**, começando em 1 e incluindo a capa; não são necessariamente a paginação impressa.

## Cobertura e significado dos resultados

| Grupo | Registros examinados | Resultado |
| --- | ---: | --- |
| Técnicas | 115 | 69 com conferência primária limitada de identidade; 11 com conflito; 9 com erro/ambiguidade de extração; 26 com evidência insuficiente |
| Famílias | 16 | Nome e classificação cotejados quando presentes; definição portuguesa e taxonomia do Gemini permanecem sob revisão |
| Morfemas | 18 | Nomes, direções e algumas divergências de grafia cotejados; pronúncia brasileira e limites anatômicos não aprovados |
| Superfícies | 23 | Nomes confrontados; conflitos de definição e truncamentos registrados; geometria, lateralidade e SVG não validados |
| Poomsae | 17 | Cada página individual oficial foi acessada; conferência de identidade e conceito central, com conflitos de contagem preservados |
| Comandos | 11 | Funções regulamentares confrontadas com artigos específicos da WT; Hangul e pronúncia didática não validados pela extração inglesa |
| Bibliografia | 42 | 38 páginas/documentos acessíveis, com limites descritos; 4 acessos bloqueados ou sem corpo recuperável |

As 85 entidades das categorias complementares somam 60 resultados `verified_primary`, 12 `conflicting`, 9 `extraction_error` e 4 `insufficient_evidence`. A conferência adicional da regra atual mudou `COMMANDS-010` para conflito, pois sua definição omite uma exceção de pontuação. A categoria predominante não apaga problemas em outros campos: uma linha com nome corroborado pode continuar com definição truncada, tradução pendente ou representação não comprovada.

**Nenhuma ficha completa foi validada.** `verified_primary` significa somente os campos indicados em `evidence[].fields`. Nas técnicas isso normalmente se restringe a `hangul_extracted` e `romanization_extracted`; em `TC-JJI-003`, somente a romanização composta foi demonstrada no localizador citado. A conferência desconsidera separação tipográfica de espaços/hífens e, quando indicado, parênteses que a própria fonte apresenta como palavra opcional; ela não altera o original. Nas demais tabelas, `raw_columns[n]` usa índice iniciado em zero. Um complemento textual entre parênteses delimita a parte do campo efetivamente cotejada.

`conflicting` registra divergência com uma fonte ou entre fontes. Não significa que uma variante de linhagem ou de romanização esteja universalmente errada. `insufficient_evidence` registra ausência de demonstração individual nas fontes consultadas; não afirma inexistência da técnica. `extraction_error` conserva o problema de ID, nota bibliográfica ou linha truncada mesmo quando parte do nome tem confirmação.

## Fontes primárias efetivamente consultadas

- [Kukkiwon — Taekwondo Technical Terminology](https://research.kukkiwon.or.kr/homepage/boardMedia/11621): PDF integral de 96 páginas, com prefácio de 01/03/2012. Foi baixado do endereço institucional e consultado também via Firecrawl ao vivo. A referência 1 do Gemini, hospedada em Wien Taekwondo, contém **o mesmo arquivo**, confirmado por igualdade de SHA-256. Isso autentica a reprodução; não transforma a referência em uma segunda fonte independente.
- [Kukkiwon — anúncio dos textbooks de 2022](https://kukkiwon.or.kr/eng/board/read?boardManagementNo=49&boardNo=1688&menuLevel=2&menuNo=91%3FselectMenuCode%3DPE020310&page=10): confirma a edição de cinco volumes e 1.076 páginas. **Não foram obtidas e cotejadas as páginas integrais dos cinco volumes.** O anúncio e os catálogos de livrarias não sustentam a alegação de que cada técnica foi conferida na edição 2022/2023.
- [WT — Competition Rules & Interpretation, em vigor em 01/01/2026](https://www.worldtaekwondo.org/upload/files/2025/11/81c97d21-0b7c-4e4d-b772-667682abe4c2.pdf): PDF original de 79 páginas recuperado do domínio WT via Firecrawl. Um [espelho federativo](https://cloud.rampinteractive.com/sasktaekwondo/files/2026-01_WT_Rules_Kyorugi.pdf) foi baixado para conferência de texto e paginação. É uma fonte histórica: a conferência adicional abaixo encontrou edição oficial posterior, em vigor em **01/11/2026**.
- [WT — índice oficial atual, categoria Kyorugi / CURRENT](https://www.worldtaekwondo.org/inside/documents/rar/list?levelCode=RR&categoryCd=KY&subTitleList=CURRENT&pageIndex=1&listRowSize=100): acessado em 06/11/2026, lista a edição de 01/11/2026 e seu quadro de alterações. O [PDF consolidado atual, 82 páginas](https://www.worldtaekwondo.org/file/viewer?efSeq=cXlKcWtQUmVORnZ3eDYyRDlzdlFmZz09&efOrd=VnBMdU93K2ZLOWRKTU5DV1hXRFV5QT09) traz a vigência na capa; o [quadro oficial de alterações, quatro páginas](https://www.worldtaekwondo.org/file/viewer?efSeq=TzRRNXBKWHBXOXg0VUdVMmxNeGorQT09&efOrd=VnBMdU93K2ZLOWRKTU5DV1hXRFV5QT09) confirma a mesma vigência. Foram cotejados os trechos relevantes dos artigos 10, 11, 12, 14, 15, 16 e 21; não se declara auditoria integral de todas as disposições.
- [Kukkiwon — Poomsae](https://www.kukkiwon.or.kr/eng/board/list?boardManagementNo=55&menuLevel=3&menuNo=72): as duas páginas de índice e os 17 artigos individuais foram recuperados. Cada entidade aponta o artigo correspondente no JSON. Foram lidos título e corpo textual; vídeos e imagens vinculados não foram analisados.

O PDF de regras de setembro de 2024, referência 11, também foi baixado integralmente, com 68 páginas. Ele serve como comparação histórica. Os PDFs das referências 2, 14, 19 e 40 foram recuperados integralmente, respectivamente com 12, 52, 14 e 12 páginas. Seu escopo foi examinado; isso não equivale a validar todas as afirmações para as quais o Gemini os cita.

## Achados que exigem decisão editorial

1. **A1 não é localizador.** Os candidatos repetem rótulos de evidência do PDF. A auditoria acrescenta página e campo específicos quando há prova direta; a classificação de uma fonte como institucional não prova automaticamente cada linha da tabela.
2. **A lista de “16 famílias canônicas” não reproduz a estrutura da fonte consultada.** A classificação da página física 8 distingue 10 técnicas e 5 auxiliares; o sumário da página 11 tem 17 seções. A lista Gemini inclui Nakbeop e omite categorias do sumário. Não deve ser publicada como taxonomia institucional sem delimitação e fonte apropriada.
3. **Grafias precisam de revisão contextual.** Há diferenças documentadas em `Narani/Naranhi`, `Pyeoni/Pyeonhi`, `Nulleo/Nullo`, `Biteureo/Bitureo`, `Eolgul/Olgul` e em `Ditgi/딛기` versus `디디기`. A própria fonte tem inconsistências em `Sewo-jiruegi`, `Ogeum/Ogum` e outras formas. As oito propostas para técnicas preservam o campo original e citam a página; não foram aplicadas aos dados recebidos.
4. **Família técnica e alvo não são intercambiáveis.** `TC-JJI-006` usa `Jjikgi`, família própria documentada na página 39, mas foi colocado em estocadas. A presença de queixo ou pescoço na descrição de uma técnica não demonstra por si só um nome composto diferente, como `Batangson-teok-chigi` ou `Sonnal-mok-chigi`.
5. **O atlas contém elaboração anatômica que excede a fonte terminológica.** Há divergência entre sola completa e faixa plantar central em Balbadak, entre pé/dedos estendidos e dedos em garra em Balkkeut, e entre região do punho e longas faixas de rádio/ulna em Palmok. Não foi validada nenhuma área SVG, lateralidade ou distribuição óssea detalhada. O Hangul `아귀손` extraído também diverge do `아금손` apresentado no apêndice; a possível variante não foi corrigida automaticamente.
6. **Contagens de Poomsae têm conflitos reais de procedência.** A referência 37 apresenta Chil Jang 24, Pyongwon 22, Sipjin 26 e Cheonkwon 27; o Gemini apresenta valores que, retiradas as chamadas bibliográficas, parecem 25, 21, 28 e 26. A contagem não foi resolvida por maioria de sites. As páginas oficiais consultadas não fornecem esses números em texto. É preciso escolher uma convenção documentada e conferir a sequência correspondente.
7. **Faixas e Dan são contexto curricular.** O artigo FPETKD de 2010 e os sites de escolas não estabelecem uma tabela universal atual de cores, Gub, Dan e Poomsae. Os artigos oficiais de Poomsae comprovam identidade e parte do simbolismo, sem aprovar a tabela de graduação Gemini.
8. **A edição regulamentar está misturada.** A primeira página do Gemini atribui uma zona de advertência octogonal de 60 cm à edição de 2024. Essa edição já menciona uma linha de limite de 60 cm no formato quadrado (artigo 3.1.1, página física 6), mas seu item sobre formato octogonal não descreve a mesma faixa. Janeiro de 2026 explicita uma faixa contínua de advertência, para dentro da área e para ambos os formatos, no artigo 3.1.3. Portanto, não se deve alegar que toda menção a 60 cm surgiu em 2026. O artigo 12.3.4 de janeiro de 2026 estabelece seis pontos para chute giratório válido na cabeça. Qualquer ficha regulamentar exige edição e data explícitas; os regulamentos locais de Ontario e ISF não substituem a norma WT global.
9. **A saudação não pode ser reduzida a “45°”.** O artigo WT 10.4.2 distingue ângulo de cintura acima de 30° e inclinação de cabeça acima de 45°, inclusive no texto de novembro de 2026. A linha Gemini mistura esses elementos e está truncada. Comandos de interrupção, atendimento e vitória também dependem de contexto regulamentar; não se aprovou pronúncia PT por semelhança auditiva. A edição atual explicita `Chung Seung` / `Hong Seung` no artigo 10.4.7; essa evidência foi acrescentada a `COMMANDS-011`.
10. **Autodefesas continuam exigindo revisão da execução.** Um nome de família ou uma variante com articulação diferente não comprova a mecânica escolhida. `Georeo-neomgigi` tem confirmação limitada de identidade na página 56; nenhum dos sete registros de autodefesa recebeu validação de execução ou segurança.

## Atualização de vigência WT: 1º de novembro de 2026

A consulta adicional resolveu a dúvida sobre usar janeiro como edição vigente: **o índice oficial atualmente apresenta o texto de 01/11/2026 como CURRENT**, e a capa do PDF confirma essa vigência. A alegação específica da referência 41 sobre uma edição de 01/06/2026 não foi confirmada individualmente no arquivo histórico. A tentativa com o filtro `PREVIOUS` retornou novamente conteúdo e seleção `CURRENT`, situação registrada sem declarar consulta bem-sucedida ao histórico.

Os principais efeitos documentais desta atualização são:

- O artigo 12.3.5 mantém a regra geral de um ponto por Gam-jeom, mas 12.3.5.1 prevê um Gam-jeom registrado e **dois pontos** nas condutas enumeradas durante os últimos dez segundos. O item 12.3.5.2 também trata de dois pontos quando determinado pedido de revisão técnica é rejeitado nesse intervalo. Portanto, a definição geral sem ressalva de `COMMANDS-010` fica `conflicting`.
- O artigo 10.4.7 inclui expressamente a declaração verbal de vitória após a saudação. Há comprovação textual atual para os termos romanizados de `COMMANDS-011`; sua pronúncia brasileira e o Hangul não foram aprovados.
- O artigo 15.5 altera os critérios de desempate no sistema melhor de três, incluindo a ordem temporal da pontuação e de contatos registrados pelo PSS. O artigo 16, explicações 3 e 8, apresenta **15 pontos de diferença por round**, com ressalvas para semifinais/finais da divisão sênior conforme o regulamento da competição. Esses itens não podem ser derivados apenas da edição de janeiro.
- O artigo 21.3.4 delimita a atuação de TD/CSB em revisões conforme a classe de evento; 21.4 explicita revisão técnica de erros de procedimento/administração. São requisitos de contexto, sem aprovação de texto público nesta etapa.

O próprio PDF de novembro conserva divergências editoriais: 12.3.5.1 fala em conduta do atleta, enquanto 14.3.1 ainda contém a expressão inglesa “passive behavior”. O quadro de alterações justifica a retirada dessa expressão no primeiro item. Isso foi registrado sem uniformizar silenciosamente a norma ou emitir interpretação de arbitragem. O nome de arquivo do quadro menciona 15/09/2026 e a lista de emendas do consolidado menciona 30/09/2026; a vigência de 01/11/2026 está explícita, e as datas de deliberação não foram reconciliadas por suposição.

A atualização preservou os 115 resultados técnicos, os 85 IDs complementares, as oito propostas existentes e os 42 itens bibliográficos. Acrescentou fontes oficiais e evidências de vigência e alterou apenas a classificação complementar de `COMMANDS-010`.

## Acesso, limitações e rastreabilidade

Cada uma das 42 URLs bibliográficas recebeu tentativa individual de GET. Acesso HTTP 200 foi distinguido de conteúdo útil: a referência 17 retornou apenas o shell “Reddit” e permanece `blocked`. Scribd forneceu páginas de apresentação e resumos, que estão marcados como **prévias**, sem alegação de leitura do arquivo completo. Goodreads e lojas confirmam identificação bibliográfica, sem páginas técnicas.

Firecrawl recuperou os artigos de Fandom 27 e 29 depois de HTTP 403 no acesso local, e a página do periódico 39 depois de falha TLS no acesso local. A discussão ResearchGate 13 continua bloqueada, mesmo com o artigo correspondente localizado no periódico. As páginas principais Kukkiwon tiveram limitação no GET local; os artigos foram efetivamente acessados pelo serviço de recuperação, com identificadores de consulta no registro de acesso.

Os 4 impedimentos de acesso restantes são Ubuy 10, ResearchGate 13, Reddit 17 e MartialTalk 31. Não foi declarado `not_located` quando uma página respondeu bloqueio ou falha de rede. Os PDFs e textos integrais armazenados localmente ficaram somente no cache ignorado `.local-validation/research-source-cache`; os artefatos versionáveis contêm sínteses, identificadores e localizadores, sem cópia integral dos livros. O texto de novembro e seu quadro de alterações foram recuperados pelo Firecrawl, sem cópia integral acrescentada aos arquivos versionáveis.

Na conferência adicional, os endereços legados [rules-wt/rules.html](https://www.worldtaekwondo.org/rules-wt/rules.html) e [rules-wt/rules.html?sc=01](https://www.worldtaekwondo.org/rules-wt/rules.html?sc=01) retornaram HTTP 404 / Page Not Found. Eles foram registrados como `not_located`; o índice migrado em `/inside/documents/rar/list` forneceu os documentos atuais. Isso não altera as contagens de acesso das 42 referências originais.

As verificações de integridade confirmaram 115 IDs técnicos únicos, exatamente os do original; 85 IDs complementares únicos; 42 referências; fontes acessadas para toda evidência; fonte primária para cada resultado `verified_primary`; e valor `original` idêntico ao campo recebido para cada proposta. Os dados originais, incluindo grafias, quebras, IDs e notas, não foram sobrescritos.

## Referências examinadas individualmente

A tabela abaixo é um índice de acesso e escopo. A avaliação completa de cada referência está em `references[]` no JSON.

| Nº | Fonte | Acesso | Avaliação |
| --- | --- | --- | --- |
| 1 | [Referência 1](https://wientaekwondo.com/wp-content/uploads/2022/07/Technical_Terminology_ENG.pdf) | accessed | Reprodução autenticada de documento primário |
| 2 | [Referência 2](https://media.kukkiwon-india.org/media/books/forty-year-history/chapter6.pdf) | accessed | História institucional reproduzida em outro domínio |
| 3 | [Referência 3](https://fightencyclopedia.com/blog/blog-taekwondo-poomsae-forms-explained) | accessed | Guia editorial secundário |
| 4 | [Referência 4](https://www.scribd.com/document/351007661/Technical-Terminology-ENG) | accessed | Prévia secundária de upload |
| 5 | [Referência 5](https://www.goodreads.com/book/show/129615963-new-kukkiwon-taekwondo-textbook-5-volumes-set) | accessed | Catálogo bibliográfico secundário |
| 6 | [Referência 6](https://www.scribd.com/document/373781487/Tkd-Dictionary-2016-Revision) | accessed | Prévia secundária de upload |
| 7 | [Referência 7](https://www.mastkd.com/2026/09/taekwondo-terminology-an-educational-guide-based-on-kukkiwons-taekwondo-textbook/) | accessed | Artigo didático secundário com alegação de autorização |
| 8 | [Referência 8](https://www.koreanbook.de/en/New-Kukkiwon-Taekwondo-Textbook-5-Volumes-Set-English/9791191659085) | accessed | Catálogo comercial |
| 9 | [Referência 9](https://www.koreanbook.de/New-Kukkiwon-Taekwondo-Textbook-5-Volumes-Set-English/9791191659085) | accessed | Catálogo comercial duplicado |
| 10 | [Referência 10](https://www.ubuy.com.ps/en/product/FTR0ANBNK-new-kukkiwon-taekwondo-textbook-5-volumes-set-english) | blocked | Acesso bloqueado |
| 11 | [Referência 11](http://www.fespt.com.br/img_impressos/WT%20Competition%20Rules%20and%20Interpretation%20(September%2030,%202024).pdf) | accessed | Documento regulamentar primário em espelho federativo |
| 12 | [Referência 12](https://www.scribd.com/document/864049301/WT-Compt-Rules-and-Intrptation-9-2024) | accessed | Prévia secundária de upload de regras antigas |
| 13 | [Referência 13](https://www.researchgate.net/publication/405446036_From_cumulative_points_to_the_'Best_of_Three'_system_a_comprehensive_analysis_of_World_Taekwondo_rule_changes_and_their_performance_implications) | blocked | Acesso bloqueado a depósito secundário |
| 14 | [Referência 14](https://ead-bigmidia.storage.googleapis.com/wp-content/uploads/sites/6/2021/06/TKD-PARA-TODOS-Programa-de-Treinamento-a-Longo-Prazo.pdf) | accessed | Documento de treinamento de longo prazo |
| 15 | [Referência 15](https://fetesp.com.br/regulamentos/) | accessed | Índice federativo local |
| 16 | [Referência 16](https://fpetkd.org/publicacoes/21/02/2010/taeguk-e-poomsae/) | accessed | Artigo federativo local com fontes secundárias |
| 17 | [Referência 17](https://www.reddit.com/r/taekwondo/comments/1x0a5ve/wanting_to_get_into_kukkiwon_style_tkd/) | blocked | Corpo não recuperado |
| 18 | [Referência 18](https://www.taekwondopreschool.com/dan.html) | accessed | Guia secundário de graduações |
| 19 | [Referência 19](https://nocindonesia.ap-south-1.linodeobjects.com/document/asian-youth-games-manama-2025---technical-handbook---taekwondo-1758010193.pdf) | accessed | Manual oficial de evento específico em espelho |
| 20 | [Referência 20](https://fetesp.com.br/existe-esse-tipo-de-situacao-no-taekwondo/) | accessed | Comunicado federativo local |
| 21 | [Referência 21](https://mellenniatkd.com/tkd-patterns) | accessed | Currículo de escola |
| 22 | [Referência 22](https://atkdsjc.com.br/posts/dicionario/) | accessed | Índice associativo de materiais |
| 23 | [Referência 23](https://www.scribd.com/doc/43195258/grading-schedule) | accessed | Prévia secundária de currículo de escola |
| 24 | [Referência 24](https://martialmethodology.wordpress.com/category/taekwondo/page/3/) | accessed | Blog de opinião e metodologia |
| 25 | [Referência 25](https://www.scribd.com/document/420327252/British-Taekwondo-TKD-Generations-Syllabus-2013-3) | accessed | Prévia secundária de currículo de escola |
| 26 | [Referência 26](https://www.taekwondopreschool.com/poomse1.html) | accessed | Guia secundário de formas Dan |
| 27 | [Referência 27](https://taekwondo.fandom.com/wiki/Taegeuk_Chil_Jang) | accessed | Wiki comunitária acessada em recuperação alternativa |
| 28 | [Referência 28](https://www.scribd.com/document/960963849/TAEKWONDO-MANUAL) | accessed | Prévia secundária de manual autoral |
| 29 | [Referência 29](https://taekwondo.fandom.com/wiki/Taegeuk_Il_Jang) | accessed | Wiki comunitária acessada em recuperação alternativa |
| 30 | [Referência 30](https://pt.scribd.com/document/587715746/APOSTILA-TKD-completa) | accessed | Prévia secundária de apostila |
| 31 | [Referência 31](https://www.martialtalk.com/threads/fighting-sparring-stance.122335/) | blocked | Fórum bloqueado |
| 32 | [Referência 32](https://www.scribd.com/document/50082083/manual-de-introduccion-al-taekwondo-wtf) | accessed | Prévia secundária de manual de escola |
| 33 | [Referência 33](https://www.taekwondonation.com/tae-kwon-do-form-2-taegeuk-ee-jang/) | accessed | Guia secundário de Taegeuk 2 |
| 34 | [Referência 34](https://www.scribd.com/document/667495456/L5-Forms-or-Patterns-in-Taekwondo-Group-4-Reporting) | accessed | Prévia secundária de apresentação didática |
| 35 | [Referência 35](https://taekwondoking.com/taekwondo-all-poomsae-name/) | accessed | Guia secundário comercial/editorial |
| 36 | [Referência 36](https://www.taekwondoacademy.fi/taekwondo/tkd-osa-alueet/liikesarja/liikesarjat-poomsae/taeguk-poomset/) | accessed | Guia de escola/associação |
| 37 | [Referência 37](https://springwatertaekwondo.com/learn/patterns/) | accessed | Guia de escola com conflitos de contagem |
| 38 | [Referência 38](https://www.chunma.co.uk/html/reference/patterns/taegeuk/dan-grade.shtml) | accessed | Guia de escola de formas Dan |
| 39 | [Referência 39](https://revpubli.unileon.es/index.php/artesmarciales/article/view/9513) | accessed | Artigo científico secundário para normas |
| 40 | [Referência 40](https://www.isfsports.org/sites/default/files/documents/2024-07/TAEKWONDO%20-%20ISF%20Technical%20Rules%20and%20Regulations%202024.pdf) | accessed | Norma de entidade organizadora com escopo 2024 |
| 41 | [Referência 41](https://paak.club/en/training/taekwondo/kyorugi-rules/) | accessed | Comentário secundário atualizado |
| 42 | [Referência 42](https://www.ontario.ca/document/amateur-combative-sport-rules-taekwondo/part-iv-competition-requirements) | accessed | Norma governamental de jurisdição local |
