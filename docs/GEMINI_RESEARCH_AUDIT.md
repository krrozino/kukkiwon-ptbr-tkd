# Pesquisa Gemini — auditoria e preparação editorial (06/11/2026)

Fonte recebida: **Enciclopédia Completa de Taekwondo.pdf** (89 páginas).
SHA-256: \`1550915bb02bfbec0c983a0a461bb8fc7c567028df5dea17942542628e528842\`.

## Resultado de extração (não equivale a validação técnica)

- 115 candidatos técnicos (28 chutes, 18 socos, 20 golpes, 6 estocadas, 20 defesas, 13 bases, 3 deslocamentos, 7 autodefesas).
- Outras tabelas: 16 famílias, 18 modificadores linguísticos, 23 entradas de superfícies, 17 Poomsae, 11 comandos.
- 42 referências bibliográficas; muitas não são institucionais.
- Comparação heurística com 108 registros do repositório (\`content/review\`): 38 slugs exatos, 2 equivalentes por normalização, 27 variantes semelhantes pendentes e 48 sem correspondência próxima. **Não** significa 48 registros novos aprovados.
- 88 alertas de normalização. Alguns são meras quebras de página; 5 IDs da tabela estão parcialmente truncados.

## Principais impedimentos de publicação

1. Regras de competição na pesquisa baseadas em WT 2024; cotejar edição vigente desde 01/01/2026.
2. Notas \`A1\` não substituem localizador de fonte primária individual.
3. Comparação com o livro Kukkiwon 2022/2023 não foi demonstrada por página.
4. Poomsae ligados a graduações específicas representam contexto curricular, não padrão universal.
5. Formatação fragmenta Hangul/romanização/IDs; preservar original e proposta em campos distintos.
6. Superfícies e regiões anatômicas requerem validação geométrica, lateralidade e documentação específica.
7. Nenhuma descrição de autodefesa envolvendo regiões vulneráveis deve ser publicada sem revisão qualificada.

## Fontes prioritárias

- Terminologia Kukkiwon: https://research.kukkiwon.or.kr/homepage/boardMedia/11621
- Edição 2022 de cinco volumes: https://kukkiwon.or.kr/eng/board/read?boardManagementNo=49&boardNo=1688&menuLevel=2&menuNo=91%3FselectMenuCode%3DPE020310&page=10
- Histórico da Kukkiwon: https://www.kukkiwon.or.kr/eng/contents/view?contentsNo=101&menuLevel=3&menuNo=79
- Regras WT de janeiro de 2026: obter PDF vigente diretamente de publicação WT/federação autorizada.

## Como usar o lote localmente

1. Extrair o pacote \`taekwondo_gemini_auditoria_2026-11-06.zip\` entregue na conversa.
2. Executar \`npm run dev\` no checkout local e abrir \`http://localhost:4321/pesquisa-local\`.
3. Selecionar \`tecnicas_rascunho.json\` no formulário; nenhum arquivo é transmitido ao backend.
4. Inspecionar a página indicada no PDF e fonte primária; registrar divergências fora deste laboratório somente sob revisão responsável.

O laboratório é **somente leitura**, não há gravação no Supabase e o componente não importa dados de pesquisa automaticamente. Em builds públicos, a rota é um aviso de área local, sem formulário, sem dados internos. Para integrar fichas ao catálogo público, usar o fluxo normal com conferência documental, revisão técnica/humana e aprovação explícita.

**Nenhum dos 115 candidatos tem status \`document_checked\` ou \`published\` por causa deste PDF.**