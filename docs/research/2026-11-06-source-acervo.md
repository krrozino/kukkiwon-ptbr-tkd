# Acervo de fontes e plano técnico — 06/11/2026

Este documento registra as referências iniciais para a expansão do Taekwondo para Todos. **É um inventário de metadados, não um importador de técnicas ou autorização de publicação.** O projeto segue independente, comunitário e não afiliado à Kukkiwon.

## Referências e prioridade

| ID | Fonte | Uso | Estado |
| --- | --- | --- | --- |
| `KUK-2012-TERMINOLOGY` | [Kukkiwon — Taekwondo Technical Terminology (2012)](https://research.kukkiwon.or.kr/homepage/boardMedia/11621) | Fonte principal de Hangul, romanização e terminologia de técnicas/superfícies. Apêndice *Applicable Parts of the Body*. | Metadados conferidos; revisão por item pendente |
| `KUK-2011-TRANSLATION` | [Kukkiwon Institute — versões traduzidas WTA (2011)](https://research.kukkiwon.or.kr/board/result/article/27665) | Comparação de edições/idiomas, inclusive espanhol e inglês. | Documentos e paginação a conferir |
| `KUK-2010-TERMINOLOGY` | [Kukkiwon Institute — terminologia de 2010](https://research.kukkiwon.or.kr/board/result/article/27667) | Histórico das grafias e conceitos. | Extração não executada |
| `KUK-ENG-SPARRING` | [Kukkiwon — grupos de técnicas marciais (board 56)](https://www.kukkiwon.or.kr/eng/board/list?boardManagementNo=56&menuLevel=3&menuNo=73) | Famílias de técnicas e links individuais. | Metadados verificados |
| `KUK-ENG-POOMSAE` | [Kukkiwon — Poomsae (board 55)](https://www.kukkiwon.or.kr/eng/board/list?boardManagementNo=55&menuLevel=3&menuNo=72) | Nomes, filosofia, fontes individuais das formas. | Metadados verificados; sequências não derivadas |
| `KUK-2025-ETYMOLOGY` | [Kukkiwon Research Journal — origem de termos](https://research.kukkiwon.or.kr/board/journal/article/258899) | Contexto etimológico/cultural complementar. | Metadados conferidos |
| `HANRA-ES-BODY` | [Gimnasio HanRa — partes del cuerpo](https://tkdhanra.com/?page_id=2114) | Comparar nomenclatura de mãos, punhos, braços e pés; visual apenas para consulta. | Fonte complementar, direitos de imagem pendentes |
| `TKDBR-PT-GLOSSARY` | [Taekwondo Brasil — dicionário](https://www.taekwondobrasil.com.br/dicionario-de-palavras-coreanas-taekwondo/) | Identificar grafias regionais e aliases PT-BR; verificação contra fonte primária. | Fonte complementar, traduções em revisão |

O inventário estruturado e validado está em [source-registry-2026-11-06.json](../../content/research/source-registry-2026-11-06.json). Não existem PDFs ou imagens institucionais copiadas neste PR.

## Primeiras diferenças encontradas

**Não publicar automaticamente as equivalências desta seção.** Elas são casos de pesquisa para teste e revisão humana.

| Material complementar | Registro 2012 atribuído à Kukkiwon | Distinção necessária |
| --- | --- | --- |
| `Acui son` (HanRa) | `Ageumson (아금손)` | Candidato de grafia correspondente; conferir se função, postura e forma de mão coincidem antes de marcar como alias. |
| `Sonnal dung` (HanRa) | `Sonnaldeung (손날등)` | Grafia espaçada versus romanização documentada; preservar original da fonte. |
| `Pyon son kut` | `Pyeonsonkkeut (편손끝)` | Grafia e conceito de pontas dos dedos exigem definição por postura. |
| `Tuit chuk` | `Dwichuk (뒤축)` | Calcanhar na superfície inferior/posterior da sola, não confundir com `Dwikkumchi`. |
| `Tuit kum chi` | `Dwikkumchi (뒤꿈치)` | Parte posterior do calcanhar próxima ao tendão de Aquiles; identidade distinta de `Dwichuk`. |
| `Duit kubi` (Taekwondo Brasil) | `Dwitgubi (뒷굽이)` | A publicação de 2012 apresenta sentido técnico *Back Stance*; descrição linguística literal exige fonte lexical, e não substitui a denominação técnica. |
| `Palkup` (HanRa) | `Palgup (팔굽)` | Forma de grafia a conferir; conceito de cotovelo é um ponto de ligação entre anatomia e superfície técnica. |

O documento oficial de 2012 tem apêndice de partes do corpo, mas **não garante que cada recorte anatômico arbitrário da ilustração possua um nome coreano oficialmente definido**. Na interface, identificar o que é descrição geral da geometria e o que é termo técnico conferido.

### Origem do PDF

A consulta automatizada da página [pesquisa Kukkiwon](https://research.kukkiwon.or.kr/homepage/boardMedia/11621) apresentou uma cópia PDF hospedada por terceiro; atribuição institucional da obra não equivale a licença para republicar seu texto ou figuras. Usar títulos, localizadores e paráfrases próprias dentro dos limites dos direitos aplicáveis.

## Seis figuras enviadas pelo usuário

Os **seis PNGs foram arquivados sem alteração na Biblioteca pessoal privada** e indexados no Notion com dimensões, SHA-256, identificação visual provisória e política de não redistribuição. O arquivo público **não** inclui os binários nem caminhos privados.

- 01 — corpo completo e termos por região.
- 02 — sete formas/superfícies de mão.
- 03 — close de punho com articulação saliente, identificação técnica por confirmar.
- 04 — detalhe de braço e cotovelo.
- 05 — close do cotovelo.
- 06 — sete superfícies do pé.

Não atribuir automaticamente a origem de cada PNG à página HanRa, embora haja semelhanças; confirmar proveniência e direitos. Criar nova ilustração SVG própria para o site e validar com screenshots e revisão visual.

## Primeiro comando de automação, sem rede

```bash
npm run sources:audit
node scripts/sources-audit.mjs --offline --json
```

O comando valida formato, IDs duplicados, URLs HTTPS em hosts esperados, categorias, estratégias de localizador e restrições de direitos. **Não** acessa a internet, não faz OCR, não grava dados, não conecta Supabase e não habilita conteúdo no site. Os testes unitários exercitam recusa de URLs inseguras, material indevido e publicação acidental.

## Próximas automações (pendentes, não implementadas aqui)

1. Conectores por tipo de fonte e por edição (HTML board, anexo/documento).
2. Descoberta de IDs e localizadores, verificando `robots.txt` e termos de uso, rate limit e cache, sem contornar bloqueios.
3. Extração e normalização conservadora com Unicode NFC, metadados, idioma e grafias por fonte.
4. Comparação `same-term-multi-sense`, `source-spelling-variant`, `historical-translation-conflict`, `unverified-literal-meaning`.
5. Geração de fila de revisão por campo e versão da fonte.
6. Publicação apenas por fluxo humano autorizado; nenhuma mutação remota a partir do coletor.

A regra final do projeto permanece: **CI e publicação de software não homologam conteúdo técnico**.

## Acompanhamento

- [Épico #46](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/46)
- [Painel do atlas #40](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/40)
- [SVG anatômico #41](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/41)
- [Sentidos e evidência #42](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/42)
- [Automação #43](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/43)
- [Primeiro lote editorial #44](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/44)
- [Poomsae #45](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/45)
