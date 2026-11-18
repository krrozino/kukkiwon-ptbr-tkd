import type { LibraryReference } from '../lib/library';
import { sparringSource } from './kyorugi-guide';

export type BalkisulEntry = {
  slug: string;
  romanization: string;
  hangul: string;
  pronunciationPt: string;
  subtitlePt: string;
  kindLabel: 'Superfícies do pé' | 'Família de chutes (Chagi)';
  atlasZone?:
    | 'apchuk'
    | 'balbadak'
    | 'baldeung'
    | 'balkkeut'
    | 'balnal'
    | 'balnaldeung'
    | 'dwichuk'
    | 'dwikkumchi';
  acervoSlug: string;
  summary: string;
  studyPoints: readonly string[];
  variants: readonly string[];
  references: readonly {
    field: 'hangul' | 'romanization' | 'context' | 'terminology';
    reference: LibraryReference;
  }[];
  relatedLibrarySlugs: readonly string[];
};

const kukkiwon2012Ref = (locator: string): LibraryReference => ({
  institution: 'Kukkiwon',
  title: 'Taekwondo Technical Terminology',
  edition: '2011/2012',
  url: 'https://research.kukkiwon.or.kr/homepage/boardMedia/11621',
  locator,
});

const chagiBoardRef: LibraryReference = {
  institution: 'Kukkiwon',
  title: 'Composition of Taekwondo — Sparring (Chagi)',
  edition: 'Portal institucional em inglês (Board 56)',
  url: sparringSource(1368),
  locator: 'Board 56 / article 1368 (Chagi)',
};

export const balkisulEntries: readonly BalkisulEntry[] = [
  // SUPERFÍCIES DO PÉ (8 ZONAS GEOMÉTRICAS REAIS DO ATLAS)
  {
    slug: 'apchuk',
    romanization: 'Apchuk',
    hangul: '앞축',
    pronunciationPt: 'áp-tchuk',
    subtitlePt: 'Parte anterior da planta do pé (bola do pé)',
    kindLabel: 'Superfícies do pé',
    atlasZone: 'apchuk',
    acervoSlug: 'apchuk',
    summary:
      'Superfície plantar anterior situada sob as cabeças dos metatarsos, imediatamente atrás dos dedos do pé. Na prática marcial e de Poomsae, concentra o impacto penetrante de chutes como Ap-chagi e variações marciais de Dollyeo-chagi, além de servir como eixo de giro (pivô) do pé de base.',
    studyPoints: [
      'Flexionar os dedos do pé firmemente para cima (extensão metatarsofalângica) no instante do impacto para expor Apchuk com segurança.',
      'Usar Apchuk no pé de apoio ao girar o quadril em chutes circulares e giratórios, evitando prender o calcanhar no tatame.',
      'Visualizar o recorte exato na vista Planta do Atlas do pé.',
    ],
    variants: ['Ap-chuk', 'Ap Chuk', 'Bola do pé', 'Antepé plantar', 'Ball of the foot'],
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('Appendix > Applicable Parts of the Body > Apchuk') },
      { field: 'romanization', reference: kukkiwon2012Ref('Appendix > Applicable Parts of the Body > Apchuk') },
    ],
    relatedLibrarySlugs: ['ap-chagi', 'dollyeo-chagi', 'biteureo-chagi'],
  },
  {
    slug: 'balbadak',
    romanization: 'Balbadak',
    hangul: '발바닥',
    pronunciationPt: 'bál-ba-dák',
    subtitlePt: 'Planta completa do pé (face inferior)',
    kindLabel: 'Superfícies do pé',
    atlasZone: 'balbadak',
    acervoSlug: 'balbadak',
    summary:
      'Superfície inferior integral do pé responsável pelo enraizamento das bases (Seogi) e pelo contato amplo em chutes de empurrão (Mireo-chagi), varreduras/defesas com o pé (Cha-makgi) e variações de chutes em arco para dentro (An-chagi).',
    studyPoints: [
      'Sentir a distribuição equilibrada da planta inteira no solo ao estabilizar Apgubi, Dwitgubi e Juchum-seogi.',
      'Em Mireo-chagi, projetar o quadril empurrando com toda a superfície plantar para controle de distância.',
      'Comparar no Atlas do pé a área central de Balbadak com Apchuk (frente) e Dwichuk (calcanhar).',
    ],
    variants: ['Bal-badak', 'Planta do pé', 'Sola do pé', 'Sole of the foot'],
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('Appendix > Applicable Parts of the Body > Balbadak') },
      { field: 'romanization', reference: kukkiwon2012Ref('Appendix > Applicable Parts of the Body > Balbadak') },
    ],
    relatedLibrarySlugs: ['mireo-chagi', 'an-chagi', 'apgubi'],
  },
  {
    slug: 'baldeung',
    romanization: 'Baldeung',
    hangul: '발등',
    pronunciationPt: 'bál-dưng',
    subtitlePt: 'Dorso do pé (peito do pé)',
    kindLabel: 'Superfícies do pé',
    atlasZone: 'baldeung',
    acervoSlug: 'baldeung',
    summary:
      'Superfície superior do pé localizada entre o tornozelo e a base dos dedos. Pela maior área de alcance com flexão plantar do tornozelo, é a superfície predominante em Bandal-chagi e Dollyeo-chagi no Kyorugi esportivo com protetores.',
    studyPoints: [
      'Estender o tornozelo alinhando tíbia e dorso do pé para evitar impactar com os dedos soltos.',
      'Evitar usar Baldeung contra superfícies rígidas de quebramento pesado, nas quais Apchuk, Balnal ou Dwichuk oferecem estrutura óssea mais densa.',
      'Alternar para a vista Dorso no Atlas do pé para localizar Baldeung.',
    ],
    variants: ['Bal-deung', 'Baldung', 'Peito do pé', 'Dorso do pé', 'Instep'],
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('Appendix > Applicable Parts of the Body > Baldeung') },
      { field: 'romanization', reference: kukkiwon2012Ref('Appendix > Applicable Parts of the Body > Baldeung') },
    ],
    relatedLibrarySlugs: ['dollyeo-chagi', 'bandal-chagi', 'narae-ttwieo-gawi-chagi'],
  },
  {
    slug: 'balkkeut',
    romanization: 'Balkkeut',
    hangul: '발끝',
    pronunciationPt: 'bál-kưt',
    subtitlePt: 'Extremidade anterior dos dedos do pé',
    kindLabel: 'Superfícies do pé',
    atlasZone: 'balkkeut',
    acervoSlug: 'balkkeut',
    summary:
      'Região distal formada pelas pontas dos dedos do pé alinhados, registrada no apêndice anatômico da terminologia técnica da Kukkiwon. Exige extremo cuidado articular e aparece sobretudo como referência anatômica e de alinhamento em estudos tradicionais.',
    studyPoints: [
      'Preservar a integridade das falanges dos dedos do pé: em treinos de saco, raquete ou escudo, recolher os dedos quando a técnica exigir Apchuk.',
      'Usar a direção de Balkkeut como referência visual para verificar o ângulo dos pés nas bases (Seogi).',
    ],
    variants: ['Bal-kkeut', 'Balkut', 'Pontas dos dedos do pé', 'Tips of the toes'],
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('Appendix > Applicable Parts of the Body > Balkkeut') },
      { field: 'romanization', reference: kukkiwon2012Ref('Appendix > Applicable Parts of the Body > Balkkeut') },
    ],
    relatedLibrarySlugs: ['apchuk', 'baldeung', 'ap-seogi'],
  },
  {
    slug: 'balnal',
    romanization: 'Balnal',
    hangul: '발날',
    pronunciationPt: 'bál-nál',
    subtitlePt: 'Borda externa do pé (faca do pé)',
    kindLabel: 'Superfícies do pé',
    atlasZone: 'balnal',
    acervoSlug: 'balnal',
    summary:
      'Borda lateral externa do pé acompanhando o quinto metatarso, do dedo mínimo ao calcanhar. Corresponde nos membros inferiores ao papel de Sonnal na mão, sendo a superfície clássica de Yeop-chagi (chute lateral) em Poomsae e demonstrações técnicas.',
    studyPoints: [
      'Inverter sutilmente o tornozelo puxando a borda superior do pé em direção à canela para apresentar a faca externa (Balnal) e não a planta inteira.',
      'Manter calcanhar e quadril alinhados na linha de empuxo de Yeop-chagi.',
      'Inspecionar Balnal tanto na vista Planta quanto na vista Dorso do Atlas.',
    ],
    variants: ['Bal-nal', 'Faca do pé', 'Borda lateral do pé', 'Foot sword / Footsword'],
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('Appendix > Applicable Parts of the Body > Balnal') },
      { field: 'romanization', reference: kukkiwon2012Ref('Appendix > Applicable Parts of the Body > Balnal') },
    ],
    relatedLibrarySlugs: ['yeop-chagi', 'bakkat-chagi', 'sonnal'],
  },
  {
    slug: 'balnaldeung',
    romanization: 'Balnaldeung',
    hangul: '발날등',
    pronunciationPt: 'bál-nál-dưng',
    subtitlePt: 'Borda interna (medial) do pé junto ao hálux',
    kindLabel: 'Superfícies do pé',
    atlasZone: 'balnaldeung',
    acervoSlug: 'balnaldeung',
    summary:
      'Borda medial do pé situada no lado do hálux (dedão), oposta a Balnal. É empregada em trajetórias circulares de fora para dentro (como variações de An-chagi) e em varreduras/enganches curtos.',
    studyPoints: [
      'Distinguir com clareza Balnal (borda externa, lado do dedo mínimo) de Balnaldeung (borda interna, lado do hálux), em paralelo exato ao par Sonnal / Sonnaldeung na mão.',
      'Controlar a tensão do tornozelo ao descrever arcos internos.',
    ],
    variants: ['Bal-nal-deung', 'Borda medial do pé', 'Borda interna do pé', 'Inner edge of the foot'],
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('Appendix > Applicable Parts of the Body > Balnaldeung') },
      { field: 'romanization', reference: kukkiwon2012Ref('Appendix > Applicable Parts of the Body > Balnaldeung') },
    ],
    relatedLibrarySlugs: ['an-chagi', 'balnal', 'sonnaldeung'],
  },
  {
    slug: 'dwichuk',
    romanization: 'Dwichuk',
    hangul: '뒤축',
    pronunciationPt: 'dui-tchuk',
    subtitlePt: 'Base plantar do calcanhar',
    kindLabel: 'Superfícies do pé',
    atlasZone: 'dwichuk',
    acervoSlug: 'dwichuk',
    summary:
      'Porção inferior e robusta do calcâneo na face plantar posterior do pé. Por alinhar diretamente a estrutura óssea da tíbia e do fêmur, transmite grande potência linear em Dwi-chagi (chute para trás), Yeop-chagi potente e Naeryeo-chagi.',
    studyPoints: [
      'Flexionar o tornozelo (dorsiflexão) apontando os dedos conforme a trajetória do chute para projetar o calcâneo à frente.',
      'Diferenciar Dwichuk (base inferior do calcanhar vista na Planta) de Dwikkumchi (face posterior do calcanhar vista no Dorso).',
    ],
    variants: ['Dwi-chuk', 'Twichuk', 'Base do calcanhar', 'Bottom of the heel'],
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('Appendix > Applicable Parts of the Body > Dwichuk') },
      { field: 'romanization', reference: kukkiwon2012Ref('Appendix > Applicable Parts of the Body > Dwichuk') },
    ],
    relatedLibrarySlugs: ['dwi-chagi', 'yeop-chagi', 'naeryeo-chagi'],
  },
  {
    slug: 'dwikkumchi',
    romanization: 'Dwikkumchi',
    hangul: '뒤꿈치',
    pronunciationPt: 'dui-kum-tchi',
    subtitlePt: 'Parte posterior do calcanhar',
    kindLabel: 'Superfícies do pé',
    atlasZone: 'dwikkumchi',
    acervoSlug: 'dwikkumchi',
    summary:
      'Extremidade posterior do calcanhar situada abaixo da inserção do tendão calcâneo. Atua como superfície de impacto em chutes chicoteados reversos como Huryeo-chagi (e suas versões giratórias) e variações descendentes de calcanhar.',
    studyPoints: [
      'Acolchoar adequadamente o alvo ou usar protetores ao treinar chutes giratórios com Dwikkumchi devido à rigidez do calcâneo.',
      'Localizar Dwikkumchi na vista Dorso do Atlas do pé.',
    ],
    variants: ['Dwi-kkumchi', 'Twikkumchi', 'Parte de trás do calcanhar', 'Back of the heel'],
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('Appendix > Applicable Parts of the Body > Dwikkumchi') },
      { field: 'romanization', reference: kukkiwon2012Ref('Appendix > Applicable Parts of the Body > Dwikkumchi') },
    ],
    relatedLibrarySlugs: ['huryeo-nakka-chagi', 'naeryeo-chagi', 'dwichuk'],
  },

  // FAMÍLIA DE CHUTES (CHAGI — 12 FICHAS COM HANGUL E LOCALIZADOR VERIFICADOS)
  {
    slug: 'ap-chagi',
    romanization: 'Ap-chagi',
    hangul: '앞차기',
    pronunciationPt: 'áp-tcha-gui',
    subtitlePt: 'Chute frontal de elevação de joelho e extensão rápida',
    kindLabel: 'Família de chutes (Chagi)',
    acervoSlug: 'ap-chagi',
    summary:
      'Chute fundamental da família Chagi executado em linha reta à frente. Parte da elevação compacta do joelho (câmara), estende a perna chicoteando na altura média ou alta — tipicamente com Apchuk em Poomsae/fundamentos — e recolhe imediatamente o joelho antes de pousar.',
    studyPoints: [
      'Elevar o joelho dobrado antes de estender a canela, evitando chutar com a perna esticada desde o solo.',
      'Recolher os dedos do pé expondo Apchuk quando praticado na forma tradicional de Poomsae.',
      'Controlar o recolhimento (rechamber) para pousar na base seguinte sem cair à frente.',
    ],
    variants: ['Ap Chagi', 'Ap Tchagui', 'Chute frontal', 'Front snap kick'],
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('§1 Chagi > Ap-chagi') },
      { field: 'context', reference: chagiBoardRef },
    ],
    relatedLibrarySlugs: ['apchuk', 'mireo-chagi', 'taegeuk-1-jang'],
  },
  {
    slug: 'dollyeo-chagi',
    romanization: 'Dollyeo-chagi',
    hangul: '돌려차기',
    pronunciationPt: 'dôl-lió-tcha-gui',
    subtitlePt: 'Chute circular / semicircular com rotação de quadril e pé de apoio',
    kindLabel: 'Família de chutes (Chagi)',
    acervoSlug: 'dollyeo-chagi',
    summary:
      'Chute circular emblemático do Taekwondo em que o praticante eleva o joelho, pivota sobre Apchuk do pé de base girando o quadril horizontalmente e estende a perna atingindo o alvo lateralmente com Baldeung (dorso do pé) ou Apchuk (bola do pé).',
    studyPoints: [
      'Girar o pé de apoio sobre Apchuk em sincronia com a abertura do quadril para proteger o joelho de sustentação.',
      'Alinhar coxa e canela no plano horizontal do alvo no instante da extensão.',
      'Notar que "Dollyo Chagi" e "Dollyeo-chagi" representam a mesma escrita coreana (돌려차기).',
    ],
    variants: ['Dollyo Chagi', 'Tolyo Chagi', 'Dollyeo Chagi', 'Chute semicircular', 'Roundhouse kick'],
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('§1 Chagi > Dollyeo-chagi') },
      { field: 'context', reference: chagiBoardRef },
    ],
    relatedLibrarySlugs: ['baldeung', 'apchuk', 'bandal-chagi'],
  },
  {
    slug: 'yeop-chagi',
    romanization: 'Yeop-chagi',
    hangul: '옆차기',
    pronunciationPt: 'ióp-tcha-gui',
    subtitlePt: 'Chute lateral linear com faca do pé (Balnal) ou calcanhar (Dwichuk)',
    kindLabel: 'Família de chutes (Chagi)',
    acervoSlug: 'yeop-chagi',
    summary:
      'Chute linear de grande potência estrutural em que o joelho recolhe junto ao tronco com rotação de 180° do pé de base e a perna projeta-se lateralmente como um pistão, atingindo o alvo com Balnal (faca externa do pé) ou Dwichuk (calcanhar). Exigência central em Taegeuk 4 Jang e Koryo.',
    studyPoints: [
      'Pivotar amplamente o pé de base até o calcanhar apontar na direção do alvo.',
      'Manter a borda externa do pé (Balnal) paralela ao solo ou levemente inclinada para baixo, evitando apontar os dedos para o teto.',
      'Evitar abrir o chute em arco circular: a trajetória de Yeop-chagi é retilínea do quadril ao alvo.',
    ],
    variants: ['Yop Chagi', 'Yeop Chagi', 'Chute lateral', 'Side piercing kick'],
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('§1 Chagi > Yeop-chagi') },
      { field: 'context', reference: chagiBoardRef },
    ],
    relatedLibrarySlugs: ['balnal', 'dwichuk', 'taegeuk-4-jang'],
  },
  {
    slug: 'naeryeo-chagi',
    romanization: 'Naeryeo-chagi',
    hangul: '내려차기',
    pronunciationPt: 'né-rió-tcha-gui',
    subtitlePt: 'Chute descendente vertical ("chute machado")',
    kindLabel: 'Família de chutes (Chagi)',
    acervoSlug: 'naeryeo-chagi',
    summary:
      'Chute em que o membro inferior sobe acima da linha do alvo (por trajetória interna, externa ou frontal) e desce verticalmente acelerando a ação do quadril e dos posteriores da coxa para atingir com Dwichuk, Dwikkumchi ou Balbadak.',
    studyPoints: [
      'Aquecer progressivamente posteriores de coxa e quadril antes de buscar amplitude máxima.',
      'Manter o tronco equilibrado durante a subida, sem compensar jogando a cabeça excessivamente para trás.',
      'Controlar a frenagem antes do solo quando executado no ar para proteger o joelho e o calcanhar.',
    ],
    variants: ['Naeryo Chagi', 'Chigo Chagi', 'Chute descendente', 'Chute machado', 'Axe kick'],
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('§1 Chagi > Naeryeo-chagi') },
      { field: 'context', reference: chagiBoardRef },
    ],
    relatedLibrarySlugs: ['dwichuk', 'dwikkumchi', 'balbadak'],
  },
  {
    slug: 'dwi-chagi',
    romanization: 'Dwi-chagi',
    hangul: '뒤차기',
    pronunciationPt: 'dui-tcha-gui',
    subtitlePt: 'Chute linear para trás com giro pelas costas e impacto de calcanhar',
    kindLabel: 'Família de chutes (Chagi)',
    acervoSlug: 'dwi-chagi',
    summary:
      'Técnica de contra-ataque e potência na qual o praticante gira pelas costas olhando por cima do ombro e dispara a perna traseira rente à coxa de apoio diretamente para trás com Dwichuk (calcanhar), mantendo os dedos apontados para baixo.',
    studyPoints: [
      'Localizar visualmente o alvo por cima do ombro antes de estender a perna.',
      'Fazer o joelho passar rente à outra perna em linha reta, sem abrir lateralmente como em Yeop-chagi.',
      'Manter os dedos do pé voltados para baixo no impacto com Dwichuk.',
    ],
    variants: ['Dwit Chagi', 'Twi Chagi', 'Tit Chagui', 'Chute para trás', 'Back kick'],
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('§1 Chagi > Dwi-chagi') },
      { field: 'context', reference: chagiBoardRef },
    ],
    relatedLibrarySlugs: ['dwichuk', 'yeop-chagi', 'huryeo-nakka-chagi'],
  },
  {
    slug: 'an-chagi',
    romanization: 'An-chagi',
    hangul: '안차기',
    pronunciationPt: 'ân-tcha-gui',
    subtitlePt: 'Chute em arco crescente de fora para dentro',
    kindLabel: 'Família de chutes (Chagi)',
    acervoSlug: 'an-chagi',
    summary:
      'Chute circular ascendente/crescente cuja trajetória cruza do lado externo em direção ao eixo central interno do praticante, utilizando Balnaldeung (borda interna) ou Balbadak (planta do pé) tanto para ataque quanto para desvio/abertura da guarda.',
    studyPoints: [
      'Conduzir o arco pelo quadril mantendo os ombros estáveis voltados à frente.',
      'Identificar a superfície pedida pelo exercício: Balnaldeung ou Balbadak (por exemplo, na batida contra a mão em Taegeuk 7).',
    ],
    variants: ['An Chagi', 'An Dari Furigi', 'Crescent kick (inward)', 'Queixada de fora para dentro'],
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('§1 Chagi > An-chagi') },
      { field: 'context', reference: chagiBoardRef },
    ],
    relatedLibrarySlugs: ['balnaldeung', 'balbadak', 'bakkat-chagi'],
  },
  {
    slug: 'bakkat-chagi',
    romanization: 'Bakkat-chagi',
    hangul: '바깥차기',
    pronunciationPt: 'ba-kát-tcha-gui',
    subtitlePt: 'Chute em arco crescente de dentro para fora',
    kindLabel: 'Família de chutes (Chagi)',
    acervoSlug: 'bakkat-chagi',
    summary:
      'Movimento oposto ao An-chagi: a perna sobe cruzando pela linha interna e abre em arco amplo de dentro para fora, utilizando Balnal (borda externa) ou a lateral do calcanhar.',
    studyPoints: [
      'Pivotar levemente o pé de base para liberar a abertura externa do quadril sem tensão articular.',
      'Reconciliar na leitura a grafia tradicional "Pakkat Chagi" com a romanização institucional "Bakkat-chagi".',
    ],
    variants: ['Pakkat Chagi', 'Bakkat Chagi', 'Outward crescent kick', 'Arco de dentro para fora'],
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('§1 Chagi > Bakkat-chagi') },
      { field: 'context', reference: chagiBoardRef },
    ],
    relatedLibrarySlugs: ['balnal', 'an-chagi', 'dwichuk'],
  },
  {
    slug: 'bandal-chagi',
    romanization: 'Bandal-chagi',
    hangul: '반달차기',
    pronunciationPt: 'bân-dál-tcha-gui',
    subtitlePt: 'Chute diagonal em meia-lua na linha média (tronco)',
    kindLabel: 'Família de chutes (Chagi)',
    acervoSlug: 'bandal-chagi',
    summary:
      'Chute em trajetória diagonal ascendente de cerca de 45° ("meia-lua"), intermediária entre o chute frontal (Ap-chagi) e o semicircular completo (Dollyeo-chagi). Pela velocidade de saída sem telegrafar o quadril, é uma das técnicas mais frequentes na pontuação no colete em Kyorugi.',
    studyPoints: [
      'Disparar o joelho diretamente na diagonal rumo às costelas/colete em trajetória curta.',
      'Impactar com Baldeung (em Kyorugi com protetor) ou Apchuk (em aplicação marcial), recolhendo rápido para encadear o próximo passo.',
    ],
    variants: ['Bandal Chagi', 'Pandal Chagi', 'Chute meia-lua', '45-degree kick'],
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('§1 Chagi > Bandal-chagi') },
      { field: 'context', reference: chagiBoardRef },
    ],
    relatedLibrarySlugs: ['baldeung', 'dollyeo-chagi', 'narae-ttwieo-gawi-chagi'],
  },
  {
    slug: 'mireo-chagi',
    romanization: 'Mireo-chagi',
    hangul: '밀어차기',
    pronunciationPt: 'mi-ró-tcha-gui',
    subtitlePt: 'Chute frontal de empurrão para controle de distância',
    kindLabel: 'Família de chutes (Chagi)',
    acervoSlug: 'mireo-chagi',
    summary:
      'Diferente do chicoteio rápido de Ap-chagi, Mireo-chagi eleva o joelho junto ao peito e projeta a massa do quadril para a frente empurrando o oponente com Balbadak (planta inteira) ou Dwichuk (calcanhar) para abrir distância ou quebrar o avanço adversário.',
    studyPoints: [
      'Trazer o joelho bem alto próximo ao peito antes de projetar o pé à frente.',
      'Usar transferência horizontal do quadril em vez de apenas esticar o joelho.',
    ],
    variants: ['Miro Chagi', 'Mireo Chagi', 'Push kick', 'Chute de empurrão'],
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('§1 Chagi > Mireo-chagi') },
      { field: 'context', reference: chagiBoardRef },
    ],
    relatedLibrarySlugs: ['balbadak', 'dwichuk', 'ap-chagi'],
  },
  {
    slug: 'huryeo-nakka-chagi',
    romanization: 'Huryeo-chagi',
    hangul: '후려차기',
    pronunciationPt: 'ru-rió-tcha-gui',
    subtitlePt: 'Chute chicoteado reverso e relação com Nakka-chagi (enganche)',
    kindLabel: 'Família de chutes (Chagi)',
    acervoSlug: 'huryeo-chagi',
    summary:
      'Huryeo-chagi descreve uma varredura alta chicoteada de dentro para fora atingindo o alvo com Dwikkumchi (parte posterior do calcanhar) ou Balbadak, executado com a perna da frente ou com giro completo de 360° pelas costas. Relaciona-se na seção §1 Chagi a Nakka-chagi (낚아차기, chute em gancho curto).',
    studyPoints: [
      'Na versão giratória (frequentemente chamada Mondollyo Huryo Chagi nas escolas), girar cabeça e ombros primeiro para enxergar o alvo antes do chicoteio final.',
      'Diferenciar o arco amplo contínuo de Huryeo-chagi da flexão aguda de enganche do joelho em Nakka-chagi (낚아차기).',
    ],
    variants: [
      'Huryo Chagi',
      'Mondollyo Huryo Chagi',
      'Momdollyeo-huryeo-chagi',
      'Nakka-chagi (낚아차기)',
      'Whip / Hook kick',
    ],
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('§1 Chagi > Huryeo-chagi / Nakka-chagi') },
      { field: 'context', reference: chagiBoardRef },
    ],
    relatedLibrarySlugs: ['dwikkumchi', 'balbadak', 'dwi-chagi'],
  },
  {
    slug: 'biteureo-chagi',
    romanization: 'Biteureo-chagi',
    hangul: '비틀어차기',
    pronunciationPt: 'bi-tư-ró-tcha-gui',
    subtitlePt: 'Chute torcido diagonal de dentro para fora com Apchuk',
    kindLabel: 'Família de chutes (Chagi)',
    acervoSlug: 'biteureo-chagi',
    summary:
      'Chute técnico avançado em que o joelho sobe cruzando em direção interna e o quadril realiza rotação interna inversa projetando a perna de dentro para fora, atingindo com Apchuk. Útil em curta distância por contornar a guarda externa adversária.',
    studyPoints: [
      'Respeitar a mobilidade natural do quadril e do joelho de apoio: pratique inicialmente em altura baixa e média.',
      'Notar a correspondência entre a grafia usual "Bituro Chagi" e a romanização Kukkiwon "Biteureo-chagi" (비틀어차기).',
    ],
    variants: ['Bituro Chagi', 'Biteureo Chagi', 'Twist kick', 'Chute torcido'],
    references: [
      { field: 'hangul', reference: kukkiwon2012Ref('§1 Chagi > Biteureo-chagi') },
      { field: 'context', reference: chagiBoardRef },
    ],
    relatedLibrarySlugs: ['apchuk', 'bakkat-chagi', 'ap-chagi'],
  },
  {
    slug: 'narae-ttwieo-gawi-chagi',
    romanization: 'Narae-chagi',
    hangul: '나래차기',
    pronunciationPt: 'na-ré-tcha-gui',
    subtitlePt: 'Chutes encadeados, saltados e de contra-ataque (Narae, Ttwieo, Gawi, Pyojeok e Bada)',
    kindLabel: 'Família de chutes (Chagi)',
    acervoSlug: 'narae-chagi',
    summary:
      'A seção §1 Chagi da Kukkiwon documenta também famílias compostas e aéreas fundamentais: Narae-chagi (나래차기, sequência alternada rápida de chutes circulares em progressão), Ttwieo-chagi (뛰어차기, chutes em salto, como em Taegeuk 8 e Koryo), Gawi-chagi (가위차기, chute duplo em tesoura), Pyojeok-chagi (표적차기, chute contra a própria mão-alvo, presente em Taegeuk 7 e Shipjin) e Bada-chagi (받아차기, chute de interceptação/contra-ataque).',
    studyPoints: [
      'Dominar a técnica correspondente no solo com equilíbrio completo antes de adicionar impulsão aérea (Ttwieo-chagi).',
      'Aterrissar suavemente flexionando tornozelo, joelho e quadril sobre tatame apropriado.',
      'Consultar no Acervo cada registro individual de §1 Chagi para estudo detalhado.',
    ],
    variants: [
      'Narae Chagi (나래차기)',
      'Ttwieo-chagi / Twio Chagi (뛰어차기)',
      'Gawi-chagi (가위차기)',
      'Pyojeok-chagi (표적차기)',
      'Bada-chagi (받아차기)',
    ],
    references: [
      {
        field: 'hangul',
        reference: kukkiwon2012Ref('§1 Chagi > Narae-chagi / Ttwieo-chagi / Gawi-chagi / Pyojeok-chagi / Bada-chagi'),
      },
      { field: 'context', reference: chagiBoardRef },
    ],
    relatedLibrarySlugs: ['baldeung', 'bandal-chagi', 'taegeuk-8-jang'],
  },
];
