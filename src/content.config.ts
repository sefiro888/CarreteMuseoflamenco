import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Niveles de verificación editorial. La web del museo distingue siempre
 * entre hecho documentado, testimonio directo, memoria oral, fecha
 * aproximada, versión contradictoria y pista pendiente de investigación.
 * Ver principio editorial en el Plan Maestro, sección 3.
 */
const verificationLevel = z.enum([
  'documented',
  'testimony',
  'oral-memory',
  'approximate-date',
  'contradictory',
  'pending-research',
]);

const publishStatus = z.enum(['draft', 'review', 'published']);

const provenance = z.object({
  lang: z.enum(['es', 'en']).default('es'),
  verification: verificationLevel,
  sourceRefs: z.array(reference('sources')).default([]),
  author: z.string().optional(),
  owner: z.string().optional(),
  publishPermission: z.boolean().default(false),
  credit: z.string().optional(),
  status: publishStatus,
});

const timeline = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/timeline' }),
  schema: provenance.extend({
    title: z.string(),
    era: z.string(),
    dateExact: z.string().optional(),
    dateApprox: z.string().optional(),
    /**
     * Año en que situar el hito en el eje visual. Muchas fechas son
     * aproximadas —«años de posguerra», «primeros años sesenta»—, así que este
     * campo dice dónde cae en la línea sin fingir una precisión que no existe.
     */
    year: z.number().optional(),
    order: z.number(),
    placeRef: reference('places').optional(),
    peopleRefs: z.array(reference('people')).default([]),
    mediaRefs: z.array(reference('media')).default([]),
    summary: z.string(),
  }),
});

const people = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/people' }),
  schema: ({ image }) =>
    provenance.extend({
      name: z.string(),
      role: z.string(),
      relationToCarrete: z.string(),
      confirmedCollaborator: z.boolean().default(false),
      summary: z.string(),
      /** Retrato, normalmente recortado de una foto del archivo donde sale con Carrete. */
      portrait: image().optional(),
      /** Recorte del retrato, en sintaxis de object-position. */
      focal: z.string().default('center'),
      photoCredit: z.string().optional(),
    }),
});

const stories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stories' }),
  schema: provenance.extend({
    title: z.string(),
    room: z.string(),
    summary: z.string(),
    dateApprox: z.string().optional(),
    placeRef: reference('places').optional(),
    peopleRefs: z.array(reference('people')).default([]),
  }),
});

const monotonas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/monotonas' }),
  schema: ({ image }) =>
    provenance.extend({
    title: z.string(),
    summary: z.string(),
    durationMinutes: z.number().optional(),
    videoAvailable: z.boolean().default(false),
    videoUrl: z.string().optional(),
    /** Fotograma de portada del vídeo, en src/assets/video. */
    poster: image().optional(),
    durationSeconds: z.number().optional(),
    audioOriginal: z.boolean().default(false),
    subtitlesAvailable: z.boolean().default(false),
    transcript: z.string().optional(),
    translationEn: z.string().optional(),
    dateApprox: z.string().optional(),
    placeRef: reference('places').optional(),
    peopleRefs: z.array(reference('people')).default([]),
    mediaRefs: z.array(reference('media')).default([]),
    }),
});

const performances = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/performances' }),
  schema: provenance.extend({
    title: z.string(),
    dateExact: z.string().optional(),
    dateApprox: z.string().optional(),
    venue: z.string().optional(),
    description: z.string(),
    peopleRefs: z.array(reference('people')).default([]),
    /** Fecha ISO (YYYY-MM-DD) de una actuación futura confirmada, para la agenda. */
    upcomingDate: z.string().date().optional(),
    /**
     * No es lo mismo un montaje suyo que una gala en la que lo homenajean o una
     * noche suelta en un festival. La sala de la obra los separa:
     * «work» = espectáculo propio, «tribute» = homenaje que le hacen,
     * «appearance» = participación, encuentro o festival.
     */
    kind: z.enum(['work', 'tribute', 'appearance']).default('appearance'),
    /** Cartel o fotografía de la función, cuando el archivo la tiene. */
    mediaRef: reference('media').optional(),
  }),
});

const awards = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/awards' }),
  schema: provenance.extend({
    title: z.string(),
    year: z.string().optional(),
    grantor: z.string().optional(),
    description: z.string(),
    /** Piezas del archivo que documentan el premio: la estatua, la entrega, el diploma. */
    mediaRefs: z.array(reference('media')).default([]),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
  schema: provenance.extend({
    personRef: reference('people').optional(),
    personNameFallback: z.string().optional(),
    quote: z.string(),
    context: z.string().optional(),
    /**
     * Quién habla. La sala de las voces mezclaba cosas que no son lo mismo:
     * lo que le dijo un maestro en un tablao, lo que grabaron en una placa,
     * cómo lo anunciaba un cartel y lo que dice él de sí mismo. Cada una se
     * lee distinto y ahora va en su bloque.
     */
    voice: z.enum(['artist', 'public', 'billing', 'self']).default('artist'),
    /** Cómo se cita la escena: «El Jaleo, Torremolinos, años sesenta». */
    when: z.string().optional(),
    /** Año para ordenar dentro de cada bloque; sin él, la ficha va al final. */
    year: z.number().optional(),
    /** La cita que abre la sala, a toda anchura. Solo una. */
    featured: z.boolean().default(false),
    /** Traducción, cuando el cartel no está en español. */
    translation: z.string().optional(),
    placeRef: reference('places').optional(),
    /** El recorte o el cartel donde consta la frase. */
    mediaRef: reference('media').optional(),
  }),
});

const media = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/media' }),
  schema: ({ image }) =>
    provenance.extend({
      title: z.string(),
      /**
       * "object" cubre piezas físicas de vitrina: premios, zapatos, sombreros,
       * bastones, carteles y programas. "press" son los recortes de hemeroteca,
       * que además del escaneo conservan el PDF original descargable.
       */
      type: z.enum(['photo', 'video', 'audio', 'document', 'object', 'press']),
      /** Imagen procesada en src/assets; Astro genera las variantes responsive. */
      image: image().optional(),
      /** Texto alternativo: describe la escena, nunca repite el título en seco. */
      alt: z.string().optional(),
      /** Recorte para tarjetas y cabeceras, en sintaxis de object-position. */
      focal: z.string().default('center'),
      /** Piezas destacadas: portada, cabeceras de sala y selección del archivo. */
      featured: z.boolean().default(false),
      dateExact: z.string().optional(),
      dateApprox: z.string().optional(),
      placeRef: reference('places').optional(),
      peopleRefs: z.array(reference('people')).default([]),
      rightsNote: z.string().optional(),
      /** Ruta pública del original (PDF de hemeroteca, vídeo, audio). */
      filePath: z.string().optional(),
      /** Duración en segundos, para vídeo y audio. */
      durationSeconds: z.number().optional(),
      /** Número de páginas, para los recortes de prensa. */
      pages: z.number().optional(),
      /**
       * Piezas que documentan un tablao concreto (el edificio, un anuncio, un
       * cartel) se leen mejor en la ficha de ese lugar que perdidas entre
       * doscientas fotos sueltas del archivo general. `false` las saca de la
       * rejilla de /archivo sin dejar de aparecer en la ficha de su lugar
       * (que las busca por placeRef) ni en el mapa.
       */
      showInArchive: z.boolean().default(true),
    }),
});

const places = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/places' }),
  schema: provenance.extend({
    name: z.string(),
    kind: z.string(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    /**
     * Hasta dónde llega la certeza de la ubicación. Muchos tablaos de la edad
     * de oro cerraron hace décadas: se sitúan igualmente, pero el mapa dice
     * siempre con qué precisión.
     */
    locationPrecision: z.enum(['exact', 'street', 'approximate']).default('approximate'),
    /** Municipio al que pertenece el local. */
    municipality: z.string().optional(),
    /** Año de apertura y de cierre, cuando constan. */
    yearOpened: z.number().optional(),
    yearClosed: z.number().optional(),
    /** Qué hay hoy en ese sitio, si el local ya no existe con ese nombre. */
    todayNote: z.string().optional(),
    /** Otros artistas documentados en esa sala, además de Carrete. */
    alsoPlayed: z.array(z.string()).default([]),
    /** Orden de aparición en la vida de Carrete, para trazar el recorrido. */
    journeyOrder: z.number().optional(),
    dateRangeApprox: z.string().optional(),
    description: z.string(),
  }),
});

const sources = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sources' }),
  schema: z.object({
    title: z.string(),
    sourceType: z.enum(['book', 'article', 'web', 'institutional', 'oral']),
    authors: z.array(z.string()).default([]),
    publisher: z.string().optional(),
    year: z.string().optional(),
    url: z.string().url().optional(),
    note: z.string().optional(),
  }),
});

const researchNotes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/research-notes' }),
  schema: z.object({
    title: z.string(),
    question: z.string(),
    status: z.enum(['open', 'resolved']),
    versions: z.array(
      z.object({
        text: z.string(),
        sourceRef: reference('sources').optional(),
        likelihood: z.enum(['alta', 'media', 'baja', 'sin-evaluar']),
      }),
    ),
    conclusion: z.string().optional(),
    /**
     * Notas de uso exclusivamente interno para el equipo del proyecto
     * (p. ej. posibles contactos futuros sin confirmar). Nunca deben
     * renderizarse en páginas públicas como /creditos.
     */
    internal: z.boolean().default(false),
  }),
});

/**
 * Vídeos alojados fuera del museo (YouTube, Vimeo).
 *
 * A diferencia de las monótonas —que son grabaciones del archivo familiar y se
 * sirven desde aquí—, estos son documentos públicos: actuaciones, homenajes y
 * reportajes que grabó otra gente. Se incrustan bajo demanda, nunca al cargar
 * la página, y siempre se acredita a quien los publicó.
 */
const videos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/videos' }),
  schema: ({ image }) =>
    provenance.extend({
      title: z.string(),
      platform: z.enum(['youtube', 'vimeo']),
      /** Identificador del vídeo en la plataforma, no la URL completa. */
      videoId: z.string(),
      url: z.string().url(),
      /** Miniatura descargada y servida desde el museo, para no llamar a la plataforma al cargar. */
      poster: image(),
      summary: z.string(),
      /** Qué clase de documento es, para agruparlos. */
      kind: z.enum(['actuacion', 'homenaje', 'documental', 'reportaje']),
      durationSeconds: z.number().optional(),
      dateExact: z.string().optional(),
      dateApprox: z.string().optional(),
      venue: z.string().optional(),
      placeRef: reference('places').optional(),
      peopleRefs: z.array(reference('people')).default([]),
      /** Quien subió el vídeo: se acredita siempre. */
      channel: z.string().optional(),
      /** Piezas de portada y de cabecera de sala. */
      featured: z.boolean().default(false),
      /** Orden de aparición: cuanto menor, antes. */
      order: z.number().default(50),
    }),
});

export const collections = {
  timeline,
  people,
  stories,
  monotonas,
  performances,
  awards,
  testimonials,
  media,
  places,
  sources,
  'research-notes': researchNotes,
  videos,
};
