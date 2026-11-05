# Pesquisa, importação e arquitetura

## Executar localmente

```sh
npm ci --ignore-scripts
npm run content:check
npm run check
npm test
npm run build
npx playwright install chromium
npm run test:ui
```

Use Node 22 atualizado ou 24. A CI executa essas verificações e não tem etapa de deploy, segredos de escrita ou importação.

O teste de interface compila e inicia Astro Preview local com URL e chave fictícia pública; Playwright intercepta as chamadas externas com fixtures isoladas. Nenhum termo de demonstração é incluído no site ou no banco real. Os testes de banco aplicam todas as migrações em PostgreSQL WASM via PGlite, com roles `anon` e `authenticated`, RLS, gatilhos e extensão trigram reais.

## Contrato editorial

- JSON Schema: `content/schema/research-batch.schema.json`. Validador: `scripts/content.mjs`.
- `content:check` lê todos os lotes em `content/review/`, verifica o esquema, campos obrigatórios, domínio da fonte, duplicatas entre arquivos, referências a famílias/regiões e aliases que perderiam o significado de variantes.
- No formato v1, extrações automatizadas permanecem `research`, com revisão humana pendente e publicação `draft`. O lote legado é compatível com o validador e conserva os estados registrados em #7.
- O catálogo público não importa esses arquivos. Ele consulta somente as tabelas/RPCs protegidas por RLS.

## Prévia e SQL idempotente

Sem argumentos, o CLI apenas valida e imprime contagens. Não lê chaves, não conhece URL de conexão e não tem opção de aplicar alterações.

```sh
npm run content:check
node scripts/content.mjs --sql kukkiwon-2012-expansion > expansion-review.sql
```

O arquivo SQL gerado deve ser revisado antes de qualquer execução. Requer a migração `20261104031036_sprint_catalog_search_relations.sql` e as duas anteriores. Primeiro use um banco isolado, nunca um projeto de outro aplicativo.

Cada carga usa uma transação e bloqueio de escrita nas tabelas envolvidas. Repetir o mesmo lote não duplica registros. Um slug com dados divergentes, status revisado/publicado ou região divergente aborta o lote inteiro e lista os conflitos; não há atualização silenciosa. Fontes duplicadas por URL também impedem a importação. O operador resolve a divergência em novo JSON revisado, sem apagar o histórico. Os testes executam duas cargas e uma carga conflitante no PostgreSQL.

O gerador importa termos, referências, variantes e regiões/vínculos propostos como rascunho. Não atribui revisão documental humana, datas de conferência ou publicação. A reexecução não revoga nem promove decisões humanas.

## Esquema proposto

As sete tabelas herdadas são preservadas. A migração adiciona `term_relations`, com vínculo direcionado, fonte, localizador e aprovação próprios. A leitura pública exige relação e ambos os termos publicados. `record_kind` distingue família, variante, técnica, superfície e anatomia.

`body_regions.atlas_area` deriva da classificação herdada e de uma substituição opcional para braços/pernas. As colunas opcionais `detail_view/x/y` definem apenas a posição no desenho. Regiões sem posição continuam consultáveis pela lista. `body_region_terms.anatomical_role` diferencia superfície, alvo, anatomia e movimento sem alterar a constraint legada de `usage_context`.

`term_media` recebe autoria, licença, evidência e notas de direitos. A nova constraint impede publicar/alterar mídia sem esses dados; foi adicionada como `NOT VALID` para não interromper a migração por linhas legadas. Antes de uma aplicação real, auditar as linhas antigas e validar a constraint separadamente. A RLS e a constraint legada de direitos permanecem.

O gatilho adicional de fontes bloqueia a linha do termo antes de alterar/remover uma referência, serializando alterações concorrentes. O gatilho diferido herdado continua permitindo substituir a fonte na mesma transação. A suíte local cobre o impedimento de remover a última fonte; concorrência entre conexões precisa de homologação em PostgreSQL servidor.

A migração também corrige a correlação de ID na leitura pública dos documentos. Políticas novas, permissiva e restritiva, garantem que apenas documentos vinculados a termos publicados possam ser consultados, preservando os objetos legados. Há teste PostgreSQL que reproduziu a ausência indevida de uma fonte publicada e confirmou a correção com exclusão de documento privado.

## Busca e paginação

`search_catalog(search_query,category_filter,region_filter,family_filter,page_size,page_offset)` é `SECURITY INVOKER`, com `search_path` vazio e permissões explícitas de execução. Ela filtra conteúdo publicado e aplica busca/filtros antes da contagem e da página. Não usa SQL dinâmico. `catalog_facets()` também respeita RLS.

Textos NFC são normalizados por função imutável e indexados com `pg_trgm` em `extensions`. Se uma instalação prévia tiver a extensão em outro schema, adaptar e revisar os nomes dos índices antes de aplicar. A normalização cobre os acentos PT-BR e remove espaços/hífens de busca, preservando os dados de apresentação. Isso facilita `apchagi` / `Ap-chagi`, sem criar aliases oficiais.

A paginação é por offset com ordenação determinística por romanização e slug. Ela atende milhares de registros; mudanças editoriais entre consultas podem mover resultados entre páginas. Uma evolução para cursor/snapshot depende de volume e perfil de uso medidos. Fontes, regiões, mídias e vínculos usam páginas de 100 para evitar o antigo limite silencioso.

Sem cache persistente ou Service Worker para dados do catálogo: cada consulta usa `no-store` e AbortController. Isso prioriza retirada imediata de conteúdo sobre reaproveitamento local. Hover do atlas altera somente apresentação, sem buscar dados.

## Aplicação e reversão

Esta sprint não aplica SQL remotamente. Não há down migration destrutiva. Para recuar a interface, reverter os commits da aplicação e manter as colunas/tabela aditivas; decidir a remoção de objetos novos somente após backup e análise de dependências. Não apagar as migrações históricas.

Referências de implementação: [funções e segurança no Supabase](https://supabase.com/docs/guides/database/functions), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) e [pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html).
