# Atlas de cabeça e pescoço — Issue #90

Conferência documental em 23/11/2026. Os seis recortes ilustrativos, seus IDs e os traçados originais foram reaproveitados. A máscara da vista detalhada de cabeça usa a união dos contornos existentes para manter clicável a junção do queixo com o pescoço.

## Evidência por recorte

A referência técnica é o §10 de *Introductory remarks*, p. 10 do PDF da edição inglesa (2011/2012). As traduções PT-BR abaixo foram feitas para o projeto. O manual separa o grupo de áreas gerais da lista de alvos detalhados. [Kukkiwon, *Taekwondo Technical Terminology*, §10](https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=10)

| Recorte e vista | Classificação, significado e localização na fonte | Grafia e romanização |
| --- | --- | --- |
| `head-face` · anterior | Anatomia ilustrativa da face. **Rosto** é área-alvo geral no §10, «Target areas». **Filtro labial** é alvo detalhado no §10, «Detailed Target», fora da lista de recortes próprios. | **Eolgul** e **Injung** vêm do §10. [얼굴, acepção 1](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=17183&nation=eng) e [인중, definição](https://krdict.korean.go.kr/kor/dicSearch/SearchView?ParaWordNo=72623) confirmam a grafia e o sentido lexical. |
| `head-forehead` · anterior | **Testa** é região ilustrativa. O §10 consultado não a enumera separadamente. | Lacuna para nome técnico e Hangul. |
| `head-temples` · anterior | **Têmporas** são ilustradas bilateralmente. O §10, «Detailed Target», inclui *temple*. | A página consultada apresenta o nome em inglês. Ficam em aberto o Hangul e a romanização técnica. |
| `head-chin` · anterior | **Queixo** corresponde a *chin*, no §10, «Detailed Target». A lista usa *tteok mit* em outra entrada, relativa à região sob a mandíbula. | [턱, acepção 1](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=71475&nation=eng). **Teok** segue a norma revisada a partir do verbete. |
| `head-occiput` · posterior | **Nuca e região posterior da cabeça** é região ilustrativa. A menção genérica a *head* no §10 não delimita a nuca. | Lacuna para nome técnico e Hangul. |
| `head-neck` · ambas | **Pescoço** corresponde a *neck*, no §10, «Detailed Target». O recorte de ambas as vistas indica a região como um todo. | [목, acepção 1](https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=89861&nation=eng). **Mok** segue a norma revisada a partir do verbete. |

O Instituto Nacional da Língua Coreana documenta as regras usadas para **Teok** e **Mok** nas tabelas de vogais e consoantes. O §10 inglês não apresenta essas duas romanizações. O *Oelgul* de *Oelgul-makgi* ocorre no §4, em um nome de técnica. *Olgul* aparece como variante em um material relacionado da Biblioteca. O Atlas mantém a grafia **Eolgul** da entrada geral do §10. [Norma de romanização, capítulo 2](https://www.korean.go.kr/front_eng/roman/roman_01.do) · [Kukkiwon, §4, p. 6 do PDF](https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=6) · [Ficha de defesa ascendente](https://github.com/krrozino/kukkiwon-ptbr-tkd/blob/06cbeb35553eb1a886212a1fcf296f51563e6fbd/src/data/kibon-cards.json)

As propostas de `content/glossary/review.json` foram consultadas para cotejo. A projeção usa apenas registros próprios com referência por campo. A pronúncia didática PT-BR aguarda validação editorial. O uso de «alvo» segue a classificação terminológica do manual, com os recortes mantidos como representações didáticas.

## Validação e próxima etapa

A prévia em `/atlas?region=head&zoom=1` oferece seleção por desenho e legenda. O link direto abre a vista do recorte quando ela não foi especificada. A troca de vista preserva a ficha e anuncia a vista onde o recorte fica. O botão Voltar do navegador restaura a seleção ao retornar da Biblioteca e dos Fundamentos.

## Refinamento anatômico, visual e qualidade

O refinamento visual preservou os seis IDs, as descrições ilustrativas, os termos documentados (`Eolgul`, `Injung`, `Teok`, `Mok`), as fontes por campo e o comportamento de URL/histórico:

- **Face, testa, têmporas e queixo:** contornos orgânicos acompanhando a linha do cabelo na testa, têmporas restritas à região temporal lateral, curva contínua de bochechas e mandíbula e preservação da máscara de seleção no queixo.
- **Vista posterior e pescoço:** separação visual entre `head-occiput` (região posterior da cabeça/nuca superior) e `head-neck` (pescoço posterior via `backPath`), remoção do contorno de queixo na silhueta posterior (`headSilhouetteParts`) e suavização da transição pescoço–gola–ombros.
- **Legibilidade facial:** sobreposição dos traços de olhos, nariz e boca (`HeadFeatureOverlay`) acima dos preenchimentos nos temas claro e escuro.
- **Consistência bibliográfica e SonarCloud:** referência em `src/lib/public-head.ts` alinhada à edição `2011/2012` do manual; os três apontamentos da PR #91 em `src/components/Atlas.tsx` (`typescript:S3776` em `resolveStaticAtlasLocation` e 2x `typescript:S3358` em ternários aninhados do painel lateral) foram resolvidos com extração de helpers (`parseView`, `CatalogAreaLinks`, `AtlasCatalogSidebar`).

- [Capturas desktop (antes · 980a37e)](./cabeca-pescoco-issue-90-desktop.jpg)
- [Capturas mobile (antes · 980a37e)](./cabeca-pescoco-issue-90-mobile.jpg)
- [Capturas desktop (depois)](./cabeca-pescoco-issue-90-depois-desktop.jpg)
- [Capturas mobile (depois)](./cabeca-pescoco-issue-90-depois-mobile.jpg)
- [Comparativo antes/depois](./cabeca-pescoco-issue-90-comparativo.jpg)
