# Auditoria inicial — cobertura de fontes nas páginas públicas

**Estado inspecionado:** código `main` da versão de trabalho em 06/11/2026 e alterações propostas na [PR #52](https://github.com/krrozino/kukkiwon-ptbr-tkd/pull/52). Isto é um **inventário de implementação**, não prova de que todas as fontes já foram editorialmente conferidas.

| Área | Fonte ou crédito hoje visível | Lacuna | Próxima tarefa |
| --- | --- | --- | --- |
| `/tecnica?slug=...` | `TermContext` usa `KnowledgeReferences` com instituição, edição, localizador e URL | Os campos compartilham uma lista de fontes por termo; significado literal/técnico ainda não têm uma evidência individual por campo | #42 / #50 |
| `/atlas`, superfícies técnicas | **PR #52** renderiza `AtlasSourceEvidence` a partir de `detail.sources` com `hasCheckedSource`; mostra ausência de fonte conferida sem falsificá-la | Necessita merge após UX da #48; campo sem fonte pode ainda ter texto no fluxo legado | #48 / #50 |
| `/atlas`, descrições de zonas ilustrativas | Texto `zone-copy.ts` escrito pelo projeto; **PR #52** adiciona identificação de esquema ilustrativo e link à política de fontes | Geometria/anatomia ainda não foi revisada e o desenho pode carecer de manifesto de autoria; **não atribuir fonte Kukkiwon a recorte inventado** | #41 / #49 |
| `/poomsae`, índice introdutório | Cada card em `PoomsaeApp` usa URL da página Kukkiwon `boardNo` para simbolismo, com nota de resumo editorial | Verificar se as interpretações textuais individuais correspondem a seus links; sequências detalhadas não estão publicadas | #45 / #50 |
| `/poomsae`, sequência homologada (futura) | `PoomsaeSequence` usa `KnowledgeReferences` no formulário e em cada passo | Esquema/migração e revisão técnica não autorizados ainda; nenhuma sequência inventada deve entrar | #42 / #45 |
| `/glossario` | `KoreanExpression` renderiza fontes por palavra/expressão em popover e estado de revisão | O popup pode não oferecer link persistente diretamente no card; separar fonte de cada significado e pronúncia | #50 |
| `/fundamentos/alturas-e-direcoes` | `GlossaryApp` usa termos do glossário aprovado quando disponíveis e alturas/direções ilustrativas | Cards de referência genéricos **ainda não possuem localizador individual**; revisar conteúdos e inserir fonte por card, ou marcar didático | #50 |
| `/catalogo` | `Catalogo` apresenta referência institucional para introdução às famílias; fichas técnicas remetem à página de detalhes e fontes | Link genérico à coleção de movimentos não confirma cada item técnico | #5 / #44 / #50 |
| `/curriculos`, `/escolas` | Conteúdo pode ser próprio de cada escola | Exibir claramente origem/autor do currículo e fonte de cada técnica externa incluída, sem alegar currículo oficial Kukkiwon | #50 |
| `/fontes` | Lista de documentação institucional e critérios | É um índice de bibliografia, **não substitui** atribuição em cada campo | #50 |

## Regra de auditoria

- **Fonte conferida:** URL HTTPS, título/instituição, edição e localizador, `checked_at` real e revisão de campo adequada.
- **Fonte listada:** link em sumário, sem localização do trecho, ainda **não** valida afirmação específica.
- **Conteúdo autoral:** crédito `Taekwondo para Todos`, sem aprovação institucional implícita; se declarar fato anatômico/técnico, precisa de evidência externa.
- **Sem evidência:** marcador honesto, não acrescentar Hangul por transliteração ou fonte aleatória.
- **Imagem externa:** não incorporar sem autorização; imagem gerada pela equipe recebe manifesto da [política de SVGs originais](../ORIGINAL_ATLAS_ART.md).

## Plano de cobertura

1. **Primeira PR #52:** reforçar citações no painel do atlas, testar URLs/marcadores de ausência. **Não concluir #50**.
2. **Lote de revisão de conteúdo:** para cada área, inventariar afirmações e fontes de nível de campo. Números de cobertura só depois de contar afirmações de fato e revisões efetuadas.
3. **Integração de schema #42:** suportar sentidos 1:N e evidências 1:N, sem aplicar no banco remoto sem autorização.
4. **Revisão do UI:** cada card/linha técnica com link e localizador; a página global `/fontes` permanece apenas como índice.
5. **Homologação e release:** testes de segurança/CI, revisão humana e deploy manual separado, respeitando a [política editorial](../CONTENT_POLICY.md).

**Não existe cobertura técnica 100% comprovada neste momento.** A alteração proposta é incremental, sem técnicas novas e sem migrações.
