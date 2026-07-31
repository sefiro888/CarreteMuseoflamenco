export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';

/**
 * El inglés está preparado a nivel de arquitectura (rutas, diccionario de
 * interfaz, cabeceras hreflang) pero todavía no tiene contenido narrativo
 * traducido. Se mantiene desactivado en la navegación pública hasta que
 * existan páginas /en reales, para no ofrecer enlaces rotos.
 */
export const ENGLISH_ENABLED = false;

export interface NavItem {
  href: string;
  label: Record<Locale, string>;
}

export const navItems: NavItem[] = [
  { href: '/vida/yo-no-se-la-eda-que-tengo', label: { es: 'La vida', en: 'The life' } },
  { href: '/gracia', label: { es: 'La gracia', en: 'The gracia' } },
  { href: '/monotonas', label: { es: 'Monótonas', en: 'Monótonas' } },
  { href: '/maestros', label: { es: 'Maestros', en: 'Masters' } },
  { href: '/mapa', label: { es: 'Mapa', en: 'Map' } },
  { href: '/espectaculos', label: { es: 'Obra', en: 'Works' } },
  { href: '/archivo', label: { es: 'Archivo', en: 'Archive' } },
  { href: '/hoy', label: { es: 'Carrete hoy', en: 'Carrete today' } },
  { href: '/salas', label: { es: 'Todas las salas', en: 'All rooms' } },
];

export const ui = {
  es: {
    siteName: 'Carrete de Málaga',
    tagline: 'Al compás de una vida',
    enterMuseum: 'Entrar al museo',
    listenToCarrete: 'Escuchar a Carrete',
    skipToContent: 'Saltar al contenido principal',
    menu: 'Menú',
    closeMenu: 'Cerrar menú',
    sources: 'Fuentes',
    relatedPeople: 'Personas relacionadas',
    verificationLevels: {
      documented: 'Hecho documentado',
      testimony: 'Testimonio directo',
      'oral-memory': 'Memoria oral de Carrete',
      'approximate-date': 'Fecha aproximada',
      contradictory: 'Versión contradictoria',
      'pending-research': 'Pista pendiente de investigación',
    },
    statusDraft: 'Borrador',
    statusReview: 'En revisión',
    statusPublished: 'Publicado',
    provisionalHeading: 'Contenido provisional',
    readMore: 'Leer más',
    backToRoom: 'Volver a la sala',
    previousRoom: 'Sala anterior',
    nextRoom: 'Sala siguiente',
    languageSwitch: 'English',
    footerRights:
      'Este museo digital es un homenaje familiar en vida a José Losada Santiago, «Carrete de Málaga». Contenido en construcción permanente.',
  },
  en: {
    siteName: 'Carrete de Málaga',
    tagline: 'To the rhythm of a life',
    enterMuseum: 'Enter the museum',
    listenToCarrete: 'Listen to Carrete',
    skipToContent: 'Skip to main content',
    menu: 'Menu',
    closeMenu: 'Close menu',
    sources: 'Sources',
    relatedPeople: 'Related people',
    verificationLevels: {
      documented: 'Documented fact',
      testimony: 'Direct testimony',
      'oral-memory': "Carrete's oral memory",
      'approximate-date': 'Approximate date',
      contradictory: 'Contradictory account',
      'pending-research': 'Pending research lead',
    },
    statusDraft: 'Draft',
    statusReview: 'In review',
    statusPublished: 'Published',
    provisionalHeading: 'Provisional content',
    readMore: 'Read more',
    backToRoom: 'Back to room',
    previousRoom: 'Previous room',
    nextRoom: 'Next room',
    languageSwitch: 'Español',
    footerRights:
      'This digital museum is a living family tribute to José Losada Santiago, "Carrete de Málaga." Content is permanently under construction.',
  },
} as const;

export function t(locale: Locale) {
  return ui[locale];
}

export function localizedPath(path: string, locale: Locale) {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return `/en${clean === '/' ? '' : clean}`;
}
