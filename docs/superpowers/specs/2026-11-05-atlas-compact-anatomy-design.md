# Atlas: painel compacto e orientação das vistas

## Escopo

Implementar o refinamento solicitado após a V2.3 em uma PR, sem deploy,
migrações, alterações no banco ou conteúdo editorial.

## Decisões de implementação

- Manter o painel de altura fixa, a seleção no início do toque e a legenda.
- Zona não publicada: somente **Zona ilustrativa** e **Nome técnico em revisão**.
  O número continua disponível na legenda e nos nomes acessíveis.
- Região publicada: português, romanização, hangul, pronúncia, descrição curta
  e link real à ficha. Somente registros já liberados pela API pública.
- Usar a mesma extremidade como referência nas duas vistas: polegar e hálux
  mudam de lado entre palma/planta e dorso. Espelhar em conjunto contorno,
  linhas anatômicas e recortes; transformar também a âncora do conector.
  No painel lateral, manter o traço no espaço reservado ao lado da figura,
  sem atravessar as áreas coloridas; abaixo, usar a posição horizontal espelhada.
- Refinar as fronteiras das áreas em coordenadas compartilhadas. Recortar os
  preenchimentos pela silhueta, com contorno externo desenhado acima deles.
  Separar dedos e polegar na mão; completar base, arco, laterais e calcanhar.
- Novas divisões são geometria ilustrativa local. Não criar terminologia,
  traduções ou registros editoriais para preencher áreas sem publicação.

## Abordagem

Refinar os SVGs existentes mantém a interação e a identidade visual. Imagens
rasterizadas perderiam a seleção precisa e paths inteiramente duplicados por
vista aumentariam o risco de desalinhamento; por isso a implementação usará
uma geometria comum com espelhamento do grupo anatômico.

## Aceite e validação

Testar texto compacto e ausência de consulta técnica em zonas ilustrativas;
dados e link da região publicada; posição do polegar/hálux em coordenadas
visíveis; cobertura dos recortes e limites da silhueta; seleção e painel sem
salto no primeiro toque e após alternar vistas. Conferir screenshots em
desktop e celular e executar a suíte de interface, tipos e testes locais.
