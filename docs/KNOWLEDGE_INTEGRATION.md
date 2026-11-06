# Integração pública de conhecimento

Esta alteração oferece componentes reutilizáveis para consultar relações documentais, Poomsae e exercícios derivados de conteúdo publicado. Não publica os 108 registros de revisão existentes, não promove o lote Gemini de 115 candidatos e não adiciona conteúdo técnico de demonstração ao produto.

## Catálogo, atlas e glossário

- `catalog-api.ts` mantém as consultas anônimas de registros publicados. As respostas de vínculos anatômicos, referências e relações entre termos são verificadas antes da renderização. Slugs inválidos e um termo relacionado explicitamente marcado como rascunho causam erro de consulta.
- `KnowledgeReferences.tsx` apresenta instituição, documento, edição e localizador. Apenas endereços HTTPS sem credenciais viram links; uma referência sem URL utilizável permanece como texto. A presença da fonte identifica a origem do conteúdo e não constitui uma nova aprovação técnica.
- `FichaTecnica.tsx` e `TermContext.tsx` reutilizam essas referências. As relações documentadas entre termos podem apresentar suas próprias fontes e localizadores.
- `AtlasRelations.tsx` agrupa os vínculos registrados em superfícies de contato, alvos, movimentos, partes anatômicas e outros vínculos. O atlas permite abrir a ficha contextual de um termo explicitamente relacionado. A escolha de uma região não presume que seu slug seja o slug de uma técnica.
- As ilustrações e suas geometrias não são alteradas. Regiões ilustrativas continuam disponíveis quando o catálogo está vazio. Um vínculo em `body_region_terms` possui origem documental opcional; ele não tem metadados próprios de aprovação humana nesta migração e não recebe esse rótulo na interface.
- O glossário usa somente `technicalSlug` e `segments[].wordId` registrados. Não segmenta nomes coreanos por heurística e não aproxima técnicas por semelhança de grafia. Cartões de palavras apontam para as expressões registradas; fichas publicadas apontam para palavras e expressões com aprovação completa e fonte conferida. O link de uma expressão para uma ficha depende da consulta dessa ficha publicada com referência conferida.
- `content/glossary/approved.json` continua vazio. A separação existente entre o pacote público e a prévia opt-in de revisão permanece em `glossary.ts`; nenhum novo componente importa o lote de revisão diretamente.

## Poomsae

A rota `/poomsae` e o componente `PoomsaeSequence` estão prontos para dados revisados. A ficha de um termo publicado com `record_kind='poomsae'` pode apontar para a sequência.

O adaptador `poomsae.ts` consulta `poomsae_forms` e `poomsae_steps` somente quando **`PUBLIC_KNOWLEDGE_SCHEMA=true`** foi definido no build. O valor padrão é desativado: sem essa configuração, ambos os métodos retornam uma lista vazia sem qualquer requisição às tabelas novas. A página mostra um estado vazio navegável.

Ativar a configuração exige que a migração correspondente já tenha sido aplicada e que existam registros efetivamente aprovados. Esta alteração não aplica migrações nem grava no banco remoto. O adaptador exige status publicado, `checked_at`, `approved_at`, fonte com URL utilizável e termo relacionado publicado. A forma raiz também precisa ter `record_kind='poomsae'`.

Os movimentos mantêm o `step_number` documental, inclusive lacunas. A interface não inventa movimentos, não renumera a sequência para preencher ausências e não declara que um subconjunto publicado representa a forma completa. Cada movimento aponta para a técnica registrada e para a própria fonte. Não há sequência Poomsae pré-preenchida.

## Aprendizado

A rota `/aprender` usa `published-knowledge.ts` e `LearningApp.tsx` para montar uma sessão limitada à primeira página do catálogo, com até 24 fichas. Cada cartão reaproveita literalmente a romanização, o Hangul, a tradução e a definição da ficha. Somente termos publicados com tradução e ao menos uma fonte conferida, com localizador e URL HTTPS válida, entram na sessão. Rascunhos, referências malformadas e registros sem evidência elegível não produzem exercícios.

O quiz reutiliza traduções distintas de cartões elegíveis como alternativas. Sem duas traduções distintas, o quiz não é exibido. Os exercícios não produzem novas instruções de execução nem interpretações técnicas. Cada resposta permite consultar a ficha e suas fontes. O baralho vazio tem links para o glossário e o catálogo; uma falha de rede é apresentada como erro com opção de tentar novamente.

As fixtures de técnicas, fontes, formas e movimentos existem somente nos testes. Não há seed, cache editorial alternativo, aprovação automática, persistência de notas ou requisito de graduação derivado destes exercícios.

## Verificação

Foram escritos testes antes da implementação e observadas falhas para os adaptadores ausentes, os estados de aprendizado ausentes, a renderização de Poomsae e o aceite indevido de vínculos/referências malformados. Os testes unitários exercitam os filtros editoriais e as relações explícitas, a ausência de chamadas às tabelas opcionais, a numeração documental e os links seguros.

`tests/e2e/knowledge.spec.ts` cobre Poomsae sem a migração, aprendizado vazio e um cartão derivado de API com fixture isolada. A execução conjunta com `atlas-polish.spec.ts` e `glossary.spec.ts` passou nos projetos desktop e mobile: **24 testes**. O atlas preservou tooltip, seleção, recortes e navegação existentes; o glossário preservou busca por aliases, popovers e ausência de reflow.

A suíte unitária completa passou com `npm test -- --maxWorkers=1 --hookTimeout=120000`: **18 arquivos e 135 testes**. Uma execução anterior com os limites padrão encontrou timeout de setup do PGlite nas suítes `database`, `knowledge-database`, `schools` e `school-images`; a execução serial completou todas. Após a revisão de compatibilidade do contexto do atlas foi acrescentado um teste unitário para exigir um vínculo explícito antes de abrir a ficha. As verificações de tipos e pacote público do conjunto final permanecem parte da integração da branch.

## Limites

O produto continuará com estados vazios enquanto não houver conteúdo aprovado. A integração não transforma pesquisa em publicação. Os exercícios são uma base de revisão de terminologia, sem trilhas pedagógicas, avaliação de execução física, áudio novo ou progresso persistente. A sessão não percorre todas as páginas do catálogo. A migração e o serviço remoto de publicação continuam sob seu fluxo editorial próprio.
