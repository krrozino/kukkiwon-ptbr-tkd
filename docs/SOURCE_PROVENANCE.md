# Política de proveniência: referência em cada afirmação técnica

**Decisão editorial de 06/11/2026:** toda informação técnica exibida no Taekwondo para Todos deve permitir que a pessoa abra a fonte original diretamente **no contexto em que a informação aparece**. O rótulo "Fonte: Kukkiwon" isolado não é prova suficiente.

## O que é uma afirmação que precisa de fonte?

| Conteúdo exibido | Fonte exigida | Onde exibir |
| --- | --- | --- |
| Termo em Hangul, romanização e pronúncia PT-BR | Documento por campo; a pronúncia PT-BR adaptada indica autoria e verificação | Ficha do termo, junto ao nome/áudio e na seção de fontes |
| Tradução literal e definição técnica | Evidência **separada** para cada sentido, caso não venham da mesma localização da fonte | Abaixo de cada significado ou em "Ver fontes deste significado" |
| Família de técnica, base, chute, defesa, golpe e alvos | Kukkiwon/manual/edição e localizador específico; outra referência quando houver conflito | Ficha da técnica e vínculos |
| Região anatômica meramente ilustrativa | Crédito **original do projeto**, finalidade didática e documentação anatômica se afirmar localização científica | No inspector e no rodapé da figura |
| Superfície técnica de contato | Manual técnico/edição/figura/seção correspondente, com divergência explícita | Ao lado do recorte e na ficha |
| Etapa de Poomsae | Referência de **cada passo** + versão documental | Próximo ao movimento, não apenas no rodapé da forma |
| Contexto filosófico de Poomsae | Board/URL individual e resumo próprio sem inferir sequência de movimento | Em cada card do índice |
| Currículo de escola | Identificar "Conteúdo de [escola/professor]" e origem editorial; não se passar por currículo oficial Kukkiwon | Cartão de currículo e itens próprios |
| UI, atalhos, navegação e texto operacional | Não são alegações de Taekwondo, normalmente dispensam citação externa | Evitar referências decorativas |

## Modelo conceitual mínimo de evidência

```ts
type ClaimEvidence = {
  claimId: string;
  entityId: string;
  field: "hangul" | "romanization" | "pronunciation_ptbr" |
    "literal_meaning" | "technical_meaning" | "movement" |
    "region" | "poomsae_step" | "context" | "variant";
  sourceId: string;
  institution: string;
  documentTitle: string;
  documentEdition?: string;
  publicationYear?: number;
  officialUrl: string;         // HTTPS e URL de fonte validada
  locator: string;             // ex.: cap. 2, p. 39, boardNo 1347
  checkedAt?: string;          // ausência impede selo "conferido"
  reviewState: "research" | "document_checked" |
    "technical_reviewed" | "published";
  evidenceKind: "primary" | "complementary" | "historical" |
    "editorial" | "illustration_credit";
  distinctionNote?: string;    // por que há mais de um significado?
};
```

Contrato para implementação, não afirmação de que as colunas já existem no Supabase. A eventual migração é **aditiva, localmente testada** e segue [Issue #42](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/42).

## Regras de seleção e apresentação

1. Usar fonte primária da Kukkiwon quando ela realmente contiver o campo; literatura acadêmica ou outros organismos complementam e podem divergir.
2. Cada variante tem sua **própria fonte**, URL e localizador. Não normalizar "Duit kubi" para "Dwitgubi" como identidade técnica sem revisão humana.
3. Não confundir tradução etimológica, significado de uso marcial e tradução adaptada por professor; exibir rótulos claros e notas quando diferirem.
4. Link para a **página específica** (ou DOI/documento), com o localizador mostrado mesmo quando a URL leva ao sumário. Se deep link falhar, não inventar âncora; expor "p. X / seção Y" legível.
5. Usar `target="_blank" rel="noopener noreferrer"`; aceitar apenas HTTPS sem credenciais, sem esquemas `javascript:` ou `data:`. URL sem validação aparece como texto, nunca link clicável.
6. Ausência de fonte: mostrar `Referência documental não disponível para este campo` ou `Termo ainda em pesquisa`. **Não** adicionar fonte falsa "Kukkiwon" nem confundir link genérico ao portal com localizador do dado.
7. Para fonte original do projeto, indicar `Ilustração original — Taekwondo para Todos` e um registro de autoria/arte; isso não é selo de qualidade anatômica nem afirma afiliação.
8. Não copiar trechos grandes, figuras ou vídeos de terceiros por serem acessíveis publicamente; direitos e licenças são processo distinto.
9. Se uma fonte mudar/desaparecer, manter identificação bibliográfica e status, marcar link indisponível, registrar nova fonte ou edição por revisão documentada.

## Situação real do repositório (pré-implementação)

- `KnowledgeReferences.tsx` existe e já exibe instituição, link, edição e seção em fichas e Poomsae publicados.
- `published-knowledge.ts` já contém `safeReferenceUrl` e `hasCheckedSource` com verificação de URL/checked_at/localizador — **reutilizar**, sem criar outra validação incompatível.
- `BodyRegionMap.tsx` e `DetailMap.tsx` exibiam o nome/descrição mas **não renderizavam** `detail.sources` na região. A [Issue #50](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/50) acompanha o preenchimento.
- `PoomsaeApp.tsx` já possui links originais no índice e `KnowledgeReferences` na sequência, mas requer auditoria de fonte **por significado e por movimento**.
- `zone-copy.ts` contém descrições ilustrativas em português, não nomes coreanos oficiais. Não anexar uma referência técnica genérica a toda entrada, nem atribuir fonte sem examinar sua afirmação real.
- O catálogo técnico remoto tinha 105 fichas `draft` e zero técnicas `published` no último inventário. Não publicar o lote em massa nem tirar flags para simular cobertura.

## Checklist de cobertura por PR de conteúdo

- [ ] Para cada afirmação técnica nova, existe registro de fonte, versão e localizador na unidade correta.
- [ ] Hangul/romanização/pronúncia são individualmente justificados, sem transliteração fabricada.
- [ ] Sentidos alternativos têm justificativa e referências independentes.
- [ ] Fonte citada não está sendo usada para endossar uma afirmação que ela não contém.
- [ ] Links externos válidos e acessíveis, sem credenciais; estados de ausência honestos.
- [ ] O frontend mostra a fonte sem esconder a explicação atrás de popovers inacessíveis.
- [ ] Testes negativos: URLs inseguras, `draft`, fonte sem `checked_at` e sem localizador.
- [ ] Pesquisa/agentes não publicam conteúdo; revisão humana identificada antes de promoção.
- [ ] Para mídia, licença/titularidade/autorização e crédito original conferidos separadamente.

## Plano de integração

**PR 1 (Issue #50):** incluir referências de `detail.sources` nas fichas do atlas e estados honestos para áreas ilustrativas.

**PRs seguintes (Issue #50 + #42):** ligar fonte por campo/sentido; auditoria de rotas `/catalogo`, `/glossario`, `/poomsae`, `/fundamentos`, `/curriculos`; testes de cobertura e relatórios de lacunas. O estágio final depende de dados/documentos reais e revisão humana — não é possível afirmar "100% referenciado" antecipadamente.

**Documentos relacionados:** [política editorial](CONTENT_POLICY.md) · [atlas original](ORIGINAL_ATLAS_ART.md) · [pesquisa](research/2026-11-06-source-acervo.md) · [operador](AGENT_DISPATCH.md).
