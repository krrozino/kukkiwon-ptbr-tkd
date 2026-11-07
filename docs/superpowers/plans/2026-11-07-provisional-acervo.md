# Acervo provisório e revisão em lote

Objetivo: atender à orientação do mantenedor de 07/11/2026 para consultar o acervo inteiro antes da revisão humana individual. Exposição provisória não equivale a homologação técnica, alteração de estado no banco ou autorização de deploy.

Base: `main` em `e1e6a631b86b16298f2c218f1b33c123e1bbba2f`. Branch exclusiva `feat/editorial-source-queue-44`, clone novo no workspace desta sessão. Risco MEDIUM (exposição de conteúdo em revisão). Issues #43/#44/#50; reaproveita o código de #56 sem escrever na branch original nem nos componentes de atlas atribuídos ao Antigravity.

Escolha: projeção explícita dos lotes editoriais locais em `/acervo`, com fonte/localizador por campo, estado provisório e lacunas visíveis. Mantém o catálogo homologado separado. Os arquivos brutos Gemini, relatórios internos, mídias e credenciais ficam fora da projeção. Não promover estados no Supabase nem fabricar Hangul, passos de Poomsae ou fontes. As interpretações já presentes no #56 continuam identificadas como pesquisa.

- [x] Testar projeção dos campos, duplicidade, URL insegura, relações diretas e consulta reversa, busca e lacunas.
- [x] Acrescentar 12 candidatos documentados na terminologia Kukkiwon, edição inglesa 2011/prefácio 2012, com localizadores e relações apenas quando sustentadas.
- [x] Implementar leitura e busca acessíveis em `/acervo`, links de entrada e exportação CSV local para revisão em lote sem sobrescrita.
- [x] Registrar a exceção editorial solicitada pelo mantenedor e o limite dos estados técnicos.
- [x] Executar conteúdo, pesquisa, fontes, tipos, suíte completa, build e E2E desktop/mobile; publicar somente branch e Draft PR (#57).

STOP: fonte ilegível não será completada por memória; conflito com branch de outro agente não será sobrescrito; nenhum custo externo, Docker, SQL remoto ou deploy. Handoff conterá HEAD, CI, limitações e próxima ação.
