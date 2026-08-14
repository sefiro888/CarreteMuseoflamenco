import type { ImageMetadata } from 'astro';

/**
 * Fotografía de cabecera de cada sala, con su pie y su crédito.
 *
 * Se resuelven todas las imágenes del archivo de una vez para poder
 * asociarlas por nombre de fichero sin repetir un import por sala.
 */
const archive = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/archivo/*.jpg',
  { eager: true },
);

function asset(name: string): ImageMetadata | undefined {
  return archive[`../assets/archivo/${name}.jpg`]?.default;
}

export interface RoomImage {
  image: ImageMetadata;
  alt: string;
  caption: string;
  credit: string;
  focal?: string;
}

interface RoomImageSpec {
  file: string;
  alt: string;
  caption: string;
  credit: string;
  focal?: string;
}

const SPECS: Record<string, RoomImageSpec> = {
  '/vida/yo-no-se-la-eda-que-tengo': {
    file: 'carrete-vicente-pachon',
    alt: 'Carrete, con sombrero y bastón sujeto en horizontal con las dos manos, mira al frente sobre un fondo oscuro.',
    caption: 'Carrete sobre el escenario, con el bastón que acompaña muchos de sus bailes.',
    credit: 'Fotografía: Vicente Pachón',
    focal: 'center 35%',
  },
  '/vida/el-nino-que-bailaba-sobre-el-trigo': {
    file: 'la-carreta',
    alt: 'Retrato en blanco y negro de Carmen «La Carreta», con mantón de flecos claro y un ramo de flores en la mano, de perfil.',
    caption: 'Carmen «La Carreta», madre de Carrete. De su apodo viene el nombre artístico del bailaor.',
    credit: 'Archivo familiar Losada',
    focal: 'center 25%',
  },
  '/vida/malaga-el-perchel-y-los-vargas': {
    file: '1954-carrete-con-los-vargas-en-el-refugio-archivo-paco-roji',
    alt: 'Un Carrete adolescente baila sobre un escenario rodeado de bailaoras y un guitarrista, ante el público sentado a las mesas del tablao El Refugio.',
    caption: 'Carrete con Los Vargas en el tablao El Refugio, 1954. Es la fotografía más antigua que conserva el archivo.',
    credit: 'Archivo Paco Roji',
    focal: 'center 30%',
  },
  '/vida/torremolinos-capital-del-tablao': {
    file: '1959-bodega-carrete-bailando-foto-s-ruiz-cortesia-gerardo-mongelli',
    alt: 'Carrete joven baila con los brazos abiertos, camisa de lunares y chaleco, bajo las vigas de madera de una taberna flamenca.',
    caption: 'Bailando en La Bodega Andaluza de Torremolinos, 1959.',
    credit: 'Fotografía: S. Ruiz — cortesía de Gerardo Mongelli',
    focal: 'center 30%',
  },
  '/vida/el-fred-astaire-gitano': {
    file: '1959-carrete-posando-playa-de-torremolinos',
    alt: 'Carrete joven posa de pie, muy erguido y con las manos en la cintura, junto a la playa de Torremolinos.',
    caption: 'Posando en la playa de Torremolinos, 1959.',
    credit: 'Archivo familiar Losada',
    focal: 'center 25%',
  },
  '/gracia': {
    file: '2018-05-09-senorialmente-2',
    alt: 'Carrete, de traje y sombrero, en una pose desenfadada mientras conversa.',
    caption: '«Señorialmente», la palabra que él mismo usa y que guía el tono de este museo.',
    credit: 'Archivo familiar Losada',
    focal: 'center 30%',
  },
  '/maestros': {
    file: '1968-carrete-farruco-el-gringo-chaqueta-adela-y-juan-el-africao-el-jaleo',
    alt: 'Grupo de artistas flamencos posando juntos en el tablao El Jaleo: entre ellos Carrete, Farruco, El Chaqueta y Adela.',
    caption:
      'Carrete, Farruco, El Gringo, El Chaqueta, Adela y Juan el Africano en El Jaleo, segunda mitad de los años sesenta.',
    credit: 'Archivo familiar Losada',
    focal: 'center 35%',
  },
  '/estatua': {
    file: 'junto-a-su-estatua-en-torremolinos',
    alt: 'Carrete de pie junto a la estatua de bronce que Torremolinos le dedicó, en la que aparece bailando.',
    caption: 'Carrete junto a su estatua en Torremolinos.',
    credit: 'Archivo familiar Losada',
    focal: 'center 30%',
  },
  '/familia': {
    file: '2007-yo-no-se-la-eda-que-tengo-carrete-y-familia',
    alt: 'Carrete rodeado de su familia durante la presentación del espectáculo «Yo no sé la edá que tengo».',
    caption: 'Con su familia, en 2007.',
    credit: 'Archivo familiar Losada',
    focal: 'center 30%',
  },
  '/hoy': {
    file: 'img-0690bynr-fotografia-paco-lobato',
    alt: 'Carrete bailando de perfil sobre fondo negro, con los brazos extendidos y las manos abiertas, iluminado por un foco.',
    caption: 'Carrete sigue bailando.',
    credit: 'Fotografía: Paco Lobato',
    focal: 'center 40%',
  },
  '/premios': {
    file: '2023-10-leyenda-del-flamenco-venta-de-vargas',
    alt: 'Carrete recibe el Premio Leyenda del Flamenco en la Venta de Vargas.',
    caption: 'Premio Leyenda del Flamenco, Venta de Vargas, 2023.',
    credit: 'Archivo familiar Losada',
    focal: 'center 30%',
  },
  '/mundo': {
    file: '2023-ff-londres',
    alt: 'Carrete durante el festival flamenco de Londres de 2023.',
    caption: 'Festival flamenco de Londres, 2023.',
    credit: 'Archivo familiar Losada',
    focal: 'center 30%',
  },
};

export function getRoomImage(slug: string): RoomImage | null {
  const spec = SPECS[slug];
  if (!spec) return null;
  const image = asset(spec.file);
  if (!image) return null;
  return {
    image,
    alt: spec.alt,
    caption: spec.caption,
    credit: spec.credit,
    focal: spec.focal,
  };
}
