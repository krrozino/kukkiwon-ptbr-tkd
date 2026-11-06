# Histórico de alterações

As versões **realmente publicadas** são registradas em [GitHub Releases](https://github.com/krrozino/kukkiwon-ptbr-tkd/releases), com tags SemVer de acordo com package.json. A classificação MAJOR/MINOR/PATCH segue [docs/VERSIONING.md](docs/VERSIONING.md).

## Documentação e governança — em desenvolvimento, sem release própria

- README público atualizado para explicar o projeto, seu estado real, limitações e como contribuir.
- Índice, arquitetura, recursos, guia local, governança, roadmap, segurança operacional e runbook de release reorganizados em `docs/`.
- Política de versionamento MAJOR (mudanças gigantes), MINOR (grandes/médias) e PATCH (pequenas, incluindo conteúdo técnico revisado).
- Notion como base interna para decisões ADR, roadmap e riscos; implementações e contratos permanecem no GitHub.
- Mudanças somente documentais não geram deploy ou tag por si. Incluir no próximo PATCH de distribuição, se aplicável.

## v0.2.0 — atlas explicativo e aprendizado introdutório (candidato)

- Atlas anatômico: polígonos curvos para cabeça, tronco, braços e pernas; explicação em português para todas as 50 zonas ilustradas, inclusive mãos e pés.
- Legendas com nomes de áreas no lugar de números e mensagens genéricas. Textos anatômicos não são traduções técnicas homologadas.
- Conteúdo educativo introdutório: oito Taegeuk com referências públicas da Kukkiwon, famílias de movimentos e roteiro independente de estudo/currículo.
- Página inicial com links para Poomsae e categorias de movimentos.
- Mantidas as salvaguardas editoriais, queries públicas, RLS e isolamento dos rascunhos; técnicas em revisão não são publicadas.
- Release oficial somente após CI do SHA exato, deploy manual e smoke HTTP das rotas.

## v0.1.0 — primeira prerelease oficial (publicada em 06/11/2026)

- GitHub Release: https://github.com/krrozino/kukkiwon-ptbr-tkd/releases/tag/v0.1.0
- Worker oficial e cinco rotas HTTP aprovados: https://github.com/krrozino/kukkiwon-ptbr-tkd/actions/runs/42288285862


- PR #29: auditoria por campo de 115 candidatos Gemini, inventário preservado e comparação conservadora com os 108 registros editoriais.
- PR #30: pesquisa privada, evidências e histórico imutável, revisão autenticada futura e relações de Poomsae; migração testada apenas localmente.
- PR #31: laboratório local com comparação, filtros, checklist e sessões exportáveis de observações/propostas; implementação excluída do build público.
- PR #32: referências e vínculos publicados no catálogo/atlas/glossário, Poomsae opcional e fundamentos de aprendizagem derivados de conteúdo elegível.
- PR #21: refinamento de mãos/pés e orientação das vistas.
- PR #22: atlas de corpo inteiro, regiões e controles.
- PR #23: glossário e fundamentos sem exposição de conteúdo em revisão.
- PR #24: laboratório editorial local e barreira contra publicação de pesquisa não homologada.
- Governança: tags/Releases após deploy, templates de Issues e PRs, notas geradas e Dependabot agrupado.

As seções de candidatas descrevem código ainda não publicado. Releases oficiais e seus links de Actions comprovam o histórico de produção confirmado.
