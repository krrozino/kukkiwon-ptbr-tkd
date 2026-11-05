# Sprint 02 — experiência integrada

Branch `feat/sprint-02-learning-platform`, baseada no head atualizado da PR #10 (`333fd6f`). As PRs anteriores e a #11 não foram modificadas ou integradas. Nenhum AGENTS.md foi encontrado no projeto. Supabase dedicado conferido somente por leitura: 105 termos em draft (20 document_checked, 85 research), 21 regiões e oito tabelas com RLS.

## Implementado

- Atlas com SVGs originais de mão aberta, punho e pé; palma/planta e dorso, recortes coloridos sem números, foco/teclado/toque, cascata curta e movimento reduzido. Corpo com contornos e marcas adicionais; superfícies de antebraço, cotovelo e joelho. Lista alternativa para sobreposições e áreas pequenas.
- Sonnal abre uma ficha no próprio atlas, com Hangul, romanização, descrição, fontes, estado editorial e prévias de técnicas relacionadas.
- Pronúncia PT-BR separada da romanização, ausência e estado provisório explícitos. Migração prepara observações, revisão e áudio humano/sintético; não há gravações ou pronúncias verificadas novas.
- Três novos candidatos documentais: Sonnal-an-chigi, Sonnal-an-makgi e Sonnal-bakkat-makgi. Fonte: [Taekwondo Technical Terminology](https://research.kukkiwon.or.kr/homepage/boardMedia/11621), seções Chigi/An-chigi e Makgi/An-makgi/Bakkat-makgi. Localizadores individuais e relações com Sonnal; traduções próprias provisórias. Os 105 registros anteriores permanecem intactos. Total versionado: 108 drafts; remoto: 105 drafts.
- Visualizador e editor de currículos com graduações ordenadas, requisitos, teoria/poomsae/materiais, técnicas contextuais, orientações e mídia. Exemplo de faixa branca explicitamente demonstrativo. Rascunho e checklist locais persistem ao recarregar.
- Supabase SDK com entrada/cadastro/saída; responsável cria sua escola, salva/edita currículos, técnicas próprias e demonstrações por URL. RLS e chave composta impedem gravar na escola de outra conta. Nenhum privilégio editorial é concedido.
- Compartilhamento explícito por `/curriculo?id=UUID`; currículo privado é padrão. Revogação remove a consulta anônima. A consulta pública seleciona apenas campos permitidos; evidências de uso de imagem e identificadores de conta não fazem parte dessa resposta. A API pública usa chave pública sem token de sessão, inclusive quando o visitante está conectado; o cliente autenticado do painel só lê dados do responsável.
- Mídia por URL HTTPS: título, descrição, técnica, autor, tipo, legenda, créditos, referência de permissão, consentimento e visibilidade. Consentimento não é presumido. Imagens/vídeos são abertos dentro da página quando suportados, após ação do aluno. A privacidade do arquivo depende também do serviço de origem.
- Estudos pessoais no navegador: favoritos, pastas/subpastas, renomear/mover/excluir preservando técnicas, checklist, notas, referências estruturadas para técnicas e links comuns/internos. Técnicas nas notas abrem prévia contextual.

## Preparação e limites

`PUBLIC_CONTENT_REVIEW=false` é o padrão. O adaptador editorial só é importado com esse flag em `true`; todos os registros continuam draft e há faixa global e avisos nas fichas. A #11 não foi mesclada. `npm run preview:review` prepara uma prévia editorial offline separada, com Wrangler em dry run, sem publicar assets. `npm run preview:check` testa o pacote em Workerd local. Não reutilizar o pacote editorial como catálogo público validado.

A migração aditiva foi autorizada pelo usuário e aplicada ao Supabase dedicado em 05/11/2026. O arquivo `20261105115448_sprint02_schools_learning.sql` corresponde à versão registrada remotamente. As quatro tabelas novas têm RLS; os 105 termos remotos continuam draft, sem publicações. A verificação transacional `supabase/tests/sprint02_school_isolation_smoke.sql` passou localmente e no banco hospedado, revertendo todas as fixtures.

`npm run preview:connected` gera o pacote editorial com Auth e escolas conectados ao Supabase dedicado. Usa somente URL/chave publishable de `.env.preview.local` (ignorado pelo Git) ou do ambiente; rejeita outro projeto, credenciais na URL e chaves secretas. Ativa `PUBLIC_SPRINT02_SCHEMA=true`. Os comandos de prévia sem conexão continuam ignorando credenciais do ambiente. A origem externa aprovada ainda precisa ser conferida nas URLs de redirecionamento de Auth para `/escolas`, seguida de homologação da confirmação de email e renovação da sessão com uma conta real.

`npm run test:schools` exercita navegador → SDK → PostgREST/PostgreSQL local, incluindo uma segunda sessão sem login. Somente a identidade de Auth é simulada; não equivale a homologação do Supabase Auth hospedado. Os testes não criam contas remotas nem enviam email. `npm run test:integration` cobre catálogo, busca e atlas com PostgreSQL/PostgREST locais. Rodar essas suítes depois de `test:ui`, pois a integração herdada usa a mesma porta 4321.

Ainda dependem de trabalho posterior: upload via Storage, sincronização do caderno entre aparelhos, membros/alunos vinculados a uma escola, várias pessoas responsáveis pela mesma escola, produção de áudio e revisão humana dos conteúdos. O MVP usa um responsável por escola e links públicos para alunos; não guarda dados pessoais de alunos.

O usuário autorizou a migração dedicada e a prévia externa. O deploy ainda depende da autenticação da ferramenta de publicação. Importação dos três candidatos adicionais, merge na main e publicação editorial continuam fora dessa autorização.

## Evidência de entrega

- Conteúdo: 108 registros válidos, todos draft; 88 research e 20 document_checked. Zero alterações remotas.
- Astro/TypeScript: zero erros, avisos ou hints. Build de nove rotas.
- Vitest: 45 testes aprovados, incluindo isolamento entre responsáveis, grants públicos, evidências privadas, pastas, corrupção de estado e configuração da prévia conectada.
- Playwright: 28 testes aprovados, desktop/mobile, incluindo regressão de histórico e notas contextuais.
- PostgreSQL 17.11/PostgREST 16.5: sete verificações do catálogo e seis testes de navegador aprovados.
- Escolas: seis verificações REST/navegador aprovadas; cria escola, cadastra demonstração autorizada, compartilha currículo e o abre em uma segunda sessão móvel sem login. Revogação verificada. Resposta de salvamento retida para verificar bloqueio de troca de currículo e evitar sobrescritas.
- Cloudflare: Wrangler dry run e Workerd local desktop/mobile aprovados; zero requisições externas no pacote editorial. `wrangler whoami` informa ausência de autenticação. Nenhum deploy foi tentado.
- Revisão independente focada, com correção dos achados e regressões. Não foi executada outra auditoria geral.
- Supabase hospedado: smoke transacional com dois responsáveis/anônimo aprovado; RLS, owner spoofing, evidências privadas e revogação verificados sem manter fixtures. Auth com cadastro por email habilitado, confirmação exigida e contas anônimas desabilitadas. O formulário conectado recebeu e exibiu a resposta real `invalid_credentials` com credenciais fictícias; nenhuma conta ou email foi criado. Isso valida a conexão, sem alegar login bem-sucedido de conta real.
- Cloudflare Agent Setup oficial executado: 19 skills em `~/.agents/skills`, servidor MCP `cloudflare` em `~/.codex/config.toml`, OAuth do MCP concluído. As ferramentas MCP novas exigem reiniciar o agente. Wrangler mantém autenticação própria.
