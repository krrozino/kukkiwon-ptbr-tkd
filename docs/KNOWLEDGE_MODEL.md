# Modelo de conhecimento e pesquisa editorial

## Sentidos e afirmações por campo — Issue #42

A [ADR-009](adr/009-term-senses.md) propõe `term_senses` (N:1 com termos) e
`term_field_claims` (afirmações/variantes documentais, opcionalmente por sentido).
O SQL `20261107024730_term_senses_and_field_claims.sql` **não foi aplicado**.
As identidades e consultas legadas permanecem compatíveis; não há integração
automática com a UI, pesquisa, aliases de busca, Poomsae ou currículo escolar.

Cada sentido exige evidência privada com `field_name=<sense_kind>_meaning` e
`observed_value` igual à string `meaning`. Uma afirmação exige `field_name` e
`observed_value` iguais ao seu campo/valor. O candidato da evidência deve ter
`matched_term_id` igual ao termo canônico. A evidência ainda não vinculada a uma
identidade permanece exclusivamente na pesquisa. Fontes suplementares de um
sentido podem ser registradas como afirmações separadas do mesmo sentido, sem
sobrescrever sua evidência primária ou resolver divergências automaticamente.

`src/lib/term-semantics.ts` fornece tipos, projeções explícitas e dois contratos:
`validateTermSemantics(unknown)` aceita pesquisa offline;
`parsePublishedTermSemantics(unknown, termId)` rejeita qualquer rascunho, termo
divergente, vínculo de sentido incompatível ou dado privado. A autorização de
pais/regiões é responsabilidade da RLS, não desse decoder. Consultas futuras devem
selecionar `TERM_SENSE_COLUMNS`/`TERM_CLAIM_COLUMNS`, filtrar `term_id` e publicação,
ordenar por ID e paginar; não usar `select=*`. O decoder recebe `{senses,claims}`.
Essa integração só pode ser habilitada depois da aplicação/homologação separada.

Bibliografia pública é uma projeção de cinco campos do snapshot da evidência,
com edição/ano opcionais. O SQL aceita um subconjunto conservador de URLs HTTPS:
DNS com TLD alfabético, sem IP/credenciais/espaços/backslash; porta até 65535.
O TypeScript reaproveita `safeReferenceUrl`. Metadados corrigidos posteriormente
não reescrevem a referência histórica; uma nova evidência requer nova revisão.

Fixtures em `tests/fixtures/term-semantics.json` demonstram Dwitgubi, Ageumson,
Dwichuk e Dwikkumchi, todos `research`/`draft`, sem assinatura humana. Dwitgubi
preserva `Duit kubi` como grafia candidata de outra fonte. Significados literais e
pronúncias sem evidência lexical não foram preenchidos. Regiões ilustrativas
podem continuar sem Hangul; vínculos técnicos usam `body_region_terms` existente.

O smoke `supabase/tests/term_senses_authorization.sql` foi preparado para uma
instância **local isolada e descartável**, via `psql -X -v ON_ERROR_STOP=1 -f ...`.
O script foi executado no PGlite e também em PostgreSQL portátil 17.11 real.
A integração em PostgREST 16.5 verificou requisições com JWTs locais, projeções,
recusa de escrita e revogação. Os binários já estavam disponíveis; não houve
instalação de serviço nem uso de banco remoto. Supabase Auth completo, comparação
do schema hospedado e aprovação humana permanecem pendentes antes da aplicação.

A migração `20261106152500_knowledge_research_and_poomsae.sql` é uma proposta local aditiva, executada apenas nos bancos efêmeros PGlite dos testes. Não foi aplicada ao projeto Supabase, não cria conteúdo e não publica nenhum registro. As 108 entradas atuais continuam com suas identidades, fontes e estados existentes.

## Reaproveitamento do esquema

| Necessidade | Identidade e relações utilizadas |
| --- | --- |
| Técnicas, famílias e variantes | `public.technical_terms`; `record_kind` e `public.term_relations`, preservando relações direcionais com fonte |
| Aliases e grafias alternativas | `public.term_aliases`; um alias não transforma família e variante em sinônimos |
| Anatomia, superfícies e alvos | `technical_terms` com `record_kind=surface/anatomy`; `public.body_regions` e `public.body_region_terms` com contexto e localizador existentes |
| Terminologia | `technical_terms` admite a classe adicional `terminology`; não há outro catálogo de termos |
| Poomsae | `technical_terms` admite `poomsae`; duas novas tabelas relacionam a forma e seus passos às identidades canônicas |
| Documentos e localizadores | `public.content_sources` e `public.term_sources`; evidências novas referenciam os mesmos documentos |
| Mídias e direitos | `public.term_media` e o fluxo escolar existente; permanecem as exigências de autoria, licença/permissão e evidência de direitos |

O vínculo anatômico antigo não ganhou `checked_at` ou selo de revisão humana. Sua presença e sua fonte não provam que a execução ou a classificação anatômica foram aprovadas por especialista. A nova estrutura não altera essa interpretação.

## Pesquisa privada

O esquema `knowledge_research` não recebe `USAGE`, privilégios de tabela, sequência ou função para `PUBLIC`, `anon` ou `authenticated`. As sete tabelas usam RLS sem políticas de acesso. Há revogação dos privilégios padrão para os objetos futuros criados pelo proprietário desta migração. A integração pública não consulta esse esquema.

| Tabela | Função e garantias |
| --- | --- |
| `import_batches` | Chave externa do lote, SHA-256 do arquivo original e documento/localizador obrigatório; chave de lote única |
| `candidates` | Conteúdo bruto por registro, tipo de candidato e correspondência opcional a `technical_terms`; identidade única dentro do lote |
| `field_evidence` | Campo, valor JSON observado, documento e localizador individual; uma fotografia dos metadados bibliográficos é capturada pelo banco a partir de `content_sources` |
| `change_proposals` | Alterações propostas como objeto JSON, motivo, candidato, alvo canônico opcional e referência opcional à proposta substituída |
| `human_reviewers` | Lista editorial administrada por conexão confiável, vinculada a `auth.users`; desativar preserva decisões anteriores |
| `human_approvals` | Decisão `approve`, `reject` ou `needs_changes`, justificativa e identidade obtida de `auth.uid()` |
| `editorial_events` | Registro de inserções de lotes, candidatos, evidências, propostas e decisões; registra também criação, alteração e exclusão das relações de Poomsae |

Lotes, candidatos, evidências, propostas, decisões e eventos são imutáveis depois da inserção: `UPDATE`, `DELETE` e `TRUNCATE`, inclusive com `CASCADE`, são bloqueados por triggers. Correções acrescentam novas evidências, novas propostas ou novas decisões. Não se apaga uma decisão para fingir que ela nunca existiu.

A evidência exige localizador não vazio por campo. Seu `source_snapshot` é sempre obtido do documento canônico pelo trigger, mesmo que um importador tente fornecer outro objeto. Uma correção bibliográfica posterior não reescreve a citação já capturada. O SHA-256 do lote identifica o arquivo, mas a verificação de que ele corresponde aos bytes recebidos pertence ao importador; o banco não possui o arquivo original para refazer o hash.

Uma aprovação exige usuário autenticado que conste como revisor ativo. O banco rejeita uma identidade fornecida que diverge de `auth.uid()`, atribui a identidade e o horário atuais e exige, para cada chave do `patch`, uma evidência do mesmo candidato com campo e valor iguais. Uma evidência de tradução não cobre Hangul, execução, pronúncia ou anatomia. A existência de evidência é uma condição estrutural: a decisão de que ela sustenta a afirmação é responsabilidade do revisor.

Uma aprovação acrescenta uma decisão ao histórico; ela não aplica o `patch`, não muda `editorial_status`, não preenche `term_sources.checked_at`, não insere um termo e não publica conteúdo. Não existe função de promoção automática. Propostas são dados, nunca comandos SQL. A eventual aplicação de uma proposta exigirá um serviço com validação explícita dos campos e nova autorização editorial.

## Contrato público de Poomsae

As tabelas nascem vazias. Nenhuma forma, sequência, requisito de faixa ou equivalência técnica é inferida do lote de pesquisa.

`public.poomsae_forms` possui `term_id` como chave primária e chave estrangeira de `technical_terms`, `sequence_version` como texto não vazio, `source_id`, `source_locator`, `publication_status`, `checked_at`, `approved_at` e `created_at`. O termo pai precisa ser do tipo `poomsae`.

`public.poomsae_steps` possui `id`, `poomsae_term_id`, `step_number` inteiro positivo, `technique_term_id`, `instruction_pt` opcional, `source_id`, `source_locator`, `publication_status`, `checked_at`, `approved_at` e `created_at`. O par `(poomsae_term_id,step_number)` é único. O movimento deve apontar a uma técnica ou variante, e cada passo tem sua própria fonte e localizador. Números com lacunas permanecem com lacunas; o modelo não declara que uma sequência está completa nem inventa passos ausentes. A versão está na forma; versões históricas ficam nos eventos, sem manter duas sequências correntes na mesma identidade.

Publicar ou alterar uma forma/passo que continuará publicado exige novamente `auth.uid()` de um revisor ativo, fonte conferida com data não futura e assinatura atribuída pelo banco. Uma assinatura arbitrária enviada pelo importador é rejeitada. Rascunhos não conservam assinatura de aprovação. A criação e a mudança de estado são registradas com o conteúdo anterior e o novo conteúdo quando houver alteração. `TRUNCATE` das duas tabelas é bloqueado, para que não contorne o histórico de exclusões.

`anon` e `authenticated` recebem somente `SELECT` nas colunas listadas acima. `approved_by` é privado e não pode ser solicitado por `select=*`; o adaptador deve usar projeção explícita. Nenhuma escrita pública é concedida.

A RLS libera uma forma somente quando ela e o termo pai estão publicados. Libera um passo somente quando ele, a forma pai e o termo de técnica/variante estão publicados. Retirar o termo ou a forma de publicação esconde seus passos sem alterar ou apagar o histórico. Documentos ficam visíveis somente se houver termo, forma, passo, relação técnica ou vínculo do atlas público que os referencie; documentos usados apenas pela pesquisa continuam privados. As políticas permissiva e restritiva de fontes foram ampliadas preservando a correlação explícita por `source_id`. A leitura de `term_relations` aplica sua própria RLS, que exige a relação e ambos os termos publicados; a leitura de `body_region_terms` exige termo e região publicados. Assim, uma fonte usada somente por um desses vínculos pode aparecer na referência pública e deixa de aparecer quando qualquer pai deixa de estar publicado, sem conceder acesso a outros documentos. A disponibilidade bibliográfica do vínculo do atlas preserva a semântica editorial legada e não acrescenta aprovação técnica.

Os relacionamentos PostgREST mantêm os nomes padrão `poomsae_forms_term_id_fkey`, `poomsae_steps_poomsae_term_id_fkey` e `poomsae_steps_technique_term_id_fkey`. A integração opcional deve permanecer com `PUBLIC_KNOWLEDGE_SCHEMA=false` até a aplicação revisada da migração e a existência de dados realmente aprovados. A aplicação dessa migração e a implementação de um serviço editorial são trabalhos posteriores.

## Limites da identidade e da imutabilidade

Não foi criado endpoint de revisão nem concedido acesso editorial a contas comuns. A sessão local do laboratório não é autenticação e seus nomes, datas, checklists e propostas não podem ser importados como assinatura humana. O fluxo futuro precisa validar o token Supabase no servidor e transportar seu sujeito autenticado para a transação. Não deve inferir autorização de `user_metadata` ou aceitar um UUID de revisor enviado no corpo da requisição.

`auth.uid()` lê o contexto autenticado estabelecido pelo gateway. Uma conexão SQL privilegiada pode falsificar esse contexto, alterar a lista de revisores ou desabilitar triggers. Os testes verificam a fronteira de visitantes e contas comuns e as regras de uma conexão editorial confiável; a estrutura não promete inviolabilidade contra o administrador do banco. Da mesma forma, eventos com `actor_kind=human` identificam uma sessão autenticada, não constituem prova externa de que uma pessoa leu um documento. A habilitação de um revisor e a concessão de credenciais administrativas são atos de confiança externos a essa migração.

As regras de publicação legadas de `technical_terms` permanecem compatíveis. Este trabalho não atribui identidade humana retroativa aos registros antigos e não converte extração documental em revisão técnica. Mídias continuam no modelo existente, sem upload de figuras institucionais ou autorização de direitos inventada.

## Verificação local e aplicação futura

O comando `supabase --help` falhou porque o executável não está instalado nem no PATH, nem em `node_modules/.bin`, nem nas localizações comuns do usuário. Por isso foi criado um arquivo versionado local consistente com o repositório, conforme a exceção autorizada para este trabalho. Não foram executados `db push`, `apply_migration`, advisors remotos ou qualquer consulta ao projeto Supabase. Ao preparar a aplicação futura, confirmar a versão e os comandos disponíveis na CLI antes de gerar o plano; a [mudança da CLI v3](https://supabase.com/changelog/supabase-cli-v3) foi consultada junto com o changelog em 06/11/2026.

Os testes executam as migrações SQL reais em PGlite, criam fixtures isoladas e alternam os papéis PostgreSQL reais. Cobrem RLS, privilégios, evidência por campo/valor, assinatura e revisor ativo, imutabilidade, snapshot bibliográfico, publicação e atualização de Poomsae, passos duplicados, identidade privada e remoção de visibilidade por mudança no termo. Quatro regressões de fontes exclusivas verificam referências usadas somente por uma relação técnica ou um vínculo do atlas, incluindo ocultação após retirar qualquer termo pai ou região de publicação. Há teste que importa os três lotes atuais antes da nova migração e compara todas as linhas das oito tabelas de catálogo antes/depois, exigindo 108 rascunhos preservados. A asserção legada de quantidade foi atualizada de oito para dez tabelas de catálogo, mantendo a mesma exigência de RLS sem escrita pública.

Comandos reproduzíveis: `npx vitest run tests/knowledge-database.test.mjs tests/database.test.mjs --reporter=verbose` e `npm test`. Os testes `.mjs` são executados pelo Vitest atual; não foi necessário alterar sua configuração. Eles não substituem a validação futura em um stack Supabase/PostgREST real, as verificações do ambiente de produção ou a revisão humana do conteúdo.

As decisões de isolamento e privilégios seguem as orientações oficiais de [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) e de [proteção da Data API](https://supabase.com/docs/guides/api/securing-your-api), consultadas neste trabalho. Não há funções `SECURITY DEFINER` novas; as funções usam `SECURITY INVOKER`, `search_path` vazio e execução revogada para papéis públicos.


## Exibição dos sentidos documentados (candidata de UI, Issue #50)

A ficha de técnica e a ficha contextual podem renderizar `TermSemanticsPanel`, que consulta `term_senses` e `term_field_claims` **apenas se as duas flags estiverem explicitamente habilitadas**:

- `PUBLIC_KNOWLEDGE_SCHEMA=true` — pressupõe aplicação/homologação da migração de pesquisa;
- `PUBLIC_TERM_SEMANTICS_SCHEMA=true` — pressupõe também aplicação/homologação de `20261107024730_term_senses_and_field_claims.sql`;
- `PUBLIC_CONTENT_REVIEW` diferente de `true` — mantém separação de pesquisa pública e catálogo.

**Por padrão, `PUBLIC_TERM_SEMANTICS_SCHEMA=false` e nenhuma consulta às novas tabelas é feita.** A compilação de produção existente não habilita a flag. Não configurar `true` apenas para mostrar conteúdo: a fonte e a revisão de cada campo são obrigatórias. A publicação oficial permanece processo separado.

O leitor faz duas consultas explicitamente limitadas a linhas `published`, seleciona apenas colunas públicas, valida termId e decodifica/recusa linhas inválidas. O banco mantém a decisão de visibilidade por RLS. Cada significado e grafia é mostrado com documento/link/localizador próprio, sem atribuir aprovação a interpretações que continuam em pesquisa. Quando não existem linhas publicadas, a seção não é desenhada; a ficha legada permanece disponível.

A integração da UI não aplica migração nem promove rascunhos. As PRs #48/#52 de visualização do atlas seguem paralelas e não foram modificadas nesta etapa.
