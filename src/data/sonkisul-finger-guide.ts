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

type FingerConfig = readonly [slug: string, label: string, context: string];

function fingerGuide(
  zoneSlug: string,
  jointsLabel: string,
  anatomySummary: string,
  configurations: readonly FingerConfig[],
): FingerAnatomyGuide {
  return {
    zoneSlug, jointsLabel, anatomySummary,
    relatedConfigSlugs: configurations.map(([slug, label, context]) => ({ slug, label, context })),
  };
}

const threePhalanxJoints = 'Articulações metacarpofalângica (MCF), interfalângica proximal (IFP) e distal (IFD)';

const guides = [
  fingerGuide('illustration-thumb',
    'Articulações carpometacarpal, metacarpofalângica (MCF) e interfalângica (IF)',
    'Composto por duas falanges (proximal e distal) articuladas ao primeiro metacarpo. Na prática técnica, deve permanecer firme e encaixado: travado sob os dedos médios ao fechar o punho, ou aduzido junto à borda radial nas técnicas de mão aberta.',
    [
      ['jumeok', 'Jumeok (punho fechado)', 'Polegar travado sobre indicador e médio, nunca escondido dentro do punho.'],
      ['ageumson', 'Ageumson (arco do polegar)', 'Abertura funcional entre polegar e indicador.'],
      ['pyeonsonkkeut', 'Pyeonsonkkeut (mão em lança)', 'Polegar flexionado junto à palma estabilizando os quatro dedos.'],
    ],
  ),
  fingerGuide('illustration-finger-index',
    threePhalanxJoints,
    'Formado por três falanges (proximal, média e distal). Participa diretamente do alinhamento de impacto frontal do punho fechado (ao lado do médio) e das configurações de pontas de um, dois, três ou quatro dedos.',
    [
      ['hansonkkeut', 'Hansonkkeut (ponta de um dedo)', 'Configuração focada na extremidade do indicador.'],
      ['moeundusonkkeut', 'Moeundusonkkeut (dois dedos unidos)', 'Indicador e médio unidos e alinhados.'],
      ['gawisonkkeut', 'Gawisonkkeut (dedos em tesoura)', 'Indicador e médio afastados em V (aplicações permanecem em revisão documental).'],
    ],
  ),
  fingerGuide('illustration-finger-middle',
    threePhalanxJoints,
    'Dedo central e mais longo da mão, com três falanges. Em configurações de estocada como Pyeonsonkkeut, pode ser levemente fletido na ponta para nivelar o alinhamento com indicador e anelar, protegendo as articulações.',
    [
      ['pyeonsonkkeut', 'Pyeonsonkkeut (quatro dedos alinhados)', 'Eixo central da mão em lança em estocadas (Jjireugi).'],
      ['moeundusonkkeut', 'Moeundusonkkeut (dois dedos unidos)', 'Atua unido ao indicador.'],
      ['moeunsesonkkeut', 'Moeunsesonkkeut (três dedos unidos)', 'Unido ao indicador e ao anelar.'],
    ],
  ),
  fingerGuide('illustration-finger-ring',
    threePhalanxJoints,
    'Composto por três falanges entre o dedo médio e o mínimo. Contribui para a coesão estrutural da mão aberta e integra as configurações de três, quatro e cinco pontas de dedos.',
    [
      ['moeunsesonkkeut', 'Moeunsesonkkeut (três dedos unidos)', 'Indicador, médio e anelar unidos.'],
      ['pyeonsonkkeut', 'Pyeonsonkkeut (mão plana em lança)', 'Quatro dedos firmemente coesos.'],
      ['modumsonkkeut', 'Modumsonkkeut (cinco pontas reunidas)', 'Convergência das cinco pontas digitais.'],
    ],
  ),
  fingerGuide('illustration-finger-little',
    threePhalanxJoints,
    'Quinto dígito na extremidade ulnar da mão, formado por três falanges. Sua coesão junto ao anelar estabiliza toda a musculatura hipotenar nas técnicas de borda externa da mão e de base lateral do punho.',
    [
      ['mejumeok', 'Mejumeok (base lateral do punho)', 'Região hipotenar com os dedos firmemente enrolados.'],
      ['pyeonsonkkeut', 'Pyeonsonkkeut (quatro dedos alinhados)', 'Mínimo unido ao anelar sem abrir lateralmente.'],
      ['modumsonkkeut', 'Modumsonkkeut (cinco pontas reunidas)', 'Fechamento externo da pinça de cinco dedos.'],
    ],
  ),
];

export const fingerAnatomyGuides: Record<string, FingerAnatomyGuide> = Object.fromEntries(
  guides.map((guide) => [guide.zoneSlug, guide]),
);

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
