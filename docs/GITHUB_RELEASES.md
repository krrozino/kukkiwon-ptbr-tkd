# GitHub — releases, deploy e governança

## Diagnóstico em 06/11/2026
A execução #42248083608 do workflow de Cloudflare falhou antes de compilar por falta de **todas as três credenciais**, vistas vazias no log:
CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN e SUPABASE_PUBLISHABLE_KEY.
Não foi realizado deploy por essa execução. Não confundir main com versão publicada.

## Secrets obrigatórios
Abra Settings → Secrets and variables → Actions → New repository secret, ou configure secrets no ambiente production:

1. CLOUDFLARE_ACCOUNT_ID — Account ID da conta que hospeda o Worker kukkiwon-ptbr-tkd (Cloudflare Dashboard → Workers & Pages).
2. CLOUDFLARE_API_TOKEN — token API com acesso mínimo necessário a Workers Scripts: Edit na conta oficial; ajuste permissões adicionais somente se o Wrangler exigir.
3. SUPABASE_PUBLISHABLE_KEY — chave sb_publishable_* do projeto dedicado acbostnsohltuaegfkwl (Supabase → Project Settings → API Keys).

Nunca inserir tokens em prompt, código, Issues, arquivos, commit ou comentários públicos. Não use service_role, sb_secret_* nem credenciais do EloDo.

## Publicação: uma versão, um deploy, uma release
- Main e CI devem estar revisadas.
- A versão de package.json deve coincidir com a tag solicitada, por exemplo 0.1.0 → v0.1.0.
- Abra Actions → Publicação oficial Cloudflare — manual + GitHub Release.
- Run workflow na branch main; confirmacao = PUBLICAR; versao = v0.1.0; criar_release = true; prerelease = true.
- O workflow bloqueia tags duplicadas, valida conteúdo e código, compila sem rascunhos, executa um único Wrangler deploy, verifica HTTP de cinco páginas e depois cria a GitHub Release vinculada ao commit exato.
- A primeira v0.1.0 será uma **prerelease**, pois ainda há grande quantidade de conteúdo técnico sem aprovação editorial.
- GitHub Release só é criada se deploy e smoke test passarem. Smoke HTTP não substitui revisão visual no celular ou revisão de conteúdo.
- Se o deploy passar e o job da release falhar, reexecute **somente o job falho**, não a publicação toda.

## Validação de preflight da publicação

O fluxo manual exige uma execução **push → Validacao (sem deploy)** concluída com sucesso para o **SHA exato da main** que será publicado. Testes verdes de PR, de outra branch ou de commit anterior não são suficientes. O workflow consulta os próprios resultados do GitHub Actions por token de leitura `actions:read`; falhas de consulta bloqueiam o deploy.

A publicação oficial exige `criar_release=true`. A verificação de tags já existentes independe desse sinalizador e falha fechada caso não consiga consultar o remoto: não se pode publicar novamente uma versão já etiquetada nem avançar com estado de tags desconhecido. Se o deploy tiver sido concluído, mas a criação da Release falhar, execute **somente o job de Release que falhou**, conforme descrito acima.

O pacote oficial mantém `PUBLIC_CONTENT_REVIEW=false` e `PUBLIC_KNOWLEDGE_SCHEMA=false`. Os recursos `PUBLIC_SPRINT02_SCHEMA` e `PUBLIC_SPRINT03_STORAGE` permanecem habilitados porque as migrações respectivas foram aplicadas e testadas no projeto dedicado em 05/11/2026 (consulte `docs/SPRINT_02.md` e `docs/SPRINT_03.md`). **Isso não se estende à migração privada de pesquisa/Poomsae de 06/11**, que ainda exige avaliação e aplicação separadas.

O preflight confirma código e histórico de CI, mas **não substitui** a verificação de Secrets e Environment `production`, a revisão manual do banco, a homologação Auth/Storage hospedados nem a permissão expressa de publicar. O fluxo não realiza migrações ou libera registros editoriais.

## Aumentar versão
Criar uma PR que altere package.json e package-lock.json simultaneamente (ex.: npm version 0.2.0 --no-git-tag-version), com changelog e testes. Não criar tag antecipada; o workflow cria a tag a partir do commit publicado.

Enquanto o projeto está na série 0.x, PATCH para correções, MINOR para novas funcionalidades compatíveis, MAJOR para alterações incompatíveis/estabilidade estabelecida.

## Ferramentas recomendadas do GitHub
- Releases + Tags: histórico de produção, notas de mudança e links do site.
- Pull Requests: review de alterações, CI e checklist.
- Issues + Labels + Milestones: planejamento e bugs rastreáveis.
- Projects: quadros de evolução de conteúdo, código e produto.
- Discussions: perguntas da comunidade quando houver moderação.
- Dependabot: propostas agrupadas semanais, sem auto-merge.
- Security: divulgação privada de vulnerabilidades e verificação de dependências.
- Settings → Environments → production: exigir revisão humana e limitar a branch main, se seu plano/repositório suportar.
- Settings → Branches / Rulesets: proteger main, exigir CI e revisão (verificar restrições adequadas para projeto com mantenedor único).

O projeto é independente e não afiliado à Kukkiwon. Release de software não implica homologação de terminologia.
