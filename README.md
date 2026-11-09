# Taekwondo para Todos

**Enciclopédia e plataforma educacional comunitária de Taekwondo em português (PT-BR).** Gratuita, sem fins lucrativos e independente. **Não é afiliada nem representa oficialmente a Kukkiwon.**

**[Acessar o site](https://kukkiwon-ptbr-tkd.kukkiwon-ptbr-tkd.workers.dev/)** · **[Releases oficiais](https://github.com/krrozino/kukkiwon-ptbr-tkd/releases)** · **[Documentação](docs/INDEX.md)** · **[Contribuir](CONTRIBUTING.md)** · **[Reportar problema](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues)**

> **Precisão antes de volume.** O site oferece recursos educativos, mas técnicas, traduções e sequências só são apresentadas como referência técnica validada após conferência documental, revisão humana e verificação de direitos.

## O que você encontra

Esta tabela descreve os recursos da **v0.2.0 publicada em 06/11/2026**. A presença de páginas no site não significa que todas as fichas técnicas ou os fluxos escolares estejam homologados; consulte [Releases](https://github.com/krrozino/kukkiwon-ptbr-tkd/releases) para o histórico.

| Área | O que faz | Limitação atual |
| --- | --- | --- |
| [Atlas corporal](https://kukkiwon-ptbr-tkd.kukkiwon-ptbr-tkd.workers.dev/atlas) | Seleção de cabeça, tronco, braços, pernas, mãos e pés; vistas e descrições anatômicas | O desenho é ilustrativo; nomes técnicos não verificados não são homologados |
| [Catálogo](https://kukkiwon-ptbr-tkd.kukkiwon-ptbr-tkd.workers.dev/catalogo) | Busca, filtros e referências de fichas elegíveis; introdução às famílias de movimentos | Fichas técnicas dependem de revisão editorial individual |
| [Poomsae](https://kukkiwon-ptbr-tkd.kukkiwon-ptbr-tkd.workers.dev/poomsae) | Introdução aos oito Taegeuk e às referências consultáveis | Sequências detalhadas aguardam fontes e revisão |
| [Fundamentos](https://kukkiwon-ptbr-tkd.kukkiwon-ptbr-tkd.workers.dev/fundamentos/alturas-e-direcoes) | Alturas e direções como conceitos educativos | Termos coreanos só aparecem quando liberados |
| [Currículos](https://kukkiwon-ptbr-tkd.kukkiwon-ptbr-tkd.workers.dev/curriculos) | Criar currículo local; ferramentas de escola e compartilhamento | Fluxos hospedados de escola requerem homologação funcional |
| [Estudos](https://kukkiwon-ptbr-tkd.kukkiwon-ptbr-tkd.workers.dev/estudos) | Organização e anotações para estudar | Exercícios vinculados a técnicas dependem de fichas publicadas |

### Para quem é

- **Alunos:** consultar referências, descobrir regiões do corpo e organizar o estudo.
- **Professores e escolas:** estruturar currículos próprios sem alterar o catálogo canônico.
- **Pesquisadores, tradutores e revisores:** colaborar com evidências, fontes, dúvidas e correções rastreáveis.
- **Desenvolvedores:** melhorar acesso, desempenho, UX, testes e ferramentas educativas.

## Estado do projeto e transparência

- A versão oficial **[v0.2.0](https://github.com/krrozino/kukkiwon-ptbr-tkd/releases/tag/v0.2.0)** foi publicada como prerelease em 06/11/2026 após o workflow [#42296206029](https://github.com/krrozino/kukkiwon-ptbr-tkd/actions/runs/42296206029) passar. A primeira versão oficial foi a [v0.1.0](https://github.com/krrozino/kukkiwon-ptbr-tkd/releases/tag/v0.1.0). A versão de produção deve ser verificada em Releases e Actions, não apenas na `main`.
- A tag `v0.2.0` aponta para `d0b3a9db76257350a11043da3c3bc0a5f6088470`. Publicação de software **não substitui** homologação visual do atlas, de fluxos escolares ou de técnicas.
- No último diagnóstico remoto havia **105 registros técnicos em `draft` e nenhum `published`**. Registros preliminares de Git e pesquisas externas são conjuntos distintos e não devem ser somados ou contados como técnicas aprovadas.
- A migração de pesquisa privada e de relações de Poomsae permanece proposta e **não aplicada ao Supabase remoto** até autorização/homologação próprias.
- O software publicado não certifica, homologa ou chancela técnicas da Kukkiwon.

## Tecnologia e responsabilidades

| Camada | Tecnologia |
| --- | --- |
| Frontend | Astro + React + TypeScript |
| Site/hosting | Cloudflare Workers com assets estáticos |
| Dados | Supabase / PostgreSQL dedicado, Row-Level Security (RLS) |
| Testes | Astro check, TypeScript, Vitest, Playwright (desktop/mobile), PGlite |
| Código e CI/CD | GitHub, branch `main` protegida, GitHub Actions, Releases |

Fluxo principal: visitante → páginas Astro/React → API pública Supabase com chave publicável → dados com políticas RLS. Pesquisa editorial e conteúdo de escola possuem fronteiras diferentes; leia a [arquitetura](docs/ARCHITECTURE.md).

O projeto não compartilha o banco de dados nem as decisões de produto com o **EloDo**.

## Desenvolvimento local

**Pré-requisitos:** Node.js 22 atualizado ou 24, npm, Git. Para testes de interface, Chromium do Playwright.

```bash
git clone https://github.com/krrozino/kukkiwon-ptbr-tkd.git
cd kukkiwon-ptbr-tkd
npm ci --ignore-scripts
cp .env.example .env
npm run dev
```

No Windows/PowerShell, crie o arquivo de ambiente com `Copy-Item .env.example .env`. Edite apenas as variáveis públicas que você realmente utilizar. **Nunca coloque `service_role`, `sb_secret_*`, senha ou token Cloudflare em arquivos do frontend.** Para instruções completas, veja [Instalação e testes](docs/GETTING_STARTED.md).

```bash
npm run content:check
npm run research:audit
npm run check
npm test
npm run build
npx playwright install chromium
npm run test:ui
```

A CI da PR não importa dados no banco remoto nem publica o site.

### Laboratório documental da mão (Atlas A3)

Com `npm run dev`, abra `/atlas-mao-local` para selecionar as regiões existentes da mão e consultar evidências por campo. O índice permite pesquisar os 23 termos, incluindo as 14 configurações sem geometria. Todos os vínculos são propostas; revisão humana, tradução e geometria continuam pendentes conforme cada registro.

Esta implementação está disponível somente no servidor de desenvolvimento. `npm run build` substitui o componente por uma versão vazia e verifica a ausência da matriz e de fragmentos documentais em todos os chunks públicos. Nenhuma flag pública habilita o laboratório. O contrato e os estados editoriais da pesquisa são preservados.

`npm run atlas:hand:check` audita a matriz offline. `npm run test:research:ui` verifica o laboratório; `npm run test:ui` inclui a fronteira do build público e as regressões do inspector. Veja o [plano de implementação](docs/superpowers/plans/2026-11-08-atlas-a3-local.md).

## Versionamento: MAJOR.MINOR.PATCH

Adotamos uma classificação explícita pelo maior impacto da mudança:

- **`MAJOR` — `X.0.0`:** mudanças gigantescas, rupturas de compatibilidade, reconstrução importante de arquitetura ou novo estágio de plataforma.
- **`MINOR` — `x.Y.0`:** mudanças grandes ou médias, novas funcionalidades relevantes e reorganizações estruturais compatíveis.
- **`PATCH` — `x.y.Z`:** correções pequenas, refinamentos e inclusão de técnicas/regiões **já revisadas e aprovadas**, além de ajustes localizados compatíveis.

Exemplos: `0.2.0 → 0.2.1` (correção/pequeno conteúdo), `0.2.0 → 0.3.0` (nova funcionalidade), `0.3.0 → 1.0.0` (marco grande deliberado). O primeiro `1.0.0` não é automático; mesmo em `0.x.y` seguimos essa regra. Consulte a [política completa](docs/VERSIONING.md).

**Tag e GitHub Release são criadas apenas depois do deploy oficial e do smoke test bem-sucedidos.** Não renomear nem reutilizar tags.

## Como contribuir

Comece por uma [Issue](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues) com problema reproduzível, proposta de UX, fonte documental ou sugestão de conteúdo. Para código, leia [CONTRIBUTING.md](CONTRIBUTING.md). Para correções técnicas, informe documento, edição/ano e localizador. Conteúdo gerado automaticamente não é validação humana.

O repositório está público, **mas a licença de código, a licença da base técnica e as permissões das mídias ainda não foram definidas**. Isso não significa autorização irrestrita de reutilização. Contribuições de código devem ser alinhadas ao mantenedor enquanto essa decisão estiver aberta. Nunca envie materiais protegidos, identidades privadas de revisores ou credenciais.

## Documentação e governança

- [Índice completo da documentação](docs/INDEX.md)
- [Arquitetura e ambientes](docs/ARCHITECTURE.md)
- [Instalação, configuração e testes](docs/GETTING_STARTED.md)
- [Catálogo, Poomsae e recursos](docs/FEATURES.md)
- [Política de versões](docs/VERSIONING.md) e [changelog](CHANGELOG.md)
- [Releases e deploy](docs/GITHUB_RELEASES.md)
- [Governança e decisões](docs/GOVERNANCE.md) · [Índice de ADRs](docs/DECISIONS.md) · [Orquestração de agentes](docs/AGENT_DISPATCH.md) · [Arte original](docs/ORIGINAL_ATLAS_ART.md) · [Referências por afirmação](docs/SOURCE_PROVENANCE.md)
- [Política editorial](docs/CONTENT_POLICY.md) e [revisão humana](docs/EDITORIAL_REVIEW.md)
- [Roadmap e limites conhecidos](docs/ROADMAP.md)
- [Segurança](SECURITY.md), [conduta](CODE_OF_CONDUCT.md) e [contribuição](CONTRIBUTING.md)

O **GitHub** é a referência pública e versionada de implementação. O **Notion** organiza decisões, contexto, prioridades e riscos da equipe. As duas fontes não substituem a validação técnica e editorial.

---

**Taekwondo para Todos** — conhecimento acessível, fonte rastreável e respeito à comunidade e aos direitos autorais.
