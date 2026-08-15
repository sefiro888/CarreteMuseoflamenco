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
    file: '2026-05-manu-rosaleny03',
    alt: 'Primer plano de Carrete, con sombrero y traje claro, echando la cabeza atrás y extendiendo la mano hacia la cámara mientras habla.',
    caption: 'La mano por delante, la cabeza atrás: así habla Carrete, y así baila.',
    credit: 'Fotografía: Manu Rosaleny',
    focal: 'center 35%',
  },
  '/familia': {
    file: '2026-05-manu-rosaleny01',
    alt: 'Las dos manos de Carrete, con un anillo de sello, cruzadas sobre el puño de su bastón de madera.',
    caption: 'Las manos y el bastón, después de setenta años bailando.',
    credit: 'Fotografía: Manu Rosaleny',
    focal: 'center',
  },
  '/voces': {
    file: '2018-05-09-senorialmente',
    alt: 'Carrete, a hombros del público en un teatro, levanta un ramo de flores mientras la sala aplaude.',
    caption: 'A hombros, en el teatro. La palabra que él usa para esto es «señorialmente».',
    credit: 'Archivo familiar Losada',
    focal: 'center 30%',
  },
  '/monotonas': {
    file: '2026-05-mau-rosaleny02',
    alt: 'Carrete camina de frente, apoyado en su bastón, con traje claro de raya diplomática y sombrero, sobre un suelo de baldosa.',
    caption: 'Andando por Torremolinos, que es donde salen las monótonas.',
    credit: 'Fotografía: Manu Rosaleny',
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
  '/videos': {
    file: 'img-0690bynr-fotografia-paco-lobato',
    alt: 'Carrete bailando de perfil sobre fondo negro, con los brazos extendidos y las manos abiertas, en blanco y negro.',
    caption: 'Los brazos abiertos y las manos hablando. Esto es lo que no se puede contar con palabras.',
    credit: 'Fotografía: Paco Lobato',
    focal: 'center 40%',
  },
  '/mapa': {
    file: '1968-carrete-farruco-el-gringo-chaqueta-adela-y-juan-el-africao-el-jaleo',
    alt: 'Carrete con Farruco, El Gringo, El Chaqueta, Adela y Juan el Africano en el tablao El Jaleo de Torremolinos, en los años sesenta.',
    caption: 'El Jaleo, Torremolinos, finales de los sesenta. Con Farruco, El Gringo, El Chaqueta, Adela y Juan el Africano.',
    credit: 'Archivo familiar Losada',
    focal: 'center 35%',
  },
  '/espectaculos': {
    file: '2015-carrete-60-anos',
    alt: 'Carrete sobre el escenario durante el espectáculo de sus sesenta años bailando.',
    caption: '«60 años bailando», el espectáculo que resume su vida en siete palos.',
    credit: 'Archivo familiar Losada',
    focal: 'center 30%',
  },
  '/archivo': {
    file: '2023-img-7819f-fotografia-paco-lobato',
    alt: 'Carrete de traje oscuro y sombrero, con el bastón en la mano, caminando por el escenario ante su cuadro flamenco.',
    caption: 'Sobre el escenario con el bastón, uno de sus sellos.',
    credit: 'Fotografía: Paco Lobato',
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
