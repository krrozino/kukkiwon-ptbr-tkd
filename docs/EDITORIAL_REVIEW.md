# Revisão humana do primeiro lote Kukkiwon PT-BR

Este é o procedimento **offline** para encaminhar os 105 registros versionados à revisão de professores e pessoas qualificadas em coreano. Não altera o Supabase, o site nem o estado editorial do conteúdo.

## Gerar planilha sem sobrescrever revisões

Na pasta do repositório:

```bash
npm ci --ignore-scripts
npm run content:check
npm run content:review -- --output revisao-geral.csv
npm run content:review -- --batch kukkiwon-2012-expansion --category chute --output chutes-expansao.csv
```

Os arquivos ficam em `review-output/` (ignorado pelo Git). O formato CSV usa UTF-8, separador ponto e vírgula e cabeçalho em português, para abertura no Excel ou importação no Google Planilhas.

O comando usa `wx`: se o arquivo já existir, **não sobrescreve** as observações humanas. Para gerar outra versão, escolha um novo nome.

Sem `--output`, o comando envia o CSV ao terminal (útil para redirecionamento em sistemas Unix). Não compartilhe publicamente respostas de revisores sem autorização.

## Como preencher

Cada linha representa um termo. Os campos da fonte, Hangul, romanização, significado, histórico e localizador são evidências e **não devem ser alterados na cópia de revisão**; anote qualquer correção em `observacoes_revisor`.

Um(a) revisor(a) pode preencher:
- `revisar_hangul_romanizacao`: pendente / aprovado / corrigir
- `revisar_traducao`: pendente / aprovado / corrigir
- `revisar_execucao`: pendente / aprovado / corrigir
- `revisar_anatomia_variantes`: pendente / aprovado / corrigir
- `comparar_edicao_2022`: pendente / aprovado / sem_acesso (não presumir aprovação sem texto acessível)
- `decisao_final`: pendente / apto_para_revisao_final / corrigir
- `revisor`, `data_revisao`, `link_evidencia_revisao`, `observacoes_revisor`.

O conjunto de 20 registros anteriormente marcados como `document_checked` **não comprova aprovação humana** da execução ou da tradução. Por isso, todas as células de revisão começam como `pendente`, sem nome de revisor.

Três termos merecem inspeção visual prioritária: `jebipum-chigi`, `sewo-jiruegi` e `biteureo-makgi`. Suas notas vêm preenchidas na coluna de observações preexistentes.

## Restrições operacionais

- O CSV **não é uma autorização para publicar** e nenhum comando importa resultados ou promove rascunhos.
- A revisão do texto coreano, da técnica e das traduções deve ser rastreável; uma IA não pode registrar aprovação humana.
- A comparação com os livros Kukkiwon 2022 depende de acesso legítimo à obra.
- Só depois da devolutiva, da verificação independente e da aprovação do responsável editorial será criado um processo separado de promoção/publicação com histórico de revisão.
- Não inclua emails pessoais, telefones ou documentos dos revisores no repositório público.
