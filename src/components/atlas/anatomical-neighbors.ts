type Neighbor = Readonly<{ slug: string; label: string }>;

export const anatomicalNeighbors: Readonly<Partial<Record<string, readonly Neighbor[]>>> = {
  'head-face': [
    { slug: 'head-occiput', label: 'Região posterior do crânio' },
    { slug: 'head-neck', label: 'Transição para o pescoço' },
  ],
  'head-occiput': [
    { slug: 'head-face', label: 'Rosto na vista anterior' },
    { slug: 'head-neck', label: 'Transição para o pescoço' },
  ],
  'head-neck': [{ slug: 'torso-shoulders', label: 'Transição para os ombros' }],
  'torso-shoulders': [
    { slug: 'head-neck', label: 'Transição para o pescoço' },
    { slug: 'arms-upper', label: 'Braço acima do cotovelo' },
  ],
  'torso-chest': [
    { slug: 'torso-flanks', label: 'Laterais do tronco' },
    { slug: 'torso-back', label: 'Costas na vista posterior' },
  ],
  'torso-back': [
    { slug: 'torso-chest', label: 'Peito na vista anterior' },
    { slug: 'torso-lumbar', label: 'Lombar na vista posterior' },
  ],
  'torso-abdomen': [
    { slug: 'torso-flanks', label: 'Laterais do tronco' },
    { slug: 'legs-hip', label: 'Transição para o quadril' },
  ],
  'torso-flanks': [
    { slug: 'torso-abdomen', label: 'Abdômen na vista anterior' },
    { slug: 'torso-lumbar', label: 'Lombar na vista posterior' },
  ],
  'torso-lumbar': [
    { slug: 'torso-flanks', label: 'Laterais do tronco' },
    { slug: 'legs-hip', label: 'Transição para o quadril' },
  ],
  'arms-upper': [
    { slug: 'torso-shoulders', label: 'Transição para os ombros' },
    { slug: 'palgup', label: 'Cotovelo' },
  ],
  palgup: [
    { slug: 'arms-upper', label: 'Braço acima do cotovelo' },
    { slug: 'arms-forearm', label: 'Antebraço' },
  ],
  'arms-forearm': [
    { slug: 'anpalmok', label: 'Borda interna junto ao punho' },
    { slug: 'bakkatpalmok', label: 'Borda externa junto ao punho' },
    { slug: 'arms-wrist', label: 'Articulação do punho' },
  ],
  anpalmok: [{ slug: 'bakkatpalmok', label: 'Comparar borda externa' }],
  bakkatpalmok: [{ slug: 'anpalmok', label: 'Comparar borda interna' }],
  'arms-wrist': [{ slug: 'hands', label: 'Mapa da mão' }],
  'legs-hip': [
    { slug: 'torso-lumbar', label: 'Transição para a lombar' },
    { slug: 'legs-thigh', label: 'Coxa' },
  ],
  'legs-thigh': [
    { slug: 'legs-hip', label: 'Quadril' },
    { slug: 'mureup', label: 'Joelho na vista anterior' },
  ],
  mureup: [
    { slug: 'legs-knee-back', label: 'Dobra posterior do joelho' },
    { slug: 'jeonggangi', label: 'Região anterior da perna' },
  ],
  'legs-knee-back': [
    { slug: 'mureup', label: 'Joelho na vista anterior' },
    { slug: 'legs-calf', label: 'Panturrilha' },
  ],
  jeonggangi: [{ slug: 'legs-calf', label: 'Panturrilha na vista posterior' }],
  'legs-calf': [
    { slug: 'jeonggangi', label: 'Região anterior da perna' },
    { slug: 'legs-ankle', label: 'Transição para o tornozelo' },
  ],
  'legs-ankle': [{ slug: 'feet', label: 'Planta e dorso do pé' }],
  apchuk: [{ slug: 'baldeung', label: 'Dorso do pé' }],
  baldeung: [{ slug: 'apchuk', label: 'Parte anterior da planta' }],
  dwichuk: [{ slug: 'legs-ankle', label: 'Transição para o tornozelo' }],
  dwikkumchi: [{ slug: 'legs-ankle', label: 'Transição para o tornozelo' }],
};
