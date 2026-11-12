# Biblioteca de sete áreas — integração do acervo Gemini

Integração incremental da pesquisa Gemini (#65), baseada na main atual e mantendo a geometria da mão da PR #73. Reutiliza 25 fichas do acervo Gemini e as 23 fichas da mão já relacionadas a fontes por campo: 48 itens de navegação, 7 categorias, uma identidade de termo por slug.

O item Taegeuk 1 tinha cinco passos não verificados: os passos foram excluídos da projeção pública. As sequências Sebon/Palgwae não conferidas continuam preservadas em content/research/gemini-library-candidates.json da PR #69; não foram introduzidas neste corte.

As 25 fichas Gemini possuem alegações bibliográficas e terminológicas que ainda carecem de conferência individual de edição/localizador. Preservar a fonte original nos históricos #67/#69 e revisar antes de integrar a produção. A UI não exibe marcadores de fluxo editorial.

Os links de anatomia na biblioteca são gerados apenas para slugs presentes em src/lib/public-hand.ts. A geração de fichas por Astro mantém sete áreas distintas, mesmo quando certas áreas não têm um item específico. Esta entrega não grava no Supabase, não altera currículos escolares nem muda Worker oficial.
