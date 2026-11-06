# Auditoria do Deep Research — Taekwondo para Todos

**Escopo:** 89 páginas analisadas; 115 entradas de técnicas extraídas automaticamente das tabelas, 42 itens de bibliografia transcritos.

**Estado de TODOS os registros:** `research` / `draft`, revisões técnicas e linguísticas pendentes, fonte primária individual não conferida. Não aptos à publicação.

## Contagens por família
- chute: 28
- soco: 18
- golpe: 20
- estocada: 6
- defesa: 20
- base: 13
- deslocamento: 3
- autodefesa: 7

## Comparação inicial com 105 + 3 registros do repositório
- exact_slug: 38
- possible_variant_review: 27
- not_found_in_repo_review_batches: 48
- normalized_slug: 2

> Pareamento automático com os registros do GitHub (conteúdo/review) por slug/normalização simples. Não é deduplicação semântica aprovada.

## Problemas detectados
- **WT-2026 (critical)** — WT competitive regulations presented using version September 30, 2024; version in force Jan 1, 2026 exists. **Ação:** Block rule/scoring fields; rewrite only after article-by-article comparison using 2026 primary text.
- **SOURCE-A1 (critical)** — A1 and B1 are marked in nearly all rows without independently checked source page/section. **Ação:** Preserve as author-labelled evidence only; mark individual verification pending.
- **DOC-2022 (high)** — 2022 textbook cited mainly via retailer/book-listing rather than page-level verified original. **Ação:** Do not mark comparison with 2022 done; seek authorized access to textbook.
- **GRADUATION (high)** — Poomsae assigned universally to Gub/Dan, which can represent a school syllabus rather than a global requirement. **Ação:** Separate form identity from school-specific curriculum associations; do not import fixed gradation globally.
- **ID-PDF (medium)** — Narrow columns wrap IDs, Hangul and romanizations mid-word; some IDs lose leading/trailing digits across page boundaries. **Ação:** Keep original cell and proposed ID separately; review anomalies before matching.
- **ANATOMY (high)** — Geometric SVG bounds are prose suggestions and lack validated anatomical landmarks, coordinates and laterality. **Ação:** Do not overwrite atlas SVG with PDF descriptions. Require visual review with anatomy references.
- **COPYRIGHT (high)** — The source is a derivative AI synthesis of protected material; it does not grant image, chart or full-text reproduction rights. **Ação:** Use original independent wording, SVGs and links to authorized media, not copied figures.
- **HISTORICAL-DATE (medium)** — Text simultaneously says Kukkiwon founded 1972 and cites 1973 in foreword; 1972 opening and 1973 naming/activities are distinct dates. **Ação:** Use precise dates from Kukkiwon chronology, not a generic single founding date.
- **TAEGEUK-FOOTNOTES (medium)** — Table counts include superscript citation digits (e.g., 183, 1834, 203, 2034) that appear as 183/1834 rather than 18/20. **Ação:** Separate count from footnote only after checking sources; do not store numeric count by naive digit parsing.
- **SAFETY-SELFDEFENSE (high)** — Some self-defense rows describe high-risk joint/neck maneuvers and vulnerable targets. **Ação:** Keep offline; route to qualified human instructor/safety review before any instructional publication.

## Uso responsável

O relatório do Gemini é um índice secundário de investigação, não uma fonte primária técnica. As equivalências de português, romanização, alvos e execução não foram corrigidas automaticamente. Não usar importação SQL ou publicar o CSV.

O próximo passo é revisão documento-a-documento com localizador no texto da Kukkiwon, validação linguística, professor de Taekwondo e revisão de direitos. Só então converter os registros elegíveis para o schema `content/review` do site e publicar por decisão editorial explícita.
