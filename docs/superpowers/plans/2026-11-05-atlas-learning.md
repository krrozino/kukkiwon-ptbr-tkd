# Atlas e coreano interativo — execução do plano aprovado

## Entregas

1. `feat/atlas-full-body`, baseada em `feat/atlas-compact-anatomy` (#21): corrigir controles; registro central de geometria; detalhes de cabeça/pescoço, tronco, braços e pernas com seleção, legenda e painel fixo.
2. `feat/korean-glossary`, baseada na primeira: glossário e fundamentos; palavras/expressões em romanização e hangul; validação editorial no build; lote de 15 palavras e três expressões mantido em revisão.

O usuário autorizou PRs dependentes **em rascunho** enquanto #21 não for integrada. Não mesclar branches compartilhadas, executar deploy, aplicar migrações remotas ou atribuir aprovação humana a conteúdo novo.

## Ciclo de implementação

- Adicionar e observar falha de testes de comportamento antes da implementação.
- Preservar os testes da #21, o primeiro toque e o retorno de foco.
- Executar tipos, testes locais, build e navegador desktop/celular.
- Conferir capturas e revisão independente do diff antes da entrega.

## Contratos

- Geometria ilustrativa não publica nomenclatura: associação técnica somente com registro liberado pela API existente.
- Altura, anatomia, palavra e técnica permanecem conceitos distintos.
- Dados de glossário públicos são somente o lote aprovado versionado; lote novo continua fora do build público até aprovação do usuário e revisor técnico.
- Prévia editorial de conteúdo não aprovado é um build local separado, explicitamente identificado e sem deploy.
- A interação é compartilhada entre romanização e hangul por segmentos editoriais explícitos, sem tradução ou tokenização inferida em tempo de navegação.

## Verificações

Controles e histórico; zonas compatíveis com vista; seleção/legenda com catálogo vazio; primeiro toque sem reflow; não exibir termos de revisão no pacote público; tooltip, painel fixo e teclado; navegação de ficha publicada; aliases de busca; build recusando aprovação incompleta.

## Roadmap posterior

Aprendizagem é a prioridade seguinte: trilha opcional, vocabulário e revisão. Depois, poomsae/vídeos e recursos do professor. Essas frentes não fazem parte desta implementação. Materiais oficiais são referenciados; arquivos e GIFs só serão republicados com permissão registrada. Sem tabela universal por faixa ou certificados de graduação por concluir estudos.
