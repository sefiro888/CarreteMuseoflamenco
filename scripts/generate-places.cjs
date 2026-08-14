/**
 * Crea las fichas de lugar de los tablaos y salas que aparecen documentados
 * en el archivo familiar. Solo se ejecuta una vez para sembrar la colección;
 * después las fichas se editan a mano como cualquier otro contenido.
 */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'src', 'content', 'places');

// Cada entrada refleja lo que consta en el archivo (carteles, programas y
// recortes de prensa). No se inventan coordenadas: los locales de los que no
// se conoce la dirección exacta quedan agrupados por municipio.
const VENUES = [
  {
    slug: 'el-refugio',
    name: 'El Refugio',
    kind: 'Tablao',
    municipality: 'Málaga',
    dateRangeApprox: 'Mediados de los años cincuenta',
    verification: 'documented',
    description:
      'Uno de los primeros locales donde Carrete actúa con Los Vargas, documentado en fotografías del archivo de Paco Roji fechadas en 1954.',
    body: 'El Refugio aparece en las fotografías más antiguas conservadas de Carrete sobre un escenario, cuando todavía era un adolescente integrado en el grupo de Los Vargas.',
  },
  {
    slug: 'el-pimpi',
    name: 'El Pimpi (sala de fiestas)',
    kind: 'Sala de fiestas',
    municipality: 'Torremolinos',
    dateRangeApprox: 'Segunda mitad de los años cincuenta',
    verification: 'documented',
    description:
      'Sala de fiestas donde Carrete actúa a partir de mediados de los cincuenta, documentada en fotografías de 1955-1957 y en anuncios de prensa de la época.',
    body: 'Un recorte de prensa conservado en el archivo anuncia: «EL PIMPI.— Desde las siete y media, baile sin interrupción. Tahito Robemar, la pareja Adela Delfín y Miguel López y El Carrete».',
  },
  {
    slug: 'el-remo',
    name: 'El Remo — Club Montemar',
    kind: 'Club y sala de fiestas',
    municipality: 'Torremolinos',
    dateRangeApprox: 'Mediados de los años cincuenta',
    verification: 'documented',
    description:
      'Club de Torremolinos donde actuó el grupo Los Vargas. Un anuncio de agosto de 1955 conservado en el archivo lo confirma junto a La Paquera de Jerez.',
    body: 'El anuncio de la «II Gran Fiesta de los Amigos de Torremolinos» en el Club Montemar El Remo destaca en el cartel «el grupo folklórico LOS VARGAS y la reina del cante grande LA PAQUERA».',
  },
  {
    slug: 'el-jaleo',
    name: 'El Jaleo',
    kind: 'Tablao',
    municipality: 'Torremolinos',
    dateRangeApprox: 'Años sesenta y setenta',
    verification: 'documented',
    description:
      'Gran tablao flamenco de Torremolinos, en la Plaza de la Gamba Alegre, y uno de los escenarios centrales de la carrera de Carrete. Compartió cartel allí con Mariquilla.',
    body: 'Los carteles conservados anuncian «El mejor espectáculo flamenco de la Costa del Sol» con Mariquilla y Carrete. Por El Jaleo pasaron también Farruco, El Chaqueta y el Grupo de Triana, según una fotografía de la segunda mitad de los sesenta.',
  },
  {
    slug: 'bodega-andaluza',
    name: 'La Bodega Andaluza',
    kind: 'Taberna flamenca',
    municipality: 'Torremolinos',
    dateRangeApprox: 'Finales de los cincuenta y años sesenta',
    verification: 'documented',
    description:
      'Taberna flamenca de Torremolinos donde Carrete bailó a finales de los cincuenta y en los sesenta, y donde se fotografió con Anthony Quinn.',
    body: 'De este local proceden algunas de las mejores fotografías del Carrete joven bailando, cedidas por Gerardo Mongelli.',
  },
  {
    slug: 'el-manana',
    name: 'El Mañana',
    kind: 'Sala de fiestas',
    municipality: 'Torremolinos',
    dateRangeApprox: 'Finales de los años cincuenta',
    verification: 'documented',
    description:
      'Sala de fiestas y restaurante de Torremolinos con espectáculo flamenco, documentada en publicidad de la época conservada en el archivo.',
    body: 'Su publicidad se anunciaba como «el lugar más céntrico y selecto de Torremolinos», con cocina internacional y flamenco show.',
  },
  {
    slug: 'cuevas-alhambra',
    name: 'Las Cuevas de la Alhambra',
    kind: 'Tablao',
    municipality: 'Torremolinos',
    dateRangeApprox: 'Años sesenta y setenta',
    verification: 'documented',
    description:
      'Tablao típico de Torremolinos que anunciaba a Carrete como cabeza de cartel, según los programas conservados en el archivo.',
    body: 'Un programa del local presenta a «EL CARRETE» y «Ansonini del Puerto», con los guitarristas El Muñeco y Félix de Utrera.',
  },
  {
    slug: 'gran-taberna-gitana',
    name: 'Gran Taberna Gitana',
    kind: 'Tablao',
    municipality: 'Torremolinos',
    dateRangeApprox: 'Años sesenta',
    verification: 'documented',
    description:
      'Tablao de Torremolinos documentado en el archivo en fotografías y recortes de prensa de los años sesenta.',
    body: 'En 1963 se fotografía allí a Carrete junto a Pepe More, Paco del Gastor y Carmen Terremoto.',
  },
  {
    slug: 'pez-espada',
    name: 'Hotel Pez Espada',
    kind: 'Hotel',
    municipality: 'Torremolinos',
    dateRangeApprox: 'Años setenta',
    verification: 'documented',
    description:
      'Hotel emblemático de la edad de oro de Torremolinos, escenario de galas flamencas en las que participó Carrete.',
    body: 'Un recorte de diciembre de 1971 documenta la presencia de Carrete y Carmen en el Pez Espada.',
  },
  {
    slug: 'tabarin-club',
    name: 'Tabarín Club',
    kind: 'Sala de fiestas',
    municipality: 'Torremolinos',
    dateRangeApprox: 'Finales de los años cincuenta',
    verification: 'documented',
    description:
      'Sala de fiestas que anunciaba las actuaciones de Carrete en 1958. Su tarjeta promocional lo presenta como «el monstruo gitano».',
    body: 'La tarjeta del Tabarín Club conservada en el archivo anuncia «EL CARRETE — Actuación del monstruo gitano», un reclamo que muestra el tipo de cartel que ya tenía siendo muy joven.',
  },
  {
    slug: 'pato-pato',
    name: 'Pato-Pato — La Cascada',
    kind: 'Sala de fiestas y discoteca',
    municipality: 'Torremolinos',
    dateRangeApprox: 'Mediados de los años setenta',
    verification: 'documented',
    description:
      'Sala de fiestas y night club de Torremolinos donde Carrete actuó en pareja artística con Carmen, según los anuncios conservados de 1975.',
    body: 'Los anuncios presentan el «Flamenco show de Carmen y Carrete» junto al trío sudamericano Los Mensú.',
  },
  {
    slug: 'pueblo-blanco',
    name: 'Pueblo Blanco',
    kind: 'Complejo de espectáculos',
    municipality: 'Torremolinos',
    dateRangeApprox: 'Años setenta',
    verification: 'documented',
    description:
      'Escenario de Torremolinos documentado en el archivo con fotografías de 1977, entre ellas una postal de la editorial Savir.',
    body: '',
  },
  {
    slug: 'cafe-de-chinitas',
    name: 'Café de Chinitas',
    kind: 'Tablao',
    municipality: 'Madrid',
    lat: 40.4222,
    lng: -3.7115,
    dateRangeApprox: 'Comienzos de los años ochenta',
    verification: 'documented',
    description:
      'Tablao madrileño de referencia. Carrete figura en el cartel de su cena flamenca de fin de año de 1981.',
    body: 'El anuncio de la cena de fin de año que despedía 1981 incluye a La Chunga, Víctor Monge «Serranito», La Polilla y El Carrete.',
  },
  {
    slug: 'casa-patas',
    name: 'Casa Patas',
    kind: 'Tablao',
    municipality: 'Madrid',
    lat: 40.4127,
    lng: -3.7003,
    dateRangeApprox: '2012',
    verification: 'documented',
    description: 'Tablao madrileño donde Carrete actuó en 2012, según el archivo familiar.',
    body: '',
  },
  {
    slug: 'corral-de-la-moreria',
    name: 'Corral de la Morería',
    kind: 'Tablao',
    municipality: 'Madrid',
    lat: 40.4136,
    lng: -3.7146,
    dateRangeApprox: '2012',
    verification: 'documented',
    description:
      'Tablao histórico de Madrid. Carrete participó en su ciclo de 2012, documentado en el archivo.',
    body: '',
  },
  {
    slug: 'teatro-albeniz',
    name: 'Teatro Cervantes y Sala Albéniz',
    kind: 'Teatro',
    municipality: 'Málaga',
    lat: 36.7247,
    lng: -4.4177,
    dateRangeApprox: 'Años 2010 y 2020',
    verification: 'documented',
    description:
      'Escenarios malagueños donde Carrete ha participado en festivales de flamenco y jazz y en la presentación de «Quijote».',
    body: '',
  },
  {
    slug: 'sevilla',
    name: 'Sevilla',
    kind: 'Ciudad',
    lat: 37.3891,
    lng: -5.9845,
    dateRangeApprox: 'Años 2010',
    verification: 'documented',
    description:
      'Ciudad donde Carrete ha participado en bienales y actos flamencos, documentados en el archivo familiar desde 2010.',
    body: '',
  },
  {
    slug: 'jerez',
    name: 'Jerez de la Frontera',
    kind: 'Ciudad',
    lat: 36.6866,
    lng: -6.1371,
    dateRangeApprox: 'Años 2010 y 2020',
    verification: 'documented',
    description:
      'Sede del Festival de Jerez, donde Carrete actuó en 2012, y de la Venta de Vargas, donde recibió el Premio Leyenda del Flamenco en 2023.',
    body: '',
  },
  {
    slug: 'barcelona',
    name: 'Barcelona',
    kind: 'Ciudad',
    lat: 41.3874,
    lng: 2.1686,
    dateRangeApprox: 'Años 2010 y 2020',
    verification: 'documented',
    description:
      'Ciudad donde Carrete ha actuado en el Tablao El Cordobés, documentado en el archivo en 2012 y 2024.',
    body: '',
  },
  {
    slug: 'madrid',
    name: 'Madrid',
    kind: 'Ciudad',
    lat: 40.4168,
    lng: -3.7038,
    dateRangeApprox: 'Desde los años ochenta',
    verification: 'documented',
    description:
      'Ciudad donde Carrete ha actuado en tablaos históricos como el Café de Chinitas, Casa Patas y el Corral de la Morería, además del Teatro Real.',
    body: '',
  },
  {
    slug: 'marbella',
    name: 'Marbella',
    kind: 'Municipio',
    lat: 36.5101,
    lng: -4.8858,
    dateRangeApprox: 'Años 2010',
    verification: 'documented',
    description:
      'Municipio de la Costa del Sol donde se presentó su biografía en 2010 y donde coincidió con Paco de Lucía en el festival Starlite en 2013.',
    body: '',
  },
  {
    slug: 'noruega',
    name: 'Noruega',
    kind: 'País',
    lat: 59.9139,
    lng: 10.7522,
    dateRangeApprox: 'Enero de 1969',
    verification: 'documented',
    description:
      'Destino de la «embajada flamenca» de enero de 1969 en la que participó Carrete, documentada en un recorte de prensa del archivo.',
    body: 'El recorte titulado «Embajada flamenca a Noruega» conserva la fotografía del grupo antes del viaje.',
  },
];

const esc = (s) => String(s).replace(/"/g, '\\"');

let created = 0;
for (const v of VENUES) {
  const file = path.join(OUT, `${v.slug}.md`);
  if (fs.existsSync(file)) {
    console.log('  ya existe, se respeta:', v.slug);
    continue;
  }
  const fm = [
    '---',
    `name: "${esc(v.name)}"`,
    `kind: "${esc(v.kind)}"`,
    v.lat !== undefined ? `lat: ${v.lat}` : null,
    v.lng !== undefined ? `lng: ${v.lng}` : null,
    v.municipality ? `municipality: "${esc(v.municipality)}"` : null,
    v.dateRangeApprox ? `dateRangeApprox: "${esc(v.dateRangeApprox)}"` : null,
    `description: >`,
    '  ' + v.description.replace(/\s+/g, ' ').trim(),
    `verification: ${v.verification}`,
    'status: published',
    'sourceRefs:',
    '  - archivo-familiar-losada',
    '---',
    '',
    v.body || '',
  ]
    .filter((l) => l !== null)
    .join('\n');
  fs.writeFileSync(file, fm + '\n');
  created++;
}
console.log('Fichas de lugar creadas:', created);
