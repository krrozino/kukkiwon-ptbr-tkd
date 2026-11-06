# Governança, responsabilidades e decisões

## Missão

O Taekwondo para Todos é uma plataforma comunitária, gratuita e sem fins lucrativos para facilitar o ensino e o estudo do Taekwondo em português. **Não representa, pertence ou é afiliada à Kukkiwon.** A menção à instituição identifica fontes consultadas; não é selo de aprovação institucional.

## Fontes de informação e responsabilidades

| Sistema | Fonte de verdade | O que NÃO significa |
| --- | --- | --- |
| **GitHub** | Código, arquitetura, testes, política editorial, documentação pública, Issues, PRs e releases | `main` não significa automaticamente versão publicada |
| **Notion interno** | Contexto, ADRs/decisões, backlog, prioridades, riscos, histórico de discussão e critérios de aceite | Uma tarefa marcada concluída não comprova deploy, revisão ou aprovação |
| **Supabase** | Estado operacional do catálogo/escolas, permissões e evidências estruturadas | Existência de `draft` ou `document_checked` não comprova validação humana |
| **Cloudflare** | Worker e assets efetivamente implantados | HTTP 200 não comprova que UX ou conteúdo estão homologados |
| **Fontes documentais** | Origem individual, edição e localizador da informação sobre técnicas | Reprodução de material institucional sem direitos não é autorizada |

Uma decisão técnica aprovada no Notion deve ganhar Issue/PR, testes e atualização em `docs/` para não se separar da implementação. Uma mudança em código não deve modificar retroativamente o histórico das decisões.

## Fluxo de decisão (ADR)

1. **Proposta:** problema, contexto, risco, usuários afetados e opções. Indicar se envolve tecnologia, conteúdo, uso de marca ou dados pessoais.
2. **Discussão:** comparar alternativas, benefícios, custos e impactos editoriais; registrar evidências e divergências.
3. **Decisão:** definir "Aceita", "Rejeitada" ou "Substituída", com data, motivação, trade-offs e links para GitHub.
4. **Implementação:** Issue/PR com escopo, testes, segurança, versão estimada e migração/rollback quando relevante.
5. **Verificação:** CI PASS não basta para UX; validar produção quando aplicável e registrar lançamento.
6. **Revisão:** se a decisão mudar, criar sucessora e indicar qual ADR foi substituída. Preservar histórico.

O Notion contém a base interna **Decisões & ADRs**, com entradas iniciais ADR-001 a ADR-008 e a política de versões registrada na ADR-006. O [índice público de ADRs](DECISIONS.md) expõe somente decisões e referências adequadas à documentação aberta. Não adicionar links privados a essa base em materiais públicos sem autorização explícita de compartilhamento.

## Responsabilidades

- **Mantenedor do repositório:** avaliação de PRs, segurança, versionamento e autorização manual de releases.
- **Colaborador de código:** clareza do escopo, testes, documentação, ausência de segredos e cumprimento da CI.
- **Colaborador editorial:** fornecer evidência por campo e indicar dúvidas com precisão.
- **Revisor técnico/linguístico humano:** validar execução, tradução, grafias e variações com referência, sem inventar autoridade institucional.
- **Escola/professor:** titular de seus currículos e conteúdos próprios; não homologa automaticamente o catálogo público.

Esta é uma divisão **funcional** de responsabilidade; não presume pessoas nomeadas como revisores ou aprovações já emitidas.

## Ciclo de PR, CI e release

- `main` protegida, PR e job `validate` obrigatórios; conversas precisam ser resolvidas.
- PRs não executam Wrangler, migram banco ou importam dados remotos.
- A classificação da mudança segue [MAJOR.MINOR.PATCH](VERSIONING.md); release é um ato posterior à integração.
- Migração, publicação editorial e deploy do Worker são **autorizações separadas**; uma não autoriza as outras.
- Release oficial manual exige a CI de push do SHA exato e os cinco testes HTTP. GitHub Release e tag só nascem **depois** de sucesso do Worker.
- Incidentes devem registrar impacto, causa raiz, correção, rollback/mitigação e o que foi aprendido.

## Licenças e direitos

**Pendência explícita:** o repositório ainda não possui licença de código e política de licença da base de dados adotadas. É incorreto descrevê-lo como "open source licenciado" ou presumir direito irrestrito de copiar conteúdo.

Antes de publicar uma licença, é preciso decidir separadamente:
- **Código-fonte** (arquivo `LICENSE` e condições de contribuição).
- **Dados curados e traduções próprias** (licença própria, atribuição e eventual responsabilidade de revisão).
- **Imagens, vídeos, áudio, textos institucionais e materiais de terceiros** (cadeia de autoria, autorização de reprodução e restrições).
- **Marcas e nomes oficiais** (não afiliação; atribuições adequadas).

A abertura do repositório é uma decisão de transparência, não uma concessão automática de todas as permissões.

## Segurança, privacidade e qualidade

- Sem `service_role` ou token Cloudflare no frontend, Notion, Issues ou documentação pública.
- Dados pessoais e avaliações privadas de alunos/revisores nunca devem ser expostos.
- RLS nas tabelas públicas; autorizações baseadas em identidade controlada, não em metadados editáveis pelo usuário.
- Evidência de fonte, direitos de mídia e revisão humana antes de publicação de conteúdo técnico.
- Projeto separado do EloDo e de outros aplicativos.
- Testes automatizados, inspeção visual e teste de experiência real são níveis diferentes de aprovação.

## Conflitos e comunicação

Correções e objeções devem ser tratadas com respeito e evidências. Se uma tradução for disputada, registrar as versões e fontes; evitar promover a interpretação mais recente apenas por conveniência. A [política de conduta](../CODE_OF_CONDUCT.md) e a [política editorial](CONTENT_POLICY.md) regem as discussões.

## Documentos relacionados

[Arquitetura](ARCHITECTURE.md) · [Roadmap](ROADMAP.md) · [Contribuição](../CONTRIBUTING.md) · [Versionamento](VERSIONING.md) · [Segurança](../SECURITY.md) · [Releases](GITHUB_RELEASES.md).