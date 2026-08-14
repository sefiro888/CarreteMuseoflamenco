/**
 * Tipos y utilidades del mapa que también corren en el navegador.
 *
 * Deliberadamente no importa nada de `astro:content`: ese módulo solo existe
 * en el servidor, y el componente del mapa se ejecuta en el cliente.
 */

export interface PlacePhoto {
  thumb: string;
  full: string;
  alt: string;
  title: string;
  date: string;
  credit: string;
  focal: string;
  isPress: boolean;
  pdf?: string;
}

export interface MapPlace {
  id: string;
  name: string;
  kind: string;
  lat: number;
  lng: number;
  precision: 'exact' | 'street' | 'approximate';
  municipality: string | null;
  yearOpened: number | null;
  yearClosed: number | null;
  /** Décadas con material fechado en ese lugar, para el filtro temporal. */
  decades: string[];
  todayNote: string | null;
  alsoPlayed: string[];
  journeyOrder: number | null;
  dateRange: string | null;
  description: string;
  body: string[];
  photos: PlacePhoto[];
  photoCount: number;
  /** Separa las dos escalas del mapa: el pueblo y el resto del mundo. */
  scope: 'torremolinos' | 'mundo';
}

const KIND_GROUP: Record<string, string> = {
  Tablao: 'tablao',
  'Sala de fiestas': 'tablao',
  'Club y sala de fiestas': 'tablao',
  'Taberna flamenca': 'tablao',
  'Sala de fiestas y discoteca': 'tablao',
  'Complejo de espectáculos': 'tablao',
  Teatro: 'teatro',
  Hotel: 'teatro',
  Ciudad: 'ciudad',
  Municipio: 'ciudad',
  País: 'ciudad',
  Barrio: 'origen',
  'Lugar de origen familiar': 'origen',
};

export function kindGroup(kind: string): string {
  return KIND_GROUP[kind] ?? 'ciudad';
}
