# Banco v0.2

Projeto Supabase dedicado: acbostnsohltuaegfkwl.

Migração aplicada: 20261103220044_atlas_media_e_integridade_de_fontes.

Novas tabelas: body_regions, body_region_terms, term_media. Todas possuem RLS e acesso público apenas aos dados publicados.

Adicionado gatilho que impede remover a última fonte validada de um termo já publicado.

Nenhum termo, mídia ou região corporal foi importado/publicado. Teste de integridade executado em transação com rollback.

O conteúdo continua exigindo revisão editorial humana antes de publicação.
