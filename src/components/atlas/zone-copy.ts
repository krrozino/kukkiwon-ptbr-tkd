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

  "arms-upper": { title: "Braço", description: "Segmento entre o ombro e o cotovelo." },
  "arms-elbow": { title: "Cotovelo", description: "Articulação entre o braço e o antebraço." },
  "arms-forearm": { title: "Antebraço", description: "Segmento entre cotovelo e punho." },
  "arms-wrist": { title: "Punho (articulação)", description: "Junção do antebraço com a mão; aqui, punho significa a articulação." },
  "arms-inner-forearm": { title: "Face interna do antebraço", description: "Região ilustrativa da face interna, próxima ao punho." },
  "arms-outer-forearm": { title: "Face externa do antebraço", description: "Região ilustrativa da face externa, próxima ao punho." },

  "legs-thigh": { title: "Coxa", description: "Segmento da perna entre quadril e joelho." },
  "legs-knee": { title: "Joelho", description: "Articulação entre coxa e perna." },
  "legs-shin": { title: "Canela", description: "Região anterior da perna, abaixo do joelho." },
  "legs-calf": { title: "Panturrilha", description: "Região posterior da perna, abaixo do joelho." },

  sonbadak: { title: "Palma da mão", description: "Superfície interna da mão, na região central da palma." },
  batangson: { title: "Base da palma", description: "Região inferior da palma, próxima à articulação do punho." },
  sonnal: { title: "Borda do lado do dedo mínimo", description: "Lado externo da mão, acompanhando a região do dedo mínimo." },
  sonnaldeung: { title: "Borda do lado do polegar", description: "Lateral da mão situada próxima ao polegar." },
  ageumson: { title: "Espaço entre polegar e indicador", description: "Região de abertura entre o polegar e o indicador." },
  sondeung: { title: "Dorso da mão", description: "Superfície externa da mão, oposta à palma." },
  "illustration-hand-base": { title: "Base do dorso da mão", description: "Porção inferior do dorso, perto da articulação do punho." },
  "illustration-hand-web": { title: "Abertura do polegar", description: "Área entre o polegar e o indicador vista pelo dorso." },
  "illustration-hand-side": { title: "Lateral da mão", description: "Faixa lateral desenhada na silhueta da mão." },
  "illustration-thumb": { title: "Polegar", description: "Dedo lateral da mão, separado dos outros quatro por uma abertura maior." },
  "illustration-finger-index": { title: "Indicador", description: "Dedo ao lado do polegar." },
  "illustration-finger-middle": { title: "Dedo médio", description: "Dedo central da mão." },
  "illustration-finger-ring": { title: "Anelar", description: "Dedo entre o médio e o mínimo." },
  "illustration-finger-little": { title: "Mínimo", description: "Menor dedo da mão, na extremidade oposta ao polegar." },
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
