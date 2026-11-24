# Atlas Corporal Consolidado (V1) — Issue #41

- **Repositório / Epic:** `krrozino/kukkiwon-ptbr-tkd` · Issue `#41`
- **Base / Branch:** `main @ ee65d4cb5746bd9b5c448a31250ad418c6270344` · `antigravity/atlas-corporal-consolidado`
- **Worktree ativa:** `D:\programations\kukkiwon-atlas-cabeca-90-visual`
- **Data da conferência documental:** `2026-11-24`

---

## 1. Cobertura corporal V1 e aprofundamento anatômico (Fases 2–5)

Todos os seis módulos regionais do Atlas operam integralmente offline a partir de `src/lib/public-*.ts`, sem chamadas ao catálogo remoto Supabase (`/rest/v1/**`), mantendo a identidade visual aprovada e preservando integralmente a geometria de `Mãos` (`handOutline`, `fistOutline` e 23 fichas verificadas).

| Módulo | Vistas | Recortes e superfícies | Destaques estruturais e padronização |
| --- | --- | --- | --- |
| **Cabeça e pescoço** | Anterior, Posterior | `head-face`, `head-forehead`, `head-temples`, `head-chin`, `head-occiput`, `head-neck` (6) | Refatorado para reutilizar `AtlasSourceCitation`, `AtlasReviewStamp` e `AtlasIllustrativeCredit`; mantém linhas guia faciais e posteriores em `HeadFeatureOverlay`. |
| **Tronco** | Anterior, Posterior | `torso-shoulders`, `torso-chest`, `torso-solar-plexus`, `torso-abdomen`, `torso-flanks`, `torso-back`, `torso-lumbar` (7) | Novo escudo dedicado para plexo solar (`torso-solar-plexus`), ombros com malha posterior contínua sobre trapézio (`backPath`), sobreposição de gola/faixa/coluna (`BodyAreaFeatureOverlay`) e distinção entre região ilustrativa, área geral (`Momtong`, `Arae`) e alvo detalhado/contextual. |
| **Braços e antebraços** | Anterior, Posterior | `arms-upper`, `arms-elbow` (`palgup`), `arms-forearm`, `arms-wrist`, `arms-inner-forearm` (`anpalmok`), `arms-outer-forearm` (`bakkatpalmok`) (6) | Refatorado para compartilhar `AtlasSourceCitation`, `AtlasReviewStamp`, `AtlasIllustrativeCredit` e `AtlasViewNotice`. |
| **Mãos** | Palma, Dorso, Punho fechado | 23 superfícies e configurações (`PublicHandContent`) | Geometria de mão/punho e superfícies preservadas sem alterações (`atlas:hand:check`). |
| **Pernas e tornozelo** | Anterior, Posterior | `legs-hip`, `legs-thigh`, `mureup` (`legs-knee`), `legs-knee-back`, `jeonggangi` (`legs-shin`), `legs-calf`, `legs-ankle` (7) | Borda superior do pé ajustada para `y=393` e desenhada antes da barra da calça em `BodyIllustration.tsx` (eliminando fresta no tornozelo); `viewBox="72 234 116 194"`, `aspect-ratio: 116 / 194` e `clipPath` secundário em `BodyRegionMap.tsx` eliminando sobras de mangas; linhas anatômicas de patela, dobra poplítea e maléolo em `BodyAreaFeatureOverlay`. |
| **Pés** | Planta, Dorso | 8 superfícies + `illustration-foot-arch` | Refatorado para compartilhar `AtlasInspectionEvidence`; seção lateral `Tornozelo` atualizada com parágrafo próprio para `Abrir Tornozelo no Atlas das pernas →` (`/atlas?region=legs-ankle&zoom=1`). |

---

## 2. Evidência técnica — Tronco e Pernas/Tornozelo (Fase 6)

Fonte primária principal: [Kukkiwon Textbook / Terminology (`boardMedia/11621`)](https://research.kukkiwon.or.kr/homepage/boardMedia/11621) (PDF de 96 páginas).

| Região (`id` / `slug`) | Classificação | Termo coreano / Romanização | Hangul | Referência e localizador verificados | Vínculos Biblioteca / Atlas |
| --- | --- | --- | --- | --- | --- |
| `torso-shoulders` | Alvo detalhado (`detailed_target`) | Sem Hangul/romanização nessa passagem | — | [`11621#page=10`](https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=10) (`§10 Detailed Target · shoulder`) | — |
| `torso-chest` | Área-alvo geral + contextual | `Momtong` · `Gaseum` | `몸통` · `가슴` | [`11621#page=10`](https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=10) (`Momtong (Trunk)`), [`11621#page=77`](https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=77) (`Gaseum-balkko-ap-chagi`, p. 77 e índice p. 82), norma NIKL 2000 | `/biblioteca/kibon-dongjak/an-makgi`, `/fundamentos/alturas-e-direcoes` |
| `torso-solar-plexus` | Alvo detalhado | `Myeongchi` | `명치` | [`11621#page=10`](https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=10) (`solar plexus (myeongchi)`), [`11621#page=41`](https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=41) (`§8 Junbi-jase`) | `/biblioteca/kibon-dongjak/jeocheo-jireugi`, `/biblioteca/kibon-dongjak/kibon-alturas-direcoes` |
| `torso-abdomen` | Área-alvo geral | `Arae` (`Danjeon` em §8) | `아래` | [`11621#page=10`](https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=10) (`Arae (Lower Body)`), [`11621#page=41`](https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=41) (`§8 Gibon-junbi / Bojumeok-junbi`) | `/biblioteca/kibon-dongjak/gibon-junbi`, `/biblioteca/kibon-dongjak/naeryeo-makgi` |
| `torso-flanks` | Ilustrativa apenas | — | — | Compõe contextualmente a altura média (`Momtong`), sem entrada isolada nas páginas consultadas | — |
| `torso-back` | Alvo detalhado | `Deung` | `등` | [`11621#page=10`](https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=10) (`Detailed Target · back`), [`11621#page=78`](https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=78) (`Deung-balgo-ap-chagi-se-dangye`, p. 78 e índice p. 85) | — |
| `torso-lumbar` | Alvo detalhado | `Heori` | `허리` | [`11621#page=10`](https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=10) (`Detailed Target · waist`), [`11621#page=40`](https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=40) (`Dujumeok-heori-junbi`, p. 40 e índice p. 85) | `/biblioteca/kibon-dongjak/tongmilgi-bojumeok-junbi`, `/acervo#dujumeok-heori-junbi` |
| `legs-hip` | Anatômica contextual | `Arae` | `아래` | [`11621#page=10`](https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=10) (`Target areas · Arae`) | `/biblioteca/kibon-dongjak/juchum-seogi` |
| `legs-thigh` | Ilustrativa apenas | — | — | [`11621#page=73`](https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=73) (menção descritiva a `upper leg` em `Mureup`) | `/biblioteca/kibon-dongjak/apgubi` |
| `legs-knee` / `mureup` | Superfície de contato (`surface`) | `Mureup` | `무릎` | [`11621#page=73`](https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=73) (`Appendix > Applicable Parts of the Body > Mureup`), [`11621#page=25`](https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=25) (`Mureup-dollyeo-chagi`) e §10 p. 10 | `/biblioteca/kibon-dongjak/palgup-mureup-chigi` |
| `legs-knee-back` | Anatômica contextual | `Ogeum` | `오금` | [`11621#page=56`](https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=56) (`§12 Ogeum-deureo-neomgigi / Ogeum-georeo-neomgigi`, índice p. 91) e [`11621#page=8`](https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=8) (`Ogeum-seogi`) | — |
| `legs-shin` / `jeonggangi` | Superfície de contato (`surface`) | `Jeonggangi` | `정강이` | [`11621#page=72`](https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=72) (`Appendix > Applicable Parts of the Body > Jeonggangi`) e [`11621#page=45`](https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=45) (`Junggangi-badamakgi`, §5 p. 6) | `/biblioteca/kibon-dongjak/an-makgi` |
| `legs-calf` | Ilustrativa apenas | — | — | Sem entrada própria no apêndice ou na lista de alvos detalhados consultada | `/biblioteca/balkisul/dwichuk` |
| `legs-ankle` | Alvo e articulação (`target_joint`) | `Balmok` | `발목` | [`11621#page=10`](https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=10) (`Detailed Target · ankle`, §9 p. 43) e [`11621#page=56`](https://research.kukkiwon.or.kr/homepage/boardMedia/11621#page=56) (`Balmok-georeo-neomgigi`, índice p. 88) | `/atlas?region=feet&zoom=1`, `/biblioteca/balkisul` |

### Lacunas documentais objetivas (pendências reais)

1. **`torso-shoulders`:** a lista de alvos detalhados em `11621#page=10` registra `shoulder` apenas em inglês, sem termo coreano ou Hangul nessa passagem.
2. **Regiões sem termo técnico isolado nas fontes consultadas:** `torso-flanks` (laterais do tronco), `legs-thigh` (coxa, citada apenas descritivamente como `upper leg` em `Mureup`), `legs-calf` (panturrilha) e `legs-hip` (quadril sem superfície isolada no apêndice) permanecem claramente rotulados como regiões ilustrativas ou contextuais.
3. **Tornozelo (`Balmok` / `발목`):** documentado como `Detailed Target · ankle` (`§10`), em chaves (`§9`, p. 43) e rasteiras (`§12`, p. 56 e índice p. 88), mas **ausente** do apêndice *Applicable Parts of the Body* (pp. 69–75); não é promovido a superfície de contato.
4. **Conferência em edição coreana do manual Kukkiwon:** `Momtong (몸통)`, `Arae (아래)` e `Myeongchi (명치)` tiveram a romanização confirmada em `11621#page=10` e o Hangul conferido no léxico/lotes do projeto; ficam pendentes de conferência direta na edição em Hangul do livro-texto oficial.
5. **Variante gráfica no manual inglês:** `Jeonggangi` (p. 72) aparece grafado como `Junggangi-badamakgi` em `§10` (p. 45), diferença registrada na ficha.
6. **Pronúncia didática PT-BR e KR-DICT offline:** não foi inventada pronúncia figurada sem revisão linguística; a resolução DNS de `krdict.korean.go.kr` e `www.korean.go.kr` falhou neste ambiente local (`O nome remoto não pôde ser resolvido`), impedindo extrair novos IDs `ParaWordNo`.

---

## 3. Comparativo visual consolidado (Fase 7 e 9)

- Desktop (`1280×860`, temas claro/escuro, Frente e Costas): [atlas-tronco-pernas-desktop.jpg](atlas-tronco-pernas-desktop.jpg)
- Mobile (`390×844`, temas claro/escuro, Frente e Costas): [atlas-tronco-pernas-mobile.jpg](atlas-tronco-pernas-mobile.jpg)

---

## 4. Inventário de armazenamento e plano seguro de limpeza (Fase 0)

Medição executada em `2026-11-24` sobre as 22 pastas `kukkiwon*` em `D:\programations` e `C:\temp` via `dir /s /-c` + `git worktree list --porcelain`. Total encontrado: **`6.600,72 MB` (~`6,60 GB`)**, dos quais **`6.114,04 MB` (`92,6%`)** são cópias repetidas de `node_modules`.

| Caminho | Tamanho | `node_modules` | Cache/Build | Estado Git / Origem | Classificação | Observação e ação segura |
| --- | --- | --- | --- | --- | --- | --- |
| `D:\programations\kukkiwon site` | 452,18 MB | 409,73 MB | 7,78 MB | `feat/atlas-a3-documentation-lab@66fe80d` (`dirty=0`, no `origin/main`) | **MANTER** | Repositório principal único. |
| `D:\programations\kukkiwon-atlas-cabeca-90-visual` | 420,64 MB | 405,06 MB | 3,67 MB | `antigravity/atlas-corporal-consolidado@ee65d4c` | **MANTER** | Única worktree ativa desta entrega; remover após merge da PR do #41. |
| `D:\programations\kukkiwon-evidence` | 56,59 MB | 0,00 MB | 0,00 MB | non-git | **MANTER / ARQUIVAR** | Evidências únicas do projeto. |
| `D:\programations\kukkiwon-atlas-braco-87-evidence` | 21,80 MB | 0,00 MB | 0,00 MB | non-git | **ARQUIVAR** | Evidências da entrega `#87/#88`. |
| `D:\programations\kukkiwon-atlas-pe-41-evidence` | 21,00 MB | 0,00 MB | 0,00 MB | non-git | **ARQUIVAR** | Evidências da entrega `#86`. |
| `C:\temp\kukkiwon-a12-audit-20261109` | 11,96 MB | 0,00 MB | 0,00 MB | non-git | **ARQUIVAR** | Auditoria anterior A12. |
| `D:\programations\kukkiwon-taegeuk-1-evidence` | 0,68 MB | 0,00 MB | 0,00 MB | non-git | **ARQUIVAR** | Evidências do Taegeuk 1 Jang. |
| `D:\programations\kukkiwon-taegeuk-1-consolidacao` | 465,28 MB | 410,61 MB | 9,68 MB | `codex/taegeuk-1-consolidacao-45@e4eb230` (`dirty=0`, PR `#85`) | **BLOQUEADA** | Worktree da PR `#85` (não alterar nem remover). |
| `D:\programations\kukkiwon-poomsae-conferencia` | 4,83 MB | 0,00 MB | 0,00 MB | `codex/poomsae-conferencia-documental@6a10385` (`dirty=0`, **`remote=[]`**) | **BLOQUEADA** | Sem branch remota própria; validar contra PR `#85` ou dar `git push` antes de arquivar. |
| `D:\programations\kukkiwon-poomsae-estudo` | 459,46 MB | 410,52 MB | 7,73 MB | `codex/poomsae-estudo-visual@a82abb8` (`dirty=0`, PR `#82`) | **ARQUIVAR** | Ligada à PR aberta `#82` (Codex). `node_modules` dispensável se inativa. |
| `D:\programations\kukkiwon-taegeuk-2-docs` | 410,05 MB | 404,23 MB | 1,53 MB | `codex/taegeuk-2-pesquisa-documental@1179d16` (`dirty=0`, PR `#83`) | **ARQUIVAR** | PR `#83` contém apenas documentação; `node_modules` dispensável se Codex não estiver ativo. |
| `D:\programations\kukkiwon-taegeuk-2-piloto` | 427,89 MB | 411,65 MB | 3,66 MB | `codex/taegeuk-2-piloto@b9d99cb` (`dirty=0`, PR `#84`) | **ARQUIVAR** | Ligada à PR aberta `#84` (Codex). |
| `C:\temp\kukkiwon-atlas-hand-geometry-v2` | 456,44 MB | 409,73 MB | 7,79 MB | `feat/atlas-hand-geometry-v2@5cdc3f1` (`dirty=0`, em `origin/main`) | **REMOVÍVEL** | Já integrada em `main`. |
| `D:\programations\kukkiwon-atlas-braco-87` | 417,32 MB | 404,95 MB | 3,64 MB | `codex/atlas-braco-87@39ac592` (`dirty=0`, PR `#88`) | **REMOVÍVEL** | Integrada em `main` via PR `#88`. |
| `D:\programations\kukkiwon-atlas-braco-87-visual` | 415,72 MB | 402,87 MB | 3,64 MB | `codex/revisao-visual-braco-87@d410c8b` (`dirty=0`, em `#88`) | **REMOVÍVEL** | Ancestral integrada em `origin/codex/atlas-braco-87`. |
| `D:\programations\kukkiwon-atlas-cabeca-90` | 420,20 MB | 404,89 MB | 3,65 MB | `codex/atlas-cabeca-90@980a37e` (`dirty=0`, PR `#91`) | **REMOVÍVEL** | Integrada em `main` via PR `#91`. |
| `D:\programations\kukkiwon-atlas-integracao-86-88` | 418,03 MB | 404,89 MB | 3,64 MB | `codex/atlas-integracao-86-88@952385c` (`dirty=0`, pushed) | **REMOVÍVEL** | Trabalho do Atlas já integrado em `main`. |
| `D:\programations\kukkiwon-atlas-pe-41` | 419,45 MB | 404,95 MB | 5,76 MB | `codex/atlas-pe-tornozelo-41@0795e7d` (`dirty=0`, PR `#86`) | **REMOVÍVEL** | Integrada em `main` via PR `#86`. |
| `D:\programations\kukkiwon-experience-20261113` | 418,53 MB | 410,06 MB | 1,97 MB | `codex/experience-library-20261113@f986c10` (`dirty=0`, PR `#77`) | **REMOVÍVEL** | Integrada em `main` via PR `#77`. |
| `D:\programations\kukkiwon-pr80-integration` | 461,87 MB | 411,24 MB | 9,68 MB | `codex/pr80-integration@8b57da3` (`dirty=0`, PR `#81`) | **REMOVÍVEL** | Integrada em `main` via PR `#81`. |
| `D:\programations\kukkiwon-pr82-consolidated` | 420,80 MB | 408,66 MB | 3,65 MB | `codex/pr82-consolidated@6c47c11` (`dirty=0`, ancestral de `#82`) | **REMOVÍVEL** | Todo o histórico está em `origin/codex/poomsae-estudo-visual` (`#82`). |
| `C:\temp\kukkiwon-validation` | 0,00 MB | 0,00 MB | 0,00 MB | non-git (vazia) | **REMOVÍVEL** | Pasta de validação temporária vazia. |

### Estimativa de espaço recuperável e comandos seguros (aguardando autorização)

- **Limpeza imediata segura (9 worktrees integradas + pasta vazia):** **`3.848,36 MB` (~`3,85 GB`)**.
- **Comandos seguros sem `--force` (executar em `D:\programations\kukkiwon site` apenas após autorização do mantenedor e verificando que nenhum terminal está dentro delas):**

```powershell
git worktree remove "C:\temp\kukkiwon-atlas-hand-geometry-v2"
git worktree remove "D:\programations\kukkiwon-atlas-braco-87"
git worktree remove "D:\programations\kukkiwon-atlas-braco-87-visual"
git worktree remove "D:\programations\kukkiwon-atlas-cabeca-90"
git worktree remove "D:\programations\kukkiwon-atlas-integracao-86-88"
git worktree remove "D:\programations\kukkiwon-atlas-pe-41"
git worktree remove "D:\programations\kukkiwon-experience-20261113"
git worktree remove "D:\programations\kukkiwon-pr80-integration"
git worktree remove "D:\programations\kukkiwon-pr82-consolidated"
Remove-Item "C:\temp\kukkiwon-validation"
```

- **Economia adicional futura:** remover `node_modules` das 3 worktrees arquivadas de Poomsae (`#82`, `#83`, `#84`, quando Codex não estiver rodando) libera mais **`1.226,40 MB` (~`1,23 GB`)** (`5,07 GB` acumulados); após encerrar este PR `#41` e concluir/integrar Poomsae (`#82–#85`), o ambiente converge para `kukkiwon site` (`452,18 MB`) + no máximo 1 worktree ativa + `112,03 MB` de arquivos de evidência (**~`5,55 GB` recuperáveis no total**).

---

## 5. Classificação das PRs abertas (Fase 8 — sem fechamento automático)

| PR | Branch / Base | Estado atual | Classificação | Ação recomendada |
| --- | --- | --- | --- | --- |
| `#85` | `codex/taegeuk-1-consolidacao-45` → `main` | Draft, MERGEABLE, CI+Sonar verde | **Trabalho ainda necessário (protegida)** | Não tocar nem fechar; worktree ativa `kukkiwon-taegeuk-1-consolidacao`. |
| `#82` | `codex/poomsae-estudo-visual` → `codex/pr80-integration` | Draft, MERGEABLE | **Trabalho ainda necessário / consolidação** | Avaliar alinhamento de base com PR `#85` (evitar divergência frente a `main`). |
| `#83` | `codex/taegeuk-2-pesquisa-documental` → `main` | Draft, MERGEABLE | **Pesquisa pendente** | Manter até incorporação documental do Taegeuk 2 Jang. |
| `#84` | `codex/taegeuk-2-piloto` → `codex/poomsae-estudo-visual` | Draft, MERGEABLE | **Trabalho ainda necessário (piloto)** | Manter vinculada ao piloto de Taegeuk 2 Jang. |
| `#69` | `fix/library-integrity-ci-69` → `rescue/gemini-teamwork-20261111` | Draft, MERGEABLE | **Substituída parcialmente + trabalho a preservar** | Código de catálogo/CI foi superado por `#77`/`#81`, mas `content/research/gemini-library-candidates.json` **não existe em `main`** — verificar preservação antes de fechar. |
| `#71` | `feat/argon-research-inventory-68` → `main` | Draft, MERGEABLE | **Pesquisa / trabalho a preservar** | `scripts/argon-inventory.mjs`, `docs/research/2026-11-11-argon-inventory.md` e `tests/argon-inventory.test.ts` **não existem em `main`** (distintos de `argon-reconciliation.mjs`); decidir aproveitamento antes de fechar. |
| `#67` | `rescue/gemini-teamwork-20261111` → `main` | Draft, CONFLICTING | **Substituída por PR integrada** | Funcionalidade consolidada em `#77` e `#81`; candidata a encerramento após checar `#69`. |
| `#70` | `fix/visitor-copy-e2e-64` → `fix/library-integrity-ci-69` | Draft, MERGEABLE | **Substituída por PR integrada** | Textos editoriais e E2E integrados via `#77`/`#81`; base encadeada obsoleta. |
| `#74` | `feat/library-unified-seven-areas-74` → `main` | Draft, CONFLICTING | **Substituída por PR integrada** | 7 áreas da Biblioteca integradas via `#81` (`library.ts`); checar apenas se `docs/library/2026-11-11-seven-area-integration.md` precisa ser arquivado. |
| `#75` | `feat/curriculum-sequences-by-school-75` → `main` | Draft, CONFLICTING | **Substituída por PR integrada** | Sequências Sebon/Dubon/Anjoa integradas via `c0949a1` (`#77`/`#81`); checar apenas `docs/curricula/school-specific-sequence-ranges.md`. |
| `#80` | `feat/encyclopedia-enrichment-antigravity` → `codex/experience-library-20261113` | Draft, MERGEABLE | **Substituída por PR integrada** | Integrada em `main` via PR `#81` (`ac9b32c`); candidata a fechamento manual seguro. |
| `#26` | `dependabot/github_actions/actions-c923ae5b31` → `main` | Aberta, `validate`+Sonar verdes | **Dependência automatizada** | Aprovar/integrar separadamente de código editorial. |
| `#89` | `dependabot/npm_and_yarn/npm-non-major-3477eeae77` → `main` | Aberta, `validate`+Sonar verdes | **Dependência automatizada** | Aprovar/integrar separadamente de código editorial. |
| `#28` | `dependabot/npm_and_yarn/typescript-7.0.2` → `main` | Aberta, **`validate` falhou** | **Dependência automatizada (bloqueada)** | Manter fechamento/atualização pendente até compatibilizar `typescript 7` com toolchain Astro. |
