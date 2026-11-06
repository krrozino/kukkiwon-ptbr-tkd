# Pesquisa documental e banco de conhecimento

Pedido vinculante: missão Programations fornecida em 06/11/2026. Base conferida: `origin/main` em `1383ffdc6d95a2257f9ca4a32c18e4b277d78076`, sem commits posteriores. Checkout anterior preservado em `feat/korean-glossary`.

Durante a execução, a PR #25 avançou a `main` para `4c55b30301c4d77b72a3ae707d8e3814e407ef0a` com governança e releases. Essa atualização foi incorporada à branch A e preservada nas demais branches; não houve merge nesta missão para a `main`, alteração própria do workflow oficial ou disparo de publicação.

## Decisões de implementação

Evoluir o laboratório da PR #24 e os 108 registros existentes. A pesquisa é entrada documental, nunca um segundo catálogo público. Preservar os 13 arquivos recebidos com hashes, comparar os 115 candidatos com os lotes atuais e registrar a cobertura das demais entidades e das 42 referências. A classificação documental identifica campos efetivamente conferidos; não equivale a revisão técnica, tradução aprovada ou publicação.

Alternativas consideradas pelo implementador: importar diretamente no catálogo (incompatível com a política editorial); criar outro catálogo (duplica identidade e histórico); manter os originais e uma camada de auditoria ligada ao fluxo atual (escolhida por permitir rastreabilidade sem alterar registros existentes).

Normalização automática limitada a Unicode NFC e quebras de linha. Não remover referências numéricas ou juntar palavras fragmentadas automaticamente. Correções técnicas e linguísticas ficam como propostas com valor original, motivo e localizador. Correspondência por slug é um indício; divergência de Hangul e romanização deve continuar visível. Os 48 candidatos sem correspondência não serão tratados como novas técnicas.

O laboratório abre arquivos locais e exporta sessões de revisão, com checklist, anotações e propostas. Seu fluxo não homologa nem autentica revisores. Aprovação real no banco deve exigir identidade autenticada, evidência e histórico. Reutilizar tabelas públicas existentes; manter pesquisa privada e novas relações bloqueadas por padrão. Migração somente versionada e executada em PostgreSQL isolado.

Integrações públicas consomem somente dados publicados, com fontes e relações conferidas. Poomsae e aprendizagem devem funcionar vazios; não criar sequência técnica nem graduação universal. Recursos dependentes de migração ficam desativados por padrão.

## Restrições globais

- Nenhum deploy, alteração do Worker oficial, migração remota ou gravação no Supabase remoto.
- Nenhuma promoção editorial, revisão humana, assinatura ou data de aprovação inventada.
- Nenhuma alteração dos 108 originais nem das geometrias SVG.
- Nenhuma cópia de figuras ou livros institucionais para o pacote público.
- PRs separadas e dependências explícitas; sem merge automático.

## Entregas e verificações

PR A: originais, inventário, auditoria, normalização, comparação e pipeline reproduzível. PR B: modelo relacional e testes reais de RLS/integridade em PGlite. PR C: laboratório avançado, sessões locais e testes de navegador desktop/mobile. PR D: integrações públicas e fundações educativas com estados vazios. Executar validação de conteúdo, TypeScript, suíte unitária/banco, build, varredura do pacote e Playwright; registrar falhas e limites reais das fontes.
