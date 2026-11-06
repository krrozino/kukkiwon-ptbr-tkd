# Segurança — Taekwondo para Todos

Relatos de vulnerabilidades devem ser encaminhados privadamente ao mantenedor.
Quando habilitado, use Security → Report a vulnerability no repositório.
Não publique vulnerabilidades exploráveis nem credenciais em Issues públicas.

- Cloudflare API Token, Account ID e chaves privadas permanecem fora do código.
- Para Supabase no navegador, só utilizar chave sb_publishable_* e políticas RLS corretas; nunca service_role ou sb_secret_*.
- Conteúdo técnico em research/draft exige fontes e revisão humana antes da publicação.
- Dependabot propõe alterações semanalmente, mas não faz auto-merge nem deploy.
- Produção usa workflow manual protegido por confirmação; Releases indicam versões efetivamente implantadas.

Para incidentes, revogue/rotacione credenciais comprometidas, preserve logs mínimos sem segredos, abra issue privada e prepare rollback.
