# Kukkiwon PT-BR TKD

Enciclopédia educacional comunitária de Taekwondo em português, independente, sem fins lucrativos e sem afiliação oficial com a Kukkiwon.

> Projeto em desenvolvimento. Nenhuma técnica será publicada sem conferência documental individual e revisão técnica.

## Infraestrutura planejada

- **Cloudflare:** hospedagem e monitoramento programado.
- **Supabase/PostgreSQL:** catálogo técnico com fontes auditáveis e, futuramente, escolas.
- **GitHub:** código, revisões, migrações e histórico.

A base de pesquisa preliminar não equivale a conteúdo oficialmente homologado.

Contribuições deverão respeitar os direitos autorais e a política de validação de fontes. A licença do código e dos dados será definida separadamente.

## Desenvolvimento e dados

```sh
npm ci --ignore-scripts
npm run validate
npx playwright install chromium
npm run test:ui
npm run dev
```

Use Node 22 atualizado ou 24. Copie `.env.example` para `.env` e configure somente a URL e a chave pública do projeto dedicado para consultar dados publicados. Sem configuração, as páginas mostram o estado de conexão ausente.

O novo catálogo depende da migração proposta nesta sprint; ela não é aplicada automaticamente. O JSON de pesquisa permanece fora da aplicação pública.

- [Relatório da sprint e pendências humanas](docs/SPRINT_01.md)
- [Pipeline offline, esquema, testes e operação](docs/DATA_PIPELINE.md)
- [Política editorial](docs/CONTENT_POLICY.md)

O comando `content:check` valida todos os lotes de pesquisa. `node scripts/content.mjs --sql kukkiwon-2012-expansion` gera SQL para revisão, sem conectar ao banco. A CI verifica dados, permissões, busca e interface; não importa rascunhos nem faz deploy.
