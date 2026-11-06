# Revisão prática da pesquisa

O laboratório é uma ferramenta de desenvolvimento local. O build público resolve o componente para um módulo vazio e exibe somente o aviso de indisponibilidade. Uma segunda barreira examina todos os arquivos gerados, inclusive chunks órfãos, e interrompe o build se encontrar dados ou código privado do laboratório. Não existe endpoint de upload, persistência no navegador ou escrita no Supabase.

## Abrir o material

1. Instale as dependências com `npm ci --ignore-scripts`.
2. Execute `npm run research:audit` para conferir hashes, cobertura e artefatos versionados. Para regenerar os derivados depois de uma alteração documental revisada, use `npm run research:prepare`.
3. Inicie `npm run dev -- --host 127.0.0.1` e abra `http://127.0.0.1:4321/pesquisa-local`.
4. No seletor de pesquisa, abra `content/research/gemini-2026-11-06/audit.json`. O arquivo reúne os 115 originais, comparações com os 108 registros existentes e a conferência documental individual.

Também é possível abrir `tecnicas_rascunho.json`. Nesse caso, a interface sinaliza que não há inventário existente carregado nem verificação documental individual. Ela não inventa uma comparação com os 108 registros.

## Examinar candidatos

A busca inclui português extraído, Hangul em NFC ou decomposto, romanização, ID, colunas originais e os nomes dos registros correspondentes. Filtros combinam categoria, estado documental, divergência, possível variante, duplicata interna e lotes de até 20 candidatos. A exportação CSV contém somente os resultados filtrados e neutraliza prefixos que planilhas poderiam interpretar como fórmulas.

Cada candidato mostra o valor recebido e sua normalização conservadora, sem remover notas numéricas ou juntar fragmentos por adivinhação. A comparação apresenta nome, Hangul, tradução, definição, lote e localizador do registro existente. Slug igual com Hangul diferente continua visível como conflito. Indícios de família, alias ou variante não se tornam identidade confirmada. O conjunto recalculado pode diferir da comparação preliminar porque também considera relações textuais de sufixo; isso produz encaminhamentos para revisão, não novas técnicas ou fusões automáticas.

O relatório documental limita a verificação aos campos de `evidence[].fields`. A1 continua sendo apenas o rótulo recebido do Gemini. As propostas documentais preservam valor original, valor proposto, justificativa e fonte; não alteram o catálogo.

## Registrar observações

Informe seu nome real e vínculo para iniciar uma sessão. Oito itens de checklist ajudam a organizar a leitura. É possível acrescentar observações e propostas de correção com campo, valor proposto, justificativa, URL HTTPS e página/seção. A sessão mantém os eventos anteriores e as mudanças de checklist, com identidade declarada, horário do navegador, sequência e encadeamento.

**Essa identificação local não é autenticada.** Os horários não são assinaturas de aprovação. Completar checklist, registrar uma proposta ou importar a sessão de outra pessoa não homologa conteúdo. A interface não oferece botão de aprovação/publicação. A futura decisão editorial exige o fluxo autenticado e o modelo de evidências descrito em `docs/KNOWLEDGE_MODEL.md`.

Exporte a sessão e seu histórico antes de fechar ou recarregar a aba. Para continuar, abra primeiro o mesmo `audit.json` e depois selecione o arquivo exportado em “Reabrir sessão JSON”. O hash SHA-256 inclui os originais de todos os candidatos, além da identidade do PDF; outra extração do mesmo PDF não recebe silenciosamente a sessão anterior. Estrutura, candidatos, sequência, IDs e dados dos eventos são validados antes de substituir a sessão atual. O formato é portável, mas não é um log assinado contra adulteração externa.

## Próxima revisão humana

Priorizar os conflitos e as oito propostas documentais. Um especialista em coreano deve decidir grafias, romanização institucional versus Romanização Revisada, literalidade e tradução. Um professor deve conferir execução, biomecânica, variantes, autodefesa e a distinção entre contato e alvo. Poomsae requer conferência da sequência e do contexto curricular sem faixa universal. O acesso aos cinco volumes completos de 2022 ainda é necessário para a comparação individual com essa edição.

As regras de competição devem usar a edição oficial em vigor em 01/11/2026, identificada no índice CURRENT da WT e documentada no relatório. Janeiro de 2026 permanece como evidência histórica; não é a versão atual em 06/11/2026.

## Verificações reproduzíveis

`npm run research:audit`, `npm run content:check`, `npm run check`, `npm test`, `npm run build`, `npm run test:ui` e `npm run test:research:ui` compõem as verificações. O último comando testa o laboratório em servidor de desenvolvimento preso a `127.0.0.1:4322`, nos projetos desktop e mobile. Há casos de arquivo malformado no fim do lote, XSS, busca coreana/portuguesa, teclado, comparação, exportação e reabertura de sessão sem promoção.

O Vitest serializa as suítes porque cada suíte de banco possui uma instância PostgreSQL/WASM. O timeout de inicialização é de 120 segundos e o timeout dos testes permanece em 30 segundos. Isso limita memória concorrente; não enfraquece as asserções de RLS ou integridade.
