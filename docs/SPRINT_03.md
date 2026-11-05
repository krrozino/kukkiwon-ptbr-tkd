# Sprint 03 — piloto de escola

Implementação da [Issue #16](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/16), sobre a main `0503a60`, sem alterar o catálogo editorial.

- Auth existente ampliado com reenvio de confirmação, recuperação e troca de senha, tratamento de links expirados e mensagens úteis. Sessão persistente com renovação automática do SDK.
- Currículo com status salvo, indicação de alterações pendentes, cópia com alternativa manual e revogação imediata sem publicar a edição em andamento. Seleção de técnica própria em qualquer requisito/graduação.
- Exemplo editável com cinco itens de teoria, mãos, chute, base e defesa. Requisitos demonstrativos da escola; sem equivalência com exigências oficiais Kukkiwon, sem depender de rascunhos do catálogo.
- Upload JPEG/PNG/WebP até 5 MiB com validação de tipo/assinatura, autoria, licença, permissão e consentimento. URLs HTTPS de vídeos e imagens preservadas.
- Bucket privado `school-images`, caminhos por escola, sem sobrescrita. Download anônimo somente de demonstração pública vinculada a currículo público da mesma escola. Retirar vínculo, tornar mídia privada ou revogar currículo bloqueia novos downloads; cópias já baixadas não podem ser retiradas do dispositivo do aluno.

## Verificação

`npm run validate`: conteúdo, tipos, 49 testes unitários/PostgreSQL e build aprovados. `npm run test:ui`: 46 testes desktop/mobile aprovados, incluindo cinco cenários da sprint em cada dispositivo. Auth e Storage HTTP são simulados nesses testes de interface; a RLS executa em PostgreSQL local (PGlite). Revisão independente focada sem achados bloqueantes.

**Homologação real na prévia:** cadastro aceito pelo Supabase, confirmação de email feita pelo usuário, login real por senha, escola criada, técnica própria e imagem original cadastradas pela interface. Edição/salvamento, reabertura após recarregar, persistência da sessão, cópia do link e logout conferidos no navegador autenticado. Recuperação e nova senha realizadas pelo usuário; novo login observado. Renovação de sessão expirada coberta pelo teste automatizado, sem esperar uma expiração real de uma hora.

Dois navegadores sem sessão (desktop/mobile) abriram o currículo e a imagem no Storage real (HTTP 200), sem erro de JavaScript ou overflow. A revogação pela interface bloqueou o currículo e novos downloads (HTTP 400 do Storage). Consulta anônima às evidências privadas foi negada (HTTP 401). O exemplo foi compartilhado novamente ao final. Senhas e tokens de professor não foram gravados no repositório, relatórios ou logs.

## Prévia e homologação

Prévia: https://kukkiwon-ptbr-tkd-sprint03.kukkiwon-ptbr-tkd.workers.dev. Conecta ao projeto dedicado existente; escolas e currículos salvos pela interface são dados reais desse projeto. O exemplo local está em `/curriculos` e o professor entra por `/escolas`. O pacote usa `PUBLIC_CONTENT_REVIEW=false`: os 105 rascunhos e os três candidatos adicionais não são publicados.

1. Entrar em `/escolas`, escolher **Escola Piloto · Demonstração**, abrir **Piloto demonstrativo · faixa branca** e editar. O usuário define sua senha pessoal; não enviar senhas, tokens ou links de recuperação no chat.
2. [Abrir o currículo piloto sem login](https://kukkiwon-ptbr-tkd-sprint03.kukkiwon-ptbr-tkd.workers.dev/curriculo?id=c47bf8db-1d26-4733-9909-43afdf03cb40). Usar “Carregar demonstração” para ver o cartão didático original, licenciado CC BY 4.0 e sem pessoas retratadas.
3. Testar editar → salvar → copiar link → abrir em janela anônima/celular → revogar → recarregar a janela anônima. Para nova mídia, enviar imagem autorizada, marcar sua visibilidade, selecioná-la no requisito e salvar o currículo.
4. A migração `supabase/migrations/20261105203201_sprint03_school_images.sql` foi aplicada ao projeto dedicado em 05/11/2026 após autorização expressa do usuário. O arquivo foi alinhado à versão registrada pelo Supabase. Bucket privado, limite 5 MiB e quatro políticas conferidos; Security Advisors sem avisos. Prévia recompilada com `npm run preview:pilot -- --storage`.
5. O retorno exato `/escolas` da prévia foi acrescentado ao Supabase Auth, mantendo a Site URL e o retorno oficial. O deploy oficial manual já compila com `PUBLIC_SPRINT03_STORAGE=true`; ainda depende da aprovação do usuário e da integração desta PR.

Nenhum merge ou deploy no Worker oficial foi realizado nesta entrega. A migração do banco e a prévia foram autorizadas separadamente; a publicação oficial continua pendente de aprovação expressa do usuário.
