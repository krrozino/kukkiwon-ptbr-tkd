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
- [Revisão humana das 105 fichas](docs/EDITORIAL_REVIEW.md)
- [Integração das PRs e próxima prévia](docs/INTEGRATION_READINESS.md)

O comando `content:check` valida todos os lotes de pesquisa. `node scripts/content.mjs --sql kukkiwon-2012-expansion` gera SQL para revisão, sem conectar ao banco. A CI verifica dados, permissões, busca e interface; não importa rascunhos nem faz deploy.

A pesquisa Gemini tem [auditoria documental por campo](docs/research/2026-11-06-documentary-audit.md), [inventário e comparação reproduzíveis](content/research/gemini-2026-11-06/AUDIT_REPORT.md) e [laboratório local de observações e propostas](docs/research/LOCAL_WORKBENCH.md). Use `npm run research:audit` para conferir os artefatos versionados. Todos os 115 candidatos continuam em pesquisa/rascunho, sem promoção para o catálogo.

As [fundações relacionais](docs/KNOWLEDGE_MODEL.md) reutilizam o catálogo e acrescentam pesquisa privada, evidências por campo e relações de Poomsae. A [integração pública](docs/KNOWLEDGE_INTEGRATION.md) oferece referências, vínculos explícitos, Poomsae e exercícios derivados somente de conteúdo elegível. `PUBLIC_KNOWLEDGE_SCHEMA` permanece desativado por padrão; a migração proposta não é aplicada automaticamente nem executada remotamente nesta missão.

`npm run preview:prepare` gera uma prévia sem conexão remota em `.preview-build/` e executa Wrangler apenas em dry run. `npm run preview:check` valida esse pacote em um Worker local. Para a validação adicional PostgreSQL/PostgREST, consulte [as ferramentas isoladas](tools/local-validation/README.md). A ferramenta não aceita uma conexão de banco remoto.

## GitHub Releases e versionamento

O site oficial usa publicação manual: o workflow da Cloudflare compila, valida e realiza um único deploy. **Somente depois do sucesso**, cria a tag e a [GitHub Release](https://github.com/krrozino/kukkiwon-ptbr-tkd/releases) vinculadas ao commit implantado.

- [Processo de publicação e configuração segura de secrets](docs/GITHUB_RELEASES.md)
- [Changelog](CHANGELOG.md)
- [Política de segurança](SECURITY.md)

Releases do software não homologam automaticamente nenhum conteúdo técnico em revisão.
