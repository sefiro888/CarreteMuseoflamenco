export const SITE_NAME = 'Carrete de Málaga — Al compás de una vida';
export const SITE_DESCRIPTION_ES =
  'Museo digital de José Losada Santiago, «Carrete de Málaga», bailaor flamenco de Torremolinos. Archivo, biografía audiovisual y homenaje familiar en vida.';
export const SITE_DESCRIPTION_EN =
  'Digital museum of José Losada Santiago, "Carrete de Málaga," flamenco dancer from Torremolinos. Archive, audiovisual biography and living family tribute.';

export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'José Losada Santiago',
    alternateName: 'Carrete de Málaga',
    jobTitle: 'Bailaor flamenco',
    description:
      'Bailaor flamenco malagueño ligado a Torremolinos y a la historia del flamenco en la Costa del Sol.',
    nationality: 'Española',
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
