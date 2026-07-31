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
    order: z.number(),
    placeRef: reference('places').optional(),
    peopleRefs: z.array(reference('people')).default([]),
    mediaRefs: z.array(reference('media')).default([]),
    summary: z.string(),
  }),
});

const people = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/people' }),
  schema: provenance.extend({
    name: z.string(),
    role: z.string(),
    relationToCarrete: z.string(),
    confirmedCollaborator: z.boolean().default(false),
    summary: z.string(),
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
  schema: provenance.extend({
    title: z.string(),
    summary: z.string(),
    durationMinutes: z.number().optional(),
    videoAvailable: z.boolean().default(false),
    videoUrl: z.string().optional(),
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
  }),
});

const awards = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/awards' }),
  schema: provenance.extend({
    title: z.string(),
    year: z.string().optional(),
    grantor: z.string().optional(),
    description: z.string(),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
  schema: provenance.extend({
    personRef: reference('people').optional(),
    personNameFallback: z.string().optional(),
    quote: z.string(),
    context: z.string().optional(),
  }),
});

const media = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/media' }),
  schema: provenance.extend({
    title: z.string(),
    /** "object" cubre piezas físicas de vitrina: premios, zapatos, sombreros, bastones, carteles, programas. */
    type: z.enum(['photo', 'video', 'audio', 'document', 'object']),
    dateApprox: z.string().optional(),
    placeRef: reference('places').optional(),
    peopleRefs: z.array(reference('people')).default([]),
    rightsNote: z.string().optional(),
    filePath: z.string().optional(),
  }),
});

const places = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/places' }),
  schema: provenance.extend({
    name: z.string(),
    kind: z.string(),
    lat: z.number().optional(),
    lng: z.number().optional(),
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
};
