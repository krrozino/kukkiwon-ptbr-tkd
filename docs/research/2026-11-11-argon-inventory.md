# Pesquisa Argon — conferência offline do inventário

**Issue #68.** Documento recebido do mantenedor em 11/11/2026: *Enciclopédia Técnica de Taekwondo* (334 páginas), SHA-256 \`38dcec3822fc052c98554122b438d3db7b262f85ca390063f0ec4a7b8f1cd226\`.

O documento registra 380 candidatos TKD-001..380 e declara 152 aliases. A extração feita para o projeto recuperou 380 linhas; não comprovou as 152 relações. A contagem por rótulo nas linhas diverge da tabela-resumo (327 A / 40 B / 13 C). A extração das colunas tem hifens, continuidades e quebras de página; não usar as células brutas como definição oficial.

## Execução

Descompacte o pacote de extração da conversa do mantenedor **fora** das pastas públicas do site. Execute:

\`\`\`sh
node scripts/argon-inventory.mjs --input "/caminho/inventario_380_celulas_brutas.json"
\`\`\`

Para preservar o relatório completo para revisão offline, opcionalmente acrescente \`--output "/caminho/privado/relatorio-argon.json"\`. O programa **não grava nada** sem \`--output\`, não acessa rede, não escreve no Supabase e proíbe arquivos de saída nos diretórios públicos/de código.

A reconciliação atual identifica **somente slugs idênticos** aos existentes em \`content/review\`. Matches não são equivalências confirmadas. Não alterar \`technical_terms\`, \`LIBRARY_ITEMS\`, os 19 slugs do Atlas, estados de publicação ou políticas de RLS. O próximo estágio será confrontar campos individualmente com a página original e fonte verificável antes de acrescentar qualquer ficha à biblioteca.

O PDF e seus 380 registros permanecem no pacote de pesquisa do mantenedor. Este repositório versiona apenas código de auditoria e testes, sem republicar o texto integral ou material de terceiros.
