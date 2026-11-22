/**
 * Legendas anatômicas em português para os recortes ilustrativos.
 * Descrevem localização observável, não atribuem tradução nem aprovação
 * Kukkiwon a termos coreanos ou fichas editoriais em rascunho.
 */
export type ZoneCopy = { title: string; description: string };
export const zoneCopy: Record<string, ZoneCopy> = {
  "head-face": { title: "Face", description: "Parte anterior da cabeça, onde ficam olhos, nariz e boca." },
  "head-forehead": { title: "Testa", description: "Região acima dos olhos e abaixo da linha do cabelo." },
  "head-temples": { title: "Têmporas", description: "Regiões laterais da cabeça, próximas aos olhos." },
  "head-chin": { title: "Queixo", description: "Extremidade inferior e anterior da mandíbula." },
  "head-occiput": { title: "Nuca e região posterior da cabeça", description: "Parte de trás da cabeça, acima do pescoço." },
  "head-neck": { title: "Pescoço", description: "Região que une a cabeça ao tronco." },

  "torso-shoulders": { title: "Ombros", description: "Transição entre tronco e braços, próxima à articulação do ombro." },
  "torso-chest": { title: "Peito", description: "Região anterior superior do tronco." },
  "torso-abdomen": { title: "Abdômen", description: "Região anterior do tronco, abaixo do tórax." },
  "torso-flanks": { title: "Laterais do tronco", description: "Regiões dos lados do tronco, entre costelas e quadril." },
  "torso-back": { title: "Costas", description: "Região posterior do tronco, entre ombros e cintura." },
  "torso-lumbar": { title: "Lombar", description: "Parte inferior das costas, acima da região do quadril." },

  "arms-upper": { title: "Braço", description: "Segmento proximal do membro superior, entre ombro e cotovelo." },
  "arms-elbow": { title: "Cotovelo", description: "Articulação entre o braço e o antebraço, presente em golpes de curta distância." },
  "arms-forearm": { title: "Antebraço", description: "Segmento central entre cotovelo e punho, formado por rádio e ulna." },
  "arms-wrist": { title: "Punho (articulação)", description: "Junção radiocarpal entre antebraço e mão; alinhada para estabilidade." },
  "arms-inner-forearm": { title: "Face interna do antebraço", description: "Borda medial do antebraço voltada ao tronco na posição neutra." },
  "arms-outer-forearm": { title: "Face externa do antebraço", description: "Borda lateral do antebraço voltada para fora na posição neutra." },

  "legs-thigh": { title: "Coxa", description: "Segmento femoral entre quadril e joelho, motor de elevação nos chutes." },
  "legs-knee": { title: "Joelho", description: "Articulação entre coxa e perna, essencial na câmara e extensão dos chutes." },
  "legs-shin": { title: "Canela", description: "Face anterior tibial da perna, situada entre o joelho e o tornozelo." },
  "legs-calf": { title: "Panturrilha", description: "Região muscular posterior da perna, responsável pela impulsão plantar." },

  sonbadak: { title: "Palma da mão", description: "Superfície interna da mão, na região central da palma." },
  batangson: { title: "Base da palma", description: "Região inferior da palma, próxima à articulação do punho." },
  sonnal: { title: "Borda do lado do dedo mínimo", description: "Lado externo da mão, acompanhando a região do dedo mínimo." },
  sonnaldeung: { title: "Borda do lado do polegar", description: "Lateral da mão situada próxima ao polegar." },
  ageumson: { title: "Espaço entre polegar e indicador", description: "Região de abertura entre o polegar e o indicador." },
  sondeung: { title: "Dorso da mão", description: "Superfície externa da mão, oposta à palma." },
  "illustration-hand-base": { title: "Base do dorso da mão", description: "Porção inferior do dorso, perto da articulação do punho." },
  "illustration-hand-web": { title: "Abertura do polegar", description: "Área entre o polegar e o indicador vista pelo dorso." },
  "illustration-hand-side": { title: "Lateral da mão", description: "Faixa lateral desenhada na silhueta da mão." },
  "illustration-thumb": { title: "Polegar", description: "Primeiro dígito com duas falanges, separado dos demais por abertura ampla." },
  "illustration-finger-index": { title: "Indicador", description: "Segundo dígito com três falanges, situado ao lado do polegar." },
  "illustration-finger-middle": { title: "Dedo médio", description: "Terceiro dígito e eixo central da mão, formado por três falanges." },
  "illustration-finger-ring": { title: "Anelar", description: "Quarto dígito com três falanges, situado entre o médio e o mínimo." },
  "illustration-finger-little": { title: "Mínimo", description: "Quinto dígito na borda ulnar da mão, composto por três falanges." },
  jumeok: { title: "Frente do punho fechado", description: "Região dos dedos dobrados quando a mão está fechada." },
  deungjumeok: { title: "Dorso do punho fechado", description: "Parte posterior da mão fechada." },
  mejumeok: { title: "Lateral do punho fechado", description: "Região lateral da mão quando os dedos estão fechados." },
  "illustration-fist-palm": { title: "Face palmar do punho", description: "Região voltada para a palma na mão fechada." },
  "illustration-fist-base": { title: "Base do punho", description: "Porção do punho fechado próxima à articulação da mão." },

  balbadak: { title: "Planta do pé", description: "Superfície inferior do pé, que normalmente apoia no solo." },
  apchuk: { title: "Parte dianteira da planta", description: "Região inferior próxima à base dos dedos." },
  baldeung: { title: "Dorso do pé", description: "Superfície superior do pé, oposta à planta." },
  balkkeut: { title: "Pontas dos dedos do pé", description: "Extremidades anteriores dos dedos." },
  balnal: { title: "Borda externa do pé", description: "Lado lateral do pé, próximo ao dedo mínimo." },
  balnaldeung: { title: "Borda interna do pé", description: "Lado do pé próximo ao hálux (dedão)." },
  "illustration-foot-arch": { title: "Arco da planta do pé", description: "Região curva na parte inferior e medial do pé." },
  dwichuk: { title: "Calcanhar (planta)", description: "Extremidade posterior do pé, vista por baixo." },
  dwikkumchi: { title: "Calcanhar (dorso)", description: "Parte posterior do pé, vista por cima." },
};
