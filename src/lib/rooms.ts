export interface Room {
  slug: string;
  title: { es: string; en: string };
  summary: { es: string; en: string };
}

export const rooms: Room[] = [
  {
    slug: '/',
    title: { es: 'Portada — El hombre que sigue bailando', en: 'Cover — The man who keeps dancing' },
    summary: { es: 'Una vida bailada.', en: 'A life danced.' },
  },
  {
    slug: '/vida/yo-no-se-la-eda-que-tengo',
    title: { es: 'Yo no sé la edá que tengo', en: "I don't know my own age" },
    summary: {
      es: 'Una fecha de nacimiento discutida y una línea temporal que se reconstruye a pedazos.',
      en: 'A disputed birth date and a timeline reconstructed piece by piece.',
    },
  },
  {
    slug: '/vida/el-nino-que-bailaba-sobre-el-trigo',
    title: { es: 'El niño que bailaba sobre el trigo', en: 'The boy who danced on the wheat' },
    summary: {
      es: 'Infancia, posguerra y las ventas de Zafarraya.',
      en: 'Childhood, the postwar years, and the ventas of Zafarraya.',
    },
  },
  {
    slug: '/vida/malaga-el-perchel-y-los-vargas',
    title: { es: 'Málaga, El Perchel y Los Vargas', en: 'Málaga, El Perchel and Los Vargas' },
    summary: {
      es: 'La llegada a Málaga y los primeros tablaos.',
      en: 'Arrival in Málaga and the first tablaos.',
    },
  },
  {
    slug: '/vida/torremolinos-capital-del-tablao',
    title: { es: 'Torremolinos, capital del tablao', en: 'Torremolinos, capital of the tablao' },
    summary: {
      es: 'La edad de oro de la Costa del Sol.',
      en: 'The golden age of the Costa del Sol.',
    },
  },
  {
    slug: '/vida/el-fred-astaire-gitano',
    title: { es: 'El Fred Astaire gitano', en: 'The Gypsy Fred Astaire' },
    summary: {
      es: 'De dónde viene el apodo y qué significa.',
      en: 'Where the nickname comes from and what it means.',
    },
  },
  {
    slug: '/gracia',
    title: { es: 'La gracia de Carrete', en: "Carrete's gracia" },
    summary: { es: 'Su forma de hablar, de bromear y de estar en el mundo.', en: 'His way of talking, joking, and being in the world.' },
  },
  {
    slug: '/monotonas',
    title: { es: 'Las monótonas de Carrete', en: "Carrete's monótonas" },
    summary: { es: 'Sus anécdotas, contadas por él mismo.', en: 'His anecdotes, told in his own words.' },
  },
  {
    slug: '/videos',
    title: { es: 'Verlo bailar', en: 'Watch him dance' },
    summary: { es: 'Porque esto no se cuenta: se mira.', en: 'This is not told: it is watched.' },
  },
  {
    slug: '/maestros',
    title: { es: 'Carrete y los maestros', en: 'Carrete and the masters' },
    summary: { es: 'Los artistas que marcaron su camino.', en: 'The artists who shaped his path.' },
  },
  {
    slug: '/mundo',
    title: { es: 'De la Costa del Sol al mundo', en: 'From the Costa del Sol to the world' },
    summary: { es: 'Viajes, festivales y escenarios internacionales.', en: 'Travels, festivals and international stages.' },
  },
  {
    slug: '/mapa',
    title: { es: 'Mapa interactivo', en: 'Interactive map' },
    summary: { es: 'Los lugares de una vida bailada.', en: 'The places of a life in dance.' },
  },
  {
    slug: '/espectaculos',
    title: { es: 'Espectáculos y obras', en: 'Shows and works' },
    summary: { es: 'Fichas de sus espectáculos principales.', en: 'Records of his main shows.' },
  },
  {
    slug: '/premios',
    title: { es: 'Premios y homenajes', en: 'Awards and tributes' },
    summary: { es: 'El reconocimiento a una trayectoria.', en: 'Recognition of a career.' },
  },
  {
    slug: '/estatua',
    title: { es: 'La estatua', en: 'The statue' },
    summary: { es: 'Torremolinos esculpe a su bailaor.', en: 'Torremolinos sculpts its dancer.' },
  },
  {
    slug: '/voces',
    title: { es: 'Lo que dijeron de él', en: 'What they said about him' },
    summary: { es: 'Testimonios de artistas y personalidades.', en: 'Testimonies from artists and public figures.' },
  },
  {
    slug: '/archivo',
    title: { es: 'Archivo fotográfico y audiovisual', en: 'Photographic and audiovisual archive' },
    summary: { es: 'El material que documenta su vida.', en: 'The material documenting his life.' },
  },
  {
    slug: '/hemeroteca',
    title: { es: 'Lo que decía la prensa', en: 'What the press said' },
    summary: {
      es: 'Carrete contado por los periódicos de su tiempo.',
      en: 'Carrete as told by the newspapers of his time.',
    },
  },
  {
    slug: '/hoy',
    title: { es: 'Carrete hoy', en: 'Carrete today' },
    summary: { es: 'Su actividad artística en el presente.', en: 'His artistic activity in the present.' },
  },
  {
    slug: '/familia',
    title: { es: 'La familia y el hombre', en: 'The family and the man' },
    summary: { es: 'Quién es Carrete fuera del escenario.', en: 'Who Carrete is offstage.' },
  },
  {
    slug: '/creditos',
    title: { es: 'Colaboradores, créditos y fuentes', en: 'Collaborators, credits and sources' },
    summary: { es: 'Quién hace posible este museo y de dónde viene cada dato.', en: 'Who makes this museum possible and where each fact comes from.' },
  },
];

export function getRoomNeighbors(slug: string) {
  const index = rooms.findIndex((room) => room.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? rooms[index - 1] : null,
    next: index < rooms.length - 1 ? rooms[index + 1] : null,
  };
}
