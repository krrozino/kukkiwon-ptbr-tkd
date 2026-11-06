## Objetivo e contexto

Descreva o que muda, por que é necessário e qual Issue/ADR sustenta a decisão (ex.: Closes #123).

## Impacto e versionamento

- **Classificação:** [ ] MAJOR [ ] MINOR [ ] PATCH [ ] Apenas docs/sem release isolada
- **Justificativa do nível:** 
- **Próxima versão alvo (se definida):** 
- **Mudanças para visitante, escola ou revisor:** 
- **Compatibilidade e eventual migração/rollback:** 

Leia [MAJOR.MINOR.PATCH](../docs/VERSIONING.md). Mudanças pequenas, incluindo poucas técnicas/regiões **aprovadas**, normalmente são PATCH; funcionalidades grandes/médias e reorganizações são MINOR; mudanças gigantes/incompatíveis são MAJOR. Não criar tag ou Release dentro da PR.

## Segurança e conteúdo

- [ ] Não há deploy automático, migração remota nem escrita no Supabase por esta PR.
- [ ] Nenhuma credencial, dado pessoal ou conteúdo técnico não revisado no build público.
- [ ] RLS e controles de acesso mantidos/validados quando aplicáveis.
- [ ] Fontes, edição/localizador, revisão humana e direitos de mídia documentados quando houver dados de Taekwondo.
- [ ] Alterações de terminologia, Poomsae e currículo de escola não confundem conteúdo próprio com referência canônica.
- [ ] Se houver mudança de ambiente, migração ou segredo, existe plano e autorização humana **separada**.

## Testes e documentação

- [ ] `npm run content:check`
- [ ] `npm run research:audit`
- [ ] `npm run check`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run test:ui` (desktop/mobile, ou justificativa)
- [ ] Documentação/CHANGELOG atualizados (ou justificativa de dispensa)
- [ ] Homologação visual/funcional planejada quando o recurso exigir

## Release

- **Não publicada automaticamente:** integrar na `main` **não** executa deploy.
- **Publicação oficial:** somente workflow manual protegido, após CI de push PASS no SHA exato.
- **Nota de release voltada ao usuário:** 
- **O que permanece pendente após merge/release:** 
