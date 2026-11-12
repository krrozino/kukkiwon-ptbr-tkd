# Progressões por escola — intervalos numerados

A escola decide as faixas e os requisitos. Exemplo específico fornecido pelo mantenedor: Faixa Amarela com Sebon 1–5 e Ponta Verde com Sebon 1–10. Estes exemplos NÃO representam padrão universal Kukkiwon nem fornecem os passos técnicos de cada sequência.

O contrato `Requirement` foi expandido sem migração SQL: `kind` admite as sete áreas de conteúdo; `sequenceType` aceita Sebon, Dubon, Anjoa e outra sequência; `sequenceStart`/`sequenceEnd` são inteiros de 1 a 100, ambos obrigatórios quando há numeração, com fim >= início. Currículos legados continuam aceitos.

O editor oferece preenchimento rápido dos dois exemplos e persiste o documento pelo mesmo fluxo existente. O visualizador apresenta a faixa e o intervalo escolhido sem inventar instruções. A privacidade dos termos próprios da escola permanece submetida aos controles já existentes.

Não aplicar SQL, não inserir dados de escolas reais nem tornar uma sequência marcada como conteúdo oficial sem fonte. Antes de merge confirmar os testes de persistência local e a leitura/gravação no fluxo de escolas em ambiente de testes com conta autorizada.
