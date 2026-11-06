# Funcionalidades e escopo real

Este documento diferencia **funcionalidade desenvolvida**, **dados efetivamente publicados** e **homologação final**. A existência de componentes no repositório não comprova deploy ou aprovação editorial.

## Recursos educativos

| Módulo | Recurso da v0.2.0 publicada | Restrições atuais |
| --- | --- | --- |
| Página inicial | Acesso ao atlas, currículos, estudos, Poomsae e categorias de movimentos | Verificar Release implantada |
| Atlas corporal | Silhueta com vistas, zoom, regiões selecionáveis, recortes de mãos/pés e textos anatômicos em PT-BR | Ilustrativo; alguns ajustes de recorte dependem de homologação humana |
| Catálogo | Busca/filtros/paginação de termos elegíveis e panorama das famílias de movimento | Fichas reais só quando publicadas individualmente; 105 drafts no último inventário |
| Poomsae | Introdução referenciada aos oito Taegeuk; estrutura para sequências por fonte | Passos não inventados; tabela de conhecimento adicional ainda não aplicada no remoto |
| Glossário/fundamentos | Alturas, direções e palavras que tenham sido liberadas | Não importar traduções provisórias |
| Currículos locais | Editor e leitura de currículos no navegador sem conta | O rascunho local não sincroniza automaticamente com outros dispositivos |
| Escolas | Auth, currículo da escola, compartilhamento e mídia condicionada a direitos | Fluxos hospedados ainda requerem homologação em ambiente real |
| Estudos/aprender | Organização e atividades vinculadas a conteúdo publicado | Não gerar quiz sintético como conteúdo técnico real |
| Fontes | Exibir referência autorizada de registros elegíveis | Não expor documentos ou observações de pesquisa privada |

## Termos e classes de conteúdo

1. **Descrição anatômica ilustrativa:** texto didático sobre localização no corpo. Não é terminologia oficial.
2. **Pesquisa/candidato/rascunho:** observação, coleta, proposta ou tradução que aguarda fonte e revisão. **Não publicada**.
3. **Ficha técnica publicada:** registro com status e evidências requeridas, aprovado por processo editorial próprio.
4. **Conteúdo de currículo escolar:** escolha da escola/professor; não altera o catálogo canônico.
5. **Referência oficial externa:** link institucional com atribuição. A existência do link não torna o site afiliado à instituição.

## Por que ainda há fichas vazias?

Na conferência de 06/11/2026 havia 105 `technical_terms` com `publication_status='draft'` e zero com `published` no Supabase remoto. É uma escolha deliberada de proteção editorial — não uma falha genérica de conexão. A pesquisa na pasta `content/` e os registros no banco têm históricos e contagens diferentes. O conteúdo introdutório publicado na v0.2.0 permite aprendizado sem atribuir validação a esses rascunhos.

## Critérios de aceitação para declarar recurso funcional

- Teste de componentes e E2E desktop/mobile PASS.
- Verificação de acesso anônimo, login/logout e permissões de escola quando aplicável.
- Operação em Worker oficial com URL de deploy conhecida.
- Sem exposição de dados ou referências de rascunho.
- Revisão visual real de interface, responsividade, regiões, legibilidade e contraste.
- Revisão por fonte e pessoa qualificada quando o recurso incluir execução/terminologia técnica.
- Teste de revogação/retração de conteúdo e links compartilhados quando aplicável.

## Evolução futura

Ver [Roadmap](ROADMAP.md), [Governança](GOVERNANCE.md) e [Política editorial](CONTENT_POLICY.md).