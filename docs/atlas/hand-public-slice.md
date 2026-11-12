# Atlas da mão público — corte vertical da Issue #72

A página /atlas?region=hands&zoom=1 possui uma coleção pública estática de referência para a mão, independente de credenciais ou dados de produção no Supabase. A projeção em src/data/public-hand-v1.json reúne 23 termos, 19 regiões, nove correspondências geométricas, dez regiões ilustrativas e 14 relações nominais com movimentos citados em fontes. Relações nominais não equivalem a instruções completas de execução.

O arquivo é gerado explicitamente de content/research/atlas-hand-v1/matrix.json por node scripts/build-public-hand.mjs. Trata-se de uma seleção de apresentação do projeto, não de alteração dos estados editoriais da matriz. A matriz original, com seus 203 registros de evidência por campo, estados internos e lacunas, permanece preservada e fora do bundle público.

- Não inventar Hangul, romanização ou técnica completa para zona ilustrativa.
- Manter as configurações sem hotspot no índice buscável; sua seleção não cria recorte geométrico.
- Não atribuir homologação institucional ao material; preservar links seguros para fontes.
- Não mostrar etiquetas administrativas sobre revisão/análise documental aos visitantes.
- Não inserir registros remotos no Supabase para renderizar estas fichas.
- Não importar a matriz bruta em módulos públicos. O guard de bundle continua bloqueando a exposição.
- O modo legado com registros publicados pelo catálogo continua disponível, sem alterar os fluxos de escolas.

Execute npm run atlas:hand:check para conferir a matriz e a projeção pública; npm test valida contagens, fontes, nomes e busca; os testes Playwright verificam a navegação real. Mudanças na matriz exigem regeneração explícita e revisão do diff de src/data/public-hand-v1.json.

As descrições e a pronúncia didática PT-BR não são transcrições oficiais.
