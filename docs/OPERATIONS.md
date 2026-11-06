# Operação, qualidade e segurança

## Princípios

Projeto independente, comunitário, gratuito e sem fins lucrativos. Priorizar precisão das fontes, experiência acessível e proteção dos usuários. O banco é separado de outros produtos e a aplicação pública não recebe segredos.

## Checklist de saúde

| Área | Verificação |
| --- | --- |
| Repositório | `main` protegida; PR/CI obrigatórias; sem bypass |
| Qualidade | `content:check`, `research:audit`, `check`, `npm test`, `build`, Playwright |
| Deploy | Workflow manual; CI de push com SHA exato; tag inédita e Release pós-deploy |
| Site | Rotas HTTP públicas e inspeção visual desktop/mobile |
| Dados | RLS, permissões de escola e `publication_status`; não confundir draft com publicação |
| Conteúdo | Fonte com localizador por campo, revisão humana e direitos da mídia |
| Identidade | Nenhum token privilegiado no navegador; testar Auth e revogação de links |
| Resiliência | Plano de backup/restore fora do Supabase Free quando houver dados críticos |

## Registros de produção

- Repositório: https://github.com/krrozino/kukkiwon-ptbr-tkd
- Worker: https://kukkiwon-ptbr-tkd.kukkiwon-ptbr-tkd.workers.dev/
- Releases: https://github.com/krrozino/kukkiwon-ptbr-tkd/releases
- Histórico de Actions: https://github.com/krrozino/kukkiwon-ptbr-tkd/actions
- Documentação de deploy: [GITHUB_RELEASES.md](GITHUB_RELEASES.md)

**A última versão com Release publicada, e não a versão da `main`, define o que está em produção.**

## O que nunca fazer em CI ou prévia

- Conectar uma fixture a um banco remoto de outra aplicação.
- Migrar o schema editorial sem autorização/backup.
- Publicar automaticamente um conjunto de técnicas apenas por estar em JSON ou em uma tabela.
- Enviar tokens, `.env`, chaves, dados pessoais ou registros de revisão privada a logs.
- Expor `service_role` ou `sb_secret_*`.
- Criar tag de release antes de terminar o Worker e smoke HTTP.
- Executar `wrangler deploy` diretamente sem passar pelos gates.

## Incidentes

1. Identificar gravidade, versão implantada, SHA, alcance e horário.
2. Preservar evidências **sanitizadas** dos jobs/logs e registrar Issue/decisão apropriada.
3. Suspender novos deploys se houver risco de exposição ou estado parcialmente atualizado.
4. Recuperar por correção e nova versão com tag inédita; coordenar rollback se necessário.
5. Se houver vazamento de segredo, revogar e rotacionar imediatamente nos provedores, investigar uso não autorizado.
6. Se houver erro editorial, retirar visibilidade no banco de forma auditável, manter evidência e revisar fluxo.
7. Verificar o resultado em produção e atualizar runbook/Notion com causa e prevenção.

## Supabase Free e backups

Monitorar disponibilidade e consumo. Consultas leves não garantem prevenir suspensão; plano Free não substitui estratégia de backup. Antes de dados reais de alunos, preparar cópia externa/restauração testada, com gestão de acesso e retenção.

## Segurança e suporte

Vulnerabilidades: [SECURITY.md](../SECURITY.md). Conduta: [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md). Responsabilidades: [GOVERNANCE.md](GOVERNANCE.md).