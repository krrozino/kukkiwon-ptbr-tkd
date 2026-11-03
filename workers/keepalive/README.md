# Monitoramento da saúde do Supabase
Worker independente da hospedagem do site. Consulta `technical_terms` até 3 vezes por dia usando uma chave publishable, sem escrita e sem acesso a dados pessoais.

**Atenção:** Supabase Free pode pausar por atividade insuficiente. Mesmo três consultas por dia NÃO garantem que não pause. A finalidade primária é verificar acesso e registrar falhas; não substitui plano com garantia, alerta e backup.

## Preparação
1. Criar o projeto Supabase **novo** e aplicar a migração após auditoria.
2. `npx wrangler secret put SUPABASE_URL --config workers/keepalive/wrangler.jsonc`
3. `npx wrangler secret put SUPABASE_PUBLISHABLE_KEY --config workers/keepalive/wrangler.jsonc`
4. Testar localmente o evento agendado e validar resposta HTTP.
5. Somente após autorização: `npx wrangler deploy --config workers/keepalive/wrangler.jsonc`

Cron: 09:17, 15:17 e 21:17 UTC. Sem requisição externa ao site, sem commit diário e sem deploy. Os erros aparecem nos logs Cloudflare. Ativar notificações separadas para falhas, se necessário.
