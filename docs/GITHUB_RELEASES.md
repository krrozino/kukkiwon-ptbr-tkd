# Runbook — publicação oficial, GitHub Releases e rollback

O site usa **uma única publicação oficial manual pelo GitHub Actions**, com uma tag SemVer imutável vinculada ao commit que realmente chegou à Cloudflare. O sucesso de PR/CI não implica release. Leia [política de versões](VERSIONING.md).

## Estado e histórico

- Primeira Release confirmada: **[v0.1.0](https://github.com/krrozino/kukkiwon-ptbr-tkd/releases/tag/v0.1.0)** (prerelease), no SHA `445b04818690dfb19e05ad12dae3255ed97246ee`.
- Execução de deploy comprovada: **[#42288285862](https://github.com/krrozino/kukkiwon-ptbr-tkd/actions/runs/42288285862)**, com Worker publicado, cinco rotas HTTP e GitHub Release.
- `v0.2.0` estava no código da `main` após PR #37; no checkpoint de 06/11/2026 não existia GitHub Release confirmada para ela. **Conferir sempre o estado atual de Releases antes de publicar**.
- Incidentes anteriores da v0.1.0: primeiro navegador Playwright ausente no runner, depois token Cloudflare inválido. Ambos foram corrigidos antes da execução bem-sucedida. Os run IDs de falha permanecem registrados nas Issues/logs.

## Pré-requisitos da publicação

1. Alterações integradas à `main` **protegida**, com PR revisada e checks obrigatórios.
2. CI `Validacao (sem deploy)` de evento **push na main**, com `success` no **SHA exato** que será implantado (o workflow confere isso).
3. `package.json` e `package-lock.json` com a mesma versão `MAJOR.MINOR.PATCH`; `CHANGELOG.md` atualizado.
4. Tag `vX.Y.Z` **ainda inexistente** — nunca reutilizar tag, mesmo que uma tentativa anterior tenha falhado.
5. GitHub Environment `production` com os valores corretos, sem divulgá-los:
   - `CLOUDFLARE_ACCOUNT_ID` — ID da conta que hospeda o Worker.
   - `CLOUDFLARE_API_TOKEN` — token ativo e com escopo de edição do Worker nessa conta.
   - `SUPABASE_PUBLISHABLE_KEY` — chave publicável `sb_publishable_*` do projeto dedicado.
6. Confirmação humana de que o deploy da aplicação está autorizado, separada de migração de banco ou promoção de conteúdo.
7. Não haver deploy concorrente; o workflow usa concorrência `kukkiwon-official-production` com `cancel-in-progress: false`.

A Cloudflare usa `wrangler.jsonc`, Worker `kukkiwon-ptbr-tkd`, endpoint:

```text
https://kukkiwon-ptbr-tkd.kukkiwon-ptbr-tkd.workers.dev/
```

**Prioridade de secrets:** quando um segredo com o mesmo nome existe no Environment `production` e no repositório, o valor do Environment prevalece. A validação de presença não prova validade. Um token Cloudflare deve ser testado/rotacionado sem imprimi-lo em logs.

## Procedimento oficial

No GitHub: **Actions → Publicação oficial Cloudflare — manual + GitHub Release → Run workflow**, selecionando **main**.

| Input | Valor |
| --- | --- |
| `confirmacao` | `PUBLICAR` |
| `versao` | `vMAJOR.MINOR.PATCH` **igual ao package.json do commit** |
| `criar_release` | `true` |
| `prerelease` | `true` enquanto o lançamento estiver experimental; após decisão explícita, `false` |

**Atenção:** o input padrão mostrado na interface do workflow pode estar desatualizado. **Informe explicitamente a versão nova**, não aceite uma tag velha por engano.

Alternativa pelo GitHub CLI (PowerShell, somente após confirmar os pré-requisitos):

```powershell
gh workflow run deploy-official-cloudflare.yml `
  --repo krrozino/kukkiwon-ptbr-tkd `
  --ref main `
  -f confirmacao=PUBLICAR `
  -f versao=v0.2.0 `
  -f criar_release=true `
  -f prerelease=true
```

**Substitua a versão de exemplo pela versão real ainda não publicada.** No PowerShell, os caracteres ` no final das linhas acima **representam a continuação de linha PowerShell**. Se usar o comando copiado, use o caractere de crase PowerShell mostrado no bloco de código final da documentação de execução do GitHub ou passe tudo em uma única linha para evitar erros.

Uma alternativa segura de linha única:

```powershell
gh workflow run deploy-official-cloudflare.yml --repo krrozino/kukkiwon-ptbr-tkd --ref main -f confirmacao=PUBLICAR -f versao=v0.2.0 -f criar_release=true -f prerelease=true
```

## O que o workflow faz (em ordem)

1. Checkout do SHA da `main`; confirma evento push CI verde para esse SHA.
2. Confere versão, tag inexistente e exigência de criar Release.
3. Confere existência dos três secrets (sem imprimi-los).
4. `npm ci`; `content:check`, `research:audit`, `check` e `npm test`.
5. `npm run build` com `PUBLIC_CONTENT_REVIEW=false` e `PUBLIC_KNOWLEDGE_SCHEMA=false`; verifica arquivos básicos do site.
6. Instala Chromium e valida isolamento editorial do pacote público.
7. Executa **uma** publicação `npx wrangler deploy`, usando o Environment.
8. Confere HTTP sem erro em `/`, `/atlas`, `/catalogo`, `/glossario` e `/fundamentos/alturas-e-direcoes`.
9. No job seguinte, **somente se `publicar` for `success`**, cria tag e GitHub Release no SHA implantado.

## Acompanhar e verificar

Depois de disparar, use o ID **numérico real** que o GitHub informa. Não copie a expressão `ID_DA_EXECUCAO` literalmente.

```powershell
gh run list --repo krrozino/kukkiwon-ptbr-tkd --workflow deploy-official-cloudflare.yml --event workflow_dispatch --limit 3
gh run watch 123456789 --repo krrozino/kukkiwon-ptbr-tkd --exit-status
```

Verificar:
- O run possui `conclusion=success` nos jobs `publicar` e `release`.
- Logs exibem URL do Worker publicado e cinco linhas `HTTP OK`.
- A tag e a Release `vX.Y.Z` existem e apontam para o SHA correto da `main`.
- O site carrega realmente as novas telas, os estados vazios corretos e os dados/links autorizados, em **desktop e celular**.
- Testar o fluxo afetado, não apenas retorno HTTP; auth, currículos, direitos e revisão editorial possuem critérios próprios.

## Falhas e mitigação

| Onde falhou | Ação |
| --- | --- |
| CI/SHA, versão/tag ou Secret ausente | Parar, corrigir e executar nova tentativa **somente** após pré-condições |
| Chromium/Playwright | Ver logs de instalação e browser; corrigir em PR e validar CI antes de novo deploy |
| Cloudflare `10000` / `9109` | Token inválido/sem autenticação; verificar token/conta, secrets do Environment, não expor segredo |
| Wrangler publicou, mas smoke HTTP falhou | Considerar que **pode haver produção parcialmente alterada**; avaliar imediatamente antes de nova tentativa |
| Worker OK, mas job Release falhou | **Não repetir deploy inteiro** sem necessidade; reexecutar/reparar somente o job de Release no mesmo SHA se for seguro e a plataforma permitir |
| Conteúdo indevido publicado | Bloquear/retrair na camada editorial, revisar RLS, registrar incidente; não confundir rollback visual com retirada do dado |
| Precisa reverter funcionalidade | Preferir PR de correção/reversão testada e **nova versão PATCH/MINOR** com tag inédita; preservar histórico de Releases |

**Não** editar/reaproveitar tags já publicadas e **não** executar `wrangler deploy` separadamente para contornar o workflow. Nunca disparar simultaneamente workflows do mesmo ambiente.

## Responsabilidades e critérios finais

- **Merge**: código integrado.
- **CI verde**: verificações automatizadas passaram no SHA.
- **Deploy verde**: Worker e smoke HTTP passaram.
- **Release emitida**: versão efetivamente publicada e registrada.
- **Homologação funcional/editorial**: verificação humana adicional, distinta de deploy.

Projeto independente, sem vínculo oficial com a Kukkiwon. Técnicas em `draft` não são publicadas, mesmo que a aplicação esteja online.