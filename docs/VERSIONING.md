# Política de versionamento — MAJOR.MINOR.PATCH

**Decisão adotada em 06/11/2026.** O projeto usa SemVer como formato `MAJOR.MINOR.PATCH`, com critérios operacionais acordados para o impacto da mudança, inclusive durante o desenvolvimento `0.x.y`.

## Regras

| Segmento | Alterar quando | Exemplos |
| --- | --- | --- |
| **MAJOR — `X.0.0`** | Mudança **gigantesca**: ruptura de compatibilidade relevante, transformação ampla do produto, reconstrução de arquitetura ou novo estágio de plataforma | Reescrita dos contratos centrais e migração obrigatória incompatível; mudança abrangente de experiência |
| **MINOR — `x.Y.0`** | Mudança **grande/média**, nova capacidade significativa ou alteração de estrutura relevante, mas compatível no uso principal | Grande redesign do atlas; módulo de Poomsae funcional; novo fluxo de gestão de currículos |
| **PATCH — `x.y.Z`** | Mudança **pequena**, correção, refinamento, pequeno ajuste estrutural compatível, inclusão/ajuste de técnicas ou regiões **aprovadas** | Corrigir o recorte de um dedo; melhorar acessibilidade de um botão; publicar poucas fichas com revisão documental |

### Exemplos reais de classificação

- `0.2.0 → 0.2.1`: corrigir alinhamento de um recorte, atualizar textos ou liberar um conjunto pequeno de termos **depois** da revisão editorial.
- `0.2.0 → 0.3.0`: nova funcionalidade de ensino ou reestruturação de telas e navegação de porte médio.
- `0.3.0 → 1.0.0`: marco grande **deliberadamente aprovado** para consolidar a plataforma.
- `1.4.2 → 2.0.0`: alteração massiva ou incompatibilidade explícita.

## Como decidir

1. Liste o que mudou para **usuários, dados, integrações e contribuidores**.
2. Classifique cada mudança como PATCH, MINOR ou MAJOR.
3. O pacote assume **o maior nível** entre todas as mudanças. Um bugfix incluído num grande recurso não reduz MINOR para PATCH.
4. Incrementa-se **apenas o número escolhido**, e os números menores são zerados: `1.2.4 → 1.3.0`; `1.3.0 → 2.0.0`.
5. Nunca retroceda a versão nem reuse uma tag de Release já emitida.
6. Se a mudança for só documental, normalmente é **PATCH** quando merecer uma nova versão distribuída. **Não** fazer deploy só por editar Markdown. A próxima Release documenta a alteração no changelog.
7. Se não houver consenso sobre impacto, registrar a justificativa na PR/Issue e na base de decisões antes de definir o número.

### Particularidades do pré-1.0

SemVer admite maior flexibilidade em versões `0.x.y`; **aqui seguimos a classificação acima mesmo antes de 1.0.0**. O salto `0.x.y → 1.0.0` não acontece automaticamente após número específico de funcionalidades: requer decisão humana de maturidade e homologação.

### Conteúdo técnico não altera a segurança

- Pequenas adições de técnicas, regiões ou traduções **podem ser PATCH**, mas **somente** depois da conferência das fontes, revisão humana e direitos da mídia.
- Um lote grande que reorganiza a taxonomia, introduz novos modelos ou altera a experiência pode ser **MINOR** mesmo sendo conteúdo.
- O número da versão **nunca** serve como aprovação editorial, licença ou atribuição institucional.
- Recolher uma técnica por erro documental pode precisar de PATCH urgente e de registro do incidente.

## Fonte de verdade de uma versão

| Elemento | Finalidade |
| --- | --- |
| `package.json` | Versão candidata do aplicativo |
| `package-lock.json` | Mesma versão e dependências fixadas |
| `CHANGELOG.md` | O que mudou, com referências a PRs/issues |
| `main` protegida | Commit de release que passou em CI de push |
| Tag `vX.Y.Z` | Identifica o SHA exato realmente implantado |
| GitHub Release | Registro público **pós-deploy** com notas e estado prerelease/stable |
| Cloudflare Worker | Artefato público implantado, sujeito a smoke e validação visual |

Uma versão alterada em `package.json` **não é release**. Não criar tag nem GitHub Release antecipadas para contornar CI, nem fazer deploy de PR/branch por fora do workflow oficial. Para esta instalação, tag e Release só são criadas **após** o Worker e as cinco rotas de smoke passarem.

## Checklist de PR e release

**Toda PR** informa:
- Impacto estimado: `MAJOR / MINOR / PATCH / sem release isolada`, com justificativa.
- O que muda para visitantes, professores e revisores.
- Mudanças no esquema ou na visibilidade editorial (se houver).
- Testes executados e resultado de CI.
- Efeito em documentação, permissões, segurança e mídias.
- Se integra uma release já planejada ou exige novo número.

**Uma Release** exige:
- Atualização de versão e changelog na PR.
- CI de PR e CI de push no **SHA exato** da main com `success`.
- Verificação de inexistência de tag e Release para a versão.
- Autorização manual para executar o workflow oficial `PUBLICAR`.
- Build com conteúdo editorial não aprovado isolado.
- Cloudflare deploy bem-sucedido, cinco rotas HTTP e GitHub Release vinculada ao mesmo SHA.
- Homologação visual e dos fluxos afetados antes de considerar a versão funcionalmente aprovada.

Veja [runbook](GITHUB_RELEASES.md) e [histórico](../CHANGELOG.md).