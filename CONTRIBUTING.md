# Como contribuir — Taekwondo para Todos

Obrigado por ajudar a construir um recurso gratuito e comunitário de Taekwondo em PT-BR. O projeto é **independente, não afiliado à Kukkiwon e não comercial nesta etapa**.

## Comece por uma Issue

Abra uma [Issue](https://github.com/krrozino/kukkiwon-ptbr-tkd/issues) descrevendo:
- **Bug:** URL/tela, dispositivo, passos para reproduzir, resultado esperado e observado; sem enviar dados pessoais.
- **Acessibilidade/UX:** problema específico, impacto para usuário e alternativa proposta.
- **Técnica/tradução:** Hangul, romanização proposta, fonte (instituição, título, edição/ano e página/seção), diferenças entre edições e o que precisa de validação humana.
- **Currículo de escola:** especifique se é requisito local ou referência canônica; não envie dados de alunos ou mídia sem autorização.

**Antes de propor grandes mudanças de código ou conteúdo, discuta o escopo com a manutenção.** A licença do código e das bases de conteúdo ainda não foi definida; a visibilidade pública não autoriza reutilização irrestrita. As contribuições externas de código dependem de alinhamento prévio até a publicação da licença apropriada.

## Preparar ambiente

Leia [Instalação e testes](docs/GETTING_STARTED.md). Não conecte testes a banco produtivo nem suba credenciais reais para o Git.

```bash
npm ci --ignore-scripts
npm run content:check
npm run research:audit
npm run check
npm test
npm run build
npx playwright install chromium
npm run test:ui
```

Use fixtures para testar fluxos editoriais, escolares e banco. Nunca use a conta de um aluno real ou um serviço de outro produto.

## Fluxo de contribuição

1. Crie Issue ou alinhe o escopo antes de mudanças relevantes.
2. Parta da `main` atualizada, em branch curta e temática (ex.: `fix/atlas-dedo-medio` ou `docs/guias-iniciais`).
3. Mantenha a mudança coesa, com testes e documentação proporcionais.
4. Não execute migrações ou deploys em serviços remotos ao trabalhar na PR; esses passos exigem autorização separada.
5. Abra PR, explique como validar, informe Issue, nível de versão e efeitos de segurança/editoriais.
6. Atenda à CI obrigatória, resolva conversas e integre na `main` protegida.
7. Para publicação oficial, **não crie tags nem execute Wrangler diretamente**. O mantenedor inicia o workflow manual depois da CI da `main` no SHA exato.

## Regra de versões

- **MAJOR (`X.0.0`):** mudanças gigantescas / incompatíveis.
- **MINOR (`x.Y.0`):** novas funcionalidades grandes ou médias e reorganizações relevantes.
- **PATCH (`x.y.Z`):** bugs pequenos, melhorias localizadas e adições de técnicas/regiões aprovadas.

Use a maior categoria da PR; alterações apenas documentais geralmente entram no próximo PATCH. Leia [docs/VERSIONING.md](docs/VERSIONING.md).

## Contribuições editoriais

- **Não** publicar pesquisas, material coletado por IA, traduções provisórias ou mídia de terceiros como conteúdo oficial.
- Exigir documento, edição, localizador, fonte e revisão humana **por campo** (Hangul, romanização, tradução, execução, anatomia/variantes).
- Propostas podem ser documentadas e exportadas para revisão, sem modificar o catálogo público.
- Direitos de vídeos, imagens, áudio e textos devem ser documentados antes de uso.
- Currículos próprios de escolas não alteram a terminologia canônica.

Leia [política editorial](docs/CONTENT_POLICY.md), [revisão](docs/EDITORIAL_REVIEW.md) e [pipeline](docs/DATA_PIPELINE.md).

## Segurança e conduta

Não coloque segredos, dados pessoais, credenciais, relatórios privados de revisores ou conteúdo protegido sem licença em Issues/PRs. Para vulnerabilidades, siga [SECURITY.md](SECURITY.md). Respeite as orientações de [conduta](CODE_OF_CONDUCT.md).

## Como decidimos

Implementação, contratos técnicos e testes vivem no GitHub. O planejamento, o contexto das decisões e os riscos são acompanhados no Notion interno, sem divulgar dados privados. Decisões aceitas com efeito no código devem ser refletidas por PR. [Governança](docs/GOVERNANCE.md).