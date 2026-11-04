# Sprint 01 — conteúdo, catálogo e atlas

Especificação: [Issue #8](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/8).
Base: `feat/first-20-kukkiwon-2012`. As PRs #1, #4 e #7 permanecem encadeadas.

## Conteúdo e contagens

| Situação | Quantidade |
| --- | ---: |
| Registros herdados de #7, marcados `document_checked` naquele trabalho | 20 |
| Novos candidatos com nomes localizados no texto primário por extração automatizada | 85 |
| Total versionado em revisão | 105 |
| Novas conferências humanas realizadas nesta sprint | 0 |
| Novos registros publicados ou importados no Supabase remoto | 0 |
| Novas regiões propostas em rascunho | 16 |
| Vínculos anatômicos propostos, também em rascunho | 20 |
| Relações explícitas de variante, em rascunho | 4 |
| Duplicatas no conjunto aceito | 0 |
| Registros descartados do lote proposto | 0 |
| Pontos de grafia/extração sinalizados para revisão | 3 |

O lote novo tem 12 chutes, 15 defesas, 11 socos, 6 bases, 5 termos de preparação de poomsae, 3 ataques com dedos, 7 ataques de mão, 5 outros golpes, 3 entradas de cotovelo, 2 de joelho e 16 regiões/superfícies/configurações corporais. As categorias são editoriais, não uma classificação oficial nova.

`content/review/kukkiwon-2012-expansion.json` contém a referência compartilhada do documento e localizador individual por verbete. As quatro variantes apontam à sua família e à passagem `<use>`, sem transformá-las em sinônimos globais.

Todos os 85 novos registros são `research` / `draft`. O fato de uma extração localizar os nomes não substitui a conferência humana do par Hangul/romanização, da tipografia, da tradução ou da técnica. Definições e traduções são propostas editoriais com auxílio de IA; não são traduções oficiais. O importador não preenche `checked_at` automaticamente, inclusive ao gerar SQL para um lote legado.

## Fontes consultadas e limites

- **Texto primário acessível:** [Kukkiwon — Taekwondo Technical Terminology](https://research.kukkiwon.or.kr/homepage/boardMedia/11621). O colofão informa primeira publicação inglesa em 31/12/2011; o prefácio é de 01/03/2012. Os localizadores usam seção e nome de verbete; números de página do extrator não foram promovidos a páginas impressas. Não foi versionado o livro, sua extração integral ou suas imagens.
- **Comunicado acessível, livro `not_accessible`:** [publicação dos cinco volumes de 2022](https://m.kukkiwon.or.kr/eng/board/read?boardManagementNo=49&boardNo=1688&menuLevel=2&menuNo=91&page=11). Confirma a existência dos volumes, incluindo Basics e Poomsae, mas não fornece seu texto para comparação neste acesso.
- **Comunicado acessível, livro `not_accessible`:** [edição abreviada de 2022](https://www.kukkiwon.or.kr/eng/board/read?boardManagementNo=49&boardNo=1703&menuLevel=2&menuNo=91&page=10). Confirma versões coreana/inglesa e aquisição comercial; não houve compra, download por terceiros ou tentativa de contornar acesso.

Três pontos foram preservados com notas de revisão: `Sewo-jiruegi` aparece assim no cabeçalho extraído; `Jebipum‐chigi` e `Biteureo‐makgi` contêm hífen Unicode. Não se afirma que sejam erros do original: precisam de inspeção visual. Não foi criada equivalência automática para outra grafia.

Não foi feito inventário exaustivo de todos os termos Kukkiwon ou de todas as edições. A seleção implementada prioriza as áreas solicitadas e atinge a meta aspiracional com 85 candidatos rastreáveis, mantendo a comparação de 2022 pendente.

## Funcionalidades

- Atlas com SVGs originais, frente/costas, seis áreas gerais, hover/foco sem consulta de rede, seleção fixa e controles equivalentes por botões.
- Zoom contextual; mãos com palma/dorso e pés com planta/dorso. Hotspots técnicos aparecem somente para regiões publicadas com coordenadas editoriais. A lista acessível continua disponível mesmo sem coordenadas.
- Teclado (Tab, Enter, Espaço e Escape), toque, retorno ao corpo e histórico/deep links `/atlas?region=...`.
- Painel com relações diferenciadas (superfície, alvo, anatomia, movimento), links para ficha e catálogo filtrado.
- Busca no PostgreSQL por português sem acentos, Hangul NFC e romanização com ou sem hífens/espaços, incluindo aliases, sem tratar curingas como comandos.
- Paginação com total, filtros no servidor por categoria/região/família, ordenação estável e índices trigram. A interface recebe 24 itens por página; a API limita cada página a 100.
- Erros, cancelamento de consultas antigas, nova tentativa e vazios editoriais explícitos; sem cache persistente de registros que possam ser retirados de publicação.
- Relações de variante/família com referência e aprovação próprias, metadados de autoria/direitos de mídia e proteção de fontes preservada.

## Dependências de revisão humana e operação

1. Conferir visualmente os 85 pares Hangul/romanização, especialmente os três pontos sinalizados.
2. Revisar as traduções, as definições, as categorias e as relações com especialista em Taekwondo e coreano.
3. Comparar com acesso legítimo às edições 2022; não presumir que o documento antigo continua preferencial.
4. Rever as 16 posições gráficas propostas e os vínculos de superfície/anatomia. As coordenadas são desenho de interface aproximado.
5. Revisar a migração e o SQL gerado em ambiente Supabase isolado. Os testes locais usam PostgreSQL via PGlite; não substituem homologação do PostgREST, extensões e configuração reais.
6. Antes de publicar mídia, preencher autoria, evidência de direitos e licença ou justificativa de incorporação. Não há mídia de terceiros incluída.
7. Somente após a aprovação do mantenedor, aplicar migração/importação ao projeto dedicado. Publicação técnica é uma etapa humana separada e não faz parte do importador.

Não houve alteração de outros projetos, credenciais, merge, deploy Cloudflare, publicação editorial ou escrita no Supabase remoto.

A inspeção remota foi somente de leitura e restrita a `acbostnsohltuaegfkwl`: confirmou sete tabelas com RLS, 20 termos, 20 referências, cinco regiões e cinco vínculos herdados; nenhuma mídia ou alias. Somente as duas migrações anteriores constam no projeto. O advisor de segurança não retornou apontamentos nessa consulta; isso não substitui a revisão e a homologação da migração nova.

## Validação e revisão final

- `npm run content:check`: 105 registros, zero erros; 85 `research` e 20 `document_checked` herdados.
- `npm run check`: Astro e TypeScript, 23 arquivos, zero erros, avisos ou hints.
- `npm test`: 28 testes aprovados, incluindo banco PostgreSQL isolado, publicação, permissões, busca acima de 500 registros e conflitos de reimportação.
- `npm run test:ui`: 22 testes aprovados em Chromium, 11 desktop e 11 mobile com emulação de toque (Pixel 7). Inclui teclado, toque, zoom, retorno do foco, fontes/ficha, erros, vazios, histórico e cancelamento de navegação.
- `npm run build`: cinco rotas estáticas geradas, aprovado novamente após a instalação limpa e a validação completa. Capturas locais de desktop/mobile e detalhes em `test-results/previews/`, ignoradas pelo Git.

A revisão independente produziu três achados antes de ser interrompida por limite de uso do agente revisor, sem emitir veredito final. A revisão do autor concluiu o tratamento desses achados: controller local por navegação e restauração do lado do detalhe, rejeição de conflitos em referências de variantes/vínculos anatômicos e validação dos objetos recebidos no catálogo/atlas. Os casos foram reproduzidos em testes que falharam antes da correção e passaram depois.

Também foi reproduzido e corrigido o erro herdado de correlação de ID na política de leitura de documentos: uma técnica publicada podia ficar sem documento visível ao usuário anônimo. As políticas aditivas corrigem a leitura e mantêm documentos privados fora do resultado. Nenhuma dessas correções foi aplicada remotamente.

A aprovação independente integral antes de integração continua sendo uma pendência de revisão da PR Draft. Não há alegação de validação em celular físico, de integração ponta a ponta com PostgREST remoto ou de comparação com o texto dos livros de 2022.
- `npm ci --ignore-scripts`: instalação reprodutível concluída; auditoria de dependências retornou zero vulnerabilidades conhecidas.
