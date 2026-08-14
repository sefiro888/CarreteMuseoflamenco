import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import { byDate, dateLabel, yearOf } from './media';
import type { MapPlace, PlacePhoto } from './map-types';

export type PlaceEntry = CollectionEntry<'places'>;
export type { MapPlace, PlacePhoto };

/**
 * Reúne todo lo que el mapa necesita de cada lugar: su ficha, sus fotografías
 * del archivo y las décadas en las que hay material fechado allí.
 */
export async function getMapPlaces(): Promise<MapPlace[]> {
  const places = await getCollection('places');
  const media = (await getCollection('media')).filter(
    (m) => m.data.status === 'published' && m.data.image,
  );

  const result: MapPlace[] = [];

  for (const place of places) {
    if (place.data.lat === undefined || place.data.lng === undefined) continue;

    const related = media.filter((m) => m.data.placeRef?.id === place.id).sort(byDate);

    const photos: PlacePhoto[] = await Promise.all(
      related.slice(0, 12).map(async (item) => {
        const thumb = await getImage({
          src: item.data.image!,
          width: 560,
          format: 'webp',
          quality: 70,
        });
        const full = await getImage({
          src: item.data.image!,
          width: Math.min(item.data.image!.width, 1800),
          format: 'webp',
          quality: 82,
        });
        return {
          thumb: thumb.src,
          full: full.src,
          alt: item.data.alt ?? item.data.title,
          title: item.data.title,
          date: dateLabel(item),
          credit: item.data.credit ?? '',
          focal: item.data.focal,
          isPress: item.data.type === 'press',
          pdf: item.data.type === 'press' ? item.data.filePath : undefined,
        };
      }),
    );

    // Décadas con material fechado en este lugar, más el rango de apertura.
    const decadeSet = new Set<string>();
    for (const item of related) {
      const year = yearOf(item);
      if (year) decadeSet.add(String(Math.floor(year / 10) * 10));
    }
    if (place.data.yearOpened) {
      decadeSet.add(String(Math.floor(place.data.yearOpened / 10) * 10));
    }

    const body = place.body
      ? place.body
          .split(/\n{2,}/)
          .map((p) => p.replace(/\s+/g, ' ').trim())
          .filter(Boolean)
      : [];

    result.push({
      id: place.id,
      name: place.data.name,
      kind: place.data.kind,
      lat: place.data.lat,
      lng: place.data.lng,
      precision: place.data.locationPrecision,
      municipality: place.data.municipality ?? null,
      yearOpened: place.data.yearOpened ?? null,
      yearClosed: place.data.yearClosed ?? null,
      decades: [...decadeSet].sort(),
      todayNote: place.data.todayNote ?? null,
      alsoPlayed: place.data.alsoPlayed,
      journeyOrder: place.data.journeyOrder ?? null,
      dateRange: place.data.dateRangeApprox ?? null,
      description: place.data.description.replace(/\s+/g, ' ').trim(),
      body,
      photos,
      photoCount: related.length,
      scope: place.data.municipality === 'Torremolinos' ? 'torremolinos' : 'mundo',
    });
  }

  return result;
}

/** Ficha de lugar suelta, para las páginas /lugares/[id]. */
export async function getPlaceWithMedia(id: string) {
  const place = await getEntry('places', id);
  if (!place) return null;
  const media = (await getCollection('media'))
    .filter((m) => m.data.status === 'published' && m.data.image && m.data.placeRef?.id === id)
    .sort(byDate);
  return { place, media };
}
