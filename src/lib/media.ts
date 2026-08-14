import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';

export type MediaEntry = CollectionEntry<'media'>;

export const TYPE_LABELS: Record<string, string> = {
  photo: 'Fotografía',
  press: 'Prensa',
  video: 'Vídeo',
  audio: 'Audio',
  document: 'Documento',
  object: 'Objeto de vitrina',
};

/** Año de la pieza, mirando primero la fecha exacta y luego la aproximada. */
export function yearOf(entry: MediaEntry): number | null {
  const raw = entry.data.dateExact ?? entry.data.dateApprox ?? '';
  const m = String(raw).match(/(19|20)\d{2}/);
  return m ? Number(m[0]) : null;
}

export function decadeOf(entry: MediaEntry): string | null {
  const year = yearOf(entry);
  return year ? `${Math.floor(year / 10) * 10}` : null;
}

/** Etiqueta de fecha lista para mostrar. */
export function dateLabel(entry: MediaEntry): string {
  const { dateExact, dateApprox } = entry.data;
  if (dateExact) {
    const [y, m, d] = dateExact.split('-');
    if (d) {
      const months = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
      ];
      return `${Number(d)} de ${months[Number(m) - 1]} de ${y}`;
    }
    return dateExact;
  }
  return dateApprox ?? 'Fecha por determinar';
}

/** Ordena de más antiguo a más reciente; lo indatado va al final. */
export function byDate(a: MediaEntry, b: MediaEntry): number {
  const ya = yearOf(a);
  const yb = yearOf(b);
  if (ya === null && yb === null) return a.data.title.localeCompare(b.data.title, 'es');
  if (ya === null) return 1;
  if (yb === null) return -1;
  if (ya !== yb) return ya - yb;
  const da = a.data.dateExact ?? '';
  const db = b.data.dateExact ?? '';
  return da.localeCompare(db);
}

/** Solo las piezas publicables y con imagen que mostrar. */
export async function getPublishedMedia(): Promise<MediaEntry[]> {
  const all = await getCollection('media');
  return all.filter((item) => item.data.status === 'published' && item.data.image);
}

export interface PreparedMedia {
  entry: MediaEntry;
  /** Miniatura recortada para la retícula. */
  thumb: { src: string; width: number; height: number };
  /** Versión grande para el visor. */
  full: { src: string };
  placeName: string | null;
  peopleNames: string[];
  decade: string | null;
  dateText: string;
  /** Cadena en minúsculas para el buscador del archivo. */
  haystack: string;
}

/**
 * Genera las variantes de imagen y resuelve las referencias de lugar y
 * personas de cada pieza, para que las páginas no repitan esta lógica.
 */
export async function prepareMedia(entries: MediaEntry[]): Promise<PreparedMedia[]> {
  return Promise.all(
    entries.map(async (entry) => {
      const image = entry.data.image!;
      // Solo se reescala: el recorte a formato de tarjeta lo hace el CSS con
      // `object-position`, para poder usar el punto focal en su sintaxis
      // propia y no perder información de la fotografía original.
      const thumb = await getImage({
        src: image,
        width: Math.min(image.width, 720),
        format: 'webp',
        quality: 72,
      });
      const full = await getImage({
        src: image,
        width: Math.min(image.width, 1800),
        format: 'webp',
        quality: 82,
      });

      const place = entry.data.placeRef ? await getEntry(entry.data.placeRef) : null;
      const people = await Promise.all(
        entry.data.peopleRefs.map(async (ref) => {
          const person = await getEntry(ref);
          return person?.data.name ?? null;
        }),
      );
      const peopleNames = people.filter((n): n is string => Boolean(n));
      const dateText = dateLabel(entry);
      const placeName = place?.data.name ?? null;

      return {
        entry,
        thumb: {
          src: thumb.src,
          width: thumb.attributes.width ?? image.width,
          height: thumb.attributes.height ?? image.height,
        },
        full: { src: full.src },
        placeName,
        peopleNames,
        decade: decadeOf(entry),
        dateText,
        haystack: [
          entry.data.title,
          dateText,
          placeName ?? '',
          peopleNames.join(' '),
          TYPE_LABELS[entry.data.type] ?? entry.data.type,
          entry.data.credit ?? '',
        ]
          .join(' ')
          .toLowerCase(),
      };
    }),
  );
}
