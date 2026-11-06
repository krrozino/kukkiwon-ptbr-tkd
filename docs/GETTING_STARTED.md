# Instalação, desenvolvimento e testes

Guia para quem quer estudar ou contribuir com a base de código. Nenhuma etapa abaixo exige alteração ou migração no banco remoto.

## Pré-requisitos

- Node.js **22 atualizado ou 24** e npm.
- Git.
- Chromium do Playwright para os testes em navegador.
- Conta Supabase/Cloudflare **não é obrigatória** para editar interface, testar componentes ou navegar em estados públicos simulados.

## 1. Clonar e instalar

```bash
git clone https://github.com/krrozino/kukkiwon-ptbr-tkd.git
cd kukkiwon-ptbr-tkd
npm ci --ignore-scripts
```

Evite `npm install` sem motivo e não atualize dependências fora do escopo: o projeto fixa versões e mantém `package-lock.json`.

## 2. Variáveis locais

Copie `.env.example` para um arquivo local `.env` (ignorado pelo Git):

```bash
cp .env.example .env
```

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

Exemplo mínimo (valores fictícios):

```dotenv
PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_SUBSTITUA
PUBLIC_CONTENT_REVIEW=false
PUBLIC_SPRINT02_SCHEMA=false
PUBLIC_SPRINT03_STORAGE=false
PUBLIC_KNOWLEDGE_SCHEMA=false
```

- Use apenas o projeto dedicado **deste** aplicativo ao fazer testes conectados, nunca o banco de outro projeto.
- Sem URL/chave reais, recursos dependentes de dados podem exibir mensagens de indisponibilidade; **isso não impede desenvolvimento de layout e testes mockados**.
- Não compartilhe nem versione `.env` e tokens. Nunca usar `service_role`, `sb_secret_*` ou Cloudflare API Token no código que chega ao browser.
- Ative flags de esquema apenas se a migração correspondente **foi realmente aplicada** e homologada naquele ambiente. O esquema de pesquisa/poomsae segue desativado na produção oficial.

## 3. Servidor local

```bash
npm run dev
```

A URL é informada pelo Astro no terminal (geralmente `http://localhost:4321`). Abra páginas como `/atlas`, `/catalogo`, `/poomsae`, `/curriculos` e `/estudos`. Use uma aba anônima quando precisar testar a experiência sem sessão.

## 4. Verificações de qualidade

```bash
npm run content:check
npm run research:audit
npm run check
npm test
npm run build
```

| Comando | Objetivo |
| --- | --- |
| `content:check` | Schema, consistência e integridade dos lotes editoriais |
| `research:audit` | Auditoria dos artefatos de pesquisa |
| `check` | Astro check e TypeScript |
| `test` | Vitest, contratos e migrações em ambiente isolado |
| `build` | Construir `dist/` sem publicar nada |
| `test:ui` | Playwright desktop/mobile com fixtures |
| `test:research:ui` | Verificações do laboratório local |
| `preview:prepare` | Preparação sem publicar em produção |

Para testes visuais:

```bash
npx playwright install chromium
npm run test:ui
npm run test:research:ui
```

Se o Chromium falhar por bibliotecas Linux, siga a documentação do Playwright para dependências naquele sistema; o Actions usa `npx playwright install --with-deps chromium` em runner Linux.

O Playwright inicia um preview de compilação local. Suas fixtures interceptam a Data API; **resultado de fixture não é técnica real**, e captura E2E não substitui homologação visual do site oficial.

## 5. Pesquisa editorial e prévias

```bash
npm run content:review -- --output revisao-geral.csv
npm run preview:prepare
```

Os CSVs de revisão ficam em `review-output/` (não versionado). A exportação não publica nem aprova nenhum registro. O preparador de prévia não executa deployment oficial. Leia [EDITORIAL_REVIEW](EDITORIAL_REVIEW.md) e [DATA_PIPELINE](DATA_PIPELINE.md).

## 6. Trabalhar numa mudança

1. Leia [CONTRIBUTING.md](../CONTRIBUTING.md) e abra uma Issue em caso de alteração relevante.
2. Crie branch a partir da `main` mais recente.
3. Acrescente testes e atualize documentos do domínio afetado.
4. Descreva na PR se a mudança é MAJOR/MINOR/PATCH (ou documentação sem release) e os impactos na segurança e no catálogo.
5. A PR deve passar pela CI; a `main` é protegida.
6. **Não** faça deploy no Worker oficial e **não** altere o Supabase remoto a partir de uma PR comum.

## Solução de problemas

| Sintoma | Conferir |
| --- | --- |
| Catálogo vazio | Pode não haver termos `published` — isso não significa falha de conexão |
| Catálogo desconectado | Checar URL e chave pública, rede e flags; nunca contornar RLS |
| Poomsae sem sequência | Esquema opcional não aplicado ou sem passos aprovados |
| Credencial Cloudflare inválida | Corrigir Secret de `production` e verificar token pela API; não vazar segredo em log |
| Teste E2E não inicia | Instalar Chromium; conferir se a porta `4321` está livre |
| CI do release recusa tag | Versão de `package.json` diferente da tag ou tag já usada |
| Banco local difere de remoto | Comparar migrações antes de habilitar flags; nunca assumir aplicação automática |

Apenas o workflow de release autorizado realiza deploy oficial. [Runbook](GITHUB_RELEASES.md).