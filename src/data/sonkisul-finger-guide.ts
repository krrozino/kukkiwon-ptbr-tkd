export type FingerAnatomyGuide = {
  zoneSlug: string;
  anatomySummary: string;
  jointsLabel: string;
  relatedConfigSlugs: readonly {
    slug: string;
    label: string;
    context: string;
  }[];
};

export const fingerAnatomyGuides: Record<string, FingerAnatomyGuide> = {
  'illustration-thumb': {
    zoneSlug: 'illustration-thumb',
    anatomySummary:
      'Composto por duas falanges (proximal e distal) articuladas ao primeiro metacarpo. Na prática técnica, deve permanecer firme e encaixado: travado sob os dedos médios ao fechar o punho, ou aduzido junto à borda radial nas técnicas de mão aberta.',
    jointsLabel: 'Articulações carpometacarpal, metacarpofalângica (MCF) e interfalângica (IF)',
    relatedConfigSlugs: [
      { slug: 'jumeok', label: 'Jumeok (punho fechado)', context: 'Polegar travado sobre indicador e médio, nunca escondido dentro do punho.' },
      { slug: 'ageumson', label: 'Ageumson (arco do polegar)', context: 'Abertura funcional entre polegar e indicador.' },
      { slug: 'pyeonsonkkeut', label: 'Pyeonsonkkeut (mão em lança)', context: 'Polegar flexionado junto à palma estabilizando os quatro dedos.' },
    ],
  },
  'illustration-finger-index': {
    zoneSlug: 'illustration-finger-index',
    anatomySummary:
      'Formado por três falanges (proximal, média e distal). Participa diretamente do alinhamento de impacto frontal do punho fechado (ao lado do médio) e das configurações de pontas de um, dois, três ou quatro dedos.',
    jointsLabel: 'Articulações metacarpofalângica (MCF), interfalângica proximal (IFP) e distal (IFD)',
    relatedConfigSlugs: [
      { slug: 'hansonkkeut', label: 'Hansonkkeut (ponta de um dedo)', context: 'Configuração focada na extremidade do indicador.' },
      { slug: 'moeundusonkkeut', label: 'Moeundusonkkeut (dois dedos unidos)', context: 'Indicador e médio unidos e alinhados.' },
      { slug: 'gawisonkkeut', label: 'Gawisonkkeut (dedos em tesoura)', context: 'Indicador e médio afastados em V (aplicações permanecem em revisão documental).' },
    ],
  },
  'illustration-finger-middle': {
    zoneSlug: 'illustration-finger-middle',
    anatomySummary:
      'Dedo central e mais longo da mão, com três falanges. Em configurações de estocada como Pyeonsonkkeut, pode ser levemente fletido na ponta para nivelar o alinhamento com indicador e anelar, protegendo as articulações.',
    jointsLabel: 'Articulações metacarpofalângica (MCF), interfalângica proximal (IFP) e distal (IFD)',
    relatedConfigSlugs: [
      { slug: 'pyeonsonkkeut', label: 'Pyeonsonkkeut (quatro dedos alinhados)', context: 'Eixo central da mão em lança em estocadas (Jjireugi).' },
      { slug: 'moeundusonkkeut', label: 'Moeundusonkkeut (dois dedos unidos)', context: 'Atua unido ao indicador.' },
      { slug: 'moeunsesonkkeut', label: 'Moeunsesonkkeut (três dedos unidos)', context: 'Unido ao indicador e ao anelar.' },
    ],
  },
  'illustration-finger-ring': {
    zoneSlug: 'illustration-finger-ring',
    anatomySummary:
      'Composto por três falanges entre o dedo médio e o mínimo. Contribui para a coesão estrutural da mão aberta e integra as configurações de três, quatro e cinco pontas de dedos.',
    jointsLabel: 'Articulações metacarpofalângica (MCF), interfalângica proximal (IFP) e distal (IFD)',
    relatedConfigSlugs: [
      { slug: 'moeunsesonkkeut', label: 'Moeunsesonkkeut (três dedos unidos)', context: 'Indicador, médio e anelar unidos.' },
      { slug: 'pyeonsonkkeut', label: 'Pyeonsonkkeut (mão plana em lança)', context: 'Quatro dedos firmemente coesos.' },
      { slug: 'modumsonkkeut', label: 'Modumsonkkeut (cinco pontas reunidas)', context: 'Convergência das cinco pontas digitais.' },
    ],
  },
  'illustration-finger-little': {
    zoneSlug: 'illustration-finger-little',
    anatomySummary:
      'Quinto dígito na extremidade ulnar da mão, formado por três falanges. Sua coesão junto ao anelar estabiliza toda a musculatura hipotenar nas técnicas de borda externa da mão e de base lateral do punho.',
    jointsLabel: 'Articulações metacarpofalângica (MCF), interfalângica proximal (IFP) e distal (IFD)',
    relatedConfigSlugs: [
      { slug: 'mejumeok', label: 'Mejumeok (base lateral do punho)', context: 'Região hipotenar com os dedos firmemente enrolados.' },
      { slug: 'pyeonsonkkeut', label: 'Pyeonsonkkeut (quatro dedos alinhados)', context: 'Mínimo unido ao anelar sem abrir lateralmente.' },
      { slug: 'modumsonkkeut', label: 'Modumsonkkeut (cinco pontas reunidas)', context: 'Fechamento externo da pinça de cinco dedos.' },
    ],
  },
};

export const multiFingerCareNotes: Record<string, string> = {
  hansonkkeut:
    'Atenção articular: utiliza as falanges do indicador sustentadas pelos demais dedos recolhidos. Estude a configuração espacial sem golpear alvos rígidos.',
  moeundusonkkeut:
    'Atenção articular: une falanges do indicador e do médio com anelar, mínimo e polegar travados. Pratique alinhamento técnico preservando as articulações interfalângicas.',
  gawisonkkeut:
    'Escopo documental: a configuração em tesoura (indicador e médio afastados) consta no vocabulário técnico de 2012, mas variações específicas de aplicação ou golpe permanecem pendentes de confirmação documental antes de detalhamento técnico.',
  moeunsesonkkeut:
    'Atenção articular: reúne indicador, médio e anelar coesos. Evite hiperextensão das falanges distais durante o estudo técnico.',
  pyeonsonkkeut:
    'Conexão técnica: configuração clássica das estocadas Jjireugi (como Sewo-jjireugi em Taegeuk 4 e Koryo). Mantenha os quatro dedos unidos e o polegar flexionado firme na lateral palmar.',
  modumsonkkeut:
    'Atenção articular: converge as extremidades dos cinco dedos em pinça fechada. Pratique precisão e forma sem impacto pesado nas falanges.',
};
