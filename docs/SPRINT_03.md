# Sprint 03 — piloto de escola

Implementação da [Issue #16](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues/16), sobre a main `0503a60`, sem alterar o catálogo editorial.

- Auth existente ampliado com reenvio de confirmação, recuperação e troca de senha, tratamento de links expirados e mensagens úteis. Sessão persistente com renovação automática do SDK.
- Currículo com status salvo, indicação de alterações pendentes, cópia com alternativa manual e revogação imediata sem publicar a edição em andamento. Seleção de técnica própria em qualquer requisito/graduação.
- Exemplo editável com cinco itens de teoria, mãos, chute, base e defesa. Requisitos demonstrativos da escola; sem equivalência com exigências oficiais Kukkiwon, sem depender de rascunhos do catálogo.
- Upload JPEG/PNG/WebP até 5 MiB com validação de tipo/assinatura, autoria, licença, permissão e consentimento. URLs HTTPS de vídeos e imagens preservadas.
- Bucket privado `school-images`, caminhos por escola, sem sobrescrita. Download anônimo somente de demonstração pública vinculada a currículo público da mesma escola. Retirar vínculo, tornar mídia privada ou revogar currículo bloqueia novos downloads; cópias já baixadas não podem ser retiradas do dispositivo do aluno.

## Verificação

`npm run validate`: conteúdo, tipos, 49 testes unitários/PostgreSQL e build aprovados. `npm run test:ui`: 46 testes desktop/mobile aprovados, incluindo cinco cenários da sprint em cada dispositivo. Auth e Storage HTTP são simulados nesses testes de interface; a RLS executa em PostgreSQL local (PGlite). Revisão independente focada sem achados bloqueantes.

**Ainda não homologado:** entrega de emails/conta real e upload/download no Storage hospedado. Nenhuma credencial de professor foi criada, persistida no repositório ou registrada em logs. Os dados de autenticação dos testes são sintéticos.

## Prévia e homologação

Prévia: https://kukkiwon-ptbr-tkd-sprint03.kukkiwon-ptbr-tkd.workers.dev. Conecta ao projeto dedicado existente; escolas e currículos salvos pela interface são dados reais desse projeto. O exemplo local está em `/curriculos` e o professor entra por `/escolas`. O pacote usa `PUBLIC_CONTENT_REVIEW=false`: os 105 rascunhos e os três candidatos adicionais não são publicados.

1. Em Supabase → Authentication → URL Configuration, permitir o retorno exato da prévia: `https://kukkiwon-ptbr-tkd-sprint03.kukkiwon-ptbr-tkd.workers.dev/escolas`. Preservar a URL oficial e a confirmação obrigatória por email. Verificar SMTP se o email de teste não receber mensagens.
2. Na prévia, criar conta com email acessível, confirmar o email e retornar a `/escolas`; criar escola, salvar o exemplo, recarregar, abrir o currículo salvo e compartilhar. Abrir o link em janela anônima/celular; revogar e recarregar essa janela.
3. Sair, usar “Esqueci minha senha”, abrir o email, definir a nova senha e conferir novo login. Não enviar senhas, tokens ou links de recuperação no chat.
4. Upload hospedado exige autorização para aplicar `supabase/migrations/20261105201718_sprint03_school_images.sql` ao projeto dedicado. A migração foi testada localmente e ainda não foi aplicada remotamente. Até isso acontecer a prévia mantém `PUBLIC_SPRINT03_STORAGE=false`, funciona com o schema atual e oferece mídia por URL.
5. Após a migração aprovada, preparar novamente com `npm run preview:pilot -- --storage`, atualizar somente a prévia e homologar imagem autorizada → vínculo em requisito → mídia pública → salvar currículo público → download sem login → revogar. O deploy oficial manual compila com o flag de Storage ativo; aplicar e validar a migração antes de acioná-lo.

Nenhum merge, deploy no Worker oficial ou alteração persistente no banco de produção foi realizado nesta entrega. A publicação oficial depende de aprovação expressa do usuário.
