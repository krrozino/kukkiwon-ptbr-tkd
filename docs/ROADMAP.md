# Roadmap e limites conhecidos

Este documento registra **prioridades e critérios de aceitação**, não datas prometidas nem tarefas concluídas sem evidência. Veja as [Issues](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues) para execução técnica e [Releases](https://github.com/krrozino/kukkiwon-ptbr-tkd/releases) para versões implantadas.

## Onde estamos

**Referência de auditoria: 06/11/2026.**

- `v0.1.0` foi publicada como prerelease, Worker e cinco rotas HTTP conferidos.
- `v0.2.0` foi integrada à `main` com atlas revisado, textos de 50 regiões e material educativo introdutório; publicação oficial **não confirmada** no momento deste checkpoint.
- 105 registros do catálogo no Supabase dedicado permaneciam em `draft`, zero `published`. A liberação de conteúdo está bloqueada por revisão humana e fontes individuais.
- Migração de `knowledge_research`/Poomsae permanece uma proposta local, não aplicada ao projeto remoto.

## Etapas prioritárias

| Prioridade | Frente | Trabalho necessário | Critério para concluir |
| --- | --- | --- | --- |
| P0 | Publicação | Concluir CI, deploy e Release da candidata `v0.2.0` | GitHub Actions de release PASS; tag no SHA; Worker acessível; smoke HTTP e visual real |
| P0 | Editorial | Organizar primeiro lote de revisão documental e técnica | Pacotes, localizadores, revisão humana por campo, direitos; **nenhuma promoção por atalho** |
| P1 | Atlas | Conferir visual e geometria das regiões em desktop/mobile | Limites corretos nas duas vistas, seleção sem deslocamento, teclado/touch, feedback do mantenedor |
| P1 | Poomsae | Homologar estrutura e fonte dos primeiros movimentos | Migração aprovada/aplicada separadamente; fontes e passos individualmente revisados |
| P1 | Escolas | Homologar cadastro, permissões, links e mídia real | Cenários autorizados de criação, atualização, compartilhamento, revogação e isolamento entre escolas |
| P1 | Comunidade | Definir licenças de código, dados e mídias | Escolha consciente, arquivos publicados e orientações de contribuição consistentes |
| P2 | Operação | Backup/restauração e segurança de autenticação | Plano testado, avisos de segurança analisados e mitigados |
| P2 | Acessibilidade | Auditoria de navegação, contraste, leitor de tela e uso em aparelhos móveis | Testes automáticos e revisão humana documentados |

## O que não será feito como atalho

- Declarar como homologadas as 105 fichas de rascunho para tornar o catálogo "cheio".
- Importar automaticamente os 115 candidatos de pesquisa ou confundir amostras com aprovação.
- Criar passos de Poomsae sem fonte individual.
- Liberar esquema experimental apenas para evitar telas vazias.
- Publicar mídia sem titularidade/permissão.
- Misturar o Supabase desta plataforma com o EloDo.
- Chamar de release um commit de `main` ainda não publicado.

## Marcos futuros (sem data comprometida)

**Fase A — Site educativo útil:** atlas com legendas e recortes revisados, fundamentos e contexto das oito formas, currículos locais e navegação estável.

**Fase B — Primeiras fichas validadas:** lote pequeno de conteúdo com evidência e assinatura humana, busca/filtros, referência pública verificável, mecanismo de retirada em caso de erro.

**Fase C — Fluxo editorial e Poomsae:** aprovação por campo e sequência versionada, sem quebrar RLS ou confidencialidade do laboratório de pesquisa.

**Fase D — Comunidade e escolas:** participação de professores, guias pedagógicos, compartilhamento seguro e acompanhamento de qualidade, sem descaracterizar a natureza comunitária e não lucrativa.

Para decidir se cada marco é PATCH/MINOR/MAJOR, consulte [VERSIONING.md](VERSIONING.md).