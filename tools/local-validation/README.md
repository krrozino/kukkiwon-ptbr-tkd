# Validação local de integração

Ferramentas de teste, separadas das dependências do aplicativo. Não são enviadas ao site e não usam credenciais remotas.

Esta execução usa PostgreSQL portátil **17.11.0-beta.19** e PostgREST **16.5**. O código sobe um cluster novo em porta aleatória de **127.0.0.1**, cria roles locais e aplica:

1. As duas migrações iniciais do catálogo e do atlas.
2. Os seeds herdados de 20 termos e cinco regiões em rascunho.
3. A migração aditiva da Sprint 01.
4. A migração da Sprint 02, o importador dos 85 candidatos duas vezes e as três variantes adicionais em rascunho.
5. A migração da Sprint 03, com o mesmo esquema mínimo de Storage usado pelos testes SQL.
6. A migração local de conhecimento/Poomsae. Fotografias de todas as oito tabelas do catálogo antes e depois devem ser idênticas.

Os testes conferem que os 108 registros continuam em rascunho e invisíveis por REST. Para exercitar busca, paginação, atlas e Poomsae, criam separadamente fixtures sintéticas prefixadas com `qa-`, somente no cluster local. Os testes Playwright encaminham o transporte HTTP para o PostgREST real: não substituem respostas por JSON fixo. As relações e os vínculos do atlas usam fontes exclusivas, permitindo conferir sua projeção pela RLS real.

O bloco de Poomsae verifica rascunhos ocultos, recusa publicação sem identidade de revisor e usa uma identidade sintética cadastrada apenas no cluster efêmero para publicar uma forma e um movimento de teste. Confere os joins de técnica e fonte para `anon` e `authenticated`, a exclusão de `approved_by` da projeção pública e a retirada de visibilidade quando um termo dependente volta a rascunho. Os registros de pesquisa e os dados reais existentes não são publicados.

O runner não recebe URL de banco nem projeto Supabase por argumento. Banco, serviços e senhas temporárias são criados localmente. Não instala serviços de sistema, não cria usuários do Windows/Linux e encerra seus processos no final. Os clusters ficam em `.local-validation/runs/`, ignorados pelo Git.

## Repetir a validação

```sh
npm ci --ignore-scripts
npm ci --prefix tools/local-validation --ignore-scripts
npm run test:integration
```

O navegador usa Astro em modo de desenvolvimento na porta **4347**, com configuração temporária dentro da pasta ignorada da execução. Isso permite executar a integração paralelamente aos testes da prévia em 4321, sem reescrever `dist`. A variável `KUKKIWON_INTEGRATION_PORT` permite escolher outra porta local válida. PostgreSQL e PostgREST continuam em portas de loopback aleatórias.

Instale antes o binário oficial PostgREST 16.5 em `.local-validation/bin/postgrest.exe` (Windows) ou informe `KUKKIWON_POSTGREST_BIN`. O arquivo não é versionado. O operador/assistente pode fazer essa preparação; não exige criar projeto remoto.

Arquivo oficial usado: [PostgREST v16.5 Windows x86-64](https://github.com/PostgREST/postgrest/releases/download/v16.5/postgrest-v16.5-windows-x86-64.zip).

SHA-256 do ZIP: `17f595b0d8dd37473d0231417dea07c5ac9f791282ff5b017fae51ff29e5de2f`.

A origem e o digest foram conferidos nos metadados oficiais da release. Os DLLs do PostgreSQL portátil são acrescentados ao PATH **somente do subprocesso** PostgREST. Em outras plataformas, use o binário oficial correspondente; esta execução foi validada no Windows x64.

Resultado resumido: `.local-validation/latest.json`. Logs sem credenciais de produção: `.local-validation/runs/<id>/services.log`. Se um teste falhar, o runner encerra os serviços e preserva o log para diagnóstico.

## Limites

### Issue #42 — sentidos e referências por campo

O runtime aplica também as migrações posteriores à proposta de conhecimento e
captura `catalogAfterSemantics` para comparação com as oito tabelas originais.
Com os binários/dependências locais já disponíveis, executar:

```powershell
$env:TERM_SENSES_REAL_DB='1'
npx --no-install vitest run tests/term-senses-database.test.mjs
Remove-Item Env:\TERM_SENSES_REAL_DB
node tools/local-validation/term-senses.mjs
```

O primeiro comando reutiliza a mesma suíte negativa no PostgreSQL portátil em
cluster novo. Sem a variável, `npm test` usa PGlite. Não existe parâmetro de URL
remota. O segundo verifica as projeções HTTP novas com JWTs de teste e grava
`.local-validation/term-senses-latest.json`, sem modificar dados externos. As
fixtures/revisores são sintéticos e só existem nos clusters descartáveis.

`supabase/tests/term_senses_authorization.sql` também pode ser executado com
`psql -X -v ON_ERROR_STOP=1 -f ...` em banco **local isolado**, nunca em produção.
Não instalar os binários automaticamente se estiverem ausentes; nesse caso,
registrar **BLOCKED — REAL DATABASE VALIDATION** e continuar com PGlite.

Isso valida PostgreSQL, PostgREST e a integração real do catálogo/atlas. Não é uma instância completa do Supabase: não há Kong, Auth, Storage, Realtime ou ambiente hospedado. O full stack Supabase local ainda depende de Docker/WSL, ausentes nesta máquina. A comparação com o projeto hospedado depende de autorização explícita e não foi executada.

Referências: [PostgREST — configuração](https://docs.postgrest.org/en/v14/references/configuration.html), [PostgreSQL portátil](https://github.com/leinelissen/embedded-postgres), [Supabase — desenvolvimento local](https://supabase.com/docs/guides/local-development).
