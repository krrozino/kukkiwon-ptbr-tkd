# Supabase — Kukkiwon PT-BR TKD

- Projeto dedicado: `acbostnsohltuaegfkwl` (`sa-east-1`, plano Free na criação)
- Painel: https://supabase.com/dashboard/project/acbostnsohltuaegfkwl
- Migração remota: `20261103205602_catalogo_publico_inicial`
- Estado inicial: quatro tabelas com RLS, zero técnicas publicadas, sem importação preliminar
- A leitura pública é permitida somente a registros com `publication_status = published`; roles `anon` e `authenticated` não têm INSERT, UPDATE ou DELETE nas tabelas do catálogo
- Para publicar, é exigido `editorial_status = technical_reviewed`, `published_at` e uma fonte com `checked_at` preenchido
- As validações técnicas e editoriais devem ser realizadas fora do banco e registradas antes de publicar; a constraint não substitui validação humana
- Cloudflare monitor não está implantado: código em `workers/keepalive/`, depende de autorizar Cloudflare e configurar segredos
- Consultas periódicas ajudam a indicar atividade mas NÃO garantem evitar suspensão no Free
- Supabase Free não oferece download de backups gerenciados; preparar backup independente antes de uso com dados não recuperáveis
- Nenhuma chave secreta deve ser commitada no repositório
